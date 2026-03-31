import crypto from "crypto";
import { Request, Response } from "express";
import { AuthService } from "../services/auth.service";
import { UserService } from "../services/users.service";
import { JWTService } from "../services/jwt.service";
import { MicrosoftOAuthService } from "../services/microsoft-oauth.service";

/**
 * Auth Controller - Local Password-Based Authentication
 *
 * Uses bcrypt for password hashing and custom JWT tokens
 * No longer dependent on Supabase Auth
 */

/**
 * POST /api/auth/login
 * Login with local password-based auth (bcrypt + PostgreSQL)
 */
export async function login(req: Request, res: Response) {
  try {
    const { email, password, rememberMe } = req.body;

    // Login user using local authentication (bcrypt password verification)
    const result = await AuthService.login(email, password, rememberMe);

    // Set httpOnly cookies with JWT tokens
    res.cookie('sb-access-token', result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 1000, // 1 hour
      path: '/',
    });

    // Refresh token only sent to /api/auth/refresh endpoint for security
    res.cookie('sb-refresh-token', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/api/auth/refresh',
    });

    console.log('[Auth] Login successful for user:', result.user.id);

    // Return user profile (no tokens in response body for security)
    return res.status(200).json({
      user: result.user,
    });
  } catch (err: any) {
    console.error("[Auth] Login error:", err);
    return res.status(401).json({
      error: err.message || "Invalid email or password",
    });
  }
}

/**
 * POST /api/auth/register
 * Register new user with local password-based auth
 */
export async function register(req: Request, res: Response) {
  try {
    const { email, password, firstName, lastName } = req.body;

    // Register user using local authentication (bcrypt + PostgreSQL)
    const result = await AuthService.register(email, password, firstName, lastName);

    // Set httpOnly cookies with JWT tokens
    res.cookie('sb-access-token', result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 1000, // 1 hour
      path: '/',
    });

    // Refresh token only sent to /api/auth/refresh endpoint for security
    res.cookie('sb-refresh-token', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/api/auth/refresh',
    });

    console.log('[Auth] Registration successful for user:', result.user.id);

    return res.status(201).json({
      user: result.user,
    });
  } catch (err: any) {
    console.error("[Auth] Registration error:", err);
    return res.status(400).json({
      error: err.message || "Registration failed",
    });
  }
}

/**
 * POST /api/auth/logout
 * Clear authentication cookies (custom JWT logout)
 */
export async function logout(req: Request, res: Response) {
  try {
    // Log the logout event for audit purposes
    const token = req.cookies['sb-access-token'];
    if (token) {
      const decoded = JWTService.decodeToken(token);
      if (decoded?.sub) {
        console.log('[Auth] User logged out:', decoded.sub);
      }
    }

    // Clear authentication cookies
    res.clearCookie('sb-access-token', {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });

    res.clearCookie('sb-refresh-token', {
      path: '/api/auth/refresh',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });

    return res.status(204).send();
  } catch (err) {
    console.error("[Auth] Logout error:", err);
    // Always clear cookies even on error
    res.clearCookie('sb-access-token', { path: '/' });
    res.clearCookie('sb-refresh-token', { path: '/api/auth/refresh' });
    return res.status(204).send();
  }
}

/**
 * GET /api/auth/session
 * Get current session with enriched user profile
 * Requires valid JWT in Authorization header
 */
export async function getSession(req: Request, res: Response) {
  try {
    // User is already authenticated by middleware (req.user set)
    if (!req.user) {
      return res.status(401).json({
        error: "Not authenticated",
      });
    }

    // Fetch fresh user profile from database
    const userProfile = await getUserProfile(req.user.id);

    // Return user profile only — token stays in httpOnly cookie
    return res.status(200).json({
      user: userProfile,
      session: {
        expires_at: req.user.exp,
      },
    });
  } catch (err) {
    console.error("[Auth] Get session error:", err);
    return res.status(500).json({
      error: "Failed to fetch session",
    });
  }
}

/**
 * POST /api/auth/refresh
 * Refresh expired token using custom JWT refresh token
 */
export async function refresh(req: Request, res: Response) {
  try {
    // Read refresh token from cookie
    const refreshToken = req.cookies['sb-refresh-token'];

    if (!refreshToken) {
      return res.status(401).json({
        error: "No refresh token found",
      });
    }

    // ✅ Verify our custom refresh token
    let decoded;
    try {
      decoded = JWTService.verifyRefreshToken(refreshToken);
    } catch (error) {
      return res.status(401).json({
        error: "Invalid or expired refresh token",
      });
    }

    // Fetch updated user profile from database
    const userProfile = await getUserProfile(decoded.sub);

    // ✅ Generate new token pair with our JWT service
    const tokens = JWTService.generateTokens(
      userProfile.id,
      userProfile.email,
      userProfile.role
    );

    // Update cookies with new tokens
    res.cookie('sb-access-token', tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 1000, // 1 hour
      path: '/',
    });

    // Refresh token only sent to /api/auth/refresh endpoint for security
    res.cookie('sb-refresh-token', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/api/auth/refresh',
    });

    console.log('[Auth] Token refreshed for user:', userProfile.id);

    return res.status(200).json({
      user: userProfile,
    });
  } catch (err) {
    console.error("[Auth] Refresh error:", err);
    return res.status(500).json({
      error: "Network error occurred",
    });
  }
}

