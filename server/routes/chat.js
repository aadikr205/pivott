const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const { authMiddleware } = require('../middleware/auth');
const { streamDoubtSolverResponse, generateSessionTitle } = require('../ai-streamer');

/**
 * POST /chat/sessions
 * Create a new chat session
 */
router.post('/sessions', authMiddleware, (req, res) => {
  try {
    const userId = req.user.id;
    const { target_exam, title, subject } = req.body;

    const user = db.prepare('SELECT exam_name FROM users WHERE id = ?').get(userId);
    const finalExam = target_exam || user?.exam_name || 'General Academic';
    const finalTitle = title || 'New Study Discussion';
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

/**
 * GET /chat/sessions
 * List all sessions for the user with message count and preview
 */
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

/**
 * GET /chat/sessions/:id
 * Get full message history for a session
 */
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

/**
 * POST /chat/sessions/:id/message
 * Send a new user message and stream assistant response via Server-Sent Events (SSE)
 */
router.post(['/sessions/:id/message', '/sessions/:id/stream'], authMiddleware, async (req, res) => {
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

    // Optionally update target context if specified
    let activeExam = session.target_exam;
    if (target_exam && target_exam !== session.target_exam) {
      db.prepare('UPDATE chat_sessions SET target_exam = ?, updated_at = ? WHERE id = ?')
        .run(target_exam, new Date().toISOString(), sessionId);
      activeExam = target_exam;
    }

    // Save user message in DB
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
        res.write(`data: ${JSON.stringify({ type: 'chunk', chunk, text: chunk })}\n\n`);
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
        if (totalCount <= 2 || session.title === 'New Study Discussion' || session.title === 'New Doubt Discussion') {
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
          done: true,
          message: assistantMessage,
          title: updatedTitle
        })}\n\n`);
        res.end();
      },
      onError: (err) => {
        console.error('[StudySolver Stream Error]:', err);
        res.write(`data: ${JSON.stringify({ type: 'error', error: err.message || 'Stream generation failed' })}\n\n`);
        res.end();
      }
    });

  } catch (err) {
    console.error('Send message error:', err);
    if (!res.headersSent) {
      return res.status(500).json({ error: 'Failed to process chat message.' });
    }
    res.end();
  }
});

/**
 * PATCH /chat/sessions/:id
 * Rename a session or update its target exam
 */
router.patch('/sessions/:id', authMiddleware, (req, res) => {
  try {
    const userId = req.user.id;
    const sessionId = req.params.id;
    const { title, target_exam } = req.body;

    const session = db.prepare('SELECT * FROM chat_sessions WHERE id = ? AND user_id = ?').get(sessionId, userId);
    if (!session) {
      return res.status(404).json({ error: 'Chat session not found.' });
    }

    const updates = [];
    const params = [];
    if (title !== undefined) {
      updates.push('title = ?');
      params.push(title.trim());
    }
    if (target_exam !== undefined) {
      updates.push('target_exam = ?');
      params.push(target_exam.trim());
    }

    if (updates.length > 0) {
      updates.push('updated_at = ?');
      params.push(new Date().toISOString());
      params.push(sessionId);
      db.prepare(`UPDATE chat_sessions SET ${updates.join(', ')} WHERE id = ?`).run(...params);
    }

    const updated = db.prepare('SELECT * FROM chat_sessions WHERE id = ?').get(sessionId);
    return res.json({ session: updated });
  } catch (err) {
    console.error('Rename session error:', err);
    return res.status(500).json({ error: 'Failed to update chat session.' });
  }
});

/**
 * DELETE /chat/sessions/:id
 * Delete a chat session and all its messages
 */
router.delete('/sessions/:id', authMiddleware, (req, res) => {
  try {
    const userId = req.user.id;
    const sessionId = req.params.id;

    const session = db.prepare('SELECT * FROM chat_sessions WHERE id = ? AND user_id = ?').get(sessionId, userId);
    if (!session) {
      return res.status(404).json({ error: 'Chat session not found.' });
    }

    db.prepare('DELETE FROM chat_messages WHERE session_id = ?').run(sessionId);
    db.prepare('DELETE FROM chat_sessions WHERE id = ?').run(sessionId);

    return res.json({ success: true, id: sessionId });
  } catch (err) {
    console.error('Delete session error:', err);
    return res.status(500).json({ error: 'Failed to delete chat session.' });
  }
});

/**
 * POST /chat/sessions/:id/messages/:messageId/edit
 * Edit-and-resend a previous question. Truncates and deletes all messages from messageId onward,
 * inserts the updated user question, and streams the new response via SSE.
 */
router.post('/sessions/:id/messages/:messageId/edit', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const sessionId = req.params.id;
    const messageId = req.params.messageId;
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Edited content is required.' });
    }

    const session = db.prepare('SELECT * FROM chat_sessions WHERE id = ? AND user_id = ?').get(sessionId, userId);
    if (!session) {
      return res.status(404).json({ error: 'Chat session not found.' });
    }

    const targetMsg = db.prepare('SELECT * FROM chat_messages WHERE id = ? AND session_id = ?').get(messageId, sessionId);
    if (!targetMsg) {
      return res.status(404).json({ error: 'Target message to edit was not found.' });
    }

    // Delete target message and all subsequent messages in this session
    db.prepare(`
      DELETE FROM chat_messages 
      WHERE session_id = ? AND created_at >= ?
    `).run(sessionId, targetMsg.created_at);

    // Insert new edited user message
    const now = new Date().toISOString();
    const newUserMsgId = uuidv4();
    db.prepare(`
      INSERT INTO chat_messages (id, session_id, role, content, created_at)
      VALUES (?, ?, 'user', ?, ?)
    `).run(newUserMsgId, sessionId, content.trim(), now);

    const userMessage = {
      id: newUserMsgId,
      session_id: sessionId,
      role: 'user',
      content: content.trim(),
      created_at: now
    };

    // Fetch prior messages
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

    res.write(`data: ${JSON.stringify({ type: 'user_saved', message: userMessage })}\n\n`);

    let assistantMsgId = uuidv4();
    let accumulatedContent = '';

    await streamDoubtSolverResponse({
      targetExam: session.target_exam,
      messages: priorMessages,
      onChunk: (chunk) => {
        accumulatedContent += chunk;
        res.write(`data: ${JSON.stringify({ type: 'chunk', chunk, text: chunk })}\n\n`);
      },
      onDone: async (fullText) => {
        const completedAt = new Date().toISOString();
        const finalText = fullText || accumulatedContent;

        db.prepare(`
          INSERT INTO chat_messages (id, session_id, role, content, created_at)
          VALUES (?, ?, 'assistant', ?, ?)
        `).run(assistantMsgId, sessionId, finalText, completedAt);

        db.prepare('UPDATE chat_sessions SET updated_at = ? WHERE id = ?').run(completedAt, sessionId);

        const assistantMessage = {
          id: assistantMsgId,
          session_id: sessionId,
          role: 'assistant',
          content: finalText,
          created_at: completedAt
        };

        res.write(`data: ${JSON.stringify({
          type: 'done',
          done: true,
          message: assistantMessage,
          title: session.title
        })}\n\n`);
        res.end();
      },
      onError: (err) => {
        console.error('[StudySolver Edit Stream Error]:', err);
        res.write(`data: ${JSON.stringify({ type: 'error', error: err.message || 'Edit stream generation failed' })}\n\n`);
        res.end();
      }
    });

  } catch (err) {
    console.error('Edit message error:', err);
    if (!res.headersSent) {
      return res.status(500).json({ error: 'Failed to edit and resend message.' });
    }
    res.end();
  }
});

/**
 * POST /chat/sessions/:id/regenerate
 * Deletes the last assistant message and re-streams response using current session context
 */
router.post('/sessions/:id/regenerate', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const sessionId = req.params.id;

    const session = db.prepare('SELECT * FROM chat_sessions WHERE id = ? AND user_id = ?').get(sessionId, userId);
    if (!session) {
      return res.status(404).json({ error: 'Chat session not found.' });
    }

    // Find the last assistant message and remove it
    const lastMsg = db.prepare(`
      SELECT * FROM chat_messages 
      WHERE session_id = ? 
      ORDER BY created_at DESC 
      LIMIT 1
    `).get(sessionId);

    if (lastMsg && lastMsg.role === 'assistant') {
      db.prepare('DELETE FROM chat_messages WHERE id = ?').run(lastMsg.id);
    }

    const priorMessages = db.prepare(`
      SELECT role, content
      FROM chat_messages
      WHERE session_id = ?
      ORDER BY created_at ASC
    `).all(sessionId);

    if (priorMessages.length === 0) {
      return res.status(400).json({ error: 'No messages to regenerate.' });
    }

    // Setup SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    if (res.flushHeaders) res.flushHeaders();

    let assistantMsgId = uuidv4();
    let accumulatedContent = '';

    await streamDoubtSolverResponse({
      targetExam: session.target_exam,
      messages: priorMessages,
      onChunk: (chunk) => {
        accumulatedContent += chunk;
        res.write(`data: ${JSON.stringify({ type: 'chunk', chunk, text: chunk })}\n\n`);
      },
      onDone: async (fullText) => {
        const completedAt = new Date().toISOString();
        const finalText = fullText || accumulatedContent;

        db.prepare(`
          INSERT INTO chat_messages (id, session_id, role, content, created_at)
          VALUES (?, ?, 'assistant', ?, ?)
        `).run(assistantMsgId, sessionId, finalText, completedAt);

        db.prepare('UPDATE chat_sessions SET updated_at = ? WHERE id = ?').run(completedAt, sessionId);

        const assistantMessage = {
          id: assistantMsgId,
          session_id: sessionId,
          role: 'assistant',
          content: finalText,
          created_at: completedAt
        };

        res.write(`data: ${JSON.stringify({
          type: 'done',
          done: true,
          message: assistantMessage,
          title: session.title
        })}\n\n`);
        res.end();
      },
      onError: (err) => {
        console.error('[StudySolver Regenerate Error]:', err);
        res.write(`data: ${JSON.stringify({ type: 'error', error: err.message || 'Regeneration failed' })}\n\n`);
        res.end();
      }
    });

  } catch (err) {
    console.error('Regenerate error:', err);
    if (!res.headersSent) {
      return res.status(500).json({ error: 'Failed to regenerate response.' });
    }
    res.end();
  }
});

module.exports = router;
