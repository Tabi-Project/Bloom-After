import express from 'express';
import {
  createAdminLifestyle,
  getAdminLifestyle,
  getAdminLifestyleById,
  updateAdminLifestyle,
} from '../controllers/lifestyleController.js';
import { getCurrentUser } from '../middleware/getCurrentUser.js';

const router = express.Router();

router.use(getCurrentUser);

router.get('/', getAdminLifestyle);
router.post('/', createAdminLifestyle);
router.get('/:id', getAdminLifestyleById);
router.patch('/:id', updateAdminLifestyle);

export default router;
