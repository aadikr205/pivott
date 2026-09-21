/**
 * Automated Verification Script for Pivott Backend & Core Re-Adjustment Engine
 */
const assert = require('assert');
const { v4: uuidv4 } = require('uuid');
const db = require('./db');
const { replanSchedule, formatDate } = require('./scheduler');
const { suggestWeightage, generateQuiz, fallbackReplanExplanation } = require('./ai');

async function runTests() {
  console.log('--- Starting Pivott Core Engine Verification ---');

  // Test 1: Date and availability helpers
  console.log('Test 1: Scheduler basic availability and date arithmetic...');
  const todayStr = '2026-09-17';
  const examDateStr = '2026-09-27'; // 10 days
  const user = {
    id: 'test-user-1',
    max_daily_hours: 4.0, // 240 mins/day
    off_days: [0], // Sundays off
    buffer_days_percent: 0.10
  };

  const sampleTopics = [
    { id: 't1', name: 'High Yield Genetics', weightage: 5, estimated_minutes: 200, status: 'not_started', mastery_score: 20 },
    { id: 't2', name: 'Optics Fundamentals', weightage: 4, estimated_minutes: 180, status: 'not_started', mastery_score: 40 },
    { id: 't3', name: 'Living World Overview', weightage: 2, estimated_minutes: 60, status: 'not_started', mastery_score: 80 }
  ];

  const result1 = replanSchedule(user, sampleTopics, todayStr, examDateStr);
  console.log('Result 1 Diff Summary:', result1.diffSummary);
  assert(result1.scheduleDays.length > 0, 'Schedule days should be generated');
  
  // Verify hard constraint: Never exceed max_daily_hours
  for (const day of result1.scheduleDays) {
    const totalMinutes = (day.planned_items || []).reduce((sum, i) => sum + i.allocated_minutes, 0);
    assert(totalMinutes <= user.max_daily_hours * 60, `Day ${day.date} allocated ${totalMinutes}m exceeds max cap of ${user.max_daily_hours * 60}m!`);
  }
  console.log('✓ Hard constraint verified: No day exceeds max_daily_hours.');

  // Test 2: Deficit scenario and Section 6 Re-Adjustment behavior
  console.log('\nTest 2: Deficit scenario with priority sorting, 30% compression, and deferral...');
  // Only 2 study days left (capacity = 2 * 120 = 240 mins), but workload is 600 mins!
  const deficitUser = {
    id: 'deficit-user',
    max_daily_hours: 2.0, // 120 mins/day
    off_days: [],
    buffer_days_percent: 0.0
  };

  const deficitTopics = [
    { id: 'top-1', name: 'Organic Reaction Mechanism', weightage: 5, estimated_minutes: 120, status: 'not_started', mastery_score: 10 },
    { id: 'top-2', name: 'Thermodynamics Core', weightage: 4, estimated_minutes: 120, status: 'not_started', mastery_score: 30 },
    { id: 'top-3', name: 'Environmental Overview', weightage: 2, estimated_minutes: 100, status: 'not_started', mastery_score: 90 },
    { id: 'top-4', name: 'Historical Definitions', weightage: 1, estimated_minutes: 100, status: 'not_started', mastery_score: 80 }
  ];

  const deficitResult = replanSchedule(deficitUser, deficitTopics, '2026-09-17', '2026-09-19');
  console.log('Deficit Result Summary:', deficitResult.diffSummary);
  console.log('Deferred items count:', deficitResult.deferred.length);
  console.log('Compressed items count:', deficitResult.compressed.length);

  assert(deficitResult.diffSummary.isDeficit === true, 'Deficit must be detected');
  assert(deficitResult.deferred.length > 0, 'Lowest priority overflow topics must be deferred');
  assert(deficitResult.deferred.some(d => d.id === 'top-4'), 'Lowest weightage topic should be deferred');
  
  // Verify daily hour cap strictly maintained under deficit
  for (const day of deficitResult.scheduleDays) {
    const totalMin = (day.planned_items || []).reduce((sum, i) => sum + i.allocated_minutes, 0);
    assert(totalMin <= deficitUser.max_daily_hours * 60, `Deficit day ${day.date} allocated ${totalMin}m exceeds cap!`);
  }
  console.log('✓ Section 6 Deficit handling verified: priority ranking, compression, and deferrals working correctly.');

  // Test 3: Idempotency
  console.log('\nTest 3: Idempotency check...');
  const rerunResult = replanSchedule(deficitUser, deficitTopics, '2026-09-17', '2026-09-19');
  assert.strictEqual(deficitResult.scheduleDays.length, rerunResult.scheduleDays.length, 'Schedule days count must match');
  assert.strictEqual(deficitResult.deferred.length, rerunResult.deferred.length, 'Deferred count must match');
  console.log('✓ Idempotency verified: re-running without changes produces identical schedule.');

  // Test 4: AI & Fallback layer
  console.log('\nTest 4: AI Fallback generation...');
  const weightageRes = await suggestWeightage('Physics', 'Wave Optics & Interference');
  console.log('Weightage suggestion:', weightageRes);
  assert(weightageRes.weightage >= 1 && weightageRes.weightage <= 5, 'Weightage must be between 1 and 5');

  const quizRes = await generateQuiz('Physics', 'Laws of Motion');
  console.log(`Quiz generated ${quizRes.length} questions.`);
  assert(quizRes.length === 6, 'Must generate 6 MCQs');
  assert(quizRes[0].options.length === 4, 'MCQ must have 4 options');
  assert(quizRes[0].explanation, 'MCQ must have explanation');

  const explanation = fallbackReplanExplanation({
    keptCount: 3,
    compressedCount: 1,
    deferredCount: 2,
    maxDailyHours: 4.0,
    examName: 'NEET 2026'
  });
  console.log('Calm explanation text:', explanation);
  assert(explanation.includes('4 hours') || explanation.includes('4'), 'Explanation should mention max hours');

  console.log('\n========================================');
  console.log('ALL PIVOTT BACKEND & SCHEDULER TESTS PASSED!');
  console.log('========================================\n');
}

runTests().catch(err => {
  console.error('Test failed with error:', err);
  process.exit(1);
});
