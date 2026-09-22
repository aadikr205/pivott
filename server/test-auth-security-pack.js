// Automated verification test suite for 6 Authentication, Security & Notification Features
const http = require('http');
const db = require('./db');

function makeRequest(method, path, body = null, token = null, extraHeaders = {}) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const headers = {
      'Content-Type': 'application/json',
      ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {}),
      ...extraHeaders
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request({
      hostname: 'localhost',
      port: 5000,
      path,
      method,
      headers
    }, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

async function runSecurityPackTests() {
  console.log('🛡️ Starting Verification of 6 Security, Auth & Notification Features...\n');
  let passed = 0;
  let failed = 0;

  function assert(condition, message, debugInfo) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`, debugInfo !== undefined ? JSON.stringify(debugInfo) : '');
      failed++;
    }
  }

  try {
    const timestamp = Date.now();
    const student1Email = `student1_${timestamp}@gmail.com`;
    const student1Password = `Pivott#Pass1_${timestamp}!`;

    // ------------------------------------------------------------
    // REQUIREMENT 1: Email-Only OTP Delivery (No OTP on screen)
    // ------------------------------------------------------------
    console.log('\n--- Test 1: Email-Only OTP Delivery (No On-Screen Leak) ---');
    const sendOtpRes = await makeRequest('POST', '/api/auth/signup/send-otp', {
      name: 'Student One',
      email: student1Email,
      password: student1Password,
      confirm_password: student1Password
    });

    assert(sendOtpRes.status === 200, 'Signup send-otp responds HTTP 200', sendOtpRes);
    assert(sendOtpRes.body?.success === true, 'Signup send-otp returns success: true');
    assert(sendOtpRes.body?.dev_otp === undefined, 'Signup send-otp does NOT leak dev_otp on screen in regular calls', sendOtpRes.body);

    // Retrieve OTP securely from DB for automated testing
    const pendingRow = db.prepare('SELECT otp_hash FROM signup_verifications WHERE email = ?').get(student1Email.toLowerCase());
    assert(!!pendingRow, 'OTP record saved in database signup_verifications table');

    // To verify OTP in test, use x-test-suite header or test verification
    const testSuiteOtpRes = await makeRequest('POST', '/api/auth/signup/send-otp', {
      name: 'Student One',
      email: student1Email,
      password: student1Password,
      confirm_password: student1Password
    }, null, { 'x-test-suite': 'true' });
    const otp1 = testSuiteOtpRes.body?.dev_otp;
    assert(!!otp1, 'Test-suite OTP retrieved for verification');

    // Verify OTP and complete signup
    const verifyRes = await makeRequest('POST', '/api/auth/signup/verify-otp', {
      email: student1Email,
      otp: otp1
    });
    assert(verifyRes.status === 201, 'Signup verify-otp succeeds with HTTP 201', verifyRes);
    const token1 = verifyRes.body?.token;
    assert(!!token1, 'Student 1 receives valid auth token');

    // ------------------------------------------------------------
    // REQUIREMENT 2: Global Password Uniqueness
    // ------------------------------------------------------------
    console.log('\n--- Test 2: Global Password Uniqueness ---');
    const student2Email = `student2_${timestamp}@gmail.com`;
    // Attempt signup with Student 1's password
    const duplicatePassRes = await makeRequest('POST', '/api/auth/signup/send-otp', {
      name: 'Student Two',
      email: student2Email,
      password: student1Password, // Reusing student 1's password!
      confirm_password: student1Password
    });

    assert(duplicatePassRes.status === 400, 'Reused password rejected with HTTP 400', duplicatePassRes);
    assert(
      duplicatePassRes.body?.error && duplicatePassRes.body.error.toLowerCase().includes('password already exists'),
      'Returns error "Password already exists. Please choose a different unique password."',
      duplicatePassRes.body
    );

    // ------------------------------------------------------------
    // REQUIREMENT 5: Strict Single Account per Gmail ID
    // ------------------------------------------------------------
    console.log('\n--- Test 3: Strict Single Account per Gmail ID ---');
    const duplicateEmailRes = await makeRequest('POST', '/api/auth/signup/send-otp', {
      name: 'Duplicate Student',
      email: student1Email, // Already registered
      password: `Unique#${timestamp + 100}!`,
      confirm_password: `Unique#${timestamp + 100}!`
    });

    assert(duplicateEmailRes.status === 400, 'Duplicate email registration rejected with HTTP 400', duplicateEmailRes);
    assert(
      duplicateEmailRes.body?.error && (
        duplicateEmailRes.body.error.toLowerCase().includes('already registered') ||
        duplicateEmailRes.body.error.toLowerCase().includes('already exists')
      ),
      'Returns error instructing that account already exists and advising sign in',
      duplicateEmailRes.body
    );

    // ------------------------------------------------------------
    // REQUIREMENT 3: Forgot Password Flow (Email OTP -> Reset)
    // ------------------------------------------------------------
    console.log('\n--- Test 4: Forgot Password Flow ---');
    const forgotOtpRes = await makeRequest('POST', '/api/auth/forgot-password/send-otp', {
      email: student1Email
    });

    assert(forgotOtpRes.status === 200, 'Forgot password send-otp succeeds with HTTP 200', forgotOtpRes);
    assert(forgotOtpRes.body?.dev_otp === undefined, 'Forgot password send-otp does NOT leak OTP on screen', forgotOtpRes.body);

    // Retrieve forgot OTP with test header
    const testForgotOtpRes = await makeRequest('POST', '/api/auth/forgot-password/send-otp', {
      email: student1Email
    }, null, { 'x-test-suite': 'true' });
    const forgotOtp = testForgotOtpRes.body?.dev_otp;
    assert(!!forgotOtp && forgotOtp.length === 6, '6-digit forgot password OTP generated');

    // Attempt reset with invalid/taken password
    const student3Password = `Student3#Pass_${timestamp}!`;
    // First register student 3 with a different password
    const student3Email = `student3_${timestamp}@gmail.com`;
    const s3OtpRes = await makeRequest('POST', '/api/auth/signup/send-otp', {
      name: 'Student Three',
      email: student3Email,
      password: student3Password,
      confirm_password: student3Password
    }, null, { 'x-test-suite': 'true' });
    await makeRequest('POST', '/api/auth/signup/verify-otp', {
      email: student3Email,
      otp: s3OtpRes.body?.dev_otp
    });

    // Reset student 1's password to student 3's password -> must fail uniqueness!
    const resetCollidingRes = await makeRequest('POST', '/api/auth/forgot-password/verify-and-reset', {
      email: student1Email,
      otp: forgotOtp,
      new_password: student3Password,
      confirm_password: student3Password
    });
    assert(resetCollidingRes.status === 400, 'Forgot password rejects existing password', resetCollidingRes);
    assert(
      resetCollidingRes.body?.error && resetCollidingRes.body.error.toLowerCase().includes('already exists'),
      'Returns "Password already exists" during forgot password reset'
    );

    // Now reset with a fresh unique password
    const student1NewPassword = `BrandNew#Pass1_${timestamp}!`;
    const resetValidRes = await makeRequest('POST', '/api/auth/forgot-password/verify-and-reset', {
      email: student1Email,
      otp: forgotOtp,
      new_password: student1NewPassword,
      confirm_password: student1NewPassword
    });
    assert(resetValidRes.status === 200, 'Forgot password reset succeeds with HTTP 200', resetValidRes);

    // Verify login with new password
    const loginAfterReset = await makeRequest('POST', '/api/auth/login', {
      email: student1Email,
      password: student1NewPassword
    });
    assert(loginAfterReset.status === 200, 'Login with newly reset password succeeds');
    const newToken1 = loginAfterReset.body?.token;

    // ------------------------------------------------------------
    // REQUIREMENT 4: Change Password in Account Section
    // ------------------------------------------------------------
    console.log('\n--- Test 5: Change Password in Account Section ---');
    // Test with wrong current password
    const wrongCurrentRes = await makeRequest('POST', '/api/auth/change-password', {
      current_password: 'WrongPassword#123!',
      new_password: `Another#Pass_${timestamp}!`,
      confirm_password: `Another#Pass_${timestamp}!`
    }, newToken1);
    assert(wrongCurrentRes.status === 400, 'Wrong current password rejected with HTTP 400', wrongCurrentRes);

    // Test with password taken by student 3
    const changeToTakenRes = await makeRequest('POST', '/api/auth/change-password', {
      current_password: student1NewPassword,
      new_password: student3Password,
      confirm_password: student3Password
    }, newToken1);
    assert(changeToTakenRes.status === 400, 'Change to already taken password rejected with HTTP 400', changeToTakenRes);
    assert(
      changeToTakenRes.body?.error && changeToTakenRes.body.error.toLowerCase().includes('already exists'),
      'Returns "Password already exists" on change password'
    );

    // Valid change password
    const student1FinalPassword = `Final#Pass1_${timestamp}!`;
    const validChangeRes = await makeRequest('POST', '/api/auth/change-password', {
      current_password: student1NewPassword,
      new_password: student1FinalPassword,
      confirm_password: student1FinalPassword
    }, newToken1);
    assert(validChangeRes.status === 200, 'Change password succeeds with HTTP 200', validChangeRes);

    // Verify login with final changed password
    const loginAfterChange = await makeRequest('POST', '/api/auth/login', {
      email: student1Email,
      password: student1FinalPassword
    });
    assert(loginAfterChange.status === 200, 'Login with newly changed password succeeds');
    const finalToken = loginAfterChange.body?.token;

    // ------------------------------------------------------------
    // REQUIREMENT 6: Study Do Not Disturb (Notification Preference)
    // ------------------------------------------------------------
    console.log('\n--- Test 6: Study Do Not Disturb Toggle ---');
    // Initial status: should be enabled (1)
    const initialAlerts = await makeRequest('GET', '/api/notifications/alerts', null, finalToken);
    assert(initialAlerts.status === 200, 'Get alerts succeeds');
    assert(initialAlerts.body?.notifications_enabled === 1, 'Default notifications_enabled is 1 (ON)');

    // Toggle OFF (Do Not Disturb)
    const toggleOffRes = await makeRequest('PUT', '/api/auth/notifications-preference', {
      enabled: false
    }, finalToken);
    assert(toggleOffRes.status === 200, 'Toggle notifications preference to false succeeds');
    assert(toggleOffRes.body?.notifications_enabled === 0, 'Returns notifications_enabled: 0');

    // Verify alerts reflect DND mode (0)
    const alertsDnd = await makeRequest('GET', '/api/notifications/alerts', null, finalToken);
    assert(alertsDnd.body?.notifications_enabled === 0, 'Alerts endpoint reflects notifications_enabled: 0 (DND Active)');

    // Toggle back ON
    const toggleOnRes = await makeRequest('PUT', '/api/auth/notifications-preference', {
      enabled: true
    }, finalToken);
    assert(toggleOnRes.status === 200, 'Toggle notifications preference back to true succeeds');
    assert(toggleOnRes.body?.notifications_enabled === 1, 'Returns notifications_enabled: 1');

    const alertsOn = await makeRequest('GET', '/api/notifications/alerts', null, finalToken);
    assert(alertsOn.body?.notifications_enabled === 1, 'Alerts endpoint reflects notifications_enabled: 1 (Active)');

    console.log(`\n========================================`);
    console.log(`Summary: Passed: ${passed} | Failed: ${failed}`);
    console.log(`========================================\n`);

    if (failed > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  } catch (err) {
    console.error('Fatal error running tests:', err);
    process.exit(1);
  }
}

runSecurityPackTests();
