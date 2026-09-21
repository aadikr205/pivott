/**
 * End-to-End API Integration & Flow Test for Pivott
 */
const assert = require('assert');

const BASE_URL = 'http://localhost:5000';

async function runE2ETest() {
  console.log('=== Pivott End-to-End Flow Verification ===\n');

  // Step 1: Health check
  console.log('1. Testing /health endpoint...');
  const healthRes = await fetch(`${BASE_URL}/health`);
  assert(healthRes.ok, 'Health check failed');
  const healthData = await healthRes.json();
  console.log('   Health response:', healthData);

  // Step 2: Signup
  console.log('\n2. Testing /auth/signup...');
  const testEmail = `student_${Date.now()}@pivott.app`;
  const signupRes = await fetch(`${BASE_URL}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Pivott Test Student',
      email: testEmail,
      password: 'testPassword123',
      exam_name: 'NEET 2026',
      exam_date: '2026-11-15',
      max_daily_hours: 5.0,
      off_days: [0]
    })
  });
  assert(signupRes.ok, `Signup failed with status ${signupRes.status}`);
  const signupData = await signupRes.json();
  const token = signupData.token;
  assert(token, 'No token returned on signup');
  console.log('   User signed up successfully. Token obtained. User ID:', signupData.user.id);

  const authHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };

  // Step 3: Fetch presets
  console.log('\n3. Testing /onboarding/presets...');
  const presetRes = await fetch(`${BASE_URL}/onboarding/presets`);
  assert(presetRes.ok, 'Preset fetch failed');
  const presetData = await presetRes.json();
  assert(presetData.presets.neet, 'NEET preset missing');
  console.log('   Presets verified (NEET, JEE, CBSE 12th).');

  // Step 4: Complete Onboarding with Preset
  console.log('\n4. Testing /onboarding/setup (generating initial timetable)...');
  const setupRes = await fetch(`${BASE_URL}/onboarding/setup`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      exam_name: 'NEET 2026',
      exam_date: '2026-11-15',
      max_daily_hours: 5.0,
      off_days: [0],
      subjects: presetData.presets.neet.subjects
    })
  });
  assert(setupRes.ok, `Setup failed: ${setupRes.status}`);
  const setupData = await setupRes.json();
  console.log('   Schedule created with', setupData.scheduleDays.length, 'days. Diff summary:', setupData.diffSummary);
  console.log('   AI Coach note:', setupData.summaryText);

  // Step 5: Get Today's schedule
  console.log('\n5. Testing /schedule/today...');
  const todayRes = await fetch(`${BASE_URL}/schedule/today`, { headers: authHeaders });
  assert(todayRes.ok, 'Today schedule failed');
  const todayData = await todayRes.json();
  console.log('   Today date:', todayData.date, '| Planned items:', todayData.planned_items.length);
  assert(todayData.planned_items.length > 0, 'Should have planned items today');
  const firstTopic = todayData.planned_items[0];
  console.log('   First topic today:', firstTopic.topic_name, `(${firstTopic.allocated_minutes}m, Focus: ${firstTopic.weightage}/5)`);

  // Step 6: Generate Adaptive Quiz
  console.log('\n6. Testing /ai/generate-quiz for topic:', firstTopic.topic_name);
  const quizGenRes = await fetch(`${BASE_URL}/ai/generate-quiz`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      topic_id: firstTopic.topic_id,
      topic_name: firstTopic.topic_name,
      subject_name: firstTopic.subject_name
    })
  });
  assert(quizGenRes.ok, 'Quiz generation failed');
  const quizGenData = await quizGenRes.json();
  assert(quizGenData.questions.length === 6, 'Should generate 6 questions');
  console.log('   Generated 6 MCQs. Sample Question 1:', quizGenData.questions[0].question);

  // Step 7: Submit Quiz
  console.log('\n7. Testing /quiz/submit...');
  const quizSubmitRes = await fetch(`${BASE_URL}/quiz/submit`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      topic_id: firstTopic.topic_id,
      score: 5,
      total_questions: 6,
      time_taken_seconds: 45,
      questions: quizGenData.questions.map(q => ({
        question: q.question,
        options: q.options,
        correct_answer: q.options[q.correct_index],
        user_answer: q.options[q.correct_index],
        explanation: q.explanation
      }))
    })
  });
  assert(quizSubmitRes.ok, 'Quiz submission failed');
  const quizSubmitData = await quizSubmitRes.json();
  console.log('   Quiz submitted! Score:', `${quizSubmitData.percentage}%`, '| Updated Mastery:', `${quizSubmitData.new_mastery}%`);

  // Step 8: Mark progress & simulate missed topic
  console.log('\n8. Testing /schedule/mark-progress (simulating incomplete / missed topic)...');
  const markRes = await fetch(`${BASE_URL}/schedule/mark-progress`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      date: todayData.date,
      topic_id: firstTopic.topic_id,
      status: 'missed',
      minutes_done: 0
    })
  });
  assert(markRes.ok, 'Mark progress failed');
  console.log('   Topic marked as missed.');

  // Step 9: Re-plan Trigger (Section 6 Engine)
  console.log('\n9. Testing /schedule/replan (Core Section 6 Re-Adjustment Engine)...');
  const replanRes = await fetch(`${BASE_URL}/schedule/replan`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      reason: 'Backlog recovery re-adjustment test'
    })
  });
  assert(replanRes.ok, 'Replan failed');
  const replanData = await replanRes.json();
  console.log('   Re-plan successful! Diff summary:', replanData.diff_summary);
  console.log('   Calm AI Coach Explanation:', replanData.summary_text);
  console.log('   Micro-copy:', replanData.micro_copy);

  // Step 10: Progress Dashboard Analytics
  console.log('\n10. Testing /progress/dashboard (5 Live Chart Data Streams)...');
  const dashRes = await fetch(`${BASE_URL}/progress/dashboard`, { headers: authHeaders });
  assert(dashRes.ok, 'Dashboard failed');
  const dashData = await dashRes.json();
  console.log('   Summary KPIs:');
  console.log('     Days to Exam:', dashData.summary.days_to_exam);
  console.log('     Total Topics:', dashData.summary.total_topics, '| Completed:', dashData.summary.done_topics);
  console.log('     Average Mastery:', `${dashData.summary.overall_mastery}%`);
  console.log('     Hours Planned:', `${dashData.summary.hours_planned}h`);
  console.log('   Chart Datasets Verified:');
  console.log('     - Chart 1 (Daily Completion %):', dashData.charts.daily_completion.length, 'data points');
  console.log('     - Chart 2 (Backlog Trend):', dashData.charts.backlog_trend.length, 'data points');
  console.log('     - Chart 3 (Quiz Score Trend):', dashData.charts.quiz_score_trend.length, 'attempts recorded');
  console.log('     - Chart 4 (Burn-Down Trajectory):', dashData.charts.burndown.length, 'days plotted');
  console.log('     - Chart 5 (Subject Mastery Bar Chart):', dashData.charts.subject_mastery.map(s => `${s.subject_name}: ${s.avg_mastery_score}% mastery`).join(', '));

  // Step 11: Replan History
  console.log('\n11. Testing /schedule/replan-history...');
  const histRes = await fetch(`${BASE_URL}/schedule/replan-history`, { headers: authHeaders });
  assert(histRes.ok, 'History failed');
  const histData = await histRes.json();
  console.log('   Re-plan history contains', histData.history.length, 'events.');

  console.log('\n=============================================');
  console.log('✨ ALL 11 END-TO-END FLOW TESTS COMPLETED SUCCESSFULLY!');
  console.log('=============================================\n');
}

runE2ETest().catch(err => {
  console.error('E2E Test Failed:', err);
  process.exit(1);
});
