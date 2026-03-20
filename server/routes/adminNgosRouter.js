import express from 'express';
import {
  getAdminNgoById,
  getAdminNgos,
  updateAdminNgo,
} from '../controllers/ngosController.js';
import { getCurrentUser } from '../middleware/getCurrentUser.js';

const router = express.Router();

router.use(getCurrentUser);

router.get('/', getAdminNgos);
router.get('/:id', getAdminNgoById);
router.patch('/:id', updateAdminNgo);

export default router;
