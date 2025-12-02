import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../lib/supabase";
import { AuthUser } from "../types";

/**
 * Authentication middleware - verifies JWT token and attaches user to request
 * This middleware only handles AUTHENTICATION (verifying identity).
 * For AUTHORIZATION (checking permissions), use middleware from authorization.middleware.ts
 */
export async function authenticated(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    console.log('[Auth] Request:', req.method, req.originalUrl);
    const authHeader = req.headers.authorization;
    console.log('[Auth] Auth header:', authHeader ? 'present' : 'missing');

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log('[Auth] No Bearer token');
      return res.status(401).json({
        error: "No token provided",
        code: "NO_TOKEN"
      });
    }

    const token = authHeader.substring(7);

    if (!token) {
      console.log('[Auth] Empty token');
      return res.status(401).json({
        error: "Invalid token",
        code: "INVALID_TOKEN"
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET!) as any;
    console.log('[Auth] Token decoded, user ID:', decoded.sub);

    // Get role from JWT claims (now automatically synced from public.users by database trigger)
    const user: AuthUser = {
      id: decoded.sub,
      email: decoded.email,
      role: decoded.app_metadata?.role || decoded.user_metadata?.role || 'student',
      school_id: decoded.user_metadata?.school_id
        ? BigInt(decoded.user_metadata.school_id)
        : undefined,
      aud: decoded.aud,
      exp: decoded.exp,
      iat: decoded.iat,
      iss: decoded.iss,
      sub: decoded.sub,
      user_metadata: decoded.user_metadata,
    };

    console.log('[Auth] User authenticated:', user.id, user.role);
    req.user = user;
    next();
  } catch (error) {
    console.log('[Auth] Error:', error);
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

