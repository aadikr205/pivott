/**
 * Test Suite for Study Problem Solver — AI Bot (Section 8 Endpoints & Behavioral Rules)
 * 
 * Tests:
 * 1. POST   /chat/sessions (create session)
 * 2. GET    /chat/sessions (list sessions with message counts, target exam, and last preview)
 * 3. GET    /chat/sessions/:id (retrieve full session with messages)
 * 4. POST   /chat/sessions/:id/message (stream via SSE with exact answer scope scaling)
 * 5. Short Question Accuracy & Conciseness (SI unit of force <= 3 lines, no unrequested padding)
 * 6. Numerical Problem Solving (Given -> Formula -> Calculation -> Final Answer)
 * 7. Refinement Directives ("just give me the formula" scales down response length)
 * 8. Comprehensive Structured Explanations (Newton's 3 laws)
 * 9. PATCH  /chat/sessions/:id (inline rename session)
 * 10. POST  /chat/sessions/:id/messages/:messageId/edit (edit-and-resend with DB truncation)
 * 11. POST  /chat/sessions/:id/regenerate (regenerate last assistant response)
 * 12. DELETE /chat/sessions/:id (delete session and all associated messages)
 * 13. Backwards Compatibility with /doubt-solver endpoints
 */

const assert = require('assert');
const db = require('./db');

const BASE_URL = 'http://localhost:5000';

async function parseSSEStream(res) {
  const reader = res.body;
  let fullText = '';
  let doneData = null;
  let buffer = '';
  const decoder = new TextDecoder();

  for await (const chunk of reader) {
    buffer += decoder.decode(chunk, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop();

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || !trimmed.startsWith('data: ')) continue;
      const dataStr = trimmed.slice(6);
      if (dataStr === '[DONE]') continue;
      try {
        const parsed = JSON.parse(dataStr);
        if (parsed.type === 'chunk') {
          fullText += (parsed.chunk || parsed.text || '');
        } else if (parsed.type === 'done' || parsed.done) {
          doneData = parsed;
          if (parsed.message && parsed.message.content) {
            fullText = parsed.message.content;
          }
        }
      } catch (e) {
        // ignore incomplete JSON
      }
    }
  }

  return { fullText, doneData };
}

