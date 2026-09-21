/**
 * Visual Concept Notes Enhancer
 * Generates Mermaid.js diagrams, mnemonics, real-life examples, and common mistakes
 * for all short notes chapters across Physics, Chemistry, Biology, and Mathematics.
 */

const ENHANCEMENTS_BY_ID = {
  'phy-laws-of-motion': {
    concept_map_mermaid: `graph TD
  A["Newtonian Mechanics"] --> B["1st Law: Inertia"]
  A --> C["2nd Law: Momentum & Force"]
  A --> D["3rd Law: Action & Reaction"]
  A --> E["Friction Dynamics"]
  B --> B1["Inherent resistance to Δv"]
  C --> C1["F_net = dp/dt = m*a"]
  C --> C2["Impulse J = Δp = F*Δt"]
  D --> D1["Pairs act on 2 DIFFERENT bodies"]
  E --> E1["Static: f_s ≤ μ_s * N"]
  E --> E2["Kinetic: f_k = μ_k * N"]
  A --> F["Circular Banking"]
  F --> F1["v_max = sqrt(R*g*tan θ)"]`,
    mnemonic: 'FAN: Force = Acceleration * mass, Action = reaction, No net force = constant velocity.',
    real_life_example: 'When a subway train brakes abruptly, passengers lurch forward because their bodies possess inertia — their mass tends to stay at previous velocity unless external friction stops them.',
    common_mistakes: [
      'Drawing action-reaction pairs on the same Free Body Diagram (they act on distinct objects).',
      'Assuming normal force N always equals mg (on an incline N = mg cos θ; in an elevator N = m(g ± a)).',
      'Using kinetic friction formula before checking if applied force exceeds limiting static friction.'
    ],
    key_points: [
      'Inertia depends purely on mass, not velocity or size.',
      'F = ma applies strictly in inertial reference frames or with pseudo-forces.',
      'Friction always opposes relative motion between contacting surfaces.'
    ]
  },

  'phy-electrostatics-current': {
    concept_map_mermaid: `graph TD
  A["Electromagnetism Core"] --> B["Coulomb's Law"]
  A --> C["Gauss's Law & Flux"]
  A --> D["Capacitance"]
  A --> E["Current & Drift Velocity"]
  B --> B1["F = k * |q1*q2| / r^2"]
  C --> C1["Φ_closed = Q_enc / ε_0"]
  D --> D1["C = K * ε_0 * A / d"]
  D --> D2["Stored Energy U = 1/2 CV^2"]
  E --> E1["I = n * e * A * v_d"]
  E --> E2["Ohm's Law: V = I * R"]
  A --> F["Kirchhoff's Laws"]
  F --> F1["KCL: Charge Conservation"]
  F --> F2["KVL: Energy Conservation"]`,
    mnemonic: 'CIVIL: Capacitor: Current leads Voltage. Inductor: Voltage leads current. KCL is Current (Charge), KVL is Voltage (Energy).',
    real_life_example: 'Rubbing a wool balloon creates a net static charge on its surface via friction, which then polarizes neutral atoms in a wall and sticks to it through electrostatic induction.',
    common_mistakes: [
      'Treating Electric Potential as a vector (it is a scalar; fields are vectors).',
      'Confusing electron drift speed (~mm/s) with the speed of electric signal propagation (~c).',
      'Forgetting that inserting a dielectric while connected to a battery keeps V constant, but isolated keeps Q constant.'
    ],
    key_points: [
      'Electric field lines never cross and are always perpendicular to equipotential surfaces.',
      'Inside a static hollow conductor, electric field E = 0 and potential V is uniform throughout.'
    ]
  },

  'chem-thermodynamics-equilibrium': {
    concept_map_mermaid: `graph TD
  A["Chemical Energetics"] --> B["1st Law: Conservation"]
  A --> C["Entropy: 2nd Law"]
  A --> D["Gibbs Free Energy"]
  A --> E["Chemical Equilibrium"]
  B --> B1["ΔU = Q - W"]
  B --> B2["Enthalpy: ΔH = ΔU + Δn_g RT"]
  C --> C1["ΔS_univ = ΔS_sys + ΔS_surr > 0"]
  D --> D1["ΔG = ΔH - T*ΔS"]
  D --> D2["Spontaneous if ΔG < 0"]
  E --> E1["Le Chatelier Principle"]
  E --> E2["ΔG° = -RT ln K_eq"]`,
    mnemonic: 'G = H - TS: "Great Helpers Think Smart". Negative ΔG gives Guaranteed Spontaneity.',
    real_life_example: 'Dissolving ammonium nitrate in cold packs absorbs heat (endothermic, ΔH > 0), yet proceeds spontaneously because the huge increase in entropy (ΔS > 0) drives ΔG negative at room temperature.',
    common_mistakes: [
      'Assuming all exothermic reactions (ΔH < 0) are automatically spontaneous regardless of temperature.',
      'Including pure liquids and solids in equilibrium constant K_c or K_p expressions.',
      'Confusing reaction quotient Q with equilibrium constant K.'
    ],
    key_points: [
      'At equilibrium, ΔG = 0, while standard ΔG° determines the equilibrium constant K_eq.',
      'A catalyst speeds up both forward and reverse reaction rates equally; it never shifts equilibrium position.'
    ]
  },

  'chem-organic-reactions': {
    concept_map_mermaid: `graph TD
  A["Organic Reaction Pathways"] --> B["Nucleophilic Substitution"]
  A --> C["Electrophilic Addition"]
  A --> D["Carbonyl Chemistry"]
  A --> E["Aromatic Substitution"]
  B --> B1["SN1: 2-step, carbocation, racemization"]
  B --> B2["SN2: 1-step, backside attack, inversion"]
  C --> C1["Markovnikov Rule: H goes to more H"]
  D --> D1["Aldol: α-hydrogen required"]
  D --> D2["Cannizzaro: No α-hydrogen, redox"]
  E --> E1["Electrophilic Nitration, Halogenation"]`,
    mnemonic: 'SN1 = Step 1 Carbocation (tertiary preferred). SN2 = 2 molecules collide in Step 1 (Walden inversion, primary preferred).',
    real_life_example: 'Souring of wine into vinegar is an oxidation of ethanol into acetaldehyde and then acetic acid, following standard carbonyl oxidation pathways.',
    common_mistakes: [
      'Attempting Aldol condensation on benzaldehyde or formaldehyde without recognizing they have zero α-hydrogens.',
      'Mixing up SN1 (polar protic solvent favors carbocation) and SN2 (polar aprotic solvent avoids solvating nucleophile).',
      'Forgetting rearrangement of secondary carbocations into more stable tertiary carbocations.'
    ],
    key_points: [
      'Carbocation stability order: 3° > 2° > 1° > methyl (stabilized by hyperconjugation and resonance).',
      'Electronegative carbonyl carbon is electrophilic and susceptible to nucleophilic addition.'
    ]
  },

  'bio-genetics-inheritance': {
    concept_map_mermaid: `graph TD
  A["Principles of Genetics"] --> B["Mendel's Laws"]
  A --> C["Chromosomal Deviations"]
  A --> D["Molecular Basis"]
  A --> E["Genetic Disorders"]
  B --> B1["Monohybrid 3:1 ratio"]
  B --> B2["Dihybrid 9:3:3:1 ratio"]
  B --> B3["Independent Assortment"]
  C --> C1["Incomplete Dominance 1:2:1"]
  C --> C2["Codominance: ABO blood types"]
  D --> D1["DNA Replication (Semi-conservative)"]
  D --> D2["Transcription & Translation"]
  E --> E1["Mendelian: Haemophilia, Sickle Cell"]
  E --> E2["Chromosomal: Down, Turner syndrome"]`,
    mnemonic: 'All Men Think Great: Adenine pairs with Thymine (2 H-bonds), Guanine pairs with Cytosine (3 H-bonds).',
    real_life_example: 'ABO blood group inheritance demonstrates codominance: a person with I^A and I^B alleles expresses both A and B glycoproteins simultaneously on their red blood cell membranes.',
    common_mistakes: [
      'Confusing incomplete dominance (pink snapdragons, 1:2:1) with codominance (AB blood group, both expressed).',
      'Assuming sex-linked recessive conditions like haemophilia affect males and females equally (males are hemizygous XY and more vulnerable).',
      'Misinforming that sickle-cell anemia is caused by a chromosomal deletion (it is a single base pair point mutation: GAG to GUG, Glutamic acid to Valine).'
    ],
    key_points: [
      'Recombination occurs exclusively during Pachytene stage of Meiosis I.',
      'DNA polymerase synthesizes only in the 5\' to 3\' direction.'
    ]
  },

  'math-calculus-derivatives': {
    concept_map_mermaid: `graph TD
  A["Calculus & Analysis"] --> B["Limits & Continuity"]
  A --> C["Differential Calculus"]
  A --> D["Integral Calculus"]
  A --> E["Differential Equations"]
  B --> B1["L'Hopital Rule: 0/0 and inf/inf"]
  B --> B2["Squeeze Theorem"]
  C --> C1["Product & Quotient Rules"]
  C --> C2["Maxima & Minima: f'' test"]
  D --> D1["Fundamental Theorem: ∫ f dx"]
  D --> D2["Definite Integral Properties: King Property"]
  E --> E1["Linear 1st Order: Integrating Factor"]`,
    mnemonic: 'LATE for Integration by Parts: Logarithmic, Algebraic, Trigonometric, Exponential — choose u in this priority.',
    real_life_example: 'An automobile speedometer displays instantaneous velocity, which is the derivative of position with respect to time (v = ds/dt).',
    common_mistakes: [
      'Applying L\'Hopital\'s rule to expressions that are not indeterminate forms (like 0/0 or inf/inf).',
      'Forgetting the integration constant C in indefinite integrals.',
      'Confusing dy/dx = 0 with a guarantee of an extremum (it could be an inflection point, like y = x^3 at x = 0).'
    ],
    key_points: [
      'Continuous functions on a closed interval [a,b] must attain their absolute maximum and minimum.',
      'The King property of definite integrals (integral from 0 to a of f(x) equals integral of f(a-x)) simplifies trigonometric quotients immediately.'
    ]
  }
};

