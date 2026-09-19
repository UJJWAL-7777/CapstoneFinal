import { Router } from 'express';
import * as profileController from '../controllers/profile.controller.js';
import * as availabilityController from '../controllers/availability.controller.js';
import * as badgeController from '../controllers/badge.controller.js';
import { protect } from '../middleware/auth.js';

const router = Router();

// Public advocate discovery
router.get('/', profileController.searchAdvocates);
router.get('/:id', profileController.getAdvocatePublicProfile);
router.get('/:id/availability', availabilityController.getAdvocateAvailability);
router.get('/:id/badges', badgeController.getAdvocateBadges);
router.get('/:id/achievements', badgeController.getAchievements);

export default router;
