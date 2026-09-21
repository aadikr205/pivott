const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const { authMiddleware } = require('../middleware/auth');
const { replanSchedule, formatDate } = require('../scheduler');
const { generateReplanExplanation, generateMicroCopy } = require('../ai');
const { logActivity } = require('../activity-logger');

// Helper to check backlog
function checkUserBacklog(userId, todayStr) {
  // Check past days where planned items exist and were not fully completed
  const pastDays = db.prepare(`
    SELECT * FROM schedule_days
    WHERE user_id = ? AND date < ?
    ORDER BY date ASC
  `).all(userId, todayStr);

  const backlogItems = [];
  let backlogMinutes = 0;

  for (const day of pastDays) {
    const planned = JSON.parse(day.planned_items || '[]');
    const actual = JSON.parse(day.actual_completed || '[]');
    const completedTopicIds = new Set(actual.filter(a => a.status === 'done').map(a => a.topic_id));

    for (const item of planned) {
      if (!completedTopicIds.has(item.topic_id)) {
        // Also check if topic status in DB is already 'done'
        const topic = db.prepare('SELECT status FROM topics WHERE id = ?').get(item.topic_id);
        if (!topic || topic.status !== 'done') {
          backlogItems.push({
            ...item,
            missed_date: day.date
          });
          backlogMinutes += (item.allocated_minutes || 60);
        }
      }
    }
  }

  return {
    hasBacklog: backlogItems.length > 0,
    backlogMinutes,
    backlogTopicsCount: backlogItems.length,
    backlogItems
  };
}

// GET /schedule/today
router.get('/today', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
    if (!user) return res.status(404).json({ error: 'User not found.' });

    const todayStr = req.query.date || formatDate(new Date());

    let dayRecord = db.prepare('SELECT * FROM schedule_days WHERE user_id = ? AND date = ?').get(userId, todayStr);
    
    let planned = dayRecord ? JSON.parse(dayRecord.planned_items || '[]') : [];
    const actual = dayRecord ? JSON.parse(dayRecord.actual_completed || '[]') : [];

    // Attach topic details to planned items
    const enrichedPlanned = planned.map(p => {
      const topic = db.prepare(`
        SELECT t.*, s.name as subject_name 
        FROM topics t 
        JOIN subjects s ON t.subject_id = s.id 
        WHERE t.id = ?
      `).get(p.topic_id);

      const actualItem = actual.find(a => a.topic_id === p.topic_id);

      return {
        ...p,
        topic_name: topic ? topic.name : p.topic_name || 'Topic',
        subject_name: topic ? topic.subject_name : 'Subject',
        weightage: topic ? topic.weightage : p.weightage || 3,
        mastery_score: topic ? topic.mastery_score : p.mastery_score || 0,
        current_status: actualItem ? actualItem.status : (topic ? topic.status : 'not_started'),
        minutes_done: actualItem ? actualItem.minutes_done : 0
      };
    });

    // Check backlog from past days
    const backlogInfo = checkUserBacklog(userId, todayStr);

    const totalAllocatedMinutes = enrichedPlanned.reduce((sum, item) => sum + (item.allocated_minutes || 0), 0);
    const microCopy = await generateMicroCopy();

    return res.json({
      date: todayStr,
      planned_items: enrichedPlanned,
      actual_completed: actual,
      total_allocated_minutes: totalAllocatedMinutes,
      max_daily_hours: user.max_daily_hours,
      has_backlog: backlogInfo.hasBacklog,
      backlog_minutes: backlogInfo.backlogMinutes,
      backlog_count: backlogInfo.backlogTopicsCount,
      backlog_items: backlogInfo.backlogItems,
      micro_copy: microCopy
    });
  } catch (err) {
    console.error('Get today schedule error:', err);
    return res.status(500).json({ error: 'Failed to retrieve today schedule.' });
  }
});

// GET /schedule/all
router.get('/all', authMiddleware, (req, res) => {
  try {
    const userId = req.user.id;
    const days = db.prepare('SELECT * FROM schedule_days WHERE user_id = ? ORDER BY date ASC').all(userId);

    const enrichedDays = days.map(day => {
      const planned = JSON.parse(day.planned_items || '[]');
      const actual = JSON.parse(day.actual_completed || '[]');
      const totalMinutes = planned.reduce((sum, p) => sum + (p.allocated_minutes || 0), 0);

      const detailedPlanned = planned.map(p => {
        const topic = db.prepare(`
          SELECT t.name, t.weightage, t.status, s.name as subject_name 
          FROM topics t 
          JOIN subjects s ON t.subject_id = s.id 
          WHERE t.id = ?
        `).get(p.topic_id);

        return {
          ...p,
          topic_name: topic ? topic.name : 'Topic',
          subject_name: topic ? topic.subject_name : 'Subject',
          weightage: topic ? topic.weightage : 3,
          overall_status: topic ? topic.status : 'not_started'
        };
      });

      return {
        id: day.id,
        date: day.date,
        total_minutes: totalMinutes,
        is_backlog_day: Boolean(day.is_backlog_day),
        planned_items: detailedPlanned,
        actual_completed: actual
      };
    });

    return res.json({ days: enrichedDays });
  } catch (err) {
    console.error('Get all schedule error:', err);
    return res.status(500).json({ error: 'Failed to retrieve schedule.' });
  }
});

