import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { ClientProfile } from '../models/ClientProfile.js';
import { AdvocateProfile } from '../models/AdvocateProfile.js';
import { ApiError } from '../utils/ApiError.js';
import { signToken } from '../utils/jwt.js';
import { logAudit } from './audit.service.js';
import { ROLES, USER_STATUS } from '../constants/index.js';

// Used to keep login timing similar whether or not the email exists
const DUMMY_HASH = bcrypt.hashSync('not-a-real-password', 10);

export async function getProfileForUser(user) {
  if (user.role === ROLES.CLIENT) return ClientProfile.findOne({ user: user._id });
  if (user.role === ROLES.ADVOCATE) return AdvocateProfile.findOne({ user: user._id });
  return null;
}

export async function register(data, req) {
  const existing = await User.exists({ email: data.email });
  if (existing) throw ApiError.conflict('An account with this email already exists', { errors: [{ path: 'email', message: 'Email is already registered' }] });

  const user = await User.create({
    name: data.name,
    email: data.email,
    password: data.password,
    phone: data.phone,
    role: data.role,
  });

  let profile;
  try {
    if (data.role === ROLES.CLIENT) {
      profile = await ClientProfile.create({ user: user._id });
    } else {
      profile = await AdvocateProfile.create({
        user: user._id,
        barCouncilNumber: data.barCouncilNumber,
        barCouncilState: data.barCouncilState,
        practiceAreas: data.practiceAreas,
        experienceYears: data.experienceYears,
        languages: data.languages,
        consultationFee: data.consultationFee,
        consultationModes: data.consultationModes,
        location: { city: data.city, state: data.state },
      });
    }
  } catch (err) {
    // Roll back so we never leave a user without a profile
    await User.deleteOne({ _id: user._id });
    if (err.code === 11000) {
      throw ApiError.conflict('This Bar Council number is already registered for that state', {
        errors: [{ path: 'barCouncilNumber', message: 'Already registered' }],
      });
    }
    throw err;
  }

  await logAudit({ actor: user._id, action: 'auth.register', entityType: 'User', entityId: user._id, metadata: { role: user.role }, req });
  return { user, profile, token: signToken(user) };
}

export async function login({ email, password }, req) {
  const user = await User.findOne({ email }).select('+password');
  const ok = await bcrypt.compare(password, user?.password || DUMMY_HASH);
  if (!user || !ok) {
    await logAudit({ action: 'auth.login_failed', metadata: { email }, req });
    throw ApiError.unauthorized('Invalid email or password', { code: 'INVALID_CREDENTIALS' });
  }
  if (user.status !== USER_STATUS.ACTIVE) {
    throw ApiError.forbidden('This account is suspended. Contact support for help.', { code: 'ACCOUNT_SUSPENDED' });
  }

  user.lastLoginAt = new Date();
  await user.save({ validateModifiedOnly: true });
  await logAudit({ actor: user._id, action: 'auth.login', entityType: 'User', entityId: user._id, req });

  const profile = await getProfileForUser(user);
  return { user, profile, token: signToken(user) };
}

export async function logout(user, req) {
  await logAudit({ actor: user._id, action: 'auth.logout', entityType: 'User', entityId: user._id, req });
}

export async function changePassword(userId, { currentPassword, newPassword }, req) {
  const user = await User.findById(userId).select('+password');
  if (!user || !(await user.comparePassword(currentPassword))) {
    throw ApiError.badRequest('Current password is incorrect', {
      code: 'INVALID_CREDENTIALS',
      errors: [{ path: 'currentPassword', message: 'Current password is incorrect' }],
    });
  }
  user.password = newPassword;
  user.tokenVersion += 1; // revokes every token issued before now
  await user.save();
  await logAudit({ actor: user._id, action: 'auth.password_changed', entityType: 'User', entityId: user._id, req });
  return signToken(user);
}
