/**
 * Cleanup script — deletes demo users so seedDemo can recreate them with correct hashes
 * Run: node src/scripts/cleanDemo.js
 */
import '../config/env.js';
import { connectDB } from '../config/db.js';
import { User } from '../models/User.js';
import { AdvocateProfile } from '../models/AdvocateProfile.js';
import { ClientProfile } from '../models/ClientProfile.js';
import { Availability } from '../models/Availability.js';
import { Consultation } from '../models/Consultation.js';
import { Payment } from '../models/Payment.js';
import { Case } from '../models/Case.js';
import { Review } from '../models/Review.js';

await connectDB();

const demoEmails = [
  'priya.sharma@demo.lc',
  'rajesh.kumar@demo.lc',
  'kavitha.nair@demo.lc',
  'arjun.singh@demo.lc',
  'meera.iyer@demo.lc',
  'rahul.mehta@demo.lc',
  'sunita.patel@demo.lc',
];

const users = await User.find({ email: { $in: demoEmails } }).select('_id');
const userIds = users.map((u) => u._id);

const [u, ap, cp, av, co, pa, ca, re] = await Promise.all([
  User.deleteMany({ email: { $in: demoEmails } }),
  AdvocateProfile.deleteMany({ user: { $in: userIds } }),
  ClientProfile.deleteMany({ user: { $in: userIds } }),
  Availability.deleteMany({ advocate: { $in: userIds } }),
  Consultation.deleteMany({ $or: [{ client: { $in: userIds } }, { advocate: { $in: userIds } }] }),
  Payment.deleteMany({ $or: [{ client: { $in: userIds } }, { advocate: { $in: userIds } }] }),
  Case.deleteMany({ $or: [{ client: { $in: userIds } }, { advocate: { $in: userIds } }] }),
  Review.deleteMany({ $or: [{ client: { $in: userIds } }, { advocate: { $in: userIds } }] }),
]);

console.log(`✅ Cleaned: ${u.deletedCount} users, ${ap.deletedCount} advocate profiles, ${cp.deletedCount} client profiles`);
console.log(`   ${av.deletedCount} availability, ${co.deletedCount} consultations, ${pa.deletedCount} payments, ${ca.deletedCount} cases, ${re.deletedCount} reviews`);
console.log('\nNow run: npm run seed:demo\n');
process.exit(0);
