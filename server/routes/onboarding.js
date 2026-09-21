const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const { authMiddleware } = require('../middleware/auth');
const { replanSchedule, formatDate } = require('../scheduler');
const { generateReplanExplanation, generateMicroCopy } = require('../ai');

// Syllabus presets for instant onboarding
const SYLLABUS_PRESETS = {
  neet: {
    name: 'NEET (Medical Entrance)',
    subjects: [
      {
        name: 'Physics',
        topics: [
          { name: 'Laws of Motion & Mechanics', weightage: 5, estimated_minutes: 180 },
          { name: 'Thermodynamics & Kinetic Theory', weightage: 5, estimated_minutes: 150 },
          { name: 'Ray & Wave Optics', weightage: 4, estimated_minutes: 120 },
          { name: 'Electrostatics & Current Electricity', weightage: 5, estimated_minutes: 150 },
          { name: 'Units, Dimensions & Errors', weightage: 2, estimated_minutes: 60 }
        ]
      },
      {
        name: 'Chemistry',
        topics: [
          { name: 'Organic Reaction Mechanisms & Carbonyls', weightage: 5, estimated_minutes: 180 },
          { name: 'Chemical Bonding & Molecular Structure', weightage: 5, estimated_minutes: 140 },
          { name: 'Equilibrium & Ionic Equilibrium', weightage: 4, estimated_minutes: 130 },
          { name: 'Coordination Compounds', weightage: 4, estimated_minutes: 110 },
          { name: 'Environmental Chemistry', weightage: 2, estimated_minutes: 60 }
        ]
      },
      {
        name: 'Biology',
        topics: [
          { name: 'Principles of Inheritance & Genetics', weightage: 5, estimated_minutes: 180 },
          { name: 'Human Physiology (Circulation & Neural)', weightage: 5, estimated_minutes: 160 },
          { name: 'Cell Cycle & Cell Division', weightage: 4, estimated_minutes: 100 },
          { name: 'Ecology & Biodiversity', weightage: 4, estimated_minutes: 110 },
          { name: 'Living World & Taxonomy', weightage: 2, estimated_minutes: 50 }
        ]
      }
    ]
  },
  jee_main: {
    name: 'JEE Main (NTA)',
    subjects: [
      {
        name: 'Physics',
        topics: [
          { name: 'Kinematics & Laws of Motion', weightage: 5, estimated_minutes: 150 },
          { name: 'Work, Energy & Rotational Motion', weightage: 5, estimated_minutes: 170 },
          { name: 'Thermodynamics & Kinetic Theory', weightage: 5, estimated_minutes: 140 },
          { name: 'Electrostatics & Current Electricity', weightage: 5, estimated_minutes: 160 },
          { name: 'Magnetic Effects of Current & EMI/AC', weightage: 5, estimated_minutes: 150 },
          { name: 'Ray & Wave Optics', weightage: 4, estimated_minutes: 130 },
          { name: 'Modern Physics & Semiconductors', weightage: 5, estimated_minutes: 150 },
          { name: 'Gravitation, Fluids & SHM', weightage: 4, estimated_minutes: 120 },
          { name: 'Units, Dimensions & Experimental Skills', weightage: 3, estimated_minutes: 70 }
        ]
      },
      {
        name: 'Chemistry',
        topics: [
          { name: 'Chemical Bonding & Molecular Structure', weightage: 5, estimated_minutes: 140 },
          { name: 'Thermodynamics & Chemical Kinetics', weightage: 5, estimated_minutes: 150 },
          { name: 'Solutions, Electrochemistry & Equilibrium', weightage: 5, estimated_minutes: 150 },
          { name: 'General Organic Chemistry (GOC) & Reaction Mechanisms', weightage: 5, estimated_minutes: 160 },
          { name: 'Hydrocarbons, Haloalkanes & Carbonyl Compounds', weightage: 5, estimated_minutes: 170 },
          { name: 'Coordination Compounds & d, f-Block', weightage: 5, estimated_minutes: 130 },
          { name: 'Periodic Properties & p-Block Elements', weightage: 4, estimated_minutes: 110 },
          { name: 'Biomolecules & Organic Practical Chemistry', weightage: 3, estimated_minutes: 70 }
        ]
      },
      {
        name: 'Mathematics',
        topics: [
          { name: 'Coordinate Geometry: Circles & Conic Sections', weightage: 5, estimated_minutes: 170 },
          { name: 'Differential Calculus: Limits, Continuity & Derivatives', weightage: 5, estimated_minutes: 160 },
          { name: 'Integral Calculus: Definite Integrals & Areas', weightage: 5, estimated_minutes: 170 },
          { name: 'Vectors & 3D Geometry', weightage: 5, estimated_minutes: 160 },
          { name: 'Matrices & Determinants', weightage: 5, estimated_minutes: 120 },
          { name: 'Sequences, Series & Binomial Theorem', weightage: 4, estimated_minutes: 120 },
          { name: 'Quadratic Equations & Complex Numbers', weightage: 4, estimated_minutes: 110 },
          { name: 'Probability & Statistics', weightage: 4, estimated_minutes: 100 },
          { name: 'Differential Equations', weightage: 4, estimated_minutes: 100 }
        ]
      }
    ]
  },
  jee: {
    name: 'JEE Advanced',
    subjects: [
      {
        name: 'Physics',
        topics: [
          { name: 'Rotational Dynamics, Inertia & Angular Momentum', weightage: 5, estimated_minutes: 180 },
          { name: 'Electromagnetic Induction & Alternating Current', weightage: 5, estimated_minutes: 160 },
          { name: 'Wave Optics, Polarization & Interference', weightage: 5, estimated_minutes: 130 },
          { name: 'Modern Physics, Nuclear Physics & Dual Nature', weightage: 5, estimated_minutes: 140 },
          { name: 'Thermodynamics & Heat Transfer', weightage: 5, estimated_minutes: 150 },
          { name: 'General Physics & Error Analysis', weightage: 3, estimated_minutes: 70 }
        ]
      },
      {
        name: 'Chemistry',
        topics: [
          { name: 'Thermodynamics & Thermochemistry', weightage: 5, estimated_minutes: 160 },
          { name: 'Aldehydes, Ketones, Carboxylic Acids & Polymers', weightage: 5, estimated_minutes: 180 },
          { name: 'Coordination Chemistry & Transition Elements', weightage: 5, estimated_minutes: 140 },
          { name: 'Ionic Equilibrium & Electrochemistry', weightage: 5, estimated_minutes: 140 },
          { name: 'Qualitative Salt Analysis (Inorganic)', weightage: 4, estimated_minutes: 110 }
        ]
      },
      {
        name: 'Mathematics',
        topics: [
          { name: 'Definite Integration & Differential Equations', weightage: 5, estimated_minutes: 180 },
          { name: 'Vectors & 3D Geometry (Advanced)', weightage: 5, estimated_minutes: 170 },
          { name: 'Functions, Limits, Continuity & Differentiability', weightage: 5, estimated_minutes: 160 },
          { name: 'Complex Numbers & Conic Sections', weightage: 5, estimated_minutes: 150 },
          { name: 'Matrices, Determinants & Probability', weightage: 4, estimated_minutes: 130 }
        ]
      }
    ]
  },
  cbse12: {
    name: 'CBSE 12th Board Exam (PCM)',
    subjects: [
      {
        name: 'Physics',
        topics: [
          { name: 'Electric Charges & Fields', weightage: 5, estimated_minutes: 120 },
          { name: 'Current Electricity', weightage: 4, estimated_minutes: 100 },
          { name: 'Optics & Optical Instruments', weightage: 5, estimated_minutes: 140 },
          { name: 'Semiconductor Electronics', weightage: 4, estimated_minutes: 90 }
        ]
      },
      {
        name: 'Chemistry',
        topics: [
          { name: 'Solutions & Colligative Properties', weightage: 4, estimated_minutes: 110 },
          { name: 'Electrochemistry', weightage: 4, estimated_minutes: 120 },
          { name: 'Haloalkanes & Haloarenes', weightage: 4, estimated_minutes: 100 },
          { name: 'Biomolecules', weightage: 3, estimated_minutes: 80 }
        ]
      },
      {
        name: 'Mathematics',
        topics: [
          { name: 'Calculus: Derivatives & Integrals', weightage: 5, estimated_minutes: 180 },
          { name: 'Relations & Functions', weightage: 3, estimated_minutes: 90 },
          { name: 'Vectors & 3D Geometry', weightage: 4, estimated_minutes: 120 },
          { name: 'Linear Programming', weightage: 3, estimated_minutes: 70 }
        ]
      }
    ]
  },
  cbse12_pcb: {
    name: 'CBSE 12th Board (PCB)',
    subjects: [
      {
        name: 'Physics',
        topics: [
          { name: 'Electric Charges & Current Electricity', weightage: 5, estimated_minutes: 130 },
          { name: 'Ray & Wave Optics', weightage: 5, estimated_minutes: 140 },
          { name: 'Electromagnetic Induction & AC', weightage: 4, estimated_minutes: 110 },
          { name: 'Atoms, Nuclei & Semiconductors', weightage: 4, estimated_minutes: 100 }
        ]
      },
      {
        name: 'Chemistry',
        topics: [
          { name: 'Solutions & Chemical Kinetics', weightage: 4, estimated_minutes: 120 },
          { name: 'Electrochemistry', weightage: 5, estimated_minutes: 130 },
          { name: 'Coordination Compounds & d-Block', weightage: 4, estimated_minutes: 110 },
          { name: 'Organic Carbonyls, Amines & Haloalkanes', weightage: 5, estimated_minutes: 150 },
          { name: 'Biomolecules', weightage: 3, estimated_minutes: 80 }
        ]
      },
      {
        name: 'Biology',
        topics: [
          { name: 'Sexual Reproduction in Flowering Plants & Humans', weightage: 5, estimated_minutes: 140 },
          { name: 'Principles of Inheritance & Molecular Genetics', weightage: 5, estimated_minutes: 170 },
          { name: 'Human Health and Diseases', weightage: 4, estimated_minutes: 100 },
          { name: 'Biotechnology: Principles & Applications', weightage: 5, estimated_minutes: 120 },
          { name: 'Ecosystem, Biodiversity & Conservation', weightage: 4, estimated_minutes: 90 }
        ]
      }
    ]
  },
  cbse12_pcmb: {
    name: 'CBSE 12th Board (PCMB)',
    subjects: [
      {
        name: 'Physics',
        topics: [
          { name: 'Electrostatics & Current Electricity', weightage: 5, estimated_minutes: 120 },
          { name: 'Optics & Wave Theory', weightage: 5, estimated_minutes: 130 },
          { name: 'Modern Physics & Semiconductors', weightage: 4, estimated_minutes: 100 }
        ]
      },
      {
        name: 'Chemistry',
        topics: [
          { name: 'Solutions & Electrochemistry', weightage: 5, estimated_minutes: 120 },
          { name: 'Chemical Kinetics & Coordination Chemistry', weightage: 4, estimated_minutes: 110 },
          { name: 'Organic Chemistry Reactions & Carbonyls', weightage: 5, estimated_minutes: 140 },
          { name: 'Biomolecules', weightage: 3, estimated_minutes: 80 }
        ]
      },
      {
        name: 'Mathematics',
        topics: [
          { name: 'Calculus: Derivatives & Integrals', weightage: 5, estimated_minutes: 160 },
          { name: 'Vectors & 3D Geometry', weightage: 5, estimated_minutes: 130 },
          { name: 'Matrices, Determinants & LPP', weightage: 4, estimated_minutes: 90 }
        ]
      },
      {
        name: 'Biology',
        topics: [
          { name: 'Reproduction & Reproductive Health', weightage: 4, estimated_minutes: 110 },
          { name: 'Genetics & Molecular Basis of Inheritance', weightage: 5, estimated_minutes: 160 },
          { name: 'Biotechnology & Human Health', weightage: 5, estimated_minutes: 120 },
          { name: 'Ecology & Environment', weightage: 3, estimated_minutes: 80 }
        ]
      }
    ]
  },
  class10: {
    name: 'Class 10th Board Exam (CBSE & State Boards)',
    subjects: [
      {
        name: 'Science',
        topics: [
          { name: 'Chemical Reactions & Acids, Bases, Salts', weightage: 4, estimated_minutes: 100 },
          { name: 'Metals, Non-metals & Carbon Compounds', weightage: 5, estimated_minutes: 130 },
          { name: 'Life Processes (Nutrition, Respiration, Circulation)', weightage: 5, estimated_minutes: 140 },
          { name: 'Control, Coordination & Reproduction', weightage: 4, estimated_minutes: 110 },
          { name: 'Heredity & Evolution', weightage: 4, estimated_minutes: 90 },
          { name: 'Light: Reflection, Refraction & Human Eye', weightage: 5, estimated_minutes: 130 },
          { name: 'Electricity & Magnetic Effects of Electric Current', weightage: 5, estimated_minutes: 130 }
        ]
      },
      {
        name: 'Mathematics',
        topics: [
          { name: 'Real Numbers & Polynomials', weightage: 3, estimated_minutes: 80 },
          { name: 'Linear Equations & Quadratic Equations', weightage: 4, estimated_minutes: 110 },
          { name: 'Arithmetic Progressions (AP)', weightage: 4, estimated_minutes: 90 },
          { name: 'Triangles & Circles Geometry', weightage: 5, estimated_minutes: 140 },
          { name: 'Introduction to Trigonometry & Heights and Distances', weightage: 5, estimated_minutes: 140 },
          { name: 'Coordinate Geometry', weightage: 3, estimated_minutes: 80 },
          { name: 'Surface Areas, Volumes & Statistics/Probability', weightage: 4, estimated_minutes: 110 }
        ]
      },
      {
        name: 'Social Science',
        topics: [
          { name: 'History: Nationalism in Europe & India', weightage: 5, estimated_minutes: 110 },
          { name: 'Geography: Resources, Agriculture & Manufacturing', weightage: 4, estimated_minutes: 100 },
          { name: 'Polity: Power Sharing, Federalism & Democracy', weightage: 4, estimated_minutes: 90 },
          { name: 'Economics: Development, Money and Credit', weightage: 4, estimated_minutes: 90 }
        ]
      },
      {
        name: 'English',
        topics: [
          { name: 'Reading Comprehension & Writing Skills', weightage: 4, estimated_minutes: 80 },
          { name: 'Grammar: Tenses, Modals & Determiners', weightage: 3, estimated_minutes: 70 },
          { name: 'Literature: First Flight & Footprints Prose/Poems', weightage: 4, estimated_minutes: 100 }
        ]
      }
    ]
  },
  bseb12: {
    name: 'Bihar Board 12th (BSEB Inter Science)',
    subjects: [
      {
        name: 'Physics (भौतिकी)',
        topics: [
          { name: 'स्थिर वैद्युतिकी एवं विद्युत धारा', weightage: 5, estimated_minutes: 120 },
          { name: 'धारा का चुंबकीय प्रभाव एवं प्रत्यावर्ती धारा', weightage: 4, estimated_minutes: 110 },
          { name: 'किरण एवं तरंग प्रकाशिकी (Optics)', weightage: 5, estimated_minutes: 130 },
          { name: 'परमाणु, नाभिक एवं अर्धचालक युक्तियाँ', weightage: 4, estimated_minutes: 100 },
          { name: 'संचार व्यवस्था (Communication Systems)', weightage: 3, estimated_minutes: 70 }
        ]
      },
      {
        name: 'Chemistry (रसायन शास्त्र)',
        topics: [
          { name: 'विलयन, वैद्युत रसायन एवं रासायनिक बलगतिकी', weightage: 5, estimated_minutes: 130 },
          { name: 'p-ब्लॉक एवं d, f-ब्लॉक के तत्व', weightage: 4, estimated_minutes: 110 },
          { name: 'उपसहसंयोजन यौगिक (Coordination Compounds)', weightage: 4, estimated_minutes: 90 },
          { name: 'हैलोएल्केन, एल्कोहॉल, एल्डिहाइड एवं कीटोन', weightage: 5, estimated_minutes: 140 },
          { name: 'जैव-अणु एवं बहुलक (Biomolecules & Polymers)', weightage: 3, estimated_minutes: 80 }
        ]
      },
      {
        name: 'Biology / Math (जीव विज्ञान / गणित)',
        topics: [
          { name: 'आनुवंशिकी तथा वंशागति का आणविक आधार / कलन (Calculus)', weightage: 5, estimated_minutes: 150 },
          { name: 'जनन तथा जनन स्वास्थ्य / सदिश एवं त्रिविमीय ज्यामिति', weightage: 5, estimated_minutes: 130 },
          { name: 'जैव प्रौद्योगिकी एवं मानव कल्याण / आव्यूह एवं सारणिक', weightage: 4, estimated_minutes: 110 },
          { name: 'पारिस्थितिकी एवं पर्यावरण / रैखिक प्रोग्रामन एवं प्रायिकता', weightage: 4, estimated_minutes: 90 }
        ]
      },
      {
        name: 'Hindi (100 अंक हिंदी - अनिवार्य)',
        topics: [
          { name: 'गद्य खंड: बातचीत, उसने कहा था, संपूर्ण क्रांति, अर्धनारीश्वर', weightage: 4, estimated_minutes: 90 },
          { name: 'पद्य खंड: कड़बक, पद (सूरदास/तुलसीदास), उषा, जन-जन का चेहरा एक', weightage: 4, estimated_minutes: 90 },
          { name: 'हिंदी व्याकरण: संधि, समास, मुहावरे, पर्यायवाची, निबंध एवं पत्र लेखन', weightage: 5, estimated_minutes: 100 }
        ]
      },
      {
        name: 'English (100 Marks English - Compulsory)',
        topics: [
          { name: 'Prose: Indian Civilization & Culture, Bharat is My Home, A Pinch of Snuff', weightage: 4, estimated_minutes: 90 },
          { name: 'Poetry: Sweetest Love, Song of Myself, Now the Leaves are Falling Fast', weightage: 4, estimated_minutes: 80 },
          { name: 'Grammar & Composition: Tenses, Voice, Narration, Essay & Letter Writing', weightage: 5, estimated_minutes: 100 }
        ]
      }
    ]
  },
  bseb10: {
    name: 'Bihar Board 10th (BSEB Matric)',
    subjects: [
      {
        name: 'Science (विज्ञान - भौतिकी, रसायन, जीवविज्ञान)',
        topics: [
          { name: 'रासायनिक अभिक्रियाएँ, अम्ल-क्षार एवं लवण', weightage: 4, estimated_minutes: 90 },
          { name: 'धातु-अधातु एवं कार्बन तथा उसके यौगिक', weightage: 5, estimated_minutes: 120 },
          { name: 'जैव प्रक्रम (पोषण, श्वसन, परिवहन, उत्सर्जन)', weightage: 5, estimated_minutes: 130 },
          { name: 'नियंत्रण एवं समन्वय तथा जनन', weightage: 4, estimated_minutes: 100 },
          { name: 'प्रकाश का परावर्तन-अपवर्तन एवं मानव नेत्र', weightage: 5, estimated_minutes: 130 },
          { name: 'विद्युत धारा तथा इसका चुंबकीय प्रभाव', weightage: 5, estimated_minutes: 120 }
        ]
      },
      {
        name: 'Mathematics (गणित)',
        topics: [
          { name: 'वास्तविक संख्याएँ, बहुपद एवं रैखिक समीकरण', weightage: 4, estimated_minutes: 90 },
          { name: 'द्विघात समीकरण एवं समानांतर श्रेढ़ी (AP)', weightage: 4, estimated_minutes: 100 },
          { name: 'त्रिभुज, वृत्त एवं ज्यामितीय रचनाएँ', weightage: 5, estimated_minutes: 130 },
          { name: 'त्रिकोणमिति का परिचय एवं ऊंचाई और दूरी', weightage: 5, estimated_minutes: 140 },
          { name: 'निर्देशांक ज्यामिति, पृष्ठीय क्षेत्रफल, सांख्यिकी एवं प्रायिकता', weightage: 4, estimated_minutes: 110 }
        ]
      },
      {
        name: 'Social Science (सामाजिक विज्ञान)',
        topics: [
          { name: 'इतिहास: यूरोप और भारत में राष्ट्रवाद, अर्थव्यवस्था', weightage: 5, estimated_minutes: 100 },
          { name: 'भूगोल: भारत संसाधन एवं उपयोग, कृषि, जल संसाधन', weightage: 4, estimated_minutes: 90 },
          { name: 'राजनीति विज्ञान: लोकतंत्र में सत्ता की साझेदारी', weightage: 4, estimated_minutes: 90 },
          { name: 'अर्थशास्त्र: हमारी अर्थव्यवस्था, मुद्रा और साख', weightage: 4, estimated_minutes: 80 },
          { name: 'आपदा प्रबंधन: प्राकृतिक एवं मानव जनित आपदाएँ', weightage: 3, estimated_minutes: 60 }
        ]
      },
      {
        name: 'Hindi (मातृभाषा हिंदी)',
        topics: [
          { name: 'गोधूलि भाग 2 गद्य: श्रम विभाजन, विष के दांत, बहादुर', weightage: 4, estimated_minutes: 80 },
          { name: 'गोधूलि पद्य: राम नाम बिनु बिरथे जगि जनमा, स्वदेशी', weightage: 4, estimated_minutes: 80 },
          { name: 'वर्णिका भाग 2 & व्याकरण (संधि, समास, कारक, निबंध)', weightage: 5, estimated_minutes: 90 }
        ]
      },
      {
        name: 'Sanskrit / Non-Hindi (संस्कृत / अहिन्दी)',
        topics: [
          { name: 'पियूषम्: मंगलम्, पाटलिपुत्रवैभवम्, आलसकथा', weightage: 4, estimated_minutes: 80 },
          { name: 'संस्कृत व्याकरण: संधि, कारक विभक्ति, प्रत्यय, अनुवाद एवं पत्र लेखन', weightage: 5, estimated_minutes: 90 }
        ]
      }
    ]
  },

  // 8 Official Olympiad Presets (Indian Talent Olympiad & Global Pattern Aligned)
  olympiad_iso: {
    name: 'International Science Olympiad (ISO)',
    min_class: 1,
    max_class: 12,
    is_olympiad: true,
    subjects: [
      {
        name: 'Science & Core Phenomena',
        topics: [
          { name: 'Physical Properties, Forces & Motion', weightage: 5, estimated_minutes: 90 },
          { name: 'Matter, Chemical Changes & Reactions', weightage: 5, estimated_minutes: 90 },
          { name: 'Living Organisms, Plant & Animal Systems', weightage: 5, estimated_minutes: 100 },
          { name: 'Natural Resources, Earth & Space Science', weightage: 4, estimated_minutes: 80 }
        ]
      },
      {
        name: 'HOTS & Higher Order Thinking',
        topics: [
          { name: 'Experimental Analysis & Hypothesis Testing', weightage: 5, estimated_minutes: 100 },
          { name: 'Data Interpretation, Graphs & Scientific Models', weightage: 5, estimated_minutes: 90 }
        ]
      },
      {
        name: 'Logical Reasoning (Olympiad Pattern)',
        topics: [
          { name: 'Analogy, Classification & Pattern Recognition', weightage: 4, estimated_minutes: 70 },
          { name: 'Coding-Decoding, Series & Spatial Sense', weightage: 4, estimated_minutes: 70 }
        ]
      }
    ]
  },
  olympiad_imo: {
    name: 'International Maths Olympiad (IMO)',
    min_class: 1,
    max_class: 12,
    is_olympiad: true,
    subjects: [
      {
        name: 'Mathematical Reasoning',
        topics: [
          { name: 'Number Sense, Computation & Operations', weightage: 5, estimated_minutes: 90 },
          { name: 'Algebraic Expressions, Patterns & Equations', weightage: 5, estimated_minutes: 100 },
          { name: 'Geometry, Shapes & Spatial Reasoning', weightage: 5, estimated_minutes: 100 },
          { name: 'Mensuration, Perimeter & Area Foundations', weightage: 4, estimated_minutes: 80 }
        ]
      },
      {
        name: 'Everyday Mathematics',
        topics: [
          { name: 'Commercial Arithmetic: Profit/Loss, Interest & Ratios', weightage: 5, estimated_minutes: 90 },
          { name: 'Time, Distance, Speed & Work Calculations', weightage: 4, estimated_minutes: 80 }
        ]
      },
      {
        name: 'Achievers Section (Advanced Analytical)',
        topics: [
          { name: 'Multi-Step Analytical Word Problems & HOTS', weightage: 5, estimated_minutes: 110 },
          { name: 'Mathematical Logic, Venn Diagrams & Puzzles', weightage: 4, estimated_minutes: 80 }
        ]
      }
    ]
  },
  olympiad_eio: {
    name: 'English International Olympiad (EIO)',
    min_class: 1,
    max_class: 10,
    is_olympiad: true,
    subjects: [
      {
        name: 'Word & Structure Knowledge',
        topics: [
          { name: 'Grammar: Tenses, Prepositions & Conjunctions', weightage: 5, estimated_minutes: 80 },
          { name: 'Vocabulary: Synonyms, Antonyms & Idiomatic Phrases', weightage: 5, estimated_minutes: 80 },
          { name: 'Spellings, Collocations & Word Derivatives', weightage: 4, estimated_minutes: 70 }
        ]
      },
      {
        name: 'Reading Comprehension',
        topics: [
          { name: 'Unseen Passages & Inferential Comprehension', weightage: 5, estimated_minutes: 90 },
          { name: 'Tone, Theme & Character Analysis in Context', weightage: 4, estimated_minutes: 80 }
        ]
      },
      {
        name: 'Spoken and Written Expression & HOTS',
        topics: [
          { name: 'Sentence Ordering, Dialogue Completion & Cohesion', weightage: 4, estimated_minutes: 70 },
          { name: 'Advanced Stylistic Choices & Error Spotting', weightage: 5, estimated_minutes: 80 }
        ]
      }
    ]
  },
  olympiad_gkio: {
    name: 'General Knowledge International Olympiad (GKIO)',
    min_class: 1,
    max_class: 10,
    is_olympiad: true,
    subjects: [
      {
        name: 'General Awareness',
        topics: [
          { name: 'History, Monuments & World Civilizations', weightage: 4, estimated_minutes: 70 },
          { name: 'World Geography, Solar System & Continents', weightage: 4, estimated_minutes: 80 },
          { name: 'Indian Heritage, Constitution & Governance', weightage: 4, estimated_minutes: 70 },
          { name: 'Science, Discoveries & Modern Inventions', weightage: 5, estimated_minutes: 80 }
        ]
      },
      {
        name: 'Current Affairs & Global Environment',
        topics: [
          { name: 'Global Events, International Organizations & Summits', weightage: 4, estimated_minutes: 70 },
          { name: 'Sports, Awards, Literature & Cultural Honours', weightage: 4, estimated_minutes: 70 },
          { name: 'Ecology, Wildlife Conservation & Climate Initiatives', weightage: 4, estimated_minutes: 70 }
        ]
      },
      {
        name: 'Life Skills & Quantitative Aptitude',
        topics: [
          { name: 'Values, Ethics & Disaster Preparedness Awareness', weightage: 4, estimated_minutes: 60 },
          { name: 'Mental Ability & Logical IQ Patterns', weightage: 5, estimated_minutes: 70 }
        ]
      }
    ]
  },
  olympiad_ico: {
    name: 'International Computer Olympiad (ICO)',
    min_class: 1,
    max_class: 10,
    is_olympiad: true,
    subjects: [
      {
        name: 'Computer Architecture & Operating Systems',
        topics: [
          { name: 'Hardware Components, CPU, Memory & I/O Devices', weightage: 4, estimated_minutes: 70 },
          { name: 'Operating Systems & File Management Essentials', weightage: 4, estimated_minutes: 70 }
        ]
      },
      {
        name: 'Logic, Flowcharts & Computational Thinking',
        topics: [
          { name: 'Algorithms, Flowcharts & Conditional Branching', weightage: 5, estimated_minutes: 90 },
          { name: 'Introduction to Coding Logic & Scratch / Python Basics', weightage: 5, estimated_minutes: 100 }
        ]
      },
      {
        name: 'IT Applications & Cybersecurity',
        topics: [
          { name: 'Word Processors, Spreadsheets & Multimedia Tools', weightage: 4, estimated_minutes: 70 },
          { name: 'Internet Protocols, Web Browsing & Cyber Safety', weightage: 4, estimated_minutes: 70 }
        ]
      }
    ]
  },
  olympiad_ido: {
    name: 'International Drawing Olympiad (IDO)',
    min_class: 1,
    max_class: 10,
    is_olympiad: true,
    subjects: [
      {
        name: 'Drawing Fundamentals & Observation',
        topics: [
          { name: 'Basic Shapes, Freehand Line Strokes & Proportion', weightage: 4, estimated_minutes: 60 },
          { name: 'Object Drawing, Still Life & Perspective Grids', weightage: 5, estimated_minutes: 70 }
        ]
      },
      {
        name: 'Color Theory & Visual Aesthetics',
        topics: [
          { name: 'Primary, Secondary & Complementary Color Wheels', weightage: 5, estimated_minutes: 70 },
          { name: 'Light, Shadow, Gradients & Texture Rendering', weightage: 5, estimated_minutes: 80 }
        ]
      },
      {
        name: 'Creative Thematic Composition',
        topics: [
          { name: 'Nature Landscapes, Wildlife & Environmental Themes', weightage: 4, estimated_minutes: 70 },
          { name: 'Festival, Culture & Futuristic Imagination Art', weightage: 5, estimated_minutes: 80 }
        ]
      }
    ]
  },
  olympiad_neso: {
    name: 'National Essay Olympiad (NESO)',
    min_class: 1,
    max_class: 10,
    is_olympiad: true,
    subjects: [
      {
        name: 'Essay Architecture & Planning',
        topics: [
          { name: 'Hook, Thesis Formulation & Introduction Design', weightage: 4, estimated_minutes: 70 },
          { name: 'Body Paragraph Development & Evidence Synthesis', weightage: 5, estimated_minutes: 80 },
          { name: 'Logical Transitions & Impactful Conclusion Crafting', weightage: 4, estimated_minutes: 70 }
        ]
      },
      {
        name: 'Stylistic Expression & Rhetoric',
        topics: [
          { name: 'Expressive Vocabulary, Metaphors & Sentence Variety', weightage: 5, estimated_minutes: 80 },
          { name: 'Persuasive Argumentation, Coherence & Clarity', weightage: 5, estimated_minutes: 80 }
        ]
      },
      {
        name: 'Contemporary Themes Practice',
        topics: [
          { name: 'Science, Technology & AI Impact on Society', weightage: 4, estimated_minutes: 70 },
          { name: 'Environmental Protection, Heritage & Social Values', weightage: 4, estimated_minutes: 70 }
        ]
      }
    ]
  },
  olympiad_nsso: {
    name: 'National Social Studies Olympiad (NSSO)',
    min_class: 1,
    max_class: 10,
    is_olympiad: true,
    subjects: [
      {
        name: 'History & Civilization Heritage',
        topics: [
          { name: 'Early Human Settlements, Indus Valley & Ancient Empires', weightage: 5, estimated_minutes: 80 },
          { name: 'Medieval Kingdoms, Architecture & Cultural Exchange', weightage: 4, estimated_minutes: 70 },
          { name: 'Modern World History & National Movements', weightage: 5, estimated_minutes: 80 }
        ]
      },
      {
        name: 'Geography & Environmental Systems',
        topics: [
          { name: 'Earth Motions, Landforms & Climatic Zones', weightage: 5, estimated_minutes: 80 },
          { name: 'Map Reading, Longitudes, Latitudes & Scale Skills', weightage: 4, estimated_minutes: 70 },
          { name: 'Natural Resources, Agriculture & Industries', weightage: 4, estimated_minutes: 70 }
        ]
      },
      {
        name: 'Civics & Democratic Institutions',
        topics: [
          { name: 'Constitution, Fundamental Rights & Duties', weightage: 5, estimated_minutes: 80 },
          { name: 'Parliamentary Governance, Judiciary & Local Bodies', weightage: 4, estimated_minutes: 70 }
        ]
      }
    ]
  }
};

