import express from 'express';
import { getAdminStats } from '../controllers/adminStatsController.js';
import { getCurrentUser } from '../middleware/getCurrentUser.js';

const router = express.Router();

router.get('/', getCurrentUser, getAdminStats);

export default router;