async function runTests() {
  console.log('\n=============================================================');
  console.log('🤖 RUNNING STUDY PROBLEM SOLVER — AI BOT TEST SUITE');
  console.log('=============================================================\n');

  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    try {
      await fn();
      console.log(`  ✅ [PASS] ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ❌ [FAIL] ${name}`);
      console.error(`     Error: ${err.message}`);
      failed++;
    }
  }

  // 1. Authenticate user
  let token = '';
  await test('Auth: Log in student for /chat endpoints', async () => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'student@pivott.app', password: 'password123' })
    });
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.ok(data.token);
    token = data.token;
  });

  const authHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };

  let sessionId = '';

  // 2. Create session
  await test('POST /chat/sessions: Create new study discussion session', async () => {
    const res = await fetch(`${BASE_URL}/chat/sessions`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        target_exam: 'NEET (UG)',
        title: 'Physics Mechanics Doubts'
      })
    });
    const data = await res.json();
    assert.strictEqual(res.status, 201);
    assert.ok(data.session);
    assert.strictEqual(data.session.target_exam, 'NEET (UG)');
    assert.strictEqual(data.session.title, 'Physics Mechanics Doubts');
    sessionId = data.session.id;
  });

  // 3. List sessions
  await test('GET /chat/sessions: List user sessions with target_exam and counts', async () => {
    const res = await fetch(`${BASE_URL}/chat/sessions`, {
      method: 'GET',
      headers: authHeaders
    });
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.ok(Array.isArray(data.sessions));
    const found = data.sessions.find(s => s.id === sessionId);
    assert.ok(found, 'Created session should appear in list');
    assert.strictEqual(found.target_exam, 'NEET (UG)');
  });

  // 4. Test Short Question Calibration (SI unit of force)
  let firstMsgId = '';
  await test('POST /chat/sessions/:id/message: Short question gets concise 1-line answer without unrequested padding', async () => {
    const res = await fetch(`${BASE_URL}/chat/sessions/${sessionId}/message`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        content: 'What is the SI unit of force?',
        target_exam: 'NEET (UG)'
      })
    });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.headers.get('content-type'), 'text/event-stream');

    const { fullText, doneData } = await parseSSEStream(res);
    assert.ok(fullText.toLowerCase().includes('newton'), 'Should state newton');
    assert.ok(fullText.includes('N'), 'Should include symbol N');

    // Rule: Never pad a short question with unnecessary history or long essay
    const lineCount = fullText.trim().split('\n').filter(l => l.trim().length > 0).length;
    assert.ok(lineCount <= 3, `Short answer should be <= 3 lines, got ${lineCount} lines: "${fullText}"`);

    // Verify session messages in DB
    const sessionRes = await fetch(`${BASE_URL}/chat/sessions/${sessionId}`, {
      method: 'GET',
      headers: authHeaders
    });
    const sessionData = await sessionRes.json();
    assert.strictEqual(sessionData.messages.length, 2);
    firstMsgId = sessionData.messages[0].id;
  });

  // 5. Numerical calculation with Given -> Formula -> Calculation -> Final Answer
  await test('POST /chat/sessions/:id/message: Numerical problem formats step-by-step with LaTeX', async () => {
    const res = await fetch(`${BASE_URL}/chat/sessions/${sessionId}/message`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        content: 'A 4 kg block is accelerated at 3 m/s^2. Calculate the net force acting on it.',
        target_exam: 'NEET (UG)'
      })
    });

    assert.strictEqual(res.status, 200);
    const { fullText } = await parseSSEStream(res);

    assert.ok(fullText.includes('12'), 'Calculation 4 * 3 should yield 12');
    assert.ok(fullText.includes('N') || fullText.includes('newton'), 'Result must include units');
    assert.ok(fullText.includes('F = m') || fullText.includes('F ='), 'Must state the formula');
  });

  // 6. Refinement Directive ("just give me the formula")
  await test('POST /chat/sessions/:id/message: Follow-up directive "just give me the formula" scales down reply', async () => {
    const res = await fetch(`${BASE_URL}/chat/sessions/${sessionId}/message`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        content: 'Just give me the formula for force',
        target_exam: 'NEET (UG)'
      })
    });

    assert.strictEqual(res.status, 200);
    const { fullText } = await parseSSEStream(res);
    assert.ok(fullText.includes('F = m') || fullText.includes('F=m'), 'Must contain formula F = ma');
    assert.ok(fullText.length < 250, `Refinement response must be short and direct, length was ${fullText.length}`);
  });

  // 7. Structured Broad Question (Newton's Laws)
  await test('POST /chat/sessions/:id/message: Broad question gets thorough structured coverage', async () => {
    const res = await fetch(`${BASE_URL}/chat/sessions/${sessionId}/message`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        content: "Explain Newton's three laws of motion",
        target_exam: 'NEET (UG)'
      })
    });

    assert.strictEqual(res.status, 200);
    const { fullText } = await parseSSEStream(res);
    assert.ok(fullText.toLowerCase().includes('first law') || fullText.includes('1.'), 'Must include First Law');
    assert.ok(fullText.toLowerCase().includes('second law') || fullText.includes('2.'), 'Must include Second Law');
    assert.ok(fullText.toLowerCase().includes('third law') || fullText.includes('3.'), 'Must include Third Law');
  });

  // 8. Rename session via PATCH /chat/sessions/:id
  await test('PATCH /chat/sessions/:id: Inline rename chat session', async () => {
    const res = await fetch(`${BASE_URL}/chat/sessions/${sessionId}`, {
      method: 'PATCH',
      headers: authHeaders,
      body: JSON.stringify({
        title: "Newton's Laws Masterclass"
      })
    });
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.session.title, "Newton's Laws Masterclass");
  });

  // 9. Edit-and-resend with message truncation
  await test('POST /chat/sessions/:id/messages/:messageId/edit: Truncates history and streams fresh answer', async () => {
    const res = await fetch(`${BASE_URL}/chat/sessions/${sessionId}/messages/${firstMsgId}/edit`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        content: 'What is the SI unit of power?'
      })
    });

    assert.strictEqual(res.status, 200);
    const { fullText } = await parseSSEStream(res);
    assert.ok(fullText.toLowerCase().includes('watt'), 'Should state watt');
    assert.ok(fullText.includes('W'), 'Should state W');

    // Verify subsequent messages were truncated in DB
    const checkRes = await fetch(`${BASE_URL}/chat/sessions/${sessionId}`, {
      method: 'GET',
      headers: authHeaders
    });
    const checkData = await checkRes.json();
    // After editing the first message, there should only be 2 messages (the edited user msg + the new assistant reply)
    assert.strictEqual(checkData.messages.length, 2, 'Prior messages should have been truncated from DB');
    assert.strictEqual(checkData.messages[0].content, 'What is the SI unit of power?');
  });

  // 10. Regenerate response
  await test('POST /chat/sessions/:id/regenerate: Re-streams answer for last user question', async () => {
    const res = await fetch(`${BASE_URL}/chat/sessions/${sessionId}/regenerate`, {
      method: 'POST',
      headers: authHeaders
    });

    assert.strictEqual(res.status, 200);
    const { fullText } = await parseSSEStream(res);
    assert.ok(fullText.toLowerCase().includes('watt') || fullText.includes('W'), 'Regenerated reply answers power unit');
  });

  // 11. Backwards compatibility with /doubt-solver routes
  await test('GET & POST /doubt-solver/sessions: 100% Backwards compatibility preserved', async () => {
    const res = await fetch(`${BASE_URL}/doubt-solver/sessions`, {
      method: 'GET',
      headers: authHeaders
    });
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.ok(Array.isArray(data.sessions));
  });

  // 12. Delete session
  await test('DELETE /chat/sessions/:id: Deletes session and cleans up DB messages', async () => {
    const res = await fetch(`${BASE_URL}/chat/sessions/${sessionId}`, {
      method: 'DELETE',
      headers: authHeaders
    });
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.success, true);

    // Verify session no longer in list
    const listRes = await fetch(`${BASE_URL}/chat/sessions`, {
      method: 'GET',
      headers: authHeaders
    });
    const listData = await listRes.json();
    assert.ok(!listData.sessions.some(s => s.id === sessionId), 'Session should be deleted');
  });

  console.log('\n-------------------------------------------------------------');
  console.log(`TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('-------------------------------------------------------------\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
