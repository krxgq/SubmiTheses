import rateLimit, { Options } from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import { redisClient } from "../lib/cache";

type RateLimiterConfig = {
  windowMs: number;
  limit: number;
  message: string;
  skipAdmin?: boolean; // when true, admin requests are never counted or blocked
};

// Use Redis store when available; fall back to in-memory if Redis is down
function getStore(): Partial<Options> {
  if (!redisClient) return {};
  return {
    store: new RedisStore({
      sendCommand: (...args: string[]) => (redisClient as any).call(...args),
    }),
  };
}

function createApiRateLimiter({ windowMs, limit, message, skipAdmin }: RateLimiterConfig) {
  return rateLimit({
    windowMs,
    limit,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: { error: message },
    ...(skipAdmin ? { skip: (req: any) => req.user?.role === "admin" } : {}),
    ...getStore(),
  });
}

export const writeRateLimiter = createApiRateLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 500, // general writes (create/update)
  skipAdmin: true,
  message: "Too many write requests, please try again later",
});

// loose anti-spam limiter — only prevents abuse, not normal usage
export const apiRateLimiter = createApiRateLimiter({
  windowMs: 10 * 60 * 1000,
  limit: 1000,
  message: "Too many API requests, please try again later",
});

export const sensitiveWriteRateLimiter = createApiRateLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 200, // role changes, status updates, grading
  skipAdmin: true,
  message: "Too many sensitive update requests, please try again later",
});

export const destructiveActionRateLimiter = createApiRateLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 100, // deletes
  skipAdmin: true,
  message: "Too many destructive requests, please try again later",
});

export const bulkOperationRateLimiter = createApiRateLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 60, // bulk publish, auto-lock, bulk clone
  skipAdmin: true,
  message: "Too many bulk operation requests, please try again after 15 minutes",
});

export const invitationRateLimiter = createApiRateLimiter({
  windowMs: 60 * 60 * 1000,
  limit: 50, // invitations, password setup/reset
  skipAdmin: true,
  message: "Too many invitation or password setup requests, please try again later",
});

export const uploadRateLimiter = createApiRateLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 200, // file uploads
  skipAdmin: true,
  message: "Too many upload requests, please try again later",
});
