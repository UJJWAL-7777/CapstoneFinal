import { Router } from 'express';
import * as paymentController from '../controllers/payment.controller.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.use(protect);

router.post('/initiate', paymentController.initiatePayment);
router.post('/confirm', paymentController.confirmPayment);
router.get('/', paymentController.getPayments);

export default router;
