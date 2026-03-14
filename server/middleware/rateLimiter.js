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
