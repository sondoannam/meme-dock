import rateLimit from 'express-rate-limit';

// Default rate limit configuration for general API endpoints
export const defaultLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100, // 100 requests per windowMs
  standardHeaders: 'draft-7', // Set standard headers
  legacyHeaders: false, // Disable legacy headers
  message: {
    success: false,
    message: 'Too many requests, please try again later.',
    code: 'RateLimitExceeded'
  }
});

// More restrictive rate limit for file uploads
export const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 20, // 20 file uploads per windowMs
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many file uploads, please try again later.',
    code: 'RateLimitExceeded'
  }
});

// Even more restrictive rate limit for multiple file uploads
export const multipleUploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  limit: 5, // 5 multi-file uploads per windowMs
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many batch uploads, please try again later.',
    code: 'RateLimitExceeded'
  }
});
