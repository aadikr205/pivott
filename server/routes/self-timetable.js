const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const { authMiddleware } = require('../middleware/auth');
const { fetchVerifiedChapterContent, generateSelfTimetableReplan } = require('../self-content-fetcher');
const { logActivity } = require('../activity-logger');
const { getCurriculumChapters, getAvailableSubjectsForClass } = require('../data/curriculum');

// All Self Timetable endpoints require user authentication
router.use(authMiddleware);

/**
 * GET /api/self-timetable/curriculum
 * Returns syllabus chapters for a specific class level and subject
 */
router.get('/curriculum', (req, res) => {
  try {
    const classLevel = parseInt(req.query.class, 10) || 8;
    const subject = req.query.subject || 'Biology';
    const chapters = getCurriculumChapters(classLevel, subject);
    const subjects = getAvailableSubjectsForClass(classLevel);

    res.json({
      class: classLevel,
      subject,
      chapters,
      available_subjects: subjects
    });
  } catch (err) {
    console.error('Error fetching curriculum chapters:', err);
    res.status(500).json({ error: 'Failed to retrieve curriculum chapters.' });
  }
});

/**
 * GET /api/self-timetable/entries
 * Returns all user's self-study chapters/topics
 */
router.get('/entries', (req, res) => {
  try {
    const rows = db.prepare(`
      SELECT * FROM self_timetable_entries
      WHERE user_id = ?
      ORDER BY created_at DESC
    `).all(req.user.id);

    // Sort chronologically for roadmap progression
    const chronological = [...rows].reverse();
    const today = new Date();

    const formatted = rows.map(r => {
      const idx = chronological.findIndex(item => item.id === r.id);
      const scheduledDateObj = new Date(today);
      scheduledDateObj.setDate(today.getDate() + (idx >= 0 ? idx : 0));
      const dateStr = scheduledDateObj.toISOString().split('T')[0];
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const dayName = dayNames[scheduledDateObj.getDay()];

      const durationMins = r.daily_minutes || 30;
      // Start at 6:00 PM (18:00) by default
      const startH = 18;
      const startM = 0;
      const endTotalM = startH * 60 + startM + durationMins;
      const endH = Math.floor(endTotalM / 60) % 24;
      const endM = endTotalM % 60;
      const formatTime = (h, m) => {
        const ampm = h >= 12 ? 'PM' : 'AM';
        const displayH = h % 12 || 12;
        return `${String(displayH).padStart(2, '0')}:${String(m).padStart(2, '0')} ${ampm}`;
      };

      const timeSlot = `${formatTime(startH, startM)} - ${formatTime(endH, endM)}`;

      return {
        ...r,
        roadmap_day: `Day ${(idx >= 0 ? idx : 0) + 1}`,
        scheduled_date: dateStr,
        day_name: dayName,
        time_slot: timeSlot,
        key_points: r.key_points ? JSON.parse(r.key_points) : [],
        video_slides: r.video_slides ? JSON.parse(r.video_slides) : [],
        quiz_questions: r.quiz_questions ? JSON.parse(r.quiz_questions) : []
      };
    });

    res.json(formatted);
  } catch (err) {
    console.error('Error fetching self timetable entries:', err);
    res.status(500).json({ error: 'Failed to retrieve self timetable entries.' });
  }
});

/**
 * POST /api/self-timetable/entries
 * Add chapter/topic with server-side auto-fetch and verified content pipeline
 */
router.post('/entries', async (req, res) => {
  try {
    const { class_level, subject, chapter_topic_name, daily_minutes = 30 } = req.body;

    if (!class_level || !subject || !chapter_topic_name || !chapter_topic_name.trim()) {
      return res.status(400).json({ error: 'Class, subject, and chapter name are required.' });
    }

    const numericClass = parseInt(class_level, 10);
    if (isNaN(numericClass) || numericClass < 1 || numericClass > 12) {
      return res.status(400).json({ error: 'Class must be between Class 1 and Class 12.' });
    }

    const safeDailyMinutes = Math.min(480, Math.max(15, parseInt(daily_minutes, 10) || 30));

    // Call server-side web lookup & content generator
    const generated = await fetchVerifiedChapterContent({
      classLevel: numericClass,
      subject: subject.trim(),
      chapterTopicName: chapter_topic_name.trim()
    });

    const entryId = `self_${uuidv4()}`;
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO self_timetable_entries (
        id, user_id, class_level, subject, chapter_topic_name,
        daily_minutes, content_text, concept_map_mermaid, key_points,
        video_url, video_style, video_slides, quiz_questions,
        status, is_verified, verification_source, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      entryId,
      req.user.id,
      numericClass,
      subject.trim(),
      chapter_topic_name.trim(),
      safeDailyMinutes,
      generated.content_text,
      generated.concept_map_mermaid,
      generated.key_points,
      `/api/self-timetable/entries/${entryId}/video`,
      generated.video_style,
      generated.video_slides,
      generated.quiz_questions,
      'not_started',
      generated.is_verified,
      generated.verification_source,
      now
    );

    logActivity(
      req.user.id,
      'self_timetable_add',
      `Added Self Timetable chapter: ${chapter_topic_name} (Class ${numericClass} ${subject})`,
      { entryId, is_verified: generated.is_verified }
    );

    const created = db.prepare('SELECT * FROM self_timetable_entries WHERE id = ?').get(entryId);

    res.status(201).json({
      ...created,
      key_points: JSON.parse(created.key_points || '[]'),
      video_slides: JSON.parse(created.video_slides || '[]'),
      quiz_questions: JSON.parse(created.quiz_questions || '[]')
    });
  } catch (err) {
    console.error('Error creating self timetable entry:', err);
    res.status(500).json({ error: 'Failed to create self timetable entry.' });
  }
});

