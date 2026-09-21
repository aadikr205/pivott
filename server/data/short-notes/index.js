const { PHYSICS_NOTES } = require('./physics-notes');
const { CHEMISTRY_NOTES } = require('./chemistry-notes');
const { BIOLOGY_NOTES } = require('./biology-notes');
const { MATH_NOTES } = require('./math-notes');
const { enhanceNoteWithVisuals } = require('./visual-enhancer');

// All short notes combined with visual diagrams and learning aids
const ALL_SHORT_NOTES = [
  ...PHYSICS_NOTES,
  ...CHEMISTRY_NOTES,
  ...BIOLOGY_NOTES,
  ...MATH_NOTES
].map(enhanceNoteWithVisuals);

// Target Exam / Course canonical list with labels and subjects
const EXAM_OPTIONS = [
  { id: 'all', label: 'All Exams', description: 'All available chapter short notes' },
  { id: 'neet', label: 'NEET (UG)', description: 'Physics, Chemistry, Biology' },
  { id: 'jee_main', label: 'JEE Main', description: 'Physics, Chemistry, Mathematics' },
  { id: 'jee', label: 'JEE Advanced', description: 'Advanced Physics, Chemistry, Mathematics' },
  { id: 'cbse12_pcmb', label: 'CBSE 12th (PCMB)', description: 'Board + Competitive Core' },
  { id: 'cbse12_pcb', label: 'CBSE 12th (PCB)', description: 'Physics, Chemistry, Biology' },
  { id: 'cbse12', label: 'CBSE 12th (PCM)', description: 'Physics, Chemistry, Mathematics' },
  { id: 'class10', label: 'Class 10th (CBSE)', description: 'Science & Mathematics Core' },
  { id: 'bseb12', label: 'BSEB 12th (Bihar Board)', description: 'Science Stream High Yield' },
  { id: 'bseb10', label: 'BSEB 10th (Matric)', description: 'Science & Mathematics High Yield' }
];

/**
 * Get all notes
 */
function getAllNotes() {
  return ALL_SHORT_NOTES;
}

/**
 * Find a specific note by ID
 */
function getNoteById(id) {
  if (!id) return null;
  return ALL_SHORT_NOTES.find(n => n.id.toLowerCase() === id.trim().toLowerCase()) || null;
}

/**
 * Filter notes by search query, target exam, and subject
 */
function filterNotes({ search = '', exam = 'all', subject = 'all' } = {}) {
  let results = ALL_SHORT_NOTES;

  // Filter by subject
  if (subject && subject !== 'all') {
    const subLower = subject.trim().toLowerCase();
    results = results.filter(n => n.subject.toLowerCase() === subLower);
  }

  // Filter by exam
  if (exam && exam !== 'all') {
    const examLower = exam.trim().toLowerCase();
    results = results.filter(n => {
      if (!Array.isArray(n.applicable_exams)) return false;
      // Exact match
      if (n.applicable_exams.some(e => e.toLowerCase() === examLower)) return true;
      // Handle JEE main/adv synonym mapping
      if (examLower === 'jee_main' && n.applicable_exams.includes('jee')) return true;
      if (examLower === 'jee' && n.applicable_exams.includes('jee_main')) return true;
      // Handle BSEB 10 / Class 10 overlap
      if (examLower === 'bseb10' && n.applicable_exams.includes('class10')) return true;
      if (examLower === 'class10' && n.applicable_exams.includes('bseb10')) return true;
      // Handle BSEB 12 / CBSE 12 overlap
      if (examLower === 'bseb12' && (n.applicable_exams.includes('cbse12') || n.applicable_exams.includes('cbse12_pcb') || n.applicable_exams.includes('cbse12_pcmb'))) return true;
      return false;
    });
  }

  // Filter by search query across multiple fields
  if (search && search.trim()) {
    const query = search.trim().toLowerCase();
    results = results.filter(n => {
      const titleMatch = n.chapter_title && n.chapter_title.toLowerCase().includes(query);
      const subjectMatch = n.subject && n.subject.toLowerCase().includes(query);
      const classMatch = n.class_level && n.class_level.toLowerCase().includes(query);
      const summaryMatch = n.summary && n.summary.toLowerCase().includes(query);
      const takeawaysMatch = Array.isArray(n.key_takeaways) && n.key_takeaways.some(t => t.toLowerCase().includes(query));
      const formulasMatch = Array.isArray(n.formulas_and_laws) && n.formulas_and_laws.some(f => (f.name && f.name.toLowerCase().includes(query)) || (f.formula && f.formula.toLowerCase().includes(query)));
      const trapsMatch = Array.isArray(n.exam_traps_and_tips) && n.exam_traps_and_tips.some(tip => tip.toLowerCase().includes(query));
      const examsMatch = Array.isArray(n.applicable_exams) && n.applicable_exams.some(e => e.toLowerCase().includes(query));

      return titleMatch || subjectMatch || classMatch || summaryMatch || takeawaysMatch || formulasMatch || trapsMatch || examsMatch;
    });
  }

  return results;
}

module.exports = {
  ALL_SHORT_NOTES,
  EXAM_OPTIONS,
  getAllNotes,
  getNoteById,
  filterNotes
};
