/**
 * Comprehensive K-12 Curriculum Catalog (Class 1 to 12)
 * Categorized by Class Level & Subject:
 * - Biology (Comprehensive K-12 life science, cell biology, genetics, ecology, physiology)
 * - Physics
 * - Chemistry
 * - Maths
 * - Science / EVS
 * - Social Science (History, Civics, Geography)
 * - English
 * - Hindi
 * - Computer Science
 * - Sanskrit
 */

export const BASE_SUBJECTS: string[] = [
  'Biology',
  'Physics',
  'Chemistry',
  'Maths',
  'Science',
  'Social Science',
  'English',
  'Hindi',
  'Sanskrit',
  'EVS',
  'Computer Science',
  'Additional Subject'
];

export const CURRICULUM_CATALOG: Record<number, Record<string, string[]>> = {
  1: {
    'Biology': [
      'My Amazing Body & 5 Senses',
      'Living vs Non-Living Things',
      'Plants and Trees Around Us',
      'Animals and Their Homes',
      'Healthy Food and Good Habits',
      'Clean Water and Fresh Air'
    ],
    'Science': [
      'My Body and Senses',
      'Living and Non-Living Things',
      'Plants Around Us',
      'Animals in Our World',
      'Weather and Seasons',
      'Sun, Moon, and Stars'
    ],
    'EVS': [
      'About Myself and My Family',
      'My School and Neighborhood',
      'Plants and Animals Around Us',
      'Food, Clothes and Shelter',
      'Safety Rules and Good Habits',
      'Festivals and Celebrations'
    ],
    'Maths': [
      'Shapes and Space',
      'Numbers 1 to 20',
      'Addition Basics (1 to 9)',
      'Subtraction Basics (1 to 9)',
      'Numbers 21 to 50',
      'Measurement (Long & Short)',
      'Time and Daily Routine',
      'Patterns and Sequences',
      'Numbers 51 to 100',
      'Money and Coins'
    ],
    'English': [
      'Alphabet Fun & Phonics',
      'Naming Words (Nouns)',
      'Action Words (Verbs)',
      'Describing Words (Adjectives)',
      'One and Many (Singular & Plural)',
      'This, That, These, Those',
      'Rhymes and Short Stories'
    ],
    'Hindi': [
      'Hindi Alphabet Fundamentals (Vowels & Consonants)',
      'Two and Three Letter Words',
      'Foundational Vowel Signs & Sounds',
      'Family, Helpers & Everyday Words',
      'Rhymes, Stories & Simple Vocabulary'
    ],
    'Additional Subject': [
      'Creative Expression & Foundational Concepts',
      'Observation, Drawing & Environmental Exploration',
      'Practical Activities & Everyday Projects',
      'Fun Problem Solving & Activity Sheets'
    ]
  },

  2: {
    'Biology': [
      'Parts of a Plant (Root, Stem, Leaf, Flower)',
      'Types of Animals (Wild, Domestic, Pet)',
      'Animal Food Habits (Herbivores, Carnivores)',
      'Internal Organs of Human Body',
      'Life Cycles (Butterfly and Frog Basics)',
      'Germs, Cleanliness & Healthy Living'
    ],
    'Science': [
      'Parts of a Plant and Their Functions',
      'Types of Animals and Habitats',
      'Human Body Organs and Care',
      'Air, Water, and Weather',
      'Rocks, Soil, and Minerals',
      'Light and Shadows'
    ],
    'EVS': [
      'Our Body and Health',
      'My Family and Relations',
      'Food for Health & Energy',
      'Water — Source and Storage',
      'Our Animal and Plant Friends',
      'Means of Travel and Transport'
    ],
    'Maths': [
      'Counting in Groups',
      'Addition and Subtraction of 2-Digit Numbers',
      'Counting in Tens and Hundreds',
      'Patterns and Shapes',
      'Footprints and Spatial Shapes',
      'Jugs and Mugs (Capacity Basics)',
      'Tens and Ones (Place Value)',
      'My Funday (Days & Months)',
      'Give and Take (Mental Math)'
    ],
    'English': [
      'Nouns (Common and Proper)',
      'Pronouns (He, She, It, They)',
      'Action Words and Tenses (Is, Are, Am)',
      'Opposites and Synonyms',
      'Prepositions (In, On, Under)',
      'Sentences and Capital Letters',
      'Reading Comprehension Stories'
    ],
    'Hindi': [
      'Vowel Signs & Accurate Pronunciation',
      'Nouns (Naming Words)',
      'Singular & Plural Forms',
      'Antonyms and Synonyms',
      'Sentence Formation & Picture Description'
    ],
    'Additional Subject': [
      'Creative Expression & Foundational Concepts',
      'Observation, Drawing & Environmental Exploration',
      'Practical Activities & Everyday Projects',
      'Fun Problem Solving & Activity Sheets'
    ]
  },

  3: {
    'Biology': [
      'Plant Life: Leaves and Photosynthesis Introduction',
      'Animal Classification: Birds, Insects, Reptiles, Mammals',
      'Food Chains in Nature',
      'Human Digestive System & Eating Right',
      'Breathing and Respiratory Organs',
      'Living in Harmony with Nature'
    ],
    'Science': [
      'Living and Non-Living Worlds',
      'Parts of Plants and Leaves',
      'Birds: Beaks, Claws, and Feathers',
      'Insects and Creepy Crawlies',
      'Human Organ Systems',
      'States of Matter (Solid, Liquid, Gas)',
      'Weather, Seasons, and Soil'
    ],
    'EVS': [
      'Poonam\'s Day Out (Animals and Habitats)',
      'The Plant Fairy (Leaves and Stems)',
      'Water O\' Water! (Water Cycle Basics)',
      'Our First School (Family and Home)',
      'Chhotu\'s House (Shelters)',
      'Foods We Eat and Nutrition',
      'Saying Without Speaking (Communication)'
    ],
    'Maths': [
      'Where to Look From (Viewpoints & Symmetry)',
      'Fun with 3-Digit Numbers',
      'Give and Take (3-Digit Addition & Subtraction)',
      'Shapes and Designs (2D & 3D Geometry)',
      'Time Goes On (Clocks and Calendars)',
      'Who is Heavier? (Weight in Kilograms & Grams)',
      'How Many Times? (Multiplication Tables 2-10)',
      'Jugs and Mugs (Volume in Litres & Millilitres)',
      'Can We Share? (Division Basics)',
      'Smart Charts (Data and Bar Graphs)',
      'Rupees and Paise'
    ],
    'English': [
      'Types of Nouns and Collective Nouns',
      'Verbs and Subject-Verb Agreement',
      'Adjectives and Degrees of Comparison',
      'Articles (A, An, The)',
      'Conjunctions (And, But, Because)',
      'Paragraph and Letter Writing Basics',
      'Comprehension Passages'
    ],
    'Hindi': [
      'Pronouns and Adjectives',
      'Verbs and Tenses (Past, Present, Future)',
      'Idioms and Proverbs',
      'Paragraph and Letter Writing',
      'Literary Stories and Poetry'
    ],
    'Additional Subject': [
      'Creative Expression & Foundational Concepts',
      'Observation, Drawing & Environmental Exploration',
      'Practical Activities & Everyday Projects',
      'Fun Problem Solving & Activity Sheets'
    ]
  },

  4: {
    'Biology': [
      'Chapter 4: Photosynthesis — How Green Leaves Make Food',
      'Root Systems: Tap Roots & Fibrous Roots',
      'Reproduction in Animals (Eggs & Live Birth)',
      'Teeth & Digestion in Humans',
      'Habitats and Adaptations of Animals',
      'Ecosystems and Food Webs'
    ],
    'Science': [
      'Food and Digestion',
      'Teeth and Microbes',
      'Plant Adaptations (Desert, Aquatic, Mountain)',
      'Animal Adaptations for Survival',
      'Air, Water, and Weather',
      'Force, Work, and Energy',
      'Our Solar System and Planets'
    ],
    'EVS': [
      'Going to School (Bridges and Transport)',
      'Ear to Ear (Animal Ears and Skin)',
      'A Day with Nandu (Elephant Herd Behavior)',
      'The Story of Amrita (Tree Protection)',
      'Anita and the Honeybees (Bee Keeping)',
      'From the Window (Travel & Geography)',
      'Reaching Grandmother\'s House',
      'Changing Families and Society'
    ],
    'Maths': [
      'Building with Bricks (Patterns & Wall Architecture)',
      'Long and Short (Units of Length: m, cm, km)',
      'A Trip to Bhopal (Word Problems & Budgeting)',
      'Tick-Tick-Tick (12-Hour vs 24-Hour Clocks)',
      'The Way the World Looks (Top, Front, Side Views)',
      'The Junk Seller (Currency Multiplication & Profit)',
      'Carts and Wheels (Circles, Radius, Diameter)',
      'Halves and Quarters (Fractions: 1/2, 1/4, 3/4)',
      'Play with Patterns (Number & Letter Codes)',
      'Tables and Shares (Long Division & Remainder)',
      'How Heavy? How Light? (Mass Measurement)',
      'Fields and Fences (Perimeter and Area of Shapes)',
      'Smart Charts (Tally Marks & Pictographs)'
    ],
    'Social Science': [
      'The Northern Mountains (Himalayas)',
      'The Northern Plains of India',
      'The Great Indian Desert',
      'The Southern Plateau and Coastal Plains',
      'Climate and Seasons of India',
      'Our Natural Resources: Soil, Forests, Water',
      'Our Rich Heritage and National Symbols',
      'Local Self Government and Civic Duties'
    ],
    'English': [
      'Types of Sentences (Declarative, Interrogative, Imperative)',
      'Tenses: Simple Present, Past, and Future',
      'Prepositions of Place, Time, and Direction',
      'Adverbs of Manner, Time, and Place',
      'Direct and Indirect Speech Introduction',
      'Story Writing and Informal Letters',
      'Reading Comprehension'
    ],
    'Hindi': [
      'Nouns, Pronouns and Their Types',
      'Adjectives and Modifiers',
      'Verbs and Voice (Active and Passive)',
      'Punctuation Marks in Language',
      'Informal Letters and Essay Writing'
    ],
    'Additional Subject': [
      'Creative Expression & Foundational Concepts',
      'Observation, Drawing & Environmental Exploration',
      'Practical Activities & Everyday Projects',
      'Fun Problem Solving & Activity Sheets'
    ]
  },

  5: {
    'Biology': [
      'Seeds and Germination: Dispersal Mechanisms',
      'Super Senses in Animals (Sight, Smell, Hearing)',
      'Forests, Tribal Communities & Plants',
      'Mosquitoes, Malaria & Blood Disorders',
      'Aquatic Ecosystems, Rivers and Oceans',
      'Human Nervous System and Sensory Organs'
    ],
    'Science': [
      'Plant Reproduction from Seeds, Stems, and Roots',
      'Animal Senses and Migration',
      'Food, Health, and Deficiency Diseases',
      'Safety and First Aid Measures',
      'Rocks, Minerals, and Soil Formation',
      'Simple Machines (Lever, Pulley, Wheel, Inclined Plane)',
      'Moon, Eclipses, and Space Exploration'
    ],
    'EVS': [
      'Super Senses in Animals',
      'A Snake Charmer\'s Story',
      'From Tasting to Digesting',
      'Mangoes Round the Year (Food Preservation)',
      'Seeds and Seeds (Seed Germination & Dispersal)',
      'Every Drop Counts (Water Conservation & Baolis)',
      'Experiments with Water (Buoyancy & Solubility)',
      'Up You Go! (Mountaineering & Courage)',
      'Walls Tell Stories (Golconda Fort & History)',
      'Sunita in Space (Gravity & Space Travel)',
      'What if it Finishes...? (Petroleum & Fuels)',
      'A Shelter so High! (Leh, Ladakh & Changpas)'
    ],
    'Maths': [
      'The Fish Tale (Large Numbers up to Crores)',
      'Shapes and Angles (Acute, Right, Obtuse, Protractor)',
      'How Many Squares? (Area of Irregular Shapes)',
      'Parts and Wholes (Equivalent Fractions & Word Problems)',
      'Does it Look the Same? (Symmetry & Rotational Symmetry)',
      'Be My Multiple, I\'ll be Your Factor (Factors, Multiples, LCM, HCF)',
      'Can You See the Pattern? (Number Grids & Magic Squares)',
      'Mapping Your Way (Scale, Directions, Grids)',
      'Boxes and Sketches (3D Nets and Isometric Views)',
      'Tenths and Hundredths (Decimal Numbers & Conversion)',
      'Area and its Boundary (Perimeter and Area Formulas)',
      'Smart Charts (Bar Graphs and Double Bar Graphs)',
      'Ways to Multiply and Divide (Multi-Digit Multiplication)',
      'How Big? How Heavy? (Volume of Cubes & Cuboids)'
    ],
    'Social Science': [
      'Globe: A Model of the Earth (Latitudes & Longitudes)',
      'Parallels and Meridians',
      'Major Landforms of the Earth',
      'Weather, Climate and Heat Zones',
      'The Equatorial Forest Region (DR Congo)',
      'The Land of Sand (Saudi Arabia)',
      'The Grasslands (Prairies of North America)',
      'The Land of Snow (Greenland)',
      'Transport and Communication Revolution',
      'The Indian Freedom Struggle & 1857 Revolt',
      'The United Nations and World Peace'
    ],
    'English': [
      'Noun Clauses & Relative Pronouns',
      'Continuous and Perfect Tenses',
      'Active and Passive Voice Introduction',
      'Direct and Indirect Speech',
      'Formal Letter Writing and Diary Entry',
      'Essay and Story Writing',
      'Advanced Reading Comprehension'
    ],
    'Hindi': [
      'Introduction to Sandhi and Samas',
      'Case Markers and Prepositions',
      'Prefixes and Suffixes',
      'Spelling Correction and Word Accuracy',
      'Dialogue Writing and Formal Letters'
    ],
    'Additional Subject': [
      'Creative Expression & Foundational Concepts',
      'Observation, Drawing & Environmental Exploration',
      'Practical Activities & Everyday Projects',
      'Fun Problem Solving & Activity Sheets'
    ]
  },

  6: {
    'Biology': [
      'Components of Food & Balanced Diet',
      'Getting to Know Plants: Herbs, Shrubs, Trees & Leaf Venation',
      'Body Movements: Joints, Cartilage & Skeletal System',
      'The Living Organisms: Characteristics & Habitats',
      'Garbage In, Garbage Out (Waste Management & Vermicomposting)'
    ],
    'Physics': [
      'Motion and Measurement of Distances (Standard Units, Rectilinear & Circular)',
      'Light, Shadows and Reflections (Transparent, Translucent, Opaque)',
      'Electricity and Circuits (Electric Cell, Switch, Conductors & Insulators)',
      'Fun with Magnets (Poles of Magnet, Magnetic Attraction & Repulsion)'
    ],
    'Chemistry': [
      'Sorting Materials into Groups (Hardness, Solubility, Transparency)',
      'Separation of Substances (Winnowing, Sieving, Evaporation, Decantation)',
      'Changes Around Us (Reversible vs Irreversible Changes)',
      'Water and Water Cycle (Evaporation, Condensation, Rainwater Harvesting)',
      'Air Around Us (Atmosphere, Oxygen, Nitrogen, Carbon Dioxide)'
    ],
    'Science': [
      'Components of Food',
      'Sorting Materials into Groups',
      'Separation of Substances',
      'Getting to Know Plants',
      'Body Movements',
      'The Living Organisms and Surroundings',
      'Motion and Measurement of Distances',
      'Light, Shadows and Reflections',
      'Electricity and Circuits',
      'Fun with Magnets',
      'Air Around Us'
    ],
    'Maths': [
      'Knowing Our Numbers (Indian & International Place Value, Estimation)',
      'Whole Numbers (Number Line, Properties of Addition & Multiplication)',
      'Playing with Numbers (Prime & Composite, Divisibility Rules, HCF, LCM)',
      'Basic Geometrical Ideas (Points, Lines, Rays, Curves, Polygons)',
      'Understanding Elementary Shapes (Angles, Triangles, Quadrilaterals, 3D)',
      'Integers (Negative Numbers, Operations on Number Line)',
      'Fractions (Proper, Improper, Mixed, Equivalent, Simplification)',
      'Decimals (Place Value, Decimal Operations, Word Problems)',
      'Data Handling (Tally Marks, Pictographs, Bar Graphs)',
      'Mensuration (Perimeter & Area of Rectangles & Squares)',
      'Algebra (Variables, Algebraic Expressions, Equations)',
      'Ratio and Proportion (Unitary Method)',
      'Symmetry (Line of Symmetry, Reflectional Symmetry)',
      'Practical Geometry (Ruler, Compasses, Bisectors, Perpendiculars)'
    ],
    'Social Science': [
      'What, Where, How and When? (Early History)',
      'From Hunting-Gathering to Growing Food',
      'In the Earliest Cities (Harappan Civilisation)',
      'What Books and Burials Tell Us (Vedas & Megaliths)',
      'Kingdoms, Kings and an Early Republic (Mahajanapadas)',
      'New Questions and Ideas (Buddhism and Jainism)',
      'Ashoka: The Emperor Who Gave Up War',
      'The Earth in the Solar System',
      'Globe: Latitudes and Longitudes',
      'Motions of the Earth (Rotation and Revolution)',
      'Maps (Components, Physical, Political, Thematic)',
      'Major Domains of the Earth (Lithosphere, Hydrosphere, Atmosphere)',
      'Understanding Diversity and Discrimination',
      'What is Government? Functions and Organs',
      'Panchayati Raj (Gram Panchayat & Gram Sabha)',
      'Rural Administration and Urban Administration'
    ],
    'English': [
      'Determiners and Articles',
      'Modal Auxiliaries (Can, Could, May, Might, Must)',
      'Subject-Verb Agreement and Tenses',
      'Prepositional Phrases and Connectors',
      'Notice Writing and Message Writing',
      'Informal and Formal Letters',
      'Prose and Poetry Comprehension'
    ],
    'Hindi': [
      'Classification of Nouns, Pronouns, Adjectives and Verbs',
      'Case Endings and Postpositions',
      'Vowel Sandhi Fundamentals',
      'Synonyms, Antonyms and Homonyms',
      'Unseen Passages and Essay Writing'
    ],
    'Additional Subject': [
      'Unit 1: Fundamentals & Essential Concepts',
      'Unit 2: Applied Theory & Conceptual Understanding',
      'Unit 3: Practical Projects, Activities & Research',
      'Unit 4: Advanced Problem Solving & Analysis',
      'Unit 5: Syllabus Revision & Sample Question Practice'
    ]
  },

  7: {
    'Biology': [
      'Nutrition in Plants (Autotrophic, Photosynthesis, Stomata, Parasites)',
      'Nutrition in Animals (Human Alimentary Canal, Digestion, Ruminants)',
      'Respiration in Organisms (Cellular Respiration, Aerobic vs Anaerobic)',
      'Transportation in Animals and Plants (Heart, Blood Vessels, Xylem, Phloem)',
      'Reproduction in Plants (Vegetative Propagation, Flowers, Pollination)',
      'Forests: Our Lifeline (Canopy, Understorey, Food Webs)'
    ],
    'Physics': [
      'Heat and Temperature (Laboratory & Clinical Thermometers, Modes of Transfer)',
      'Motion and Time (Measurement of Time, Speed Formula, Distance-Time Graphs)',
      'Electric Current and its Effects (Heating Effect, Magnetic Effect, Electromagnet)',
      'Light (Reflection by Plane and Spherical Mirrors, Lenses, Newton\'s Disc)',
      'Winds, Storms and Cyclones (Air Pressure, Uneven Heating, Thunderstorms)'
    ],
    'Chemistry': [
      'Acids, Bases and Salts (Natural Indicators, Litmus, Phenolphthalein, Neutralisation)',
      'Physical and Chemical Changes (Rusting, Crystallisation, Chemical Reactions)',
      'Water: A Precious Resource (Groundwater, Water Scarcity & Conservation)',
      'Wastewater Story (Sewage Treatment, WWTP, Sanitation & Disease Prevention)'
    ],
    'Science': [
      'Nutrition in Plants',
      'Nutrition in Animals',
      'Heat and Thermodynamics Basics',
      'Acids, Bases and Salts',
      'Physical and Chemical Changes',
      'Respiration in Organisms',
      'Transportation in Animals and Plants',
      'Reproduction in Plants',
      'Motion and Time',
      'Electric Current and Its Effects',
      'Light and Optics',
      'Forests and Wastewater Management'
    ],
    'Maths': [
      'Integers (Properties of Addition, Subtraction, Multiplication, Division)',
      'Fractions and Decimals (Multiplication & Division of Fractions & Decimals)',
      'Data Handling (Arithmetic Mean, Median, Mode, Double Bar Graphs)',
      'Simple Equations (Formulating & Solving Linear Equations)',
      'Lines and Angles (Complementary, Supplementary, Transversal, Parallel)',
      'The Triangle and its Properties (Angle Sum Property, Exterior Angle, Pythagoras)',
      'Congruence of Triangles (SSS, SAS, ASA, RHS Criteria)',
      'Comparing Quantities (Ratios, Percentage, Profit & Loss, Simple Interest)',
      'Rational Numbers (Standard Form, Comparison, Rational Operations)',
      'Perimeter and Area (Squares, Rectangles, Parallelograms, Triangles, Circles)',
      'Algebraic Expressions (Terms, Factors, Coefficients, Addition, Subtraction)',
      'Exponents and Powers (Laws of Exponents, Scientific Notation)',
      'Visualising Solid Shapes (Faces, Edges, Vertices, Nets, Isometric Sketches)'
    ],
    'Social Science': [
      'Tracing Changes Through a Thousand Years',
      'New Kings and Kingdoms (Cholas, Palas, Rashtrakutas)',
      'The Delhi Sultans (Slave Dynasty, Khaljis, Tughlaqs)',
      'The Mughal Empire (Babur to Aurangzeb, Mansabdari)',
      'Tribes, Nomads and Settled Communities',
      'Environment (Natural & Human Environment)',
      'Inside Our Earth (Crust, Mantle, Core, Rocks & Minerals)',
      'Our Changing Earth (Endogenic & Exogenic Forces, Volcanoes, Earthquakes)',
      'Air (Atmospheric Layers, Temperature, Air Pressure, Wind)',
      'Water (Ocean Circulation, Tides, Currents)',
      'On Equality (Universal Adult Suffrage, Article 15)',
      'Role of the Government in Health (Public vs Private)',
      'How the State Government Works (MLA, Legislative Assembly)',
      'Gender Equality and Social Perspectives'
    ],
    'English': [
      'Active and Passive Voice',
      'Direct and Indirect Speech',
      'Subject-Verb Concord',
      'Modals and Conditionals',
      'Formal Letters (To Editor, Principal)',
      'Story Writing with Prompts',
      'Reading Comprehension Passages'
    ],
    'Hindi': [
      'Phonetics, Orthography and Spelling Rules',
      'Word Formation: Sandhi, Prefixes, Suffixes & Compounds',
      'Grammatical Inflexion of Major Word Classes',
      'Indeclinables (Avyay) & Invariable Words',
      'Letter Writing, Essays and Dialogue Writing'
    ],
    'Additional Subject': [
      'Unit 1: Fundamentals & Essential Concepts',
      'Unit 2: Applied Theory & Conceptual Understanding',
      'Unit 3: Practical Projects, Activities & Research',
      'Unit 4: Advanced Problem Solving & Analysis',
      'Unit 5: Syllabus Revision & Sample Question Practice'
    ]
  },

  8: {
    'Biology': [
      'Crop Production and Management (Soil Prep, Sowing, Manures, Irrigation, Harvesting)',
      'Microorganisms: Friend and Foe (Bacteria, Fungi, Protozoa, Algae, Antibiotics, Preservation)',
      'Conservation of Plants and Animals (Deforestation, Biosphere Reserves, Red Data Book)',
      'Cell — Structure and Functions (Cell Wall, Membrane, Nucleus, Organelles, Plant vs Animal)',
      'Reproduction in Animals (Sexual & Asexual, Fertilisation, In Vitro, Metamorphosis)',
      'Reaching the Age of Adolescence (Puberty, Hormones, Secondary Sexual Characteristics)'
    ],
    'Physics': [
      'Force and Pressure (Contact & Non-Contact Forces, Atmospheric Pressure, Pressure Formula)',
      'Friction (Factors Affecting Friction, Static vs Sliding vs Rolling, Lubrication)',
      'Sound (Vibration, Amplitude, Frequency, Pitch, Loudness, Human Auditory Range)',
      'Chemical Effects of Electric Current (Electrolytes, Electroplating, Anode, Cathode)',
      'Some Natural Phenomena (Static Electricity, Lightning, Richter Scale, Earthquakes)',
      'Stars and the Solar System (Celestial Objects, Constellations, Planets, Moon Phases)'
    ],
    'Chemistry': [
      'Synthetic Fibres and Plastics (Rayon, Nylon, Polyester, Thermoplastics & Thermosetting)',
      'Materials: Metals and Non-Metals (Physical & Chemical Properties, Displacement Reactions)',
      'Coal and Petroleum (Fossil Fuels, Carbonisation, Petroleum Refining, Petrochemicals)',
      'Combustion and Flame (Conditions for Combustion, Flame Structure, Calorific Value)',
      'Pollution of Air and Water (Greenhouse Effect, Acid Rain, Water Treatment)'
    ],
    'Science': [
      'Crop Production and Management',
      'Microorganisms: Friend and Foe',
      'Synthetic Fibres and Plastics',
      'Materials: Metals and Non-Metals',
      'Coal and Petroleum',
      'Combustion and Flame',
      'Conservation of Plants and Animals',
      'Cell — Structure and Functions',
      'Reproduction in Animals',
      'Reaching the Age of Adolescence',
      'Force and Pressure',
      'Friction and Dynamics',
      'Sound and Acoustics',
      'Chemical Effects of Electric Current',
      'Stars and Solar System'
    ],
    'Maths': [
      'Rational Numbers (Closure, Commutativity, Associativity, Distributivity, Reciprocal)',
      'Linear Equations in One Variable (Algebraic Solutions & Practical Word Problems)',
      'Understanding Quadrilaterals (Parallelogram, Rhombus, Rectangle, Square, Trapezium)',
      'Practical Geometry (Construction of Quadrilaterals)',
      'Data Handling (Frequency Tables, Histograms, Pie Charts, Probability of Events)',
      'Squares and Square Roots (Prime Factorisation, Long Division Method)',
      'Cubes and Cube Roots (Properties of Cube Numbers & Estimation)',
      'Comparing Quantities (Ratios, Discounts, VAT/GST, Compound Interest Formula)',
      'Algebraic Expressions and Identities (Multiplication of Polynomials, Standard Identities)',
      'Visualising Solid Shapes (Euler\'s Formula: F + V - E = 2)',
      'Mensuration (Area of Trapezium, General Quadrilaterals, Surface Area & Volume)',
      'Exponents and Powers (Negative Exponents, Standard Form of Small & Large Numbers)',
      'Direct and Inverse Proportions (Formulas, Tabular Word Problems)',
      'Factorisation (Common Factors, Regrouping, Using Identities, Division of Polynomials)',
      'Introduction to Graphs (Cartesian Coordinate System, Linear Graphs)'
    ],
    'Social Science': [
      'From Trade to Territory (The Company Establishes Power)',
      'Ruling the Countryside (Permanent Settlement, Mahalwari, Ryotwari)',
      'Tribals, Dikus and the Vision of a Golden Age (Birsa Munda)',
      'When People Rebel: 1857 and After (Causes, Leaders, Consequences)',
      'Civilising the "Native", Educating the Nation (Macauley, Wood\'s Despatch)',
      'Women, Caste and Reform (Raja Ram Mohan Roy, Jyotirao Phule)',
      'The Making of the National Movement: 1870s-1947 (Gandhiji, Non-Cooperation, Quit India)',
      'Resources (Types of Resources, Sustainable Development)',
      'Land, Soil, Water, Natural Vegetation and Wildlife Resources',
      'Mineral and Power Resources (Conventional & Non-Conventional)',
      'Agriculture (Farming Types, Major Crops, Agricultural Development)',
      'Industries (Classification, Iron and Steel, Cotton Textile, IT)',
      'Human Resources (Population Distribution, Density, Composition)',
      'The Indian Constitution (Preamble, Fundamental Rights, Secularism)',
      'Why Do We Need a Parliament? (Lok Sabha, Rajya Sabha, Law Making)',
      'Judiciary (Structure of Courts, Independent Judiciary, PIL)',
      'Confronting Marginalisation and Social Justice'
    ],
    'English': [
      'Non-Finite Verbs (Infinitive, Gerund, Participle)',
      'Sentence Transformation (Simple, Compound, Complex)',
      'Conditionals and Relative Clauses',
      'Reported Speech with Questions & Commands',
      'Formal Letters (Enquiry, Complaint, Placement of Order)',
      'Article Writing, Speech Writing & Debate Writing',
      'Analytical Reading Comprehension'
    ],
    'Hindi': [
      'Advanced Study of Sandhi, Samas, Prefixes and Suffixes',
      'Etymology: Native, Borrowed and Foreign Words',
      'Sentence Analysis: Simple, Compound and Complex Sentences',
      'Figures of Speech: Alliteration, Metaphor, Simile & Hyperbole',
      'Essays, Formal/Informal Letters and Advertisements'
    ],
    'Additional Subject': [
      'Unit 1: Fundamentals & Essential Concepts',
      'Unit 2: Applied Theory & Conceptual Understanding',
      'Unit 3: Practical Projects, Activities & Research',
      'Unit 4: Advanced Problem Solving & Analysis',
      'Unit 5: Syllabus Revision & Sample Question Practice'
    ]
  },

  9: {
    'Biology': [
      'The Fundamental Unit of Life (Cell Membrane, Nucleus, Cytoplasm, Endoplasmic Reticulum, Golgi, Mitochondria, Plastids)',
      'Tissues: Plant Tissues (Meristematic, Parenchyma, Collenchyma, Sclerenchyma, Xylem, Phloem)',
      'Tissues: Animal Tissues (Epithelial, Connective, Muscular, Nervous)',
      'Diversity in Living Organisms (Five Kingdom Classification, Monera, Protista, Fungi, Plantae, Animalia)',
      'Why Do We Fall Ill? (Infectious vs Non-infectious, Pathogens, Immune System, Vaccines)',
      'Natural Resources (Biogeochemical Cycles: Water, Nitrogen, Carbon, Oxygen, Ozone Layer)',
      'Improvement in Food Resources (Crop Variety, Crop Protection, Animal Husbandry, Fisheries)'
    ],
    'Physics': [
      'Motion (Distance, Displacement, Speed, Velocity, Acceleration, Kinematic Equations)',
      'Force and Laws of Motion (Inertia, Momentum, Newton\'s Three Laws, Conservation of Momentum)',
      'Gravitation (Universal Law, Free Fall, Acceleration due to Gravity \'g\', Mass vs Weight)',
      'Floatation (Thrust, Pressure, Buoyancy, Archimedes\' Principle, Relative Density)',
      'Work and Energy (Work Done, Kinetic & Potential Energy, Law of Conservation of Energy, Power)',
      'Sound (Wave Nature, Longitudinal Waves, Speed of Sound, Echo, SONAR, Human Ear Anatomy)'
    ],
    'Chemistry': [
      'Matter in Our Surroundings (States of Matter, Interconversion, Latent Heat, Evaporation)',
      'Is Matter Around Us Pure? (Solutions, Suspensions, Colloids, Separation Techniques)',
      'Atoms and Molecules (Laws of Chemical Combination, Dalton\'s Theory, Atomic Mass, Mole Concept)',
      'Structure of the Atom (Thomson, Rutherford, Bohr Models, Electron Configuration, Valency, Isotopes)'
    ],
    'Science': [
      'Matter in Our Surroundings',
      'Is Matter Around Us Pure?',
      'Atoms and Molecules (Mole Concept)',
      'Structure of the Atom',
      'The Fundamental Unit of Life (Cell)',
      'Tissues (Plant and Animal)',
      'Diversity in Living Organisms',
      'Motion and Kinematics',
      'Force and Laws of Motion',
      'Gravitation and Floatation',
      'Work and Energy',
      'Sound and Acoustics',
      'Why Do We Fall Ill?',
      'Natural Resources and Cycles',
      'Improvement in Food Resources'
    ],
    'Maths': [
      'Number Systems (Real Numbers, Irrational Numbers, Real Number Line, Laws of Exponents)',
      'Polynomials (Zeroes of Polynomial, Remainder Theorem, Factor Theorem, Algebraic Identities)',
      'Coordinate Geometry (Cartesian Plane, Coordinates of a Point, Plotting Points)',
      'Linear Equations in Two Variables (Standard Form, Solutions, Graphical Representation)',
      'Introduction to Euclid\'s Geometry (Axioms and Postulates)',
      'Lines and Angles (Intersecting Lines, Parallel Lines, Transversals, Angle Sum Theorem)',
      'Triangles (Congruence Criteria: SAS, ASA, AAS, SSS, RHS, Inequalities in a Triangle)',
      'Quadrilaterals (Properties of Parallelograms, Mid-Point Theorem)',
      'Areas of Parallelograms and Triangles',
      'Circles (Chords, Arcs, Subtended Angles, Cyclic Quadrilaterals)',
      'Constructions (Bisectors, Angles, Triangles with Given Base & Angles)',
      'Heron\'s Formula (Area of Triangles and Quadrilaterals)',
      'Surface Areas and Volumes (Cube, Cuboid, Right Circular Cylinder, Cone, Sphere, Hemisphere)',
      'Statistics (Collection, Presentation, Frequency Distributions, Histograms, Frequency Polygons)',
      'Probability (Empirical Probability, Events, Outcomes)'
    ],
    'Social Science': [
      'The French Revolution (Causes, Outbreak, Reign of Terror, Legacy)',
      'Socialism in Europe and the Russian Revolution (Tsarist Russia, Bolsheviks, October Revolution)',
      'Nazism and the Rise of Hitler (Weimar Republic, Racial State, Holocaust)',
      'Forest Society and Colonialism',
      'Pastoralists in the Modern World',
      'India: Size and Location (Standard Meridian, Neighbors)',
      'Physical Features of India (Himalayas, Northern Plains, Peninsular Plateau, Coastal Plains)',
      'Drainage (Himalayan and Peninsular Rivers, Lakes, River Pollution)',
      'Climate (Monsoon Mechanism, Factors, Distribution of Rainfall)',
      'Natural Vegetation and Wildlife',
      'Population (Size, Distribution, Growth, Age-Sex Pyramid)',
      'What is Democracy? Why Democracy? (Key Features, Merits & Demerits)',
      'Constitutional Design (South African Experience, Indian Constitution Formulation)',
      'Electoral Politics (Elections in India, Election Commission, Voter Participation)',
      'Working of Institutions (Parliament, Prime Minister, President, Judiciary)',
      'Democratic Rights (Fundamental Rights, Expanding Scope)',
      'The Story of Village Palampur (Factors of Production, Farming & Non-Farming)',
      'People as Resource (Economic Activities, Education, Health, Unemployment)',
      'Poverty as a Challenge (Poverty Line, Causes, Anti-Poverty Measures)',
      'Food Security in India (Buffer Stock, PDS, Role of Cooperatives)'
    ],
    'English': [
      'Tenses and Modals Review',
      'Subject-Verb Concord and Clauses',
      'Determiners and Prepositions',
      'Descriptive Paragraph Writing',
      'Diary Entry and Story Writing',
      'Informal and Formal Letters',
      'Analytical Prose and Poetry'
    ],
    'Hindi': [
      'Prefixes, Suffixes and Compound Words',
      'Sentence Classification by Meaning (Declarative, Negative, Interrogative)',
      'Literary Figures of Speech: Metaphor, Simile, Personification',
      'Short Story Writing, Message and Email Writing',
      'Comprehensive Literature Study: Prose and Poetry'
    ],
    'Additional Subject': [
      'Unit 1: Fundamentals & Essential Concepts',
      'Unit 2: Applied Theory & Conceptual Understanding',
      'Unit 3: Practical Projects, Activities & Research',
      'Unit 4: Advanced Problem Solving & Analysis',
      'Unit 5: Syllabus Revision & Sample Question Practice'
    ]
  },

  10: {
    'Biology': [
      'Life Processes: Nutrition (Autotrophic, Heterotrophic, Human Digestion)',
      'Life Processes: Respiration (Aerobic, Anaerobic, Human Respiratory System)',
      'Life Processes: Transportation (Heart, Blood Vessels, Blood, Lymph, Xylem, Phloem)',
      'Life Processes: Excretion (Nephron, Human Excretory System, Plant Excretion)',
      'Control and Coordination (Neuron, Central & Peripheral Nervous System, Reflex Arc, Plant Tropisms, Phytohormones, Endocrine System)',
      'How Do Organisms Reproduce? (Asexual Modes, Sexual Reproduction in Flowering Plants, Human Reproductive Systems, Contraceptive Methods)',
      'Heredity and Evolution (Mendel\'s Monohybrid & Dihybrid Crosses, Sex Determination, Speciation, Evolution & Homology)',
      'Our Environment (Trophic Levels, 10% Energy Law, Biomagnification, Ozone Depletion, Biodegradable Waste)',
      'Management of Natural Resources (Conservation, Forest & Wildlife, Dams, Water Harvesting, 5 R\'s Approach)'
    ],
    'Physics': [
      'Light — Reflection (Spherical Mirrors, Mirror Formula, Magnification, Ray Diagrams)',
      'Light — Refraction (Refraction Through Glass Slab, Refractive Index, Lenses, Lens Formula, Power of a Lens)',
      'Human Eye and Colourful World (Eye Anatomy, Accommodation, Myopia, Hypermetropia, Presbyopia, Prism Dispersion, Atmospheric Refraction, Tyndall Effect)',
      'Electricity (Electric Current, Potential Difference, Ohm\'s Law, Resistance & Resistivity, Series & Parallel Circuits, Joule\'s Heating Law, Electric Power)',
      'Magnetic Effects of Electric Current (Magnetic Field Lines, Right-Hand Thumb Rule, Solenoid, Fleming\'s Left-Hand Rule, Electric Motor, Electromagnetic Induction, Fleming\'s Right-Hand Rule, Domestic Circuits)',
      'Sources of Energy (Conventional: Fossil, Thermal, Hydro; Non-Conventional: Solar, Wind, Biomass, Nuclear)'
    ],
    'Chemistry': [
      'Chemical Reactions and Equations (Balancing Equations, Combination, Decomposition, Displacement, Double Displacement, Oxidation & Reduction, Rancidity, Corrosion)',
      'Acids, Bases and Salts (Chemical Properties, pH Scale, Universal Indicator, Production & Uses of Bleaching Powder, Baking Soda, Washing Soda, Plaster of Paris)',
      'Metals and Non-Metals (Physical & Chemical Properties, Reactivity Series, Ionic Bond Formation, Metallurgy, Corrosion & Prevention)',
      'Carbon and Its Compounds (Covalent Bonding, Versatile Nature of Carbon, Homologous Series, IUPAC Nomenclature, Combustion, Oxidation, Addition, Substitution, Ethanol & Ethanoic Acid, Soaps & Detergents)',
      'Periodic Classification of Elements (Dobereiner\'s Triads, Newlands\' Octaves, Mendeleev\'s Periodic Table, Modern Periodic Table, Trends in Periodicity)'
    ],
    'Science': [
      'Chemical Reactions and Equations',
      'Acids, Bases and Salts',
      'Metals and Non-Metals',
      'Carbon and Its Compounds',
      'Periodic Classification of Elements',
      'Life Processes (Nutrition, Respiration, Transport, Excretion)',
      'Control and Coordination',
      'How Do Organisms Reproduce?',
      'Heredity and Evolution',
      'Light — Reflection and Refraction',
      'Human Eye and Colourful World',
      'Electricity and Circuits',
      'Magnetic Effects of Electric Current',
      'Sources of Energy',
      'Our Environment & Natural Resources'
    ],
    'Maths': [
      'Real Numbers (Fundamental Theorem of Arithmetic, Proof of Irrationality, Decimal Expansions)',
      'Polynomials (Geometrical Meaning of Zeroes, Relationship Between Zeroes and Coefficients, Division Algorithm)',
      'Pair of Linear Equations in Two Variables (Graphical Method, Substitution, Elimination, Cross-Multiplication, Word Problems)',
      'Quadratic Equations (Standard Form, Factorisation, Quadratic Formula, Nature of Roots)',
      'Arithmetic Progressions (nth Term of an AP, Sum of First n Terms, Real-Life Applications)',
      'Triangles (Basic Proportionality Theorem, Criteria for Similarity: AAA, SSS, SAS, Areas of Similar Triangles, Pythagoras Theorem)',
      'Coordinate Geometry (Distance Formula, Section Formula, Midpoint Formula, Area of a Triangle)',
      'Introduction to Trigonometry (Trigonometric Ratios, Values of Specific Angles 0-90°, Trigonometric Identities: sin²θ + cos²θ = 1)',
      'Some Applications of Trigonometry (Heights and Distances, Angle of Elevation, Angle of Depression)',
      'Circles (Tangent to a Circle, Number of Tangents from a Point, Tangent Properties)',
      'Constructions (Dividing Line Segment in Given Ratio, Constructing Tangents to a Circle)',
      'Areas Related to Circles (Sector, Segment, Combinations of Plane Figures)',
      'Surface Areas and Volumes (Combinations of Solids, Conversion of Solids, Frustum of a Cone)',
      'Statistics (Mean of Grouped Data by Direct, Assumed Mean & Step-Deviation, Mode, Median, Ogives)',
      'Probability (Classical Approach, Elementary Events, Sum of Probabilities)'
    ],
    'Social Science': [
      'The Rise of Nationalism in Europe (French Revolution, Making of Nationalism, Italian & German Unification)',
      'Nationalism in India (First World War, Non-Cooperation, Civil Disobedience, Sense of Collective Belonging)',
      'The Making of a Global World (Silk Routes, Colonialism, Great Depression, Post-War Settlement)',
      'The Age of Industrialisation (Hand Labour & Steam Power, Industrialisation in the Colonies)',
      'Print Culture and the Modern World (Print Revolution, Nationalism and Print)',
      'Resources and Development (Classification, Resource Planning in India, Land Degradation)',
      'Forest and Wildlife Resources (Conservation, Sacred Groves, Project Tiger)',
      'Water Resources (Multi-Purpose Projects, Rainwater Harvesting)',
      'Agriculture (Types of Farming, Cropping Pattern, Major Food & Cash Crops, Technological Reforms)',
      'Minerals and Energy Resources (Ferrous, Non-Ferrous, Energy Resources, Conservation)',
      'Manufacturing Industries (Importance, Agro-Based, Mineral-Based, Industrial Pollution)',
      'Lifelines of National Economy (Roadways, Railways, Pipelines, Waterways, Ports, Air Transport, Telecom)',
      'Power Sharing (Belgium and Sri Lanka Models, Why Power Sharing is Desirable, Forms of Power Sharing)',
      'Federalism (What is Federalism, What Makes India a Federal Country, Decentralisation in India)',
      'Gender, Religion and Caste (Women Empowerment, Communalism, Caste Politics)',
      'Political Parties (Why Do We Need Parties, Functions, National and Regional Parties, Party Reforms)',
      'Outcomes of Democracy (Accountability, Economic Growth, Reduction of Inequality, Dignity of Citizens)',
      'Development (What Development Promises, National Income, Per Capita Income, HDI)',
      'Sectors of the Indian Economy (Primary, Secondary, Tertiary, Employment Generation, Organised vs Unorganised)',
      'Money and Credit (Barter System, Modern Currency, Formal & Informal Credit, Self Help Groups)',
      'Globalisation and the Indian Economy (MNCs, Foreign Trade, WTO, Impact of Globalisation)',
      'Consumer Rights (Consumer Movement, Consumer Protection Act, Rights & Duties)'
    ],
    'English': [
      'Formal Letter Writing (Editor, Business, Inquiry, Complaint)',
      'Analytical Paragraph Writing Based on Charts/Data',
      'Tenses, Modals, Subject-Verb Concord, Reported Speech',
      'Clauses and Determiners',
      'Prose and Poetry Critical Analysis (First Flight & Footprints without Feet)'
    ],
    'Hindi': [
      'Phrase Clauses (Noun, Pronoun, Adjective, Verb, Adverb)',
      'Sentence Transformation Based on Structure',
      'Samas (Compound Formations) in Detail',
      'Idiomatic Expressions & Common Phrases',
      'Paragraphs, Formal Letters, Notices, Ads & Emails'
    ],
    'Additional Subject': [
      'Unit 1: Fundamentals & Essential Concepts',
      'Unit 2: Applied Theory & Conceptual Understanding',
      'Unit 3: Practical Projects, Activities & Research',
      'Unit 4: Advanced Problem Solving & Analysis',
      'Unit 5: Syllabus Revision & Sample Question Practice'
    ]
  },

  11: {
    'Biology': [
      'Chapter 1: The Living World (Taxonomic Hierarchy, Species Concept, Botanical Gardens, Herbaria)',
      'Chapter 2: Biological Classification (Five Kingdoms, Monera, Archaebacteria, Eubacteria, Protista, Fungi, Viruses, Viroids, Lichens)',
      'Chapter 3: Plant Kingdom (Algae, Bryophytes, Pteridophytes, Gymnosperms, Angiosperms, Alternation of Generations)',
      'Chapter 4: Animal Kingdom (Basis of Classification, Non-Chordates: Porifera to Echinodermata, Chordates: Pisces to Mammalia)',
      'Chapter 5: Morphology of Flowering Plants (Root, Stem, Leaf, Inflorescence, Flower Parts, Fruit, Seed, Floral Formulas: Solanaceae, Fabaceae, Liliaceae)',
      'Chapter 6: Anatomy of Flowering Plants (Meristematic & Permanent Tissues, Vascular Bundles, Anatomy of Dicot & Monocot Root, Stem & Leaf, Secondary Growth)',
      'Chapter 7: Structural Organisation in Animals (Animal Tissues, Epithelial, Connective, Muscular, Neural, Morphology & Anatomy of Cockroach & Frog)',
      'Chapter 8: Cell: The Unit of Life (Prokaryotic vs Eukaryotic Cells, Cell Envelope, Organelles: ER, Golgi, Lysosomes, Vacuoles, Mitochondria, Plastids, Ribosomes, Cytoskeleton, Cilia, Flagella, Nucleus)',
      'Chapter 9: Biomolecules (Primary & Secondary Metabolites, Carbohydrates, Proteins: Amino Acids & Peptide Bond, Lipids, Nucleic Acids: DNA & RNA Structure, Enzymes: Mechanism, Factors & Classification)',
      'Chapter 10: Cell Cycle and Cell Division (Phases of Cell Cycle: G1, S, G2, Mitosis: Prophase, Metaphase, Anaphase, Telophase, Cytokinesis, Meiosis: Meiosis I & II, Significance)',
      'Chapter 11: Transport in Plants (Water Potential, Osmosis, Plasmolysis, Imbibition, Transpiration Pull, Mass Flow Hypothesis)',
      'Chapter 12: Mineral Nutrition (Essential Minerals, Deficiency Symptoms, Nitrogen Cycle, Biological Nitrogen Fixation, Nitrogenase)',
      'Chapter 13: Photosynthesis in Higher Plants (Chloroplast Pigments, Light Reaction, Photophosphorylation: Cyclic & Non-Cyclic, Calvin Cycle (C3), Hatch-Slack Pathway (C4), Photorespiration, Factors Affecting Photosynthesis)',
      'Chapter 14: Respiration in Plants (Glycolysis: EMP Pathway, Fermentation, Aerobic Respiration: TCA Cycle, ETS & Oxidative Phosphorylation, Respiratory Quotient)',
      'Chapter 15: Plant Growth and Development (Differentiation, Dedifferentiation, Plant Hormones: Auxin, Gibberellin, Cytokinin, Ethylene, ABA, Photoperiodism, Vernalization)',
      'Chapter 16: Digestion and Absorption (Human Alimentary Canal, Digestive Glands, Digestion & Absorption of Food, Nutritional Disorders)',
      'Chapter 17: Breathing and Exchange of Gases (Respiratory Organs, Mechanism of Breathing, Respiratory Volumes & Capacities, Exchange & Transport of O2 & CO2, Regulation of Respiration)',
      'Chapter 18: Body Fluids and Circulation (Blood Components, Blood Groups: ABO & Rh, Coagulation, Lymph, Human Circulatory System, Cardiac Cycle, ECG, Double Circulation, Disorders)',
      'Chapter 19: Excretory Products and Their Elimination (Human Excretory System, Nephron Structure, Urine Formation: Filtration, Reabsorption, Secretion, Counter-Current Mechanism, Regulation by Juxtaglomerular Apparatus & ADH)',
      'Chapter 20: Locomotion and Movement (Types of Movement, Skeletal Muscle Ultrastructure, Sliding Filament Theory of Contraction, Human Skeleton: Axial & Appendicular, Joints, Disorders)',
      'Chapter 21: Neural Control and Coordination (Human Nervous System, Neuron Structure, Generation & Conduction of Nerve Impulse, Synapse, Reflex Action, Human Brain: Forebrain, Midbrain, Hindbrain)',
      'Chapter 22: Chemical Coordination and Integration (Endocrine Glands & Hormones: Hypothalamus, Pituitary, Thyroid, Parathyroid, Adrenal, Pancreas, Gonads, Mechanism of Hormone Action)'
    ],
    'Physics': [
      'Units and Measurements (SI Units, Dimensions of Physical Quantities, Dimensional Analysis & Applications, Errors in Measurement)',
      'Motion in a Straight Line (Frame of Reference, Position-Time & Velocity-Time Graphs, Kinematic Equations by Calculus, Relative Velocity)',
      'Motion in a Plane (Scalars and Vectors, Vector Addition & Resolution, Unit Vectors, Projectile Motion, Uniform Circular Motion)',
      'Laws of Motion (Newton\'s Three Laws, Impulse, Conservation of Linear Momentum, Equilibrium of Concurrent Forces, Friction, Circular Dynamics & Banking of Roads)',
      'Work, Energy and Power (Scalar Product, Work Done by Constant & Variable Forces, Work-Energy Theorem, Conservative Forces, Potential Energy of a Spring, Power, Elastic & Inelastic Collisions)',
      'System of Particles and Rotational Motion (Centre of Mass, Linear Momentum of System, Torque, Angular Momentum & Conservation, Moment of Inertia, Parallel & Perpendicular Axes Theorems, Rolling Motion)',
      'Gravitation (Kepler\'s Laws, Universal Law of Gravitation, Acceleration Due to Gravity & Variation with Altitude & Depth, Gravitational Potential Energy, Escape Speed, Orbital Speed of Satellites)',
      'Mechanical Properties of Solids (Stress-Strain Curve, Hooke\'s Law, Young\'s, Bulk & Shear Modulus, Poisson\'s Ratio, Elastic Energy)',
      'Mechanical Properties of Fluids (Pressure, Pascal\'s Law, Viscosity, Stokes\' Law, Terminal Velocity, Streamline & Turbulent Flow, Bernoulli\'s Theorem, Surface Tension & Capillarity)',
      'Thermal Properties of Matter (Heat & Temperature, Thermal Expansion, Specific Heat Capacity, Calorimetry, Change of State, Latent Heat, Thermal Conductivity, Newton\'s Law of Cooling)',
      'Thermodynamics (Thermal Equilibrium & Zeroth Law, First Law of Thermodynamics, Isothermal & Adiabatic Processes, Second Law, Heat Engines, Refrigerators)',
      'Kinetic Theory of Gases (Equation of State, Kinetic Theory Postulates, Pressure of Ideal Gas, Kinetic Energy & Temperature, Degrees of Freedom, Law of Equipartition of Energy, Mean Free Path)',
      'Oscillations (Simple Harmonic Motion, Velocity, Acceleration, Kinetic & Potential Energy in SHM, Simple Pendulum, Free, Damped and Forced Oscillations, Resonance)',
      'Waves (Transverse and Longitudinal Waves, Displacement Relation, Speed of Travelling Wave, Principle of Superposition, Reflection of Waves, Standing Waves in Strings & Pipes, Beats, Doppler Effect)'
    ],
    'Chemistry': [
      'Some Basic Concepts of Chemistry (Matter, Atomic and Molecular Masses, Mole Concept, Percentage Composition, Empirical & Molecular Formula, Stoichiometry & Stoichiometric Calculations)',
      'Structure of Atom (Discovery of Subatomic Particles, Rutherford\'s & Bohr\'s Models, Dual Nature of Light & Matter, de Broglie Relation, Heisenberg Uncertainty Principle, Quantum Numbers, Orbitals, Aufbau, Pauli & Hund\'s Rules)',
      'Classification of Elements and Periodicity (Modern Periodic Table, Periodic Trends in Atomic & Ionic Radii, Ionisation Enthalpy, Electron Gain Enthalpy, Electronegativity, Valency)',
      'Chemical Bonding and Molecular Structure (Ionic Bond, Covalent Bond, Lewis Structures, VSEPR Theory, Valence Bond Theory, Hybridisation: sp, sp², sp³, sp³d, Molecular Orbital Theory: Homo-nuclear Diatomics, Hydrogen Bonding)',
      'States of Matter (Intermolecular Forces, Gas Laws: Boyle, Charles, Gay-Lussac, Avogadro, Ideal Gas Equation, Dalton\'s Law, Kinetic Molecular Theory, Deviation from Ideal Behavior, Van der Waals Equation)',
      'Chemical Thermodynamics (System & Surroundings, First Law, Internal Energy & Enthalpy, Heat Capacity, Hess\'s Law, Enthalpies of Reactions, Spontaneity, Entropy, Gibbs Energy & Equilibrium)',
      'Equilibrium (Dynamic Equilibrium, Law of Mass Action, Equilibrium Constant Kp & Kc, Le Chatelier\'s Principle, Ionic Equilibrium: Ionisation of Acids & Bases, pH Scale, Common Ion Effect, Buffer Solutions, Solubility Product)',
      'Redox Reactions (Oxidation & Reduction, Oxidation Number Concept, Balancing Redox Reactions: Oxidation Number Method & Ion-Electron Method)',
      'Hydrogen (Position in Periodic Table, Isotopes, Preparation, Properties & Uses, Hydrides, Water, Heavy Water, Hydrogen Peroxide, Hydrogen as a Fuel)',
      'The s-Block Elements (Group 1 Alkali Metals & Group 2 Alkaline Earth Metals: Electronic Configurations, Trends in Chemical Reactivity, Anomalous Properties, Important Compounds: Na2CO3, NaOH, CaCO3, Plaster of Paris, Cement)',
      'The p-Block Elements (Group 13 Boron Family & Group 14 Carbon Family: Trends in Properties, Inert Pair Effect, Allotropes of Carbon, Important Compounds: Borax, Boric Acid, Silicates, Silicones)',
      'Organic Chemistry — Some Basic Principles and Techniques (Classification, IUPAC Nomenclature, Isomerism: Structural & Stereoisomerism, Reaction Intermediates: Carbocations, Carbanions, Free Radicals, Electronic Displacements: Inductive, Electromeric, Resonance & Hyperconjugation, Purification & Quantitative Analysis)',
      'Hydrocarbons (Alkanes: Conformations & Free Radical Halogenation; Alkenes: Geometrical Isomerism, Addition Reactions, Markovnikov Rule & Peroxide Effect, Ozonolysis; Alkynes: Acidity, Addition Reactions; Aromatic Hydrocarbons: Benzene Structure, Aromaticity, Electrophilic Aromatic Substitution)',
      'Environmental Chemistry (Environmental Pollution: Tropospheric, Stratospheric, Ozone Hole, Greenhouse Effect, Water & Soil Pollution, Green Chemistry)'
    ],
    'Maths': [
      'Sets (Representation, Types of Sets, Subsets, Power Set, Universal Set, Venn Diagrams, Set Operations, Complement of a Set)',
      'Relations and Functions (Cartesian Product, Relations, Types of Functions: Identity, Constant, Polynomial, Rational, Modulus, Signum, Greatest Integer, Domain & Range)',
      'Trigonometric Functions (Angles in Radians & Degrees, Signs of Trigonometric Functions, Addition & Subtraction Formulas, Double & Triple Angle Formulas, General Solutions of Trigonometric Equations)',
      'Principle of Mathematical Induction (Induction Steps, Proof of Mathematical Statements)',
      'Complex Numbers and Quadratic Equations (Imaginary Unit \'i\', Algebraic Operations, Modulus & Conjugate, Argand Plane & Polar Representation, Quadratic Equations with Complex Roots)',
      'Linear Inequalities (Algebraic Solutions of Linear Inequalities in One Variable & Representation on Number Line, Graphical Solution in Two Variables)',
      'Permutations and Combinations (Fundamental Principle of Counting, Factorial Notation, Permutations nPr, Combinations nCr, Applications)',
      'Binomial Theorem (Statement & Proof for Positive Integral Index, Pascal\'s Triangle, General and Middle Terms in Binomial Expansion)',
      'Sequences and Series (Arithmetic Progression review, Geometric Progression: nth Term & Sum of n Terms, Geometric Mean, Sum to n Terms of Special Series)',
      'Straight Lines (Slope of a Line, Various Forms of Equations: Point-Slope, Two-Point, Slope-Intercept, Intercept, Normal Form, General Equation, Distance of a Point from a Line)',
      'Conic Sections (Sections of a Cone, Circle, Parabola, Ellipse, Hyperbola: Standard Equations & Properties)',
      'Introduction to Three Dimensional Geometry (Coordinate Axes & Planes, Coordinates of a Point, Distance Between Two Points, Section Formula in 3D)',
      'Limits and Derivatives (Intuitive Idea of Limit, Standard Limits, Derivatives as Rate of Change, Product Rule, Quotient Rule, Derivatives of Polynomial & Trigonometric Functions)',
      'Mathematical Reasoning (Statements, Negation, Compound Statements, Implications: If-Then, Only-If, Validating Statements)',
      'Statistics (Measures of Dispersion: Range, Mean Deviation, Variance and Standard Deviation of Ungrouped & Grouped Data, Coefficient of Variation)',
      'Probability (Random Experiments, Sample Space, Events: Mutually Exclusive & Exhaustive, Axiomatic Approach to Probability)'
    ],
    'Computer Science': [
      'Computer Systems and Organisation (Hardware, Software, Memory Types, Number Systems: Binary, Octal, Hexadecimal, Boolean Logic & Gates)',
      'Computational Thinking and Programming in Python (Tokens, Variables, Data Types, Operators, Flow of Control: If-Else, Loops: While & For)',
      'Strings, Lists, Tuples, and Dictionaries in Python (Indexing, Slicing, Built-in Functions, List Comprehension, Dictionary Operations)',
      'Python Functions and Modules (User-Defined Functions, Parameters, Return Values, Scope of Variables, Standard Modules: math, random, statistics)',
      'Society, Law and Ethics (Digital Footprint, Cyber Safety, Cybercrime, Intellectual Property Rights, Plagiarism, Open Source Licences)'
    ],
    'English': [
      'Hornbill Prose: The Portrait of a Lady, We\'re Not Afraid to Die, Discovering Tut, The Adventure, Silk Road',
      'Hornbill Poetry: A Photograph, The Laburnum Top, The Voice of the Rain, Childhood, Father to Son',
      'Snapshots Supplementary Reader: The Summer of the Beautiful White Horse, The Address, Mother\'s Day, Birth, The Tale of Melon City',
      'Reading Comprehension & Note-Making and Summarization Skills',
      'Creative Writing Skills: Classified Advertisements, Posters, Speech and Debate Writing'
    ],
    'Hindi': [
      'Aroh Part 1: Poetry Collection (Classical & Modern Anthologies)',
      'Aroh Part 1: Prose Collection (Classic Literary Stories & Essays)',
      'Vitan Part 1: Supplementary Reader (Biographies & Narratives)',
      'Creative Writing & Mass Media: Journalism, Diary Writing & Scripts'
    ],
    'Additional Subject': [
      'Unit 1: Fundamentals, Core Principles & Theories',
      'Unit 2: Applied Concepts, Case Studies & Analysis',
      'Unit 3: Practical Experiments, Projects & Field Work',
      'Unit 4: High-Yield Conceptual Questions & Numerical Practice',
      'Unit 5: Syllabus Revision & Model Question Papers'
    ]
  },

  12: {
    'Biology': [
      'Chapter 1: Reproduction in Organisms (Asexual Reproduction: Binary Fission, Budding, Vegetative Propagation; Sexual Reproduction: Pre-fertilisation, Fertilisation, Post-fertilisation Events)',
      'Chapter 2: Sexual Reproduction in Flowering Plants (Structure of Flower, Microsporogenesis & Pollen Grain, Megasporogenesis & Embryo Sac, Pollination Types & Agents, Outbreeding Devices, Pollen-Pistil Interaction, Double Fertilisation, Endosperm & Embryo Development, Apomixis & Polyembryony)',
      'Chapter 3: Human Reproduction (Male Reproductive System: Testes, Seminiferous Tubules; Female Reproductive System: Ovaries, Fallopian Tubes, Uterus; Gametogenesis: Spermatogenesis & Oogenesis; Menstrual Cycle: Hormonal Regulation; Fertilisation, Implantation, Pregnancy & Placenta, Parturition & Lactation)',
      'Chapter 4: Reproductive Health (Reproductive Health Problems & Strategies, Population Explosion, Contraceptive Methods: Natural, Barrier, IUDs, Oral Pills, Surgical; Medical Termination of Pregnancy (MTP), Sexually Transmitted Infections (STIs), Infertility and Assisted Reproductive Technologies: IVF, ZIFT, GIFT, ICSI)',
      'Chapter 5: Principles of Inheritance and Variation (Mendel\'s Laws of Inheritance, Incomplete Dominance, Co-dominance, Multiple Alleles: ABO Blood Groups, Pleiotropy, Polygenic Inheritance, Chromosomal Theory of Inheritance, Linkage and Recombination, Sex Determination: Humans, Birds, Honeybee, Mutation, Pedigree Analysis, Mendelian Disorders: Haemophilia, Sickle-Cell Anaemia, Phenylketonuria, Thalassemia, Chromosomal Disorders: Down, Turner, Klinefelter Syndromes)',
      'Chapter 6: Molecular Basis of Inheritance (DNA as Genetic Material: Griffith, Avery-MacLeod-McCarty, Hershey-Chase Experiments; Structure of DNA and RNA; Nucleosome Model of Chromatin; Meselson and Stahl Experiment on Semiconservative DNA Replication; Enzymes and Mechanism of Replication; Transcription: Unit, Promoters, RNA Polymerase, Post-transcriptional Modifications; Genetic Code: Characteristics, Wobble Hypothesis; Translation: tRNA, Ribosomes, Peptide Bond Synthesis; Regulation of Gene Expression: Lac Operon; Human Genome Project: Salient Features; DNA Fingerprinting)',
      'Chapter 7: Evolution (Origin of Life: Oparin-Haldane Hypothesis, Miller-Urey Experiment; Theories of Evolution: Lamarckism, Darwinian Natural Selection; Evidences of Evolution: Homologous & Analogous Organs, Paleontological, Embryological, Biochemical; Adaptive Radiation; Mutation Theory of Hugo de Vries; Hardy-Weinberg Principle & Factors Affecting; Origin and Evolution of Man)',
      'Chapter 8: Human Health and Disease (Common Infectious Diseases: Typhoid, Pneumonia, Common Cold, Malaria Life Cycle, Amoebiasis, Ascariasis, Filariasis, Ringworm; Immunity: Innate & Acquired, Humoral & Cell-Mediated, Active & Passive, Vaccines; Immune System Disorders: Allergies, Autoimmunity, AIDS: HIV Structure, Transmission & Prevention; Cancer: Causes, Types, Oncogenes, Detection & Treatment; Drugs and Alcohol Abuse: Opioids, Cannabinoids, Coca Alkaloids)',
      'Chapter 9: Strategies for Enhancement in Food Production (Animal Husbandry: Management of Dairy, Poultry, Fisheries, Animal Breeding; Plant Breeding: Steps, Breeding for Disease Resistance, Insect Pest Resistance, Improved Nutritional Quality (Biofortification); Single Cell Protein (SCP); Tissue Culture: Explants, Cellular Totipotency, Micropropagation, Somatic Hybrids)',
      'Chapter 10: Microbes in Human Welfare (Microbes in Household Products: Curd, Bread, Cheese, Toddy; Microbes in Industrial Products: Fermented Beverages, Antibiotics, Organic Acids, Alcohol, Enzymes, Bioactive Molecules: Cyclosporin A, Statins; Microbes in Sewage Treatment: Primary & Secondary (Biological) Treatment, Activated Sludge; Microbes in Production of Biogas: Methanogens, Gobar Gas Plant; Microbes as Biocontrol Agents: Bt, Trichoderma, Baculoviruses; Microbes as Biofertilisers: Rhizobium, Mycorrhiza, Cyanobacteria)',
      'Chapter 11: Biotechnology: Principles and Processes (Principles of Recombinant DNA Technology, Tools of Recombinant DNA: Restriction Enzymes, Ligases, Polymerases, Vectors: pBR322 Structure, Selectable Markers, Competent Host Cells, Processes of r-DNA Technology: Isolation of Genetic Material, Cutting at Specific Sites, PCR (Polymerase Chain Reaction), Insertion into Host, Bioreactors, Downstream Processing)',
      'Chapter 12: Biotechnology and Its Applications (Biotechnological Applications in Agriculture: Bt Cotton, Pest Resistant Tobacco (RNA Interference - RNAi); Applications in Medicine: Genetically Engineered Insulin, Gene Therapy (ADA Deficiency), Molecular Diagnosis: PCR, ELISA; Transgenic Animals: Uses and Models; Ethical Issues: Biopiracy, GEAC, Patents)',
      'Chapter 13: Organisms and Populations (Organisms and Environment: Abiotic Factors: Temperature, Water, Light, Soil; Responses to Abiotic Factors: Regulate, Conform, Migrate, Suspend; Adaptations in Plants and Animals; Populations: Attributes: Natality, Mortality, Sex Ratio, Age Pyramids; Population Growth: Exponential and Logistic Growth Curves; Population Interactions: Mutualism, Competition, Predation, Parasitism, Commensalism, Amensalism)',
      'Chapter 14: Ecosystem (Structure and Function, Productivity: GPP, NPP; Decomposition: Steps and Factors; Energy Flow: Food Chains, Food Webs, Ecological Pyramids: Number, Biomass, Energy; Ecological Succession: Primary & Secondary, Hydrarch & Xerarch; Nutrient Cycling: Carbon and Phosphorus Cycles; Ecosystem Services)',
      'Chapter 15: Biodiversity and Conservation (Concept and Levels of Biodiversity: Genetic, Species, Ecological; Patterns of Biodiversity: Latitudinal Gradients, Species-Area Relationship; Importance of Biodiversity: Rivet Popper Hypothesis; Loss of Biodiversity: The Evil Quartet; Biodiversity Conservation: In-situ: National Parks, Sanctuaries, Biosphere Reserves, Sacred Groves; Ex-situ: Botanical Gardens, Zoological Parks, Cryopreservation, Seed Banks)',
      'Chapter 16: Environmental Issues (Air Pollution and Its Control: Electrostatic Precipitator, Catalytic Converters, Auto Exhaust Norms; Water Pollution and Control: BOD, Eutrophication, Biomagnification; Solid Waste Management and Radioactive Wastes; Greenhouse Effect and Global Warming; Ozone Depletion in Stratosphere: Montreal Protocol; Deforestation, Jhum Cultivation, Chipko Movement, Joint Forest Management)'
    ],
    'Physics': [
      'Electric Charges and Fields (Coulomb\'s Law, Electric Field, Electric Dipole, Electric Flux, Gauss\'s Law & Applications)',
      'Electrostatic Potential and Capacitance (Electric Potential, Potential Energy of Dipole, Capacitors, Dielectrics, Energy Stored in Capacitor)',
      'Current Electricity (Ohm\'s Law, Drift Velocity, Resistivity & Temperature Dependence, Cells in Series & Parallel, Kirchhoff\'s Laws, Wheatstone Bridge, Potentiometer)',
      'Moving Charges and Magnetism (Biot-Savart Law, Ampere\'s Circuital Law, Solenoid & Toroid, Force on Moving Charge, Cyclotron, Galvanometer to Ammeter/Voltmeter)',
      'Magnetism and Matter (Bar Magnet as Equivalent Solenoid, Earth\'s Magnetism: Declination & Dip, Magnetic Materials: Diamagnetic, Paramagnetic, Ferromagnetic, Hysteresis)',
      'Electromagnetic Induction (Faraday\'s Laws, Lenz\'s Law, Eddy Currents, Self & Mutual Inductance, AC Generator)',
      'Alternating Current (Peak & RMS Values, LCR Series Circuit, Phasor Diagrams, Resonance, Power Factor, Wattless Current, Transformer Principle & Losses)',
      'Electromagnetic Waves (Displacement Current, EM Wave Characteristics, Electromagnetic Spectrum: Radio to Gamma Rays & Uses)',
      'Ray Optics and Optical Instruments (Reflection, Refraction, Total Internal Reflection, Refraction at Spherical Surfaces, Lens Maker\'s Formula, Prism, Microscopes & Telescopes)',
      'Wave Optics (Huygens\' Principle, Wavefronts, Interference of Light, Young\'s Double Slit Experiment, Diffraction: Single Slit, Polarisation of Light)',
      'Dual Nature of Radiation and Matter (Photoelectric Effect, Hertz & Lenard Observations, Einstein\'s Photoelectric Equation, de Broglie Wavelength, Davisson-Germer Experiment)',
      'Atoms (Alpha Particle Scattering Experiment, Rutherford Nuclear Model, Bohr Model of Hydrogen Atom, Hydrogen Spectrum Series)',
      'Nuclei (Nuclear Size, Mass Defect, Binding Energy per Nucleon Curve, Nuclear Fission and Fusion, Radioactivity: Alpha, Beta, Gamma Decay)',
      'Semiconductor Electronics (Energy Bands in Solids, Intrinsic & Extrinsic Semiconductors, p-n Junction Diode: Forward & Reverse Bias, Diode as Rectifier: Half & Full Wave, Zener Diode, Optoelectronic Devices: LED, Photodiode, Solar Cell)'
    ],
    'Chemistry': [
      'Solid State (Classification: Crystalline & Amorphous, Unit Cells, Packing Efficiency, Imperfections in Solids, Electrical & Magnetic Properties)',
      'Solutions (Types of Solutions, Raoult\'s Law, Ideal & Non-Ideal Solutions, Colligative Properties: Relative Lowering of Vapour Pressure, Elevation of Boiling Point, Depression of Freezing Point, Osmotic Pressure, Van \'t Hoff Factor)',
      'Electrochemistry (Electrochemical Cells, Galvanic Cells, Nernst Equation, Conductance of Electrolytic Solutions, Kohlrausch\'s Law, Electrolysis, Batteries: Primary & Secondary, Fuel Cells, Corrosion)',
      'Chemical Kinetics (Rate of Reaction, Factors Influencing Rate, Rate Law & Specific Rate Constant, Order & Molecularity, Integrated Rate Equations: Zero & First Order, Half-Life, Temperature Dependence: Arrhenius Equation, Activation Energy)',
      'Surface Chemistry (Adsorption: Physisorption & Chemisorption, Freundlich Adsorption Isotherm, Catalysis, Colloids: Lyophilic & Lyophobic, Emulsions, Tyndall Effect, Coagulation)',
      'General Principles and Processes of Isolation of Elements (Metallurgy: Concentration of Ores, Extraction of Crude Metal, Thermodynamic Principles: Ellingham Diagrams, Refining of Metals: Cu, Zn, Fe, Al)',
      'The p-Block Elements (Group 15, 16, 17, 18 Elements: Electronic Configurations, Trends in Properties, Compounds of Nitrogen, Phosphorus, Oxygen, Sulphur, Halogens & Noble Gases, Interhalogens)',
      'The d- and f-Block Elements (Transition Elements: Electronic Configuration, Metallic Character, Ionisation Enthalpy, Oxidation States, Catalytic Properties, Lanthanoids & Actinoids: Lanthanoid Contraction)',
      'Coordination Compounds (Werner\'s Theory, Ligands, Coordination Number, IUPAC Nomenclature, Isomerism: Geometrical & Optical, Valence Bond Theory, Crystal Field Theory: Octahedral & Tetrahedral Complexes, Bonding in Metal Carbonyls)',
      'Haloalkanes and Haloarenes (Nomenclature, Nature of C-X Bond, Methods of Preparation, Chemical Reactions: SN1 and SN2 Mechanisms, Elimination, Organometallic Compounds, Polyhalogen Compounds)',
      'Alcohols, Phenols and Ethers (Preparation, Physical & Chemical Properties, Acidity of Phenols, Electrophilic Aromatic Substitution, Reimer-Tiemann & Kolbe Reactions, Preparation of Ethers: Williamson Synthesis)',
      'Aldehydes, Ketones and Carboxylic Acids (Nomenclature, Nature of Carbonyl Group, Methods of Preparation, Nucleophilic Addition Reactions, Aldol Condensation, Cannizzaro Reaction, Acidity of Carboxylic Acids)',
      'Amines (Classification, Preparation, Physical Properties, Basicity of Amines, Carbylamine Reaction, Diazonium Salts: Preparation, Chemical Reactions & Importance in Synthesis)',
      'Biomolecules (Carbohydrates: Monosaccharides (Glucose, Fructose), Polysaccharides (Starch, Cellulose, Glycogen); Proteins: Amino Acids, Primary to Quaternary Structures, Denaturation; Nucleic Acids; Vitamins & Hormones)',
      'Polymers (Classification: Natural & Synthetic, Methods of Polymerisation: Addition & Condensation, Copolymerisation, Natural Rubber & Vulcanisation, Synthetic Rubbers, Biodegradable Polymers)',
      'Chemistry in Everyday Life (Chemicals in Medicines: Analgesics, Antibiotics, Antiseptics; Chemicals in Food: Preservatives, Artificial Sweeteners; Cleansing Agents: Soaps and Synthetic Detergents)'
    ],
    'Maths': [
      'Relations and Functions (Types of Relations: Reflexive, Symmetric, Transitive, Equivalence; Types of Functions: One-One (Injective), Onto (Surjective), Bijective, Composition of Functions, Invertible Functions)',
      'Inverse Trigonometric Functions (Definition, Range, Domain, Principal Value Branches, Properties of Inverse Trigonometric Functions)',
      'Matrices (Concept, Notation, Order, Equality, Types of Matrices, Operations: Addition, Scalar Multiplication, Matrix Multiplication, Transpose, Symmetric & Skew Symmetric Matrices, Elementary Row/Column Operations, Invertible Matrices)',
      'Determinants (Determinant of a Matrix, Minors & Cofactors, Adjoint and Inverse of a Matrix, Solving System of Linear Equations using Matrix Method)',
      'Continuity and Differentiability (Continuity of Functions, Derivative of Composite Functions: Chain Rule, Derivatives of Inverse Trigonometric, Implicit, Exponential and Logarithmic Functions, Logarithmic Differentiation, Parametric Differentiation, Second Order Derivative, Rolle\'s and Mean Value Theorems)',
      'Application of Derivatives (Rate of Change of Quantities, Increasing and Decreasing Functions, Tangents and Normals, Approximations, Maxima and Minima)',
      'Integrals (Integration as Inverse Process of Differentiation, Methods of Integration: Substitution, Partial Fractions, By Parts, Definite Integrals: Fundamental Theorem of Calculus, Evaluation by Substitution, Properties of Definite Integrals)',
      'Application of Integrals (Area Under Simple Curves: Circles, Parabolas, Ellipses, Area Bounded Between Two Curves)',
      'Differential Equations (Order and Degree, General and Particular Solutions, Formation of Differential Equations, Solutions by Variable Separation, Homogeneous Differential Equations, First Order Linear Differential Equations)',
      'Vector Algebra (Vectors and Scalars, Magnitude & Direction, Direction Cosines & Ratios, Types of Vectors, Position Vector, Addition, Multiplication by Scalar, Dot (Scalar) Product, Cross (Vector) Product, Scalar Triple Product)',
      'Three Dimensional Geometry (Direction Cosines & Direction Ratios of a Line, Equation of a Line in Space, Angle Between Two Lines, Shortest Distance Between Two Skew Lines, Equation of a Plane, Angle Between Two Planes, Distance of a Point from a Plane)',
      'Linear Programming (Mathematical Formulation of LPP, Graphical Method of Solution for Problems in Two Variables, Feasible and Infeasible Regions, Optimal Feasible Solutions)',
      'Probability (Conditional Probability, Multiplication Theorem on Probability, Independent Events, Total Probability Theorem, Bayes\' Theorem, Random Variable & Its Probability Distribution, Mean & Variance of Random Variable, Binomial Distribution)'
    ],
    'Computer Science': [
      'Computational Thinking and Programming - Python Review (Functions, Scope, Parameter Passing)',
      'File Handling in Python (Text Files, Binary Files using Pickle, CSV Files using csv Module)',
      'Data Structures (Linear Lists, Stack: Push, Pop using List, Queue: Insert, Delete)',
      'Computer Networks (Network Types: LAN, MAN, WAN, Topologies: Star, Bus, Tree, Network Devices, Protocols: HTTP, FTP, TCP/IP, DNS)',
      'Database Management (Relational Data Model, Keys, SQL Commands: DDL and DML, Table Creation, Joins, Group By, Having, Aggregate Functions)',
      'Interface Python with SQL Database (Connecting Python with MySQL, Cursor, Executing SQL Queries from Python, Fetching Results)'
    ],
    'English': [
      'Flamingo Prose: The Last Lesson, Lost Spring, Deep Water, The Rattrap, Indigo, Poets and Pancakes, The Interview, Going Places',
      'Flamingo Poetry: My Mother at Sixty-Six, Keeping Quiet, A Thing of Beauty, A Roadside Stand, Aunt Jennifer\'s Tigers',
      'Vistas Supplementary Reader: The Third Level, The Tiger King, Journey to the End of the Earth, The Enemy, On the Face of It, Memories of Childhood',
      'Reading Comprehension & Critical Analysis Passages',
      'Creative Writing Skills: Notice, Invitations & Replies, Letters to Editor, Job Applications with Bio-data, Article & Report Writing'
    ],
    'Hindi': [
      'Aroh Part 2: Poetry Section (Modern & Classical Anthologies)',
      'Aroh Part 2: Prose Section (Critical Essays & Literary Stories)',
      'Vitan Part 2: Supplementary Reader (Contemporary Literature)',
      'Creative Writing & Mass Media: Print & Digital Journalism'
    ],
    'Additional Subject': [
      'Unit 1: Foundational Frameworks & Theoretical Principles',
      'Unit 2: Advanced Analysis, Case Studies & Applications',
      'Unit 3: Practical Experiments, Viva & Numerical Problems',
      'Unit 4: High-Yield Previous Year Board Questions',
      'Unit 5: Comprehensive Revision & Model Test Papers'
    ]
  }
};

