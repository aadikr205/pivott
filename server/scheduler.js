/**
 * Pivott Core Re-Adjustment & Dynamic Scheduler Engine
 * Implements Section 6 exact specification with hard daily hour caps,
 * priority scoring, skim compression, and overflow deferrals.
 */

// Helper to format date as YYYY-MM-DD
function formatDate(date) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Calculate number of calendar days between two dates
function daysBetween(startDateStr, endDateStr) {
  const start = new Date(startDateStr);
  const end = new Date(endDateStr);
  const diffTime = end.getTime() - start.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// Get list of active study dates between today and examDate, excluding off_days
function getAvailableDates(startDateStr, endDateStr, offDays = [0]) {
  const dates = [];
  const start = new Date(startDateStr);
  const end = new Date(endDateStr);
  const offDaySet = new Set((offDays || []).map(Number));

  // Loop from start date up to the day before exam date (or exam date itself)
  const current = new Date(start);
  while (current < end) {
    const dayOfWeek = current.getDay(); // 0 = Sun, 1 = Mon, ...
    if (!offDaySet.has(dayOfWeek)) {
      dates.push(formatDate(current));
    }
    current.setDate(current.getDate() + 1);
  }
  return dates;
}

/**
 * Re-adjustment algorithm implementing Section 6 exact specification
 * 
 * @param {Object} user - { id, max_daily_hours, off_days, buffer_days_percent }
 * @param {Array} topics - Array of Topic records
 * @param {string} todayStr - YYYY-MM-DD
 * @param {string} examDateStr - YYYY-MM-DD
 * @returns {Object} { scheduleDays, deferred, compressed, diffSummary, remainingCapacityMinutes, totalWorkloadMinutes }
 */
function replanSchedule(user, topics, todayStr, examDateStr) {
  const maxDailyHours = Number(user.max_daily_hours) || 6.0;
  const maxDailyMinutes = Math.round(maxDailyHours * 60);
  const offDays = typeof user.off_days === 'string' ? JSON.parse(user.off_days) : (user.off_days || [0]);
  const bufferPercent = Number(user.buffer_days_percent) || 0.10;

  // 1. Available days
  const allAvailableDates = getAvailableDates(todayStr, examDateStr, offDays);
  const totalAvailableDays = allAvailableDates.length;

  if (totalAvailableDays === 0) {
    return {
      scheduleDays: [],
      deferred: topics.filter(t => t.status !== 'done'),
      compressed: [],
      diffSummary: {
        totalDays: 0,
        plannedDays: 0,
        bufferDays: 0,
        keptCount: 0,
        compressedCount: 0,
        deferredCount: topics.length,
        maxDailyHours
      }
    };
  }

  // Reserve buffer days at the end for final revision if we have enough days
  let bufferDayCount = 0;
  if (totalAvailableDays >= 5) {
    bufferDayCount = Math.max(1, Math.floor(totalAvailableDays * bufferPercent));
  }
  const studyDates = allAvailableDates.slice(0, totalAvailableDays - bufferDayCount);
  const bufferDates = allAvailableDates.slice(totalAvailableDays - bufferDayCount);

  // If study dates is empty (e.g. only 1-2 days left), use all available dates
  const effectiveDates = studyDates.length > 0 ? studyDates : allAvailableDates;
  const remainingDays = effectiveDates.length;
  const remainingCapacityMinutes = remainingDays * maxDailyMinutes;

  // 2. Incomplete topics
  const incompleteTopics = topics.filter(t => t.status !== 'done');
  const daysToExam = Math.max(1, daysBetween(todayStr, examDateStr));

  // 3. Priority scoring: weightage * (1 + urgency) * (1 + masteryGap)
  const scoredTopics = incompleteTopics.map(t => {
    const weightage = Number(t.weightage) || 3;
    const masteryScore = Number(t.mastery_score) || 0;
    const urgency = 1 / Math.max(1, daysToExam);
    const masteryGap = 1 - (masteryScore / 100);
    const priorityScore = weightage * (1 + urgency) * (1 + masteryGap);

    return {
      ...t,
      weightage,
      mastery_score: masteryScore,
      priority_score: priorityScore,
      // preserve remaining time if partially done
      estimated_minutes: Math.max(15, Number(t.estimated_minutes) || 60)
    };
  });

  // Sort by priority_score descending
  scoredTopics.sort((a, b) => b.priority_score - a.priority_score);

  const totalWorkloadMinutes = scoredTopics.reduce((sum, t) => sum + t.estimated_minutes, 0);

  let plannedTopics = [];
  let deferred = [];
  let compressed = [];

  // 4. Allocation with capacity constraint
  if (totalWorkloadMinutes <= remainingCapacityMinutes) {
    // No deficit: all topics fit comfortably
    plannedTopics = scoredTopics.map(t => ({
      ...t,
      planned_minutes: t.estimated_minutes,
      plan_status: t.status === 'skim_only' ? 'skim_only' : 'in_progress'
    }));
  } else {
    // Deficit exists: fill by priority until capacity exhausted
    let usedMinutes = 0;
    for (const t of scoredTopics) {
      if (usedMinutes + t.estimated_minutes <= remainingCapacityMinutes) {
        plannedTopics.push({
          ...t,
          planned_minutes: t.estimated_minutes,
          plan_status: 'in_progress'
        });
        usedMinutes += t.estimated_minutes;
      } else if (usedMinutes + Math.round(t.estimated_minutes * 0.3) <= remainingCapacityMinutes) {
        // Compress: allow "skim only" quick revision mode at 30% time
        const skimMinutes = Math.max(15, Math.round(t.estimated_minutes * 0.3));
        plannedTopics.push({
          ...t,
          planned_minutes: skimMinutes,
          plan_status: 'skim_only'
        });
        usedMinutes += skimMinutes;
        compressed.push(t.id);
      } else {
        // Overflow: mark as deferred
        deferred.push({
          ...t,
          status: 'deferred'
        });
      }
    }
  }

  // 5. Distribute planned topics across effectiveDates
  // Rule: Never exceed maxDailyMinutes on any single day!
  const dayBuckets = effectiveDates.map(date => ({
    date,
    capacityRemaining: maxDailyMinutes,
    planned_items: []
  }));

  // Helper to pack items evenly across days
  let currentDayIdx = 0;
  for (const item of plannedTopics) {
    let itemRemainingMinutes = item.planned_minutes;

    while (itemRemainingMinutes > 0) {
      if (currentDayIdx >= dayBuckets.length) {
        // Fallback: if all days reached max capacity, defer whatever couldn't fit
        if (!deferred.find(d => d.id === item.id)) {
          deferred.push({ ...item, status: 'deferred' });
        }
        break;
      }

      const day = dayBuckets[currentDayIdx];
      if (day.capacityRemaining <= 0) {
        currentDayIdx++;
        continue;
      }

      const minutesToAllocate = Math.min(itemRemainingMinutes, day.capacityRemaining);
      day.planned_items.push({
        topic_id: item.id,
        topic_name: item.name,
        subject_id: item.subject_id,
        weightage: item.weightage,
        mastery_score: item.mastery_score,
        allocated_minutes: minutesToAllocate,
        status: item.plan_status
      });

      day.capacityRemaining -= minutesToAllocate;
      itemRemainingMinutes -= minutesToAllocate;

      if (day.capacityRemaining === 0) {
        currentDayIdx++;
      }
    }
  }

  // 6. Smart High-Weightage Buffer & Early-Completion Revision Engine
  // Sort high-yield topics (weightage >= 4 or top weightage): lowest mastery score first (weakest needs boost), then highest weightage
  const revisionPool = [...topics].sort((a, b) => {
    // Priority 1: Lowest mastery score first
    const masteryDiff = (Number(a.mastery_score) || 0) - (Number(b.mastery_score) || 0);
    if (masteryDiff !== 0) return masteryDiff;
    // Priority 2: Highest weightage
    return (Number(b.weightage) || 3) - (Number(a.weightage) || 3);
  });

  let revCursor = 0;
  const pickRevisionTopic = () => {
    if (revisionPool.length === 0) return null;
    const item = revisionPool[revCursor % revisionPool.length];
    revCursor++;
    return item;
  };

  // Populate days where syllabus completed early (leaving whole empty days before exam)
  for (const day of dayBuckets) {
    if (day.planned_items.length === 0 && day.capacityRemaining >= 45) {
      day.is_early_completion_revision = true;
      while (day.capacityRemaining >= 45 && revisionPool.length > 0 && day.planned_items.length < 3) {
        const revTopic = pickRevisionTopic();
        if (!revTopic) break;
        const revMinutes = Math.min(day.capacityRemaining, 60);
        day.planned_items.push({
          topic_id: revTopic.id,
          topic_name: revTopic.name,
          subject_id: revTopic.subject_id,
          weightage: revTopic.weightage,
          mastery_score: revTopic.mastery_score,
          allocated_minutes: revMinutes,
          status: 'revision',
          is_revision: true,
          revision_note: `High-Yield Revision & 10-Yr PYQs (${revTopic.weightage}/5 Focus, Mastery: ${revTopic.mastery_score || 0}%)`
        });
        day.capacityRemaining -= revMinutes;
      }
    }
  }

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  function attachTimeSlots(items, baseHour = 9) {
    let currentStartM = baseHour * 60;
    return items.map(item => {
      const duration = item.allocated_minutes || 45;
      const startM = currentStartM;
      const endM = startM + duration;
      currentStartM = endM + 10; // 10-minute rest buffer between topics

      const formatT = (totalM) => {
        const h = Math.floor(totalM / 60) % 24;
        const m = totalM % 60;
        const ampm = h >= 12 ? 'PM' : 'AM';
        const displayH = h % 12 || 12;
        return `${String(displayH).padStart(2, '0')}:${String(m).padStart(2, '0')} ${ampm}`;
      };

      return {
        ...item,
        start_time: formatT(startM),
        end_time: formatT(endM),
        time_slot: `${formatT(startM)} - ${formatT(endM)}`
      };
    });
  }

  // Also include buffer days packed with high-yield revision and PYQ sessions
  const finalScheduleDays = dayBuckets.map(b => {
    const dObj = new Date(b.date);
    const dayName = isNaN(dObj.getTime()) ? '' : dayNames[dObj.getDay()];
    return {
      date: b.date,
      day_name: dayName,
      planned_items: attachTimeSlots(b.planned_items, 9),
      is_buffer: false,
      is_revision: b.is_early_completion_revision || false,
      total_allocated_minutes: maxDailyMinutes - b.capacityRemaining
    };
  });

  for (const bDate of bufferDates) {
    const bufferItems = [];
    let bufCap = maxDailyMinutes;
    // Allocate 2 high-yield revision slots per buffer day
    while (bufCap >= 60 && revisionPool.length > 0 && bufferItems.length < 3) {
      const revTopic = pickRevisionTopic();
      if (!revTopic) break;
      const revMinutes = Math.min(bufCap, 60);
      bufferItems.push({
        topic_id: revTopic.id,
        topic_name: revTopic.name,
        subject_id: revTopic.subject_id,
        weightage: revTopic.weightage,
        mastery_score: revTopic.mastery_score,
        allocated_minutes: revMinutes,
        status: 'revision',
        is_revision: true,
        revision_note: `Buffer Day Revision & 10-Yr PYQs (Focus: ${revTopic.weightage}/5, Mastery: ${revTopic.mastery_score || 0}%)`
      });
      bufCap -= revMinutes;
    }

    const bObj = new Date(bDate);
    const bDayName = isNaN(bObj.getTime()) ? '' : dayNames[bObj.getDay()];

    finalScheduleDays.push({
      date: bDate,
      day_name: bDayName,
      planned_items: attachTimeSlots(bufferItems, 10),
      is_buffer: true,
      is_revision: true,
      total_allocated_minutes: maxDailyMinutes - bufCap,
      note: 'Buffer & High-Yield Comprehensive Revision Day'
    });
  }

  const diffSummary = {
    totalAvailableDays,
    studyDays: effectiveDates.length,
    bufferDays: bufferDates.length,
    remainingCapacityMinutes,
    totalWorkloadMinutes,
    keptCount: plannedTopics.length - compressed.length,
    compressedCount: compressed.length,
    deferredCount: deferred.length,
    maxDailyHours,
    isDeficit: totalWorkloadMinutes > remainingCapacityMinutes,
    hasRevisionDays: bufferDates.length > 0 || dayBuckets.some(d => d.is_early_completion_revision)
  };

  return {
    scheduleDays: finalScheduleDays,
    deferred,
    compressed,
    diffSummary
  };
}

// Dedicated helper to generate high-yield revision recommendations for remaining time
function getRevisionSuggestions(topics = [], remainingDays = 7) {
  const highYield = [...topics]
    .sort((a, b) => {
      // 1. Lowest mastery score first
      const masteryA = Number(a.mastery_score) || 0;
      const masteryB = Number(b.mastery_score) || 0;
      if (masteryA !== masteryB) return masteryA - masteryB;
      // 2. Highest weightage next
      return (Number(b.weightage) || 3) - (Number(a.weightage) || 3);
    })
    .slice(0, Math.min(10, Math.max(3, remainingDays * 2)));

  return highYield.map((t, idx) => ({
    rank: idx + 1,
    topic_id: t.id,
    topic_name: t.name,
    subject_name: t.subject_name || 'Subject',
    weightage: t.weightage || 3,
    mastery_score: t.mastery_score || 0,
    priority: (t.weightage || 3) >= 4 ? 'High Yield' : 'Standard',
    recommended_action: (t.mastery_score || 0) < 50 
      ? 'Solve 10-Yr PYQs and take adaptive quiz to boost mastery above 75%'
      : 'Quick skim formula revision & 1 timed mock set',
    recommended_minutes: (t.weightage || 3) >= 4 ? 60 : 45
  }));
}

module.exports = {
  formatDate,
  daysBetween,
  getAvailableDates,
  replanSchedule,
  getRevisionSuggestions
};

