// ═══════════════════════════════════════════════════════════════
// LexBot — Standalone Chatbot Server for LegalConnect
// Runs independently on port 5001
// API: POST /api/chat  { message, userRole?, userName? }
// ═══════════════════════════════════════════════════════════════

import express from 'express';
import cors from 'cors';
import { generateChatResponse } from './services/chatbot.service.js';

const app = express();
const PORT = process.env.PORT || process.env.CHATBOT_PORT || 5001;

// ─── Middleware ──────────────────────────────────────────────────
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (curl, Postman, server-to-server)
    if (!origin) return callback(null, true);
    // Allow any localhost port
    if (/^https?:\/\/localhost(:\d+)?$/.test(origin)) return callback(null, true);
    // Allow all origins by default unless CORS_ORIGIN is restricted
    if (!process.env.CORS_ORIGIN || process.env.CORS_ORIGIN === '*') return callback(null, true);
    const allowed = process.env.CORS_ORIGIN.split(',').map((s) => s.trim());
    if (allowed.includes(origin)) return callback(null, true);
    callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST'],
  credentials: true,
}));

app.use(express.json({ limit: '10kb' }));

// ─── Health Check ───────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    service: 'LexBot Chatbot',
    version: '1.0.0',
    status: 'online',
    timestamp: new Date().toISOString(),
  });
});

// ─── Chat Endpoint ──────────────────────────────────────────────
app.post('/api/chat', (req, res) => {
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
    console.error('Chat error:', err);
    res.status(500).json({
      success: false,
      error: 'Internal server error. Please try again.',
    });
  }
});

// ─── 404 Handler ────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found. Use POST /api/chat to interact with LexBot.',
  });
});

// ─── Start Server ───────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n⚖️  LexBot Chatbot Server`);
  console.log(`   Status:   Online`);
  console.log(`   Port:     ${PORT}`);
  console.log(`   API:      http://localhost:${PORT}/api/chat`);
  console.log(`   Health:   http://localhost:${PORT}/api/health\n`);
});
