const express = require('express');
const router = express.Router();
const {
  ALL_SHORT_NOTES,
  EXAM_OPTIONS,
  getAllNotes,
  getNoteById,
  filterNotes
} = require('../data/short-notes');

// GET /api/notes or /notes
// Query params: ?search=string&exam=id&subject=name
router.get('/', (req, res) => {
  try {
    const { search = '', exam = 'all', subject = 'all' } = req.query;
    const filtered = filterNotes({ search, exam, subject });

    res.json({
      success: true,
      count: filtered.length,
      total: ALL_SHORT_NOTES.length,
      filters: { search, exam, subject },
      notes: filtered
    });
  } catch (err) {
    console.error('Error fetching short notes:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch short notes' });
  }
});

// GET /api/notes/exams
// Returns available target exams and course list
router.get('/exams', (req, res) => {
  try {
    const examsWithCounts = EXAM_OPTIONS.map(exam => {
      const count = exam.id === 'all'
        ? ALL_SHORT_NOTES.length
        : filterNotes({ exam: exam.id }).length;
      return {
        ...exam,
        notesCount: count
      };
    });

    res.json({
      success: true,
      exams: examsWithCounts
    });
  } catch (err) {
    console.error('Error fetching exam options:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch exam list' });
  }
});

// GET /api/notes/:id
// Returns full details of a specific chapter note
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const note = getNoteById(id);

    if (!note) {
      return res.status(404).json({
        success: false,
        error: `Short note with ID '${id}' not found`
      });
    }

    res.json({
      success: true,
      note
    });
  } catch (err) {
    console.error(`Error fetching short note ${req.params.id}:`, err);
    res.status(500).json({ success: false, error: 'Failed to fetch chapter note' });
  }
});

module.exports = router;
