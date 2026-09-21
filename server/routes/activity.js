const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const { getActivityHistory } = require('../activity-logger');

/**
 * Immutable Activity History Routes
 * CRITICAL SPECIFICATION: STRICT INSERT-ONLY AUDIT TRAIL.
 * Under NO circumstances are DELETE, PUT, or PATCH routes to be defined here.
 */

// GET /api/activity/history
// Returns chronological permanent activity logs for authenticated user
router.get('/history', authMiddleware, (req, res) => {
  try {
    const userId = req.user.id;
    const { type, start_date, end_date, limit = 50, offset = 0 } = req.query;

    const result = getActivityHistory(userId, {
      type: type || undefined,
      startDate: start_date || undefined,
      endDate: end_date || undefined,
      limit: Math.min(100, Math.max(1, Number(limit) || 50)),
      offset: Math.max(0, Number(offset) || 0)
    });

    return res.json({
      count: result.logs.length,
      total: result.total,
      logs: result.logs
    });
  } catch (err) {
    console.error('Fetch activity history error:', err);
    return res.status(500).json({ error: 'Failed to retrieve activity history.' });
  }
});

module.exports = router;
