const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dataDir = process.env.DATA_DIR || path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'pivott.db');
const db = new Database(dbPath);

// Enable WAL mode and foreign keys for optimal performance and integrity
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Initialize schema
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    exam_name TEXT,
    exam_date TEXT,
    max_daily_hours REAL DEFAULT 6.0,
    off_days TEXT DEFAULT '[0]',
    buffer_days_percent REAL DEFAULT 0.10,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS subjects (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS topics (
    id TEXT PRIMARY KEY,
    subject_id TEXT NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    weightage INTEGER DEFAULT 3,
    estimated_minutes INTEGER DEFAULT 60,
    status TEXT DEFAULT 'not_started',
    mastery_score REAL DEFAULT 0,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS schedule_days (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date TEXT NOT NULL,
    planned_items TEXT DEFAULT '[]',
    actual_completed TEXT DEFAULT '[]',
    is_backlog_day INTEGER DEFAULT 0,
    UNIQUE(user_id, date)
  );

  CREATE TABLE IF NOT EXISTS quiz_attempts (
    id TEXT PRIMARY KEY,
    topic_id TEXT NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date TEXT NOT NULL,
    score REAL NOT NULL,
    total_questions INTEGER NOT NULL,
    time_taken_seconds INTEGER NOT NULL,
    questions TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS replan_logs (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    triggered_at TEXT NOT NULL,
    reason TEXT NOT NULL,
    summary_text TEXT NOT NULL,
    deferred_topics TEXT DEFAULT '[]',
    compressed_topics TEXT DEFAULT '[]',
    diff_summary TEXT DEFAULT '{}'
  );

  CREATE TABLE IF NOT EXISTS pyq_questions (
    id TEXT PRIMARY KEY,
    exam_key TEXT NOT NULL,
    subject TEXT NOT NULL,
    topic TEXT NOT NULL,
    year INTEGER NOT NULL,
    question TEXT NOT NULL,
    options TEXT NOT NULL,
    correct_index INTEGER NOT NULL,
    explanation TEXT NOT NULL,
    weightage INTEGER DEFAULT 4,
    difficulty TEXT DEFAULT 'Medium',
    frequency_score TEXT DEFAULT 'High Frequency',
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS chat_sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    target_exam TEXT NOT NULL,
    title TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS chat_messages (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK(role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS signup_verifications (
    email TEXT PRIMARY KEY,
    otp_hash TEXT NOT NULL,
    signup_data TEXT NOT NULL,
    expires_at TEXT NOT NULL,
    attempt_count INTEGER DEFAULT 0,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS password_resets (
    email TEXT PRIMARY KEY,
    otp_hash TEXT NOT NULL,
    expires_at TEXT NOT NULL,
    attempt_count INTEGER DEFAULT 0,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS activity_logs (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    activity_type TEXT NOT NULL,
    description TEXT NOT NULL,
    metadata TEXT DEFAULT '{}',
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS topic_videos (
    id TEXT,
    topic_id TEXT PRIMARY KEY,
    title TEXT,
    subject_name TEXT,
    slides TEXT,
    quiz_questions TEXT,
    created_at TEXT
  );

  CREATE TABLE IF NOT EXISTS self_timetable_entries (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    class_level INTEGER NOT NULL,
    subject TEXT NOT NULL,
    chapter_topic_name TEXT NOT NULL,
    daily_minutes INTEGER DEFAULT 30,
    content_text TEXT,
    concept_map_mermaid TEXT,
    key_points TEXT,
    video_url TEXT,
    video_style TEXT DEFAULT 'standard',
    video_slides TEXT,
    quiz_questions TEXT,
    status TEXT DEFAULT 'not_started',
    is_verified INTEGER DEFAULT 1,
    verification_source TEXT,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS self_timetable_quiz_attempts (
    id TEXT PRIMARY KEY,
    entry_id TEXT NOT NULL REFERENCES self_timetable_entries(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    score INTEGER NOT NULL,
    total_questions INTEGER NOT NULL,
    date_taken TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS self_timetable_replan_logs (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    triggered_at TEXT NOT NULL,
    summary_text TEXT NOT NULL,
    deferred_entries TEXT DEFAULT '[]'
  );

  CREATE INDEX IF NOT EXISTS idx_subjects_user ON subjects(user_id);
  CREATE INDEX IF NOT EXISTS idx_topics_subject ON topics(subject_id);
  CREATE INDEX IF NOT EXISTS idx_schedule_user_date ON schedule_days(user_id, date);
  CREATE INDEX IF NOT EXISTS idx_quiz_topic ON quiz_attempts(topic_id);
  CREATE INDEX IF NOT EXISTS idx_quiz_user ON quiz_attempts(user_id);
  CREATE INDEX IF NOT EXISTS idx_replan_user ON replan_logs(user_id);
  CREATE INDEX IF NOT EXISTS idx_pyq_exam_year ON pyq_questions(exam_key, year);
  CREATE INDEX IF NOT EXISTS idx_pyq_topic ON pyq_questions(topic);
  CREATE INDEX IF NOT EXISTS idx_chat_sessions_user ON chat_sessions(user_id);
  CREATE INDEX IF NOT EXISTS idx_chat_messages_session ON chat_messages(session_id);
  CREATE INDEX IF NOT EXISTS idx_activity_user_date ON activity_logs(user_id, created_at DESC);
  CREATE INDEX IF NOT EXISTS idx_self_timetable_user ON self_timetable_entries(user_id);
  CREATE INDEX IF NOT EXISTS idx_self_quiz_entry ON self_timetable_quiz_attempts(entry_id);
  CREATE INDEX IF NOT EXISTS idx_self_quiz_user ON self_timetable_quiz_attempts(user_id);
  CREATE INDEX IF NOT EXISTS idx_self_replan_user ON self_timetable_replan_logs(user_id);
`);

// Safe migrations to add new columns to existing tables
function addColumnIfNotExists(table, column, typeDef) {
  try {
    const info = db.prepare(`PRAGMA table_info(${table})`).all();
    if (!info.some(c => c.name === column)) {
      db.prepare(`ALTER TABLE ${table} ADD COLUMN ${column} ${typeDef}`).run();
    }
  } catch (e) {
    console.warn(`Migration notice for ${table}.${column}:`, e.message);
  }
}

addColumnIfNotExists('users', 'is_verified', 'INTEGER DEFAULT 1');
addColumnIfNotExists('users', 'profile_photo_url', 'TEXT');
addColumnIfNotExists('users', 'password_sha256', 'TEXT');
addColumnIfNotExists('users', 'notifications_enabled', 'INTEGER DEFAULT 1');
addColumnIfNotExists('users', 'auth_provider', "TEXT DEFAULT 'email'");
addColumnIfNotExists('users', 'social_id', 'TEXT');
addColumnIfNotExists('pyq_questions', 'type', "TEXT DEFAULT 'mcq'");
addColumnIfNotExists('pyq_questions', 'correct_numeric_answer', 'REAL');
addColumnIfNotExists('pyq_questions', 'tolerance', 'REAL DEFAULT 0.01');
try {
  const videoCols = db.prepare(`PRAGMA table_info(topic_videos)`).all();
  const colNames = videoCols.map(c => c.name);
  if (!colNames.includes('slides') || colNames.includes('topic_name')) {
    db.exec(`DROP TABLE IF EXISTS topic_videos;`);
    db.exec(`
      CREATE TABLE topic_videos (
        id TEXT,
        topic_id TEXT PRIMARY KEY,
        title TEXT,
        subject_name TEXT,
        slides TEXT,
        quiz_questions TEXT,
        created_at TEXT
      );
    `);
    console.log('[DB] Migrated topic_videos table to unified format.');
  }
} catch (e) {
  console.warn('topic_videos migration warning:', e.message);
}

// Seed or refresh PYQ Bank to 1,000 Questions across 10 years (100 Qs/year)
try {
  const pyqCount = db.prepare('SELECT COUNT(*) as count FROM pyq_questions').get();
  if (pyqCount.count < 1000) {
    const { PYQ_QUESTIONS } = require('./data/pyq-bank');
    db.prepare('DELETE FROM pyq_questions').run();
    const insertPYQ = db.prepare(`
      INSERT INTO pyq_questions (id, exam_key, subject, topic, year, question, options, correct_index, explanation, weightage, difficulty, frequency_score, created_at, type, correct_numeric_answer, tolerance)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const seedTx = db.transaction(() => {
      const now = new Date().toISOString();
      for (const q of PYQ_QUESTIONS) {
        insertPYQ.run(
          q.id,
          q.exam_key,
          q.subject,
          q.topic,
          q.year,
          q.question,
          JSON.stringify(q.options || []),
          q.correct_index !== undefined ? q.correct_index : -1,
          q.explanation,
          q.weightage || 4,
          q.difficulty || 'Medium',
          q.frequency_score || 'High Frequency',
          now,
          q.type || 'mcq',
          q.correct_numeric_answer !== undefined ? q.correct_numeric_answer : null,
          q.tolerance !== undefined ? q.tolerance : 0.01
        );
      }
    });
    seedTx();
    console.log(`[DB] Successfully seeded all ${PYQ_QUESTIONS.length} Previous 10 Years Important Questions (100/yr across 10 years).`);
  }
} catch (e) {
  console.warn('PYQ seeding warning:', e.message);
}

// Seed 8 Olympiad Exams Previous Questions (2016-2025)
try {
  const { seedOlympiadQuestions } = require('./data/olympiad-pyq-seeder');
  seedOlympiadQuestions(db);
} catch (e) {
  console.warn('Olympiad PYQ seeding warning:', e.message);
}

// Seed 7 Board & Competitive Exams (JEE Advanced, CBSE 12 PCM/PCB/PCMB, Class 10, BSEB 12/10)
try {
  const { seedExtendedPYQBank } = require('./data/extended-pyq-seeder');
  seedExtendedPYQBank(db);
} catch (e) {
  console.warn('Extended PYQ seeding warning:', e.message);
}

// Ensure default student account exists so default login credentials work out-of-the-box
try {
  const bcrypt = require('bcryptjs');
  const existingDefault = db.prepare('SELECT id FROM users WHERE email = ?').get('student@pivott.app');
  if (!existingDefault) {
    const hash = bcrypt.hashSync('password123', 10);
    db.prepare(`
      INSERT INTO users (id, name, email, password_hash, exam_name, exam_date, max_daily_hours, off_days, buffer_days_percent, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      'default-student-1',
      'Alex Student',
      'student@pivott.app',
      hash,
      'NEET 2026',
      new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      6.0,
      JSON.stringify([0]),
      0.10,
      new Date().toISOString()
    );
  }
} catch (e) {
  console.warn('Default user seeding warning:', e.message);
}

module.exports = db;

