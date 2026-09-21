/**
 * Pivott Activity Logger (Feature 7)
 * Insert-only permanent audit log tied to student's verified account.
 * NO update or delete functions exist.
 */

const { v4: uuidv4 } = require('uuid');
const db = require('./db');

/**
 * Log student activity permanently
 * @param {string} userId
 * @param {string} activityType - 'schedule' | 'quiz' | 'pyq' | 'doubt_solver' | 'notes' | 'replan' | 'profile' | 'auth'
 * @param {string} description - Human-readable summary
 * @param {Object} metadata - Optional JSON metadata
 */
function logActivity(userId, activityType, description, metadata = {}) {
  try {
    if (!userId) return null;
    const id = uuidv4();
    const now = new Date().toISOString();
    const metaStr = typeof metadata === 'string' ? metadata : JSON.stringify(metadata);

    const stmt = db.prepare(`
      INSERT INTO activity_logs (id, user_id, activity_type, description, metadata, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    stmt.run(id, userId, activityType, description, metaStr, now);
    return id;
  } catch (err) {
    console.error('[ActivityLogger] Error logging activity:', err.message);
    return null;
  }
}

/**
 * Fetch immutable activity history with filtering
 */
function getActivityHistory(userId, options = {}) {
  const { type = 'all', startDate, endDate, limit = 50, offset = 0, search } = options;

  let query = 'SELECT * FROM activity_logs WHERE user_id = ?';
  const params = [userId];

  if (type && type !== 'all') {
    query += ' AND activity_type = ?';
    params.push(type);
  }

  if (startDate) {
    query += ' AND created_at >= ?';
    params.push(startDate);
  }

  if (endDate) {
    query += ' AND created_at <= ?';
    params.push(endDate);
  }

  if (search) {
    query += ' AND (description LIKE ? OR metadata LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }

  query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  params.push(Number(limit) || 50, Number(offset) || 0);

  const rows = db.prepare(query).all(...params);
  const countQuery = query.replace('SELECT *', 'SELECT COUNT(*) as cnt').split('ORDER BY')[0];
  const totalRow = db.prepare(countQuery).get(...params.slice(0, -2));
  const total = totalRow ? totalRow.cnt : rows.length;

  const logs = rows.map(r => {
    let meta = {};
    try { meta = JSON.parse(r.metadata || '{}'); } catch (e) {}
    return {
      id: r.id,
      user_id: r.user_id,
      activity_type: r.activity_type,
      title: r.description,
      description: r.description,
      details: meta,
      metadata: meta,
      created_at: r.created_at
    };
  });

  return {
    logs,
    total
  };
}

module.exports = {
  logActivity,
  getActivityHistory
};