// POST /schedule/mark-progress
router.post('/mark-progress', authMiddleware, (req, res) => {
  try {
    const userId = req.user.id;
    const { date, topic_id, minutes_done, status } = req.body;

    if (!date || !topic_id || !status) {
      return res.status(400).json({ error: 'Date, topic_id, and status are required.' });
    }

    const safeStatus = ['done', 'in_progress', 'missed'].includes(status) ? status : 'in_progress';
    const safeMinutes = Math.max(0, Number(minutes_done) || 0);

    let dayRecord = db.prepare('SELECT * FROM schedule_days WHERE user_id = ? AND date = ?').get(userId, date);
    if (!dayRecord) {
      const dayId = uuidv4();
      db.prepare(`
        INSERT INTO schedule_days (id, user_id, date, planned_items, actual_completed, is_backlog_day)
        VALUES (?, ?, ?, '[]', '[]', 0)
      `).run(dayId, userId, date);
      dayRecord = db.prepare('SELECT * FROM schedule_days WHERE id = ?').get(dayId);
    }

    let actual = JSON.parse(dayRecord.actual_completed || '[]');
    const existingIdx = actual.findIndex(a => a.topic_id === topic_id);

    if (existingIdx >= 0) {
      actual[existingIdx] = {
        topic_id,
        minutes_done: safeMinutes,
        status: safeStatus,
        updated_at: new Date().toISOString()
      };
    } else {
      actual.push({
        topic_id,
        minutes_done: safeMinutes,
        status: safeStatus,
        updated_at: new Date().toISOString()
      });
    }

    // Update schedule_day record
    db.prepare('UPDATE schedule_days SET actual_completed = ? WHERE id = ?').run(
      JSON.stringify(actual),
      dayRecord.id
    );

    // Update topic overall status in topics table
    let topicName = 'Topic';
    try {
      const topicObj = db.prepare('SELECT name FROM topics WHERE id = ?').get(topic_id);
      if (topicObj) topicName = topicObj.name;
    } catch (e) {}

    if (safeStatus === 'done') {
      db.prepare("UPDATE topics SET status = 'done' WHERE id = ?").run(topic_id);
    } else if (safeStatus === 'missed') {
      // If missed on a past day, flag day as backlog day
      db.prepare('UPDATE schedule_days SET is_backlog_day = 1 WHERE id = ?').run(dayRecord.id);
    }

    try {
      logActivity(
        userId,
        'timetable_progress',
        `Logged ${safeMinutes}m on "${topicName}" (${safeStatus})`,
        { topic_id, topic_name: topicName, minutes_done: safeMinutes, status: safeStatus, date },
        req.ip
      );
    } catch (e) {}

    return res.json({
      message: 'Progress recorded successfully.',
      date,
      topic_id,
      status: safeStatus,
      minutes_done: safeMinutes
    });
  } catch (err) {
    console.error('Mark progress error:', err);
    return res.status(500).json({ error: 'Failed to record progress.' });
  }
});

