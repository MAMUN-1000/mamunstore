import rateLimit from 'express-rate-limit';

const isTest = process.env.NODE_ENV === 'test';

/**
 * Authentication Limiter:
 * Restricts brute-force password guessing and account spamming on login/register endpoints.
 * Relaxed in test environment to avoid interfering with automated suites.
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: isTest ? 1000 : 20, // 20 requests per 15 minutes in production/dev
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts from this IP. Please try again after 15 minutes.',
  },
});

/**
 * Sensitive Operation Limiter:
 * Protects coupon validation and high-frequency order checkout attempts.
 */
export const sensitiveOpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: isTest ? 1000 : 60,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests. Please slow down and try again later.',
  },
});

/**
 * General API Limiter:
 * Provides baseline defense against rapid automated scraping or request flooding.
 */
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: isTest ? 5000 : 500,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP. Please try again later.',
  },
});
