import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWTService } from "../services/jwt.service";
import { AuthUser } from "../types";

/**
 * Authentication middleware - verifies custom JWT token
 *
 * Supports two authentication methods:
 * 1. Bearer token in Authorization header (for client-side requests)
 * 2. httpOnly cookie sb-access-token (for server-side requests from Next.js)
 */
export async function authenticated(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    // Try to get token from Authorization header first
    const authHeader = req.headers.authorization;
    let token: string | undefined;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7);
    }
    // Fallback to cookie (for server-side requests from Next.js)
    else if (req.cookies['sb-access-token']) {
      token = req.cookies['sb-access-token'];
    }

    if (!token) {
      return res.status(401).json({
        error: "No token provided",
        code: "NO_TOKEN"
      });
    }

    // Verify using our custom JWT service
    const decoded = JWTService.verifyAccessToken(token);

    // Build AuthUser from our custom JWT payload
    const user: AuthUser = {
      id: decoded.sub,
      email: decoded.email,
      role: decoded.role,
      school_id: undefined,
      aud: 'authenticated',
      exp: decoded.exp,
      iat: decoded.iat,
      iss: decoded.iss,
      sub: decoded.sub,
      user_metadata: {},
    };

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        error: "Invalid token",
        code: "INVALID_TOKEN"
      });
    }
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        error: "Token expired",
        code: "TOKEN_EXPIRED"
      });
    }
    return res.status(500).json({
      error: "Authentication error",
      code: "AUTHENTICATION_ERROR"
    });
  }
}
