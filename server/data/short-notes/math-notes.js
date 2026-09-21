/**
 * Mathematics Full Chapter Short Notes
 * High-yield revision notes, key theorems, master formulas, and exam traps
 */

const MATH_NOTES = [
  {
    id: 'math-calculus-derivatives-integrals',
    chapter_title: 'Calculus: Derivatives, Applications & Integrals',
    subject: 'Mathematics',
    class_level: 'Class 12 / JEE Main / JEE Advanced',
    applicable_exams: ['jee_main', 'jee', 'cbse12', 'cbse12_pcmb', 'bseb12'],
    read_time: '5 min read',
    high_yield: true,
    summary: 'Limits, L\'Hopital rule, derivative rules, maxima-minima, King property of definite integrals, and differential equations.',
    key_takeaways: [
      'L\'Hopital Rule: If lim f(x)/g(x) is of indeterminate form 0/0 or ∞/∞, then lim f(x)/g(x) = lim f\'(x)/g\'(x).',
      'Standard limit: lim (x→0) sin(x)/x = 1, lim (x→0) tan(x)/x = 1, lim (x→0) (e^x - 1)/x = 1, lim (x→0) ln(1 + x)/x = 1.',
      'Derivative tests: If f\'(x₀) = 0 and f\'\'(x₀) < 0 → Local Maximum. If f\'\'(x₀) > 0 → Local Minimum.',
      'Integration by Parts: ∫ u·v dx = u ∫ v dx - ∫ [u\' (∫ v dx)] dx. Use ILATE rule to choose first function u (Inverse, Log, Algebraic, Trig, Exp).',
      'King Property of Definite Integrals: ∫[a to b] f(x) dx = ∫[a to b] f(a + b - x) dx. (Crucial for solving sin^n(x) / (sin^n(x) + cos^n(x)) forms giving (b-a)/2).',
      'First Order Linear Differential Equation: dy/dx + P(x)·y = Q(x). Integrating Factor IF = e^(∫ P dx). Solution: y · (IF) = ∫ [Q · (IF)] dx + C.'
    ],
    formulas_and_laws: [
      { name: 'Chain Rule', formula: 'd/dx [f(g(x))] = f\'(g(x)) · g\'(x)', unit: 'Derivative operator' },
      { name: 'Standard Indefinite Integrals', formula: '∫ 1/(x² + a²) dx = (1/a) arctan(x/a) + C;  ∫ 1/√(a² - x²) dx = arcsin(x/a) + C', unit: 'Integral' },
      { name: 'King Property', formula: '∫[a to b] f(x) dx = ∫[a to b] f(a + b - x) dx', unit: 'Definite Integral' },
      { name: 'Leibniz Rule (Differentiation under integral)', formula: 'd/dx ∫[u(x) to v(x)] f(t) dt = f(v(x))·v\'(x) - f(u(x))·u\'(x)', unit: 'Calculus theorem' },
      { name: 'Linear D.E. Solution', formula: 'y · e^(∫ P dx) = ∫ [Q · e^(∫ P dx)] dx + C', unit: 'General solution' }
    ],
    exam_traps_and_tips: [
      'JEE CLASSIC TRAP: Always check continuity before using Mean Value Theorems (Rolle\'s or Lagrange\'s LMVT)! If function has a sharp corner or discontinuity in [a,b], MVT fails.',
      'KING PROPERTY SHORTCUT: For ∫[0 to π/2] [sin^k(x) / (sin^k(x) + cos^k(x))] dx, answer is ALWAYS (b - a)/2 = π/4 for ANY value of k!',
      'INTEGRATING FACTOR TRAP: In dy/dx + P·y = Q, ensure the coefficient of dy/dx is strictly 1 before identifying P(x).'
    ]
  },
  {
    id: 'math-matrices-determinants',
    chapter_title: 'Matrices, Determinants & Linear Systems',
    subject: 'Mathematics',
    class_level: 'Class 12 / JEE Main / JEE Advanced',
    applicable_exams: ['jee_main', 'jee', 'cbse12', 'cbse12_pcmb', 'bseb12'],
    read_time: '4 min read',
    high_yield: true,
    summary: 'Matrix properties, adjoint, determinant expansions, Cramer rule, and conditions for consistency of system of equations.',
    key_takeaways: [
      'Matrix multiplication is associative [A(BC) = (AB)C] but NOT commutative in general (AB ≠ BA).',
      'Transpose properties: (AB)^T = B^T · A^T (reversal law). (A + B)^T = A^T + B^T.',
      'Symmetric matrix: A^T = A. Skew-symmetric: A^T = -A (all diagonal elements of real skew-symmetric matrix are strictly ZERO).',
      'Determinant properties: |kA| = k^n · |A| (for n × n matrix). |AB| = |A| · |B|. |A^T| = |A|.',
      'Adjoint properties: A · adj(A) = adj(A) · A = |A| · I. Therefore A⁻¹ = adj(A) / |A| (exists if |A| ≠ 0).',
      '|adj(A)| = |A|^(n - 1). |adj(adj(A))| = |A|^((n - 1)²).',
      'System of equations AX = B: Unique solution if |A| ≠ 0; Infinite solutions if |A| = 0 and (adj A)·B = O; No solution (inconsistent) if |A| = 0 and (adj A)·B ≠ O.'
    ],
    formulas_and_laws: [
      { name: 'Determinant of Scalar Multiple', formula: '|k · A| = kⁿ · |A|   (where n is order of matrix)', unit: 'Scalar scaling' },
      { name: 'Inverse of 2×2 Matrix', formula: 'If A = [[a, b], [c, d]], then A⁻¹ = (1 / |A|) · [[d, -b], [-c, a]]', unit: 'Inverse formula' },
      { name: 'Determinant of Adjoint', formula: '|adj(A)| = |A|ⁿ⁻¹,   |adj(adj(A))| = |A|⁽ⁿ⁻¹⁾²', unit: 'Adjoint identities' },
      { name: 'Cramer Rule', formula: 'x = Δ_x / Δ,  y = Δ_y / Δ,  z = Δ_z / Δ  (valid when Δ ≠ 0)', unit: 'Linear solver' }
    ],
    exam_traps_and_tips: [
      'JEE COMMON TRAP: For 3×3 matrix, |2A| = 2³ · |A| = 8 |A|, NOT 2 |A|! Many students forget the power n.',
      'SKEW SYMMETRIC TRAP: The determinant of an ODD-ORDER skew-symmetric matrix is ALWAYS ZERO (|A| = 0).',
      'INVERSE TRAP: (AB)⁻¹ = B⁻¹ · A⁻¹ (order reverses!).'
    ]
  },
  {
    id: 'math-vectors-3d-geometry',
    chapter_title: 'Vectors & 3D Coordinate Geometry',
    subject: 'Mathematics',
    class_level: 'Class 12 / JEE Main / JEE Advanced',
    applicable_exams: ['jee_main', 'jee', 'cbse12', 'cbse12_pcmb', 'bseb12'],
    read_time: '4 min read',
    high_yield: true,
    summary: 'Dot product, cross product, scalar triple product, line equations, plane equations, and shortest distance between skew lines.',
    key_takeaways: [
      'Dot Product: a · b = |a||b| cos θ (scalar). If a · b = 0, vectors are perpendicular (for non-zero vectors).',
      'Cross Product: a × b = |a||b| sin θ · n̂ (vector perpendicular to both a and b). Area of parallelogram = |a × b|.',
      'Scalar Triple Product [a b c] = a · (b × c) represents volume of parallelepiped. If [a b c] = 0, vectors are coplanar.',
      'Equation of a line passing through point a with direction vector b: r = a + λ·b.',
      'Shortest Distance between skew lines r = a₁ + λ·b₁ and r = a₂ + μ·b₂: d = |(a₂ - a₁) · (b₁ × b₂)| / |b₁ × b₂|.',
      'Angle between two lines with direction cosines (l₁, m₁, n₁) and (l₂, m₂, n₂): cos θ = |l₁l₂ + m₁m₂ + n₁n₂|.'
    ],
    formulas_and_laws: [
      { name: 'Dot Product', formula: 'a · b = a₁b₁ + a₂b₂ + a₃b₃ = |a||b| cos θ', unit: 'Scalar' },
      { name: 'Cross Product Magnitude', formula: '|a × b| = |a||b| sin θ,   Area of triangle = 1/2 |a × b|', unit: 'Vector magnitude' },
      { name: 'Shortest Distance (Skew Lines)', formula: 'd = |(a₂ - a₁) · (b₁ × b₂)| / |b₁ × b₂|', unit: 'Distance (units)' },
      { name: 'Distance of Point from Plane', formula: 'd = |Ax₁ + By₁ + Cz₁ + D| / √(A² + B² + C²)', unit: 'Distance (units)' }
    ],
    exam_traps_and_tips: [
      'PARALLEL LINES DISTANCE TRAP: If b₁ and b₂ are parallel (b₁ = k·b₂), use formula d = |(a₂ - a₁) × b| / |b|, NOT the skew lines formula!',
      'DIRECTION COSINES RULE: l² + m² + n² = 1, but for direction ratios a² + b² + c² ≠ 1 in general.',
      'VECTOR TRIPLE PRODUCT: a × (b × c) = (a · c)·b - (a · b)·c (mnemonic: BAC - CAB rule).'
    ]
  },
  {
    id: 'math-class10-algebra-trig',
    chapter_title: 'Class 10th: Quadratic Equations, AP & Trigonometry',
    subject: 'Mathematics',
    class_level: 'Class 10th Board (CBSE & State Boards)',
    applicable_exams: ['class10', 'bseb10'],
    read_time: '4 min read',
    high_yield: true,
    summary: 'Quadratic formula & discriminant, arithmetic progression formulas, trigonometric identities, and coordinate geometry distance/section formula.',
    key_takeaways: [
      'Quadratic Equation ax² + bx + c = 0: Roots x = [-b ± √(b² - 4ac)] / (2a). Discriminant D = b² - 4ac.',
      'Nature of roots: D > 0 (two distinct real roots), D = 0 (two equal real roots x = -b/2a), D < 0 (no real roots).',
      'Arithmetic Progression (AP): n-th term a_n = a + (n - 1)d. Sum of n terms S_n = n/2 [2a + (n - 1)d] = n/2 (a + l).',
      'If sum of n terms is given, n-th term can be found by: a_n = S_n - S_{n-1}.',
      'Trigonometric Identities: sin²θ + cos²θ = 1;  1 + tan²θ = sec²θ;  1 + cot²θ = cosec²θ.',
      'Coordinate Geometry: Distance formula d = √[(x₂ - x₁)² + (y₂ - y₁)²]. Section formula P(x, y) = [(m₁x₂ + m₂x₁)/(m₁ + m₂), (m₁y₂ + m₂y₁)/(m₁ + m₂)].'
    ],
    formulas_and_laws: [
      { name: 'Quadratic Formula', formula: 'x = [-b ± √(b² - 4ac)] / (2a),   Sum: α + β = -b/a,   Product: α·β = c/a', unit: 'Algebraic roots' },
      { name: 'AP n-th Term', formula: 'a_n = a + (n - 1) · d', unit: 'Sequence term' },
      { name: 'AP Sum of n Terms', formula: 'S_n = (n / 2) · [2a + (n - 1)d] = (n / 2) · (a + last_term)', unit: 'Sum' },
      { name: 'Pythagorean Trig Identities', formula: 'sin²θ + cos²θ = 1,   sec²θ - tan²θ = 1,   cosec²θ - cot²θ = 1', unit: 'Dimensionless ratio' },
      { name: 'Section Formula', formula: 'x = (m·x₂ + n·x₁) / (m + n),   y = (m·y₂ + n·y₁) / (m + n)', unit: 'Coordinate point' }
    ],
    exam_traps_and_tips: [
      'BOARD EXAM TRAP: If a quadratic equation has "equal roots", immediately set D = b² - 4ac = 0 to solve for unknown parameter k.',
      'TRIGONOMETRY TIP: When proving identities, convert tan, cot, sec, cosec into sin and cos first.',
      'STATISTICS RELATION: Empirical relation between central tendencies: Mode = 3 Median - 2 Mean.'
    ]
  }
];

module.exports = { MATH_NOTES };
