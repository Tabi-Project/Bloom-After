import express from 'express';
import { uploadAdminImage } from '../controllers/adminUploadController.js';
import { getCurrentUser } from '../middleware/getCurrentUser.js';

const router = express.Router();

router.use(getCurrentUser);
router.post('/image', uploadAdminImage);

export default router;
