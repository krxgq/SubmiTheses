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
  microsoftLogin,
  microsoftCallback,
  setPassword,
  microsoftLink,
} from "../controllers/auth.controller";
import { validate } from "../middleware/validate";
import {
  loginSchema,
  registerSchema,
  refreshSchema,
  setPasswordSchema,
} from "../validation/schemas";

const router = Router();

// Rate limiter for login: 20 attempts per 15 minutes per IP
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Too many login attempts, please try again after 15 minutes' },
});

// Rate limiter for registration: 10 attempts per hour per IP
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Too many registration attempts, please try again later' },
});

// Rate limiter for token refresh: 60 per 15 minutes per IP
const refreshLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 60,
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

// Rate limiter for OAuth: 30 attempts per 15 minutes per IP
const oauthLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Too many OAuth attempts, please try again later' },
});

// POST /api/auth/set-password - Set password for Microsoft-only users (requires auth)
router.post("/set-password", loginLimiter, authenticated, validate(setPasswordSchema), setPassword);

// GET /api/auth/microsoft/link - Initiate Microsoft account linking (requires auth)
router.get("/microsoft/link", oauthLimiter, authenticated, microsoftLink);

// GET /api/auth/microsoft - Initiate Microsoft OAuth login (rate limited)
router.get("/microsoft", oauthLimiter, microsoftLogin);

// GET /api/auth/microsoft/callback - Handle Microsoft OAuth callback
router.get("/microsoft/callback", microsoftCallback);

export default router;
