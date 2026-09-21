const express = require('express');
const router = express.Router();
const db = require('../db');
const { authMiddleware } = require('../middleware/auth');
const { shuffleQuestionOptions } = require('../ai');
const { logActivity } = require('../activity-logger');

// GET /api/pyq/questions
// Filter previous 10 years questions by exam, subject, topic, year, difficulty
router.get('/questions', (req, res) => {
  try {
    const { exam_key, subject, topic, year, difficulty, search, limit = 50 } = req.query;

    let query = 'SELECT * FROM pyq_questions WHERE 1=1';
    const params = [];

    if (exam_key) {
      query += ' AND exam_key = ?';
      params.push(exam_key);
    }
    if (subject) {
      query += ' AND subject = ?';
      params.push(subject);
    }
    if (topic) {
      query += ' AND topic LIKE ?';
      params.push(`%${topic}%`);
    }
    if (year) {
      query += ' AND year = ?';
      params.push(Number(year));
    }
    if (difficulty) {
      query += ' AND difficulty = ?';
      params.push(difficulty);
    }
    if (search) {
      query += ' AND (question LIKE ? OR explanation LIKE ? OR topic LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY year DESC, weightage DESC LIMIT ?';
    params.push(Math.min(1000, Math.max(1, Number(limit) || 50)));

    const rows = db.prepare(query).all(...params);

    const questions = rows.map(r => {
      let parsedOptions = [];
      try {
        parsedOptions = JSON.parse(r.options);
      } catch {
        parsedOptions = [r.options];
      }

      const qObj = {
        id: r.id,
        exam_key: r.exam_key,
        subject: r.subject,
        topic: r.topic,
        year: r.year,
        question: r.question,
        options: parsedOptions,
        correct_index: r.correct_index,
        explanation: r.explanation,
        weightage: r.weightage,
        difficulty: r.difficulty,
        frequency_score: r.frequency_score,
        type: r.type || 'mcq',
        tolerance: r.tolerance !== undefined && r.tolerance !== null ? r.tolerance : 0.01
      };

      // Shuffled options for practice mode so answer isn't predictable (MCQ only)
      return qObj.type === 'numerical' ? qObj : shuffleQuestionOptions(qObj);
    });

    return res.json({
      count: questions.length,
      questions
    });
  } catch (err) {
    console.error('Fetch PYQ error:', err);
    return res.status(500).json({ error: 'Failed to fetch previous year questions.' });
  }
});

// GET /api/pyq/stats
// Returns overview metadata for PYQ bank
router.get('/stats', (req, res) => {
  try {
    const totalCount = db.prepare('SELECT COUNT(*) as count FROM pyq_questions').get().count;
    
    const byExam = db.prepare(`
      SELECT exam_key, COUNT(*) as count 
      FROM pyq_questions 
      GROUP BY exam_key
    `).all();

    const byYear = db.prepare(`
      SELECT year, COUNT(*) as count 
      FROM pyq_questions 
      GROUP BY year 
      ORDER BY year DESC
    `).all();

    const topTopics = db.prepare(`
      SELECT topic, subject, exam_key, weightage, frequency_score, COUNT(*) as question_count 
      FROM pyq_questions 
      GROUP BY topic, exam_key 
      ORDER BY weightage DESC, question_count DESC 
      LIMIT 15
    `).all();

    return res.json({
      total_pyqs: totalCount,
      by_exam: byExam,
      by_year: byYear,
      top_repeated_topics: topTopics
    });
  } catch (err) {
    console.error('PYQ stats error:', err);
    return res.status(500).json({ error: 'Failed to retrieve PYQ stats.' });
  }
});

// GET /api/pyq/high-yield-topic
// Returns high-frequency PYQs for a specific topic (used by Buffer / Revision suggestion engine)
router.get('/high-yield-topic', (req, res) => {
  try {
    const { topic, exam_key } = req.query;
    if (!topic) {
      return res.status(400).json({ error: 'topic is required.' });
    }

    let query = 'SELECT * FROM pyq_questions WHERE topic LIKE ?';
    const params = [`%${topic}%`];

    if (exam_key) {
      query += ' AND exam_key = ?';
      params.push(exam_key);
    }

    query += ' ORDER BY weightage DESC, year DESC LIMIT 10';
    const rows = db.prepare(query).all(...params);

    const questions = rows.map(r => ({
      id: r.id,
      exam_key: r.exam_key,
      subject: r.subject,
      topic: r.topic,
      year: r.year,
      question: r.question,
      options: JSON.parse(r.options || '[]'),
      correct_index: r.correct_index,
      explanation: r.explanation,
      weightage: r.weightage,
      difficulty: r.difficulty,
      frequency_score: r.frequency_score
    }));

    return res.json({ topic, questions });
  } catch (err) {
    console.error('High yield PYQ error:', err);
    return res.status(500).json({ error: 'Failed to fetch high-yield PYQs.' });
  }
});

// POST /api/pyq/submit-practice
// Records student practice on an MCQ PYQ and returns verified feedback
router.post('/submit-practice', authMiddleware, (req, res) => {
  try {
    const { question_id, selected_index } = req.body;
    if (!question_id || selected_index === undefined) {
      return res.status(400).json({ error: 'question_id and selected_index are required.' });
    }

    const question = db.prepare('SELECT * FROM pyq_questions WHERE id = ?').get(question_id);
    if (!question) {
      return res.status(404).json({ error: 'Question not found.' });
    }

    const isCorrect = Number(selected_index) === question.correct_index;

    logActivity(req.user.id, 'pyq_practice', `Practiced PYQ on ${question.topic}`, {
      question_id,
      year: question.year,
      subject: question.subject,
      topic: question.topic,
      type: 'mcq',
      is_correct: isCorrect
    });

    return res.json({
      is_correct: isCorrect,
      correct_index: question.correct_index,
      explanation: question.explanation,
      frequency_score: question.frequency_score,
      year: question.year
    });
  } catch (err) {
    console.error('Submit PYQ practice error:', err);
    return res.status(500).json({ error: 'Failed to record PYQ practice.' });
  }
});

// POST /api/pyq/check-answer
// Checks answer for both MCQ and Numerical questions with ±tolerance check and logs activity
router.post('/check-answer', authMiddleware, (req, res) => {
  try {
    const { question_id, answer, selected_index } = req.body;
    if (!question_id) {
      return res.status(400).json({ error: 'question_id is required.' });
    }

    const question = db.prepare('SELECT * FROM pyq_questions WHERE id = ?').get(question_id);
    if (!question) {
      return res.status(404).json({ error: 'Question not found.' });
    }

    if (question.type === 'numerical') {
      const studentNum = parseFloat(answer);
      if (isNaN(studentNum)) {
        return res.status(400).json({ error: 'Please enter a valid numeric value.' });
      }
      const correctNum = question.correct_numeric_answer;
      const tol = question.tolerance !== undefined && question.tolerance !== null ? question.tolerance : 0.01;
      const diff = Math.abs(studentNum - correctNum);
      const isCorrect = diff <= (tol + 0.0001);

      logActivity(req.user.id, 'pyq_practice', `Attempted Numerical PYQ on ${question.topic}`, {
        question_id,
        year: question.year,
        subject: question.subject,
        topic: question.topic,
        type: 'numerical',
        student_answer: studentNum,
        correct_answer: correctNum,
        tolerance: tol,
        is_correct: isCorrect
      });

      return res.json({
        is_correct: isCorrect,
        correct_answer: correctNum,
        tolerance: tol,
        difference: Math.round(diff * 1000) / 1000,
        explanation: question.explanation,
        frequency_score: question.frequency_score,
        year: question.year
      });
    } else {
      // MCQ
      const idx = selected_index !== undefined ? Number(selected_index) : -1;
      const isCorrect = idx === question.correct_index;

      logActivity(req.user.id, 'pyq_practice', `Attempted PYQ MCQ on ${question.topic}`, {
        question_id,
        year: question.year,
        subject: question.subject,
        topic: question.topic,
        type: 'mcq',
        is_correct: isCorrect
      });

      return res.json({
        is_correct: isCorrect,
        correct_index: question.correct_index,
        explanation: question.explanation,
        frequency_score: question.frequency_score,
        year: question.year
      });
    }
  } catch (err) {
    console.error('Check PYQ answer error:', err);
    return res.status(500).json({ error: 'Failed to verify PYQ answer.' });
  }
});

module.exports = router;
