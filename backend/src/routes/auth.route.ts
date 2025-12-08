import { Router } from "express";
import { authenticated } from "../middleware/auth";
import {
  login,
  register,
  logout,
  getSession,
  refresh,
  getUser,
  validateSession,
} from "../controllers/auth.controller";
import { validate } from "../middleware/validate";
import {
  loginSchema,
  registerSchema,
  refreshSchema,
} from "../validation/schemas";

const router = Router();

/**
 * Auth Routes - All authentication operations
 * These endpoints proxy Supabase Auth and return enriched user data
 */

// POST /api/auth/login - Login with email/password
router.post("/login", validate(loginSchema), login);

// POST /api/auth/register - Register new user
router.post("/register", validate(registerSchema), register);

// POST /api/auth/logout - Logout current user
router.post("/logout", logout);

// GET /api/auth/validate - Validate session using cookie (for middleware)
router.get("/validate", validateSession);

// GET /api/auth/session - Get current session with user profile (requires auth)
router.get("/session", authenticated, getSession);

// POST /api/auth/refresh - Refresh expired token
router.post("/refresh", validate(refreshSchema), refresh);

// GET /api/auth/user - Get current user profile (requires auth)
router.get("/user", authenticated, getUser);

export default router;
