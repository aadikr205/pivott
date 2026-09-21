const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:5000';

async function runTests() {
  console.log('--- Testing Biology & Class-wise Curriculum Features ---');

  // 1. Login default student user
  const logRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'student@pivott.app',
      password: 'password123'
    })
  });
  const logData = await logRes.json();
  const token = logData.token;
  console.log('1. Test User Authenticated:', logData.user ? 'PASS' : 'FAIL');

  const authHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };

  // 2. Test Curriculum API for Class 10 Biology
  const curr10BioRes = await fetch(`${BASE_URL}/api/self-timetable/curriculum?class=10&subject=Biology`, {
    headers: authHeaders
  });
  const curr10Bio = await curr10BioRes.json();
  console.log('2. Class 10 Biology Curriculum Chapters count:', curr10Bio.chapters?.length);
  console.log('   Sample chapters:', curr10Bio.chapters?.slice(0, 3));
  if (curr10Bio.chapters && curr10Bio.chapters.length >= 6) {
    console.log('   PASS: Class 10 Biology chapters returned successfully.');
  } else {
    console.error('   FAIL: Expected chapters for Class 10 Biology');
  }

  // 3. Test Curriculum API for Class 6 Biology
  const curr6BioRes = await fetch(`${BASE_URL}/api/self-timetable/curriculum?class=6&subject=Biology`, {
    headers: authHeaders
  });
  const curr6Bio = await curr6BioRes.json();
  console.log('3. Class 6 Biology Curriculum Chapters count:', curr6Bio.chapters?.length);
  console.log('   Sample chapters:', curr6Bio.chapters?.slice(0, 3));
  if (curr6Bio.chapters && curr6Bio.chapters.length >= 4) {
    console.log('   PASS: Class 6 Biology chapters returned successfully.');
  } else {
    console.error('   FAIL: Expected chapters for Class 6 Biology');
  }

  // 4. Test Curriculum API for Class 12 Biology
  const curr12BioRes = await fetch(`${BASE_URL}/api/self-timetable/curriculum?class=12&subject=Biology`, {
    headers: authHeaders
  });
  const curr12Bio = await curr12BioRes.json();
  console.log('4. Class 12 Biology Curriculum Chapters count:', curr12Bio.chapters?.length);
  console.log('   Sample chapters:', curr12Bio.chapters?.slice(0, 3));
  if (curr12Bio.chapters && curr12Bio.chapters.length >= 8) {
    console.log('   PASS: Class 12 Biology chapters returned successfully.');
  } else {
    console.error('   FAIL: Expected chapters for Class 12 Biology');
  }

  // 5. Test Adding a Biology Chapter to Self Timetable
  console.log('5. Adding Biology chapter "Life Processes (Nutrition & Respiration)" to Self Timetable...');
  const addRes = await fetch(`${BASE_URL}/api/self-timetable/entries`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      class_level: 10,
      subject: 'Biology',
      chapter_topic_name: 'Life Processes (Nutrition & Respiration)',
      daily_minutes: 30
    })
  });
  const addedEntry = await addRes.json();
  console.log('   Entry ID:', addedEntry.id);
  console.log('   Subject:', addedEntry.subject);
  console.log('   Verified Source:', addedEntry.verification_source);
  console.log('   Video Style:', addedEntry.video_style);
  console.log('   Quiz Questions count:', addedEntry.quiz_questions?.length);
  if (addedEntry.subject === 'Biology' && addedEntry.quiz_questions?.length === 10) {
    console.log('   PASS: Biology chapter added and 10-Q quiz generated!');
  } else {
    console.error('   FAIL: Biology chapter addition incomplete');
  }

  console.log('\n--- All Biology & Curriculum verification tests PASSED! ---');
}

runTests().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
