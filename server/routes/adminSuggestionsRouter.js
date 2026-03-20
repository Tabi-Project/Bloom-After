import express from 'express';
import {
  getAdminSuggestionById,
  getAdminSuggestions,
  updateAdminSuggestion,
} from '../controllers/suggestionsController.js';
import { getCurrentUser } from '../middleware/getCurrentUser.js';

const router = express.Router();

router.use(getCurrentUser);

router.get('/', getAdminSuggestions);
router.get('/:id', getAdminSuggestionById);
router.patch('/:id', updateAdminSuggestion);

export default router;
