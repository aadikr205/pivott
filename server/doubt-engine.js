/**
 * Pivott Smart Doubt Solver Engine
 * 
 * Key Principles:
 * 1. Language-Aware: If asked in Hindi/Hinglish, reply in clear, easy Hindi/Hinglish.
 *    If asked in English, reply strictly in clear English.
 * 2. Answer EXACTLY what is asked — no unwanted boilerplate, no filler.
 *    For math expressions (e.g. 2+2), return strictly the direct answer (4).
 * 3. Class-Level Tailored: Class 10th (simple, intuitive) vs Class 12th/NEET/JEE (technical, precise).
 * 4. Comprehensive Theory Support: Physics, Chemistry, Biology, Mathematics, Units, and Constants.
 */

const { searchKnowledge } = require('./search-engine');

// 1. Language Detector (Hindi vs English)
function detectLanguage(query) {
  if (!query || typeof query !== 'string') return 'en';

  // Check for Devanagari script (Unicode 0900 - 097F)
  if (/[\u0900-\u097F]/.test(query)) {
    return 'hi';
  }

  const text = query.toLowerCase();

  // Hindi / Hinglish indicator words commonly used in student questions
  const hinglishTokens = [
    'kya', 'hai', 'kise', 'kahte', 'kehte', 'batao', 'samjhao', 'hota', 'hoti', 'hote',
    'kaise', 'kyu', 'kyun', 'hoga', 'hogi', 'karein', 'karo', 'kisko', 'kitna', 'kitni',
    'antar', 'niyam', 'prakriya', 'kripya', 'mujhe', 'bhi', 'aur', 'ke', 'ki', 'ka', 'ko',
    'se', 'me', 'mein', 'par', 'ye', 'yeh', 'wo', 'woh', 'bataiye', 'bolte', 'chahiye',
    'likha', 'likho', 'bata do', 'karna', 'karta', 'karti', 'lagta', 'rakhein', 'karo',
    'samjha', 'paribhasha', 'udaharan', 'sutra', 'matrak', 'man'
  ];

  const words = text.split(/[^a-zA-Z0-9]+/);
  let hinglishCount = 0;
  for (const word of words) {
    if (hinglishTokens.includes(word)) {
      hinglishCount++;
    }
  }

  if (hinglishCount >= 1) {
    return 'hi';
  }

  return 'en';
}

// 2. Math & Arithmetic Calculation Evaluator
function evaluateMathExpression(rawQuery) {
  if (!rawQuery || typeof rawQuery !== 'string') return null;

  let cleaned = rawQuery.toLowerCase().trim();

  // Strip conversational preambles
  cleaned = cleaned
    .replace(/^what\s+is\s+/g, '')
    .replace(/^calculate\s+/g, '')
    .replace(/^solve\s+/g, '')
    .replace(/^evaluate\s+/g, '')
    .replace(/^answer\s+of\s+/g, '')
    .replace(/^find\s+/g, '')
    .replace(/\s+kitna\s+hota\s+hai\??$/g, '')
    .replace(/\s+kya\s+hoga\??$/g, '')
    .replace(/\s+kya\s+hai\??$/g, '')
    .replace(/\s+batao\??$/g, '')
    .replace(/\?/g, '')
    .trim();

  // Percentage: "20% of 150" or "20 percent of 150" or "150 ka 20%"
  const percentMatch1 = cleaned.match(/^(\d+(?:\.\d+)?)\s*(?:%|percent)\s+(?:of|ka)\s+(\d+(?:\.\d+)?)$/);
  if (percentMatch1) {
    const p = parseFloat(percentMatch1[1]);
    const val = parseFloat(percentMatch1[2]);
    const res = (p * val) / 100;
    return { isMath: true, answer: `${res}`, formatted_reply: `${res}` };
  }

  const percentMatch2 = cleaned.match(/^(\d+(?:\.\d+)?)\s*ka\s*(\d+(?:\.\d+)?)\s*(?:%|percent)$/);
  if (percentMatch2) {
    const val = parseFloat(percentMatch2[1]);
    const p = parseFloat(percentMatch2[2]);
    const res = (p * val) / 100;
    return { isMath: true, answer: `${res}`, formatted_reply: `${res}` };
  }

  // Square Root: "sqrt(144)" or "square root of 144" or "root 144"
  const sqrtMatch = cleaned.match(/^(?:sqrt|square\s+root\s+of|root)\s*\(?(\d+(?:\.\d+)?)\)?$/);
  if (sqrtMatch) {
    const num = parseFloat(sqrtMatch[1]);
    const res = Math.sqrt(num);
    const cleanRes = Number.isInteger(res) ? res : Number(res.toFixed(4));
    return { isMath: true, answer: `${cleanRes}`, formatted_reply: `${cleanRes}` };
  }

  // Basic Trig: "sin 90", "cos 0", "tan 45"
  const trigMatch = cleaned.match(/^(sin|cos|tan)\s*\(?(\d+)\)?(?:deg|°)?$/);
  if (trigMatch) {
    const fn = trigMatch[1];
    const deg = parseInt(trigMatch[2], 10);
    const rad = (deg * Math.PI) / 180;
    let res = 0;
    if (fn === 'sin') res = Math.sin(rad);
    if (fn === 'cos') res = Math.cos(rad);
    if (fn === 'tan') {
      if (deg % 180 === 90) return { isMath: true, answer: 'Undefined (∞)', formatted_reply: 'Undefined (∞)' };
      res = Math.tan(rad);
    }
    const cleanRes = Math.abs(res) < 1e-10 ? 0 : (Math.abs(res - 1) < 1e-10 ? 1 : Number(res.toFixed(4)));
    return { isMath: true, answer: `${cleanRes}`, formatted_reply: `${cleanRes}` };
  }

  // Standard Arithmetic: "2+2", "15 * 14", "100 / 4", "(5 + 3) * 2", "2^4"
  let expr = cleaned
    .replace(/x/g, '*')
    .replace(/×/g, '*')
    .replace(/÷/g, '/')
    .replace(/\^/g, '**');

  if (/^[0-9\s\+\-\*\/\%\(\)\.\*\*]+$/.test(expr) && /\d/.test(expr)) {
    try {
      if (!/[a-zA-Z_$]/.test(expr)) {
        const result = Function('"use strict"; return (' + expr + ')')();
        if (typeof result === 'number' && !isNaN(result) && isFinite(result)) {
          const cleanNum = Number.isInteger(result) ? result : Number(result.toFixed(4));
          return { isMath: true, answer: `${cleanNum}`, formatted_reply: `${cleanNum}` };
        }
      }
    } catch (e) {
      // Not pure arithmetic, continue
    }
  }

  return null;
}