// POST /schedule/replan
// Triggers the Core Section 6 Re-Adjustment Engine
router.post('/replan', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
    if (!user) return res.status(404).json({ error: 'User not found.' });

    const todayStr = req.body.today || formatDate(new Date());
    const reason = req.body.reason || 'Backlog detected / Manual re-plan';

    // 1. Fetch all topics for this user with subject names
    const topics = db.prepare(`
      SELECT t.*, s.name as subject_name 
      FROM topics t 
      JOIN subjects s ON t.subject_id = s.id 
      WHERE s.user_id = ?
    `).all(userId);

    if (topics.length === 0) {
      return res.status(400).json({ error: 'No topics found to schedule.' });
    }

    // 2. Run deterministic re-adjustment algorithm
    const replanResult = replanSchedule(user, topics, todayStr, user.exam_date);
    const { scheduleDays, deferred, compressed, diffSummary } = replanResult;

    // 3. Update database: delete future days starting from today and insert new schedule
    const replanTx = db.transaction(() => {
      // Remove future days (>= todayStr)
      db.prepare('DELETE FROM schedule_days WHERE user_id = ? AND date >= ?').run(userId, todayStr);

      const insertDay = db.prepare(`
        INSERT INTO schedule_days (id, user_id, date, planned_items, actual_completed, is_backlog_day)
        VALUES (?, ?, ?, ?, '[]', 0)
      `);

      for (const day of scheduleDays) {
        insertDay.run(
          uuidv4(),
          userId,
          day.date,
          JSON.stringify(day.planned_items || [])
        );
      }

      // Update topic statuses for deferred items
      const setDeferred = db.prepare("UPDATE topics SET status = 'deferred' WHERE id = ? AND status != 'done'");
      for (const d of deferred) {
        setDeferred.run(d.id);
      }

      // Update topic statuses for compressed items
      const setSkim = db.prepare("UPDATE topics SET status = 'skim_only' WHERE id = ? AND status != 'done'");
      for (const compId of compressed) {
        setSkim.run(compId);
      }
    });

    replanTx();

    // 4. Generate reassuring panic-reduction AI / fallback explanation
    const summaryText = await generateReplanExplanation({
      keptCount: diffSummary.keptCount,
      compressedCount: diffSummary.compressedCount,
      deferredCount: diffSummary.deferredCount,
      maxDailyHours: user.max_daily_hours,
      examName: user.exam_name
    });

    const microCopy = await generateMicroCopy();

    // 5. Save ReplanLog entry
    const logId = uuidv4();
    db.prepare(`
      INSERT INTO replan_logs (id, user_id, triggered_at, reason, summary_text, deferred_topics, compressed_topics, diff_summary)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      logId,
      userId,
      new Date().toISOString(),
      reason,
      summaryText,
      JSON.stringify(deferred.map(d => d.id)),
      JSON.stringify(compressed),
      JSON.stringify(diffSummary)
    );

    try {
      logActivity(
        userId,
        'timetable_replan',
        `Study plan re-balanced: ${diffSummary.keptCount} kept, ${diffSummary.compressedCount} compressed, ${diffSummary.deferredCount} deferred`,
        { reason, diffSummary, replan_id: logId },
        req.ip
      );
    } catch (e) {}

    return res.json({
      message: 'Schedule re-adjusted successfully.',
      replan_id: logId,
      summary_text: summaryText,
      micro_copy: microCopy,
      diff_summary: diffSummary,
      deferred_topics: deferred,
      compressed_topics: compressed,
      schedule_days_count: scheduleDays.length
    });
  } catch (err) {
    console.error('Replan error:', err);
    return res.status(500).json({ error: 'Failed to recalculate schedule.' });
  }
});

// GET /schedule/replan-history
router.get('/replan-history', authMiddleware, (req, res) => {
  try {
    const userId = req.user.id;
    const logs = db.prepare(`
      SELECT * FROM replan_logs 
      WHERE user_id = ? 
      ORDER BY triggered_at DESC 
      LIMIT 20
    `).all(userId);

    const formatted = logs.map(l => ({
      ...l,
      deferred_topics: JSON.parse(l.deferred_topics || '[]'),
      compressed_topics: JSON.parse(l.compressed_topics || '[]'),
      diff_summary: JSON.parse(l.diff_summary || '{}')
    }));

    return res.json({ history: formatted });
  } catch (err) {
    console.error('Replan history error:', err);
    return res.status(500).json({ error: 'Failed to retrieve replan history.' });
  }
});

// GET /schedule/revision-suggestions
// Returns high-weightage topics and PYQ suggestions for remaining buffer days before exam
router.get('/revision-suggestions', authMiddleware, (req, res) => {
  try {
    const userId = req.user.id;
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
    if (!user) return res.status(404).json({ error: 'User not found.' });

    const topics = db.prepare(`
      SELECT t.*, s.name as subject_name 
      FROM topics t
      JOIN subjects s ON t.subject_id = s.id
      WHERE s.user_id = ?
    `).all(userId);

    const { getRevisionSuggestions, daysBetween, formatDate } = require('../scheduler');
    const todayStr = formatDate(new Date());
    const daysToExam = user.exam_date ? Math.max(1, daysBetween(todayStr, user.exam_date)) : 30;

    const suggestions = getRevisionSuggestions(topics, Math.min(14, daysToExam));

    return res.json({
      exam_name: user.exam_name,
      exam_date: user.exam_date,
      days_to_exam: daysToExam,
      revision_topics: suggestions
    });
  } catch (err) {
    console.error('Revision suggestions error:', err);
    return res.status(500).json({ error: 'Failed to generate revision suggestions.' });
  }
});

module.exports = router;

