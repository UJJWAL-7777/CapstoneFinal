import http from 'http';
import { env } from './config/env.js';
import { connectDB } from './config/db.js';
import app from './app.js';
import { initSocketIO } from './socket/index.js';
import { seedBadges } from './services/badge.service.js';

async function start() {
  await connectDB();
  await seedBadges(); // ensure badge definitions exist

  const server = http.createServer(app);
  const io = initSocketIO(server);

  // Expose io globally so services can emit notifications
  app.set('io', io);

  server.listen(env.PORT, () => console.log(`API listening on http://localhost:${env.PORT}`));

  const shutdown = (signal) => {
    console.log(`${signal} received, shutting down`);
    server.close(() => process.exit(0));
  };
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

start().catch((err) => {
  console.error('Failed to start server:', err.message);
  process.exit(1);
});
