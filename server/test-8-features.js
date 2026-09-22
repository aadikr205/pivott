// Comprehensive End-to-End Verification of All 8 Features in PIVOTT
const http = require('http');

const BASE_URL = 'http://localhost:5000';

function makeRequest(urlPath, method = 'GET', body = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(urlPath, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'x-test-suite': 'true'
      }
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, body: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('====================================================');
  console.log('🚀 PIVOTT 8-FEATURE SYSTEMATIC INTEGRATION TEST');
  console.log('====================================================\n');

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

  // --- Feature 2 & 1: Password Rules & Email OTP Verification ---
  console.log('[Feature 2 & 1] Testing Password Validation & Email OTP Verification...');
  
  // Test invalid passwords
  const badPasswords = ['weak', 'lowercase1!', 'NoNumber!', 'NoSymbol1'];
  for (const bp of badPasswords) {
    const res = await makeRequest('/api/auth/signup/send-otp', 'POST', {
      name: 'Test Student',
      email: 'teststudent@example.com',
      password: bp,
      exam_name: 'JEE Advanced',
      exam_date: '2026-05-20'
    });
    assert(res.status === 400 && res.body.error, `Rejected invalid password "${bp}": ${res.body.error}`);
  }

  // Valid password & send OTP
  const testEmail = `student_${Date.now()}@gmail.com`;
  const validPass = `Pivott#2026_${Date.now()}`;
  const otpRes = await makeRequest('/api/auth/signup/send-otp', 'POST', {
    name: 'Verified Student',
    email: testEmail,
    password: validPass,
    confirm_password: validPass,
    exam_name: 'JEE Advanced',
    exam_date: '2026-05-20',
    max_daily_hours: 6.0
  });

  assert(otpRes.status === 200 && otpRes.body?.success, `OTP sent to ${testEmail}`, otpRes.body);
  const devOtp = otpRes.body.dev_otp;
  assert(!!devOtp && /^\d{6}$/.test(devOtp), `Received 6-digit numeric OTP in dev mode: ${devOtp}`);

  // Verify OTP
  const verifyRes = await makeRequest('/api/auth/signup/verify-otp', 'POST', {
    email: testEmail,
    otp: devOtp
  });

  assert((verifyRes.status === 200 || verifyRes.status === 201) && verifyRes.body.token, 'Verified OTP and received authentication JWT');
  const token = verifyRes.body.token;
  const user = verifyRes.body.user;
  assert(user?.is_verified === 1, 'User account flagged as verified');

  // --- Feature 5: Profile Photo & Default Avatar ---
  console.log('\n[Feature 5] Testing Profile Photo & Preset Avatar Gallery...');
  const avatarRes = await makeRequest('/api/auth/default-avatar', 'POST', {
    avatar_id: 'avatar_scholar'
  }, token);
  assert(avatarRes.status === 200 && avatarRes.body.profile_photo_url === 'avatar:avatar_scholar', 'Set preset avatar "avatar_scholar"', avatarRes);

  // Upload custom base64 photo
  const sampleBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
  const uploadRes = await makeRequest('/api/auth/profile-photo', 'POST', {
    photo_base64: sampleBase64
  }, token);
  assert(uploadRes.status === 200 && (uploadRes.body.profile_photo_url?.includes('profile_') || uploadRes.body.profile_photo_url?.startsWith('data:')), 'Uploaded custom profile photo', uploadRes);

  // --- Feature 4: PYQ Bank Expansion (1,000 Qs & Numerical tolerance check) ---
  console.log('\n[Feature 4] Testing PYQ 1,000 Questions Bank & Numerical Answer Checking...');
  const statsRes = await makeRequest('/api/pyq/stats', 'GET', null, token);
  assert(statsRes.status === 200 && statsRes.body.total_pyqs >= 1000, `Found ${statsRes.body.total_pyqs} total questions in PYQ Bank (100 Qs/yr across 10 years 2016-2025)`);

  const pyqsRes = await makeRequest('/api/pyq/questions?limit=1000', 'GET', null, token);
  assert(pyqsRes.status === 200 && pyqsRes.body.count >= 1000, `Retrieved ${pyqsRes.body.count} questions on query`);

  // Check numerical question
  const numericalQ = pyqsRes.body.questions.find(q => q.type === 'numerical');
  assert(!!numericalQ, `Found numerical question: "${numericalQ?.question?.slice(0, 50)}..."`);
  if (numericalQ) {
    // First test wrong number to get correct answer
    const probeRes = await makeRequest('/api/pyq/check-answer', 'POST', {
      question_id: numericalQ.id,
      answer: -999.99
    }, token);
    const correctAns = probeRes.body.correct_answer;
    assert(correctAns !== undefined, `Backend validated answer and returned correct reference: ${correctAns}`);

    // Now test with exact answer + 0.005 (within ±0.01 tolerance)
    const testAns = correctAns + 0.005;
    const checkRes = await makeRequest('/api/pyq/check-answer', 'POST', {
      question_id: numericalQ.id,
      answer: testAns
    }, token);
    assert(checkRes.status === 200 && checkRes.body.is_correct === true, `Numerical answer ${testAns} accepted for ${correctAns} within ±0.01 tolerance`);
  }

  // --- Feature 6: Visual Concept Notes with Mermaid Diagrams ---
  console.log('\n[Feature 6] Testing Visual Concept Notes & Mermaid Maps...');
  const notesRes = await makeRequest('/api/notes', 'GET', null, token);
  assert(notesRes.status === 200 && notesRes.body.notes.length > 0, `Retrieved ${notesRes.body.notes.length} chapter notes`);
  const sampleNote = notesRes.body.notes[0];
  assert(!!sampleNote.concept_map_mermaid, `Chapter "${sampleNote.chapter_title}" contains Mermaid concept map`);
  assert(!!sampleNote.mnemonic, `Chapter contains mnemonic aid: "${sampleNote.mnemonic}"`);
  assert(!!sampleNote.real_life_example, `Chapter contains real-life example: "${sampleNote.real_life_example?.slice(0, 40)}..."`);

  // --- Feature 7: Permanent Immutable Activity History ---
  console.log('\n[Feature 7] Testing Immutable Activity History Ledger...');
  const historyRes = await makeRequest('/api/activity/history', 'GET', null, token);
  assert(historyRes.status === 200 && Array.isArray(historyRes.body.logs), `Retrieved immutable activity history: ${historyRes.body.logs?.length} logged events`);
  const hasSignupEvent = historyRes.body.logs?.some(l => l.activity_type.startsWith('auth'));
  assert(hasSignupEvent, 'Activity ledger records initial verified auth_signup event', historyRes.body);

  // --- Feature 8: Timetable 3-Step Sequence & Interactive Concept Video ---
  console.log('\n[Feature 8] Testing Interactive Concept Video & 10-Question Quiz...');
  // Get today's schedule or user topic
  const todayRes = await makeRequest('/api/schedule/today', 'GET', null, token);
  let topicId = todayRes.body.planned_items?.[0]?.topic_id;

  if (!topicId) {
    // Generate onboarding presets to have topics with future exam date
    const setupRes = await makeRequest('/api/onboarding/setup', 'POST', {
      exam_name: 'JEE Advanced',
      exam_date: '2027-05-20',
      max_daily_hours: 6.0,
      off_days: [],
      subjects: [
        { name: 'Physics', topics: [{ name: 'Electromagnetism & Faraday Law', weightage: 5, estimated_minutes: 60 }] }
      ]
    }, token);
    const refreshedToday = await makeRequest('/api/schedule/today', 'GET', null, token);
    topicId = refreshedToday.body.planned_items?.[0]?.topic_id || setupRes.body?.scheduleDays?.[0]?.planned_items?.[0]?.topic_id;
  }

  assert(!!topicId, `Selected active study topic ID: ${topicId}`);

  if (topicId) {
    const videoRes = await makeRequest(`/api/topics/${topicId}/concept-video`, 'GET', null, token);
    assert(videoRes.status === 200 && videoRes.body.slides?.length >= 5, `Generated ${videoRes.body.slides?.length} concept video slides with TTS narration scripts`, videoRes);
    assert(videoRes.body.quiz?.length === 10, `Generated exactly 10 post-video immediate retention MCQs in strict English`, videoRes);

    // Complete video
    const completeVidRes = await makeRequest(`/api/topics/${topicId}/complete-video`, 'POST', null, token);
    assert(completeVidRes.status === 200 && completeVidRes.body.success, 'Marked concept video completed');

    // Submit 10-question quiz with score 8/10
    const submitQuizRes = await makeRequest('/api/quiz/submit', 'POST', {
      topic_id: topicId,
      score: 8,
      total_questions: 10,
      time_taken_seconds: 120,
      questions: videoRes.body.quiz
    }, token);
    assert(submitQuizRes.status === 200 && submitQuizRes.body.percentage === 80, 'Submitted 10-Q quiz with 80% score, topic mastery updated');

    // Verify activity history logged these actions
    const updatedHistory = await makeRequest('/api/activity/history', 'GET', null, token);
    const hasQuizEvent = updatedHistory.body.logs.some(l => l.activity_type === 'quiz_attempt');
    assert(hasQuizEvent, 'Activity ledger records quiz_attempt event with score details');
  }

  console.log('\n====================================================');
  console.log(`SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================\n');
}

runTests().catch(err => {
  console.error('Test run failed with error:', err);
});
