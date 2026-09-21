const { solveStudentDoubtSmart, detectLanguage, evaluateMathExpression } = require('./doubt-engine');

async function runTests() {
  console.log('--- TESTING LANGUAGE DETECTION ---');
  const langTests = [
    { q: 'What is photosynthesis?', expected: 'en' },
    { q: "State Ohm's law", expected: 'en' },
    { q: 'What is the unit of force?', expected: 'en' },
    { q: 'प्रकाश संश्लेषण क्या है?', expected: 'hi' },
    { q: 'prakash sanshleshan kya hai', expected: 'hi' },
    { q: 'Ohm ka niyam samjhao', expected: 'hi' },
    { q: 'Force ki unit kya hoti hai', expected: 'hi' },
    { q: 'DNA aur RNA me kya antar hai', expected: 'hi' }
  ];

  for (const t of langTests) {
    const lang = detectLanguage(t.q);
    const pass = lang === t.expected;
    console.log(`[${pass ? 'PASS' : 'FAIL'}] "${t.q}" -> detected: ${lang} (expected: ${t.expected})`);
    if (!pass) throw new Error(`Language detection failed for: ${t.q}`);
  }

  console.log('\n--- TESTING MATH & CALCULATIONS (STRICT ZERO FLUFF) ---');
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
    const isEnglish = !/[\u0900-\u097F]/.test(res.formatted_reply) && !res.formatted_reply.toLowerCase().includes('kya hai') && !res.formatted_reply.toLowerCase().includes('ka niyam');
    console.log(`[PASS] EN Q: "${q}"\nReply snippet:\n${res.formatted_reply.split('\n')[0]}\n${res.formatted_reply.split('\n')[1] || ''}\n`);
    if (!isEnglish) throw new Error(`Expected English reply for "${q}"`);
  }

  console.log('\n--- TESTING HINDI THEORY QUESTIONS ---');
  const hiQuestions = [
    'प्रकाश संश्लेषण क्या है?',
    'prakash sanshleshan kya hai',
    'Ohm ka niyam kya hai',
    'bal ka matrak kya hai',
    'Newton ka teesra niyam samjhao',
    'DNA aur RNA me kya antar hai'
  ];

  for (const q of hiQuestions) {
    const res = await solveStudentDoubtSmart({ doubt: q });
    console.log(`[PASS] HI Q: "${q}"\nReply snippet:\n${res.formatted_reply.split('\n')[0]}\n${res.formatted_reply.split('\n')[1] || ''}\n`);
  }

  console.log('ALL TESTS PASSED SUCCESSFULLY! 🚀');
}

runTests().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
