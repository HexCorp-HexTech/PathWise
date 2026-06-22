Pathwise

An offline-first adaptive learning platform for Classes 1–10 (CBSE / ICSE / State Board MH)

Pathwise personalises education for every student by tracking concept-level mastery, adjusting question difficulty in real time, and delivering curriculum-aligned content that works with or without an internet connection. Teachers get a live dashboard showing exactly where each student is struggling before it becomes a problem.

Problem Statement
Indian classrooms teach to the average. A student who hasn't grasped quadratic equations moves on with the rest of the class anyway, and the gap compounds silently. Quality tutoring exists but is expensive and geographically concentrated. Existing edtech platforms either require constant internet, use generic AI-generated content that drifts from board syllabi, or offer passive video consumption with no adaptive feedback loop. No lightweight, truly offline tool exists that combines personalised mastery tracking with curriculum-accurate content for the K-10 segment.

Proposed Solution
Pathwise is a Progressive Web App that runs almost entirely on the student's device. Core intelligence — mastery tracking, difficulty adaptation, spaced repetition scheduling, weakness diagnosis — executes client-side so the experience is identical online or offline. Content is compiled deterministically from a curated Knowledge Graph seeded from real CBSE/ICSE/MH curricula, so there are no hallucinated formulas or off-syllabus questions. An AI tutor ("Gyani") handles concept lookups, step-by-step math solving, and doubt queries, routing to structured knowledge first and a streaming chat endpoint as fallback.

Tech Stack
LayerTechnologyWhyFrontendReact 19 + TypeScript + ViteHook boundaries, strict typing across quiz/BKT schemasStateZustandLightweight atomic store; separates transient UI flags from DB callsLocal DBDexie.js (IndexedDB)Promise-based wrapper with compound indexes, transactional consistency, schema versioningStylingCustom CSS Design Token SystemCSS root variables for instant light/dark theming; no runtime overheadPWAVite PWA plugin + Service WorkerInstall on any device; offline asset cachingSyncREST endpoints (/api/sync/push, /api/sync/pull)Optional remote sync via a versioned transaction queueAI ChatAnthropic-compatible streaming SSE (/api/ai/chat/stream)Real-time tutor responsesContentStatic Knowledge Graph (curriculum-data.ts)Deterministic, board-aligned, validated — no runtime hallucinationsDeploymentVercelStatic frontend + serverless API routes, zero-server cost

Architecture
Pathwise is an offline-first client-first PWA. All adaptive calculations run in the browser:
React Pages (Student / Teacher / Parent)
        ↕
  Zustand Store  (in-memory UI state)
        ↕
  Dexie.js / IndexedDB  (persistent local storage)
        ↓
  Sync Queue  →  Service Worker  →  Remote Sync API  (optional)
The backend is intentionally thin — it handles authentication, optional sync, and the AI chat stream. No core learning logic lives server-side.

Database (IndexedDB via Dexie.js)
All stores are local-first. Key stores and their purpose:
StorePurposeusersStudent / Teacher / Parent profiles, roles, language, themestudentProfilesGrade, board, ZPD difficulty level, XP, streak countersbktMasteryPer-skill BKT mastery probability (pKnow) and attempt countweaknessScoresComposite weakness score per chapter (performance + BKT + speed + consistency)sm2CardsSpaced repetition state per flashcard (easiness factor, interval, next review date)quizAttemptsQuiz history with scores and time takenflashcardsStatic flashcard content per chapterchatSessions / chatMessagesAI tutor conversation historydoubtPosts / doubtRepliesClassroom doubt forum threadsassignments / assignmentSubmissionsTeacher-created assignments and student submissionssyncQueueOutgoing operations queued for remote sync (CREATE / UPDATE / DELETE)earnedAchievementsBadge records per studentvoiceCacheCached TTS audio blobs to avoid re-synthesis
Compound indexes (e.g. [userId+chapterId+skillId]) allow fast composite lookups without a relational DB.

