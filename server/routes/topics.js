const express = require('express');
const router = express.Router();
const db = require('../db');
const { authMiddleware } = require('../middleware/auth');
const { replanSchedule, formatDate } = require('../scheduler');
const { generateReplanExplanation, generateMicroCopy } = require('../ai');
const { v4: uuidv4 } = require('uuid');

// GET /topics/deferred
// List all topics currently marked as 'deferred' or 'skim_only'
router.get('/deferred', authMiddleware, (req, res) => {
  try {
    const userId = req.user.id;
    const deferred = db.prepare(`
      SELECT t.*, s.name as subject_name 
      FROM topics t
      JOIN subjects s ON t.subject_id = s.id
      WHERE s.user_id = ? AND t.status IN ('deferred', 'skim_only')
      ORDER BY t.weightage DESC, t.name ASC
    `).all(userId);

    return res.json({ deferred_topics: deferred });
  } catch (err) {
    console.error('Get deferred topics error:', err);
    return res.status(500).json({ error: 'Failed to retrieve deferred topics.' });
  }
});

// POST /topics/:id/reinclude
// Manually bring a deferred topic back into the plan and recalculate
router.post('/:id/reinclude', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const topicId = req.params.id;

    // Verify ownership
    const topic = db.prepare(`
      SELECT t.*, s.name as subject_name 
      FROM topics t
      JOIN subjects s ON t.subject_id = s.id
      WHERE t.id = ? AND s.user_id = ?
    `).get(topicId, userId);

    if (!topic) {
      return res.status(404).json({ error: 'Topic not found.' });
    }

    // Set topic status back to not_started and boost its priority
    db.prepare("UPDATE topics SET status = 'in_progress', weightage = MAX(3, weightage) WHERE id = ?").run(topicId);

    // Re-run re-plan starting today
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
    const allTopics = db.prepare(`
      SELECT t.*, s.name as subject_name 
      FROM topics t 
      JOIN subjects s ON t.subject_id = s.id 
      WHERE s.user_id = ?
    `).all(userId);

    const todayStr = formatDate(new Date());
    const { scheduleDays, deferred, compressed, diffSummary } = replanSchedule(user, allTopics, todayStr, user.exam_date);

    // Save updated schedule
    const replanTx = db.transaction(() => {
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
    });
    replanTx();

    const summaryText = await generateReplanExplanation({
      keptCount: diffSummary.keptCount,
      compressedCount: diffSummary.compressedCount,
      deferredCount: diffSummary.deferredCount,
      maxDailyHours: user.max_daily_hours,
      examName: user.exam_name
    });

    return res.json({
      message: `Topic '${topic.name}' has been re-included into your study schedule.`,
      topic_id: topicId,
      diff_summary: diffSummary,
      summary_text: summaryText
    });
  } catch (err) {
    console.error('Re-include topic error:', err);
    return res.status(500).json({ error: 'Failed to re-include topic.' });
  }
});

// PUT /topics/:id
router.put('/:id', authMiddleware, (req, res) => {
  try {
    const userId = req.user.id;
    const topicId = req.params.id;
    const { name, weightage, estimated_minutes, status } = req.body;

    const topic = db.prepare(`
      SELECT t.id FROM topics t
      JOIN subjects s ON t.subject_id = s.id
      WHERE t.id = ? AND s.user_id = ?
    `).get(topicId, userId);

    if (!topic) {
      return res.status(404).json({ error: 'Topic not found.' });
    }

    const updates = [];
    const params = [];

    if (name) {
      updates.push('name = ?');
      params.push(name.trim());
    }
    if (weightage !== undefined) {
      updates.push('weightage = ?');
      params.push(Math.min(5, Math.max(1, Number(weightage))));
    }
    if (estimated_minutes !== undefined) {
      updates.push('estimated_minutes = ?');
      params.push(Math.max(15, Number(estimated_minutes)));
    }
    if (status) {
      updates.push('status = ?');
      params.push(status);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update.' });
    }

    params.push(topicId);
    db.prepare(`UPDATE topics SET ${updates.join(', ')} WHERE id = ?`).run(...params);

    const updated = db.prepare('SELECT * FROM topics WHERE id = ?').get(topicId);
    return res.json({ topic: updated });
  } catch (err) {
    console.error('Update topic error:', err);
    return res.status(500).json({ error: 'Failed to update topic.' });
  }
});

// Concept Video & Post-Video Quiz routes
router.use('/', require('./concept-video'));

module.exports = router;
