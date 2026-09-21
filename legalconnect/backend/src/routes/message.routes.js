import { Router } from 'express';
import * as messageController from '../controllers/message.controller.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.use(protect);

router.get('/conversations', messageController.getConversations);
router.get('/', messageController.getMessages);
router.post('/', messageController.sendMessage);

export default router;
