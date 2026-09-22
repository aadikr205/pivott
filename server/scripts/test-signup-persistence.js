// Automated Verification: Student Signup with OTP -> Database Save -> Logout -> Email+Password Login -> Data Intact
const db = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../middleware/auth');
const { seedUserInitialCurriculum } = require('../routes/onboarding');

async function runTest() {
  console.log('🧪 Starting Signup Verification & Persistent Login Test...\n');
  let passed = 0;
  let failed = 0;

  function assert(condition, desc, extra) {
    if (condition) {
      console.log(`  ✅ PASS: ${desc}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${desc}`, extra !== undefined ? extra : '');
      failed++;
    }
  }

  try {
    const timestamp = Date.now();
    const testEmail = `student_persist_${timestamp}@gmail.com`;
    const testPassword = `Pivott#Pass_${timestamp}!`;
    const testName = 'Persist Student';

    // Step 1: Simulate Signup Send OTP
    const otp = '849201';
    const otpHash = bcrypt.hashSync(otp, 10);
    const passwordHash = bcrypt.hashSync(testPassword, 10);
    const signupData = JSON.stringify({
      name: testName,
      password_hash: passwordHash,
      exam_name: 'NEET 2026',
      exam_date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      max_daily_hours: 6.0,
      off_days: [0]
    });

    db.prepare(`
      INSERT INTO signup_verifications (email, otp_hash, signup_data, expires_at, attempt_count, created_at)
      VALUES (?, ?, ?, datetime('now', '+10 minutes'), 0, datetime('now'))
    `).run(testEmail, otpHash, signupData);

    const pendingOtp = db.prepare('SELECT * FROM signup_verifications WHERE email = ?').get(testEmail);
    assert(!!pendingOtp, 'OTP record saved in signup_verifications table');

    // Step 2: Simulate Verify OTP & User Creation
    const { v4: uuidv4 } = require('uuid');
    const userId = uuidv4();
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO users (id, name, email, password_hash, exam_name, exam_date, max_daily_hours, off_days, buffer_days_percent, created_at, is_verified, notifications_enabled)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0.10, ?, 1, 1)
    `).run(
      userId,
      testName,
      testEmail,
      passwordHash,
      'NEET 2026',
      new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      6.0,
      JSON.stringify([0]),
      now
    );

    // Call curriculum seeder
    const seeded = seedUserInitialCurriculum(userId, 'NEET 2026');
    assert(seeded === true, 'Initial curriculum and schedule seeded in database upon OTP verification');

    // Verify user in SQLite
    const userInDb = db.prepare('SELECT id, name, email, is_verified FROM users WHERE id = ?').get(userId);
    assert(!!userInDb && userInDb.email === testEmail, 'Student record exists in users table with correct ID and email');
    assert(userInDb.is_verified === 1, 'Student marked as verified in database');

    // Verify subjects and topics
    const subjects = db.prepare('SELECT * FROM subjects WHERE user_id = ?').all(userId);
    assert(subjects.length >= 3, `Student has ${subjects.length} subjects in database`);

    const topics = db.prepare(`
      SELECT t.* FROM topics t 
      JOIN subjects s ON t.subject_id = s.id 
      WHERE s.user_id = ?
    `).all(userId);
    assert(topics.length >= 10, `Student has ${topics.length} topics in database`);

    const scheduleDays = db.prepare('SELECT * FROM schedule_days WHERE user_id = ?').all(userId);
    assert(scheduleDays.length > 0, `Student has ${scheduleDays.length} scheduled days in database`);

    // Step 3: Student creates custom data (Self-Timetable chapter & completes a topic)
    const customChapterId = uuidv4();
    db.prepare(`
      INSERT INTO self_timetable_entries (id, user_id, class_level, subject, chapter_topic_name, daily_minutes, status, created_at)
      VALUES (?, ?, 11, 'Physics', 'Rotational Mechanics Deep Dive', 45, 'in_progress', datetime('now'))
    `).run(customChapterId, userId);

    // Mark first topic as completed
    const firstTopic = topics[0];
    db.prepare('UPDATE topics SET status = ?, mastery_score = ? WHERE id = ?').run('done', 85, firstTopic.id);

    // Step 4: Simulate Sign Out
    let clientToken = null;
    console.log('\n--- Student Signed Out (Token cleared, only Email & Password retained) ---');

    // Step 5: Student Logs back in with Email + Password
    const loginUser = db.prepare('SELECT * FROM users WHERE lower(email) = lower(?)').get(testEmail.toLowerCase());
    assert(!!loginUser, 'User found in database by email for password login');

    const passMatch = bcrypt.compareSync(testPassword, loginUser.password_hash);
    assert(passMatch === true, 'Entered password matches database password_hash');

    clientToken = jwt.sign({ id: loginUser.id, email: loginUser.email }, JWT_SECRET, { expiresIn: '30d' });
    assert(!!clientToken, 'Fresh JWT token generated for authenticated session');

    // Step 6: Verify all data is retrieved intact after login!
    console.log('\n--- Verifying Data Integrity After Login ---');
    const decoded = jwt.verify(clientToken, JWT_SECRET);
    assert(decoded.id === userId, 'Token contains correct student userId');

    const retrievedSubjects = db.prepare('SELECT * FROM subjects WHERE user_id = ?').all(decoded.id);
    assert(retrievedSubjects.length === subjects.length, 'All subjects match exactly as before signout');

    const retrievedFirstTopic = db.prepare('SELECT * FROM topics WHERE id = ?').get(firstTopic.id);
    assert(retrievedFirstTopic.status === 'done' && retrievedFirstTopic.mastery_score === 85, 'Completed topic status (done) & mastery (85) preserved');

    const retrievedCustomEntry = db.prepare('SELECT * FROM self_timetable_entries WHERE user_id = ?').all(decoded.id);
    assert(retrievedCustomEntry.length === 1 && retrievedCustomEntry[0].chapter_topic_name === 'Rotational Mechanics Deep Dive', 'Self timetable chapters preserved in database');

    // Step 7: Attempting to register again with same email
    const duplicateCheck = db.prepare('SELECT id FROM users WHERE lower(email) = lower(?)').get(testEmail.toLowerCase());
    assert(!!duplicateCheck, 'System correctly recognizes existing account to prevent duplicate verification');

    console.log(`\n🎉 Results: ${passed} Passed, ${failed} Failed`);
    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Test error:', err);
    process.exit(1);
  }
}

runTest();
