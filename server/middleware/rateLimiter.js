const rateLimit = require('express-rate-limit');

/**
 * General-purpose rate limiter for all API routes.
 * Allows 200 requests per 15 minutes per IP.
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests. Please try again later.' },
});

/**
 * Stricter rate limiter for the login route.
 * Allows 10 attempts per 15 minutes per IP.
 */
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many login attempts. Please try again later.' },
});

/**
 * Rate limiter for static client files served in production.
 * Allows 500 requests per 15 minutes per IP.
 */
const staticLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests. Please try again later.',
});

module.exports = { apiLimiter, loginLimiter, staticLimiter };
