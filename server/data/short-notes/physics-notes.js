/**
 * Physics Full Chapter Short Notes
 * High-yield revision notes, key concepts, formulas, and exam traps
 */

const PHYSICS_NOTES = [
  {
    id: 'phy-laws-of-motion',
    chapter_title: 'Laws of Motion & Mechanics',
    subject: 'Physics',
    class_level: 'Class 11 / NEET / JEE',
    applicable_exams: ['neet', 'jee_main', 'jee', 'cbse12', 'cbse12_pcmb', 'bseb12'],
    read_time: '4 min read',
    high_yield: true,
    summary: 'Foundations of Newtonian mechanics, friction dynamics, circular motion, and conservation of linear momentum.',
    key_takeaways: [
      'Inertia (First Law) is the inherent property of matter to resist any change in its velocity.',
      'Newton Second Law: Net force equals the rate of change of momentum: F_net = dp/dt = m·a (for constant mass).',
      'Action and reaction (Third Law) always act on two different bodies and are simultaneously equal and opposite.',
      'Static friction is self-adjusting with maximum value f_s(max) = μ_s · N. Kinetic friction f_k = μ_k · N (μ_k < μ_s).',
      'Banking of roads without friction: v = √(R·g·tan θ). With friction: v_max = √[R·g(μ + tan θ) / (1 - μ tan θ)].'
    ],
    formulas_and_laws: [
      { name: 'Newton 2nd Law', formula: 'F = m · a', unit: 'Newton (N = kg·m/s²)' },
      { name: 'Linear Momentum', formula: 'p = m · v', unit: 'kg·m/s' },
      { name: 'Impulse', formula: 'J = ∫ F dt = Δp = F_avg · Δt', unit: 'N·s' },
      { name: 'Limiting Friction', formula: 'f_s(max) = μ_s · N', unit: 'Dimensionless (μ)' },
      { name: 'Centripetal Force', formula: 'F_c = m·v² / r = m·ω²·r', unit: 'Newton (N)' },
      { name: 'Conical Pendulum Tension', formula: 'T = m·g / cos θ,  Time period T = 2π√(L cos θ / g)', unit: 'Seconds (s)' }
    ],
    exam_traps_and_tips: [
      'TRAP: Never apply action-reaction pairs on the same Free Body Diagram (FBD). They act on two different bodies!',
      'TIP: Always resolve forces perpendicular and parallel to the inclined plane (mg sin θ down the plane, mg cos θ normal to the plane).',
      'COMMON ERROR: Normal force N is NOT always equal to mg (e.g. on inclined planes N = mg cos θ, or in accelerating elevators N = m(g ± a)).'
    ]
  },
  {
    id: 'phy-electrostatics-current',
    chapter_title: 'Electrostatics & Current Electricity',
    subject: 'Physics',
    class_level: 'Class 12 / NEET / JEE',
    applicable_exams: ['neet', 'jee_main', 'jee', 'cbse12', 'cbse12_pcb', 'cbse12_pcmb', 'bseb12'],
    read_time: '5 min read',
    high_yield: true,
    summary: 'Coulomb force, electric field, potential, capacitance, Ohm law, and Kirchhoff network rules.',
    key_takeaways: [
      'Coulomb force in medium of dielectric constant K: F_med = F_vacuum / K.',
      'Gauss Law states total flux through any closed Gaussian surface equals Q_enclosed / ε₀.',
      'Electric potential V is scalar; E = -dV/dr (electric field points in direction of decreasing potential).',
      'Parallel plate capacitor with dielectric: C = K · ε₀·A / d. Energy stored U = 1/2 CV² = Q² / (2C).',
      'Drift velocity: v_d = e·E·τ / m; Current I = n·e·A·v_d; Resistivity ρ = m / (n·e²·τ).',
      'Kirchhoff Current Law (Σ I = 0) is based on Charge conservation; Voltage Law (Σ ΔV = 0) on Energy conservation.'
    ],
    formulas_and_laws: [
      { name: 'Coulomb Law', formula: 'F = k · |q₁·q₂| / r²,  k = 1/(4πε₀) ≈ 9 × 10⁹ N·m²/C²', unit: 'Newton (N)' },
      { name: 'Capacitance (Parallel Plate)', formula: 'C = ε₀·A / d  (with slab: C = ε₀A / (d - t + t/K))', unit: 'Farad (F)' },
      { name: 'Electric Current', formula: 'I = q / t = n · e · A · v_d', unit: 'Ampere (A)' },
      { name: 'Ohm Law & Resistance', formula: 'V = I · R,   R = ρ · L / A', unit: 'Ohm (Ω)' },
      { name: 'Cell Terminal Voltage', formula: 'V = E - I·r (discharging),  V = E + I·r (charging)', unit: 'Volt (V)' },
      { name: 'Wheatstone Bridge Balance', formula: 'P / Q = R / S  (no current flows through galvanometer)', unit: 'Ratio condition' }
    ],
    exam_traps_and_tips: [
      'TRAP: If battery remains CONNECTED while inserting dielectric, V remains constant and Q increases. If battery is DISCONNECTED, Q remains constant and V decreases!',
      'TIP: When a wire is stretched to double length (L → 2L), its volume is constant so area halves (A → A/2); therefore Resistance increases by 4 times (R ∝ L²).',
      'SIGN CONVENTION: In KVL, traversing in direction of current gives -I·R drop; going from (-) to (+) terminal of cell gives +E.'
    ]
  },
  {
    id: 'phy-optics',
    chapter_title: 'Ray & Wave Optics',
    subject: 'Physics',
    class_level: 'Class 12 / NEET / JEE',
    applicable_exams: ['neet', 'jee_main', 'jee', 'cbse12', 'cbse12_pcb', 'cbse12_pcmb', 'bseb12'],
    read_time: '5 min read',
    high_yield: true,
    summary: 'Reflection, refraction, lenses, optical instruments, wave front theory, interference, and diffraction.',
    key_takeaways: [
      'Snell Law: n₁ sin i = n₂ sin r. Total Internal Reflection occurs when i > i_c (critical angle sin i_c = 1/n).',
      'Lens Maker Formula: 1/f = (n - 1)[1/R₁ - 1/R₂]. Convex lens has positive f; concave lens has negative f.',
      'Compound microscope magnifying power: M = -(L / f_o) · (1 + D / f_e) (for near point image).',
      'Huygens Wavefront: Secondary wavelets propagate outward at the wave speed; tangent envelope forms new wavefront.',
      'Young Double Slit Experiment (YDSE): Fringe width β = λ·D / d. Bright fringe position y_n = n·λ·D / d.',
      'Diffraction central maxima width = 2λ·D / a (twice the width of secondary maxima).'
    ],
    formulas_and_laws: [
      { name: 'Snell Law (Refraction)', formula: 'n₁ · sin i = n₂ · sin r,   n₂₁ = v₁ / v₂ = λ₁ / λ₂', unit: 'Dimensionless ratio' },
      { name: 'Lens Formula', formula: '1/f = 1/v - 1/u,  Magnification m = v / u', unit: 'Meter⁻¹ / Dioptre' },
      { name: 'Mirror Formula', formula: '1/f = 1/v + 1/u,  Magnification m = -v / u', unit: 'Meter (m)' },
      { name: 'Prism Refractive Index', formula: 'n = sin[(A + δ_m) / 2] / sin(A / 2)', unit: 'Dimensionless' },
      { name: 'YDSE Fringe Width', formula: 'β = λ · D / d', unit: 'Meter (m)' },
      { name: 'Brewster Law (Polarization)', formula: 'tan i_p = n,   i_p + r = 90°', unit: 'Degrees (°)' }
    ],
    exam_traps_and_tips: [
      'TRAP: When light enters water from air, frequency (f) remains STRICTLY CONSTANT; wavelength (λ) and speed (v) decrease by factor n.',
      'TIP: If entire YDSE apparatus is submerged in water of refractive index n_w, fringe width reduces to β / n_w.',
      'SIGN CONVENTION: Distances in direction of incident ray are POSITIVE (+), opposite are NEGATIVE (-).'
    ]
  },
  {
    id: 'phy-thermodynamics-ktg',
    chapter_title: 'Thermodynamics & Kinetic Theory of Gases',
    subject: 'Physics',
    class_level: 'Class 11 / NEET / JEE',
    applicable_exams: ['neet', 'jee_main', 'jee', 'cbse12', 'cbse12_pcb', 'cbse12_pcmb', 'bseb12'],
    read_time: '4 min read',
    high_yield: true,
    summary: 'First and Second laws of thermodynamics, PV diagrams, specific heat ratios, and Carnot cycle efficiency.',
    key_takeaways: [
      'First Law of Thermodynamics: ΔQ = ΔU + ΔW (in Physics, ΔW = P·ΔV is work done BY the gas).',
      'Internal energy of ideal gas depends ONLY on temperature: ΔU = n·C_v·ΔT.',
      'Isothermal process (T = const): ΔU = 0, ΔQ = W = nRT ln(V₂/V₁).',
      'Adiabatic process (Q = const): P·V^γ = constant, W = (P₁V₁ - P₂V₂) / (γ - 1) = nR(T₁ - T₂) / (γ - 1).',
      'Degrees of freedom (f): Monoatomic = 3, Diatomic = 5 (at room temp), Polyatomic = 6.',
      'Carnot Engine Efficiency: η = 1 - T_c / T_h (temperatures must ALWAYS be converted to Kelvin).'
    ],
    formulas_and_laws: [
      { name: 'First Law of Thermodynamics', formula: 'ΔQ = ΔU + ΔW = n·C_v·ΔT + ∫ P dV', unit: 'Joule (J)' },
      { name: 'Mayer Relation', formula: 'C_p - C_v = R,   γ = C_p / C_v = 1 + 2/f', unit: 'J/(mol·K)' },
      { name: 'RMS Speed of Gas', formula: 'v_rms = √(3RT / M) = √(3kT / m)', unit: 'm/s' },
      { name: 'Carnot Efficiency', formula: 'η = 1 - T_cold / T_hot = 1 - Q_c / Q_h', unit: 'Percentage / Ratio' },
      { name: 'Mean Free Path', formula: 'λ = 1 / (√2 · π · d² · n_v)', unit: 'Meter (m)' }
    ],
    exam_traps_and_tips: [
      'CRITICAL TRAP: Always convert Celsius to Kelvin (K = °C + 273.15) before calculating Carnot efficiency!',
      'TIP: The area enclosed by a cyclic process on a P-V diagram equals the net work done. Clockwise = Positive work, Counter-clockwise = Negative work.',
      'COMMON CONFUSION: In an adiabatic expansion, the gas does positive work so internal energy falls and the gas COOLS.'
    ]
  },
  {
    id: 'phy-modern-semiconductors',
    chapter_title: 'Modern Physics & Semiconductor Devices',
    subject: 'Physics',
    class_level: 'Class 12 / NEET / JEE',
    applicable_exams: ['neet', 'jee_main', 'jee', 'cbse12', 'cbse12_pcb', 'cbse12_pcmb', 'bseb12'],
    read_time: '4 min read',
    high_yield: true,
    summary: 'Photoelectric effect, Bohr atomic model, nuclear binding energy, half-life, and p-n junction diodes.',
    key_takeaways: [
      'Einstein equation: E = hν = Φ₀ + K_max = hν₀ + e·V_s (V_s = stopping potential).',
      'de Broglie wavelength of electron accelerated by V volts: λ = 12.27 / √V Å.',
      'Bohr model postulates: Angular momentum L = mvr = n·h/(2π); Energy in n-th orbit E_n = -13.6 · Z² / n² eV.',
      'Radioactive Decay Law: N(t) = N₀ · e^(-λt); Half-life T_1/2 = 0.693 / λ; Mean life τ = 1 / λ.',
      'Semiconductors: Intrinsic (pure Si/Ge, n_e = n_h = n_i). Doped: p-type (trivalent, holes majority), n-type (pentavalent, electrons majority).',
      'Diode as Rectifier: Forward bias conducts; reverse bias blocks (depletion layer widens).'
    ],
    formulas_and_laws: [
      { name: 'Photoelectric Equation', formula: 'K_max = e · V_s = hν - Φ₀ = hc/λ - hc/λ₀', unit: 'eV or Joule' },
      { name: 'de Broglie Wavelength', formula: 'λ = h / p = h / √(2m·E) = h / √(2m·q·V)', unit: 'Meter (m) or Å' },
      { name: 'Rydberg Formula', formula: '1/λ = R_H · Z² [1/n₁² - 1/n₂²]', unit: 'm⁻¹ (R_H ≈ 1.097 × 10⁷ m⁻¹)' },
      { name: 'Radioactive Half-Life', formula: 'T_1/2 = ln(2) / λ ≈ 0.693 / λ,   N = N₀ (1/2)^(t / T_1/2)', unit: 'Seconds / Years' },
      { name: 'Mass Defect & Energy', formula: 'ΔE = Δm · c² = Δm (in amu) × 931.5 MeV', unit: 'MeV' }
    ],
    exam_traps_and_tips: [
      'TRAP: Photoelectric current depends on INTENSITY of light, while maximum kinetic energy (and stopping potential) depends ONLY on FREQUENCY of incident light.',
      'TIP: In hydrogen spectrum transitions: Lyman series is in ULTRAVIOLET (n₁=1), Balmer in VISIBLE (n₁=2), Paschen in INFRARED (n₁=3).',
      'HIGH-SCORING: Mass defect calculation: Δm = [Z·m_p + (A - Z)m_n] - M_nucleus.'
    ]
  },
  {
    id: 'phy-class10-light-electricity',
    chapter_title: 'Class 10th: Light & Electricity Essentials',
    subject: 'Science (Physics)',
    class_level: 'Class 10th Board (CBSE & State Boards)',
    applicable_exams: ['class10', 'bseb10'],
    read_time: '3 min read',
    high_yield: true,
    summary: 'Laws of reflection, refraction, concave/convex mirrors & lenses, Ohm law, and domestic electric circuits.',
    key_takeaways: [
      'Concave mirror forms real inverted images for all positions except when object is between P and F (virtual, erect & magnified).',
      'Convex mirror ALWAYS forms virtual, erect, and diminished images (used as rear-view mirror in vehicles).',
      'Power of a lens: P = 1 / f (in meters), unit is Dioptre (D). Convex = +ve D, Concave = -ve D.',
      'Ohm Law: At constant temperature, V ∝ I (V = I·R). Resistance depends on length (R ∝ l), area (R ∝ 1/A), and material (ρ).',
      'Resistors in Series: R_eq = R₁ + R₂ + R₃ (same current). In Parallel: 1/R_eq = 1/R₁ + 1/R₂ + 1/R₃ (same voltage).',
      'Joule Law of Heating: Heat generated H = I²·R·t = V·I·t = (V² / R)·t (Unit: Joules). Electric power P = V·I.'
    ],
    formulas_and_laws: [
      { name: 'Mirror Formula', formula: '1/f = 1/v + 1/u,  m = -v/u = h_i / h_o', unit: 'cm / m' },
      { name: 'Lens Formula', formula: '1/f = 1/v - 1/u,  m = v/u = h_i / h_o', unit: 'cm / m' },
      { name: 'Lens Power', formula: 'P = 1 / f (m),   P_total = P₁ + P₂ + ...', unit: 'Dioptre (D)' },
      { name: 'Ohm Law', formula: 'V = I · R,   R = ρ · l / A', unit: 'Ohm (Ω)' },
      { name: 'Electric Energy & Commercial Unit', formula: '1 kWh = 1 Unit = 3.6 × 10⁶ Joules', unit: 'Joules (J)' }
    ],
    exam_traps_and_tips: [
      'TRAP: Focal length of concave mirror/lens is ALWAYS NEGATIVE; convex mirror/lens focal length is ALWAYS POSITIVE.',
      'TIP: When solving resistor problems, check if voltage is same (parallel) or current is same (series).',
      'BOARD EXAM FAVORITE: Why tungsten is used for bulb filaments? High melting point (3380°C) and high resistivity.'
    ]
  }
];

module.exports = { PHYSICS_NOTES };
