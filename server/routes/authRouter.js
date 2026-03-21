import express from 'express';
import {
	login,
	logout,
	validateInviteToken,
	acceptInvite,
} from '../controllers/authController.js';
import { getCurrentUser } from '../middleware/getCurrentUser.js';
import { authLimiter, inviteAcceptLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.post('/login', authLimiter, login);
router.post('/logout', getCurrentUser, logout);
router.get('/invite/:token', inviteAcceptLimiter, validateInviteToken);
router.post('/accept-invite', inviteAcceptLimiter, acceptInvite);

export default router;
