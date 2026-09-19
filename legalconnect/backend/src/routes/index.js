import { Router } from 'express';
import authRoutes from './auth.routes.js';
import profileRoutes from './profile.routes.js';
import advocateRoutes from './advocate.routes.js';
import availabilityRoutes from './availability.routes.js';
import consultationRoutes from './consultation.routes.js';
import paymentRoutes from './payment.routes.js';
import caseRoutes from './case.routes.js';
import reviewRoutes from './review.routes.js';
import notificationRoutes from './notification.routes.js';
import aiRoutes from './ai.routes.js';
import reportRoutes from './report.routes.js';
import adminRoutes from './admin.routes.js';

const router = Router();

router.get('/health', (_req, res) => res.json({ success: true, data: { status: 'ok' } }));
router.use('/auth', authRoutes);
router.use('/profiles', profileRoutes);
router.use('/advocates', advocateRoutes);
router.use('/availability', availabilityRoutes);
router.use('/consultations', consultationRoutes);
router.use('/payments', paymentRoutes);
router.use('/cases', caseRoutes);
router.use('/reviews', reviewRoutes);
router.use('/notifications', notificationRoutes);
router.use('/ai', aiRoutes);
router.use('/reports', reportRoutes);
router.use('/admin', adminRoutes);

export default router;
