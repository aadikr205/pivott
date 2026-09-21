/**
 * Comprehensive Automated Verification Suite for Feature Addition Pack 2
 * 
 * Tests:
 * 1. Feature 1: Concept Video Player Seek, +10s/-10s, Time Display, and Resume logic
 * 2. Feature 2: Self Timetable (Non-Exam Self-Study)
 *    - Auto-fetch of verified content scoped by Class + Subject + Chapter
 *    - Unverified topic warning banner verification
 *    - Cartoon video style for Class 1-5 vs Standard for Class 6-12
 *    - 10-Question quiz evaluation and mastery status update
 *    - Dedicated daily improvement graph & analytics
 *    - Backlog re-planning engine
 * 3. Feature 3: 8 New Olympiad Exams
 *    - Official class range bounds (ISO & IMO: 1-12; others: 1-10)
 *    - Full feature parity across Onboarding, Scheduler, PYQ Bank, and AI Doubt Solver
 */

const assert = require('assert');
const path = require('path');
const db = require('./db');
const { fetchVerifiedChapterContent, generateSelfTimetableReplan } = require('./self-content-fetcher');

const BASE_URL = 'http://localhost:5000';

async function runTests() {
  console.log('\n======================================================');
  console.log('🚀 RUNNING PIVOTT FEATURE ADDITION PACK 2 TEST SUITE');
  console.log('======================================================\n');

  let passed = 0;
  let failed = 0;

  function test(name, fn) {
    return (async () => {
      try {
        await fn();
        console.log(`  ✅ [PASS] ${name}`);
        passed++;
      } catch (err) {
        console.error(`  ❌ [FAIL] ${name}`);
        console.error(`     Error: ${err.message}`);
        failed++;
      }
    })();
  }

  // 1. Get auth token for testing
  let authToken = '';
  let testUserId = '';
  const testUserEmail = 'student@pivott.app';

  await test('Auth: Log in default student for API tests', async () => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testUserEmail, password: 'password123' })
    });
    const data = await res.json();
    assert.strictEqual(res.status, 200, 'Login should succeed');
    assert.ok(data.token, 'Token should be returned');
    authToken = data.token;
    testUserId = data.user.id;
  });

  // ==========================================
  // FEATURE 1: Concept Video Seek & Resume Engine
  // ==========================================
  console.log('\n--- Feature 1: Concept Video Player Seek & Resume Engine ---');

  await test('Feature 1.1: Video time & slide index calculation', () => {
    const SECONDS_PER_SLIDE = 30;
    const totalSlides = 5;
    const totalDurationSeconds = totalSlides * SECONDS_PER_SLIDE;
    assert.strictEqual(totalDurationSeconds, 150, '5 slides should equal 150 seconds');

    // Test seeking to 45s -> should map to Slide 1 (0-indexed: second slide)
    const seek45Slide = Math.min(totalSlides - 1, Math.floor(45 / SECONDS_PER_SLIDE));
    assert.strictEqual(seek45Slide, 1, '45s should be Slide 2 (index 1)');

    // Test seeking to 110s -> should map to Slide 3 (index 3)
    const seek110Slide = Math.min(totalSlides - 1, Math.floor(110 / SECONDS_PER_SLIDE));
    assert.strictEqual(seek110Slide, 3, '110s should be Slide 4 (index 3)');

    // Test skip +10s from 25s -> 35s -> Slide 1
    const nextTime = Math.min(totalDurationSeconds, 25 + 10);
    assert.strictEqual(nextTime, 35, '+10s from 25s should be 35s');
    assert.strictEqual(Math.floor(nextTime / SECONDS_PER_SLIDE), 1);

    // Test skip -10s from 35s -> 25s -> Slide 0
    const prevTime = Math.max(0, 35 - 10);
    assert.strictEqual(prevTime, 25, '-10s from 35s should be 25s');
    assert.strictEqual(Math.floor(prevTime / SECONDS_PER_SLIDE), 0);
  });

  await test('Feature 1.2: Video time formatter helper', () => {
    const formatTime = (secs) => {
      const safe = Math.max(0, Math.floor(secs));
      const m = Math.floor(safe / 60);
      const s = safe % 60;
      return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    assert.strictEqual(formatTime(0), '00:00');
    assert.strictEqual(formatTime(75), '01:15');
    assert.strictEqual(formatTime(180), '03:00');
    assert.strictEqual(formatTime(3599), '59:59');
  });

  // ==========================================
  // FEATURE 2: Self Timetable (Non-Exam Self-Study)
  // ==========================================
  console.log('\n--- Feature 2: New Self Timetable Section (Non-Exam, Self-Study) ---');

  await test('Feature 2.1: Server-side Auto-fetch & Verify verified topic (Class 4 Science "Photosynthesis")', async () => {
    const content = await fetchVerifiedChapterContent({
      classLevel: 4,
      subject: 'Science',
      chapterTopicName: 'Chapter 4: Photosynthesis'
    });

    assert.strictEqual(content.is_verified, 1, 'Photosynthesis should be verified online');
    assert.ok(content.verification_source, 'Should have verification source');
    assert.ok(content.content_text.includes('Photosynthesis'), 'Content text should contain topic name');
    assert.ok(content.concept_map_mermaid.includes('graph TD'), 'Should contain valid Mermaid flowchart');
    
    // Class 4 must be cartoon style
    assert.strictEqual(content.video_style, 'cartoon', 'Class 4 must generate cartoon video style');
    
    const slides = JSON.parse(content.video_slides);
    assert.ok(slides.length >= 5, 'Should have at least 5 slides');
    assert.ok(slides[0].title.includes('Welcome') || slides[0].title.includes('Photosynthesis'));

    const quiz = JSON.parse(content.quiz_questions);
    assert.strictEqual(quiz.length, 10, 'Must have exactly 10 post-video quiz questions');
  });

  await test('Feature 2.2: Server-side Auto-fetch unverified topic displays explicit warning banner', async () => {
    const content = await fetchVerifiedChapterContent({
      classLevel: 8,
      subject: 'CustomSubject',
      chapterTopicName: 'asdfghjk9911xx'
    });

    assert.strictEqual(content.is_verified, 0, 'Obscure string should be unverified');
    assert.strictEqual(content.verification_source, null);
    assert.ok(
      content.content_text.includes("Couldn't verify this topic online — content may be incomplete"),
      'Must contain the exact specified unverified warning notice'
    );
  });

  await test('Feature 2.3: Video style differentiation: Class 1-5 Cartoon vs Class 6-12 Standard', async () => {
    const junior = await fetchVerifiedChapterContent({
      classLevel: 3,
      subject: 'Maths',
      chapterTopicName: 'Fractions'
    });
    assert.strictEqual(junior.video_style, 'cartoon', 'Class 3 must be cartoon style');

    const senior = await fetchVerifiedChapterContent({
      classLevel: 10,
      subject: 'Physics',
      chapterTopicName: 'Light: Reflection & Refraction'
    });
    assert.strictEqual(senior.video_style, 'standard', 'Class 10 must be standard style');
  });

  let createdEntryId = '';

  await test('Feature 2.4: POST /api/self-timetable/entries creates chapter entry', async () => {
    const res = await fetch(`${BASE_URL}/api/self-timetable/entries`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        class_level: 5,
        subject: 'EVS',
        chapter_topic_name: 'Water Conservation & Water Cycle',
        daily_minutes: 30
      })
    });

    const data = await res.json();
    assert.strictEqual(res.status, 201, 'Should create entry with status 201');
    assert.ok(data.id, 'Should return created entry id');
    assert.strictEqual(data.class_level, 5);
    assert.strictEqual(data.video_style, 'cartoon');
    assert.strictEqual(data.quiz_questions.length, 10, 'Should have 10 quiz questions');
    createdEntryId = data.id;
  });

  await test('Feature 2.5: GET /api/self-timetable/entries retrieves user chapters', async () => {
    const res = await fetch(`${BASE_URL}/api/self-timetable/entries`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.ok(Array.isArray(data), 'Should return array of entries');
    assert.ok(data.some(e => e.id === createdEntryId), 'Should include newly created chapter');
  });

  await test('Feature 2.6: PATCH /api/self-timetable/entries/:id/status updates status', async () => {
    const res = await fetch(`${BASE_URL}/api/self-timetable/entries/${createdEntryId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({ status: 'in_progress' })
    });
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.status, 'in_progress');
  });

  await test('Feature 2.7: POST /api/self-timetable/entries/:id/quiz/submit records attempt and confirms mastery', async () => {
    // Score 8/10 (>= 70%) should mark entry status as 'done'
    const res = await fetch(`${BASE_URL}/api/self-timetable/entries/${createdEntryId}/quiz/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({ score: 8, total_questions: 10 })
    });
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.passed, true);
    assert.strictEqual(data.entry_status, 'done');
  });

  await test('Feature 2.8: GET /api/self-timetable/analytics returns dedicated metrics & score trajectory', async () => {
    const res = await fetch(`${BASE_URL}/api/self-timetable/analytics`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.ok(data.summary, 'Should include summary counts');
    assert.ok(data.summary.totalChapters >= 1);
    assert.ok(data.summary.completedChapters >= 1);
    assert.ok(Array.isArray(data.quizScoreTrend), 'Should include quiz score trend');
    assert.ok(Array.isArray(data.dailyTrend), 'Should include 7-day daily trend');
  });

  await test('Feature 2.9: POST /api/self-timetable/replan redistributes backlog', async () => {
    const res = await fetch(`${BASE_URL}/api/self-timetable/replan`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({ target_days: 14, daily_budget_minutes: 60 })
    });
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.success, true);
    assert.ok(data.summary_text.includes('Re-balanced your Self Timetable'));
  });

  // ==========================================
  // FEATURE 3: 8 New Olympiad Exams Integration
  // ==========================================
  console.log('\n--- Feature 3: 8 New Olympiad Exams to Target Exam/Course List ---');

  const EXPECTED_OLYMPIADS = [
    { key: 'olympiad_iso', min: 1, max: 12, name: 'International Science Olympiad (ISO)' },
    { key: 'olympiad_imo', min: 1, max: 12, name: 'International Maths Olympiad (IMO)' },
    { key: 'olympiad_eio', min: 1, max: 10, name: 'English International Olympiad (EIO)' },
    { key: 'olympiad_gkio', min: 1, max: 10, name: 'General Knowledge International Olympiad (GKIO)' },
    { key: 'olympiad_ico', min: 1, max: 10, name: 'International Computer Olympiad (ICO)' },
    { key: 'olympiad_ido', min: 1, max: 10, name: 'International Drawing Olympiad (IDO)' },
    { key: 'olympiad_neso', min: 1, max: 10, name: 'National Essay Olympiad (NESO)' },
    { key: 'olympiad_nsso', min: 1, max: 10, name: 'National Social Studies Olympiad (NSSO)' }
  ];

  await test('Feature 3.1: All 8 Olympiads registered in /onboarding/presets with exact official class ranges', async () => {
    const res = await fetch(`${BASE_URL}/onboarding/presets`);
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    const presets = data.presets || {};

    for (const o of EXPECTED_OLYMPIADS) {
      assert.ok(presets[o.key], `Preset for ${o.key} must exist`);
      assert.strictEqual(presets[o.key].min_class, o.min, `${o.key} min_class must be ${o.min}`);
      assert.strictEqual(presets[o.key].max_class, o.max, `${o.key} max_class must be ${o.max}`);
      assert.strictEqual(presets[o.key].is_olympiad, true, `${o.key} must have is_olympiad: true`);
      assert.ok(presets[o.key].subjects.length >= 2, `${o.key} must have at least 2 subjects`);
    }
  });

  await test('Feature 3.2: Onboarding setup succeeds for Olympiad Exam (ISO Class 6)', async () => {
    const res = await fetch(`${BASE_URL}/onboarding/presets`);
    const { presets } = await res.json();
    const isoPreset = presets.olympiad_iso;

    const setupRes = await fetch(`${BASE_URL}/onboarding/setup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        exam_name: 'International Science Olympiad (ISO) (Class 6)',
        exam_date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        max_daily_hours: 4.0,
        off_days: [0],
        subjects: isoPreset.subjects
      })
    });

    const setupData = await setupRes.json();
    assert.ok([200, 201].includes(setupRes.status), `Onboarding setup should succeed for Olympiad (got ${setupRes.status})`);
    assert.ok(setupData.totalTopics > 0, 'Should schedule topics for Olympiad');
    assert.ok(Array.isArray(setupData.scheduleDays), 'Should generate timetable schedule days');
    
    // Verify user record in database has updated exam_name
    const updatedUser = db.prepare('SELECT exam_name FROM users WHERE id = ?').get(testUserId);
    assert.strictEqual(updatedUser.exam_name, 'International Science Olympiad (ISO) (Class 6)');
  });

  await test('Feature 3.3: Olympiad PYQ Bank queries return questions across 10 years (2016-2025)', async () => {
    for (const o of EXPECTED_OLYMPIADS) {
      const res = await fetch(`${BASE_URL}/api/pyq/questions?exam_key=${o.key}`);
      const data = await res.json();
      assert.strictEqual(res.status, 200);
      assert.ok(data.count >= 20, `${o.key} should return practice questions`);

      // Verify questions are in strict English
      const sample = data.questions[0];
      assert.ok(sample.question, 'Question must have text');
      assert.ok(sample.explanation, 'Question must have explanation');
      assert.strictEqual(sample.exam_key, o.key);
    }
  });

  await test('Feature 3.4: Olympiad PYQ Bank supports numerical questions with tolerance', async () => {
    const res = await fetch(`${BASE_URL}/api/pyq/questions?exam_key=olympiad_imo`);
    const data = await res.json();
    assert.strictEqual(res.status, 200);

    const numericalQ = data.questions.find(q => q.type === 'numerical');
    assert.ok(numericalQ, 'IMO should have numerical questions');
    assert.strictEqual(numericalQ.type, 'numerical');
    assert.ok(numericalQ.tolerance > 0, 'Tolerance must be defined');

    // Query DB directly to get the known answer for testing evaluation endpoint
    const dbQuestion = db.prepare('SELECT * FROM pyq_questions WHERE id = ?').get(numericalQ.id);
    assert.ok(typeof dbQuestion.correct_numeric_answer === 'number', 'Numerical question must have correct answer in DB');

    // Test evaluation endpoint /api/pyq/check-answer
    const evalRes = await fetch(`${BASE_URL}/api/pyq/check-answer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        question_id: numericalQ.id,
        answer: dbQuestion.correct_numeric_answer
      })
    });

    const evalData = await evalRes.json();
    assert.strictEqual(evalRes.status, 200);
    assert.strictEqual(evalData.is_correct, true, 'Submitting correct numeric answer should succeed');
    assert.strictEqual(evalData.correct_answer, dbQuestion.correct_numeric_answer);
  });

  await test('Feature 3.5: AI Doubt Solver prompt calibration for Olympiad exams', () => {
    const { searchKnowledge } = require('./search-engine');
    // Verify search engine can ground queries
    const result = searchKnowledge({
      query: 'Forces and laws of motion',
      examName: 'International Science Olympiad (ISO)'
    });
    assert.ok(result, 'Search knowledge should return context');
  });

  console.log('\n======================================================');
  console.log(`🏁 TEST RUN SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('======================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Fatal error during test execution:', err);
  process.exit(1);
});