/**
 * PATCH /api/self-timetable/entries/:id/status
 * Update status (not_started, in_progress, done, deferred)
 */
router.patch('/entries/:id/status', (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['not_started', 'in_progress', 'done', 'deferred'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: `Status must be one of: ${validStatuses.join(', ')}` });
    }

    const result = db.prepare(`
      UPDATE self_timetable_entries
      SET status = ?
      WHERE id = ? AND user_id = ?
    `).run(status, id, req.user.id);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Entry not found.' });
    }

    res.json({ success: true, id, status });
  } catch (err) {
    console.error('Error updating entry status:', err);
    res.status(500).json({ error: 'Failed to update entry status.' });
  }
});

/**
 * DELETE /api/self-timetable/entries/:id
 * Remove chapter/topic from personal self timetable
 */
router.delete('/entries/:id', (req, res) => {
  try {
    const { id } = req.params;
    const result = db.prepare(`
      DELETE FROM self_timetable_entries
      WHERE id = ? AND user_id = ?
    `).run(id, req.user.id);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Entry not found.' });
    }

    res.json({ success: true, id });
  } catch (err) {
    console.error('Error deleting entry:', err);
    res.status(500).json({ error: 'Failed to delete entry.' });
  }
});

/**
 * POST /api/self-timetable/entries/:id/quiz/submit
 * Submit 10-question post-video quiz
 */
router.post('/entries/:id/quiz/submit', (req, res) => {
  try {
    const { id } = req.params;
    const { score, total_questions = 10 } = req.body;

    const entry = db.prepare(`
      SELECT * FROM self_timetable_entries
      WHERE id = ? AND user_id = ?
    `).get(id, req.user.id);

    if (!entry) {
      return res.status(404).json({ error: 'Self timetable entry not found.' });
    }

    const attemptId = `self_quiz_${uuidv4()}`;
    const now = new Date().toISOString();
    const numericScore = parseInt(score, 10) || 0;
    const numericTotal = parseInt(total_questions, 10) || 10;

    db.prepare(`
      INSERT INTO self_timetable_quiz_attempts (
        id, entry_id, user_id, score, total_questions, date_taken
      ) VALUES (?, ?, ?, ?, ?, ?)
    `).run(attemptId, id, req.user.id, numericScore, numericTotal, now);

    // If passed (score >= 70%), mark entry status as done
    let newStatus = entry.status;
    if (numericScore >= Math.ceil(numericTotal * 0.7)) {
      newStatus = 'done';
      db.prepare(`
        UPDATE self_timetable_entries
        SET status = 'done'
        WHERE id = ? AND user_id = ?
      `).run(id, req.user.id);
    }

    logActivity(
      req.user.id,
      'self_timetable_quiz',
      `Completed quiz for "${entry.chapter_topic_name}": ${numericScore}/${numericTotal}`,
      { entryId: id, score: numericScore, total: numericTotal, status: newStatus }
    );

    res.json({
      success: true,
      attempt_id: attemptId,
      score: numericScore,
      total_questions: numericTotal,
      passed: numericScore >= Math.ceil(numericTotal * 0.7),
      entry_status: newStatus
    });
  } catch (err) {
    console.error('Error submitting self timetable quiz:', err);
    res.status(500).json({ error: 'Failed to submit quiz attempt.' });
  }
});

/**
 * GET /api/self-timetable/analytics
 * Dedicated progress graph & score trend data for Self Timetable
 */
