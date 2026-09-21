const express = require('express');
const router = express.Router();
const db = require('../db');
const { authMiddleware } = require('../middleware/auth');
const { formatDate, daysBetween } = require('../scheduler');

// GET /progress/dashboard
// Aggregates live data for all 5 required charts + KPIs
router.get('/dashboard', authMiddleware, (req, res) => {
  try {
    const userId = req.user.id;
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
    if (!user) return res.status(404).json({ error: 'User not found.' });

    const todayStr = formatDate(new Date());

    // 1. All topics & subjects
    const subjects = db.prepare('SELECT * FROM subjects WHERE user_id = ?').all(userId);
    const topics = db.prepare(`
      SELECT t.*, s.name as subject_name 
      FROM topics t
      JOIN subjects s ON t.subject_id = s.id
      WHERE s.user_id = ?
    `).all(userId);

    // 2. All schedule days
    const scheduleDays = db.prepare(`
      SELECT * FROM schedule_days 
      WHERE user_id = ? 
      ORDER BY date ASC
    `).all(userId);

    // 3. Quiz attempts
    const quizAttempts = db.prepare(`
      SELECT q.*, s.name as subject_name, t.name as topic_name
      FROM quiz_attempts q
      JOIN topics t ON q.topic_id = t.id
      JOIN subjects s ON t.subject_id = s.id
      WHERE q.user_id = ?
      ORDER BY q.date ASC
    `).all(userId);

    // --- CHART 1: Daily Completion % ---
    // For past days up to today, calculate % of planned minutes marked as 'done'
    const dailyCompletion = [];
    let cumulativeDoneMinutes = 0;
    let cumulativePlannedMinutes = 0;

    for (const day of scheduleDays) {
      const planned = JSON.parse(day.planned_items || '[]');
      const actual = JSON.parse(day.actual_completed || '[]');
      const dayTotalAllocated = planned.reduce((sum, p) => sum + (p.allocated_minutes || 0), 0);
      
      const doneMinutes = actual
        .filter(a => a.status === 'done')
        .reduce((sum, a) => sum + (Number(a.minutes_done) || 0), 0);

      cumulativePlannedMinutes += dayTotalAllocated;
      cumulativeDoneMinutes += doneMinutes;

      const completionPercent = dayTotalAllocated > 0 
        ? Math.min(100, Math.round((doneMinutes / dayTotalAllocated) * 100))
        : (day.date <= todayStr ? 100 : 0);

      dailyCompletion.push({
        date: day.date,
        completion_percent: completionPercent,
        planned_minutes: dayTotalAllocated,
        done_minutes: doneMinutes,
        is_today: day.date === todayStr
      });
    }

    // --- CHART 2: Backlog Trend ---
    // Tracks accumulated backlog minutes and incomplete topic counts over days
    const backlogTrend = [];
    let runningBacklogMinutes = 0;

    for (const day of scheduleDays) {
      const planned = JSON.parse(day.planned_items || '[]');
      const actual = JSON.parse(day.actual_completed || '[]');
      const completedIds = new Set(actual.filter(a => a.status === 'done').map(a => a.topic_id));

      if (day.date < todayStr) {
        let dayMissedMinutes = 0;
        let dayMissedCount = 0;
        for (const p of planned) {
          if (!completedIds.has(p.topic_id)) {
            dayMissedMinutes += (p.allocated_minutes || 60);
            dayMissedCount++;
          }
        }
        runningBacklogMinutes = Math.max(0, runningBacklogMinutes + dayMissedMinutes);
        backlogTrend.push({
          date: day.date,
          backlog_minutes: runningBacklogMinutes,
          backlog_hours: Number((runningBacklogMinutes / 60).toFixed(1)),
          missed_topics: dayMissedCount
        });
      } else if (day.date === todayStr) {
        // Today's backlog status after replan drops towards 0
        backlogTrend.push({
          date: day.date,
          backlog_minutes: runningBacklogMinutes,
          backlog_hours: Number((runningBacklogMinutes / 60).toFixed(1)),
          missed_topics: 0
        });
      }
    }

    // --- CHART 3: Quiz Score Trend (per subject over time) ---
    // Group quiz attempts chronologically
    const quizScoreTrend = [];
    for (const attempt of quizAttempts) {
      const dateStr = attempt.date.split('T')[0];
      const percent = Math.round((attempt.score / attempt.total_questions) * 100);
      quizScoreTrend.push({
        date: dateStr,
        subject: attempt.subject_name,
        topic: attempt.topic_name,
        score: percent
      });
    }

    // --- CHART 4: Burn-Down Chart ---
    // Total remaining workload vs available days to exam
    const totalSyllabusMinutes = topics.reduce((sum, t) => sum + (t.estimated_minutes || 60), 0);
    const burndown = [];
    let remainingMinutes = totalSyllabusMinutes;

    // Daily burn-down target
    const totalDaysCount = Math.max(1, scheduleDays.length);
    const idealBurnRate = totalSyllabusMinutes / totalDaysCount;

    scheduleDays.forEach((day, index) => {
      const actual = JSON.parse(day.actual_completed || '[]');
      const completedToday = actual
        .filter(a => a.status === 'done')
        .reduce((sum, a) => sum + (Number(a.minutes_done) || 60), 0);

      if (day.date <= todayStr) {
        remainingMinutes = Math.max(0, remainingMinutes - completedToday);
      }

      const idealRemaining = Math.max(0, Math.round(totalSyllabusMinutes - (idealBurnRate * (index + 1))));

      burndown.push({
        date: day.date,
        actual_remaining_minutes: day.date <= todayStr ? remainingMinutes : null,
        actual_remaining_hours: day.date <= todayStr ? Number((remainingMinutes / 60).toFixed(1)) : null,
        ideal_remaining_hours: Number((idealRemaining / 60).toFixed(1))
      });
    });

    // --- CHART 5: Subject-wise Mastery Bar Chart ---
    // % topics completed + avg quiz score per subject
    const subjectMastery = subjects.map(s => {
      const sTopics = topics.filter(t => t.subject_id === s.id);
      const totalSTopics = sTopics.length;
      const doneSTopics = sTopics.filter(t => t.status === 'done').length;
      const deferredSTopics = sTopics.filter(t => t.status === 'deferred').length;
      const skimSTopics = sTopics.filter(t => t.status === 'skim_only').length;

      const avgMastery = totalSTopics > 0
        ? Math.round(sTopics.reduce((sum, t) => sum + (t.mastery_score || 0), 0) / totalSTopics)
        : 0;

      const completionPercent = totalSTopics > 0
        ? Math.round((doneSTopics / totalSTopics) * 100)
        : 0;

      return {
        subject_id: s.id,
        subject_name: s.name,
        total_topics: totalSTopics,
        done_topics: doneSTopics,
        deferred_topics: deferredSTopics,
        skim_topics: skimSTopics,
        completion_percent: completionPercent,
        avg_mastery_score: avgMastery
      };
    });

    // Summary KPIs
    const totalTopicsCount = topics.length;
    const doneTopicsCount = topics.filter(t => t.status === 'done').length;
    const deferredTopicsCount = topics.filter(t => t.status === 'deferred').length;
    const skimTopicsCount = topics.filter(t => t.status === 'skim_only').length;
    const daysToExam = Math.max(0, daysBetween(todayStr, user.exam_date));
    
    const overallMastery = totalTopicsCount > 0
      ? Math.round(topics.reduce((sum, t) => sum + (t.mastery_score || 0), 0) / totalTopicsCount)
      : 0;

    const totalHoursCompleted = Number((cumulativeDoneMinutes / 60).toFixed(1));
    const totalHoursPlanned = Number((cumulativePlannedMinutes / 60).toFixed(1));

    return res.json({
      summary: {
        exam_name: user.exam_name,
        exam_date: user.exam_date,
        days_to_exam: daysToExam,
        max_daily_hours: user.max_daily_hours,
        total_topics: totalTopicsCount,
        done_topics: doneTopicsCount,
        deferred_topics: deferredTopicsCount,
        skim_topics: skimTopicsCount,
        overall_mastery: overallMastery,
        hours_completed: totalHoursCompleted,
        hours_planned: totalHoursPlanned,
        current_backlog_minutes: runningBacklogMinutes
      },
      charts: {
        daily_completion: dailyCompletion,
        backlog_trend: backlogTrend,
        quiz_score_trend: quizScoreTrend,
        burndown: burndown,
        subject_mastery: subjectMastery
      }
    });
  } catch (err) {
    console.error('Dashboard error:', err);
    return res.status(500).json({ error: 'Failed to aggregate dashboard data.' });
  }
});

module.exports = router;
