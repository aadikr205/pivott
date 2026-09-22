const express = require('express');
const router = express.Router();
const db = require('../db');
const { authMiddleware } = require('../middleware/auth');
const { logActivity } = require('../activity-logger');

// All notification endpoints require user authentication
router.use(authMiddleware);

/**
 * GET /api/notifications/alerts
 * Computes live smart reminders, delay alerts, and approaching deadline notifications
 */
router.get('/alerts', (req, res) => {
  try {
    const userId = req.user.id;
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    // Hours remaining until 11:59 PM today
    const remainingHoursToday = Math.max(0, 23 - currentHour);
    const remainingMinutesToday = (23 - currentHour) * 60 + (59 - currentMinute);

    const alerts = [];

    // 1. Check Main Schedule planned items for today & backlog
    const todaySchedule = db.prepare(`
      SELECT * FROM schedule_days 
      WHERE user_id = ? AND date = ?
    `).get(userId, todayStr);

    let todayPlannedItems = [];
    if (todaySchedule && todaySchedule.planned_items) {
      try {
        todayPlannedItems = JSON.parse(todaySchedule.planned_items);
      } catch {}
    }

    const pendingMainItems = todayPlannedItems.filter(item => item.status !== 'done');

    // 2. Check Self Timetable entries
    const selfEntries = db.prepare(`
      SELECT * FROM self_timetable_entries
      WHERE user_id = ? AND status != 'done'
      ORDER BY created_at DESC
    `).all(userId);

    const pendingSelfItems = selfEntries.filter(e => e.status !== 'done');
    const deferredSelfItems = selfEntries.filter(e => e.status === 'deferred');

    // 3. Evaluate Delay Alerts (Overdue / Backlog)
    const pastDays = db.prepare(`
      SELECT planned_items, actual_completed FROM schedule_days
      WHERE user_id = ? AND date < ?
    `).all(userId, todayStr);

    let hasOverdueSchedule = false;
    for (const d of pastDays) {
      try {
        const planned = JSON.parse(d.planned_items || '[]');
        const actual = JSON.parse(d.actual_completed || '[]');
        if (planned.length > actual.length) {
          hasOverdueSchedule = true;
          break;
        }
      } catch {}
    }

    if (deferredSelfItems.length > 0 || hasOverdueSchedule) {
      alerts.push({
        id: `alert-delay-${todayStr}`,
        type: 'delay_alert',
        urgency: 'critical',
        icon: '⚠️',
        title: 'Study Delay & Backlog Alert',
        message: `Aapke ${deferredSelfItems.length} self-study topics backlog/delay me hain. Schedule ko track par rakhne ke liye Re-plan karein ya abhi complete karein!`,
        action_label: 'View Backlog',
        action_tab: deferredSelfItems.length > 0 ? 'self-timetable' : 'schedule',
        created_at: now.toISOString()
      });
    }

    // 4. Evaluate Approaching End-of-Day Deadline Alerts
    const totalPendingToday = pendingMainItems.length + pendingSelfItems.length;

    if (totalPendingToday > 0) {
      if (remainingHoursToday <= 3) {
        // Less than 3 hours left before midnight
        alerts.push({
          id: `alert-urgent-deadline-${todayStr}-${currentHour}`,
          type: 'urgent_deadline',
          urgency: 'critical',
          icon: '⏰',
          title: `Sirf ${remainingHoursToday} Ghante Bache Hain!`,
          message: `Aaj ke study tasks me ${totalPendingToday} topics pending hain. Daily streak bachane aur score drop se bachne ke liye jaldi complete karein!`,
          action_label: 'Complete Now',
          action_tab: pendingMainItems.length > 0 ? 'today' : 'self-timetable',
          created_at: now.toISOString()
        });
      } else if (remainingHoursToday <= 6) {
        // Evening warning (approx 6 PM - 9 PM)
        alerts.push({
          id: `alert-evening-${todayStr}-${currentHour}`,
          type: 'approaching_deadline',
          urgency: 'high',
          icon: '🌆',
          title: 'Evening Study Reminder',
          message: `Sham ho chuki hai aur aaj ke ${totalPendingToday} study topics pending hain. Apne timetable ke anusaar session start karein.`,
          action_label: 'Start Study Session',
          action_tab: pendingMainItems.length > 0 ? 'today' : 'self-timetable',
          created_at: now.toISOString()
        });
      } else {
        // Normal daytime reminder
        alerts.push({
          id: `alert-daytime-${todayStr}`,
          type: 'daily_reminder',
          urgency: 'medium',
          icon: '📖',
          title: 'Daily Study Goals Active',
          message: `Aaj ke plan me ${totalPendingToday} high-yield topics scheduled hain. Focus mode on karein!`,
          action_label: 'Open Plan',
          action_tab: 'today',
          created_at: now.toISOString()
        });
      }
    } else if (todayPlannedItems.length > 0 || selfEntries.length > 0) {
      // Completed all tasks!
      alerts.push({
        id: `alert-celebrate-${todayStr}`,
        type: 'celebration',
        urgency: 'low',
        icon: '🎉',
        title: 'Shabash! Aaj Ka Target Complete!',
        message: 'Aapne aaj ke sabhi planned study topics successfully complete kar liye hain. Revision ya PYQs practice karein.',
        action_label: 'Practice PYQs',
        action_tab: 'pyq',
        created_at: now.toISOString()
      });
    }

    const userPref = db.prepare('SELECT notifications_enabled FROM users WHERE id = ?').get(userId);
    const notificationsEnabled = userPref ? (userPref.notifications_enabled !== 0 ? 1 : 0) : 1;

    res.json({
      success: true,
      notifications_enabled: notificationsEnabled,
      current_time: now.toISOString(),
      remaining_hours: remainingHoursToday,
      remaining_minutes: remainingMinutesToday,
      pending_tasks_count: totalPendingToday,
      alerts_count: alerts.length,
      critical_count: alerts.filter(a => a.urgency === 'critical').length,
      alerts
    });
  } catch (err) {
    console.error('Error computing notification alerts:', err);
    res.status(500).json({ error: 'Failed to retrieve notification alerts.' });
  }
});

/**
 * POST /api/notifications/ack
 * Acknowledges / dismisses a notification
 */
router.post('/ack', (req, res) => {
  try {
    const { alert_id } = req.body;
    logActivity(req.user.id, 'notification_dismiss', `Acknowledged notification alert`, { alert_id });
    res.json({ success: true, acknowledged_id: alert_id });
  } catch (err) {
    res.status(500).json({ error: 'Failed to acknowledge notification.' });
  }
});

module.exports = router;