router.get('/analytics', (req, res) => {
  try {
    const entries = db.prepare(`
      SELECT id, status, daily_minutes, created_at, subject, class_level
      FROM self_timetable_entries
      WHERE user_id = ?
    `).all(req.user.id);

    const totalChapters = entries.length;
    const completedChapters = entries.filter(e => e.status === 'done').length;
    const inProgressChapters = entries.filter(e => e.status === 'in_progress').length;
    const deferredChapters = entries.filter(e => e.status === 'deferred').length;
    const notStartedChapters = entries.filter(e => e.status === 'not_started').length;

    const completionRate = totalChapters > 0
      ? Math.round((completedChapters / totalChapters) * 100)
      : 0;

    // Get last 15 quiz attempts for the score trend line
    const quizAttempts = db.prepare(`
      SELECT q.id, q.score, q.total_questions, q.date_taken, e.chapter_topic_name, e.subject
      FROM self_timetable_quiz_attempts q
      JOIN self_timetable_entries e ON q.entry_id = e.id
      WHERE q.user_id = ?
      ORDER BY q.date_taken ASC
      LIMIT 20
    `).all(req.user.id);

    // Group completion by subject
    const subjectStats = {};
    for (const e of entries) {
      if (!subjectStats[e.subject]) {
        subjectStats[e.subject] = { total: 0, done: 0 };
      }
      subjectStats[e.subject].total++;
      if (e.status === 'done') subjectStats[e.subject].done++;
    }

    // Daily activity counts for the last 7 days
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const dayStr = d.toISOString().split('T')[0];
      const count = entries.filter(e => e.created_at.startsWith(dayStr)).length;
      const quizzesCount = quizAttempts.filter(q => q.date_taken.startsWith(dayStr)).length;
      last7Days.push({
        date: dayStr,
        dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
        chaptersAdded: count,
        quizzesTaken: quizzesCount
      });
    }

    res.json({
      summary: {
        totalChapters,
        completedChapters,
        inProgressChapters,
        deferredChapters,
        notStartedChapters,
        completionRate
      },
      quizScoreTrend: quizAttempts.map(q => ({
        id: q.id,
        topic: q.chapter_topic_name,
        subject: q.subject,
        score: q.score,
        total: q.total_questions,
        percentage: Math.round((q.score / q.total_questions) * 100),
        date: q.date_taken.split('T')[0]
      })),
      subjectStats,
      dailyTrend: last7Days
    });
  } catch (err) {
    console.error('Error fetching self timetable analytics:', err);
    res.status(500).json({ error: 'Failed to retrieve analytics.' });
  }
});

/**
 * POST /api/self-timetable/replan
 * Backlog redistribution respecting daily study budgets
 */
router.post('/replan', (req, res) => {
  try {
    const { target_days = 14, daily_budget_minutes = 90 } = req.body;

    const entries = db.prepare(`
      SELECT * FROM self_timetable_entries
      WHERE user_id = ?
    `).all(req.user.id);

    const replanResult = generateSelfTimetableReplan(
      entries,
      parseInt(target_days, 10) || 14,
      parseInt(daily_budget_minutes, 10) || 90
    );

    // Apply deferred status updates
    if (replanResult.deferred_entries.length > 0) {
      const placeholders = replanResult.deferred_entries.map(() => '?').join(',');
      db.prepare(`
        UPDATE self_timetable_entries
        SET status = 'deferred'
        WHERE id IN (${placeholders}) AND user_id = ?
      `).run(...replanResult.deferred_entries, req.user.id);
    }

    // Insert replan log
    const logId = `replan_self_${uuidv4()}`;
    db.prepare(`
      INSERT INTO self_timetable_replan_logs (
        id, user_id, triggered_at, summary_text, deferred_entries
      ) VALUES (?, ?, ?, ?, ?)
    `).run(
      logId,
      req.user.id,
      new Date().toISOString(),
      replanResult.summary_text,
      JSON.stringify(replanResult.deferred_entries)
    );

    logActivity(
      req.user.id,
      'self_timetable_replan',
      'Triggered Self Timetable re-plan & backlog redistribution',
      { deferredCount: replanResult.deferred_entries.length }
    );

    res.json({
      success: true,
      summary_text: replanResult.summary_text,
      deferred_count: replanResult.deferred_entries.length,
      kept_count: replanResult.updated_entries.length,
      study_days: replanResult.study_days,
      buffer_days: replanResult.buffer_days,
      target_days: replanResult.target_days
    });
  } catch (err) {
    console.error('Error executing self timetable replan:', err);
    res.status(500).json({ error: 'Failed to re-plan self timetable.' });
  }
});

module.exports = router;
