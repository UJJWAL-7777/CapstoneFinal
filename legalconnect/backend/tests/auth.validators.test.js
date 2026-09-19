import { test } from 'node:test';
import assert from 'node:assert/strict';

process.env.NODE_ENV = 'test';
const { registerSchema, loginSchema, changePasswordSchema } = await import('../src/validators/auth.validators.js');
const { signToken, verifyToken } = await import('../src/utils/jwt.js');

const client = { role: 'client', name: 'Asha Verma', email: 'ASHA@Example.com', password: 'Str0ngPass' };
const advocate = {
  role: 'advocate', name: 'Rohit Sharma', email: 'rohit@example.com', password: 'Str0ngPass',
  barCouncilNumber: 'P/1234/2015', barCouncilState: 'Punjab & Haryana', practiceAreas: ['Property Law'],
  experienceYears: '9', city: 'Jalandhar', state: 'Punjab',
};

test('client registration parses and normalises email', () => {
  const r = registerSchema.safeParse({ body: client });
  assert.equal(r.success, true);
  assert.equal(r.data.body.email, 'asha@example.com');
});

test('admin role cannot self-register', () => {
  assert.equal(registerSchema.safeParse({ body: { ...client, role: 'admin' } }).success, false);
});

test('unknown fields are stripped (mass-assignment protection)', () => {
  const r = registerSchema.safeParse({ body: { ...client, status: 'suspended', isAdmin: true } });
  assert.equal(r.success, true);
  assert.equal('status' in r.data.body, false);
  assert.equal('isAdmin' in r.data.body, false);
});

test('weak passwords are rejected', () => {
  for (const password of ['short1A', 'alllowercase1', 'NoNumbersHere']) {
    assert.equal(registerSchema.safeParse({ body: { ...client, password } }).success, false, password);
  }
});

test('advocate requires bar council details and practice areas', () => {
  assert.equal(registerSchema.safeParse({ body: advocate }).success, true);
  const { barCouncilNumber, ...missing } = advocate;
  assert.equal(registerSchema.safeParse({ body: missing }).success, false);
  assert.equal(registerSchema.safeParse({ body: { ...advocate, practiceAreas: [] } }).success, false);
});

test('advocate numeric strings are coerced and defaults applied', () => {
  const r = registerSchema.safeParse({ body: advocate });
  assert.equal(r.data.body.experienceYears, 9);
  assert.deepEqual(r.data.body.consultationModes, ['video', 'chat']);
});

test('login and change-password schemas', () => {
  assert.equal(loginSchema.safeParse({ body: { email: 'a@b.co', password: 'x' } }).success, true);
  assert.equal(loginSchema.safeParse({ body: { email: 'nope', password: 'x' } }).success, false);
  assert.equal(changePasswordSchema.safeParse({ body: { currentPassword: 'Str0ngPass', newPassword: 'Str0ngPass' } }).success, false);
});

test('JWT round-trip carries id, role and token version', () => {
  const token = signToken({ _id: 'abc123', role: 'client', tokenVersion: 2 });
  const p = verifyToken(token);
  assert.equal(p.sub, 'abc123');
  assert.equal(p.role, 'client');
  assert.equal(p.tv, 2);
  assert.throws(() => verifyToken(token + 'x'));
});
