import jwt from "jsonwebtoken";
import type { UserRole } from "@sumbi/shared-types";

/**
 * Custom JWT Service - Full control over token generation/validation
 *
 * Migration-ready: No Supabase dependencies
 * Can be used with any PostgreSQL database
 */

interface JWTPayload {
  sub: string; // User ID
  email: string;
  role: UserRole;
  iat: number;
  exp: number;
  iss: string;
}

interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export class JWTService {
  // Fail fast if custom secrets are not configured (security: don't fall back to Supabase secrets)
  private static readonly ACCESS_TOKEN_SECRET = (() => {
    const secret = process.env.JWT_ACCESS_SECRET;
    if (!secret) {
      throw new Error("JWT_ACCESS_SECRET environment variable is required");
    }
    return secret;
  })();

  private static readonly REFRESH_TOKEN_SECRET = (() => {
    const secret = process.env.JWT_REFRESH_SECRET;
    if (!secret) {
      throw new Error("JWT_REFRESH_SECRET environment variable is required");
    }
    return secret;
  })();

  private static readonly ISSUER = process.env.JWT_ISSUER || "sumbi-theses";

  // Token expiration times
  private static readonly ACCESS_TOKEN_EXPIRY = "1h";
  private static readonly REFRESH_TOKEN_EXPIRY_SHORT = "7d";
  private static readonly REFRESH_TOKEN_EXPIRY_LONG = "30d";

  /**
   * Generate access token and refresh token pair
   */
  static generateTokens(
    userId: string,
    email: string,
    role: UserRole,
    rememberMe: boolean = false,
  ): TokenPair {
    const accessToken = this.generateAccessToken(userId, email, role);
    const refreshToken = this.generateRefreshToken(userId, email, role, rememberMe);

    return { accessToken, refreshToken };
  }

  /**
   * Generate access token (short-lived, 1 hour)
   */
  private static generateAccessToken(
    userId: string,
    email: string,
    role: UserRole,
  ): string {
    const payload = {
      sub: userId,
      email,
      role,
      iss: this.ISSUER,
    };

    return jwt.sign(payload, this.ACCESS_TOKEN_SECRET, {
      expiresIn: this.ACCESS_TOKEN_EXPIRY,
    });
  }

  /**
   * Generate refresh token (long-lived, 7 days)
   */
  private static generateRefreshToken(
    userId: string,
    email: string,
    role: UserRole,
    rememberMe: boolean = false,
  ): string {
    const payload = {
      sub: userId,
      email,
      role,
      iss: this.ISSUER,
      type: "refresh", // Mark as refresh token
    };

    return jwt.sign(payload, this.REFRESH_TOKEN_SECRET, {
      expiresIn: rememberMe ? this.REFRESH_TOKEN_EXPIRY_LONG : this.REFRESH_TOKEN_EXPIRY_SHORT,
    });
  }

  /**
   * Verify access token and extract payload
   * Validates signature, expiration, and issuer
   */
  static verifyAccessToken(token: string): JWTPayload {
    try {
      const decoded = jwt.verify(token, this.ACCESS_TOKEN_SECRET, {
        issuer: this.ISSUER,
        algorithms: ['HS256'], // Pin algorithm to prevent confusion attacks
      }) as JWTPayload;

      return decoded;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error("Access token expired");
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new Error("Invalid access token");
      }
      throw new Error("Token verification failed");
    }
  }

  /**
   * Verify refresh token and extract payload
   * Validates signature, expiration, issuer, and token type
   */
  static verifyRefreshToken(token: string): JWTPayload {
    try {
      const decoded = jwt.verify(token, this.REFRESH_TOKEN_SECRET, {
        issuer: this.ISSUER,
        algorithms: ['HS256'], // Pin algorithm to prevent confusion attacks
      }) as JWTPayload & { type?: string };

      // Verify this is actually a refresh token (prevent access tokens from being used as refresh tokens)
      if (decoded.type !== "refresh") {
        throw new Error("Token is not a refresh token");
      }

      return decoded;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error("Refresh token expired");
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new Error("Invalid refresh token");
      }
      throw error; // Re-throw our custom "not a refresh token" error
    }
  }

  /**
   * Decode token without verification (for debugging/logging only)
   */
  static decodeToken(token: string): JWTPayload | null {
    try {
      return jwt.decode(token) as JWTPayload;
    } catch (error) {
      return null;
    }
  }

  /**
   * Extract user ID from token without full verification (fast)
   */
  static extractUserId(token: string): string | null {
    const decoded = this.decodeToken(token);
    return decoded?.sub || null;
  }

  /**
   * Check if token is expired without verification
   */
  static isTokenExpired(token: string): boolean {
    const decoded = this.decodeToken(token);
    if (!decoded || !decoded.exp) return true;

    return Date.now() >= decoded.exp * 1000;
  }
}
