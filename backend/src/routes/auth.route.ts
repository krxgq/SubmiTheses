import { Router } from "express";
import rateLimit from "express-rate-limit";
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

// Rate limiter for login: 10 attempts per 15 minutes per IP
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Too many login attempts, please try again after 15 minutes' },
});

// Rate limiter for registration: 5 attempts per hour per IP
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Too many registration attempts, please try again later' },
});

// Rate limiter for token refresh: 30 per 15 minutes per IP
const refreshLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Too many refresh attempts, please try again later' },
});

/**
 * Auth Routes - All authentication operations
 */

// POST /api/auth/login - Login with email/password (rate limited)
router.post("/login", loginLimiter, validate(loginSchema), login);

// POST /api/auth/register - Register new user (rate limited)
router.post("/register", registerLimiter, validate(registerSchema), register);

// POST /api/auth/logout - Logout current user
router.post("/logout", logout);

// GET /api/auth/validate - Validate session using cookie (for middleware)
router.get("/validate", validateSession);

// GET /api/auth/session - Get current session with user profile (requires auth)
router.get("/session", authenticated, getSession);

// POST /api/auth/refresh - Refresh expired token (rate limited)
router.post("/refresh", refreshLimiter, validate(refreshSchema), refresh);

// GET /api/auth/user - Get current user profile (requires auth)
router.get("/user", authenticated, getUser);

export default router;
