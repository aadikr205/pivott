const express = require('express');
const router = express.Router();
const db = require('../db');
const { authMiddleware } = require('../middleware/auth');
const { shuffleQuestionOptions } = require('../ai');
const { logActivity } = require('../activity-logger');

// Resolver to map any user or course exam key variant to all matching database exam keys
function resolveExamKeys(examKey) {
  if (!examKey || examKey === 'all') return null;

  const raw = String(examKey).toLowerCase().trim();

  // Unified CBSE 12th (All streams combined: PCM, PCB, PCMB, English, Hindi, PE, CS)
  if (
    raw === 'cbse12_all' ||
    raw === 'cbse_12_all' ||
    raw === 'cbse12' ||
    raw === 'cbse_12' ||
    raw === 'cbse 12' ||
    raw === 'cbse 12th' ||
    raw === 'cbse12th' ||
    raw === 'cbse 12th board' ||
    raw === 'cbse 12th board exam'
  ) {
    return ['cbse12', 'cbse_12', 'cbse_12_pcm', 'cbse12_pcm', 'cbse_12_pcb', 'cbse12_pcb', 'cbse_12_pcmb', 'cbse12_pcmb'];
  }

  // CBSE 12th PCM
  if (raw.includes('pcm') && !raw.includes('pcmb') && (raw.includes('12') || raw.includes('cbse'))) {
    return ['cbse12', 'cbse_12_pcm', 'cbse12_pcm', 'cbse_12_pcmb', 'cbse12_pcmb'];
  }

  // CBSE 12th PCB
  if (raw.includes('pcb') && !raw.includes('pcmb') && (raw.includes('12') || raw.includes('cbse'))) {
    return ['cbse12_pcb', 'cbse_12_pcb', 'cbse_12_pcmb', 'cbse12_pcmb'];
  }

  // CBSE 12th PCMB
  if (raw.includes('pcmb') && (raw.includes('12') || raw.includes('cbse'))) {
    return ['cbse12_pcmb', 'cbse_12_pcmb', 'cbse12', 'cbse_12_pcm', 'cbse12_pcb', 'cbse_12_pcb'];
  }

  // Generic onboarding exam_name with CBSE 12
  if (raw.includes('cbse') && raw.includes('12')) {
    if (raw.includes('pcb')) {
      return ['cbse12_pcb', 'cbse_12_pcb', 'cbse_12_pcmb', 'cbse12_pcmb'];
    }
    if (raw.includes('pcmb')) {
      return ['cbse12_pcmb', 'cbse_12_pcmb', 'cbse12', 'cbse_12_pcm', 'cbse12_pcb', 'cbse_12_pcb'];
    }
    return ['cbse12', 'cbse_12_pcm', 'cbse_12_pcmb', 'cbse12_pcmb'];
  }

  // Class 10th Board
  if (raw.includes('10') && (raw.includes('class') || raw.includes('cbse') || raw.includes('board'))) {
    return ['class10', 'class_10_board'];
  }

  // Bihar Board 12th
  if (raw.includes('bseb12') || (raw.includes('bihar') && raw.includes('12'))) {
    return ['bseb12', 'bihar_12_inter'];
  }

  // Bihar Board 10th
  if (raw.includes('bseb10') || (raw.includes('bihar') && raw.includes('10'))) {
    return ['bseb10', 'bihar_10_matric'];
  }

  // JEE Main
  if (raw.includes('jee_main') || raw.includes('jee main')) {
    return ['jee_main'];
  }

  // JEE Advanced
  if (raw === 'jee' || raw.includes('jee_advanced') || raw.includes('advanced')) {
    return ['jee', 'jee_advanced'];
  }

  // NEET
  if (raw.includes('neet')) {
    return ['neet'];
  }

  return [examKey];
}

