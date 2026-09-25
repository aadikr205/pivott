const { solveStudentDoubtSmart, evaluateMathExpression } = require('./doubt-engine');

async function runTests() {
  console.log('--- TESTING MATH & CALCULATIONS (STRICT ZERO FLUFF) ---');
  const mathTests = [
    { q: '2+2', expected: '4' },
    { q: '15 * 14', expected: '210' },
    { q: 'sqrt(144)', expected: '12' },
    { q: '20% of 150', expected: '30' }
  ];

  for (const m of mathTests) {
    const res = await solveStudentDoubtSmart({ doubt: m.q });
    const pass = res.formatted_reply.trim() === m.expected;
    console.log(`[${pass ? 'PASS' : 'FAIL'}] Math: "${m.q}" -> "${res.formatted_reply}" (expected: "${m.expected}")`);
    if (!pass) throw new Error(`Math failed for: ${m.q}`);
  }

  console.log('\n--- TESTING ENGLISH THEORY QUESTIONS ---');
  const enQuestions = [
    'What is photosynthesis?',
    "State Ohm's Law",
    'What is the unit of force?',
    "Explain Newton's third law",
    'Difference between DNA and RNA',
    'What is quadratic equation?'
  ];

  for (const q of enQuestions) {
    const res = await solveStudentDoubtSmart({ doubt: q });
    const isEnglish = !/[\u0900-\u097F]/.test(res.formatted_reply);
    console.log(`[PASS] EN Q: "${q}"\nReply snippet:\n${res.formatted_reply.split('\n')[0]}\n${res.formatted_reply.split('\n')[1] || ''}\n`);
    if (!isEnglish) throw new Error(`Expected English reply for "${q}"`);
  }

  console.log('ALL TESTS PASSED SUCCESSFULLY! 🚀');
}

runTests().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
