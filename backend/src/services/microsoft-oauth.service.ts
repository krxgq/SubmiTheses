import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import type { UserRole } from '@sumbi/shared-types';

// Domain-to-role mapping for allowed school domains
const ALLOWED_DOMAINS: Record<string, UserRole> = {
  'delta-studenti.cz': 'student',
  'delta-skola.cz': 'teacher',
};

// Microsoft OAuth endpoints (tenant-specific)
const TENANT_ID = process.env.MICROSOFT_TENANT_ID || '';
const AUTHORITY = `https://login.microsoftonline.com/${TENANT_ID}`;
const AUTHORIZE_URL = `${AUTHORITY}/oauth2/v2.0/authorize`;
const TOKEN_URL = `${AUTHORITY}/oauth2/v2.0/token`;
const JWKS_URI = `${AUTHORITY}/discovery/v2.0/keys`;

// JWKS client for verifying Microsoft ID token signatures
const jwks = jwksClient({
  jwksUri: JWKS_URI,
  cache: true,         // cache keys to avoid repeated fetches
  cacheMaxAge: 600000, // 10 minutes
  rateLimit: true,
});

interface PKCEPair {
  codeVerifier: string;
  codeChallenge: string;
}

interface MicrosoftUser {
  oid: string;          // Microsoft object ID (unique per user)
  email: string;
  firstName?: string;
  lastName?: string;
}

interface DomainValidation {
  valid: boolean;
  role?: UserRole;
}

/**
 * Microsoft OAuth Service — handles PKCE, token exchange, and ID token validation
 * for Azure AD / Entra ID login flow.
 */
export class MicrosoftOAuthService {

  /**
   * Generate PKCE code_verifier (random 32 bytes) and code_challenge (SHA-256 hash, base64url).
   * PKCE prevents authorization code interception attacks.
   */
  static generatePKCE(): PKCEPair {
    const codeVerifier = crypto.randomBytes(32).toString('base64url');
    const codeChallenge = crypto
      .createHash('sha256')
      .update(codeVerifier)
      .digest('base64url');

    return { codeVerifier, codeChallenge };
  }

  /**
   * Build the Microsoft authorization URL that the user is redirected to.
   * Includes PKCE challenge, state for CSRF, and requests openid+profile+email scopes.
   */
  static getAuthorizationUrl(state: string, codeChallenge: string): string {
    const params = new URLSearchParams({
      client_id: process.env.MICROSOFT_CLIENT_ID || '',
      response_type: 'code',
      redirect_uri: process.env.MICROSOFT_REDIRECT_URI || '',
      scope: 'openid profile email User.Read',
      state,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
      response_mode: 'query',
      prompt: 'select_account', // always show account picker
    });

    return `${AUTHORIZE_URL}?${params.toString()}`;
  }

  /**
   * Exchange the authorization code for tokens by POSTing to Microsoft's token endpoint.
   * Returns the raw ID token (JWT) which contains user claims.
   */
  static async exchangeCodeForTokens(code: string, codeVerifier: string): Promise<{ idToken: string; accessToken: string }> {
    const body = new URLSearchParams({
      client_id: process.env.MICROSOFT_CLIENT_ID || '',
      client_secret: process.env.MICROSOFT_CLIENT_SECRET || '',
      code,
      redirect_uri: process.env.MICROSOFT_REDIRECT_URI || '',
      grant_type: 'authorization_code',
      code_verifier: codeVerifier,
    });

    const response = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('[Microsoft OAuth] Token exchange failed:', errorData);
      throw new Error('Failed to exchange authorization code for tokens');
    }

    const data = await response.json();
    return { idToken: data.id_token, accessToken: data.access_token };
  }

  /**
   * Fetch user profile from Microsoft Graph API — reliable fallback when
   * ID token doesn't include given_name / family_name optional claims.
   */
  static async fetchGraphProfile(accessToken: string): Promise<{ firstName?: string; lastName?: string }> {
    try {
      const response = await fetch('https://graph.microsoft.com/v1.0/me', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!response.ok) {
        console.warn('[Microsoft OAuth] Graph API failed:', response.status, await response.text());
        return {};
      }
      const data = await response.json();

      let firstName = data.givenName || undefined;
      let lastName = data.surname || undefined;

      // Last resort: split displayName if givenName/surname are missing
      if ((!firstName || !lastName) && data.displayName) {
        const parts = (data.displayName as string).trim().split(/\s+/);
        if (parts.length >= 2) {
          firstName = firstName || parts[0];
          lastName = lastName || parts.slice(1).join(' ');
        } else if (parts.length === 1) {
          firstName = firstName || parts[0];
        }
      }

      return { firstName, lastName };
    } catch (err) {
      console.error('[Microsoft OAuth] Graph API error:', err);
      return {};
    }
  }

  /**
   * Validate the Microsoft ID token signature using JWKS, then extract user claims.
   * Falls back to Graph API for name if ID token doesn't contain optional claims.
   */
  static async validateAndExtractUser(idToken: string, accessToken?: string): Promise<MicrosoftUser> {
    // Decode header to get the key ID (kid) used for signing
    const decoded = jwt.decode(idToken, { complete: true });
    if (!decoded || typeof decoded === 'string') {
      throw new Error('Invalid ID token format');
    }

    const kid = decoded.header.kid;
    if (!kid) {
      throw new Error('ID token missing key ID (kid)');
    }

    // Fetch the matching public key from Microsoft's JWKS endpoint
    const signingKey = await jwks.getSigningKey(kid);
    const publicKey = signingKey.getPublicKey();

    // Verify signature and standard claims (exp, iss, aud)
    const payload = jwt.verify(idToken, publicKey, {
      algorithms: ['RS256'],
      audience: process.env.MICROSOFT_CLIENT_ID,
      issuer: `${AUTHORITY}/v2.0`,
    }) as Record<string, unknown>;

    // Extract user info from verified claims
    const email = (payload.email || payload.preferred_username) as string;
    if (!email) {
      throw new Error('ID token missing email claim');
    }

    let firstName = payload.given_name as string | undefined;
    let lastName = payload.family_name as string | undefined;

    console.log('[Microsoft OAuth] ID token claims:', { given_name: payload.given_name, family_name: payload.family_name, name: payload.name, email });

    // Fallback 1: Graph API (most reliable source for name)
    if ((!firstName || !lastName) && accessToken) {
      const graph = await this.fetchGraphProfile(accessToken);
      firstName = firstName || graph.firstName;
      lastName = lastName || graph.lastName;
    }

    // Fallback 2: "name" claim from ID token (usually contains display name)
    if ((!firstName || !lastName) && payload.name) {
      const parts = (payload.name as string).trim().split(/\s+/);
      if (parts.length >= 2) {
        firstName = firstName || parts[0];
        lastName = lastName || parts.slice(1).join(' ');
      } else if (parts.length === 1) {
        firstName = firstName || parts[0];
      }
    }

    console.log('[Microsoft OAuth] Final resolved name:', { firstName, lastName });

    return {
      oid: payload.oid as string,
      email: email.toLowerCase(),
      firstName,
      lastName,
    };
  }

  /**
   * Check if the email domain is allowed and return the corresponding role.
   * Only @delta-studenti.cz (student) and @delta-skola.cz (teacher) are accepted.
   */
  static validateEmailDomain(email: string): DomainValidation {
    const domain = email.split('@')[1]?.toLowerCase();
    if (!domain) return { valid: false };

    const role = ALLOWED_DOMAINS[domain];
    if (!role) return { valid: false };

    return { valid: true, role };
  }
}
