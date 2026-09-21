/**
 * Pivott Knowledge Search Engine (RAG)
 * 
 * Searches across:
 * 1. Full Chapter Short Notes (Physics, Chemistry, Biology, Mathematics across all Target Exams)
 * 2. 10-Year PYQ Question Bank (SQLite pyq_questions: NEET, JEE, CBSE, BSEB)
 * 3. Core Scientific Formulas, Laws, and Exam Traps
 */

const db = require('./db');
const { ALL_SHORT_NOTES } = require('./data/short-notes');

// Tokenize and clean text for search scoring
function tokenize(text) {
  if (!text || typeof text !== 'string') return [];
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(t => t.length > 2);
}

/**
 * Search across full chapter short notes
 */
function searchShortNotes(query, { exam = '', subject = '' } = {}) {
  if (!query || !query.trim()) return [];

  const queryTokens = tokenize(query);
  if (queryTokens.length === 0) return [];

  const results = [];

  for (const note of ALL_SHORT_NOTES) {
    let score = 0;
    const titleTokens = tokenize(note.chapter_title);
    const summaryTokens = tokenize(note.summary);
    const subjectLower = note.subject.toLowerCase();
    const queryLower = query.toLowerCase();

    // Subject matching bonus
    if (subject && subjectLower === subject.toLowerCase()) {
      score += 5;
    }

    // Exam matching bonus
    if (exam && Array.isArray(note.applicable_exams)) {
      if (note.applicable_exams.some(e => e.toLowerCase() === exam.toLowerCase())) {
        score += 5;
      }
    }

    // Direct title phrase match
    if (note.chapter_title.toLowerCase().includes(queryLower)) {
      score += 40;
    }

    // Title token overlap & direct matches
    for (const qToken of queryTokens) {
      if (titleTokens.includes(qToken)) score += 35;
      if (summaryTokens.includes(qToken)) score += 8;
      if (subjectLower === qToken) score += 10;
    }

    // Match in formulas
    const matchedFormulas = [];
    if (Array.isArray(note.formulas_and_laws)) {
      for (const item of note.formulas_and_laws) {
        const itemTokens = tokenize(`${item.name} ${item.formula}`);
        const hits = queryTokens.filter(t => itemTokens.includes(t) || (item.name && item.name.toLowerCase().includes(t)));
        if (hits.length > 0) {
          score += 30 * hits.length;
          matchedFormulas.push(item);
        }
      }
    }

    // Match in key takeaways
    const matchedTakeaways = [];
    if (Array.isArray(note.key_takeaways)) {
      for (const point of note.key_takeaways) {
        const pointTokens = tokenize(point);
        const hits = queryTokens.filter(t => pointTokens.includes(t));
        if (hits.length > 0) {
          score += 6 * hits.length;
          matchedTakeaways.push(point);
        }
      }
    }

    // Match in exam traps
    const matchedTraps = [];
    if (Array.isArray(note.exam_traps_and_tips)) {
      for (const trap of note.exam_traps_and_tips) {
        const trapTokens = tokenize(trap);
        const hits = queryTokens.filter(t => trapTokens.includes(t));
        if (hits.length > 0) {
          score += 6 * hits.length;
          matchedTraps.push(trap);
        }
      }
    }

    if (score > 10) {
      results.push({
        chapter_id: note.id,
        chapter_title: note.chapter_title,
        subject: note.subject,
        class_level: note.class_level,
        applicable_exams: note.applicable_exams,
        summary: note.summary,
        matchedFormulas: matchedFormulas.length > 0 ? matchedFormulas : note.formulas_and_laws?.slice(0, 3),
        matchedTakeaways: matchedTakeaways.length > 0 ? matchedTakeaways.slice(0, 3) : note.key_takeaways?.slice(0, 3),
        matchedTraps: matchedTraps.length > 0 ? matchedTraps.slice(0, 2) : note.exam_traps_and_tips?.slice(0, 2),
        score
      });
    }
  }

  return results.sort((a, b) => b.score - a.score).slice(0, 3);
}

/**
 * Search across 10-Year PYQ Question Bank in SQLite
 */
