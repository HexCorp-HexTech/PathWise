# PathWise — Teacher Dashboard Architecture

The Teacher Dashboard gives educators a real-time, data-driven view of their classroom. All data is sourced from the local IndexedDB — no network request is needed to load the dashboard.

---

## 1. Dashboard Sections

```
Teacher Dashboard
├── 1. Classroom Overview Cards      ← aggregate stats across all linked students
├── 2. Student Progress Grid         ← per-student mastery heatmap by chapter
├── 3. At-Risk Alerts Panel          ← students with weakness score W > 0.7
├── 4. Assignment Manager            ← create & track chapter-specific quiz assignments
└── 5. Doubt Room                    ← moderated Q&A threads per chapter
```

---

## 2. Metric Aggregation

On dashboard load, the teacher's page fetches all students linked to their `schoolCode` from the `users` table and computes aggregate statistics:

| Metric | Source | Computation |
|---|---|---|
| **Average Mastery** | `bktMastery` | Average `pKnow` across all chapters for all students |
| **At-Risk Count** | `weaknessScores` | Count of students where `W > 0.7` |
| **Active This Week** | `quizAttempts` | Distinct `userId` values with `startedAt` in last 7 days |
| **Unresolved Doubts** | `doubtPosts` | Count where `status === 'open'` |

---

## 3. Student Progress Heatmap

The heatmap renders a `student × chapter` grid where each cell is coloured by mastery level:

```
          Ch1    Ch2    Ch3    Ch4    Ch5
Aarav    [██]   [██]   [▓▓]   [░░]   [  ]
Priya    [██]   [▓▓]   [██]   [██]   [▓▓]
Rohit    [░░]   [░░]   [  ]   [  ]   [  ]   ← At Risk
```

**Colour scale:**
| Colour | Mastery Range | Meaning |
|---|---|---|
| 🟢 Green `#10B981` | 80–100% | Mastered |
| 🟡 Amber `#F59E0B` | 50–79% | Progressing |
| 🔴 Red `#EF4444` | < 50% | Needs help |
| ⬜ Grey | 0% / no attempts | Not started |

**Data query per cell:**
```typescript
const records = await db.bktMastery
  .where('userId').equals(studentId)
  .and(r => r.chapterId === chapterId)
  .toArray();
const mastery = records.length > 0
  ? records.reduce((s, r) => s + r.pKnow, 0) / records.length
  : 0;
```

---

## 4. At-Risk Detection

Students are flagged **High Risk** when their composite weakness score exceeds the threshold:

$$W > 0.7$$

The weakness score $W \in [0, 1]$ is computed in `src/lib/weakness.ts`:

$$W = 0.35 \cdot (1-\text{perf}) + 0.30 \cdot (1-\text{BKT}) + 0.15 \cdot \text{timeRatio} + 0.20 \cdot \text{variance}$$

At-risk students are shown in a red-highlighted alert panel with a direct link to their individual progress view.

---

## 5. Assignment Manager

Teachers can create assignments that push a specific chapter's quiz to students:

1. Select a chapter from the curriculum browser
2. Set a due date
3. Save → writes an `assignments` record to IndexedDB

Students see pending assignments on their dashboard under "My Tasks". On completion, an `assignmentSubmissions` record is created with the score. The teacher sees a completion % badge on each assignment card.

---

## 6. Doubt Room

Each chapter has a dedicated doubt thread. Students post questions as `doubtPosts` records. Teachers see all open posts across all chapters sorted by `createdAt`.

- Teachers can reply (creates a `doubtReplies` record) and mark a post as `'resolved'`
- Resolved posts collapse in the UI but remain searchable
- Students get visual feedback (green checkmark) when their doubt is resolved

---

## 7. Data Loading Pattern

To avoid N+1 queries (one DB call per student), the teacher dashboard loads all data in a single batch:

```typescript
// Load all students for this school code
const students = await db.users
  .where('role').equals('student').toArray();

// Load all bktMastery records for all students in one call
const allBkt = await db.bktMastery
  .where('userId').anyOf(students.map(s => s.id))
  .toArray();

// Build mastery map in memory
const masteryMap = new Map<string, Map<string, number>>();
// ... group by studentId + chapterId, compute averages in JS
```

This ensures the dashboard loads in a single render cycle regardless of classroom size.
