/**
 * CBSE 12th Board High-Yield Important Revision Question Bank
 * Curated Previous 10 Years Most Repeated Board Exam Questions (2016 - 2025)
 * 
 * Strict Constraint: 0 Devanagari characters across all questions, options, and explanations.
 * Covers all CBSE Class 12 Core & Elective Subjects:
 * - Physics
 * - Chemistry
 * - Mathematics
 * - Biology
 * - English
 * - Hindi (Clean Romanized Transliteration)
 * - Computer Science
 * - Physical Education
 * 
 * Each question is calibrated with:
 * - weightage: 5 (High-mark board questions)
 * - difficulty: 'High Yield'
 * - frequency_score: '⭐ Highly Important / Repeated in Board Exams'
 * - Comprehensive step-by-step revision explanation & formula tips.
 */

const CBSE_12_IMPORTANT_QUESTIONS = [
  // ==========================================
  // PHYSICS - HIGH YIELD BOARD REVISION PYQs
  // ==========================================
  {
    id: 'cbse12-imp-phy-1',
    subject: 'Physics',
    topic: 'Electric Charges & Fields (Gauss Law)',
    year: 2024,
    type: 'mcq',
    question: 'According to Gauss\'s Law in electrostatics, what is the net electric flux passing through a closed Gaussian surface enclosing an electric dipole of dipole moment p = 2a * q?',
    options: [
      'Zero (0)',
      'q / ε₀',
      '2q / ε₀',
      'p / (4πε₀)'
    ],
    correct_index: 0,
    explanation: 'Gauss\'s Law states that the total electric flux through any closed surface is equal to Φ = q_enclosed / ε₀. An electric dipole consists of two equal and opposite charges (+q and -q). Therefore, the net enclosed charge is q_net = (+q) + (-q) = 0. Hence, the net electric flux Φ = 0. ⭐ Board Revision Tip: Frequently asked 1-mark & 2-mark question in Section A/B.',
    weightage: 5,
    difficulty: 'High Yield',
    frequency_score: '⭐ Highly Important / Repeated in Board Exams'
  },
  {
    id: 'cbse12-imp-phy-2',
    subject: 'Physics',
    topic: 'Ray Optics (Lens Maker Formula)',
    year: 2023,
    type: 'mcq',
    question: 'A double convex lens of refractive index μ = 1.5 has both radii of curvature equal to R = 20 cm. What is the focal length of this convex lens in air?',
    options: [
      '+20 cm',
      '+10 cm',
      '+40 cm',
      '+15 cm'
    ],
    correct_index: 0,
    explanation: 'Using the Lens Maker\'s Formula: 1/f = (μ - 1) * (1/R₁ - 1/R₂). For an equi-convex lens in air: R₁ = +20 cm and R₂ = -20 cm. Substituting: 1/f = (1.5 - 1) * [1/20 - (-1/20)] = 0.5 * (2/20) = 0.5 * (1/10) = 1/20. Thus, focal length f = +20 cm. ⭐ Board Revision Tip: Double convex lens with μ = 1.5 always has focal length f = R.',
    weightage: 5,
    difficulty: 'High Yield',
    frequency_score: '⭐ Highly Important / Repeated in Board Exams'
  },
  {
    id: 'cbse12-imp-phy-3',
    subject: 'Physics',
    topic: 'Alternating Current (Series LCR Resonance)',
    year: 2024,
    type: 'mcq',
    question: 'In a series LCR alternating current circuit at electrical resonance, which of the following statements is strictly correct?',
    options: [
      'Impedance Z is minimum and equal to pure resistance R (Power Factor = 1)',
      'Current is minimum and power dissipation is zero',
      'Inductive reactance X_L is strictly greater than capacitive reactance X_C',
      'The phase difference between voltage and current is 90 degrees'
    ],
    correct_index: 0,
    explanation: 'At electrical resonance in a series LCR circuit, inductive reactance equals capacitive reactance: X_L = X_C (ωL = 1/ωC). The impedance Z = √(R² + (X_L - X_C)²) reduces to minimum Z = R. Consequently, current amplitude is maximum I_max = V/R, phase angle φ = 0, and power factor cos(φ) = 1. ⭐ Board Revision Tip: Resonant frequency formula ω₀ = 1/√(LC) is repeated in 2024, 2022, and 2019 CBSE boards.',
    weightage: 5,
    difficulty: 'High Yield',
    frequency_score: '⭐ Highly Important / Repeated in Board Exams'
  },
  {
    id: 'cbse12-imp-phy-4',
    subject: 'Physics',
    topic: 'Electromagnetic Induction (Faraday & Lenz Law)',
    year: 2025,
    type: 'mcq',
    question: 'Lenz\'s law of electromagnetic induction is a direct consequence of which fundamental physical conservation law?',
    options: [
      'Conservation of Energy',
      'Conservation of Linear Momentum',
      'Conservation of Electric Charge',
      'Conservation of Mass'
    ],
    correct_index: 0,
    explanation: 'Lenz\'s Law states that the polarity of induced EMF is such that it produces an induced current whose magnetic field opposes the change in magnetic flux producing it. Mechanical work done against this opposing magnetic force is converted into electrical energy. Thus, Lenz\'s law directly upholds the Law of Conservation of Energy. ⭐ Board Revision Tip: Essential 2-mark conceptual question.',
    weightage: 5,
    difficulty: 'High Yield',
    frequency_score: '⭐ Highly Important / Repeated in Board Exams'
  },
  {
    id: 'cbse12-imp-phy-5',
    subject: 'Physics',
    topic: 'Semiconductor Electronics (p-n Junction)',
    year: 2024,
    type: 'mcq',
    question: 'When a p-n junction diode is forward biased by connecting p-side to positive terminal and n-side to negative terminal, what happens to the depletion region width and barrier potential?',
    options: [
      'Both depletion region width and barrier potential decrease',
      'Depletion region width increases while barrier potential decreases',
      'Both depletion region width and barrier potential increase',
      'Depletion layer width remains constant'
    ],
    correct_index: 0,
    explanation: 'Under forward bias, the applied external voltage opposes the built-in barrier potential (V_eff = V_0 - V). Holes in p-region and electrons in n-region are pushed toward the junction, causing the depletion layer width to decrease and effective barrier height to lower, allowing majority carrier current to flow readily. ⭐ Board Revision Tip: Contrast with Reverse Bias where depletion width increases and only minority leakage current flows.',
    weightage: 5,
    difficulty: 'High Yield',
    frequency_score: '⭐ Highly Important / Repeated in Board Exams'
  },
  {
    id: 'cbse12-imp-phy-6',
    subject: 'Physics',
    topic: 'Dual Nature of Matter (Photoelectric Effect)',
    year: 2023,
    type: 'mcq',
    question: 'In a photoelectric effect experiment, if the intensity of incident monochromatic light is doubled while keeping its frequency constant, what happens to the saturation photoelectric current and stopping potential?',
    options: [
      'Saturation current is doubled; stopping potential remains unchanged',
      'Both saturation current and stopping potential are doubled',
      'Stopping potential is doubled; saturation current remains unchanged',
      'Both remain unchanged'
    ],
    correct_index: 0,
    explanation: 'Photoelectric current is directly proportional to the number of photons striking the cathode per second (intensity). Doubling the intensity doubles the number of ejected photoelectrons and thus doubles the saturation current. Stopping potential depends strictly on maximum kinetic energy K_max = hν - Φ₀, which depends only on frequency ν and work function Φ₀, not intensity. ⭐ Board Revision Tip: Einstein Photoelectric Equation hν = Φ₀ + eV₀.',
    weightage: 5,
    difficulty: 'High Yield',
    frequency_score: '⭐ Highly Important / Repeated in Board Exams'
  },

  // ==========================================
  // CHEMISTRY - HIGH YIELD BOARD REVISION PYQs
  // ==========================================
  {
    id: 'cbse12-imp-chem-1',
    subject: 'Chemistry',
    topic: 'Solutions (Colligative Properties & Van\'t Hoff)',
    year: 2024,
    type: 'mcq',
    question: 'Which of the following 0.1 M aqueous solutions will exhibit the highest boiling point elevation (ΔT_b)?',
    options: [
      '0.1 M Al₂(SO₄)₃ (dissociates into 5 ions, i = 5)',
      '0.1 M BaCl₂ (dissociates into 3 ions, i = 3)',
      '0.1 M NaCl (dissociates into 2 ions, i = 2)',
      '0.1 M Glucose (non-electrolyte, i = 1)'
    ],
    correct_index: 0,
    explanation: 'Boiling point elevation is a colligative property given by ΔT_b = i * K_b * m. For 0.1 M Al₂(SO₄)₃, it completely dissociates into 2 Al³⁺ + 3 SO₄²⁻, yielding van\'t Hoff factor i = 5. Effective solute particle concentration is 5 * 0.1 = 0.5 M, which is the highest among all options, resulting in the greatest boiling point elevation. ⭐ Board Revision Tip: Van\'t Hoff factor calculation is a perennial 3-mark board favorite.',
    weightage: 5,
    difficulty: 'High Yield',
    frequency_score: '⭐ Highly Important / Repeated in Board Exams'
  },
  {
    id: 'cbse12-imp-chem-2',
    subject: 'Chemistry',
    topic: 'Electrochemistry (Nernst Equation)',
    year: 2024,
    type: 'mcq',
    question: 'For the standard Daniell cell Zn(s) | Zn²⁺(aq) || Cu²⁺(aq) | Cu(s), what is the standard cell potential E°_cell given E°(Cu²⁺/Cu) = +0.34 V and E°(Zn²⁺/Zn) = -0.76 V?',
    options: [
      '+1.10 V',
      '+0.42 V',
      '-1.10 V',
      '+0.98 V'
    ],
    correct_index: 0,
    explanation: 'Standard cell potential formula: E°_cell = E°_cathode - E°_anode. Cathode (reduction of Cu²⁺): E° = +0.34 V. Anode (oxidation of Zn): E° = -0.76 V. Therefore: E°_cell = 0.34 - (-0.76) = 0.34 + 0.76 = +1.10 V. Under non-standard concentrations, apply Nernst Equation: E_cell = E°_cell - (0.0591/n) * log([Zn²⁺]/[Cu²⁺]). ⭐ Board Revision Tip: Most repeated numerical in Electrochemistry.',
    weightage: 5,
    difficulty: 'High Yield',
    frequency_score: '⭐ Highly Important / Repeated in Board Exams'
  },
  {
    id: 'cbse12-imp-chem-3',
    subject: 'Chemistry',
    topic: 'Chemical Kinetics (First Order Integrated Rate Law)',
    year: 2025,
    type: 'mcq',
    question: 'A first-order chemical reaction has a rate constant k = 2.303 × 10⁻³ s⁻¹. What is the time required for 90% completion of this reaction?',
    options: [
      '1000 seconds',
      '500 seconds',
      '2000 seconds',
      '300 seconds'
    ],
    correct_index: 0,
    explanation: 'For a first-order reaction: t = (2.303 / k) * log([R]₀ / [R]). When reaction is 90% complete, remaining reactant [R] = [R]₀ - 0.90[R]₀ = 0.10[R]₀. Thus [R]₀ / [R] = 1 / 0.1 = 10. Substituting values: t = (2.303 / (2.303 × 10⁻³)) * log(10) = 10³ * 1 = 1000 seconds. ⭐ Board Revision Tip: Note the relation t_99.9% = 10 * t_1/2 and t_99% = 2 * t_90%.',
    weightage: 5,
    difficulty: 'High Yield',
    frequency_score: '⭐ Highly Important / Repeated in Board Exams'
  },
  {
    id: 'cbse12-imp-chem-4',
    subject: 'Chemistry',
    topic: 'Coordination Compounds (Crystal Field Theory)',
    year: 2023,
    type: 'mcq',
    question: 'In an octahedral complex [Fe(CN)₆]³⁻, what is the electronic configuration of the central iron ion Fe³⁺ (3d⁵) in the presence of strong field cyanide ligand CN⁻?',
    options: [
      't₂g⁵ eg⁰ (Low spin, 1 unpaired electron)',
      't₂g³ eg² (High spin, 5 unpaired electrons)',
      't₂g⁴ eg¹ (Intermediate spin, 3 unpaired electrons)',
      't₂g² eg³ (Paramagnetic, 5 unpaired electrons)'
    ],
    correct_index: 0,
    explanation: 'Fe³⁺ has a 3d⁵ electronic configuration. The cyanide ion (CN⁻) is a strong field ligand according to the spectrochemical series, which creates large crystal field splitting Δ₀ > P (pairing energy). Hence, all 5 electrons pair up in the lower energy t₂g orbitals before filling eg: t₂g⁵ eg⁰. This results in a low-spin complex with 1 unpaired electron (magnetic moment μ = √3 = 1.73 BM). ⭐ Board Revision Tip: Essential CFT reasoning question.',
    weightage: 5,
    difficulty: 'High Yield',
    frequency_score: '⭐ Highly Important / Repeated in Board Exams'
  },
  {
    id: 'cbse12-imp-chem-5',
    subject: 'Chemistry',
    topic: 'Aldehydes, Ketones & Carboxylic Acids (Named Reactions)',
    year: 2024,
    type: 'mcq',
    question: 'Which of the following carbonyl compounds does NOT contain any alpha-hydrogen and therefore undergoes the Cannizzaro reaction when treated with concentrated 50% NaOH solution?',
    options: [
      'Benzaldehyde (C₆H₅CHO)',
      'Acetaldehyde (CH₃CHO)',
      'Acetone (CH₃COCH₃)',
      'Propanal (CH₃CH₂CHO)'
    ],
    correct_index: 0,
    explanation: 'Cannizzaro reaction is a self oxidation-reduction (disproportionation) reaction shown exclusively by aldehydes that lack alpha-hydrogens (e.g. Benzaldehyde C₆H₅CHO, Formaldehyde HCHO). In 50% conc. NaOH, one molecule is reduced to benzyl alcohol (C₆H₅CH₂OH) while another is oxidized to sodium benzoate (C₆H₅COONa). Aldehydes with alpha-hydrogens (like acetaldehyde) undergo Aldol condensation instead. ⭐ Board Revision Tip: Guaranteed 3-mark organic reaction question.',
    weightage: 5,
    difficulty: 'High Yield',
    frequency_score: '⭐ Highly Important / Repeated in Board Exams'
  },

  // ==========================================
  // MATHEMATICS - HIGH YIELD BOARD REVISION PYQs
  // ==========================================
  {
    id: 'cbse12-imp-math-1',
    subject: 'Mathematics',
    topic: 'Definite Integrals (King Property)',
    year: 2024,
    type: 'mcq',
    question: 'What is the value of the definite integral I = ∫₀^(π/2) [√sin(x) / (√sin(x) + √cos(x))] dx?',
    options: [
      'π / 4',
      'π / 2',
      'π',
      '0'
    ],
    correct_index: 0,
    explanation: 'Using the definite integral property ∫₀ᵃ f(x) dx = ∫₀ᵃ f(a - x) dx. Here a = π/2. Replacing x with (π/2 - x): I = ∫₀^(π/2) [√cos(x) / (√cos(x) + √sin(x))] dx. Adding the two integral equations: 2I = ∫₀^(π/2) [(√sin(x) + √cos(x)) / (√sin(x) + √cos(x))] dx = ∫₀^(π/2) 1 dx = [x]₀^(π/2) = π/2. Therefore, I = π / 4. ⭐ Board Revision Tip: Repeated in CBSE Board Section C/D almost every alternating year!',
    weightage: 5,
    difficulty: 'High Yield',
    frequency_score: '⭐ Highly Important / Repeated in Board Exams'
  },
  {
    id: 'cbse12-imp-math-2',
    subject: 'Mathematics',
    topic: 'Differential Equations (Linear Differential Equation)',
    year: 2023,
    type: 'mcq',
    question: 'What is the integrating factor (I.F.) for the linear differential equation dy/dx + (2/x) * y = x³ for x > 0?',
    options: [
      'x²',
      '2/x',
      'e^(2x)',
      'x³'
    ],
    correct_index: 0,
    explanation: 'Standard linear differential equation format is dy/dx + P(x) * y = Q(x). Here, P(x) = 2/x. The integrating factor formula is I.F. = e^(∫ P(x) dx) = e^(∫ (2/x) dx) = e^(2 ln(x)) = e^(ln(x²)) = x². Multiplying by I.F. gives d/dx (y * x²) = x⁵, yielding general solution y * x² = (x⁶ / 6) + C. ⭐ Board Revision Tip: High-scoring 3-mark question.',
    weightage: 5,
    difficulty: 'High Yield',
    frequency_score: '⭐ Highly Important / Repeated in Board Exams'
  },
  {
    id: 'cbse12-imp-math-3',
    subject: 'Mathematics',
    topic: 'Vectors & 3D Geometry (Shortest Distance between Skew Lines)',
    year: 2024,
    type: 'mcq',
    question: 'Two skew lines in 3D space are given by vector equations r₁ = a₁ + λ b₁ and r₂ = a₂ + μ b₂. What is the mathematical condition for these two lines to intersect (shortest distance d = 0)?',
    options: [
      '(a₂ - a₁) · (b₁ × b₂) = 0 (Scalar Triple Product is zero)',
      '(a₂ + a₁) · (b₁ × b₂) = 0',
      '(b₁ · b₂) = 0 (Lines are perpendicular)',
      'b₁ × b₂ = 0 (Lines are parallel)'
    ],
    correct_index: 0,
    explanation: 'The shortest distance between two skew lines is given by d = |(a₂ - a₁) · (b₁ × b₂)| / |b₁ × b₂|. If two lines intersect, the shortest distance between them must be d = 0, which means (a₂ - a₁) · (b₁ × b₂) = 0 (i.e. vectors a₂ - a₁, b₁, and b₂ are coplanar). ⭐ Board Revision Tip: 5-mark guaranteed question in CBSE 3D Geometry.',
    weightage: 5,
    difficulty: 'High Yield',
    frequency_score: '⭐ Highly Important / Repeated in Board Exams'
  },
  {
    id: 'cbse12-imp-math-4',
    subject: 'Mathematics',
    topic: 'Probability (Bayes Theorem)',
    year: 2025,
    type: 'mcq',
    question: 'Bag A contains 3 red and 4 black balls, while Bag B contains 5 red and 6 black balls. One ball is drawn at random from one of the bags and is found to be red. What theorem is applied to determine the probability that it was drawn specifically from Bag A?',
    options: [
      'Bayes\' Theorem of Inverse Probability',
      'Law of Large Numbers',
      'Binomial Distribution',
      'Poisson Theorem'
    ],
    correct_index: 0,
    explanation: 'Bayes\' Theorem computes conditional posterior probability: P(A | Red) = [P(A) * P(Red | A)] / [P(A) * P(Red | A) + P(B) * P(Red | B)]. Here P(A) = P(B) = 1/2. P(Red | A) = 3/7, P(Red | B) = 5/11. Substituting gives P(A | Red) = (3/14) / [(3/14) + (5/22)] = 33/68. ⭐ Board Revision Tip: Always formulate partition hypotheses E₁, E₂ and evidence event A.',
    weightage: 5,
    difficulty: 'High Yield',
    frequency_score: '⭐ Highly Important / Repeated in Board Exams'
  },
  {
    id: 'cbse12-imp-math-5',
    subject: 'Mathematics',
    topic: 'Matrices & Determinants (System of Linear Equations)',
    year: 2024,
    type: 'mcq',
    question: 'For a square matrix A of order n with determinant |A| ≠ 0, what is the determinant of its adjoint matrix, |adj(A)|?',
    options: [
      '|A|^(n - 1)',
      '|A|^n',
      '|A|^(n + 1)',
      'n * |A|'
    ],
    correct_index: 0,
    explanation: 'From the standard matrix property: A * adj(A) = |A| * I_n. Taking determinants on both sides: |A * adj(A)| = ||A| * I_n| => |A| * |adj(A)| = |A|^n * |I_n| = |A|^n. Dividing both sides by |A| (since |A| ≠ 0): |adj(A)| = |A|^(n - 1). For a 3x3 matrix (n = 3), |adj(A)| = |A|² = |A|². ⭐ Board Revision Tip: Formula is tested in Section A 1-mark MCQs every year.',
    weightage: 5,
    difficulty: 'High Yield',
    frequency_score: '⭐ Highly Important / Repeated in Board Exams'
  },

  // ==========================================
  // BIOLOGY - HIGH YIELD BOARD REVISION PYQs
  // ==========================================
  {
    id: 'cbse12-imp-bio-1',
    subject: 'Biology',
    topic: 'Sexual Reproduction in Flowering Plants (Double Fertilization)',
    year: 2024,
    type: 'mcq',
    question: 'In angiosperms, what are the two distinct cellular fusion events that together constitute \'Double Fertilization\'?',
    options: [
      'Syngamy (Egg + 1st male gamete -> 2n Zygote) and Triple Fusion (2 Polar Nuclei + 2nd male gamete -> 3n PEN)',
      'Syngamy and Parthenogenesis',
      'Triple Fusion and Polyembryony',
      'Apomixis and Cleistogamy'
    ],
    correct_index: 0,
    explanation: 'Double fertilization was discovered by S.G. Nawaschin. One haploid sperm cell fuses with the haploid egg cell (Syngamy) to form a diploid zygote (2n), while the second haploid sperm cell fuses with the diploid central cell containing two polar nuclei (Triple Fusion) to form the triploid Primary Endosperm Nucleus (3n PEN). This unique dual fertilization is exclusive to flowering angiosperms. ⭐ Board Revision Tip: Core 5-mark question with embryo sac diagram.',
    weightage: 5,
    difficulty: 'High Yield',
    frequency_score: '⭐ Highly Important / Repeated in Board Exams'
  },
  {
    id: 'cbse12-imp-bio-2',
    subject: 'Biology',
    topic: 'Molecular Basis of Inheritance (Lac Operon)',
    year: 2023,
    type: 'mcq',
    question: 'In the regulation of gene expression in E. coli via the lac operon, which molecule functions as the inducer by binding directly to the repressor protein?',
    options: [
      'Lactose (and allolactose)',
      'Glucose',
      'Galactose',
      'Tryptophan'
    ],
    correct_index: 0,
    explanation: 'In the Jacob and Monod lac operon model, the regulatory gene (i gene) constantly transcribes the repressor protein. In the presence of lactose, a derivative called allolactose functions as the inducer by binding directly to the repressor protein, causing a conformational change that prevents it from binding to the operator region. RNA polymerase then freely transcribes the structural genes z, y, and a. ⭐ Board Revision Tip: Essential diagram-based 5-mark question.',
    weightage: 5,
    difficulty: 'High Yield',
    frequency_score: '⭐ Highly Important / Repeated in Board Exams'
  },
  {
    id: 'cbse12-imp-bio-3',
    subject: 'Biology',
    topic: 'Biotechnology: Principles & Processes (Restriction Enzymes)',
    year: 2024,
    type: 'mcq',
    question: 'The restriction endonuclease enzyme EcoRI specifically recognizes and cleaves double-stranded DNA at which symmetrical palindromic nucleotide sequence?',
    options: [
      '5\'-G A A T T C-3\' / 3\'-C T T A A G-5\'',
      '5\'-G G A T C C-3\' / 3\'-C C T A G G-5\'',
      '5\'-A A G C T T-3\' / 3\'-T T C G A A-5\'',
      '5\'-C T C G A G-3\' / 3\'-G A G C T C-5\''
    ],
    correct_index: 0,
    explanation: 'EcoRI is isolated from Escherichia coli strain RY13. It recognizes the specific palindromic 6-base pair sequence 5\'-GAATTC-3\' and cuts both strands between the G and A bases (leaving 5\' sticky ends: 5\'-AATT-3\'). These complementary overhanging sticky ends can be easily joined by DNA ligase during recombinant DNA construction. ⭐ Board Revision Tip: Naming convention: E = Genus (Escherichia), co = species (coli), R = strain (RY13), I = order of discovery.',
    weightage: 5,
    difficulty: 'High Yield',
    frequency_score: '⭐ Highly Important / Repeated in Board Exams'
  },
  {
    id: 'cbse12-imp-bio-4',
    subject: 'Biology',
    topic: 'Biotechnology & its Applications (Bt Cotton)',
    year: 2025,
    type: 'mcq',
    question: 'Why does the crystalline endotoxin protein (Cry protein) produced by the soil bacterium Bacillus thuringiensis NOT kill the bacterium itself, but kills insects like bollworms?',
    options: [
      'The toxin exists as an inactive protoxin in bacteria and gets solubilized and activated only in the alkaline pH of the insect midgut',
      'The bacterium produces an antibody that neutralizes the toxin',
      'The toxin is only active in cold temperatures',
      'The bacterium lacks cell walls and is immune to lysis'
    ],
    correct_index: 0,
    explanation: 'Bacillus thuringiensis produces the crystal (Cry) insecticidal protein in an inactive precursor form known as a protoxin. When an insect (such as cotton bollworm) ingests the protoxin, the alkaline pH of the insect midgut solubilizes the crystal and activates the toxin. Activated toxin binds to the surface of midgut epithelial cells, creating pores that cause cell swelling and lysis, leading to death. ⭐ Board Revision Tip: CryIAc and CryIIAb control cotton bollworms, while CryIAb controls corn borer.',
    weightage: 5,
    difficulty: 'High Yield',
    frequency_score: '⭐ Highly Important / Repeated in Board Exams'
  },

  // ==========================================
  // ENGLISH - HIGH YIELD BOARD REVISION PYQs
  // ==========================================
  {
    id: 'cbse12-imp-eng-1',
    subject: 'English',
    topic: 'Flamingo: The Last Lesson (Alphonse Daudet)',
    year: 2024,
    type: 'mcq',
    question: 'In Alphonse Daudet\'s \'The Last Lesson\', what historical order had arrived from Berlin that deeply shocked M. Hamel and the villagers of Alsace and Lorraine?',
    options: [
      'Only German language would be taught in the schools of Alsace and Lorraine henceforth',
      'All French books must be surrendered to the Prussian authorities',
      'M. Hamel was promoted to chief inspector of education',
      'The school in Alsace was being permanently closed down'
    ],
    correct_index: 0,
    explanation: 'Following the defeat of France in the Franco-Prussian War (1870-71), an order arrived from Berlin mandating that only German was to be taught in the schools of Alsace and Lorraine. This order aroused profound patriotic sentiment and regret among the villagers for having neglected their native tongue. M. Hamel reminded them: \'When a people are enslaved, as long as they hold fast to their language it is as if they had the key to their prison.\' ⭐ Board Revision Tip: Central theme is linguistic chauvinism and identity.',
    weightage: 5,
    difficulty: 'High Yield',
    frequency_score: '⭐ Highly Important / Repeated in Board Exams'
  },
  {
    id: 'cbse12-imp-eng-2',
    subject: 'English',
    topic: 'Flamingo: Lost Spring (Anees Jung)',
    year: 2023,
    type: 'mcq',
    question: 'In Anees Jung\'s \'Lost Spring\', what distinct personal ambition sets Mukesh apart from the other bangle-making families trapped in the vicious circle of poverty in Firozabad?',
    options: [
      'He dares to dream of becoming a motor mechanic and driving a car',
      'He wants to migrate to America to study commerce',
      'He wants to open a big jewelry showroom in Delhi',
      'He refuses to attend school and wants to be an artist'
    ],
    correct_index: 0,
    explanation: 'Unlike the traditional families of Firozabad who accept the hazardous bangle-making craft as their unalterable destiny (\'karam\'), Mukesh dares to challenge the generational bondage by declaring: \'I want to be a motor mechanic. I will learn.\' His willingness to walk miles to a garage symbolizes agency, resilience, and hope amidst crushing poverty. ⭐ Board Revision Tip: Compare Mukesh with Saheb-e-Alam who loses his freedom at the tea stall.',
    weightage: 5,
    difficulty: 'High Yield',
    frequency_score: '⭐ Highly Important / Repeated in Board Exams'
  },
  {
    id: 'cbse12-imp-eng-3',
    subject: 'English',
    topic: 'Writing Skills: Official Notice Writing Format',
    year: 2025,
    type: 'mcq',
    question: 'According to the official CBSE Class 12 English Core writing guidelines, what is the strict word limit and mandatory structural layout for Notice Writing?',
    options: [
      'Word limit: 50 words; enclosed in a box with Organization Name, word \'NOTICE\', Date, Subject Heading, Body, and Issuer Name with Designation',
      'Word limit: 120 words; no box required, written in narrative paragraph format',
      'Word limit: 150 words; with sender address and formal salutation like Dear Sir',
      'Word limit: 30 words; written strictly in bullet points only'
    ],
    correct_index: 0,
    explanation: 'CBSE Class 12 Notice Writing criteria: 1) Enclosed inside a clean rectangular box (0.5 marks); 2) Name of issuing institution/authority centered on top; 3) The word \'NOTICE\' in capital letters; 4) Date on left (e.g. 24 March 2025); 5) Catchy subject heading; 6) Concise body answering What, When, Where, Who to contact within 50 words; 7) Name and designation of the signatory at bottom left. ⭐ Board Revision Tip: Word limit penalty applies if exceeding 50 words.',
    weightage: 5,
    difficulty: 'High Yield',
    frequency_score: '⭐ Highly Important / Repeated in Board Exams'
  },

  // ==========================================
  // HINDI - HIGH YIELD BOARD REVISION PYQs
  // ==========================================
  {
    id: 'cbse12-imp-hin-1',
    subject: 'Hindi',
    topic: 'Aroh Kavyakhand: Harivansh Rai Bachchan (Aatma Parichay)',
    year: 2024,
    type: 'mcq',
    question: 'Harivansh Rai Bachchan dwara rachit kavita \'Aatma Parichay\' me kavi sansaar ke sath apne sambandh ko kis roop me paribhashit karte hain?',
    options: [
      'Preeti-kalah ka sambandh (Sansaar se virodh aur prem dono ka anutha samanjasya)',
      'Kewal krodh aur nafrat ka sambandh',
      'Sansaari moh-maya me poori tarah leen hone ka sambandh',
      'Sansaar se poorn virakti aur sanyas ka sambandh'
    ],
    correct_index: 0,
    explanation: 'Harivansh Rai Bachchan \'Aatma Parichay\' me spasht karte hain ki unka sansaar ke sath \'Preeti-Kalah\' (prem aur virodh) ka dwandvatmak sambandh hai. Ek taraf we sansaar ke swarthi roop par aakrosh vyakt karte hain, to doosri taraf we sansaar ko apne hriday ke prem geet baantte hain. Kavi kehte hain: \'Main jag-jeevan ka bhaar liye phirta hoon, phir bhi jeevan me pyaar liye phirta hoon.\' ⭐ Board Revision Tip: Halawad darshan aur geetishaili par aadharit mukhya prashna.',
    weightage: 5,
    difficulty: 'High Yield',
    frequency_score: '⭐ Highly Important / Repeated in Board Exams'
  },
  {
    id: 'cbse12-imp-hin-2',
    subject: 'Hindi',
    topic: 'Hindi Vyakaran: Alankar (Anupras, Yamak, Shlesh, Rupak)',
    year: 2023,
    type: 'mcq',
    question: 'Pankti \'Kanak Kanak te sau guni, madakta adhikaye\' me kaun sa alankar nihit hai, jahan ek hi shabd \'Kanak\' do alag-alag arthon (Sona aur Dhatura) me prayukt hua hai?',
    options: [
      'Yamak Alankar',
      'Anupras Alankar',
      'Shlesh Alankar',
      'Utpreksha Alankar'
    ],
    correct_index: 0,
    explanation: 'Jahan koi shabd ek se adhik baar aaye aur har baar uska arth alag-alag ho, wahan Yamak Alankar hota hai. Yahan \'Kanak\' shabd do baar aaya hai: pehle \'Kanak\' ka arth hai \'Dhatura\' (jise khane se madakta aati hai) aur doosre \'Kanak\' ka arth hai \'Sona\' (swarna - jise paane matra se vyakti pagal ho jata hai). ⭐ Board Revision Tip: Shlesh me shabd ek baar aakar anek arth deta hai, jabki Yamak me shabd dohrata hai.',
    weightage: 5,
    difficulty: 'High Yield',
    frequency_score: '⭐ Highly Important / Repeated in Board Exams'
  },
  {
    id: 'cbse12-imp-hin-3',
    subject: 'Hindi',
    topic: 'Vitan: Manohar Shyam Joshi (Silver Wedding)',
    year: 2024,
    type: 'mcq',
    question: 'Manohar Shyam Joshi ki katha \'Silver Wedding\' me Yashodhar Babu ki vichardhara aur jeevan shaili par kiska sabase gahra prabhav dikhta hai?',
    options: [
      'Kishanda (Krishna Nand Pandey - unke aadarsh aur margdarshak)',
      'Unke bade bete Bhushan ka',
      'Unke vibhagiy sachiv ka',
      'Unki aadhunik patni ka'
    ],
    correct_index: 0,
    explanation: 'Yashodhar Babu apne poore vyaktitva, naitik mulyon aur sanyukt parivar ki parampara ke liye Kishanda (Krishna Nand Pandey) ke aadarshon par chalte hain. Aadhunik upbhoktavadi sanskriti aur peedhi ke badlaav se peedit hokar we har aadhunik ghatna par Kishanda ke takiya-kalam \'Somehow imperfect\' ya \'Somehow improper\' ka prayog karte hain. ⭐ Board Revision Tip: Yashodhar Babu ka charitra chitran aur peedhi sangharsh (generation gap) board exam ka mukhya prashna hai.',
    weightage: 5,
    difficulty: 'High Yield',
    frequency_score: '⭐ Highly Important / Repeated in Board Exams'
  },

  // ==========================================
  // COMPUTER SCIENCE - HIGH YIELD BOARD REVISION PYQs
  // ==========================================
  {
    id: 'cbse12-imp-cs-1',
    subject: 'Computer Science',
    topic: 'Python Data Structures (Stack Implementation)',
    year: 2024,
    type: 'mcq',
    question: 'In Python, when implementing a Last-In-First-Out (LIFO) Stack data structure using a standard List, which two built-in methods are officially used for PUSH and POP operations respectively?',
    options: [
      'append() to Push, and pop() to Pop',
      'insert(0) to Push, and remove() to Pop',
      'push() to Push, and delete() to Pop',
      'extend() to Push, and clear() to Pop'
    ],
    correct_index: 0,
    explanation: 'A Stack operates strictly on the LIFO principle. In Python: 1) PUSH operation adds an element to the top of the stack using list.append(item); 2) POP operation removes and returns the top element using list.pop(). Before performing pop(), one must verify whether the stack is empty (len(stack) == 0) to prevent an Underflow error. ⭐ Board Revision Tip: 3-mark compulsory coding question in CBSE CS board examination.',
    weightage: 5,
    difficulty: 'High Yield',
    frequency_score: '⭐ Highly Important / Repeated in Board Exams'
  },
  {
    id: 'cbse12-imp-cs-2',
    subject: 'Computer Science',
    topic: 'Database Management: SQL (GROUP BY with HAVING)',
    year: 2023,
    type: 'mcq',
    question: 'In SQL database queries, what is the crucial difference between the WHERE clause and the HAVING clause when grouping records?',
    options: [
      'WHERE filters individual table rows before grouping, while HAVING filters aggregated group results after GROUP BY',
      'WHERE is used only with numeric columns, while HAVING is used with text columns',
      'HAVING can be used without GROUP BY in all cases, while WHERE cannot',
      'There is no difference; they are interchangeable'
    ],
    correct_index: 0,
    explanation: 'In SQL query processing order: 1) WHERE clause filters rows individually before any grouping takes place and cannot contain aggregate functions (like SUM, COUNT, AVG); 2) GROUP BY groups the remaining rows into summaries; 3) HAVING clause applies filter conditions specifically on the grouped and aggregated results (e.g. HAVING COUNT(*) > 5). ⭐ Board Revision Tip: Classic 2-mark conceptual and query writing question.',
    weightage: 5,
    difficulty: 'High Yield',
    frequency_score: '⭐ Highly Important / Repeated in Board Exams'
  },
  {
    id: 'cbse12-imp-cs-3',
    subject: 'Computer Science',
    topic: 'Python File Handling (Pickle Binary Module)',
    year: 2025,
    type: 'mcq',
    question: 'Which module in Python is used for object serialization and deserialization (saving Python objects to binary files and restoring them), and what methods write and read data respectively?',
    options: [
      'pickle module using pickle.dump() to write and pickle.load() to read in \'wb\' and \'rb\' modes',
      'json module using json.read() and json.write()',
      'binary module using binary.save() and binary.get()',
      'csv module using csv.dump() and csv.load()'
    ],
    correct_index: 0,
    explanation: 'In CBSE Class 12 Python, binary file handling relies on the \'pickle\' module: 1) pickle.dump(data, file_handle) serializes and writes Python dictionary/list objects into a binary file opened with mode \'wb\' or \'ab\'; 2) pickle.load(file_handle) reads and deserializes the object from a file opened with mode \'rb\'. When reading until EOF, an EOFError exception is caught. ⭐ Board Revision Tip: 3-mark programming question guaranteed.',
    weightage: 5,
    difficulty: 'High Yield',
    frequency_score: '⭐ Highly Important / Repeated in Board Exams'
  },

  // ==========================================
  // PHYSICAL EDUCATION - HIGH YIELD BOARD REVISION PYQs
  // ==========================================
  {
    id: 'cbse12-imp-pe-1',
    subject: 'Physical Education',
    topic: 'Management of Sporting Events (Knockout Fixture & Byes Formula)',
    year: 2024,
    type: 'mcq',
    question: 'In a single knockout tournament with N = 11 participating teams, what is the total number of matches played, and how many Byes must be awarded in the first round?',
    options: [
      'Total Matches = 10 (N - 1); Total Byes = 5 (Next power of 2: 16 - 11 = 5)',
      'Total Matches = 11; Total Byes = 4',
      'Total Matches = 12; Total Byes = 6',
      'Total Matches = 10; Total Byes = 3'
    ],
    correct_index: 0,
    explanation: 'Knockout Fixture Calculation Rules: 1) Total number of matches M = N - 1 = 11 - 1 = 10 matches; 2) Total Byes = Next power of 2 greater than N minus N: Next power of 2 is 2⁴ = 16. Total Byes = 16 - 11 = 5 Byes; 3) Byes in Upper Half = (NB - 1)/2 = (5 - 1)/2 = 2; Byes in Lower Half = (NB + 1)/2 = (5 + 1)/2 = 3. ⭐ Board Revision Tip: Drawing a 11-team or 13-team knockout fixture is a classic 5-mark question.',
    weightage: 5,
    difficulty: 'High Yield',
    frequency_score: '⭐ Highly Important / Repeated in Board Exams'
  },
  {
    id: 'cbse12-imp-pe-2',
    subject: 'Physical Education',
    topic: 'Children & Women in Sports (Postural Deformities & Asanas)',
    year: 2023,
    type: 'mcq',
    question: 'Kyphosis (abnormal excessive outward curvature of the thoracic spine resulting in hunchback) can be effectively corrected through which yoga asanas?',
    options: [
      'Bhujangasana (Cobra Pose), Dhanurasana (Bow Pose), and Chakrasana',
      'Vajrasana and Padmasana only',
      'Halasana and Paschimottanasana (Forward bends)',
      'Shavasana only'
    ],
    correct_index: 0,
    explanation: 'Kyphosis is a posterior spinal deformity characterized by round upper back and drooping shoulders. Corrective measures require backward bending asanas that stretch the thoracic chest muscles and strengthen the upper back extensors: Bhujangasana, Dhanurasana, Chakrasana, and Ushtrasana. Forward-bending asanas (like Paschimottanasana) are strictly contraindicated as they aggravate the thoracic curve. ⭐ Board Revision Tip: Contrast with Lordosis (inward curve of lumbar spine).',
    weightage: 5,
    difficulty: 'High Yield',
    frequency_score: '⭐ Highly Important / Repeated in Board Exams'
  },
  {
    id: 'cbse12-imp-pe-3',
    subject: 'Physical Education',
    topic: 'Sports Nutrition (Body Mass Index - BMI Formula)',
    year: 2025,
    type: 'mcq',
    question: 'A student weighs 72 kg and has a height of 1.70 meters. What is their Body Mass Index (BMI) and official World Health Organization weight category?',
    options: [
      'BMI = 24.91 kg/m² (Normal Weight Category)',
      'BMI = 32.50 kg/m² (Obese Category)',
      'BMI = 17.20 kg/m² (Underweight Category)',
      'BMI = 28.50 kg/m² (Overweight Category)'
    ],
    correct_index: 0,
    explanation: 'Formula for Body Mass Index: BMI = Weight (in kg) / [Height (in meters)]². Substituting: BMI = 72 / (1.70)² = 72 / 2.89 = 24.91 kg/m². According to WHO classifications: < 18.5 is Underweight; 18.5 – 24.9 is Normal Healthy Weight; 25.0 – 29.9 is Overweight; ≥ 30.0 is Obese. Hence, 24.91 falls in the Normal Healthy Weight category. ⭐ Board Revision Tip: Always remember the normal range 18.5 to 24.9 kg/m².',
    weightage: 5,
    difficulty: 'High Yield',
    frequency_score: '⭐ Highly Important / Repeated in Board Exams'
  }
];

