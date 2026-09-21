const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const { suggestWeightage, generateMicroCopy, generateQuiz } = require('../ai');
const db = require('../db');

// POST /ai/suggest-weightage
router.post('/suggest-weightage', authMiddleware, async (req, res) => {
  try {
    const { subject_name, topic_name } = req.body;
    if (!topic_name) {
      return res.status(400).json({ error: 'topic_name is required.' });
    }

    const result = await suggestWeightage(subject_name || 'General', topic_name);
    return res.json(result);
  } catch (err) {
    console.error('Suggest weightage error:', err);
    return res.status(500).json({ error: 'Failed to generate weightage suggestion.' });
  }
});

// POST /ai/generate-microcopy
router.post('/generate-microcopy', authMiddleware, async (req, res) => {
  try {
    const message = await generateMicroCopy();
    return res.json({ micro_copy: message });
  } catch (err) {
    console.error('Micro-copy error:', err);
    return res.status(500).json({ error: 'Failed to generate micro-copy.' });
  }
});

// POST /ai/generate-quiz
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

const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../middleware/auth');

function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
    } catch (err) {
      // Continue without user
    }
  }
  next();
}

// POST /ai/solve-doubt
// AI Doubt Solver Bot endpoint for quick doubt clearing (supports both authenticated and guest students)
router.post('/solve-doubt', optionalAuth, async (req, res) => {
  try {
    const { doubt, exam_name, subject_name, topic_name, exam, subject, topic, conversation_history } = req.body;
    if (!doubt || !doubt.trim()) {
      return res.status(400).json({ error: 'Doubt question is required.' });
    }

    const user = req.user;
    const finalExamName = exam_name || exam || user?.exam_name || 'Competitive Exam';
    const finalSubjectName = subject_name || subject || 'General Science / Studies';
    const finalTopicName = topic_name || topic || 'Key Concepts';

    const { solveStudentDoubt } = require('../ai');
    const solution = await solveStudentDoubt({
      doubt: doubt.trim(),
      examName: finalExamName,
      subjectName: finalSubjectName,
      topicName: finalTopicName,
      conversationHistory: conversation_history || []
    });

    return res.json(solution);
  } catch (err) {
    console.error('Solve doubt error:', err);
    return res.status(500).json({ error: 'Failed to solve student doubt.' });
  }
});

module.exports = router;

