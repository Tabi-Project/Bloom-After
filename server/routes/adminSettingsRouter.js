import express from 'express';
import {
  getAdminSettings,
  inviteAdminUser,
  resendAdminInvite,
} from '../controllers/adminSettingsController.js';
import { getCurrentUser } from '../middleware/getCurrentUser.js';
import { requireSuperAdmin } from '../middleware/requireSuperAdmin.js';
import { adminInviteLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.use(getCurrentUser);

router.get('/', getAdminSettings);
router.post('/invite', adminInviteLimiter, requireSuperAdmin, inviteAdminUser);
router.post('/invite/resend/:id', adminInviteLimiter, requireSuperAdmin, resendAdminInvite);

export default router;
