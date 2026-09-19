import { z } from 'zod';
import { CONSULTATION_MODES } from '../constants/index.js';

const email = z.string().trim().toLowerCase().email('Enter a valid email address').max(120);

export const passwordRule = z
  .string()
  .min(8, 'Use at least 8 characters')
  .max(72, 'Use at most 72 characters')
  .regex(/[a-z]/, 'Include a lowercase letter')
  .regex(/[A-Z]/, 'Include an uppercase letter')
  .regex(/\d/, 'Include a number');

const phone = z
  .string()
  .trim()
  .regex(/^\+?[0-9\s-]{7,15}$/, 'Enter a valid phone number')
  .optional()
  .or(z.literal('').transform(() => undefined));

const base = {
  name: z.string().trim().min(2, 'Enter your full name').max(80),
  email,
  password: passwordRule,
  phone,
};

const clientRegister = z.object({ ...base, role: z.literal('client') });

const advocateRegister = z.object({
  ...base,
  role: z.literal('advocate'),
  barCouncilNumber: z.string().trim().min(3, 'Enter your Bar Council enrolment number').max(40),
  barCouncilState: z.string().trim().min(2, 'Enter your Bar Council state').max(80),
  practiceAreas: z.array(z.string().trim().min(2).max(60)).min(1, 'Select at least one practice area').max(10),
  experienceYears: z.coerce.number().int().min(0).max(70),
  city: z.string().trim().min(2, 'Enter your city').max(80),
  state: z.string().trim().min(2, 'Enter your state').max(80),
  languages: z.array(z.string().trim().min(2).max(40)).max(10).optional().default([]),
  consultationFee: z.coerce.number().min(0).max(1000000).optional().default(0),
  consultationModes: z.array(z.enum(CONSULTATION_MODES)).min(1).optional().default(['video', 'chat']),
});

// Only client/advocate can self-register. "admin" fails the discriminator, so it is rejected.
export const registerSchema = z.object({
  body: z.discriminatedUnion('role', [clientRegister, advocateRegister], {
    errorMap: () => ({ message: 'Role must be client or advocate' }),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email,
    password: z.string().min(1, 'Enter your password').max(72),
  }),
});

export const changePasswordSchema = z.object({
  body: z
    .object({
      currentPassword: z.string().min(1, 'Enter your current password'),
      newPassword: passwordRule,
    })
    .refine((d) => d.currentPassword !== d.newPassword, {
      path: ['newPassword'],
      message: 'New password must be different from the current one',
    }),
});
