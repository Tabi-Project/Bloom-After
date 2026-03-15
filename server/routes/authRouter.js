import express from 'express';
import { login, logout } from '../controllers/authController.js';
import { getCurrentUser } from '../middleware/getCurrentUser.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.post('/login', authLimiter, login);
router.post('/logout', getCurrentUser, logout);

export default router;
