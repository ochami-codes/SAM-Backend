import { rateLimit } from "express-rate-limit";

const FIFTEEN_MINUTES = 15 * 60 * 1000;

/**
 * General login protection.
 *
 * Maximum 10 login attempts per IP every 15 minutes.
 */
export const loginRateLimiter = rateLimit({
  windowMs: FIFTEEN_MINUTES,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many login attempts. Please try again later.",
    code: "LOGIN_RATE_LIMITED",
  },
});

/**
 * Two-factor login verification.
 *
 * Maximum 5 verification requests per IP every 15 minutes.
 */
export const twoFactorLoginRateLimiter = rateLimit({
  windowMs: FIFTEEN_MINUTES,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many verification attempts. Please try again later.",
    code: "TWO_FACTOR_RATE_LIMITED",
  },
});

/**
 * Two-factor enrollment initiation.
 *
 * Maximum 5 setup requests per IP every 15 minutes.
 */
export const twoFactorSetupRateLimiter = rateLimit({
  windowMs: FIFTEEN_MINUTES,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many enrollment requests. Please try again later.",
    code: "TWO_FACTOR_SETUP_RATE_LIMITED",
  },
});

/**
 * Two-factor enrollment verification.
 *
 * Maximum 5 verification requests per IP every 15 minutes.
 */
export const twoFactorSetupVerificationRateLimiter = rateLimit({
  windowMs: FIFTEEN_MINUTES,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many verification attempts. Please try again later.",
    code: "TWO_FACTOR_SETUP_VERIFICATION_RATE_LIMITED",
  },
});