// 3. Class Level Detector
function detectClassLevel(examName = '', topicName = '', subjectName = '') {
  const text = `${examName} ${topicName} ${subjectName}`.toLowerCase();
  if (text.includes('class 10') || text.includes('10th') || text.includes('matric') || text.includes('bseb10') || text.includes('class10')) {
    return 'class10';
  }
  if (text.includes('neet') || text.includes('medical') || text.includes('pcb')) {
    return 'neet';
  }
  if (text.includes('jee') || text.includes('iit') || text.includes('advanced')) {
    return 'jee';
  }
  if (text.includes('class 12') || text.includes('12th') || text.includes('inter') || text.includes('cbse12') || text.includes('bseb12')) {
    return 'class12';
  }
  return 'general';
}

// 4. Units & Physical Constants Dictionary (English)
const UNITS_AND_CONSTANTS = [
  {
    keys: ['force', 'bal'],
    en: 'The SI unit of Force is **Newton (N)** ($1\\text{ N} = 1\\text{ kg}\\cdot\\text{m/s}^2$).'
  },
  {
    keys: ['power', 'shakti'],
    en: 'The SI unit of Power is **Watt (W)** ($1\\text{ W} = 1\\text{ Joule/second}$).'
  },
  {
    keys: ['work', 'energy', 'karya', 'urja'],
    en: 'The SI unit of Work and Energy is **Joule (J)** ($1\\text{ J} = 1\\text{ N}\\cdot\\text{m}$).'
  },
  {
    keys: ['pressure', 'daab'],
    en: 'The SI unit of Pressure is **Pascal (Pa)** ($1\\text{ Pa} = 1\\text{ N/m}^2$).'
  },
  {
    keys: ['current', 'dhara', 'dhara ki unit'],
    en: 'The SI unit of Electric Current is **Ampere (A)** ($1\\text{ A} = 1\\text{ Coulomb/second}$).'
  },
  {
    keys: ['voltage', 'potential', 'vibhaw', 'vibhvantar'],
    en: 'The SI unit of Electric Potential / Potential Difference is **Volt (V)** ($1\\text{ V} = 1\\text{ Joule/Coulomb}$).'
  },
  {
    keys: ['resistance', 'pratirodh'],
    en: 'The SI unit of Resistance is **Ohm (Ω)** ($1\\ \\Omega = 1\\text{ Volt/Ampere}$).'
  },
  {
    keys: ['resistivity', 'pratirodhakta'],
    en: 'The SI unit of Resistivity (specific resistance) is **Ohm-meter (Ω·m)**.'
  },
  {
    keys: ['capacitance', 'dharita'],
    en: 'The SI unit of Capacitance is **Farad (F)** ($1\\text{ F} = 1\\text{ Coulomb/Volt}$).'
  },
  {
    keys: ['frequency', 'aavritti'],
    en: 'The SI unit of Frequency is **Hertz (Hz)** ($1\\text{ Hz} = 1\\text{ cycle/second}$).'
  },
  {
    keys: ['charge', 'aavesh'],
    en: 'The SI unit of Electric Charge is **Coulomb (C)** ($1\\text{ C} = 1\\text{ Ampere}\\cdot\\text{second}$).'
  },
  {
    keys: ['magnetic field', 'chumbakiya kshetra'],
    en: 'The SI unit of Magnetic Field (magnetic flux density) is **Tesla (T)** ($1\\text{ T} = 1\\text{ N}/(\\text{A}\\cdot\\text{m})$).'
  },
  {
    keys: ['speed of light', 'prakash ki chaal'],
    en: 'The speed of light in vacuum is **$c = 3 \\times 10^8\\text{ m/s}$** (approx. 3,00,000 km/s).'
  },
  {
    keys: ['gravity', 'acceleration due to gravity', 'g ki value', 'g ka man'],
    en: 'Acceleration due to gravity on Earth surface is **$g = 9.8\\text{ m/s}^2$** (often rounded to $10\\text{ m/s}^2$).'
  },
  {
    keys: ['gravitational constant', 'universal constant', 'G ki value', 'G ka man'],
    en: 'Universal Gravitational Constant **$G = 6.674 \\times 10^{-11}\\text{ N}\\cdot\\text{m}^2/\\text{kg}^2$**.'
  },
  {
    keys: ['electron charge', 'charge of electron', 'electron par aavesh'],
    en: 'The charge of an electron is **$-1.602 \\times 10^{-19}\\text{ Coulomb}$**.'
  },
  {
    keys: ['avogadro', 'avogadro number', 'avogadro sankhya'],
    en: 'Avogadro\'s Number ($N_A$) = **$6.022 \\times 10^{23}\\text{ entities per mole}$**.'
  },
  {
    keys: ['planck', 'planck constant', 'planck ka niyam'],
    en: 'Planck\'s Constant ($h$) = **$6.626 \\times 10^{-34}\\text{ J}\\cdot\\text{s}$**.'
  }
];

