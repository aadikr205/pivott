const jwt = require('jsonwebtoken');
const db = require('../db');

const JWT_SECRET = process.env.JWT_SECRET || 'pivott-super-secret-key-2026';

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required. No Bearer token provided.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (!decoded || !decoded.id) {
      return res.status(401).json({ error: 'Invalid authentication token payload.' });
    }

    // Verify user actually exists in the database
    let user = db.prepare('SELECT id, name, email, exam_name, exam_date, max_daily_hours, off_days, is_verified FROM users WHERE id = ?').get(decoded.id);

    // Smart recovery: if user not found by ID (e.g. after DB recreation), attempt lookup by email
    if (!user && decoded.email) {
      user = db.prepare('SELECT id, name, email, exam_name, exam_date, max_daily_hours, off_days, is_verified FROM users WHERE lower(email) = lower(?)').get(decoded.email);
    }

    if (!user) {
      return res.status(401).json({ error: 'User session expired or user record not found. Please log in again.' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired authentication token.' });
  }
}

module.exports = {
  authMiddleware,
  JWT_SECRET
};
