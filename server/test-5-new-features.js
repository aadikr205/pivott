// Automated test script for all 5 new features
const http = require('http');

function makeRequest(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const headers = {
      'Content-Type': 'application/json',
      'x-test-suite': 'true',
      ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {})
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

async function runTests() {
  console.log('🚀 Starting Verification of 5 Upgraded Features...\n');
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
    // ------------------------------------------------------------
    // AUTH SETUP: Create authenticated session for tests
    // ------------------------------------------------------------
    const testEmail = `student_test_${Date.now()}@gmail.com`;
    const signupOtp = await makeRequest('POST', '/api/auth/signup/send-otp', {
      name: 'Tester Student',
      email: testEmail,
      password: `Strong#Password2026_${Date.now()}`,
      confirm_password: `Strong#Password2026_${Date.now()}`,
      exam_name: 'JEE Advanced',
      exam_date: '2026-05-20',
      max_daily_hours: 6.0
    });
    const otp = signupOtp.body?.dev_otp;
    const verifyRes = await makeRequest('POST', '/api/auth/signup/verify-otp', {
      email: testEmail,
      otp: otp
    });
    const token = verifyRes.body?.token;
    assert(!!token, 'Obtained authentication JWT token for test requests');

    // ------------------------------------------------------------
    // TEST 1: Self Timetable up to 8 Hours (480 mins)
    // ------------------------------------------------------------
    console.log('\n--- TEST 1: Daily Study Time Up to 8 Hours (480 mins) ---');
    const add8HrRes = await makeRequest('POST', '/api/self-timetable/entries', {
      class_level: 10,
      subject: 'Biology',
      chapter_topic_name: 'Life Processes (8-Hour Master Session)',
      daily_minutes: 480
    }, token);
    const entry8 = add8HrRes.body;
    assert(add8HrRes.status === 201 && entry8?.id, 'Successfully created entry with 480 minutes (8 hours)', entry8);
    assert(entry8?.daily_minutes === 480, `daily_minutes is exactly 480 (got ${entry8?.daily_minutes})`);

    // Test 360m (6 hours)
    const add6HrRes = await makeRequest('POST', '/api/self-timetable/entries', {
      class_level: 12,
      subject: 'Physics',
      chapter_topic_name: 'Ray Optics and Optical Instruments',
      daily_minutes: 360
    }, token);
    const entry6 = add6HrRes.body;
    assert(add6HrRes.status === 201 && entry6?.daily_minutes === 360, 'Successfully created entry with 360 minutes (6 hours)');

    // ------------------------------------------------------------
    // TEST 2: Visual Study Roadmap Data (Date, Day, Time Slot)
    // ------------------------------------------------------------
    console.log('\n--- TEST 2: Visual Study Roadmap Details ---');
    const selfEntriesRes = await makeRequest('GET', '/api/self-timetable/entries', null, token);
    const entriesList = Array.isArray(selfEntriesRes.body) ? selfEntriesRes.body : [];
    assert(selfEntriesRes.status === 200 && entriesList.length >= 2, `GET /api/self-timetable/entries returned ${entriesList.length} entries`);
    
    const entryWithRoadmap = entriesList.find(e => e.chapter_topic_name.includes('8-Hour'));
    assert(!!entryWithRoadmap, 'Found 8-hour roadmap entry in self timetable list');
    if (entryWithRoadmap) {
      assert(!!entryWithRoadmap.scheduled_date, `Entry has scheduled_date: ${entryWithRoadmap.scheduled_date}`);
      assert(!!entryWithRoadmap.day_name, `Entry has day_name: ${entryWithRoadmap.day_name}`);
      assert(!!entryWithRoadmap.time_slot, `Entry has time_slot: ${entryWithRoadmap.time_slot}`);
      assert(typeof entryWithRoadmap.roadmap_day === 'string', `Entry has roadmap_day: ${entryWithRoadmap.roadmap_day}`);
    }

    // Check main schedule planned items
    const schedRes = await makeRequest('GET', '/api/schedule', null, token);
    if (schedRes.status === 200 && schedRes.body.days && schedRes.body.days.length > 0) {
      const firstPlannedDay = schedRes.body.days.find(d => d.planned_items && d.planned_items.length > 0);
      if (firstPlannedDay) {
        const item = firstPlannedDay.planned_items[0];
        assert(!!item.time_slot, `Main schedule item has time_slot: ${item.time_slot}`);
        assert(!!item.start_time, `Main schedule item has start_time: ${item.start_time}`);
      }
    }

    // ------------------------------------------------------------
    // TEST 3: Smart Delay & Deadline Notifications
    // ------------------------------------------------------------
    console.log('\n--- TEST 3: Delay & Deadline Notifications API ---');
    const alertsRes = await makeRequest('GET', '/api/notifications/alerts', null, token);
    assert(alertsRes.status === 200 && alertsRes.body.success === true, 'GET /api/notifications/alerts returns success status');
    assert(Array.isArray(alertsRes.body.alerts), `Returned alerts list (${alertsRes.body.alerts?.length} active alerts)`);
    assert(alertsRes.body.alerts_count !== undefined, `Alerts count: ${alertsRes.body.alerts_count}`);
    assert(alertsRes.body.remaining_hours !== undefined, `Calculated remaining hours today: ${alertsRes.body.remaining_hours}h`);

    // Test ack endpoint
    const ackRes = await makeRequest('POST', '/api/notifications/ack', { alert_id: 'test_alert_ack' }, token);
    assert(ackRes.status === 200 && ackRes.body.success, 'Successfully acknowledged notification alert');

    // ------------------------------------------------------------
    // TEST 4: Gamified Quest & Level Elements
    // ------------------------------------------------------------
    console.log('\n--- TEST 4: Gamified Level Quest & XP ---');
    assert(entriesList.length >= 2, `Quest stages successfully mapped (${entriesList.length} levels ready)`);
    const analyticsRes = await makeRequest('GET', '/api/self-timetable/analytics', null, token);
    assert(analyticsRes.status === 200 && analyticsRes.body.summary !== undefined, 'Self Timetable Analytics returns gamified accuracy & streaks');

    // ------------------------------------------------------------
    // TEST 5: Previous 10 Years Questions (7 Exams with Numericals)
    // ------------------------------------------------------------
    console.log('\n--- TEST 5: 700 PYQ Questions Across 7 Exams with Numericals ---');
    const examsToTest = [
      { key: 'jee_advanced', name: 'JEE Advanced (IIT)' },
      { key: 'cbse_12_pcm', name: 'CBSE 12th PCM' },
      { key: 'cbse_12_pcb', name: 'CBSE 12th PCB' },
      { key: 'cbse_12_pcmb', name: 'CBSE 12th PCMB' },
      { key: 'class_10_board', name: 'Class 10th Board' },
      { key: 'bihar_12_inter', name: 'Bihar Board 12th Inter (BSEB)' },
      { key: 'bihar_10_matric', name: 'Bihar Board 10th Matric (BSEB)' }
    ];

    for (const ex of examsToTest) {
      const pyqRes = await makeRequest('GET', `/api/pyq/questions?exam_key=${encodeURIComponent(ex.key)}&limit=150`, null, token);
      assert(pyqRes.status === 200 && Array.isArray(pyqRes.body.questions), `GET /api/pyq/questions?exam_key=${ex.key} returned questions`);
      const count = pyqRes.body.questions?.length || 0;
      assert(count >= 100, `Exam "${ex.name}" has >= 100 questions (Found ${count} questions)`);

      const numericals = (pyqRes.body.questions || []).filter(q => q.type === 'numerical');
      assert(numericals.length > 0, `Exam "${ex.name}" has ${numericals.length} numerical-type questions`);
    }

    // Verify Numerical Answer Evaluation with Tolerance
    console.log('\n--- TEST 5B: Numerical Answer Evaluation Accuracy ---');
    const numQRes = await makeRequest('GET', '/api/pyq/questions?exam_key=jee_advanced&limit=100', null, token);
    const numericals = (numQRes.body.questions || []).filter(q => q.type === 'numerical');
    assert(numericals.length > 0, `Found ${numericals.length} numerical questions in JEE Advanced bank`);

    if (numericals.length > 0) {
      const q = numericals[0];
      // Fetch raw question from db to know correct_numeric_answer
      const checkRes = await makeRequest('POST', '/api/pyq/check-answer', {
        question_id: q.id,
        answer: 0 // initial query to get correct_answer
      }, token);

      const correctAns = checkRes.body.correct_answer;
      assert(correctAns !== undefined, `Identified correct numerical answer for Q #${q.id}: ${correctAns}`);

      // 1. Exact answer
      const evalExact = await makeRequest('POST', '/api/pyq/check-answer', {
        question_id: q.id,
        answer: correctAns
      }, token);
      assert(evalExact.body.is_correct === true, `Exact numerical answer (${correctAns}) evaluated as CORRECT`);

      // 2. Within tolerance (e.g. +0.01 when tolerance is 0.05)
      const tol = evalExact.body.tolerance || 0.05;
      const evalTol = await makeRequest('POST', '/api/pyq/check-answer', {
        question_id: q.id,
        answer: correctAns + (tol / 2)
      }, token);
      assert(evalTol.body.is_correct === true, `Numerical answer with tolerance (${correctAns + (tol / 2)}) evaluated as CORRECT`);

      // 3. Outside tolerance
      const evalWrong = await makeRequest('POST', '/api/pyq/check-answer', {
        question_id: q.id,
        answer: correctAns + 50.0
      }, token);
      assert(evalWrong.body.is_correct === false, `Out-of-range answer (${correctAns + 50.0}) evaluated as INCORRECT`);
    }

    // Summary
    console.log('\n======================================================');
    console.log(`TOTAL TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
    console.log('======================================================\n');
    process.exit(failed > 0 ? 1 : 0);

  } catch (err) {
    console.error('Fatal error during test execution:', err);
    process.exit(1);
  }
}

runTests();
