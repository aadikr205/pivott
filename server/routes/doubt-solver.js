const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const { authMiddleware } = require('../middleware/auth');
const { streamDoubtSolverResponse, generateSessionTitle } = require('../ai-streamer');

// POST /doubt-solver/sessions
// Create new chat session with target_exam
router.post('/sessions', authMiddleware, (req, res) => {
  try {
    const userId = req.user.id;
    const { target_exam, title } = req.body;

    const user = db.prepare('SELECT exam_name FROM users WHERE id = ?').get(userId);
    const finalExam = target_exam || user?.exam_name || 'NEET';
    const finalTitle = title || 'New Doubt Discussion';
    const now = new Date().toISOString();
    const sessionId = uuidv4();

    db.prepare(`
      INSERT INTO chat_sessions (id, user_id, target_exam, title, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(sessionId, userId, finalExam, finalTitle, now, now);

    const session = db.prepare('SELECT * FROM chat_sessions WHERE id = ?').get(sessionId);
    return res.status(201).json({ session });
  } catch (err) {
    console.error('Create chat session error:', err);
    return res.status(500).json({ error: 'Failed to create chat session.' });
  }
});

// GET /doubt-solver/sessions
// List all sessions for the authenticated user (for sidebar)
router.get('/sessions', authMiddleware, (req, res) => {
  try {
    const userId = req.user.id;
    const sessions = db.prepare(`
      SELECT 
        s.*,
        (SELECT COUNT(*) FROM chat_messages m WHERE m.session_id = s.id) as message_count,
        (SELECT content FROM chat_messages m WHERE m.session_id = s.id ORDER BY m.created_at DESC LIMIT 1) as last_preview
      FROM chat_sessions s
      WHERE s.user_id = ?
      ORDER BY s.updated_at DESC
    `).all(userId);

    return res.json({ sessions });
  } catch (err) {
    console.error('List chat sessions error:', err);
    return res.status(500).json({ error: 'Failed to list chat sessions.' });
  }
});

// GET /doubt-solver/sessions/:id
// Get full message history for a session
router.get('/sessions/:id', authMiddleware, (req, res) => {
  try {
    const userId = req.user.id;
    const sessionId = req.params.id;

    const session = db.prepare('SELECT * FROM chat_sessions WHERE id = ? AND user_id = ?').get(sessionId, userId);
    if (!session) {
      return res.status(404).json({ error: 'Chat session not found.' });
    }

    const messages = db.prepare(`
      SELECT id, session_id, role, content, created_at
      FROM chat_messages
      WHERE session_id = ?
      ORDER BY created_at ASC
    `).all(sessionId);

    return res.json({ session, messages });
  } catch (err) {
    console.error('Get chat session error:', err);
    return res.status(500).json({ error: 'Failed to retrieve chat session.' });
  }
});

// POST /doubt-solver/sessions/:id/message
// Send a new message, streams assistant response back via SSE
router.post('/sessions/:id/message', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const sessionId = req.params.id;
    const { content, target_exam } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Message content is required.' });
    }

    const session = db.prepare('SELECT * FROM chat_sessions WHERE id = ? AND user_id = ?').get(sessionId, userId);
    if (!session) {
      return res.status(404).json({ error: 'Chat session not found.' });
    }

    // Optionally update target exam if passed
    let activeExam = session.target_exam;
    if (target_exam && target_exam !== session.target_exam) {
      db.prepare('UPDATE chat_sessions SET target_exam = ?, updated_at = ? WHERE id = ?')
        .run(target_exam, new Date().toISOString(), sessionId);
      activeExam = target_exam;
    }

    // Save user message
    const now = new Date().toISOString();
    const userMsgId = uuidv4();
    db.prepare(`
      INSERT INTO chat_messages (id, session_id, role, content, created_at)
      VALUES (?, ?, 'user', ?, ?)
    `).run(userMsgId, sessionId, content.trim(), now);

    const userMessage = {
      id: userMsgId,
      session_id: sessionId,
      role: 'user',
      content: content.trim(),
      created_at: now
    };

    // Fetch prior messages in chronological order for conversation context
    const priorMessages = db.prepare(`
      SELECT role, content
      FROM chat_messages
      WHERE session_id = ?
      ORDER BY created_at ASC
    `).all(sessionId);

    // Setup SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    if (res.flushHeaders) res.flushHeaders();

    // Notify client that user message was stored
    res.write(`data: ${JSON.stringify({ type: 'user_saved', message: userMessage })}\n\n`);

    // Stream AI response
    let assistantMsgId = uuidv4();
    let accumulatedContent = '';

    await streamDoubtSolverResponse({
      targetExam: activeExam,
      messages: priorMessages,
      onChunk: (chunk) => {
        accumulatedContent += chunk;
        res.write(`data: ${JSON.stringify({ type: 'chunk', text: chunk })}\n\n`);
      },
      onDone: async (fullText) => {
        const completedAt = new Date().toISOString();
        const finalText = fullText || accumulatedContent;

        // Save assistant message in DB
        db.prepare(`
          INSERT INTO chat_messages (id, session_id, role, content, created_at)
          VALUES (?, ?, 'assistant', ?, ?)
        `).run(assistantMsgId, sessionId, finalText, completedAt);

        // Auto-generate title if this was the first exchange or title is default
        let updatedTitle = session.title;
        const totalCount = db.prepare('SELECT COUNT(*) as count FROM chat_messages WHERE session_id = ?').get(sessionId).count;
        if (totalCount <= 2 || session.title === 'New Doubt Discussion') {
          updatedTitle = generateSessionTitle(content.trim());
          db.prepare('UPDATE chat_sessions SET title = ?, updated_at = ? WHERE id = ?')
            .run(updatedTitle, completedAt, sessionId);
        } else {
          db.prepare('UPDATE chat_sessions SET updated_at = ? WHERE id = ?')
            .run(completedAt, sessionId);
        }

        const assistantMessage = {
          id: assistantMsgId,
          session_id: sessionId,
          role: 'assistant',
          content: finalText,
          created_at: completedAt
        };

        res.write(`data: ${JSON.stringify({
          type: 'done',
          message: assistantMessage,
          title: updatedTitle
        })}\n\n`);
        res.end();
      },
      onError: (err) => {
        console.error('[DoubtSolver Stream Error]:', err);
        res.write(`data: ${JSON.stringify({ type: 'error', error: err.message || 'Stream generation failed' })}\n\n`);
        res.end();
      }
    });

  } catch (err) {
    console.error('Send message error:', err);
    if (!res.headersSent) {
      return res.status(500).json({ error: 'Failed to process doubt message.' });
    }
    res.end();
  }
});

// PATCH /doubt-solver/sessions/:id
// Update target_exam or title
router.patch('/sessions/:id', authMiddleware, (req, res) => {
  try {
    const userId = req.user.id;
    const sessionId = req.params.id;
    const { target_exam, title } = req.body;

    const session = db.prepare('SELECT * FROM chat_sessions WHERE id = ? AND user_id = ?').get(sessionId, userId);
    if (!session) {
      return res.status(404).json({ error: 'Chat session not found.' });
    }

    const updates = [];
    const params = [];
    if (target_exam) {
      updates.push('target_exam = ?');
      params.push(target_exam);
    }
    if (title) {
      updates.push('title = ?');
      params.push(title);
    }
    updates.push('updated_at = ?');
    params.push(new Date().toISOString());

    params.push(sessionId);
    db.prepare(`UPDATE chat_sessions SET ${updates.join(', ')} WHERE id = ?`).run(...params);

    const updated = db.prepare('SELECT * FROM chat_sessions WHERE id = ?').get(sessionId);
    return res.json({ session: updated });
  } catch (err) {
    console.error('Update session error:', err);
    return res.status(500).json({ error: 'Failed to update chat session.' });
  }
});

// DELETE /doubt-solver/sessions/:id
// Delete a chat session
router.delete('/sessions/:id', authMiddleware, (req, res) => {
  try {
    const userId = req.user.id;
    const sessionId = req.params.id;

    const session = db.prepare('SELECT * FROM chat_sessions WHERE id = ? AND user_id = ?').get(sessionId, userId);
    if (!session) {
      return res.status(404).json({ error: 'Chat session not found.' });
    }

    db.prepare('DELETE FROM chat_sessions WHERE id = ?').run(sessionId);
    return res.json({ success: true, id: sessionId });
  } catch (err) {
    console.error('Delete session error:', err);
    return res.status(500).json({ error: 'Failed to delete chat session.' });
  }
});

module.exports = router;
