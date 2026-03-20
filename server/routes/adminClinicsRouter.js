import express from 'express';
import {
  createAdminClinic,
  getAdminClinicById,
  getAdminClinics,
  updateAdminClinic,
} from '../controllers/clinicsController.js';
import { getCurrentUser } from '../middleware/getCurrentUser.js';

const router = express.Router();

router.use(getCurrentUser);

router.get('/', getAdminClinics);
router.post('/', createAdminClinic);
router.get('/:id', getAdminClinicById);
router.patch('/:id', updateAdminClinic);

export default router;