/**
 * GET /api/auth/validate
 * Validate session using custom JWT (fast, no Supabase call)
 * Used by frontend middleware for route protection
 */
export async function validateSession(req: Request, res: Response) {
  try {
    // Read access token from cookie
    const token = req.cookies['sb-access-token'];

    if (!token) {
      return res.status(401).json({ error: 'No session found' });
    }

    // ✅ Verify our custom JWT (no Supabase call!)
    let decoded;
    try {
      decoded = JWTService.verifyAccessToken(token);
    } catch (error) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    // Fetch user profile from database
    const userProfile = await getUserProfile(decoded.sub);

    return res.status(200).json(userProfile);
  } catch (err) {
    console.error('[Auth] Validate session error:', err);
    return res.status(401).json({ error: 'Session validation failed' });
  }
}

/**
 * GET /api/auth/user
 * Get current authenticated user
 * Requires valid JWT in Authorization header
 */
export async function getUser(req: Request, res: Response) {
  try {
    // User is already authenticated by middleware (req.user set)
    if (!req.user) {
      return res.status(401).json({
        error: "Not authenticated",
      });
    }

    // Fetch user profile from database
    const userProfile = await getUserProfile(req.user.id);

    return res.status(200).json(userProfile);
  } catch (err) {
    console.error("[Auth] Get user error:", err);
    return res.status(500).json({
      error: "Failed to fetch user",
    });
  }
}

/**
 * POST /api/auth/set-password
 * Allow Microsoft-only users to create a local password (upgrades to 'both')
 */
export async function setPassword(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { password } = req.body;
    await AuthService.setPasswordForMicrosoftUser(req.user.id, password);

    console.log('[Auth] Password set for Microsoft user:', req.user.id);
    return res.status(200).json({ message: 'Password set successfully' });
  } catch (err: any) {
    console.error('[Auth] Set password error:', err);
    return res.status(400).json({ error: err.message || 'Failed to set password' });
  }
}

/**
 * GET /api/auth/microsoft/link
 * Initiate Microsoft OAuth linking for local-only users.
 * Sets an oauth-action cookie so the callback knows to link instead of login.
 */
export async function microsoftLink(req: Request, res: Response) {
  try {
    const APP_URL = process.env.APP_URL || 'http://localhost:3000';

    const state = crypto.randomBytes(32).toString('hex');
    const { codeVerifier, codeChallenge } = MicrosoftOAuthService.generatePKCE();

    const cookieOpts = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      maxAge: 10 * 60 * 1000,
      path: '/',
    };
    res.cookie('oauth-state', state, cookieOpts);
    res.cookie('oauth-verifier', codeVerifier, cookieOpts);
    // Signal to the callback that this is a link flow, not a login
    res.cookie('oauth-action', 'link', cookieOpts);

    const authUrl = MicrosoftOAuthService.getAuthorizationUrl(state, codeChallenge);
    return res.redirect(authUrl);
  } catch (err) {
    console.error('[Auth] Microsoft link initiation error:', err);
    const APP_URL = process.env.APP_URL || 'http://localhost:3000';
    return res.redirect(`${APP_URL}/en/settings?error=link_failed`);
  }
}

/**
 * GET /api/auth/microsoft
 * Initiate Microsoft OAuth login — generates PKCE + state, stores in cookies, redirects to Microsoft
 */
export async function microsoftLogin(req: Request, res: Response) {
  try {
    const APP_URL = process.env.APP_URL || 'http://localhost:3000';

    // Random state for CSRF protection
    const state = crypto.randomBytes(32).toString('hex');
    const { codeVerifier, codeChallenge } = MicrosoftOAuthService.generatePKCE();

    // Store state + verifier in short-lived httpOnly cookies (10 min expiry)
    const cookieOpts = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      maxAge: 10 * 60 * 1000, // 10 minutes
      path: '/',
    };
    res.cookie('oauth-state', state, cookieOpts);
    res.cookie('oauth-verifier', codeVerifier, cookieOpts);

    const authUrl = MicrosoftOAuthService.getAuthorizationUrl(state, codeChallenge);
    return res.redirect(authUrl);
  } catch (err) {
    console.error('[Auth] Microsoft login initiation error:', err);
    const APP_URL = process.env.APP_URL || 'http://localhost:3000';
    return res.redirect(`${APP_URL}/auth?error=oauth_failed`);
  }
}

