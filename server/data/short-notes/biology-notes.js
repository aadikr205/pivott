/**
 * Biology Full Chapter Short Notes
 * High-yield revision notes, diagrams/schematics, physiological pathways, and NEET/Board exam points
 */

const BIOLOGY_NOTES = [
  {
    id: 'bio-genetics-molecular',
    chapter_title: 'Genetics: Principles of Inheritance & Molecular Basis',
    subject: 'Biology',
    class_level: 'Class 12 / NEET',
    applicable_exams: ['neet', 'cbse12_pcb', 'cbse12_pcmb', 'bseb12'],
    read_time: '5 min read',
    high_yield: true,
    summary: 'Mendelian ratios, incomplete dominance, Morgan linkage, DNA replication (semiconservative), transcription, and Lac Operon.',
    key_takeaways: [
      'Monohybrid cross phenotypic ratio is 3:1 (genotypic 1:2:1). Dihybrid cross phenotypic ratio is 9:3:3:1.',
      'Incomplete Dominance (Mirabilis jalapa / Antirrhinum): Phenotypic and genotypic ratios are BOTH 1:2:1 (Red : Pink : White).',
      'Codominance: ABO blood grouping in humans (determined by gene I with 3 alleles: I^A, I^B, i).',
      'T.H. Morgan Drosophila experiments proved Linkage: Genes located close together on the same chromosome do not assort independently.',
      'Meselson and Stahl (1958) proved semiconservative DNA replication using ¹⁵N and ¹⁴N isotopes in E. coli.',
      'Genetic Code features: Triplet, Universal, Non-overlapping, Degenerate (61 codons code for 20 amino acids), Stop codons (UAA, UAG, UGA), Start codon (AUG codes for Methionine).',
      'Lac Operon: Inducer is Allolactose. Operon is switched OFF when repressor binds to the Operator gene.'
    ],
    formulas_and_laws: [
      { name: 'Chargaff Rule (dsDNA)', formula: 'A + G = T + C   (meaning A = T and G = C, A/T = 1, G/C = 1)', unit: 'Molar base ratio' },
      { name: 'Monohybrid Ratios', formula: 'Phenotypic: 3:1,   Genotypic: 1:2:1', unit: 'Mendel F2 ratio' },
      { name: 'Dihybrid Cross Ratio', formula: '9 : 3 : 3 : 1 (Round-Yellow : Round-Green : Wrinkled-Yellow : Wrinkled-Green)', unit: 'F2 Phenotype' },
      { name: 'Recombination Frequency', formula: 'Recombinant % = (Total Recombinants / Total Offspring) × 100', unit: 'Centimorgans (cM)' }
    ],
    exam_traps_and_tips: [
      'NEET HIGHEST-YIELD: Stop codons do NOT code for any amino acid: UAA (Ochre), UAG (Amber), UGA (Opal).',
      'TRAP: DNA replication is SEMI-CONSERVATIVE and SEMI-DISCONTINUOUS (leading strand continuous 5\'→3\', lagging strand discontinuous forming Okazaki fragments).',
      'LAC OPERON TRAP: Beta-galactosidase is coded by gene z; Permease by gene y; Transacetylase by gene a.'
    ]
  },
  {
    id: 'bio-human-physiology',
    chapter_title: 'Human Physiology: Circulation, Excretion & Neural Control',
    subject: 'Biology',
    class_level: 'Class 11 / NEET',
    applicable_exams: ['neet', 'cbse12_pcb', 'cbse12_pcmb', 'bseb12'],
    read_time: '5 min read',
    high_yield: true,
    summary: 'Cardiac cycle, ECG waves, nephron counter-current mechanism, nerve impulse conduction, and endocrine hormones.',
    key_takeaways: [
      'Cardiac Cycle lasts 0.8 seconds: Atrial systole (0.1 s), Ventricular systole (0.3 s), Joint diastole (0.4 s). Stroke volume = 70 mL; Cardiac Output = 70 × 72 ≈ 5 Litres/min.',
      'ECG Waves: P-wave (Atrial depolarization), QRS complex (Ventricular depolarization), T-wave (Ventricular repolarization).',
      'Nephron counter-current mechanism in Henle loop and vasa recta maintains hyperosmolarity (up to 1200 mOsmol/L in renal medulla) for concentrating urine.',
      'Renin-Angiotensin-Aldosterone System (RAAS): Juxtaglomerular (JG) cells release Renin when blood pressure falls → Angiotensin II constricts arterioles and stimulates Aldosterone (Na⁺ reabsorption).',
      'Nerve impulse: Resting potential is -70 mV (maintained by 3 Na⁺ out / 2 K⁺ in ATPase pump). Depolarization is caused by rapid influx of Na⁺ ions (voltage-gated channels open).',
      'Master Gland: Pituitary gland. Pancreas secretes Insulin (β-cells, lowers blood glucose) and Glucagon (α-cells, raises blood glucose).'
    ],
    formulas_and_laws: [
      { name: 'Cardiac Output', formula: 'Cardiac Output = Stroke Volume (70 mL) × Heart Rate (72 bpm) ≈ 5040 mL/min ≈ 5 L/min', unit: 'L/min' },
      { name: 'Glomerular Filtration Rate (GFR)', formula: 'GFR = 125 mL/min = 180 Litres/day (99% reabsorbed, ~1.5 L urine excreted)', unit: 'mL/min' },
      { name: 'Sodium-Potassium Pump Ratio', formula: '3 Na⁺ pumped OUT for every 2 K⁺ pumped IN (uses 1 ATP)', unit: 'Ionic transport ratio' }
    ],
    exam_traps_and_tips: [
      'NEET TRAP: Lubb sound (1st heart sound) is caused by closure of AV valves (tricuspid/bicuspid); Dubb (2nd sound) is caused by closure of semilunar valves.',
      'ECG TRAP: Counting the number of QRS complexes in a given time period gives the pulse rate or heart rate of an individual!',
      'HORMONE FEEDBACK: Oxytocin and Vasopressin (ADH) are synthesized in the HYPOTHALAMUS, only STORED and released by Posterior Pituitary (Neurohypophysis).'
    ]
  },
  {
    id: 'bio-cell-cycle-division',
    chapter_title: 'Cell Biology & Cell Cycle Division',
    subject: 'Biology',
    class_level: 'Class 11 / NEET',
    applicable_exams: ['neet', 'cbse12_pcb', 'cbse12_pcmb', 'bseb12'],
    read_time: '4 min read',
    high_yield: true,
    summary: 'Cell organelles, fluid mosaic membrane model, G1/S/G2 interphase phases, and mitosis vs meiosis stages.',
    key_takeaways: [
      'Singer and Nicolson (1972) Fluid Mosaic Model: Phospholipid bilayer with quasi-fluid nature; protein molecules float within the lipid sea.',
      'Mitochondria and Chloroplasts are semi-autonomous organelles containing their own 70S ribosomes and circular dsDNA.',
      'Interphase (95% of cycle duration): G1 (cell growth, RNA/protein synthesis), S phase (DNA replication, chromosome number remains same, DNA amount doubles 2C → 4C), G2 (tubulin synthesis, preparing for mitosis).',
      'Mitosis: Prophase (condensation), Metaphase (chromosomes align at equatorial metaphasic plate), Anaphase (centromere splits, sister chromatids move to opposite poles), Telophase (nuclear membrane reforms).',
      'Meiosis Prophase I substages: Leptotene → Zygotene (synaptonemal complex, bivalent) → Pachytene (crossing over via Recombinase enzyme) → Diplotene (chiasmata visible) → Diakinesis (terminalization of chiasmata).'
    ],
    formulas_and_laws: [
      { name: 'DNA Content in S-Phase', formula: 'Chromosome Number: 2n → 2n (constant);  DNA Amount: 2C → 4C (doubled)', unit: 'Ploidic ratio' },
      { name: 'Meiotic Prophase I Order', formula: 'L - Z - P - D - D  (Leptotene, Zygotene, Pachytene, Diplotene, Diakinesis)', unit: 'Mnemonic sequence' },
      { name: 'Number of Mitotic Divisions', formula: 'Number of cells after n divisions = 2ⁿ', unit: 'Exponential count' }
    ],
    exam_traps_and_tips: [
      'HIGHEST FREQUENCY QUESTION: Crossing over and genetic recombination occurs strictly during the PACHYTENE stage of Prophase I, catalyzed by the enzyme RECOMBINASE!',
      'TRAP: In Metaphase, morphology of chromosomes is best studied; in Anaphase, shape of chromosomes (V, L, J, I) is studied.',
      'ORGANELLE TRAP: Ribosomes are NON-MEMBRANE BOUND organelles found in both prokaryotes (70S) and eukaryotes (80S in cytoplasm, 70S inside mitochondria/chloroplast).'
    ]
  },
  {
    id: 'bio-class10-life-processes',
    chapter_title: 'Class 10th: Life Processes, Control & Heredity',
    subject: 'Science (Biology)',
    class_level: 'Class 10th Board (CBSE & State Boards)',
    applicable_exams: ['class10', 'bseb10'],
    read_time: '3 min read',
    high_yield: true,
    summary: 'Autotrophic nutrition, human digestive tract, xylem vs phloem transport, nephron filtration, neuron structure, and Mendel monohybrid cross.',
    key_takeaways: [
      'Photosynthesis: 6CO₂ + 6H₂O + Sunlight → C₆H₁₂O₆ + 6O₂. Chlorophyll absorbs light energy, water is split into hydrogen and oxygen (photolysis).',
      'Digestion: Salivary amylase breaks starch into maltose. Stomach pepsin digests protein in acidic medium (HCl). Small intestine is site of complete digestion via bile (emulsification), trypsin (protein), and lipase (fat).',
      'Respiration: Glycolysis in cytoplasm produces pyruvate. In lack of oxygen in human muscles, pyruvate converts to Lactic acid (causes cramps). In yeast (anaerobic), it forms Ethanol + CO₂.',
      'Transport in Plants: Xylem transports water and minerals unidirectionally via transpiration pull. Phloem transports food/sucrose bidirectionally via active translocation (requires ATP).',
      'Reflex Arc: Receptor → Sensory Neuron → Spinal Cord (Relay Neuron) → Motor Neuron → Effector Muscle.',
      'Sex Determination in Humans: Females have XX; Males have XY. Sperm determines the sex of the child (50% probability boy or girl).'
    ],
    formulas_and_laws: [
      { name: 'Photosynthesis Reaction', formula: '6CO₂ + 6H₂O + Sunlight (Chlorophyll) → C₆H₁₂O₆ + 6O₂', unit: 'Biochemical equation' },
      { name: 'Mendel Monohybrid F2 Ratio', formula: 'Phenotype = 3 Tall : 1 Dwarf;  Genotype = 1 TT : 2 Tt : 1 tt', unit: '3:1 ratio' },
      { name: '10% Energy Transfer Law', formula: 'Only 10% energy transfers to next trophic level (Lindeman Rule)', unit: 'Energy flow' }
    ],
    exam_traps_and_tips: [
      'BOARD EXAM FAVORITE: Why small intestine of herbivores is longer than carnivores? Because cellulose takes longer time to digest, while meat is easier to digest.',
      'EXCRETION TRAP: Glucose, amino acids, and major water are reabsorbed in the Bowman capsule and proximal tubules, so healthy urine contains NO glucose.',
      'PLANT HORMONE SHORTCUT: Auxin (cell elongation/phototropism), Gibberellin (stem growth), Cytokinin (cell division), Abscisic Acid (stress hormone, stomatal closure, leaf wilting).'
    ]
  }
];

module.exports = { BIOLOGY_NOTES };