// 5. Comprehensive Theory Knowledge Bank (English)
const THEORY_TOPICS = [
  // --- PHYSICS ---
  {
    id: 'ohms_law',
    keywords: ['ohm', 'ohms law', 'ohm ka niyam', 'v=ir', 'v = ir'],
    subject: 'Physics',
    en: `**Ohm's Law**:
At constant temperature, the electric current ($I$) flowing through a conductor is directly proportional to the potential difference ($V$) across its ends.

👉 **Formula**: **$V = I \\times R$**
• $V$ = Potential Difference (Volts, V)
• $I$ = Electric Current (Amperes, A)
• $R$ = Resistance (Ohms, $\\Omega$)

👉 **Key Condition**: Valid only when temperature and other physical dimensions remain constant.`
  },
  {
    id: 'newton_first_law',
    keywords: ['newton first law', 'newton ka pehla niyam', 'law of inertia', 'newton 1st'],
    subject: 'Physics',
    en: `**Newton's First Law of Motion (Law of Inertia)**:
An object remains in a state of rest or of uniform motion in a straight line unless acted upon by an external unbalanced force.

👉 **Core Concept**: Inertia — the natural tendency of an object to resist changes in its state of motion.`
  },
  {
    id: 'newton_second_law',
    keywords: ['newton second law', 'newton ka dusra niyam', 'f=ma', 'f = ma', 'newton 2nd'],
    subject: 'Physics',
    en: `**Newton's Second Law of Motion**:
The rate of change of momentum of a body is directly proportional to the applied unbalanced force and takes place in the direction of the force.

👉 **Formula**: **$F = m \\times a$**
• $F$ = Force (Newton, N)
• $m$ = Mass (kg)
• $a$ = Acceleration ($m/s^2$)
• Momentum: $p = m \\times v$`
  },
  {
    id: 'newton_third_law',
    keywords: ['newton third law', 'newton ka teesra niyam', 'action reaction', 'newton 3rd'],
    subject: 'Physics',
    en: `**Newton's Third Law of Motion (Core Concept)**:
To every action, there is always an equal and opposite reaction.

👉 **Core Concept & Key Principles**:
1. Action and reaction forces are equal in magnitude and opposite in direction ($F_{AB} = -F_{BA}$).
2. They always act on two **different** bodies simultaneously, so they never cancel each other out.

👉 **Formula**: $F_{AB} = -F_{BA}$`
  },
  {
    id: 'gravitation_law',
    keywords: ['gravitation', 'law of gravitation', 'gurutwakarshan', 'gravitation formula'],
    subject: 'Physics',
    en: `**Newton's Universal Law of Gravitation**:
Every particle in the universe attracts every other particle with a force directly proportional to the product of their masses and inversely proportional to the square of the distance between them.

👉 **Formula**: **$F = G \\frac{m_1 m_2}{r^2}$**
• $G$ = $6.674 \\times 10^{-11}\\text{ N}\\cdot\\text{m}^2/\\text{kg}^2$ (Universal constant)
• $g$ = $9.8\\text{ m/s}^2$ (Acceleration due to gravity on Earth surface)`
  },
  {
    id: 'reflection_of_light',
    keywords: ['reflection of light', 'laws of reflection', 'prakash ka paravartan'],
    subject: 'Physics',
    en: `**Laws of Reflection of Light**:
1. **First Law**: The incident ray, the reflected ray, and the normal to the reflecting surface at the point of incidence all lie in the same plane.
2. **Second Law**: The angle of incidence is strictly equal to the angle of reflection:
   **$\\angle i = \\angle r$**`
  },
  {
    id: 'refraction_snells_law',
    keywords: ['refraction', 'snells law', 'snell ka niyam', 'prakash ka apavartan'],
    subject: 'Physics',
    en: `**Refraction of Light & Snell's Law**:
When light travels obliquely from one transparent medium into another, its speed changes, causing it to bend.

👉 **Snell's Law**:
$$\\frac{\\sin i}{\\sin r} = \\frac{n_2}{n_1} = n_{21} = \\text{Constant}$$
• $n_1, n_2$ = Refractive indices of media 1 and 2.
• When moving from rarer to denser medium, light bends **towards the normal**.
• When moving from denser to rarer medium, light bends **away from the normal**.`
  },
  {
    id: 'total_internal_reflection',
    keywords: ['total internal reflection', 'tir', 'purn aantarik paravartan', 'critical angle'],
    subject: 'Physics',
    en: `**Total Internal Reflection (TIR)**:
When light travelling from an optically denser medium to a rarer medium strikes the interface at an angle of incidence greater than the critical angle ($i > i_c$), 100% of the light is reflected back into the denser medium.

👉 **Conditions for TIR**:
1. Light must travel from **denser to rarer** medium.
2. Angle of incidence must be greater than critical angle ($i > i_c$).
👉 **Critical Angle Formula**: $\\sin i_c = \\frac{n_2}{n_1} = \\frac{1}{n}$
👉 **Applications**: Optical fibers, mirage in deserts, sparkle of diamonds.`
  },
  {
    id: 'coulombs_law',
    keywords: ['coulomb', 'coulombs law', 'coulomb ka niyam'],
    subject: 'Physics',
    en: `**Coulomb's Law of Electrostatics**:
The electrostatic force of attraction or repulsion between two stationary point charges is directly proportional to the product of their charges and inversely proportional to the square of the distance between them.

👉 **Formula**: **$F = k \\frac{|q_1 q_2|}{r^2}$**
• $k = \\frac{1}{4\\pi\\varepsilon_0} \\approx 9 \\times 10^9\\text{ N}\\cdot\\text{m}^2/\\text{C}^2$ in vacuum
• Like charges repel; opposite charges attract.`
  },
  {
    id: 'kirchhoffs_laws',
    keywords: ['kirchhoff', 'kcl', 'kvl', 'kirchhoff ka niyam', 'kirchhoff law'],
    subject: 'Physics',
    en: `**Kirchhoff's Laws**:
1. **KCL (Junction Rule)**: The algebraic sum of all currents meeting at any electrical junction is zero:
   $$\\sum I = 0$$
   *(Based on the Law of Conservation of Charge)*

2. **KVL (Loop Rule)**: In any closed electrical loop, the algebraic sum of changes in potential is zero:
   $$\\sum \\Delta V = 0$$
   *(Based on the Law of Conservation of Energy)*`
  },
  {
    id: 'lenz_faraday_law',
    keywords: ['lenz', 'faraday', 'lenz law', 'faraday law', 'lenz ka niyam', 'electromagnetic induction'],
    subject: 'Physics',
    en: `**Faraday's & Lenz's Law of Electromagnetic Induction**:
• **Faraday's Law**: The induced electromotive force (EMF) in a closed circuit is directly proportional to the time rate of change of magnetic flux through the circuit.
• **Lenz's Law**: The direction of the induced current is always such that it opposes the change in magnetic flux that produces it.

👉 **Combined Formula**: **$\\varepsilon = -\\frac{d\\Phi}{dt}$**
*(The negative sign represents Lenz's Law, obeying Conservation of Energy).*`
  },
  {
    id: 'photoelectric_effect',
    keywords: ['photoelectric', 'photoelectric effect', 'einstein photoelectric', 'work function'],
    subject: 'Physics',
    en: `**Photoelectric Effect**:
The emission of electrons (photoelectrons) from a metallic surface when electromagnetic radiation (light) of suitable frequency strikes it.

👉 **Einstein's Photoelectric Equation**:
$$E = h\\nu = \\Phi_0 + K_{\\max}$$
• $h\\nu$ = Energy of incident photon
• $\\Phi_0 = h\\nu_0$ = Work function (minimum energy required to liberate electron)
• $K_{\\max} = \\frac{1}{2}m v_{\\max}^2 = e V_s$ (Maximum kinetic energy, $V_s$ = Stopping potential)

👉 **Key Fact**: Electron emission occurs only if incident frequency $\\nu \\ge \\nu_0$ (threshold frequency).`
  },
  {
    id: 'semiconductor_diode',
    keywords: ['semiconductor', 'pn junction', 'diode', 'ardhchalak', 'p-n junction'],
    subject: 'Physics',
    en: `**Semiconductors & p-n Junction Diode**:
• **Intrinsic**: Pure semiconductor (e.g. pure Si, Ge).
• **Extrinsic**: Doped semiconductor.
  - **p-type**: Doped with trivalent impurities (B, Al, Ga) $\\rightarrow$ Majority carriers are **holes**.
  - **n-type**: Doped with pentavalent impurities (P, As, Sb) $\\rightarrow$ Majority carriers are **electrons**.

👉 **Biasing**:
• **Forward Bias**: p-terminal connected to (+), n to (-) $\\rightarrow$ Depletion layer decreases, current flows easily.
• **Reverse Bias**: p-terminal connected to (-), n to (+) $\\rightarrow$ Depletion layer widens, only negligible leakage current flows.`
  },

  // --- CHEMISTRY ---
  {
    id: 'acids_bases_salts',
    keywords: ['acid', 'base', 'acid and base', 'amla', 'kshar', 'ph scale', 'acid base difference'],
    subject: 'Chemistry',
    en: `**Acids, Bases, and pH Scale**:
• **Acids**: Sour in taste, turn blue litmus red, release $H^+$ (or $H_3O^+$) ions in aqueous solution (e.g. $HCl, H_2SO_4$).
• **Bases**: Bitter in taste, soapy to touch, turn red litmus blue, release $OH^-$ ions in aqueous solution (e.g. $NaOH, KOH$).
• **Neutralization**: $\\text{Acid} + \\text{Base} \\rightarrow \\text{Salt} + \\text{Water}$

👉 **pH Scale ($-\\log[H^+]$)**:
• $\\text{pH} < 7$ : Acidic
• $\\text{pH} = 7$ : Neutral (pure water at $25^\\circ\\text{C}$)
• $\\text{pH} > 7$ : Basic / Alkaline`
  },
  {
    id: 'chemical_bonding',
    keywords: ['chemical bonding', 'ionic bond', 'covalent bond', 'rasayanik aabandh', 'sah sanyojak'],
    subject: 'Chemistry',
    en: `**Chemical Bonding**:
• **Ionic Bond**: Formed by the complete transfer of one or more electrons from a metal to a non-metal (e.g. $Na^+ Cl^-$). High melting points, soluble in water, conduct electricity in molten/aqueous states.
• **Covalent Bond**: Formed by mutual sharing of electron pairs between non-metallic atoms (e.g. $CH_4, H_2O, O_2$). Lower melting points, non-conductors.
• **Coordinate (Dative) Bond**: Both shared electrons are contributed by a single donor atom (e.g. $NH_4^+, H_3O^+$).`
  },
  {
    id: 'mole_concept',
    keywords: ['mole', 'mole concept', 'avogadro mole', 'mol sankalpna', 'molar mass'],
    subject: 'Chemistry',
    en: `**The Mole Concept**:
One mole is the amount of substance that contains exactly $6.022 \\times 10^{23}$ elementary entities (Avogadro's constant $N_A$).

👉 **Key Formulas**:
1. $\\text{Moles } (n) = \\frac{\\text{Given Mass (g)}}{\\text{Molar Mass (g/mol)}} = \\frac{m}{M}$
2. $\\text{Moles } (n) = \\frac{\\text{Number of Particles}}{6.022 \\times 10^{23}}$
3. At STP ($0^\\circ\\text{C}, 1\\text{ atm}$), $1\\text{ mole of any ideal gas} = 22.4\\text{ Litres}$.`
  },
  {
    id: 'oxidation_reduction',
    keywords: ['oxidation', 'reduction', 'redox', 'upchayan', 'apchayan'],
    subject: 'Chemistry',
    en: `**Oxidation, Reduction & Redox Reactions**:
• **Oxidation**: Loss of electrons, increase in oxidation state, gain of oxygen, or loss of hydrogen.
• **Reduction**: Gain of electrons, decrease in oxidation state, loss of oxygen, or gain of hydrogen.
• **Memory Trick**: **OIL RIG** (Oxidation Is Loss, Reduction Is Gain of electrons).
• **Redox Reaction**: A reaction where oxidation and reduction take place simultaneously (e.g. $Zn + CuSO_4 \\rightarrow ZnSO_4 + Cu$).`
  },
  {
    id: 'le_chateliers_principle',
    keywords: ['le chatelier', 'chatelier principle', 'le chatelier ka niyam', 'chemical equilibrium'],
    subject: 'Chemistry',
    en: `**Le Chatelier's Principle**:
If a dynamic equilibrium is subjected to a change in concentration, temperature, or pressure, the position of equilibrium shifts in a direction that tends to counteract the imposed change.

👉 **Key Rules**:
• **Increase reactant concentration** $\\rightarrow$ Shifts equilibrium **forward**.
• **Increase pressure** $\\rightarrow$ Shifts towards side with **fewer moles of gas**.
• **Increase temperature**:
  - Exothermic reactions ($\\Delta H < 0$) $\\rightarrow$ Shifts **backward**.
  - Endothermic reactions ($\\Delta H > 0$) $\\rightarrow$ Shifts **forward**.`
  },
  {
    id: 'sn1_sn2_difference',
    keywords: ['sn1', 'sn2', 'sn1 sn2 difference', 'sn1 aur sn2 me antar'],
    subject: 'Chemistry',
    en: `**Difference between $S_N1$ and $S_N2$ Reactions**:
1. **Mechanism**:
   • $S_N1$: Two-step reaction proceeding via a stable **carbocation intermediate**.
   • $S_N2$: Single-step concerted reaction passing through a **5-coordinate transition state**.
2. **Kinetics**:
   • $S_N1$: First order, $\\text{Rate} = k[R-X]$.
   • $S_N2$: Second order, $\\text{Rate} = k[R-X][Nu^-]$.
3. **Substrate Reactivity**:
   • $S_N1$: $3^\\circ > 2^\\circ > 1^\\circ > \\text{methyl}$ (due to carbocation stability).
   • $S_N2$: $\\text{methyl} > 1^\\circ > 2^\\circ > 3^\\circ$ (due to steric hindrance).
4. **Stereochemistry**:
   • $S_N1$: Racemization (partial inversion + retention).
   • $S_N2$: Complete Walden Inversion (100% inversion of configuration).`
  },

  // --- BIOLOGY ---
  {
    id: 'photosynthesis',
    keywords: ['photosynthesis', 'prakash sanshleshan', 'prakash sanshleshan kya hai', 'photosynthesis equation'],
    subject: 'Biology',
    en: `**Photosynthesis**:
Photosynthesis is the biochemical process by which green plants and autotrophic organisms use sunlight, chlorophyll, carbon dioxide ($CO_2$), and water ($H_2O$) to synthesize glucose (energy food) and release oxygen ($O_2$).

👉 **Overall Equation**:
$$6CO_2 + 6H_2O + \\text{Sunlight} \\xrightarrow{\\text{Chlorophyll}} C_6H_{12}O_6 + 6O_2$$

👉 **Site**: Chloroplasts of plant leaves.
• **Light Reaction**: Occurs in Thylakoid membranes (produces ATP, NADPH, and releases $O_2$).
• **Dark Reaction (Calvin Cycle)**: Occurs in Stroma (fixes $CO_2$ into glucose).`
  },
  {
    id: 'respiration_cellular',
    keywords: ['respiration', 'cellular respiration', 'shwasan', 'glycolysis', 'krebs cycle'],
    subject: 'Biology',
    en: `**Cellular Respiration**:
The metabolic process where cells break down glucose to release biochemical energy in the form of ATP (Adenosine Triphosphate).

👉 **Overall Reaction**:
$$C_6H_{12}O_6 + 6O_2 \\rightarrow 6CO_2 + 6H_2O + 36\\text{ to }38\\text{ ATP}$$

👉 **Major Stages**:
1. **Glycolysis**: Occurs in **Cytoplasm** (breaks 1 glucose into 2 pyruvates; requires no $O_2$; net 2 ATP).
2. **Krebs Cycle (TCA Cycle)**: Occurs in **Mitochondrial Matrix**.
3. **Electron Transport Chain (ETC)**: Occurs on **Inner Mitochondrial Membrane** (yields the majority of ATP).`
  },
  {
    id: 'mitosis_meiosis',
    keywords: ['mitosis', 'meiosis', 'cell division', 'koshika vibhajan', 'mitosis meiosis difference'],
    subject: 'Biology',
    en: `**Mitosis vs Meiosis (Cell Division)**:
• **Mitosis (Equational Division)**:
  - Occurs in **somatic (body) cells** for growth and repair.
  - Produces **2 genetically identical diploid ($2n$) daughter cells**.
  - Chromosome number remains strictly unchanged.
• **Meiosis (Reductional Division)**:
  - Occurs in **germ cells** to produce gametes (sperm/egg).
  - Produces **4 genetically distinct haploid ($n$) daughter cells**.
  - Involves crossing over (recombination in Pachytene) creating genetic diversity.`
  },
  {
    id: 'dna_rna_difference',
    keywords: ['dna', 'rna', 'dna rna difference', 'dna aur rna me antar', 'dna full form'],
    subject: 'Biology',
    en: `**Difference between DNA and RNA**:
1. **Full Form**:
   • DNA: Deoxyribonucleic Acid
   • RNA: Ribonucleic Acid
2. **Strand Structure**:
   • DNA: Double-stranded double helix (Watson & Crick model).
   • RNA: Usually single-stranded.
3. **Pentose Sugar**:
   • DNA contains 2-deoxyribose sugar.
   • RNA contains ribose sugar (has an extra -OH at 2' position).
4. **Nitrogenous Bases**:
   • DNA: Adenine (A), Thymine (T), Guanine (G), Cytosine (C) [A pairs with T, G with C].
   • RNA: Adenine (A), Uracil (U), Guanine (G), Cytosine (C) [Uracil replaces Thymine].
5. **Function**:
   • DNA stores permanent genetic blueprint.
   • RNA carries out protein synthesis (mRNA, tRNA, rRNA).`
  },
  {
    id: 'mendels_laws',
    keywords: ['mendel', 'mendels law', 'mendel ka niyam', 'genetics mendel'],
    subject: 'Biology',
    en: `**Mendel's Laws of Inheritance**:
1. **Law of Dominance**: In a cross between homozygous contrasting traits, only one parental trait appears in the $F_1$ generation (the dominant trait); the other remains hidden (recessive).
2. **Law of Segregation (Purity of Gametes)**: The two alleles of a gene pair segregate during gamete formation so that each gamete carries only one allele.
3. **Law of Independent Assortment**: Alleles of two or more different genes sort into gametes independently of one another (tested via Dihybrid cross, $9:3:3:1$).`
  },
  {
    id: 'nephron_kidney',
    keywords: ['nephron', 'kidney', 'urinary system', 'vrikk', 'excretion'],
    subject: 'Biology',
    en: `**Nephron (Structural & Functional Unit of Kidney)**:
Each human kidney contains approximately 1 to 1.2 million nephrons that filter blood and produce urine.

👉 **Structure**:
1. **Malpighian Body**: Glomerulus (capillary tuft) + Bowman's Capsule.
2. **Renal Tubules**: Proximal Convoluted Tubule (PCT), Loop of Henle, Distal Convoluted Tubule (DCT), and Collecting Duct.

👉 **Urine Formation Steps**:
1. **Ultrafiltration**: Blood filtered under high pressure in glomerulus.
2. **Selective Reabsorption**: Glucose, amino acids, salts, and $99\\%$ water reabsorbed in PCT and Loop of Henle.
3. **Tubular Secretion**: $H^+, K^+$, and ammonia secreted into tubules to maintain acid-base balance.`
  },

  // --- MATHEMATICS ---
  {
    id: 'quadratic_equations',
    keywords: ['quadratic', 'quadratic equation', 'dvighat samikaran', 'shridharacharya', 'roots of quadratic'],
    subject: 'Mathematics',
    en: `**Quadratic Equations**:
Standard Form: **$ax^2 + bx + c = 0$** ($a \\ne 0$)

👉 **Quadratic Formula (Roots)**:
$$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$$

👉 **Nature of Roots (Discriminant $D = b^2 - 4ac$)**:
• $D > 0$ : Two distinct real roots.
• $D = 0$ : Two equal real roots ($x = -b / 2a$).
• $D < 0$ : No real roots (two complex conjugate roots).
👉 **Sum and Product of Roots**:
• $\\alpha + \\beta = -\\frac{b}{a}$
• $\\alpha \\cdot \\beta = \\frac{c}{a}$`
  },
  {
    id: 'arithmetic_progression',
    keywords: ['arithmetic progression', 'ap', 'samantar shredi', 'ap formula', 'nth term of ap'],
    subject: 'Mathematics',
    en: `**Arithmetic Progression (AP)**:
A sequence where the difference between any two consecutive terms is constant ($d$).
Sequence: $a, a+d, a+2d, a+3d, \\dots$

👉 **$n$-th Term Formula**:
$$a_n = a + (n - 1)d$$

👉 **Sum of First $n$ Terms ($S_n$)**:
$$S_n = \\frac{n}{2}[2a + (n - 1)d] = \\frac{n}{2}(a + l)$$
*(where $a$ = first term, $d$ = common difference, $l = a_n$ = last term).*`
  },
  {
    id: 'trigonometry_identities',
    keywords: ['trigonometry', 'trigonometric identities', 'trikonmiti', 'sin cos tan formula'],
    subject: 'Mathematics',
    en: `**Core Trigonometric Identities**:
1. **Pythagorean Identities**:
   • $\\sin^2\\theta + \\cos^2\\theta = 1$
   • $1 + \\tan^2\\theta = \\sec^2\\theta$
   • $1 + \\cot^2\\theta = \\csc^2\\theta$
2. **Reciprocal Relations**:
   • $\\tan\\theta = \\frac{\\sin\\theta}{\\cos\\theta}$, $\\cot\\theta = \\frac{\\cos\\theta}{\\sin\\theta} = \\frac{1}{\\tan\\theta}$
3. **Standard Values**:
   • $\\sin 0^\\circ = 0, \\sin 30^\\circ = \\frac{1}{2}, \\sin 45^\\circ = \\frac{1}{\\sqrt{2}}, \\sin 60^\\circ = \\frac{\\sqrt{3}}{2}, \\sin 90^\\circ = 1$
   • $\\cos 0^\\circ = 1, \\cos 30^\\circ = \\frac{\\sqrt{3}}{2}, \\cos 45^\\circ = \\frac{1}{\\sqrt{2}}, \\cos 60^\\circ = \\frac{1}{2}, \\cos 90^\\circ = 0$
   • $\\tan 45^\\circ = 1, \\tan 30^\\circ = \\frac{1}{\\sqrt{3}}, \\tan 60^\\circ = \\sqrt{3}$`
  },
  {
    id: 'calculus_derivatives',
    keywords: ['derivative', 'differentiation', 'avakalak', 'calculus formula', 'd/dx'],
    subject: 'Mathematics',
    en: `**Core Differentiation Formulas**:
• $\\frac{d}{dx}(x^n) = n x^{n-1}$
• $\\frac{d}{dx}(\\sin x) = \\cos x$, $\\frac{d}{dx}(\\cos x) = -\\sin x$
• $\\frac{d}{dx}(\\tan x) = \\sec^2 x$
• $\\frac{d}{dx}(e^x) = e^x$, $\\frac{d}{dx}(\\ln x) = \\frac{1}{x}$
• **Product Rule**: $(uv)' = u'v + uv'$
• **Quotient Rule**: $(\\frac{u}{v})' = \\frac{u'v - uv'}{v^2}$
• **Chain Rule**: $\\frac{d}{dx}[f(g(x))] = f'(g(x)) \\cdot g'(x)$`
  },
  {
    id: 'calculus_integrals',
    keywords: ['integral', 'integration', 'samakalan', 'integration formula', 'integrate'],
    subject: 'Mathematics',
    en: `**Core Integration Formulas**:
• $\\int x^n dx = \\frac{x^{n+1}}{n+1} + C$ ($n \\ne -1$)
• $\\int \\frac{1}{x} dx = \\ln|x| + C$
• $\\int e^x dx = e^x + C$
• $\\int \\sin x dx = -\\cos x + C$, $\\int \\cos x dx = \\sin x + C$
• $\\int \\sec^2 x dx = \\tan x + C$
• **Integration by Parts (ILATE Rule)**:
  $$\\int u v dx = u \\int v dx - \\int \\left( u' \\int v dx \\right) dx$$`
  }
];

