# PIVOTT — AI-Powered Syllabus Backlog & Realistic Time Allocator

> *"Your syllabus, re-balanced daily — never overwhelmed, always on track."*

Pivott is a dynamic study planner for competitive exam (NEET, JEE, UPSC, etc.) and board exam students. Unlike static timetables that shatter after a single missed day, Pivott recalculates the remaining schedule intelligently whenever backlog happens. It uses AI and algorithmic priority scoring to protect high-yield topics and strictly enforces a realistic daily study hour cap — ensuring students never face panic-inducing 12–14 hour catch-up days.

---

## 🌟 Key Features

1. **Intelligent Re-Adjustment Engine (Core Differentiator)**
   - Hard daily hour constraint: never proposes study hours above your maximum cap (e.g. $\le$ 6.0 hrs/day).
   - Priority Scoring formula:
     $$\text{priority\_score} = \text{weightage} \times (1 + \text{urgency}) \times (1 + \text{masteryGap})$$
     where $\text{urgency} = \frac{1}{\max(1, \text{daysUntilExam})}$ and $\text{masteryGap} = 1 - \frac{\text{mastery\_score}}{100}$.
   - Deficit Handling:
     - Fills available days with high-priority topics.
     - Compresses marginal topics to **"Skim Only" (30% time)** quick revision.
     - Safely defers lowest-priority overflow topics (never silently deleted).
   - Reassuring AI Diff Summary: "X topics deferred, Y compressed to skim mode, your daily load stays at $\le$ Z hrs."
   - 100% deterministic and idempotent math.

2. **Calm, Student-First UI & Daily Tracking**
   - Soothing, non-panicky color palette (soft slates, teals, soft ambers).
   - Today's Targets view with timer, status toggles (Done, Partial, Missed).
   - Gentle backlog alert banner with 1-tap **"Re-Plan Now"**.
   - End-of-day review prompt to prevent backlog from snowballing.

3. **Adaptive Quiz Module**
   - 6 exam-level MCQs per topic with instant feedback and concept explanations.
   - Quiz score updates topic `mastery_score` (0–100).
   - If score $< 50\%$, flags topic as "Needs Revision" and boosts its priority in the scheduler!

4. **Progress & Performance Dashboard (5 Live Charts)**
   - **Daily Completion %** (Velocity line/area chart over time).
   - **Backlog Trend** (Tracks accumulated backlog hours, trending down).
   - **Quiz Score Trend** (Chronological active recall score growth per subject).
   - **Syllabus Burn-Down Chart** (Workload hours remaining vs. target pace).
   - **Subject Mastery Bar Chart** (% completed vs. avg quiz retention per subject).

5. **Deferred Syllabus & Audit Trail**
   - Dedicated view for all deferred and skimmed topics.
   - 1-Click "Re-Include in Plan" button to bring deferred topics back when time permits.
   - Complete Re-Plan Audit Log tracking every past timetable recalculation.

6. **Quick 3-Minute Onboarding**
   - Instant presets for:
     - **JEE Main (NTA)** (Physics, Chemistry, Mathematics — high-frequency weightages)
     - **JEE Advanced** (IIT Entrance Advanced syllabus)
     - **NEET 2026** (Medical Entrance)
     - **CBSE 12th Board (PCM)** (Physics, Chemistry, Mathematics)
     - **CBSE 12th Board (PCB)** (Physics, Chemistry, Biology)
     - **CBSE 12th Board (PCMB)** (Physics, Chemistry, Mathematics, Biology)
     - **Class 10th Board Exam** (CBSE & State Boards: Science, Maths, Social Science, English)
     - **Bihar Board 12th (BSEB Inter)** (Physics, Chemistry, Bio/Math, 100M Hindi, 100M English)
     - **Bihar Board 10th (BSEB Matric)** (Science, Maths, Social Science, Hindi, Sanskrit)
   - Custom subject/topic entry with bulk add and CSV import.
   - AI Weightage Suggestion tool to auto-calibrate topic importance based on exam trends.

