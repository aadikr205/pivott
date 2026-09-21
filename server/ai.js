/**
 * Pivott AI Service
 * Supports Anthropic Claude and Google Gemini with robust deterministic fallbacks.
 * Section 7 Prompts & Fail-safe Non-AI Engines.
 */

// Heuristic Weightage Suggestions (Fallback)
const HIGH_WEIGHTAGE_KEYWORDS = [
  'calculus', 'integration', 'differentiation', 'thermodynamics', 'optics', 'mechanics',
  'genetics', 'organic', 'electrochemistry', 'kinetics', 'magnetism', 'circuits',
  'coordinate geometry', 'matrices', 'algebra', 'evolution', 'physiology', 'equilibrium',
  'polity', 'constitution', 'economy', 'algorithms', 'data structures', 'graphs', 'probability'
];

const LOW_WEIGHTAGE_KEYWORDS = [
  'introduction', 'units and dimensions', 'living world', 'environmental chemistry',
  'mathematical reasoning', 'solid state', 'communication systems', 'polymers', 'overview', 'definitions'
];

function fallbackSuggestWeightage(subjectName, topicName) {
  const text = `${subjectName} ${topicName}`.toLowerCase();
  for (const kw of HIGH_WEIGHTAGE_KEYWORDS) {
    if (text.includes(kw)) {
      return {
        weightage: 5,
        reason: `${topicName} is a high-yield core topic with frequent questions in standard exam papers.`
      };
    }
  }
  for (const kw of LOW_WEIGHTAGE_KEYWORDS) {
    if (text.includes(kw)) {
      return {
        weightage: 2,
        reason: `${topicName} is typically foundational or carries lower direct mark distribution.`
      };
    }
  }
  return {
    weightage: 3,
    reason: `Standard weightage topic for ${subjectName}; balanced coverage recommended.`
  };
}

// Fallback Re-plan Explanation (Section 7b)
function fallbackReplanExplanation({ keptCount, compressedCount, deferredCount, maxDailyHours, examName }) {
  const parts = [];
  parts.push(`We've rebalanced your schedule to keep your daily study time at a calm, doable maximum of ≤ ${maxDailyHours} hours.`);
  
  if (deferredCount > 0) {
    parts.push(`To protect your highest-yield topics, ${deferredCount} lower-impact topic${deferredCount > 1 ? 's were' : ' was'} deferred and ${compressedCount} compressed to quick-skim revision.`);
  } else if (compressedCount > 0) {
    parts.push(`All your core syllabus is preserved, with ${compressedCount} topic${compressedCount > 1 ? 's' : ''} shifted to efficient skim-revision.`);
  } else {
    parts.push(`All remaining topics have been smoothly redistributed across your available days without any cramming.`);
  }

  parts.push(`Your high-priority concepts remain safe, and you are fully on track for ${examName || 'your exam'}. Take a breath and take it one day at a time.`);
  return parts.join(' ');
}

// Fallback Micro-Copy (Section 7d)
const MICRO_COPY_BANK = [
  "Backlog handled — your simplified plan keeps you calm, focused, and completely on track.",
  "One missed day doesn't define your preparation. Your revised plan is realistic and ready.",
  "We protected your high-priority topics and capped your hours. You've got this.",
  "Syllabus re-balanced. No 14-hour cram days here — just steady, sustainable progress.",
  "Reset done. Focus on today's targets with a clear head."
];

function fallbackMicroCopy() {
  const idx = Math.floor(Math.random() * MICRO_COPY_BANK.length);
  return MICRO_COPY_BANK[idx];
}

// Shuffle options and recalculate correct_index so answers are uniformly distributed across A, B, C, D
function shuffleQuestionOptions(q) {
  if (!q || !Array.isArray(q.options) || q.options.length < 2) return q;

  const originalOptions = [...q.options];
  const validCorrectIdx = (Number.isInteger(q.correct_index) && q.correct_index >= 0 && q.correct_index < originalOptions.length)
    ? q.correct_index
    : 0;
  const correctText = originalOptions[validCorrectIdx];

  // Fisher-Yates shuffle of options array
  const shuffled = [...originalOptions];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  // Find new position of the correct answer
  const newIndex = shuffled.indexOf(correctText);

  return {
    ...q,
    options: shuffled,
    correct_index: newIndex >= 0 ? newIndex : 0
  };
}

