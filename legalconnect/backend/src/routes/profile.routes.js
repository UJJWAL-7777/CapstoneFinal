import { Router } from 'express';
import * as profileController from '../controllers/profile.controller.js';
import { protect, authorize } from '../middleware/auth.js';
import { ROLES } from '../constants/index.js';

const router = Router();

router.use(protect);

// Advocate profile
router.get('/advocate/me', authorize(ROLES.ADVOCATE), profileController.getMyAdvocateProfile);
router.put('/advocate/me', authorize(ROLES.ADVOCATE), profileController.updateAdvocateProfile);

// Client profile
router.get('/client/me', authorize(ROLES.CLIENT), profileController.getMyClientProfile);
router.put('/client/me', authorize(ROLES.CLIENT), profileController.updateClientProfile);

// Shared user info update
router.put('/me', profileController.updateUserInfo);

export default router;
