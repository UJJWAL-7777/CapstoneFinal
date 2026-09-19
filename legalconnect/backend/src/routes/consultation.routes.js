import { Router } from 'express';
import * as consultationController from '../controllers/consultation.controller.js';
import { protect, authorize } from '../middleware/auth.js';
import { ROLES } from '../constants/index.js';

const router = Router();

router.use(protect);

router.post('/', authorize(ROLES.CLIENT), consultationController.createConsultation);
router.get('/', consultationController.getConsultations);
router.get('/:id', consultationController.getConsultation);
router.put('/:id/status', consultationController.updateConsultationStatus);

export default router;