/**
 * Returns available chapters for a given class level and subject.
 */
export function getCurriculumChapters(classLevel: number, subject: string): string[] {
  const numericClass = classLevel || 8;
  const gradeData = CURRICULUM_CATALOG[numericClass] || CURRICULUM_CATALOG[8];
  const normSubj = (subject || '').trim().toLowerCase();

  for (const [key, chapters] of Object.entries(gradeData)) {
    if (key.toLowerCase() === normSubj) {
      return chapters;
    }
  }

  // Handle aliases
  if (normSubj.includes('bio') || normSubj.includes('botan') || normSubj.includes('zool')) {
    if (gradeData['Biology']) return gradeData['Biology'];
    if (gradeData['Science']) return gradeData['Science'];
  }
  if (normSubj.includes('math')) {
    if (gradeData['Maths']) return gradeData['Maths'];
  }
  if (normSubj.includes('phys')) {
    if (gradeData['Physics']) return gradeData['Physics'];
    if (gradeData['Science']) return gradeData['Science'];
  }
  if (normSubj.includes('chem')) {
    if (gradeData['Chemistry']) return gradeData['Chemistry'];
    if (gradeData['Science']) return gradeData['Science'];
  }
  if (normSubj.includes('sci')) {
    if (gradeData['Science']) return gradeData['Science'];
    if (gradeData['Biology']) return gradeData['Biology'];
  }
  if (normSubj.includes('soc') || normSubj.includes('sst') || normSubj.includes('hist') || normSubj.includes('geog') || normSubj.includes('civic')) {
    if (gradeData['Social Science']) return gradeData['Social Science'];
  }
  if (normSubj.includes('eng')) {
    if (gradeData['English']) return gradeData['English'];
  }
  if (normSubj.includes('hin')) {
    if (gradeData['Hindi']) return gradeData['Hindi'];
  }
  if (normSubj.includes('evs')) {
    if (gradeData['EVS']) return gradeData['EVS'];
    if (gradeData['Science']) return gradeData['Science'];
  }
  if (normSubj.includes('comp') || normSubj.includes('code') || normSubj.includes('it')) {
    if (gradeData['Computer Science']) return gradeData['Computer Science'];
  }
  if (normSubj.includes('addition') || normSubj.includes('other') || normSubj.includes('vocat') || normSubj.includes('custom') || normSubj.includes('extra')) {
    if (gradeData['Additional Subject']) return gradeData['Additional Subject'];
  }

  const firstKey = Object.keys(gradeData)[0];
  return gradeData[firstKey] || [];
}

/**
 * Returns available subjects for a specific class level
 */
export function getAvailableSubjectsForClass(classLevel: number): string[] {
  const numericClass = classLevel || 8;
  const gradeData = CURRICULUM_CATALOG[numericClass] || CURRICULUM_CATALOG[8];
  return Object.keys(gradeData);
}
