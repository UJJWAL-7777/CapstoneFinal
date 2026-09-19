// Client-side checks mirror the backend Zod rules. The server stays the source of truth.
export function validatePassword(pw) {
  if (pw.length < 8) return 'Use at least 8 characters';
  if (!/[a-z]/.test(pw)) return 'Include a lowercase letter';
  if (!/[A-Z]/.test(pw)) return 'Include an uppercase letter';
  if (!/\d/.test(pw)) return 'Include a number';
  return '';
}

const EMAIL = /^\S+@\S+\.\S+$/;

export function validateLogin({ email, password }) {
  const e = {};
  if (!EMAIL.test(email.trim())) e.email = 'Enter a valid email address';
  if (!password) e.password = 'Enter your password';
  return e;
}

export function validateRegister(v) {
  const e = {};
  if (v.name.trim().length < 2) e.name = 'Enter your full name';
  if (!EMAIL.test(v.email.trim())) e.email = 'Enter a valid email address';
  if (v.phone && !/^\+?[0-9\s-]{7,15}$/.test(v.phone.trim())) e.phone = 'Enter a valid phone number';
  const pw = validatePassword(v.password);
  if (pw) e.password = pw;
  if (v.role === 'advocate') {
    if (v.barCouncilNumber.trim().length < 3) e.barCouncilNumber = 'Enter your Bar Council enrolment number';
    if (v.barCouncilState.trim().length < 2) e.barCouncilState = 'Enter your Bar Council state';
    if (v.city.trim().length < 2) e.city = 'Enter your city';
    if (v.state.trim().length < 2) e.state = 'Enter your state';
    if (v.experienceYears === '' || Number(v.experienceYears) < 0 || Number(v.experienceYears) > 70) e.experienceYears = 'Enter years of experience (0-70)';
    if (v.practiceAreas.length === 0) e.practiceAreas = 'Select at least one practice area';
  }
  return e;
}
