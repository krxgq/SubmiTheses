import rateLimit from "express-rate-limit";

type RateLimiterConfig = {
  windowMs: number;
  limit: number;
  message: string;
};

function createApiRateLimiter({ windowMs, limit, message }: RateLimiterConfig) {
  return rateLimit({
    windowMs,
    limit,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: { error: message },
  });
}

export const writeRateLimiter = createApiRateLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 120,
  message: "Too many write requests, please try again later",
});

export const apiRateLimiter = createApiRateLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  message: "Too many API requests, please try again later",
});

export const sensitiveWriteRateLimiter = createApiRateLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  message: "Too many sensitive update requests, please try again later",
});

export const destructiveActionRateLimiter = createApiRateLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  message: "Too many destructive requests, please try again later",
});

export const bulkOperationRateLimiter = createApiRateLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  message: "Too many bulk operation requests, please try again after 15 minutes",
});

export const invitationRateLimiter = createApiRateLimiter({
  windowMs: 60 * 60 * 1000,
  limit: 10,
  message: "Too many invitation or password setup requests, please try again later",
});

export const uploadRateLimiter = createApiRateLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 60,
  message: "Too many upload requests, please try again later",
});
