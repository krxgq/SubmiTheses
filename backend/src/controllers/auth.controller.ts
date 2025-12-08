import { Request, Response } from "express";
import { supabase } from "../lib/supabase";
import { UserService } from "../services/users.service";
import jwt from "jsonwebtoken";

/**
 * Auth Controller - Proxies Supabase Auth operations and enriches user data
 * All auth operations from frontend go through these endpoints
 * This abstraction enables easy migration to other auth providers/databases
 */

/**
 * POST /api/auth/login
 * Proxy Supabase signInWithPassword, return enriched user data
 */
export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    // Call Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("[Auth] Supabase login error:", error);
      return res.status(401).json({
        error: getAuthErrorMessage(error.message),
        code: error.status || 401,
      });
    }

    if (!data.user || !data.session) {
      return res.status(401).json({
        error: "Login failed",
      });
    }

    // Fetch enriched user profile from database
    const userProfile = await getUserProfile(data.user.id);

    // Set httpOnly cookies for tokens (XSS-proof)
    res.cookie('sb-access-token', data.session.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 1000, // 1 hour
      path: '/',
    });

    res.cookie('sb-refresh-token', data.session.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/',
    });

    // Return user profile (no tokens in response body for security)
    return res.status(200).json({
      user: userProfile,
    });
  } catch (err) {
    console.error("[Auth] Login error:", err);
    return res.status(500).json({
      error: "Network error occurred",
    });
  }
}

/**
 * POST /api/auth/register
 * Proxy Supabase signUp, create user profile
 */
export async function register(req: Request, res: Response) {
  try {
    const { email, password, username } = req.body;

    // Call Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username,
        },
      },
    });

    if (error) {
      return res.status(400).json({
        error: getAuthErrorMessage(error.message),
      });
    }

    if (!data.user) {
      return res.status(400).json({
        error: "Registration failed",
      });
    }

    // Check if email confirmation is required
    if (!data.session) {
      return res.status(200).json({
        user: null,
        requiresEmailConfirmation: true,
        message:
          "Please check your email and click the confirmation link to complete registration.",
      });
    }

    // Fetch user profile (created by database trigger)
    const userProfile = await getUserProfile(data.user.id);

    // Set httpOnly cookies for tokens
    res.cookie('sb-access-token', data.session.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 1000, // 1 hour
      path: '/',
    });

    res.cookie('sb-refresh-token', data.session.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/',
    });

    return res.status(201).json({
      user: userProfile,
      requiresEmailConfirmation: false,
    });
  } catch (err) {
    console.error("[Auth] Registration error:", err);
    return res.status(500).json({
      error: "Network error occurred",
    });
  }
}

/**
 * POST /api/auth/logout
 * Invalidate user session server-side and clear cookies
 */
export async function logout(req: Request, res: Response) {
  try {
    // Get token from cookie
    const token = req.cookies['sb-access-token'];

    if (token) {
      // Decode token to get user ID
      const decoded = jwt.decode(token) as any;
      const userId = decoded?.sub;

      if (userId) {
        // Invalidate all sessions for this user using Admin API
        const { error } = await supabase.auth.admin.signOut(userId);

        if (error) {
          console.error("[Auth] Logout error:", error);
          // Don't fail logout if session invalidation fails
          // Session will expire naturally
        }
      }
    }

    // Clear cookies (always clear, even if no token)
    res.clearCookie('sb-access-token', { path: '/' });
    res.clearCookie('sb-refresh-token', { path: '/' });

    return res.status(204).send();
  } catch (err) {
    console.error("[Auth] Logout error:", err);
    // Still clear cookies even on error
    res.clearCookie('sb-access-token', { path: '/' });
    res.clearCookie('sb-refresh-token', { path: '/' });
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

    // Extract token from header
    const authHeader = req.headers.authorization;
    const token = authHeader?.substring(7); // Remove "Bearer "

    if (!token) {
      return res.status(401).json({
        error: "No token provided",
      });
    }

    // Decode token to get expiration
    const decoded = jwt.decode(token) as any;

    return res.status(200).json({
      user: userProfile,
      session: {
        access_token: token,
        expires_at: decoded?.exp,
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
 * Refresh expired token using cookie-stored refresh token
 */
export async function refresh(req: Request, res: Response) {
  try {
    // Read refresh token from cookie instead of request body
    const refresh_token = req.cookies['sb-refresh-token'];

    if (!refresh_token) {
      return res.status(401).json({
        error: "No refresh token found",
      });
    }

    // Call Supabase Auth refreshSession
    const { data, error } = await supabase.auth.refreshSession({
      refresh_token,
    });

    if (error) {
      return res.status(401).json({
        error: getAuthErrorMessage(error.message),
      });
    }

    if (!data.session || !data.user) {
      return res.status(401).json({
        error: "Session refresh failed",
      });
    }

    // Fetch updated user profile
    const userProfile = await getUserProfile(data.user.id);

    // Update cookies with new tokens
    res.cookie('sb-access-token', data.session.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 1000, // 1 hour
      path: '/',
    });

    res.cookie('sb-refresh-token', data.session.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/',
    });

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
 * Validate session using cookie-stored access token
 * Used by frontend middleware for route protection
 */
export async function validateSession(req: Request, res: Response) {
  try {
    // Read access token from cookie
    const token = req.cookies['sb-access-token'];

    if (!token) {
      return res.status(401).json({ error: 'No session found' });
    }

    // Validate JWT using Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid session' });
    }

    // Fetch user profile from database
    const userProfile = await getUserProfile(user.id);

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
 * Helper: Fetch user profile from database and enrich with role from JWT
 * Replaces the direct database query in frontend/src/lib/auth.ts:200-204
 */
async function getUserProfile(userId: string) {
  // Fetch user from database using existing UserService
  const user = await UserService.getUserById(userId);

  if (!user) {
    throw new Error("User profile not found");
  }

  // Return enriched user profile
  return {
    id: user.id,
    email: user.email,
    full_name: user.full_name,
    avatar_url: user.avatar_url,
    role: user.role, // Role comes from database
    year_id: user.year_id ? Number(user.year_id) : undefined,
    created_at: user.created_at.toISOString(),
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
    case "Password should be at least 6 characters":
      return "Password must be at least 6 characters long.";
    case "Unable to validate email address: invalid format":
      return "Please enter a valid email address.";
    case "Signup is disabled":
      return "Account registration is currently disabled.";
    default:
      return message || "An unexpected error occurred.";
  }
}
