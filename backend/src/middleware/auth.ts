import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET, supabase } from "../lib/supabase";
import { AuthUser } from "../types";
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
      return res.status(401).json({ error: "No token provided" });
    }

    const token = authHeader.substring(7);

    if (!token) {
      console.log('[Auth] Empty token');
      return res.status(401).json({ error: "Invalid token" });
    }

    const decoded = jwt.verify(token, JWT_SECRET!) as any;
    console.log('[Auth] Token decoded, user ID:', decoded.sub);

    // TODO: Fetch role from database once we have service role key
    // For now, using role from JWT metadata (may not exist, defaults to student)
    const user: AuthUser = {
      id: decoded.sub,
      email: decoded.email,
      role: decoded.user_metadata?.role || decoded.app_metadata?.role || 'student',
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
      return res.status(401).json({ error: "Invalid token" });
    }
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ error: "Token expired" });
    }
    return res.status(500).json({ error: "Authentication error" });
  }
}

export async function isAdmin(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    // Check if user has admin role
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Admin access required" });
    }

    next();
  } catch (error) {
    return res.status(500).json({ error: "Authorization error" });
  }
}

// Middleware to check if user belongs to specific school
export async function belongsToSchool(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const schoolId = BigInt(req.params.id || req.body.school_id);

    // Admins can access any school
    if (req.user.role === "admin") {
      return next();
    }

    // Check if user belongs to the school
    if (!req.user.school_id || req.user.school_id !== schoolId) {
      return res.status(403).json({ error: "Access denied to this school" });
    }

    next();
  } catch (error) {
    return res.status(500).json({ error: "Authorization error" });
  }
}

// Middleware for checking if user can access their own data or is admin
export function canAccessUser(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const userId = req.params.id;

    console.log(
      "user role:",
      req.user.role,
      "user id:",
      req.user.id,
      "requested user id:",
      userId,
    );

    // Admins and teachers can access any user
    if (req.user.role === "admin" || req.user.role === "teacher") {
      return next();
    }

    if (req.user.id === userId) {
      return next();
    }

    return res.status(403).json({ error: "Access denied" });
  } catch (error) {
    return res.status(500).json({ error: "Authorization error" });
  }
}

// Middleware for checking if user can access project (student, supervisor, opponent, or admin)
export function canAccessProject(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    // TODO: Implement project access logic based on user role and project ownership
    // For now, just require authentication
    next();
  } catch (error) {
    return res.status(500).json({ error: "Authorization error" });
  }
}

// Middleware for checking if user can modify project (owner or admin)
export function canModifyProject(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    // Admin can modify any project
    if (req.user.role === "admin") {
      return next();
    }

    // TODO: Check if user is project owner (student)
    // For now, allow all authenticated users
    next();
  } catch (error) {
    return res.status(500).json({ error: "Authorization error" });
  }
}