// Comprehensive Question Bank Generator for Quizzes (Section 7c fallback)
// Provides 12 diverse exam question templates and shuffles both questions and options
function fallbackGenerateQuiz(subjectName, topicName) {
  const safeTopic = topicName || 'General Topic';
  const safeSubject = subjectName || 'Subject';

  const fullQuestionPool = [
    {
      question: `What is the primary foundational concept underlying ${safeTopic} in ${safeSubject}?`,
      options: [
        `Fundamental definitions and governing physical/mathematical laws`,
        `Arbitrary historical conventions with no theoretical basis`,
        `Empirical approximations applicable only at micro-scales`,
        `Isolated exceptions having no relevance to exam applications`
      ],
      correct_index: 0,
      explanation: `Mastering ${safeTopic} requires understanding the primary governing laws and core definitions from which all formulas and deductions derive.`
    },
    {
      question: `When solving numerical or conceptual problems in ${safeTopic}, which principle is most critical?`,
      options: [
        `Relying purely on rote memorization without sanity checks`,
        `Conservation principles and dimensional consistency`,
        `Discarding boundary constraints to simplify calculations`,
        `Assuming equilibrium conditions apply in all non-linear states`
      ],
      correct_index: 1,
      explanation: `Dimensional consistency and fundamental conservation/invariance laws provide immediate validation when tackling complex problems in ${safeTopic}.`
    },
    {
      question: `Which of the following is a classic common pitfall when answering exam questions on ${safeTopic}?`,
      options: [
        `Applying standardized units (SI units) throughout the problem`,
        `Confusing instantaneous state variables with cumulative integral quantities`,
        `Drawing free-body or state-transition diagrams prior to calculation`,
        `Double-checking algebraic signs in vector or differential equations`
      ],
      correct_index: 1,
      explanation: `A frequent source of negative marks in ${safeTopic} is mistaking instantaneous rates or values for total integrated effects.`
    },
    {
      question: `In standard competitive exam patterns, high-yield questions on ${safeTopic} usually test:`,
      options: [
        `Trivial definitions from the chapter index`,
        `Multi-concept integration with neighboring syllabus topics`,
        `Obsolete theories discarded in modern syllabi`,
        `Proof of lemmas that have no practical problem-solving utility`
      ],
      correct_index: 1,
      explanation: `Modern competitive exams favor hybrid questions connecting ${safeTopic} with adjacent topics in ${safeSubject}.`
    },
    {
      question: `Which strategy yields the highest retention and score improvement for ${safeTopic}?`,
      options: [
        `Passive re-reading of textbooks without solving problems`,
        `Active recall through spaced MCQs and timed problem sets`,
        `Cramming formulas 12 hours before the mock exam`,
        `Skipping core derivations and focusing only on edge cases`
      ],
      correct_index: 1,
      explanation: `Active problem-solving and immediate feedback reinforce synaptic recall significantly better than passive highlighting.`
    },
    {
      question: `What is the key takeaway rule when applying formulas in ${safeTopic}?`,
      options: [
        `Formulas are universally valid under any arbitrary constraint`,
        `Always verify boundary conditions and domain validity first`,
        `Constants can be ignored whenever time is constrained`,
        `Calculators or approximations eliminate the need for conceptual clarity`
      ],
      correct_index: 1,
      explanation: `Formulas in ${safeTopic} operate within specific valid domains; verifying assumptions and boundary conditions prevents misleading results.`
    },
    {
      question: `During the dimensional and unit analysis of equations in ${safeTopic}, which check is indispensable?`,
      options: [
        `Assuming terms with different physical dimensions can be added together`,
        `Verifying that both LHS and RHS match in fundamental base units`,
        `Converting standard SI units into non-standard arbitrary units`,
        `Neglecting dimensionless constants that carry geometric significance`
      ],
      correct_index: 1,
      explanation: `Dimensional homogeneity guarantees that every added term in an equation shares the exact same base units.`
    },
    {
      question: `In graphical representations related to ${safeTopic}, what does the slope or area under the curve typically signify?`,
      options: [
        `Random artifacts resulting from mathematical scaling without physical meaning`,
        `Key physical rates of change (derivative) or accumulated quantities (integral)`,
        `Constant static parameters that never vary with time or displacement`,
        `Unrelated variables that can be interchanged arbitrarily`
      ],
      correct_index: 1,
      explanation: `In graphical analysis, the tangent slope denotes rates of change (derivatives) while the area under the curve corresponds to accumulated quantities (definite integrals).`
    },
    {
      question: `When analyzing limiting or boundary cases in ${safeTopic}, what happens as key parameters approach extreme values (e.g., zero or infinity)?`,
      options: [
        `The system should smoothly reduce to well-known asymptotic or simplified states`,
        `All physical laws fail completely and unpredictably`,
        `Parameters always diverge to infinity without mathematical resolution`,
        `Boundary conditions have zero bearing on the physical validity of the model`
      ],
      correct_index: 0,
      explanation: `Testing asymptotic limits (e.g. x -> 0 or x -> inf) serves as a rapid sanity check to verify whether formulas match known physical realities.`
    },
    {
      question: `Which factor is most often responsible for sign errors in problems involving ${safeTopic}?`,
      options: [
        `Failing to establish a consistent coordinate frame and sign convention at the outset`,
        `Using standard metric units consistently throughout calculations`,
        `Writing down known parameters before substituting them into formulas`,
        `Cross-verifying intermediate values against physical intuition`
      ],
      correct_index: 0,
      explanation: `Defining a fixed reference coordinate system and maintaining sign conventions consistently avoids sign reversal mistakes.`
    },
    {
      question: `How should a student approach complex multi-step numerical problems in ${safeTopic}?`,
      options: [
        `Immediately substitute numerical values before writing algebraic relations`,
        `Formulate the complete algebraic expression symbolically first, then substitute values with units`,
        `Round off intermediate decimal values aggressively at every intermediate step`,
        `Guess the closest answer based solely on the order of magnitude without derivation`
      ],
      correct_index: 1,
      explanation: `Solving problems algebraically first reduces rounding errors, reveals potential unit cancellations, and simplifies final numerical substitution.`
    },
    {
      question: `What distinguishes master-level problem solving in ${safeTopic} from beginner-level solving?`,
      options: [
        `Memorizing every question type and attempting to recall solutions verbatim`,
        `Identifying the underlying core principles and recognizing invariant quantities`,
        `Spending maximum time on complex calculations while skipping conceptual setup`,
        `Relying exclusively on multiple-choice elimination without conceptual proof`
      ],
      correct_index: 1,
      explanation: `Expert problem solvers quickly detect invariants (energy, charge, mass, momentum) and apply governing constraints before performing calculations.`
    }
  ];

  // Randomly shuffle question pool to select 6 distinct questions
  const shuffledPool = [...fullQuestionPool];
  for (let i = shuffledPool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledPool[i], shuffledPool[j]] = [shuffledPool[j], shuffledPool[i]];
  }

  const selected = shuffledPool.slice(0, 6);

  // Randomly shuffle options for each selected question so correct answer is uniformly distributed across A, B, C, D
  return selected.map(q => shuffleQuestionOptions(q));
}

