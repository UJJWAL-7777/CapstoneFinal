import mongoose from 'mongoose';
import { env } from '../config/env.js';
import { connectDB } from '../config/db.js';
import { User } from '../models/User.js';
import { ROLES } from '../constants/index.js';
import { passwordRule } from '../validators/auth.validators.js';

async function run() {
  const email = (process.env.ADMIN_EMAIL || '').toLowerCase();
  const password = process.env.ADMIN_PASSWORD || '';
  if (!email || !password) throw new Error('Set ADMIN_EMAIL and ADMIN_PASSWORD in .env');
  const check = passwordRule.safeParse(password);
  if (!check.success) throw new Error(`ADMIN_PASSWORD is too weak: ${check.error.issues[0].message}`);

  await connectDB();
  const existing = await User.findOne({ email });
  if (existing) {
    console.log(`User ${email} already exists (role: ${existing.role}). Nothing to do.`);
  } else {
    await User.create({ name: process.env.ADMIN_NAME || 'Platform Admin', email, password, role: ROLES.ADMIN });
    console.log(`Admin created: ${email}`);
  }
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