7. **Bulletproof AI Layer**
   - Supports Anthropic Claude (`ANTHROPIC_API_KEY`) and Google Gemini (`GEMINI_API_KEY`).
   - Rich, high-accuracy deterministic fallbacks for weightage, calm coaching notes, quizzes, and microcopy so the application runs 100% out of the box without requiring API keys.

---

## 🛠️ Architecture & Tech Stack

- **Frontend**: React 19, TypeScript, Vite, TailwindCSS v4, Recharts, Lucide Icons.
- **Backend**: Node.js, Express, Better-SQLite3, JSON Web Tokens (JWT), BcryptJS.
- **Database**: SQLite (ACID-compliant, stored in `server/data/pivott.db`).
- **AI**: Anthropic Messages API / Gemini API with deterministic fallback generators.

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18+) and npm.

### 1. Launch with One Click (Windows)
Double-click `start.bat` in the project root. It will automatically start both the backend API and frontend dev server.

### 2. Manual Terminal Commands

#### Start Backend API
```bash
cd server
npm install
node index.js
```
*The server will start on `http://localhost:5000`.*

#### Start Frontend Client
```bash
cd client
npm install
npm run dev
```
*The frontend will start on `http://localhost:5173`.*

---

## 🧪 Running Automated Tests

A dedicated test suite validates the Section 6 Re-Adjustment algorithm, priority formulas, capacity constraints, idempotency, and AI fallbacks:

```bash
npm test
# OR
node server/test-engine.js
```

---

## 📂 Project Structure

```
pivott/
├── server/
│   ├── index.js             # Express API entrypoint
│   ├── db.js                # SQLite database setup & migrations
│   ├── scheduler.js         # Section 6 Re-Adjustment engine & scheduler
│   ├── ai.js                # AI integration & bulletproof fallbacks
│   ├── test-engine.js       # Core algorithm verification suite
│   ├── routes/
│   │   ├── auth.js          # Signup, Login, JWT verification
│   │   ├── onboarding.js    # Syllabus presets & initial plan generator
│   │   ├── schedule.js      # Today's plan, progress logging, replan trigger
│   │   ├── topics.js        # Topic updates & deferred topic recovery
│   │   ├── quiz.js          # MCQ generation, grading, mastery adaptation
│   │   ├── progress.js      # 5 dashboard chart datasets & summary metrics
│   │   └── ai.js            # Weightage suggestion & microcopy
│   └── .env                 # Server configuration (PORT, JWT, API keys)
├── client/
│   ├── src/
│   │   ├── App.tsx          # Root application component
│   │   ├── components/
│   │   │   ├── Navbar.tsx            # Header with countdown & hours badge
│   │   │   ├── TodayView.tsx         # Daily study targets & stopwatch
│   │   │   ├── ScheduleView.tsx      # Day-by-day timetable & buffer days
│   │   │   ├── DashboardView.tsx     # 5 live Recharts visualizations
│   │   │   ├── BacklogBanner.tsx     # Panic-free backlog notification
│   │   │   ├── ReplanModal.tsx       # AI coach explanation & diff summary
│   │   │   ├── QuizModal.tsx         # MCQ quiz player with explanations
│   │   │   ├── DeferredTopics.tsx    # Deferred reserve list & 1-click re-include
│   │   │   ├── ReplanHistory.tsx     # Re-adjustment audit logs
│   │   │   ├── OnboardingWizard.tsx  # 3-step syllabus & capacity setup
│   │   │   └── AuthModal.tsx         # Fast login / 1-click demo access
│   │   └── api/client.ts             # Typed API client
│   └── vite.config.ts
├── start.bat                # Windows 1-click runner
└── README.md
```

---

## 🔒 Security & Reliability
- Passwords hashed with `bcryptjs`.
- Protected endpoints authenticated with `Bearer` JWT tokens.
- All AI endpoints fail gracefully to rule-based logic if network fails or API quotas expire.
- Database enforces foreign key cascades and WAL journaling for speed and data safety.