/**
 * Call Claude or Gemini API if environment variable is provided, else use fallback
 */
async function suggestWeightage(subjectName, topicName) {
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;

  if (anthropicKey) {
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': anthropicKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 200,
          system: 'You are an exam-prep assistant. Given a subject and topic name, return ONLY a JSON object: {"weightage": 1-5, "reason": "one short sentence"}. Base this on typical exam weightage patterns for this subject/topic.',
          messages: [{ role: 'user', content: `Subject: ${subjectName}, Topic: ${topicName}` }]
        })
      });

      if (response.ok) {
        const data = await response.json();
        const text = data.content?.[0]?.text;
        const match = text.match(/\{[\s\S]*\}/);
        if (match) {
          const parsed = JSON.parse(match[0]);
          return {
            weightage: Math.min(5, Math.max(1, Number(parsed.weightage) || 3)),
            reason: parsed.reason || 'AI-suggested weightage based on exam patterns.'
          };
        }
      }
    } catch (err) {
      console.warn('Anthropic API error, using fallback:', err.message);
    }
  }

  return fallbackSuggestWeightage(subjectName, topicName);
}

async function generateReplanExplanation(params) {
  const anthropicKey = process.env.ANTHROPIC_API_KEY;

  if (anthropicKey) {
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': anthropicKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 300,
          system: 'You are a calm, encouraging study coach. Given a list of topics kept, compressed, and deferred after a re-plan, write a short (3-4 sentence), reassuring, non-panicky explanation for a student. Mention what stays protected (high-priority topics) and that the plan is still realistic. Return plain text only.',
          messages: [{
            role: 'user',
            content: `Kept topics: ${params.keptCount}, Compressed to skim: ${params.compressedCount}, Deferred: ${params.deferredCount}, Max Daily Hours cap: ${params.maxDailyHours}h, Exam: ${params.examName}`
          }]
        })
      });

      if (response.ok) {
        const data = await response.json();
        const text = data.content?.[0]?.text;
        if (text && text.trim().length > 20) {
          return text.trim();
        }
      }
    } catch (err) {
      console.warn('Anthropic API error, using fallback explanation:', err.message);
    }
  }

  return fallbackReplanExplanation(params);
}

