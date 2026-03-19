import rateLimit from 'express-rate-limit';

export const authLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 5,
  skipSuccessfulRequests: true,
  handler: (req, res) => {
    res.status(429).json({
      status: 'error',
      error: 'Too many authentication attempts. Please try again in 5 minutes.',
      retryAfter: 5 * 60,
    });
  },
});

export const geoLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  handler: (req, res) => {
    res.status(429).json({
      status: 'error',
      error: 'Too many location searches. Please wait a moment and try again.',
      retryAfter: 60,
    });
  },
});

export const reviewLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 10,
  handler: (req, res) => {
    res.status(429).json({
      status: 'error',
      error: 'Too many review submissions. Please try again later.',
      retryAfter: 10 * 60,
    });
  },
});
