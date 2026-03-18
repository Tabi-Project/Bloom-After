import express from 'express';
import {
  approveClinicReview,
  getClinicById,
  getClinicReviews,
  getClinics,
  listClinicReviewsForAdmin,
  rejectClinicReview,
  submitClinicReview,
} from '../controllers/clinicsController.js';
import { getCurrentUser } from '../middleware/getCurrentUser.js';
import { geoLimiter, reviewLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.get('/', geoLimiter, getClinics);
router.get('/reviews', getCurrentUser, listClinicReviewsForAdmin);
router.patch('/reviews/:id/approve', getCurrentUser, approveClinicReview);
router.patch('/reviews/:id/reject', getCurrentUser, rejectClinicReview);
router.get('/:id', getClinicById);
router.get('/:id/reviews', getClinicReviews);
router.post('/:id/reviews', reviewLimiter, submitClinicReview);

export default router;
