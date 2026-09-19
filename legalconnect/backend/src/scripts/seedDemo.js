/**
 * Demo seed script — creates sample advocates, clients, and consultations
 * Run: npm run seed:demo
 *
 * Safe to run multiple times (uses findOneOrCreate pattern).
 */
import '../config/env.js';
import { connectDB } from '../config/db.js';
import { User } from '../models/User.js';
import { AdvocateProfile } from '../models/AdvocateProfile.js';
import { ClientProfile } from '../models/ClientProfile.js';
import { Availability } from '../models/Availability.js';
import { Consultation } from '../models/Consultation.js';
import { Case } from '../models/Case.js';
import { Review } from '../models/Review.js';
import { Payment } from '../models/Payment.js';
import bcrypt from 'bcryptjs';

const DEMO_PASSWORD = 'Demo@12345'; // plain text — User pre-save hook hashes it

const ADVOCATES = [
  {
    name: 'Adv. Priya Sharma',
    email: 'priya.sharma@demo.lc',
    profile: {
      barCouncilNumber: 'MH/2012/0045',
      barCouncilState: 'Maharashtra',
      headline: 'Senior Family & Civil Law Specialist',
      bio: 'With over 12 years of experience in family law and civil litigation, I have successfully represented clients in the Supreme Court and various High Courts across India. I specialize in divorce, property disputes, and adoption cases.',
      practiceAreas: ['Family Law', 'Civil Litigation', 'Property Law'],
      experienceYears: 12,
      consultationFee: 1500,
      consultationModes: ['video', 'chat', 'in-person'],
      languages: ['English', 'Hindi', 'Marathi'],
      location: { city: 'Mumbai', state: 'Maharashtra', country: 'India' },
      verificationStatus: 'Verified',
    },
  },
  {
    name: 'Adv. Rajesh Kumar',
    email: 'rajesh.kumar@demo.lc',
    profile: {
      barCouncilNumber: 'TS/2014/0112',
      barCouncilState: 'Telangana',
      headline: 'Corporate & Tax Law Expert',
      bio: '10+ years of experience helping businesses navigate complex corporate laws, M&A transactions, and tax compliance. Former legal counsel at a Fortune 500 company.',
      practiceAreas: ['Corporate Law', 'Tax Law', 'Banking & Finance'],
      experienceYears: 10,
      consultationFee: 2000,
      consultationModes: ['video', 'chat'],
      languages: ['English', 'Hindi', 'Telugu'],
      location: { city: 'Hyderabad', state: 'Telangana', country: 'India' },
      verificationStatus: 'Verified',
    },
  },
  {
    name: 'Adv. Kavitha Nair',
    email: 'kavitha.nair@demo.lc',
    profile: {
      barCouncilNumber: 'KL/2016/0078',
      barCouncilState: 'Kerala',
      headline: 'Criminal Defense & Cyber Law Specialist',
      bio: 'Dedicated criminal defense attorney with 8 years of courtroom experience. Also a certified cyber law specialist handling cybercrime and digital fraud cases.',
      practiceAreas: ['Criminal Law', 'Cyber Law', 'Consumer Protection'],
      experienceYears: 8,
      consultationFee: 1200,
      consultationModes: ['video', 'in-person'],
      languages: ['English', 'Malayalam', 'Tamil'],
      location: { city: 'Kochi', state: 'Kerala', country: 'India' },
      verificationStatus: 'Verified',
    },
  },
  {
    name: 'Adv. Arjun Singh',
    email: 'arjun.singh@demo.lc',
    profile: {
      barCouncilNumber: 'DL/2018/0234',
      barCouncilState: 'Delhi',
      headline: 'Labour Law & Employment Rights Advocate',
      bio: 'Specializing in labour disputes, employment contracts, and worker rights. Represented both employees and employers across India in over 200 cases.',
      practiceAreas: ['Labour & Employment', 'Civil Litigation'],
      experienceYears: 6,
      consultationFee: 1000,
      consultationModes: ['video', 'chat', 'in-person'],
      languages: ['English', 'Hindi', 'Punjabi'],
      location: { city: 'Delhi', state: 'Delhi', country: 'India' },
      verificationStatus: 'Verified',
    },
  },
  {
    name: 'Adv. Meera Iyer',
    email: 'meera.iyer@demo.lc',
    profile: {
      barCouncilNumber: 'KA/2015/0167',
      barCouncilState: 'Karnataka',
      headline: 'Intellectual Property & Startup Law Expert',
      bio: 'Helping startups and innovators protect their intellectual property since 2015. Expert in patents, trademarks, copyrights, and tech company legal structures.',
      practiceAreas: ['Intellectual Property', 'Corporate Law', 'Cyber Law'],
      experienceYears: 9,
      consultationFee: 1800,
      consultationModes: ['video', 'chat'],
      languages: ['English', 'Tamil', 'Kannada'],
      location: { city: 'Bengaluru', state: 'Karnataka', country: 'India' },
      verificationStatus: 'Verified',
    },
  },
];

