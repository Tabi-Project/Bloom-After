import express from 'express';
import { submitSuggestion } from '../controllers/suggestionsController.js';
import { suggestionLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.post('/', suggestionLimiter, submitSuggestion);

export default router;
