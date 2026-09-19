import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import { env } from './config/env.js';
import routes from './routes/index.js';
import { globalLimiter } from './middleware/rateLimiters.js';
import { sanitize } from './middleware/sanitize.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();

if (env.isProd) app.set('trust proxy', 1);

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(
  cors({
    origin(origin, cb) {
      // No origin = server-to-server or curl — always allow
      if (!origin) return cb(null, true);
      // In dev: allow any localhost port (covers Vite 5173, 5174, 5175…)
      if (!env.isProd && /^http:\/\/localhost:\d+$/.test(origin)) return cb(null, true);
      // In prod: only explicitly listed origins
      if (env.CLIENT_URLS.includes(origin)) return cb(null, true);
      cb(new Error('Origin not allowed by CORS'));
    },
    credentials: true,
  })
);
if (env.NODE_ENV !== 'test') app.use(morgan(env.isProd ? 'combined' : 'dev'));
app.use(globalLimiter);
app.use(express.json({ limit: '1mb' }));
app.use(sanitize);

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.use('/api', routes);
app.use(notFound);
app.use(errorHandler);

export default app;