/**
 * Seed CBSE 12th Important Revision Questions into database
 * Inserts across all CBSE 12th exam keys:
 * - 'cbse12'
 * - 'cbse_12_pcm'
 * - 'cbse_12_pcb'
 * - 'cbse_12_pcmb'
 * - 'cbse12_pcb'
 * - 'cbse12_pcmb'
 */
function seedCBSE12ImportantRevision(db) {
  try {
    const insertPYQ = db.prepare(`
      INSERT OR REPLACE INTO pyq_questions (
        id, exam_key, subject, topic, year, question, options,
        correct_index, explanation, weightage, difficulty, frequency_score,
        created_at, type, correct_numeric_answer, tolerance
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const now = new Date().toISOString();
    const targetKeys = ['cbse12', 'cbse_12_pcm', 'cbse_12_pcb', 'cbse_12_pcmb', 'cbse12_pcb', 'cbse12_pcmb'];

    let count = 0;
    const seedTx = db.transaction(() => {
      for (const q of CBSE_12_IMPORTANT_QUESTIONS) {
        for (const examKey of targetKeys) {
          const uniqueId = `${q.id}-${examKey}`;
          insertPYQ.run(
            uniqueId,
            examKey,
            q.subject,
            q.topic,
            q.year,
            q.question,
            JSON.stringify(q.options || []),
            q.correct_index,
            q.explanation,
            q.weightage,
            q.difficulty,
            q.frequency_score,
            now,
            q.type || 'mcq',
            null,
            0.01
          );
          count++;
        }
      }
    });

    seedTx();
    console.log(`[DB] Successfully seeded ${CBSE_12_IMPORTANT_QUESTIONS.length} High-Yield CBSE 12th Revision Questions across ${targetKeys.length} exam keys (Total entries: ${count}).`);
    return count;
  } catch (err) {
    console.error('[DB] Failed to seed CBSE 12th Important Revision questions:', err);
    throw err;
  }
}

module.exports = {
  CBSE_12_IMPORTANT_QUESTIONS,
  seedCBSE12ImportantRevision
};
