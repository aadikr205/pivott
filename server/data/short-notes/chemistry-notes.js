/**
 * Chemistry Full Chapter Short Notes
 * High-yield revision notes, reaction mechanisms, formulas, and exam traps
 */

const CHEMISTRY_NOTES = [
  {
    id: 'chem-bonding-structure',
    chapter_title: 'Chemical Bonding & Molecular Structure',
    subject: 'Chemistry',
    class_level: 'Class 11 / NEET / JEE',
    applicable_exams: ['neet', 'jee_main', 'jee', 'cbse12', 'cbse12_pcb', 'cbse12_pcmb', 'bseb12'],
    read_time: '4 min read',
    high_yield: true,
    summary: 'VSEPR geometries, orbital hybridization, dipole moments, molecular orbital theory (MOT), and hydrogen bonding.',
    key_takeaways: [
      'Octet rule exceptions: Incomplete octet (BF₃, BeCl₂), Expanded octet (PCl₅, SF₆), Odd-electron molecules (NO, NO₂).',
      'VSEPR Theory: Lone pair - Lone pair repulsion > Lone pair - Bond pair > Bond pair - Bond pair repulsion.',
      'Hybridization Steric Number: SN = (Number of bonded atoms) + (Number of lone pairs on central atom).',
      'SN = 2 (sp, Linear 180°), SN = 3 (sp², Trigonal planar 120°), SN = 4 (sp³, Tetrahedral 109.5°), SN = 5 (sp³d, TBP), SN = 6 (sp³d², Octahedral).',
      'Molecular Orbital Theory (MOT): Bond Order = 1/2 (N_b - N_a). If Bond Order > 0, molecule exists. Unpaired electrons = Paramagnetic (e.g. O₂ has 2 unpaired electrons in π* orbitals).'
    ],
    formulas_and_laws: [
      { name: 'Steric Number (Hybridization)', formula: 'SN = 1/2 [V + M - C + A]  (V = valence e⁻, M = monovalent atoms, C = cation charge, A = anion charge)', unit: 'Integer (2 to 7)' },
      { name: 'Bond Order (MOT)', formula: 'B.O. = 1/2 · (N_bonding - N_antibonding)', unit: 'Numerical value' },
      { name: 'Dipole Moment', formula: 'μ = q · d', unit: 'Debye (1 D = 3.335 × 10⁻³⁰ C·m)' },
      { name: 'Formal Charge', formula: 'FC = V - N_nonbonding - 1/2 N_bonding', unit: 'Charge' }
    ],
    exam_traps_and_tips: [
      'NEET/JEE CLASSIC: In PCl₅ (sp³d), axial bonds are LONGER and WEAKER than equatorial bonds due to greater 90° repulsion. In SF₄, lone pair occupies the equatorial position!',
      'TRAP: BF₃ is non-polar (μ = 0) due to symmetrical trigonal planar geometry, but NH₃ (μ = 1.47 D) is polar due to lone pair direction matching N-H bond dipoles.',
      'PARAMAGNETISM TRAP: O₂ is paramagnetic (has 2 unpaired electrons in π*2px and π*2py orbitals), which Valence Bond Theory failed to explain but MOT proves.'
    ]
  },
  {
    id: 'chem-organic-carbonyls',
    chapter_title: 'Organic Mechanisms: Carbonyls, Alcohols & Amines',
    subject: 'Chemistry',
    class_level: 'Class 12 / NEET / JEE',
    applicable_exams: ['neet', 'jee_main', 'jee', 'cbse12', 'cbse12_pcb', 'cbse12_pcmb', 'bseb12'],
    read_time: '5 min read',
    high_yield: true,
    summary: 'Nucleophilic addition, named condensation reactions, acidic strength of carboxylic acids, and amine basicity orders.',
    key_takeaways: [
      'Nucleophilic Addition in Carbonyls: Reactivity order: Formaldehyde > Aldehydes > Ketones (due to steric crowding and +I effect of alkyl groups).',
      'Aldol Condensation: Requires α-hydrogen + dilute base (NaOH) → forms β-hydroxyaldehyde (Aldol), then heating gives α,β-unsaturated carbonyl.',
      'Cannizzaro Reaction: Aldehydes with NO α-hydrogen (HCHO, PhCHO) + conc. KOH undergo auto-redox → alcohol + carboxylate salt.',
      'Iodoform Test (Yellow ppt of CHI₃): Positive for compounds containing CH₃-C=O or CH₃-CH(OH)- group.',
      'Acidity order: Formic acid > Benzoic acid > Acetic acid. Electron withdrawing groups (-NO₂, -CN, -Cl) increase acidity.',
      'Basicity of Amines in aqueous medium: (CH₃)₂NH > CH₃NH₂ > (CH₃)₃N > NH₃ (2° > 1° > 3° > NH₃ due to inductive, solvation, and steric effects).'
    ],
    formulas_and_laws: [
      { name: 'Aldol Condensation', formula: '2 CH₃CHO + dil. NaOH → CH₃-CH(OH)-CH₂-CHO → (heat) CH₃-CH=CH-CHO (Crotonaldehyde)', unit: 'Reaction' },
      { name: 'Cannizzaro Reaction', formula: '2 HCHO + 50% KOH → CH₃OH + HCOOK', unit: 'Disproportionation' },
      { name: 'Clemmensen Reduction', formula: 'R-CO-R + Zn-Hg / conc. HCl → R-CH₂-R + H₂O', unit: 'Carbonyl to Alkane' },
      { name: 'Wolff-Kishner Reduction', formula: 'R-CO-R + NH₂NH₂ / KOH in ethylene glycol (heat) → R-CH₂-R + N₂', unit: 'Alkaline Reduction' },
      { name: 'Carbylamine Test', formula: 'R-NH₂ + CHCl₃ + 3 KOH (alc.) → R-NC (foul smelling isocyanide) + 3 KCl + 3 H₂O', unit: '1° Amine Test' }
    ],
    exam_traps_and_tips: [
      'EXAM TRAP: Benzaldehyde gives CANNIZZARO (no α-H); Acetaldehyde gives ALDOL (has 3 α-H).',
      'AMINE BASICITY TRAP: In gaseous phase, basicity is strictly 3° > 2° > 1° > NH₃. But in aqueous medium for ethyl group, it is 2° > 3° > 1° > NH₃ (231 rule); for methyl group it is 2° > 1° > 3° > NH₃ (213 rule)!',
      'TEST SHORTCUT: Lucas reagent (anhydrous ZnCl₂ + conc. HCl) gives immediate cloudiness for 3° alcohols, in 5 mins for 2° alcohols, and none at room temp for 1° alcohols.'
    ]
  },
  {
    id: 'chem-equilibrium-solutions',
    chapter_title: 'Equilibrium & Colligative Properties',
    subject: 'Chemistry',
    class_level: 'Class 11 & 12 / NEET / JEE',
    applicable_exams: ['neet', 'jee_main', 'jee', 'cbse12', 'cbse12_pcb', 'cbse12_pcmb', 'bseb12'],
    read_time: '4 min read',
    high_yield: true,
    summary: 'Le Chatelier principle, pH of buffer solutions, solubility product (Ksp), Raoult law, and Van\'t Hoff factor.',
    key_takeaways: [
      'Relation between K_p and K_c: K_p = K_c · (RT)^Δn_g (where Δn_g = moles of gaseous products - moles of gaseous reactants).',
      'Le Chatelier Principle: Increasing pressure shifts equilibrium towards fewer gas moles. Increasing temperature favors endothermic direction (ΔH > 0).',
      'Buffer Solutions: Acidic buffer (Weak acid + salt: e.g. CH₃COOH + CH₃COONa) pH = pKa + log([Salt]/[Acid]). Basic buffer pOH = pKb + log([Salt]/[Base]).',
      'Solubility Product Ksp: Precipitation occurs only when Ionic Product (Q_sp) > Ksp.',
      'Raoult Law for ideal solutions: P_total = P_A° · x_A + P_B° · x_B. Positive deviation (ΔH_mix > 0, ΔV_mix > 0, e.g. Ethanol + Acetone).',
      'Van\'t Hoff factor (i): For dissociation, i = 1 + (n - 1)α. For association (dimerization), i = 1 + (1/n - 1)α.'
    ],
    formulas_and_laws: [
      { name: 'K_p and K_c relation', formula: 'K_p = K_c · (R·T)^Δn_g', unit: 'Atm^Δn_g' },
      { name: 'Henderson-Hasselbalch Equation', formula: 'pH = pK_a + log₁₀([Conjugate Base] / [Weak Acid])', unit: 'pH scale (0-14)' },
      { name: 'Relative Lowering of Vapor Pressure', formula: '(P° - P_s) / P° = i · x_solute = i · (n / N)', unit: 'Dimensionless' },
      { name: 'Elevation in Boiling Point', formula: 'ΔT_b = i · K_b · m  (m = molality)', unit: 'Kelvin or °C' },
      { name: 'Depression in Freezing Point', formula: 'ΔT_f = i · K_f · m', unit: 'Kelvin or °C' },
      { name: 'Osmotic Pressure', formula: 'π = i · C · R · T = i · (n / V) · R · T', unit: 'Atm / Pascal' }
    ],
    exam_traps_and_tips: [
      'CRITICAL TRAP: Never forget the Van\'t Hoff factor (i) when comparing boiling points or freezing points! E.g. 0.1 M Al₂(SO₄)₃ has i = 5, so it causes 5 times greater boiling elevation than 0.1 M glucose (i = 1).',
      'FREEZING POINT TRAP: Higher ΔT_f means LOWEST actual freezing point (T_f = T_f° - ΔT_f)! So 0.1 M Al₂(SO₄)₃ has the LOWEST freezing point.',
      'BUFFER CAPACITY: Buffer is most effective when [Salt] = [Acid], meaning pH = pKa.'
    ]
  },
  {
    id: 'chem-coordination-compounds',
    chapter_title: 'Coordination Compounds & Metallurgy',
    subject: 'Chemistry',
    class_level: 'Class 12 / NEET / JEE',
    applicable_exams: ['neet', 'jee_main', 'jee', 'cbse12', 'cbse12_pcb', 'cbse12_pcmb', 'bseb12'],
    read_time: '4 min read',
    high_yield: true,
    summary: 'IUPAC naming of coordination complexes, Werner theory, valence bond theory (VBT), crystal field splitting (CFT), and isomerism.',
    key_takeaways: [
      'Werner Coordination Theory: Primary valency is ionizable (equals oxidation state); Secondary valency is non-ionizable (equals coordination number, directional).',
      'Ligands: Monodentate (H₂O, NH₃, Cl⁻, CN⁻), Bidentate (oxalate ox²⁻, ethylenediamine en), Polydentate (EDTA⁴⁻, hexadentate, used in lead poisoning).',
      'Ambidentate ligands have two donor atoms (e.g. NO₂⁻ vs ONO⁻, SCN⁻ vs NCS⁻) causing linkage isomerism.',
      'Crystal Field Splitting in Octahedral (Δ_o): d-orbitals split into lower t_2g (d_xy, d_yz, d_zx) and higher e_g (d_x²-y², d_z²).',
      'Spectrochemical Series: I⁻ < Br⁻ < S²⁻ < Cl⁻ < F⁻ < OH⁻ < C₂O₄²⁻ < H₂O < NH₃ < en < CN⁻ < CO (CO is the strongest field ligand).',
      'Strong field ligands (CN⁻, CO) cause pairing (Δ_o > P) → low spin, inner orbital complexes (d²sp³).'
    ],
    formulas_and_laws: [
      { name: 'Magnetic Moment (Spin-Only)', formula: 'μ_s = √[n · (n + 2)] B.M.  (n = number of unpaired electrons)', unit: 'Bohr Magnetons (B.M.)' },
      { name: 'Crystal Field Stabilization Energy (CFSE)', formula: 'CFSE (octahedral) = [-0.4 · n(t_2g) + 0.6 · n(e_g)] · Δ_o + m·P', unit: 'Δ_o' },
      { name: 'Tetrahedral vs Octahedral Splitting', formula: 'Δ_t = (4/9) · Δ_o  (Tetrahedral complexes are almost always high spin)', unit: 'Ratio' }
    ],
    exam_traps_and_tips: [
      'COLOR TRAP: [Ti(H₂O)₆]³⁺ is purple due to d-d transition (t_2g¹ e_g⁰ → t_2g⁰ e_g¹). Complexes with d⁰ (e.g. Sc³⁺, Ti⁴⁺) or d¹⁰ (e.g. Zn²⁺, Cu⁺) are COLORLESS because no d-d transition is possible!',
      'KMnO₄ and K₂Cr₂O₇ COLOR EXCEPTION: MnO₄⁻ (Mn⁷⁺, d⁰) is intensely purple due to CHARGE TRANSFER spectra, NOT d-d transition!',
      'MAGNETIC MOMENT TIP: n = 1 → 1.73 BM, n = 2 → 2.83 BM, n = 3 → 3.87 BM, n = 4 → 4.90 BM, n = 5 → 5.92 BM.'
    ]
  },
  {
    id: 'chem-class10-reactions-acids',
    chapter_title: 'Class 10th: Chemical Reactions, Acids, Bases & Carbon',
    subject: 'Science (Chemistry)',
    class_level: 'Class 10th Board (CBSE & State Boards)',
    applicable_exams: ['class10', 'bseb10'],
    read_time: '3 min read',
    high_yield: true,
    summary: 'Types of chemical reactions, indicators, pH scale in daily life, baking soda, washing soda, Plaster of Paris, and homologous series.',
    key_takeaways: [
      'Types of reactions: Combination (CaO + H₂O → Ca(OH)₂), Decomposition (2FeSO₄ → Fe₂O₃ + SO₂ + SO₃), Displacement (Fe + CuSO₄ → FeSO₄ + Cu), Double displacement (Na₂SO₄ + BaCl₂ → BaSO₄↓ + 2NaCl).',
      'Redox: Oxidation is gain of oxygen/loss of hydrogen; Reduction is loss of oxygen/gain of hydrogen. Corrosion and Rancidity are oxidation effects.',
      'Important Salts: Baking Soda (NaHCO₃), Washing Soda (Na₂CO₃·10H₂O), Bleaching Powder (CaOCl₂), Plaster of Paris (CaSO₄·1/2 H₂O), Gypsum (CaSO₄·2H₂O).',
      'POP reaction: CaSO₄·1/2 H₂O + 1½ H₂O → CaSO₄·2H₂O (Gypsum hard solid mass).',
      'Carbon: Covalent bonding, Tetravalency, Catenation (self-linking property). Allotropes: Diamond (hardest, non-conductor), Graphite (hexagonal layers, good conductor), Fullerene (C₆₀).',
      'Hydrocarbon formulas: Alkane (C_n H_2n+2), Alkene (C_n H_2n), Alkyne (C_n H_2n-2).'
    ],
    formulas_and_laws: [
      { name: 'Bleaching Powder Preparation', formula: 'Ca(OH)₂ + Cl₂ → CaOCl₂ + H₂O', unit: 'Chemical equation' },
      { name: 'Baking Soda Heating', formula: '2 NaHCO₃ →(heat) Na₂CO₃ + H₂O + CO₂ (CO₂ makes cakes fluffy)', unit: 'Thermal decomposition' },
      { name: 'Saponification (Soap making)', formula: 'Ester + NaOH → Alcohol + Sodium salt of fatty acid (Soap)', unit: 'Hydrolysis' },
      { name: 'Esterification Reaction', formula: 'CH₃COOH + C₂H₅OH →(conc. H₂SO₄) CH₃COOC₂H₅ (sweet smelling ester) + H₂O', unit: 'Condensation' }
    ],
    exam_traps_and_tips: [
      'BOARD EXAM FAVORITE: Plaster of Paris must be stored in moisture-proof containers because it absorbs water and turns into hard Gypsum.',
      'COLOR CHANGE: Copper sulfate solution turns from blue to green when iron nail is immersed, and reddish-brown copper deposits on nail.',
      'PH VALUE: Tooth decay starts when mouth pH falls below 5.5 (bacteria produce acids that corrode enamel made of calcium hydroxyapatite).'
    ]
  }
];

module.exports = { CHEMISTRY_NOTES };
