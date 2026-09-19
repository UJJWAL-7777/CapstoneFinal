import { Router } from 'express';
import * as reportController from '../controllers/report.controller.js';
import { protect, authorize } from '../middleware/auth.js';
import { ROLES } from '../constants/index.js';

const router = Router();

router.use(protect);

router.post('/', reportController.createReport);
router.get('/', authorize(ROLES.ADMIN), reportController.getReports);
router.put('/:id', authorize(ROLES.ADMIN), reportController.updateReport);

export default router;
