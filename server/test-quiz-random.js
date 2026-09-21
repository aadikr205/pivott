const assert = require('assert');
const { generateQuiz, shuffleQuestionOptions } = require('./ai');

async function testQuizRandomness() {
  console.log('--- Testing Quiz Options Randomization & Uniform Distribution ---');

  // Test 1: Unit test for shuffleQuestionOptions
  const mockQ = {
    question: 'What is 2 + 2?',
    options: ['3', '4', '5', '6'],
    correct_index: 1, // '4'
    explanation: 'Basic math'
  };

  const shuffledPositions = new Set();
  for (let i = 0; i < 50; i++) {
    const shuffled = shuffleQuestionOptions(mockQ);
    assert.strictEqual(shuffled.options.length, 4, 'Options length must remain 4');
    assert.strictEqual(shuffled.options[shuffled.correct_index], '4', 'Correct answer text must match new correct_index');
    shuffledPositions.add(shuffled.correct_index);
  }
  console.log('Shuffled positions visited for mock question:', Array.from(shuffledPositions).sort());
  assert.strictEqual(shuffledPositions.size, 4, 'All 4 positions (0, 1, 2, 3 / A, B, C, D) must be reached over multiple shuffles');

  // Test 2: Statistical distribution across 100 quizzes (600 questions)
  const counts = { 0: 0, 1: 0, 2: 0, 3: 0 };
  const numQuizzes = 100;
  let totalQuestions = 0;

  for (let i = 0; i < numQuizzes; i++) {
    const quiz = await generateQuiz('Physics', 'Kinematics & Projectile Motion');
    assert.strictEqual(quiz.length, 6, 'Each quiz must have 6 questions');

    for (const q of quiz) {
      assert.strictEqual(q.options.length, 4, 'Question must have 4 options');
      assert(q.correct_index >= 0 && q.correct_index <= 3, 'correct_index must be between 0 and 3');
      counts[q.correct_index]++;
      totalQuestions++;
    }
  }

  console.log(`\nTotal questions analyzed: ${totalQuestions}`);
  const labels = ['A (index 0)', 'B (index 1)', 'C (index 2)', 'D (index 3)'];
  for (let i = 0; i <= 3; i++) {
    const pct = ((counts[i] / totalQuestions) * 100).toFixed(1);
    console.log(`Option ${labels[i]}: ${counts[i]} times (${pct}%)`);
    assert(counts[i] > 0, `Option ${labels[i]} must appear at least once`);
    // Expected is ~25%, assert reasonable range [18%, 32%]
    assert(counts[i] >= totalQuestions * 0.18 && counts[i] <= totalQuestions * 0.32,
      `Option ${labels[i]} count ${counts[i]} is out of reasonable random range [18%, 32%]`);
  }

  console.log('\n✓ ALL QUIZ RANDOMIZATION TESTS PASSED SUCCESSFULLY!');
}

testQuizRandomness().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