const CLIENTS = [
  { name: 'Rahul Mehta', email: 'rahul.mehta@demo.lc', profile: { occupation: 'Software Engineer', city: 'Pune' } },
  { name: 'Sunita Patel', email: 'sunita.patel@demo.lc', profile: { occupation: 'Business Owner', city: 'Ahmedabad' } },
];

async function findOrCreate(Model, query, data) {
  const existing = await Model.findOne(query);
  if (existing) return existing;
  return Model.create(data);
}

async function seed() {
  await connectDB();
  console.log('🌱 Starting demo seed...\n');

  // ── Advocates ──────────────────────────────────────────────────
  const advocateUsers = [];
  for (const adv of ADVOCATES) {
    const user = await findOrCreate(
      User,
      { email: adv.email },
      { name: adv.name, email: adv.email, password: DEMO_PASSWORD, role: 'advocate', isEmailVerified: true }
    );
    advocateUsers.push(user);

    await findOrCreate(
      AdvocateProfile,
      { user: user._id },
      { user: user._id, ...adv.profile }
    );

    // Default weekly availability (Mon–Fri, 9-5)
    await findOrCreate(
      Availability,
      { advocate: user._id },
      {
        advocate: user._id,
        slotDuration: 60,
        timezone: 'Asia/Kolkata',
        weeklySchedule: [1, 2, 3, 4, 5].map((day) => ({
          dayOfWeek: day,
          isActive: true,
          slots: [{ startTime: '09:00', endTime: '17:00' }],
        })),
      }
    );

    console.log(`  ✅ Advocate: ${adv.name} (${adv.email})`);
  }

  // ── Clients ────────────────────────────────────────────────────
  const clientUsers = [];
  for (const cl of CLIENTS) {
    const user = await findOrCreate(
      User,
      { email: cl.email },
      { name: cl.name, email: cl.email, password: DEMO_PASSWORD, role: 'client', isEmailVerified: true }
    );
    clientUsers.push(user);

    await findOrCreate(
      ClientProfile,
      { user: user._id },
      { user: user._id, occupation: cl.profile.occupation, location: { city: cl.profile.city, country: 'India' } }
    );

    console.log(`  ✅ Client: ${cl.name} (${cl.email})`);
  }

  // ── Sample data: Consultation → Payment → Case → Review ──────────
  if (clientUsers.length && advocateUsers.length) {
    const client = clientUsers[0];
    const advocate = advocateUsers[0];

    // 1. Consultation first (no payment yet — Payment needs consultation ref)
    let consultation = await Consultation.findOne({ client: client._id, advocate: advocate._id });
    if (!consultation) {
      consultation = await Consultation.create({
        client: client._id,
        advocate: advocate._id,
        date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        timeSlot: '10:00',
        mode: 'video',
        duration: 60,
        fee: 1500,
        legalIssue: 'Property dispute with neighbour regarding boundary wall construction.',
        practiceArea: 'Property Law',
        status: 'Confirmed',
      });
    }

    // 2. Payment referencing the consultation
    let payment = await Payment.findOne({ consultation: consultation._id });
    if (!payment) {
      payment = await Payment.create({
        consultation: consultation._id,
        client: client._id,
        advocate: advocate._id,
        amount: 1500,
        advocateAmount: 1275,
        platformFee: 225,
        status: 'Successful',
        paidAt: new Date(),
        gateway: 'mock',
      });
      // 3. Link payment back to consultation
      await Consultation.findByIdAndUpdate(consultation._id, { payment: payment._id });
    }

    // 4. Case
    await findOrCreate(
      Case,
      { client: client._id, advocate: advocate._id },
      {
        title: 'Property Boundary Dispute — Mehta vs. Sharma',
        client: client._id,
        advocate: advocate._id,
        consultation: consultation._id,
        practiceArea: 'Property Law',
        status: 'Opened',
        priority: 'medium',
        description: 'Dispute regarding boundary wall between residential plots in Pune.',
        courtName: 'Civil Court, Pune',
      }
    );

    // 5. Review (field names match Review schema)
    const existingReview = await Review.findOne({ consultation: consultation._id });
    if (!existingReview) {
      await Review.create({
        consultation: consultation._id,
        client: client._id,
        advocate: advocate._id,
        rating: 5,
        comment: 'Excellent advice! Very professional and knowledgeable. Highly recommended.',
        communicationRating: 5,
        professionalismRating: 5,
        responsivenessRating: 4,
      });
    }

    console.log('\n  ✅ Consultation + Payment + Case + Review created');
  }

  console.log('\n✨ Demo seed complete!\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  All demo accounts use password: Demo@12345');
  console.log('  Admin login:   admin@legalconnect.local / Admin@123456');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
