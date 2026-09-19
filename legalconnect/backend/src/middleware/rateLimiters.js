import rateLimit from 'express-rate-limit';

const handler = (_req, res) =>
  res.status(429).json({
    success: false,
    code: 'RATE_LIMITED',
    message: 'Too many requests. Please wait a few minutes and try again.',
  });

export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 500,
  standardHeaders: true,
  legacyHeaders: false,
  handler,
});

// Stricter limiter for credential endpoints; only failed attempts count
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  handler,
});