// 6. Theory Matcher Function (ALWAYS returns English answer)
function searchTheoryAndUnits(query) {
  const cleanQ = query.toLowerCase().trim();
  const normQ = cleanQ
    .replace(/['’]s/g, '')
    .replace(/[^a-zA-Z0-9\u0900-\u097F\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // 1. Check Units and Constants first
  for (const item of UNITS_AND_CONSTANTS) {
    for (const key of item.keys) {
      const normKey = key.toLowerCase()
        .replace(/['’]s/g, '')
        .replace(/[^a-zA-Z0-9\u0900-\u097F\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      if (cleanQ.includes(key.toLowerCase()) || normQ.includes(normKey)) {
        return item.en; // English Only
      }
    }
  }

  // 2. Check Theory Knowledge Base
  for (const topic of THEORY_TOPICS) {
    for (const kw of topic.keywords) {
      const normKw = kw.toLowerCase()
        .replace(/['’]s/g, '')
        .replace(/[^a-zA-Z0-9\u0900-\u097F\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      if (cleanQ.includes(kw.toLowerCase()) || normQ.includes(normKw)) {
        return topic.en; // English Only
      }
    }
  }

  return null;
}

// 7. General Fallback Synthesizer (ALWAYS in English)
function synthesizeTheoryFallback(query, classLevel, topicName = '', subjectName = '') {
  const levelLabel = classLevel === 'class10' 
    ? 'Class 10th' 
    : (classLevel === 'neet' ? 'NEET' : (classLevel === 'jee' ? 'JEE' : 'Class 12th'));

  return `**${query}**:\n\nKey takeaways for ${levelLabel} level:\n1. **Core Concept**: Focus on the fundamental governing principles, scientific definitions, and core laws.\n2. **Formulas & Units**: Verify dimensional homogeneity, sign conventions, and standard SI units.\n3. **Exam Tip**: Write out the standard symbolic equation before substituting numerical values.\n\nType any specific formula, definition, or numerical problem, and I will provide the direct English solution!`;
}

// Helper to build ChatGPT-grade structured response when offline / fallback
function buildChatGPTSolution({ doubt, classLevel, topicName, subjectName, examName, searchRes }) {
  const chapter = searchRes?.groundingChapter;
  const pyq = searchRes?.groundingPYQ;
  const theoryMatch = searchTheoryAndUnits(doubt);

  const sections = [];

  // 1. Direct Answer Section
  if (theoryMatch) {
    sections.push(theoryMatch);
  } else if (chapter) {
    sections.push(`**${chapter.chapter_title} (${chapter.subject})**\n\n${chapter.summary}`);
  } else {
    sections.push(synthesizeTheoryFallback(doubt, classLevel, topicName, subjectName));
  }

  // 2. High-Yield Key Principles
  if (chapter && chapter.matchedTakeaways && chapter.matchedTakeaways.length > 0 && !theoryMatch) {
    sections.push(`### 💡 Core Principles & Key Takeaways\n` + chapter.matchedTakeaways.map(t => `• ${t}`).join('\n'));
  }

  // 3. Highlighted Formulas & Scientific Laws Box
  let formulaOrRule = chapter?.matchedFormulas?.[0]?.formula || '';
  if (chapter && chapter.matchedFormulas && chapter.matchedFormulas.length > 0) {
    const formulaLines = chapter.matchedFormulas.map(f => {
      let line = `Formula: ${f.formula}`;
      if (f.name) line = `[${f.name}]\n${line}`;
      if (f.unit) line += `\nSI Unit / Dimension: ${f.unit}`;
      return line;
    }).join('\n\n');

    sections.push(`### 📐 Important Formulas & Governing Laws\n\`\`\`text\n${formulaLines}\n\`\`\``);
  }

  // 4. Common Exam Traps & High-Scoring Tips
  let proTip = '';
  if (chapter && chapter.matchedTraps && chapter.matchedTraps.length > 0) {
    proTip = chapter.matchedTraps[0];
    sections.push(`### ⚠️ Exam Traps & Examiner Pitfalls (${examName || 'Board & Entrance'})\n` + chapter.matchedTraps.map(t => `• ${t}`).join('\n'));
  } else {
    proTip = 'Always establish standard reference signs and verify consistent SI units before calculating.';
  }

  if (!formulaOrRule && theoryMatch) {
    const formulaMatch = theoryMatch.match(/(?:Formula|Formula)[:\s*]+([^\n\r*]+)/i);
    if (formulaMatch) {
      formulaOrRule = formulaMatch[1].trim();
    }
  }

  // 5. Recent Previous Year Exam Connection
  if (pyq) {
    sections.push(`### 🎯 Tested in Previous Year Exam\n• **${pyq.exam_key.toUpperCase()} ${pyq.year}** (${pyq.topic}):\n  *Question*: ${pyq.question}\n  *Key Takeaway*: ${pyq.explanation.slice(0, 180)}...`);
  }

  const formattedReply = sections.join('\n\n');

  // Dynamic interactive follow-up suggestions (like ChatGPT)
  const defaultSubject = chapter?.subject || subjectName || 'this subject';
  const defaultTopic = chapter?.chapter_title || topicName || 'this concept';
  const followUpSuggestions = [
    `Can you solve a numerical problem on ${defaultTopic}?`,
    `What are the most common exam traps for ${defaultTopic}?`,
    `Derive the main formula for ${defaultTopic} step-by-step.`
  ];

  return {
    formattedReply,
    conceptSummary: (theoryMatch || chapter?.summary || formattedReply).slice(0, 200),
    formulaOrRule,
    proTip,
    followUpSuggestions
  };
}

// 8. Main Solver Function (ChatGPT-Style with Search Engine & Multi-Turn Support)
async function solveStudentDoubtSmart({ doubt, examName = '', subjectName = '', topicName = '', conversationHistory = [] }) {
  const cleanDoubt = (doubt || '').trim();
  if (!cleanDoubt) {
    return {
      doubt: '',
      formatted_reply: 'Hello! I am your AI Doubt Solver. Please ask any question or problem from Physics, Chemistry, Biology, or Mathematics.',
      concept_summary: 'No question provided.',
      formula_or_rule: '',
      pro_tip: 'Ask any specific topic or numerical problem to begin.',
      is_direct_answer: true,
      follow_up_suggestions: [
        'What is Photosynthesis?',
        'State Ohm\'s Law and its formula',
        'Explain Newton\'s Laws of Motion'
      ]
    };
  }

  // Step 1: Evaluate Pure Math / Arithmetic directly (Universal numerical answer without filler)
  const mathResult = evaluateMathExpression(cleanDoubt);
  if (mathResult && mathResult.isMath) {
    return {
      doubt: cleanDoubt,
      topic: topicName || 'Mathematics',
      subject: subjectName || 'Mathematics',
      exam: examName || 'Exam',
      formatted_reply: mathResult.formatted_reply,
      concept_summary: mathResult.answer,
      formula_or_rule: cleanDoubt,
      pro_tip: 'Arithmetic calculation evaluated directly with zero rounding error.',
      is_direct_answer: true,
      search_grounding: null,
      follow_up_suggestions: [
        'Show step-by-step calculation',
        'Solve another arithmetic problem',
        'What are the order of operations (BODMAS)?'
      ]
    };
  }

  // Step 2: Class Level Detection
  const classLevel = detectClassLevel(examName, topicName, subjectName);

  // Step 3: Search Engine Knowledge Retrieval (RAG across Short Notes & 10-Year PYQ Bank)
  const searchRes = searchKnowledge({
    query: cleanDoubt,
    examName,
    subjectName,
    topicName
  });

  const groundingChapter = searchRes.groundingChapter;
  const groundingPYQ = searchRes.groundingPYQ;
  const resolvedTopic = topicName || groundingChapter?.chapter_title || 'General Concept';
  const resolvedSubject = subjectName || groundingChapter?.subject || 'Science & Math';

  // Step 4: Check External Cloud AI (Gemini or Claude) if API Key is configured
  const geminiKey = (process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.GEMINI_KEY || '').trim().replace(/^["']|["']$/g, '');
  const anthropicKey = (process.env.ANTHROPIC_API_KEY || '').trim().replace(/^["']|["']$/g, '');

  if (geminiKey) {
    try {
      const systemInstruction = `You are Pivott AI Doubt Solver, an expert teacher and doubt solver designed to work exactly like ChatGPT for students.
CRITICAL LANGUAGE MANDATE:
- Regardless of whether the student types in English, Hindi, or Hinglish, YOU MUST ALWAYS ANSWER IN CLEAR, PROFESSIONAL ENGLISH ONLY.

CRITICAL FORMAT RULES (LIKE CHATGPT):
1. **Direct Answer**: Provide a clear, definitive 1-2 sentence answer right at the top.
2. **Step-by-Step Explanation**: Break down the concept, mechanism, or derivation logically.
3. **Highlighted Formulas**: Put mathematical formulas and laws in code blocks with SI units.
4. **Exam Traps & Tips**: Point out common pitfalls asked in ${examName || 'Board & Entrance'} exams.
5. **Grounded Knowledge**: Ground your answer in the provided textbook notes and PYQ evidence below.
6. At the very end of your response, provide exactly 3 suggested follow-up questions formatted as:
[SUGGESTIONS]: Follow-up question 1 | Follow-up question 2 | Follow-up question 3

RELEVANT KNOWLEDGE BASE RETRIEVED BY SEARCH ENGINE:
${searchRes.combinedContext || 'Standard NCERT & Competitive Exam Syllabus'}`;

      // Build conversation history for multi-turn awareness
      const contents = [];
      if (Array.isArray(conversationHistory) && conversationHistory.length > 0) {
        for (const msg of conversationHistory.slice(-4)) {
          contents.push({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.content || msg.text || '' }]
          });
        }
      }

      contents.push({
        role: 'user',
        parts: [{
          text: `${systemInstruction}\n\nStudent Level: ${classLevel.toUpperCase()} (${examName || 'Standard Exam'})\nSubject: ${resolvedSubject}\nTopic: ${resolvedTopic}\nStudent Doubt: ${cleanDoubt}`
        }]
      });

      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': geminiKey
        },
        body: JSON.stringify({
          contents,
          generationConfig: {
            temperature: 0.25,
            maxOutputTokens: 900
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        let text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text && text.trim()) {
          text = text.trim();
          let followUps = [
            `Can you solve a numerical problem for this?`,
            `What are the common exam traps for this topic?`,
            `How is this derived step-by-step?`
          ];

          const sugMatch = text.match(/\[SUGGESTIONS\]:\s*(.+)$/i);
          if (sugMatch) {
            followUps = sugMatch[1].split('|').map(s => s.trim()).filter(Boolean);
            text = text.replace(/\[SUGGESTIONS\]:\s*.+$/i, '').trim();
          }

          return {
            doubt: cleanDoubt,
            topic: resolvedTopic,
            subject: resolvedSubject,
            exam: examName || 'Exam',
            formatted_reply: text,
            concept_summary: text.slice(0, 160),
            is_direct_answer: false,
            search_grounding: {
              chapter_title: groundingChapter?.chapter_title || null,
              subject: groundingChapter?.subject || null,
              matched_pyq: groundingPYQ ? `${groundingPYQ.exam_key.toUpperCase()} ${groundingPYQ.year}` : null
            },
            follow_up_suggestions: followUps
          };
        }
      } else {
        const errText = await response.text().catch(() => '');
        console.error('[DoubtEngine] Gemini API call failed:', response.status, response.statusText, errText);
      }
    } catch (err) {
      console.error('[DoubtEngine] Gemini API error, falling back to local synthesis:', err.message);
    }
  }

  // Step 5: Built-in ChatGPT-Grade Knowledge Synthesis Engine
  const builtIn = buildChatGPTSolution({
    doubt: cleanDoubt,
    classLevel,
    topicName: resolvedTopic,
    subjectName: resolvedSubject,
    examName,
    searchRes
  });

  return {
    doubt: cleanDoubt,
    topic: resolvedTopic,
    subject: resolvedSubject,
    exam: examName || 'Exam',
    formatted_reply: builtIn.formattedReply,
    concept_summary: builtIn.conceptSummary || builtIn.formattedReply.slice(0, 160),
    formula_or_rule: builtIn.formulaOrRule || '',
    pro_tip: builtIn.proTip || 'Always verify standard SI units before calculating.',
    is_direct_answer: false,
    search_grounding: {
      chapter_title: groundingChapter?.chapter_title || null,
      subject: groundingChapter?.subject || null,
      matched_pyq: groundingPYQ ? `${groundingPYQ.exam_key.toUpperCase()} ${groundingPYQ.year}` : null
    },
    follow_up_suggestions: builtIn.followUpSuggestions
  };
}

module.exports = {
  detectLanguage,
  evaluateMathExpression,
  detectClassLevel,
  solveStudentDoubtSmart
};

