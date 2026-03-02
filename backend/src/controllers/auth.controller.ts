import { Request, Response } from "express";
import { AuthService } from "../services/auth.service";
import { UserService } from "../services/users.service";
import { JWTService } from "../services/jwt.service";

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
 *
 * Note: JWTs are stateless and remain valid until expiration.
 * For immediate invalidation, implement one of:
 * 1. Token blacklist (Redis/DB with token ID)
 * 2. Token versioning (add 'jti' claim + version in DB)
 * 3. Short expiry times (current: 1h access token)
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
    // Note: Tokens remain technically valid until expiration, but browsers won't send them
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