// GET /api/pyq/questions
// Filter previous 10 years questions by exam, subject, topic, year, difficulty
router.get('/questions', (req, res) => {
  try {
    const { exam_key, subject, topic, year, difficulty, search, is_important, limit = 60 } = req.query;

    let query = 'SELECT * FROM pyq_questions WHERE 1=1';
    const params = [];

    if (exam_key && exam_key !== 'all') {
      const keys = resolveExamKeys(exam_key);
      if (keys && keys.length === 1) {
        query += ' AND exam_key = ?';
        params.push(keys[0]);
      } else if (keys && keys.length > 1) {
        query += ` AND exam_key IN (${keys.map(() => '?').join(', ')})`;
        params.push(...keys);
      }
    }
    if (subject && subject !== 'all') {
      if (subject.toLowerCase() === 'mathematics' || subject.toLowerCase() === 'maths') {
        query += " AND (subject = 'Mathematics' OR subject = 'Maths')";
      } else {
        query += ' AND subject = ?';
        params.push(subject);
      }
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
    if (is_important === 'true' || is_important === true || is_important === '1') {
      query += " AND (weightage >= 4 OR frequency_score LIKE '%Important%' OR frequency_score LIKE '%Repeated%' OR frequency_score LIKE '%High%')";
    }
    if (search) {
      query += ' AND (question LIKE ? OR explanation LIKE ? OR topic LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY (CASE WHEN frequency_score LIKE "%Important%" OR frequency_score LIKE "%Repeated%" THEN 1 ELSE 2 END) ASC, year DESC, weightage DESC LIMIT ?';
    params.push(Math.min(1000, Math.max(1, Number(limit) || 60)));

    const rows = db.prepare(query).all(...params);

    const questions = rows.map(r => {
      let parsedOptions = [];
      try {
        parsedOptions = typeof r.options === 'string' ? JSON.parse(r.options) : r.options;
      } catch {
        parsedOptions = [r.options];
      }

      return {
        id: r.id,
        exam_key: r.exam_key,
        subject: r.subject,
        topic: r.topic,
        year: r.year,
        question: r.question,
        options: Array.isArray(parsedOptions) ? [...parsedOptions] : [],
        correct_index: r.correct_index,
        explanation: r.explanation,
        weightage: r.weightage,
        difficulty: r.difficulty,
        frequency_score: r.frequency_score,
        type: r.type || 'mcq',
        tolerance: r.tolerance !== undefined && r.tolerance !== null ? r.tolerance : 0.01
      };
    });

    // Anti-repetition guarantee: ensure no two consecutive MCQs share the same correct option index
    let prevCorrectIndex = -1;
    for (const q of questions) {
      if (q.type !== 'numerical' && Array.isArray(q.options) && q.options.length >= 2) {
        if (q.correct_index === prevCorrectIndex) {
          const oldIdx = q.correct_index;
          let newIdx = (oldIdx + 1) % q.options.length;
          if (newIdx === prevCorrectIndex) {
            newIdx = (newIdx + 1) % q.options.length;
          }
          const correctText = q.options[oldIdx];
          q.options[oldIdx] = q.options[newIdx];
          q.options[newIdx] = correctText;
          q.correct_index = newIdx;
        }
        prevCorrectIndex = q.correct_index;
      }
    }

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

    if (exam_key && exam_key !== 'all') {
      const keys = resolveExamKeys(exam_key);
      if (keys && keys.length === 1) {
        query += ' AND exam_key = ?';
        params.push(keys[0]);
      } else if (keys && keys.length > 1) {
        query += ` AND exam_key IN (${keys.map(() => '?').join(', ')})`;
        params.push(...keys);
      }
    }

    query += ' ORDER BY weightage DESC, year DESC LIMIT 10';
    const rows = db.prepare(query).all(...params);

    const questions = rows.map(r => {
      let parsedOptions = [];
      try {
        parsedOptions = typeof r.options === 'string' ? JSON.parse(r.options) : r.options;
      } catch {
        parsedOptions = [r.options];
      }
      return {
        id: r.id,
        exam_key: r.exam_key,
        subject: r.subject,
        topic: r.topic,
        year: r.year,
        question: r.question,
        options: Array.isArray(parsedOptions) ? [...parsedOptions] : [],
        correct_index: r.correct_index,
        explanation: r.explanation,
        weightage: r.weightage,
        difficulty: r.difficulty,
        frequency_score: r.frequency_score
      };
    });

    // Anti-repetition guarantee for high-yield topics
    let prevHighYieldIndex = -1;
    for (const q of questions) {
      if (Array.isArray(q.options) && q.options.length >= 2) {
        if (q.correct_index === prevHighYieldIndex) {
          const oldIdx = q.correct_index;
          let newIdx = (oldIdx + 1) % q.options.length;
          if (newIdx === prevHighYieldIndex) {
            newIdx = (newIdx + 1) % q.options.length;
          }
          const correctText = q.options[oldIdx];
          q.options[oldIdx] = q.options[newIdx];
          q.options[newIdx] = correctText;
          q.correct_index = newIdx;
        }
        prevHighYieldIndex = q.correct_index;
      }
    }

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
    const { question_id, selected_index, selected_option } = req.body;
    if (!question_id || selected_index === undefined) {
      return res.status(400).json({ error: 'question_id and selected_index are required.' });
    }

    const question = db.prepare('SELECT * FROM pyq_questions WHERE id = ?').get(question_id);
    if (!question) {
      return res.status(404).json({ error: 'Question not found.' });
    }

    let isCorrect = Number(selected_index) === question.correct_index;
    if (!isCorrect && selected_option !== undefined) {
      let dbOptions = [];
      try { dbOptions = JSON.parse(question.options); } catch {}
      const correctText = dbOptions[question.correct_index];
      if (correctText && String(selected_option).trim() === correctText.trim()) {
        isCorrect = true;
      }
    }

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
    const { question_id, answer, selected_index, selected_option } = req.body;
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
      let isCorrect = idx === question.correct_index;

      if (!isCorrect && selected_option !== undefined) {
        let dbOptions = [];
        try { dbOptions = JSON.parse(question.options); } catch {}
        const correctText = dbOptions[question.correct_index];
        if (correctText && String(selected_option).trim() === correctText.trim()) {
          isCorrect = true;
        }
      }

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
