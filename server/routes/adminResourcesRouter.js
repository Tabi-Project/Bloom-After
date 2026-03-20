import express from 'express';
import {
  createAdminResource,
  getAdminResourceById,
  getAdminResources,
  updateAdminResource,
} from '../controllers/resourcesController.js';
import { getCurrentUser } from '../middleware/getCurrentUser.js';

const router = express.Router();

router.use(getCurrentUser);

router.get('/', getAdminResources);
router.post('/', createAdminResource);
router.get('/:id', getAdminResourceById);
router.patch('/:id', updateAdminResource);

export default router;
