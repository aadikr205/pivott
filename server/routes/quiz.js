const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const { authMiddleware } = require('../middleware/auth');
const { generateQuiz } = require('../ai');
const { logActivity } = require('../activity-logger');

// POST /ai/generate-quiz
// Generate 6 MCQs for a topic
router.post('/generate-quiz', authMiddleware, async (req, res) => {
  try {
    const { topic_id, subject_name, topic_name } = req.body;
    let finalTopicName = topic_name;
    let finalSubjectName = subject_name;

    if (topic_id) {
      const topic = db.prepare(`
        SELECT t.name as topic_name, s.name as subject_name 
        FROM topics t
        JOIN subjects s ON t.subject_id = s.id
        WHERE t.id = ?
      `).get(topic_id);

      if (topic) {
        finalTopicName = topic.topic_name;
        finalSubjectName = topic.subject_name;
      }
    }

    if (!finalTopicName) {
      return res.status(400).json({ error: 'Topic name or valid topic_id is required.' });
    }

    const questions = await generateQuiz(finalSubjectName || 'General Exam', finalTopicName);

    return res.json({
      topic_id,
      topic_name: finalTopicName,
      subject_name: finalSubjectName,
      questions
    });
  } catch (err) {
    console.error('Generate quiz error:', err);
    return res.status(500).json({ error: 'Failed to generate quiz.' });
  }
});

// POST /quiz/submit
// Store attempt and update topic mastery score (Section 4.5)
router.post('/submit', authMiddleware, (req, res) => {
  try {
    const userId = req.user.id;
    const { topic_id, score, total_questions, time_taken_seconds, questions } = req.body;

    if (!topic_id || score === undefined || !total_questions) {
      return res.status(400).json({ error: 'topic_id, score, and total_questions are required.' });
    }

    const numericScore = Number(score);
    const numericTotal = Number(total_questions);
    const scorePercentage = Math.round((numericScore / numericTotal) * 100);

    const topic = db.prepare('SELECT * FROM topics WHERE id = ?').get(topic_id);
    if (!topic) {
      return res.status(404).json({ error: 'Topic not found.' });
    }

    // Adaptive scoring: new mastery updates topic mastery_score
    const previousMastery = Number(topic.mastery_score) || 0;
    // Weighted update: 60% new score, 40% previous score
    const newMasteryScore = previousMastery === 0 
      ? scorePercentage 
      : Math.round((previousMastery * 0.4) + (scorePercentage * 0.6));

    const needsRevision = scorePercentage < 50;

    // If score < 50%, mark topic as needing revision and boost priority
    let newWeightage = topic.weightage;
    let newStatus = topic.status;
    if (needsRevision) {
      newWeightage = Math.min(5, (topic.weightage || 3) + 1);
      if (topic.status === 'done') {
        newStatus = 'in_progress';
      }
    } else if (scorePercentage >= 80 && topic.status !== 'done') {
      newStatus = 'done';
    }

    // Update topic record
    db.prepare(`
      UPDATE topics 
      SET mastery_score = ?, weightage = ?, status = ?
      WHERE id = ?
    `).run(newMasteryScore, newWeightage, newStatus, topic_id);

    // Save quiz attempt
    const attemptId = uuidv4();
    const now = new Date().toISOString();
    db.prepare(`
      INSERT INTO quiz_attempts (id, topic_id, user_id, date, score, total_questions, time_taken_seconds, questions)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      attemptId,
      topic_id,
      userId,
      now,
      numericScore,
      numericTotal,
      Number(time_taken_seconds) || 0,
      JSON.stringify(questions || [])
    );

    try {
      logActivity(
        userId,
        'quiz_attempt',
        `Completed quiz on "${topic.name}": ${numericScore}/${numericTotal} (${scorePercentage}%)`,
        { topic_id, topic_name: topic.name, score: numericScore, total_questions: numericTotal, percentage: scorePercentage },
        req.ip
      );
    } catch (e) {}

    return res.json({
      message: 'Quiz submitted successfully.',
      attempt_id: attemptId,
      score: numericScore,
      total_questions: numericTotal,
      percentage: scorePercentage,
      previous_mastery: previousMastery,
      new_mastery: newMasteryScore,
      needs_revision: needsRevision,
      topic_status: newStatus
    });
  } catch (err) {
    console.error('Submit quiz error:', err);
    return res.status(500).json({ error: 'Failed to submit quiz.' });
  }
});

// GET /quiz/history
router.get('/history', authMiddleware, (req, res) => {
  try {
    const userId = req.user.id;
    const history = db.prepare(`
      SELECT q.*, t.name as topic_name, s.name as subject_name 
      FROM quiz_attempts q
      JOIN topics t ON q.topic_id = t.id
      JOIN subjects s ON t.subject_id = s.id
      WHERE q.user_id = ?
      ORDER BY q.date DESC
      LIMIT 30
    `).all(userId);

    const parsed = history.map(h => ({
      ...h,
      questions: JSON.parse(h.questions || '[]')
    }));

    return res.json({ history: parsed });
  } catch (err) {
    console.error('Quiz history error:', err);
    return res.status(500).json({ error: 'Failed to retrieve quiz history.' });
  }
});

module.exports = router;
