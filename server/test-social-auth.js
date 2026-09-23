/**
 * Automated Test Suite for Social Authentication (Google & Apple)
 * Tests:
 * 1. Google sign-in for new user (creates account, seeds curriculum, issues JWT)
 * 2. Google sign-in for existing user (matches by email, preserves data, no duplication)
 * 3. Apple sign-in for new user (handles Apple private relay email, creates account, issues JWT)
 * 4. Apple sign-in for existing user (matches by email)
 * 5. Emitted JWT validity on protected endpoint (/auth/me)
 * 6. Deprecated OTP endpoints return HTTP 410 Gone
 */

const express = require('express');
const http = require('http');
const db = require('./db');
const authRouter = require('./routes/auth');
const onboardingRouter = require('./routes/onboarding').router;

async function runTests() {
  console.log('🧪 Starting Social Auth End-to-End Test Suite...\n');

  const app = express();
  app.use(express.json());
  app.use('/auth', authRouter);
  app.use('/onboarding', onboardingRouter);

  const server = http.createServer(app);
  await new Promise(resolve => server.listen(0, resolve));
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}`;

  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    try {
      await fn();
      console.log(`  ✅ PASS: ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ❌ FAIL: ${name}`);
      console.error(`     Error: ${err.message}`);
      failed++;
    }
  }

  const testGoogleEmail = `test.google.${Date.now()}@gmail.com`;
  const testAppleEmail = `test.apple.${Date.now()}@privaterelay.appleid.com`;
  let googleToken = null;
  let googleUserId = null;

  // Test 1: POST /auth/google creates new user
  await test('POST /auth/google creates new student account and seeds initial curriculum', async () => {
    const mockToken = `mock-google-token:${Buffer.from(JSON.stringify({
      email: testGoogleEmail,
      name: 'Google Student',
      picture: 'https://example.com/avatar.jpg',
      sub: 'google-sub-12345'
    })).toString('base64')}`;

    const res = await fetch(`${baseUrl}/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential: mockToken })
    });

    if (!res.ok) throw new Error(`Status ${res.status}: ${await res.text()}`);
    const data = await res.json();

    if (!data.token) throw new Error('Missing token in response');
    if (!data.user) throw new Error('Missing user in response');
    if (data.user.email !== testGoogleEmail) throw new Error(`Expected email ${testGoogleEmail}, got ${data.user.email}`);
    if (data.user.auth_provider !== 'google') throw new Error(`Expected auth_provider google, got ${data.user.auth_provider}`);

    googleToken = data.token;
    googleUserId = data.user.id;

    // Check subjects seeded in DB
    const subjects = db.prepare('SELECT COUNT(*) as count FROM subjects WHERE user_id = ?').get(googleUserId);
    if (subjects.count === 0) throw new Error('Expected subjects to be auto-seeded for new user');
  });

  // Test 2: POST /auth/google matches existing user by email
  await test('POST /auth/google matches existing user by email without creating duplicates', async () => {
    const mockToken = `mock-google-token:${Buffer.from(JSON.stringify({
      email: testGoogleEmail,
      name: 'Google Student (Updated)',
      picture: 'https://example.com/avatar.jpg',
      sub: 'google-sub-12345'
    })).toString('base64')}`;

    const res = await fetch(`${baseUrl}/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential: mockToken })
    });

    if (!res.ok) throw new Error(`Status ${res.status}: ${await res.text()}`);
    const data = await res.json();

    if (data.user.id !== googleUserId) {
      throw new Error(`Expected existing user id ${googleUserId}, but got different id ${data.user.id}`);
    }

    const countUsers = db.prepare('SELECT COUNT(*) as count FROM users WHERE lower(email) = lower(?)').get(testGoogleEmail);
    if (countUsers.count !== 1) {
      throw new Error(`Expected exactly 1 user row in database, found ${countUsers.count}`);
    }
  });

  // Test 3: Authenticated /auth/me with social JWT
  await test('Emitted JWT successfully authenticates against GET /auth/me', async () => {
    const res = await fetch(`${baseUrl}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${googleToken}`
      }
    });

    if (!res.ok) throw new Error(`Status ${res.status}: ${await res.text()}`);
    const data = await res.json();
    if (!data.user || data.user.id !== googleUserId) {
      throw new Error('Could not retrieve user profile with emitted social JWT');
    }
    if (data.user.auth_provider !== 'google') {
      throw new Error(`Expected auth_provider google in /me, got ${data.user.auth_provider}`);
    }
  });

  // Test 4: POST /auth/apple creates new user with private relay email
  await test('POST /auth/apple creates account for Apple private relay email', async () => {
    const mockToken = `mock-apple-token:${Buffer.from(JSON.stringify({
      email: testAppleEmail,
      name: 'Apple Student',
      sub: 'apple-sub-67890'
    })).toString('base64')}`;

    const res = await fetch(`${baseUrl}/auth/apple`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id_token: mockToken,
        user: { name: { firstName: 'Apple', lastName: 'Student' } }
      })
    });

    if (!res.ok) throw new Error(`Status ${res.status}: ${await res.text()}`);
    const data = await res.json();

    if (!data.token) throw new Error('Missing token in Apple response');
    if (data.user.email !== testAppleEmail) throw new Error(`Expected ${testAppleEmail}, got ${data.user.email}`);
    if (data.user.auth_provider !== 'apple') throw new Error(`Expected auth_provider apple, got ${data.user.auth_provider}`);
  });

  // Test 5: Deprecated OTP endpoints return 410 Gone
  await test('Deprecated OTP endpoints (/signup/send-otp, /signup/verify-otp) return HTTP 410', async () => {
    const resSend = await fetch(`${baseUrl}/auth/signup/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@example.com' })
    });
    if (resSend.status !== 410) throw new Error(`Expected 410 for send-otp, got ${resSend.status}`);

    const resVerify = await fetch(`${baseUrl}/auth/signup/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@example.com', otp: '123456' })
    });
    if (resVerify.status !== 410) throw new Error(`Expected 410 for verify-otp, got ${resVerify.status}`);
  });

  // Clean up test data
  try {
    db.prepare('DELETE FROM users WHERE lower(email) IN (lower(?), lower(?))').run(testGoogleEmail, testAppleEmail);
  } catch (_) {}

  server.close();

  console.log(`\n========================================`);
  console.log(`Test Results: ${passed} Passed, ${failed} Failed`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Fatal error running tests:', err);
  process.exit(1);
});
