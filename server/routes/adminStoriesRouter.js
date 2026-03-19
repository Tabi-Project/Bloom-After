import express from 'express';
import {
  getAdminStories,
  getAdminStoryById,
  updateAdminStory,
} from '../controllers/storiesController.js';
import { getCurrentUser } from '../middleware/getCurrentUser.js';

const router = express.Router();

router.use(getCurrentUser);

router.get('/', getAdminStories);
router.get('/:id', getAdminStoryById);
router.patch('/:id', updateAdminStory);

export default router;
