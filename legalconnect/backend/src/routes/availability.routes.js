import { Router } from 'express';
import * as availabilityController from '../controllers/availability.controller.js';
import { protect, authorize } from '../middleware/auth.js';
import { ROLES } from '../constants/index.js';

const router = Router();

router.use(protect, authorize(ROLES.ADVOCATE));

router.get('/', availabilityController.getMyAvailability);
router.put('/', availabilityController.updateAvailability);

export default router;
