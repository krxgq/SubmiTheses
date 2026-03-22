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
  limit: 300, // general writes (create/update)
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
  limit: 60, // role changes, status updates, grading
  message: "Too many sensitive update requests, please try again later",
});

export const destructiveActionRateLimiter = createApiRateLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 40, // deletes
  message: "Too many destructive requests, please try again later",
});

export const bulkOperationRateLimiter = createApiRateLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 25, // bulk publish, auto-lock, bulk clone
  message: "Too many bulk operation requests, please try again after 15 minutes",
});

export const invitationRateLimiter = createApiRateLimiter({
  windowMs: 60 * 60 * 1000,
  limit: 20, // invitations, password setup/reset
  message: "Too many invitation or password setup requests, please try again later",
});

export const uploadRateLimiter = createApiRateLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 150, // file uploads
  message: "Too many upload requests, please try again later",
});
