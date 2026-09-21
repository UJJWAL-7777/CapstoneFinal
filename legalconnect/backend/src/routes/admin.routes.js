import { Router } from 'express';
import * as adminController from '../controllers/admin.controller.js';
import * as badgeController from '../controllers/badge.controller.js';
import { protect, authorize } from '../middleware/auth.js';
import { ROLES } from '../constants/index.js';

const router = Router();

router.use(protect, authorize(ROLES.ADMIN));

router.get('/dashboard', adminController.getDashboardStats);

// Users
router.get('/users', adminController.getUsers);
router.get('/users/:id/details', adminController.getUserDetails);
router.put('/users/:id/status', adminController.updateUserStatus);

// Advocates (all advocates list + verification)
router.get('/advocates', adminController.getAllAdvocates);
router.get('/verification', adminController.getVerificationQueue);
router.put('/advocates/:id/verify', adminController.updateVerificationStatus);

// Consultations
router.get('/consultations', adminController.getAllConsultations);

// Cases
router.get('/cases', adminController.getAllCases);

// Payments
router.get('/payments', adminController.getAllPayments);

// Audit logs
router.get('/audit-logs', adminController.getAuditLogs);

// Badges
router.get('/badges', adminController.getBadges);
router.get('/badges/granted', adminController.getGrantedBadges);
router.delete('/badges/granted/:id', adminController.revokeBadge);
router.put('/badges/:id', adminController.updateBadge);
router.post('/badges/grant', adminController.grantBadgeToUser);

// Platform Analytics & Settings
router.get('/analytics', adminController.getAnalytics);
router.get('/settings', adminController.getPlatformSettings);
router.put('/settings', adminController.updatePlatformSettings);

export default router;

