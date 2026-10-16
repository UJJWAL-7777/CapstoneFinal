// ═══════════════════════════════════════════════════════════════
// LexBot — Standalone Chatbot Server for LegalConnect
// Runs independently on port 5001
// API: POST /api/chat  { message, userRole?, userName?, lang? }
// ═══════════════════════════════════════════════════════════════

import express from 'express';
import cors from 'cors';
import { generateChatResponse } from './services/chatbot.service.js';

const app = express();
const PORT = process.env.PORT || process.env.CHATBOT_PORT || 5001;

// ─── Security Hardening ─────────────────────────────────────────
app.disable('x-powered-by'); // Hide Express server fingerprint

// ─── Zero-Dependency In-Memory Rate Limiter ──────────────────────
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 60; // 60 messages per minute per IP

function rateLimiter(req, res, next) {
  const ip =
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.socket.remoteAddress ||
    'unknown';
  const now = Date.now();
  const clientData = rateLimitMap.get(ip) || { count: 0, resetTime: now + RATE_LIMIT_WINDOW_MS };

  if (now > clientData.resetTime) {
    clientData.count = 1;
    clientData.resetTime = now + RATE_LIMIT_WINDOW_MS;
  } else {
    clientData.count += 1;
  }
  rateLimitMap.set(ip, clientData);

  if (clientData.count > MAX_REQUESTS_PER_WINDOW) {
    return res.status(429).json({
      success: false,
      error: 'Too many requests. Please wait a moment before sending another message.',
    });
  }
  next();
}

// Clean up expired IP records periodically
const cleanupInterval = setInterval(() => {
  const now = Date.now();
  for (const [ip, data] of rateLimitMap.entries()) {
    if (now > data.resetTime) rateLimitMap.delete(ip);
  }
}, RATE_LIMIT_WINDOW_MS);
if (cleanupInterval.unref) cleanupInterval.unref();

// ─── Middleware ──────────────────────────────────────────────────
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (curl, Postman, server-to-server)
      if (!origin) return callback(null, true);
      // Allow any localhost port
      if (/^https?:\/\/localhost(:\d+)?$/.test(origin)) return callback(null, true);

      // Auto-allow all Vercel previews and Render instances
      try {
        const parsed = new URL(origin);
        if (parsed.hostname.endsWith('.vercel.app') || parsed.hostname.endsWith('.onrender.com')) {
          return callback(null, true);
        }
      } catch {
        // invalid URL origin, fall through
      }

      // Allow all origins by default unless CORS_ORIGIN is restricted
      if (!process.env.CORS_ORIGIN || process.env.CORS_ORIGIN === '*') return callback(null, true);
      const allowed = process.env.CORS_ORIGIN.split(',').map((s) => s.trim());
      if (allowed.includes(origin)) return callback(null, true);

      callback(null, false);
    },
    methods: ['GET', 'POST'],
    credentials: true,
  })
);

app.use(express.json({ limit: '10kb' }));

// Lightweight Request Logging
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    if (req.path !== '/api/health') {
      console.log(`[LexBot] ${req.method} ${req.path} ${res.statusCode} - ${Date.now() - start}ms`);
    }
  });
  next();
});

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
app.post('/api/chat', rateLimiter, (req, res) => {
  try {
    const { message, userRole, userName, lang } = req.body;

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
      userName || 'User',
      lang || null
    );

    res.json({
      success: true,
      data: result,
    });
  } catch (err) {
    console.error('[LexBot] Chat error:', err);
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

// ─── Start Server & Graceful Shutdown ───────────────────────────
const server = app.listen(PORT, () => {
  console.log(`\n⚖️  LexBot Chatbot Server`);
  console.log(`   Status:   Online`);
  console.log(`   Port:     ${PORT}`);
  console.log(`   API:      http://localhost:${PORT}/api/chat`);
  console.log(`   Health:   http://localhost:${PORT}/api/health\n`);
});

const gracefulShutdown = (signal) => {
  console.log(`\n[LexBot] Received ${signal}. Closing server gracefully...`);
  clearInterval(cleanupInterval);
  server.close(() => {
    console.log('[LexBot] Server closed cleanly.');
    process.exit(0);
  });
  setTimeout(() => {
    console.error('[LexBot] Forcing shutdown after timeout.');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('unhandledRejection', (reason) => {
  console.error('[LexBot] Unhandled Rejection:', reason);
});
process.on('uncaughtException', (err) => {
  console.error('[LexBot] Uncaught Exception:', err);
});