function searchPYQBank(query, { exam = '', subject = '', limit = 2 } = {}) {
  try {
    const tokens = tokenize(query);
    if (tokens.length === 0) return [];

    // Filter out very common stopwords
    const stopwords = ['what', 'which', 'when', 'where', 'how', 'why', 'who', 'the', 'and', 'for', 'with', 'explain', 'define', 'state'];
    const searchTerms = tokens.filter(t => !stopwords.includes(t)).slice(0, 4);
    if (searchTerms.length === 0) return [];

    let sql = `
      SELECT id, exam_key, subject, topic, year, question, explanation, difficulty, frequency_score
      FROM pyq_questions
      WHERE 1=1
    `;
    const params = [];

    if (subject) {
      sql += ' AND subject = ?';
      params.push(subject);
    }
    if (exam && exam !== 'all') {
      sql += " AND (exam_key = ? OR exam_key = 'neet' OR exam_key = 'jee_main')";
      params.push(exam);
    }

    // Match against question or topic or explanation
    const whereClauses = [];
    for (const term of searchTerms) {
      whereClauses.push('(question LIKE ? OR topic LIKE ? OR explanation LIKE ?)');
      params.push(`%${term}%`, `%${term}%`, `%${term}%`);
    }

    if (whereClauses.length > 0) {
      sql += ` AND (${whereClauses.join(' OR ')})`;
    }

    sql += ' ORDER BY year DESC LIMIT ?';
    params.push(limit);

    return db.prepare(sql).all(...params);
  } catch (err) {
    console.error('Error querying PYQ bank in search engine:', err.message);
    return [];
  }
}

/**
 * Unified Knowledge Search Engine Entry Point
 */
function searchKnowledge({ query, examName = '', subjectName = '', topicName = '' }) {
  const cleanQuery = (query || '').trim();
  if (!cleanQuery) return { chapters: [], pyqs: [], combinedContext: '' };

  const fullSearchQuery = topicName ? `${cleanQuery} ${topicName}` : cleanQuery;

  // 1. Search Chapter Short Notes
  const matchedChapters = searchShortNotes(fullSearchQuery, {
    exam: examName,
    subject: subjectName
  });

  // 2. Search PYQ Bank
  const matchedPYQs = searchPYQBank(cleanQuery, {
    exam: examName,
    subject: subjectName,
    limit: 2
  });

  // 3. Compile compact context string for ChatGPT grounding
  const contextParts = [];

  if (matchedChapters.length > 0) {
    const topChap = matchedChapters[0];
    contextParts.push(`[Grounding Chapter: ${topChap.chapter_title} (${topChap.subject}, ${topChap.class_level})]`);
    contextParts.push(`Summary: ${topChap.summary}`);

    if (topChap.matchedFormulas && topChap.matchedFormulas.length > 0) {
      const formText = topChap.matchedFormulas
        .map(f => `• ${f.name}: ${f.formula}${f.unit ? ` (${f.unit})` : ''}`)
        .join('\n');
      contextParts.push(`Key Formulas:\n${formText}`);
    }

    if (topChap.matchedTakeaways && topChap.matchedTakeaways.length > 0) {
      const takeText = topChap.matchedTakeaways.map(t => `• ${t}`).join('\n');
      contextParts.push(`Core Concepts:\n${takeText}`);
    }

    if (topChap.matchedTraps && topChap.matchedTraps.length > 0) {
      const trapText = topChap.matchedTraps.map(t => `• ${t}`).join('\n');
      contextParts.push(`Exam Traps & Tips:\n${trapText}`);
    }
  }

  if (matchedPYQs.length > 0) {
    contextParts.push('\n[Recent Exam Previous Year Questions]:');
    for (const q of matchedPYQs) {
      contextParts.push(`• [${q.exam_key.toUpperCase()} ${q.year} - ${q.topic}]: ${q.question}\n  Key Principle: ${q.explanation.slice(0, 180)}...`);
    }
  }

  return {
    chapters: matchedChapters,
    pyqs: matchedPYQs,
    groundingChapter: matchedChapters[0] || null,
    groundingPYQ: matchedPYQs[0] || null,
    combinedContext: contextParts.join('\n')
  };
}

module.exports = {
  tokenize,
  searchShortNotes,
  searchPYQBank,
  searchKnowledge
};
