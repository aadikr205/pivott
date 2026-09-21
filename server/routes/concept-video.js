const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const { authMiddleware } = require('../middleware/auth');
const { logActivity } = require('../activity-logger');

// Generate 6 structured slides with speech script and 10 targeted MCQs
function generateVideoContent(topicName, subjectName) {
  const safeTopic = topicName || 'Core Topic';
  const safeSubject = subjectName || 'General Science';

  const slides = [
    {
      title: `1. Introduction & Fundamental Definition`,
      bullet_points: [
        `Key focus area: ${safeTopic} within ${safeSubject}.`,
        `Formal scientific definition and core context in competitive examinations.`,
        `Fundamental quantities, dimensional analysis, and standard SI units.`,
        `Why this concept is critical for multi-step analytical reasoning.`
      ],
      equation_or_rule: `Core Scope: ${safeTopic}`,
      narration_script: `Welcome to this concept briefing on ${safeTopic}. In ${safeSubject}, mastering this concept requires understanding both its strict theoretical foundation and practical applications. Pay close attention to standard units, boundary constraints, and typical exam problem patterns.`,
      diagram_mermaid: `graph LR\n  A[${safeSubject}] --> B[${safeTopic}]\n  B --> C[Foundations]\n  B --> D[Applications]`
    },
    {
      title: `2. Governing Laws & Essential Equations`,
      bullet_points: [
        `Primary mathematical equations defining rate, energy, or equilibrium states.`,
        `Proportionality factors and constant values required for numerical calculations.`,
        `Valid conditions under which standard formulas apply (e.g. ideal states, constant acceleration).`,
        `Variable identification and isolating the unknown parameter algebraically first.`
      ],
      equation_or_rule: `Governing Principle: Relationship between state variables and equilibrium constants`,
      narration_script: `Next, examine the governing equations. When solving numerical questions in ${safeTopic}, always isolate the unknown variable symbolically before substituting numerical values. Ensure all given quantities are converted into consistent standard units to prevent arithmetic mistakes.`,
      diagram_mermaid: `graph TD\n  Inputs[Given Variables] --> Check[Unit Standardization]\n  Check --> Eq[Algebraic Formulation]\n  Eq --> Output[Accurate Result]`
    },
    {
      title: `3. Conceptual Mechanics & Physical Intuition`,
      bullet_points: [
        `Visualizing the microscopic or underlying mechanics driving observed behaviors.`,
        `Conservation principles: Identifying conserved quantities (energy, momentum, mass, or charge).`,
        `How altering external parameters (temperature, pressure, voltage, resistance) shifts the system.`,
        `Qualitative trend analysis frequently tested in conceptual assertion-reasoning questions.`
      ],
      equation_or_rule: `Conservation Law: Total System Invariants remain constant during transitions`,
      narration_script: `Let's build physical intuition. When an external parameter is varied, look for invariant properties that do not change. Identifying conserved quantities immediately reduces mathematical complexity and allows you to predict qualitative shifts accurately.`,
      diagram_mermaid: `graph LR\n  Disturbance[Perturbation] --> Response[System Adjustment]\n  Response --> Invariant[Conserved Core]`
    },
    {
      title: `4. Visual Architecture & Process Flow`,
      bullet_points: [
        `Step-by-step schematic illustrating sequential phases of the mechanism.`,
        `Key transition states, inflection points, and asymptotic boundaries.`,
        `Interpreting graphical trends: Slopes, intercepts, and enclosed areas under curves.`,
        `Rapid graph analysis shortcuts for timed examination environments.`
      ],
      equation_or_rule: `Graphical Insight: Slope = Rate of Change | Area = Accumulated Quantity`,
      narration_script: `In competitive tests, questions frequently provide graphs rather than direct numbers. Remember that the slope of a curve represents the instantaneous rate of change, while the integral or area beneath the curve represents the total accumulated quantity.`,
      diagram_mermaid: `flowchart TD\n  Start[Initial State] --> Process[Dynamic Transition]\n  Process --> Inflection[Critical Threshold]\n  Inflection --> Final[Stable Equilibrium]`
    },
    {
      title: `5. High-Yield Exam Pitfalls & Trap Avoidance`,
      bullet_points: [
        `Sign convention errors: Establishing a fixed reference coordinate axis beforehand.`,
        `Unit mismatch trap: Mixing non-standard units (e.g., cm³ vs m³, minutes vs seconds).`,
        `Extreme limit validation: Testing asymptotic behavior (approaching zero or infinity).`,
        `Distinguishing between necessary and sufficient conditions in statement-based questions.`
      ],
      equation_or_rule: `Trap Warning: Always establish sign convention and verify extreme boundary cases`,
      narration_script: `Examiners intentionally design distractors around common student mistakes. The most frequent errors involve coordinate sign reversals, mixing mismatched units, or applying formulas outside their valid domain. Always test whether your final expression behaves reasonably at zero or infinity.`,
      diagram_mermaid: `graph TD\n  Trap[Common Exam Trap] --> Sign[Sign Inversion]\n  Trap --> Unit[Unit Inconsistency]\n  Trap --> Domain[Invalid Domain]`
    },
    {
      title: `6. Master Synthesis & Final Checklist`,
      bullet_points: [
        `Summary of core formulas for quick-glance active revision.`,
        `Standard 4-step problem-solving sequence: Given -> Formula -> Algebra -> Arithmetic.`,
        `Confidence threshold: Aim for at least 7 out of 10 in the immediate post-video retention quiz.`,
        `Ready to verify mastery through the targeted check questions.`
      ],
      equation_or_rule: `Target Mastery: ≥ 70% retention score on the unlocked quiz`,
      narration_script: `You have completed the core concept briefing for ${safeTopic}. You are now ready to verify your immediate retention through the 10-question post-video quiz. Take your time, read each prompt carefully, and apply the principles we just reviewed.`,
      diagram_mermaid: `graph LR\n  Concept[Step 1: Notes] --> Video[Step 2: Video Briefing] --> Quiz[Step 3: 10-Q Quiz] --> Mastery[Mastery Confirmed]`
    }
  ];

  // 10 Targeted MCQs in strict English
  const quiz = [
    {
      question: `What is the foundational principle governing ${safeTopic}?`,
      options: [
        `Rigorous conservation of core invariants under defined boundary conditions`,
        `Arbitrary fluctuations without any predictable physical constraints`,
        `Exclusive dependence on non-standard empirical constants`,
        `Complete independence from all initial and boundary conditions`
      ],
      correct_index: 0,
      explanation: `Physical systems in ${safeTopic} strictly obey conservation of invariant quantities under specified boundary constraints.`
    },
    {
      question: `When setting up a numerical calculation in ${safeTopic}, which sequence is recommended to minimize errors?`,
      options: [
        `Substitute numeric values immediately before writing formulas`,
        `Standardize units, formulate symbolic algebraic relations first, then substitute values`,
        `Round off every intermediate decimal aggressively`,
        `Omit units during calculations and guess the final exponent`
      ],
      correct_index: 1,
      explanation: `Formulating algebraic expressions symbolically first prevents compounding rounding errors and allows easy verification of dimensional consistency.`
    },
    {
      question: `What does the area enclosed under a rate-versus-time graph represent in this context?`,
      options: [
        `The instantaneous second derivative of the system`,
        `The total accumulated quantity or displacement over that duration`,
        `The dimensionless ratio of initial to final states`,
        `The maximum instantaneous error margin`
      ],
      correct_index: 1,
      explanation: `Integrating a rate curve with respect to time yields the total accumulated quantity over the specified interval.`
    },
    {
      question: `Which factor is the most common cause of sign errors when analyzing ${safeTopic}?`,
      options: [
        `Failure to define and adhere to a single consistent reference coordinate system`,
        `Working strictly in standard International Metric (SI) units`,
        `Checking asymptotic limits at infinity`,
        `Drawing free-body diagrams or process flowcharts`
      ],
      correct_index: 0,
      explanation: `Inconsistent coordinate frames and changing sign conventions halfway through a problem cause the majority of sign errors.`
    },
    {
      question: `How does testing extreme limit behavior (e.g. parameter approaching 0 or infinity) benefit the student?`,
      options: [
        `It acts as a rapid sanity check to verify whether formulas match known physical limits`,
        `It replaces the need to perform any actual mathematical derivation`,
        `It alters the fundamental constants of nature for that problem`,
        `It is purely decorative and offers no diagnostic value`
      ],
      correct_index: 0,
      explanation: `Evaluating expressions at asymptotic boundaries confirms whether the model smoothly reduces to known simplified states.`
    },
    {
      question: `Under what circumstance do standard governing formulas for ${safeTopic} cease to be directly applicable?`,
      options: [
        `When the system operates strictly within its designated linear range`,
        `When assumptions such as ideal conditions or constant parameters are violated`,
        `Whenever standard SI units are used`,
        `When equilibrium has been stably achieved`
      ],
      correct_index: 1,
      explanation: `Formulas derived under idealizations (e.g. constant acceleration, ideal gas behavior) fail when their underlying premises are violated.`
    },
    {
      question: `In qualitative exam questions concerning ${safeTopic}, what should be identified first when a perturbation occurs?`,
      options: [
        `The conserved invariant properties that remain unchanged`,
        `The most complex non-linear equation available`,
        `Random elimination of the longest answer choice`,
        `Arbitrary inversion of the dependent variable`
      ],
      correct_index: 0,
      explanation: `Identifying conserved quantities provides an immediate invariant anchor, making qualitative deductions straightforward.`
    },
    {
      question: `What distinguishes an expert problem-solving approach in ${safeTopic} from rote memorization?`,
      options: [
        `Memorizing numerical solutions from previous years without understanding principles`,
        `Recognizing underlying structural patterns and applying core governing relations systematically`,
        `Always choosing option C whenever uncertain`,
        `Relying solely on dimensional guessing without validating physical mechanisms`
      ],
      correct_index: 1,
      explanation: `Expert solvers identify structural patterns, governing constraints, and invariant laws rather than relying on memorized formulas.`
    },
    {
      question: `Which dimensional check helps confirm that a derived equation for ${safeTopic} is physically plausible?`,
      options: [
        `Ensuring both sides of the equation possess identical fundamental dimensions`,
        `Verifying that all terms have different dimensions so they cancel out`,
        `Ignoring exponents and coefficients completely`,
        `Confirming the expression has no mathematical units whatsoever`
      ],
      correct_index: 0,
      explanation: `By the principle of dimensional homogeneity, every additive term on both sides of a physical equation must possess identical dimensions.`
    },
    {
      question: `To achieve solid concept retention according to the Pivott study framework, what is the target score on this post-video quiz?`,
      options: [
        `At least 7 out of 10 (70%) correct answers`,
        `Exactly 1 out of 10 correct answers`,
        `Zero correct answers are required`,
        `Only completion of the video matters without any score threshold`
      ],
      correct_index: 0,
      explanation: `A score of 7 out of 10 or higher confirms solid immediate retention and marks the topic ready for advanced practice.`
    }
  ];

  return {
    slides,
    quiz,
    duration_seconds: slides.length * 30
  };
}