/**
 * GET /api/auth/microsoft/callback
 * Handle the redirect back from Microsoft — validates state, exchanges code, sets JWT cookies
 */
export async function microsoftCallback(req: Request, res: Response) {
  const APP_URL = process.env.APP_URL || 'http://localhost:3000';

  try {
    const { code, state } = req.query as { code?: string; state?: string };
    const savedState = req.cookies['oauth-state'];
    const codeVerifier = req.cookies['oauth-verifier'];
    const oauthAction = req.cookies['oauth-action']; // 'link' if account-linking flow

    // Clear OAuth cookies regardless of outcome
    res.clearCookie('oauth-state', { path: '/' });
    res.clearCookie('oauth-verifier', { path: '/' });
    res.clearCookie('oauth-action', { path: '/' });

    // CSRF check — state from Microsoft must match the cookie we set
    if (!state || !savedState || state !== savedState) {
      console.warn('[Auth] Microsoft OAuth state mismatch');
      return res.redirect(`${APP_URL}/auth?error=invalid_state`);
    }

    if (!code || !codeVerifier) {
      return res.redirect(`${APP_URL}/auth?error=oauth_failed`);
    }

    // Exchange authorization code for tokens
    const { idToken, accessToken } = await MicrosoftOAuthService.exchangeCodeForTokens(code, codeVerifier);

    // Verify ID token signature and extract user claims (falls back to Graph API for name)
    const msUser = await MicrosoftOAuthService.validateAndExtractUser(idToken, accessToken);

    // --- Account-linking flow: link Microsoft to existing local account ---
    if (oauthAction === 'link') {
      try {
        // Verify the user is still logged in via their JWT cookie
        const token = req.cookies['sb-access-token'];
        if (!token) {
          return res.redirect(`${APP_URL}/en/settings?error=link_failed`);
        }
        const decoded = JWTService.verifyAccessToken(token);
        await AuthService.linkMicrosoftAccount(decoded.sub, msUser.oid, msUser.email);
        console.log('[Auth] Microsoft account linked for user:', decoded.sub);
        return res.redirect(`${APP_URL}/en/settings?linked=true`);
      } catch (linkErr: any) {
        console.error('[Auth] Microsoft link error:', linkErr);
        return res.redirect(`${APP_URL}/en/settings?error=link_failed`);
      }
    }

    // --- Normal login flow (unchanged) ---
    // Reject emails from non-school domains
    const domainCheck = MicrosoftOAuthService.validateEmailDomain(msUser.email);
    if (!domainCheck.valid || !domainCheck.role) {
      console.warn('[Auth] Microsoft OAuth rejected domain:', msUser.email);
      return res.redirect(`${APP_URL}/auth?error=invalid_domain`);
    }

    // Link or create the user account, then generate JWT tokens
    const result = await AuthService.loginOrCreateFromMicrosoft(
      msUser.email,
      msUser.oid,
      msUser.firstName,
      msUser.lastName,
      domainCheck.role,
    );

    // Set JWT cookies (same pattern as local login)
    res.cookie('sb-access-token', result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 1000, // 1 hour
      path: '/',
    });

    res.cookie('sb-refresh-token', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/api/auth/refresh',
    });

    console.log('[Auth] Microsoft login successful for user:', result.user.id);
    return res.redirect(`${APP_URL}/en/projects`);
  } catch (err) {
    console.error('[Auth] Microsoft callback error:', err);
    return res.redirect(`${APP_URL}/auth?error=oauth_failed`);
  }
}

/**
 * Helper: Fetch user profile from database and enrich with role from JWT
 * Replaces the direct database query in frontend/src/lib/auth.ts:200-204
 */
async function getUserProfile(userId: string) {
  const user = await UserService.getUserById(userId);

  if (!user) {
    throw new Error("User profile not found");
  }

  return {
    id: user!.id,
    email: user!.email,
    first_name: user!.first_name,
    last_name: user!.last_name,
    avatar_url: user!.avatar_url,
    role: user!.role,
    auth_provider: user!.auth_provider, // 'local' | 'microsoft' | 'both'
    year_id: user!.year_id ? Number(user!.year_id) : undefined,
    created_at: user!.created_at,
  };
}

/**
 * Helper: Convert Supabase auth errors to user-friendly messages
 */
function getAuthErrorMessage(message: string): string {
  switch (message) {
    case "Invalid login credentials":
      return "Invalid email or password. Please try again.";
    case "Email not confirmed":
      return "Please confirm your email address before signing in.";
    case "User already registered":
      return "An account with this email already exists.";
    case "Password should be at least 8 characters":
      return "Password must be at least 8 characters long.";
    case "Unable to validate email address: invalid format":
      return "Please enter a valid email address.";
    case "Signup is disabled":
      return "Account registration is currently disabled.";
    default:
      return message || "An unexpected error occurred.";
  }
}
