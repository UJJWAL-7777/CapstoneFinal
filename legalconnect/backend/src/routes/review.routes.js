import { Router } from 'express';
import * as reviewController from '../controllers/review.controller.js';
import { protect, authorize } from '../middleware/auth.js';
import { ROLES } from '../constants/index.js';

const router = Router();

// Public
router.get('/advocate/:advocateId', reviewController.getAdvocateReviews);

// Protected
router.post('/', protect, authorize(ROLES.CLIENT), reviewController.createReview);
router.put('/:reviewId/respond', protect, authorize(ROLES.ADVOCATE), reviewController.respondToReview);

export default router;
