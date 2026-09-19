import { Router } from 'express';
import * as aiController from '../controllers/ai.controller.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.post('/assist', protect, aiController.assist);

export default router;