// GET /onboarding/presets
router.get('/presets', (req, res) => {
  return res.json({ presets: SYLLABUS_PRESETS });
});

// POST /onboarding/setup
router.post('/setup', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { exam_name, exam_date, max_daily_hours, off_days, subjects } = req.body;

    if (!exam_name || !exam_date) {
      return res.status(400).json({ error: 'Exam name and exam date are required.' });
    }

    if (!Array.isArray(subjects) || subjects.length === 0) {
      return res.status(400).json({ error: 'At least one subject with topics is required.' });
    }

    const safeMaxHours = Math.max(1, Math.min(14, Number(max_daily_hours) || 6.0));
    const safeOffDays = Array.isArray(off_days) ? off_days : [0];

    // Transaction for atomic onboarding setup
    const setupTx = db.transaction(() => {
      // 1. Update user profile
      db.prepare(`
        UPDATE users 
        SET exam_name = ?, exam_date = ?, max_daily_hours = ?, off_days = ?
        WHERE id = ?
      `).run(exam_name, exam_date, safeMaxHours, JSON.stringify(safeOffDays), userId);

      // 2. Clean previous data if any
      db.prepare('DELETE FROM schedule_days WHERE user_id = ?').run(userId);
      db.prepare('DELETE FROM replan_logs WHERE user_id = ?').run(userId);
      
      const existingSubjects = db.prepare('SELECT id FROM subjects WHERE user_id = ?').all(userId);
      for (const s of existingSubjects) {
        db.prepare('DELETE FROM topics WHERE subject_id = ?').run(s.id);
      }
      db.prepare('DELETE FROM subjects WHERE user_id = ?').run(userId);

      // 3. Insert new subjects and topics
      const insertedTopics = [];
      const now = new Date().toISOString();

      for (const subj of subjects) {
        if (!subj.name || !subj.name.trim()) continue;
        const subjectId = uuidv4();
        db.prepare('INSERT INTO subjects (id, user_id, name, created_at) VALUES (?, ?, ?, ?)').run(
          subjectId,
          userId,
          subj.name.trim(),
          now
        );

        if (Array.isArray(subj.topics)) {
          for (const top of subj.topics) {
            if (!top.name || !top.name.trim()) continue;
            const topicId = uuidv4();
            const weightage = Math.min(5, Math.max(1, Number(top.weightage) || 3));
            const estMinutes = Math.max(15, Number(top.estimated_minutes) || 60);

            db.prepare(`
              INSERT INTO topics (id, subject_id, name, weightage, estimated_minutes, status, mastery_score, created_at)
              VALUES (?, ?, ?, ?, ?, 'not_started', 0, ?)
            `).run(topicId, subjectId, top.name.trim(), weightage, estMinutes, now);

            insertedTopics.push({
              id: topicId,
              subject_id: subjectId,
              name: top.name.trim(),
              weightage,
              estimated_minutes: estMinutes,
              status: 'not_started',
              mastery_score: 0
            });
          }
        }
      }

      return insertedTopics;
    });

    const allTopics = setupTx();

    if (allTopics.length === 0) {
      return res.status(400).json({ error: 'No valid topics were provided.' });
    }

    // 4. Generate initial schedule using Section 6 Scheduler
    const todayStr = formatDate(new Date());
    const user = {
      id: userId,
      max_daily_hours: safeMaxHours,
      off_days: safeOffDays,
      buffer_days_percent: 0.10
    };

    const { scheduleDays, deferred, compressed, diffSummary } = replanSchedule(
      user,
      allTopics,
      todayStr,
      exam_date
    );

    // Save schedule days to database
    const insertSchedule = db.prepare(`
      INSERT INTO schedule_days (id, user_id, date, planned_items, actual_completed, is_backlog_day)
      VALUES (?, ?, ?, ?, '[]', 0)
    `);

    const saveScheduleTx = db.transaction(() => {
      for (const day of scheduleDays) {
        insertSchedule.run(
          uuidv4(),
          userId,
          day.date,
          JSON.stringify(day.planned_items || [])
        );
      }
    });
    saveScheduleTx();

    // 5. Generate AI / fallback explanation
    const summaryText = await generateReplanExplanation({
      keptCount: diffSummary.keptCount,
      compressedCount: diffSummary.compressedCount,
      deferredCount: diffSummary.deferredCount,
      maxDailyHours: safeMaxHours,
      examName: exam_name
    });

    const microCopy = await generateMicroCopy();

    // 6. Save initial ReplanLog
    db.prepare(`
      INSERT INTO replan_logs (id, user_id, triggered_at, reason, summary_text, deferred_topics, compressed_topics, diff_summary)
      VALUES (?, ?, ?, 'Initial Schedule Creation', ?, ?, ?, ?)
    `).run(
      uuidv4(),
      userId,
      new Date().toISOString(),
      summaryText,
      JSON.stringify(deferred.map(d => d.id)),
      JSON.stringify(compressed),
      JSON.stringify(diffSummary)
    );

    return res.status(201).json({
      message: 'Onboarding completed and initial schedule generated successfully.',
      scheduleDays,
      diffSummary,
      summaryText,
      microCopy,
      totalTopics: allTopics.length
    });
  } catch (err) {
    console.error('Onboarding setup error:', err);
    return res.status(500).json({ error: 'Failed to complete onboarding setup.' });
  }
});

module.exports = router;
