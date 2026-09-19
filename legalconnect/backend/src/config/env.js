import dotenv from 'dotenv';

dotenv.config();

const isTest = process.env.NODE_ENV === 'test';
const isProd = process.env.NODE_ENV === 'production';

const missing = ['MONGO_URI', 'JWT_SECRET'].filter((k) => !process.env[k]);
if (missing.length && !isTest) {
  throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
}
if (isProd && (process.env.JWT_SECRET || '').length < 32) {
  throw new Error('JWT_SECRET must be at least 32 characters in production');
}

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  isProd,
  PORT: Number(process.env.PORT) || 5000,
  MONGO_URI: process.env.MONGO_URI,
  CLIENT_URLS: (process.env.CLIENT_URL || 'http://localhost:5173')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),
  JWT_SECRET: process.env.JWT_SECRET || 'test-secret-test-secret-test-secret-1234',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  BCRYPT_ROUNDS: Number(process.env.BCRYPT_ROUNDS) || 12,
};
