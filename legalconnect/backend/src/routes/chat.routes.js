import { Router } from 'express';
import { generateChatResponse } from '../services/chatbot.service.js';

const router = Router();

// Public Chatbot endpoint — used by ChatbotWidget
router.post('/', (req, res) => {
  try {
    const { message, userRole, userName } = req.body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Message is required and must be a non-empty string.',
      });
    }

    if (message.trim().length > 1000) {
      return res.status(400).json({
        success: false,
        error: 'Message is too long. Please keep it under 1000 characters.',
      });
    }

    const result = generateChatResponse(
      message.trim(),
      userRole || 'client',
      userName || 'User'
    );

    res.json({
      success: true,
      data: result,
    });
  } catch (err) {
    console.error('Chat endpoint error:', err);
    res.status(500).json({
      success: false,
      error: 'Internal server error. Please try again.',
    });
  }
});

// Health check for chatbot
router.get('/health', (_req, res) => {
  res.json({
    success: true,
    service: 'LexBot Chatbot (Integrated)',
    version: '1.0.0',
    status: 'online',
    timestamp: new Date().toISOString(),
  });
});

export default router;