// GET /topics/:id/concept-video
router.get('/:id/concept-video', authMiddleware, (req, res) => {
  try {
    const topicId = req.params.id;

    // Get topic details
    const topic = db.prepare(`
      SELECT t.*, s.name as subject_name
      FROM topics t
      JOIN subjects s ON t.subject_id = s.id
      WHERE t.id = ?
    `).get(topicId);

    if (!topic) {
      return res.status(404).json({ error: 'Topic not found.' });
    }

    // Check if concept video is already cached in topic_videos table
    const cached = db.prepare('SELECT * FROM topic_videos WHERE topic_id = ?').get(topicId);

    if (cached && cached.slides && cached.quiz_questions) {
      try {
        const slides = JSON.parse(cached.slides || '[]');
        const quiz = JSON.parse(cached.quiz_questions || '[]');
        if (slides.length > 0 && quiz.length === 10) {
          return res.json({
            topic_id: topicId,
            title: cached.title || topic.name,
            subject_name: cached.subject_name || topic.subject_name,
            slides,
            quiz,
            duration_seconds: slides.length * 30
          });
        }
      } catch (parseErr) {
        // Fall through to generate fresh content
      }
    }

    // Generate fresh structured video content
    const content = generateVideoContent(topic.name, topic.subject_name);

    // Cache in topic_videos table
    const videoId = uuidv4();
    db.prepare(`
      INSERT OR REPLACE INTO topic_videos (id, topic_id, title, subject_name, slides, quiz_questions, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      videoId,
      topicId,
      topic.name,
      topic.subject_name,
      JSON.stringify(content.slides),
      JSON.stringify(content.quiz),
      new Date().toISOString()
    );

    return res.json({
      topic_id: topicId,
      title: topic.name,
      subject_name: topic.subject_name,
      slides: content.slides,
      quiz: content.quiz,
      duration_seconds: content.duration_seconds
    });
  } catch (err) {
    console.error('Get concept video error:', err);
    return res.status(500).json({ error: 'Failed to retrieve concept video.' });
  }
});

// POST /topics/:id/complete-video
router.post('/:id/complete-video', authMiddleware, (req, res) => {
  try {
    const userId = req.user.id;
    const topicId = req.params.id;

    const topic = db.prepare('SELECT name FROM topics WHERE id = ?').get(topicId);
    const topicName = topic ? topic.name : 'Topic';

    // Log immutable activity
    logActivity(
      userId,
      'timetable_progress',
      `Completed Interactive Concept Video on "${topicName}"`,
      { topic_id: topicId, topic_name: topicName, step: 'video', status: 'video_completed' },
      req.ip
    );

    return res.json({
      success: true,
      message: 'Interactive concept video completed! 10-Question quiz unlocked.',
      topic_id: topicId
    });
  } catch (err) {
    console.error('Complete video error:', err);
    return res.status(500).json({ error: 'Failed to record video completion.' });
  }
});

module.exports = router;