API Endpoints
Authentication
MethodEndpointDescriptionPOST/api/auth/student/signupPIN-based registration → returns JWT + studentProfilePOST/api/auth/student/loginPIN loginPOST/api/auth/teacher/signupEmail + password + verified School Code
Content & AI
MethodEndpointDescriptionPOST/api/content/generateCompile notes, quiz questions, flashcard deck for a chapterPOST/api/ai/chat/streamSSE streaming endpoint for AI Tutor (Gyani) responses
Sync
MethodEndpointDescriptionPOST/api/sync/pushSubmit local sync queue (inserts, updates, deletes) to remotePOST/api/sync/pullFetch server operations since last transaction version marker

Core Adaptive Systems
Bayesian Knowledge Tracing (BKT)
Models each student's mastery of a concept as a Hidden Markov Model with four parameters — prior knowledge P(L₀), learning rate P(T), slip P(S), and guess P(G). After every quiz response, the system updates the mastery probability and computes whether the student has crossed the 95% mastery threshold.
SM-2 Spaced Repetition
Flashcards are scheduled using the SuperMemo-2 algorithm. Students rate recall quality (0–5); the system updates the Easiness Factor and calculates the next review interval. Retention probability is estimated via a forgetting curve for study plan analytics.
Dynamic Difficulty Adaptation (ZPD Engine)
Targets a 65–80% success rate (Zone of Proximal Development). Adjusts question difficulty based on the last 3 quiz scores, BKT mastery, learning velocity (trend across sessions), and a time-ratio dampener that halves any upward adjustment if the student is taking >50% longer than expected.
Weakness Scoring
Composite score W ∈ [0, 1] combining: EWMA quiz performance (35%), inverse BKT mastery (30%), speed/time ratio (15%), and score variance (20%). A logarithmic confidence bound prevents triggering interventions on thin evidence. Students scoring W > 0.7 are flagged "High Risk" on the teacher dashboard.
VARK Learning Style Detection
Tracks engagement across activity types (diagram time, TTS playback duration, flashcard swipes, notes scroll time, quiz clicks) and classifies the student into Visual / Auditory / Kinesthetic / Reading modalities using a weighted score matrix. The student dashboard re-orders its blocks dynamically based on the detected preference.
Content Validation Guard
All generated notes and questions pass through a regex filter before display. Any output containing placeholder tokens (placeholder, todo, block_, dummy, lorem) is rejected and replaced with the structured curriculum fallback — students never see scaffold markers.

Authentication Model
RoleMethodStudentNumerical PIN or emoji sequence (no email required)TeacherEmail + Password + verified School Code (e.g. DPS-001)ParentPIN linked to their child's student ID
Route guards enforce role boundaries across all dashboard sections.

Offline Architecture
Conflict resolution uses Client-Wins / Last-Write-Wins. Learning metrics (BKT mastery, SM-2 state, XP) are calculated on-device and trusted by the server on sync. For collaborative areas (doubt rooms, teacher replies), posts sync in chronological order by local createdAt timestamp, with merge logic to prevent reply loss on out-of-order sync.
The sync queue retries failed operations up to 5 times before marking them failed.

Project Structure
/src
├── lib/
│   ├── db.ts              # Dexie.js schema & store definitions
│   ├── bkt.ts             # Bayesian Knowledge Tracing HMM
│   ├── sm2.ts             # SuperMemo-2 spaced repetition
│   ├── difficulty.ts      # ZPD difficulty adaptation engine
│   ├── weakness.ts        # Composite weakness scoring
│   ├── ai-engine.ts       # Knowledge graph solver, content validator, AI router
│   ├── voice.ts           # TTS synthesis wrapper
│   └── utils.ts           # Clamp, ID generators, math helpers
├── store/
│   ├── appStore.ts        # Sidebar, theme, network, language state
│   └── authStore.ts       # Active session, onboarding, roles
├── pages/
│   ├── student/           # Dashboard, curriculum explorer, AI tutor chat
│   ├── teacher/           # Student grid, assignments, classrooms, doubt rooms
│   └── parent/            # Analytics, WhatsApp progress sharing
└── types/index.ts         # Core interfaces (Quiz, BKT, SM2, Sync, User)

Getting Started
bash# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build
# Output: /dist — deploy to Vercel or any static host

# Register service worker
# Ensure sw.js is at the root of the deployment

Scope
Included: Classes 1–10, CBSE / ICSE / State Board MH, Mathematics, Science, English, Hindi and English UI, student/teacher/parent roles, offline-first PWA.