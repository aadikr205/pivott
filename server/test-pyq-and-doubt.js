const assert = require('assert');
const db = require('./db');
const { solveStudentDoubt } = require('./ai');
const { replanSchedule, getRevisionSuggestions } = require('./scheduler');

async function runTests() {
  console.log('=== Testing PYQ Bank, AI Doubt Solver, & Revision Engine ===\n');

  // Test 1: PYQ Seeding & Database Check
  console.log('1. Checking PYQ Bank in SQLite...');
  const totalPYQ = db.prepare('SELECT COUNT(*) as count FROM pyq_questions').get().count;
  console.log(`   Total PYQs in Database: ${totalPYQ}`);
  assert(totalPYQ >= 15, 'Should have at least 15 seeded PYQs');

  const exams = db.prepare('SELECT DISTINCT exam_key FROM pyq_questions').all().map(e => e.exam_key);
  console.log(`   Exams covered in PYQ Bank:`, exams);
  assert(exams.includes('neet'), 'NEET should be in PYQs');
  assert(exams.includes('jee_main'), 'JEE Main should be in PYQs');
  assert(exams.includes('cbse12'), 'CBSE 12th should be in PYQs');

  // Test 2: AI Doubt Solver Bot
  console.log('\n2. Testing AI Doubt Solver Bot...');
  const doubtRes1 = await solveStudentDoubt({
    doubt: 'Explain Newton third law with action reaction pairs',
    examName: 'NEET 2026',
    subjectName: 'Physics',
    topicName: 'Laws of Motion'
  });
  console.log('   Doubt 1 Concept Summary:', doubtRes1.concept_summary);
  console.log('   Doubt 1 Formula:', doubtRes1.formula_or_rule);
  assert(doubtRes1.concept_summary, 'Must return concept summary');
  assert(doubtRes1.pro_tip, 'Must return pro-tip');
  assert(doubtRes1.formatted_reply.includes('Core Concept'), 'Must contain Core Concept');

  const doubtRes2 = await solveStudentDoubt({
    doubt: 'What is the formula for Carnot engine efficiency?',
    examName: 'JEE Main',
    subjectName: 'Physics',
    topicName: 'Thermodynamics'
  });
  console.log('   Doubt 2 Pro Tip:', doubtRes2.pro_tip);
  assert(doubtRes2.formatted_reply.includes('Carnot'), 'Should mention Carnot');

  // Test 3: High-Weightage Buffer & Early Completion Revision Engine
  console.log('\n3. Testing Buffer & Early Completion Revision Suggestion Engine...');
  const sampleTopics = [
    { id: 't1', name: 'Laws of Motion', weightage: 5, mastery_score: 20, estimated_minutes: 120 },
    { id: 't2', name: 'Optics', weightage: 5, mastery_score: 85, estimated_minutes: 120 },
    { id: 't3', name: 'Thermodynamics', weightage: 4, mastery_score: 30, estimated_minutes: 120 },
    { id: 't4', name: 'Units & Dimensions', weightage: 2, mastery_score: 90, estimated_minutes: 60 }
  ];

  const suggestions = getRevisionSuggestions(sampleTopics, 5);
  console.log(`   Generated ${suggestions.length} revision topic suggestions:`);
  suggestions.forEach(s => {
    console.log(`     Rank ${s.rank}: ${s.topic_name} (Focus: ${s.weightage}/5, Mastery: ${s.mastery_score}%, Priority: ${s.priority})`);
  });

  // Verify that low mastery + high weightage is ranked first
  assert.strictEqual(suggestions[0].topic_name, 'Laws of Motion', 'Weakest high-weightage topic should be Rank 1 for revision');
  assert.strictEqual(suggestions[1].topic_name, 'Thermodynamics', 'Second weakest high-weightage topic should be Rank 2 for revision');

  // Test 4: Replan schedule with early syllabus completion
  console.log('\n4. Testing Schedule allocation when syllabus finishes before exam date...');
  const testUser = {
    id: 'test-early-user',
    max_daily_hours: 4.0, // 240 mins/day
    off_days: [],
    buffer_days_percent: 0.10
  };
  // 10 days available, only 4 topics (workload = 420 mins = less than 2 days capacity!)
  const schedResult = replanSchedule(testUser, sampleTopics, '2026-09-18', '2026-09-28');
  console.log(`   Schedule days produced: ${schedResult.scheduleDays.length}`);
  const revisionDays = schedResult.scheduleDays.filter(d => d.is_revision);
  console.log(`   Days with Revision & PYQ sessions planned: ${revisionDays.length}`);
  assert(revisionDays.length > 0, 'Should have dedicated revision days scheduled for remaining time');
  assert(revisionDays[0].planned_items.length > 0, 'Revision days must have planned high-weightage revision items');
  console.log('   Sample Revision Item:', revisionDays[0].planned_items[0].topic_name, '|', revisionDays[0].planned_items[0].revision_note);

  console.log('\n======================================================');
  console.log('✨ ALL PYQ, AI DOUBT SOLVER, & REVISION TESTS PASSED!');
  console.log('======================================================\n');
}

runTests().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