async function generateQuiz(subjectName, topicName) {
  const anthropicKey = process.env.ANTHROPIC_API_KEY;

  if (anthropicKey) {
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': anthropicKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 1500,
          system: `Generate a JSON array of 6 multiple-choice questions for the topic '${topicName}' under subject '${subjectName}', appropriate for exam-level difficulty. Always respond with the question, options, and explanation in English only, even if the input was in another language. Each item: {"question": "...", "options": ["A","B","C","D"], "correct_index": 0-3, "explanation": "..."}. Return ONLY valid JSON, no preamble.`,
          messages: [{ role: 'user', content: `Generate 6 MCQs for ${topicName} in ${subjectName}` }]
        })
      });

      if (response.ok) {
        const data = await response.json();
        const text = data.content?.[0]?.text;
        const match = text.match(/\[[\s\S]*\]/);
        if (match) {
          const parsed = JSON.parse(match[0]);
          if (Array.isArray(parsed) && parsed.length >= 3) {
            return parsed.map(q => shuffleQuestionOptions(q));
          }
        }
      }
    } catch (err) {
      console.warn('Anthropic API quiz generation error, using fallback:', err.message);
    }
  }

  return fallbackGenerateQuiz(subjectName, topicName);
}

const { solveStudentDoubtSmart } = require('./doubt-engine');

function fallbackSolveDoubt({ doubt, examName, subjectName, topicName }) {
  return solveStudentDoubtSmart({ doubt, examName, subjectName, topicName });
}

async function solveStudentDoubt({ doubt, examName, subjectName, topicName, conversationHistory = [] }) {
  return solveStudentDoubtSmart({ doubt, examName, subjectName, topicName, conversationHistory });
}

async function generateMicroCopy() {
  return fallbackMicroCopy();
}

module.exports = {
  suggestWeightage,
  generateReplanExplanation,
  generateQuiz,
  generateMicroCopy,
  shuffleQuestionOptions,
  solveStudentDoubt,
  fallbackSuggestWeightage,
  fallbackReplanExplanation,
  fallbackGenerateQuiz,
  fallbackMicroCopy,
  fallbackSolveDoubt
};