function enhanceNoteWithVisuals(note) {
  if (!note) return note;

  const defaultEnhancement = {
    concept_map_mermaid: `graph TD
  A["${note.chapter_title}"] --> B["Core Principles"]
  A --> C["Key Equations & Laws"]
  A --> D["Exam Application"]
  B --> B1["Fundamental Definition"]
  B --> B2["Governing Constraints"]
  C --> C1["Primary Formula"]
  C --> C2["Boundary Conditions"]
  D --> D1["Standard Problem Patterns"]
  D --> D2["Frequent Pitfalls Avoided"]`,
    mnemonic: `Remember key variables in ${note.chapter_title} by connecting them to conservation laws and boundary states.`,
    real_life_example: `In real world engineering and natural science, ${note.chapter_title} governs the state transitions and equilibrium balances observed daily.`,
    common_mistakes: note.exam_traps_and_tips || [
      'Overlooking unit conversions between metric and standard quantities.',
      'Misidentifying boundary conditions before applying governing equations.'
    ],
    key_points: note.key_takeaways || [
      'Master core definitions before memorizing multi-step derivations.',
      'Verify physical dimensions and limiting behaviors of final formulas.'
    ]
  };

  const specific = ENHANCEMENTS_BY_ID[note.id] || {};

  return {
    ...note,
    concept_map_mermaid: specific.concept_map_mermaid || defaultEnhancement.concept_map_mermaid,
    mnemonic: specific.mnemonic || defaultEnhancement.mnemonic,
    real_life_example: specific.real_life_example || defaultEnhancement.real_life_example,
    common_mistakes: specific.common_mistakes || defaultEnhancement.common_mistakes,
    key_points: specific.key_points || defaultEnhancement.key_points
  };
}

module.exports = {
  enhanceNoteWithVisuals,
  ENHANCEMENTS_BY_ID
};
