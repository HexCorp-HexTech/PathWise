# PathWise — System Architecture

PathWise is a **frontend-only, offline-first** Progressive Web App (PWA) for adaptive K-10 education. All core intelligence—BKT mastery, SM-2 scheduling, weakness scoring, and AI content generation—runs entirely in the browser. Optional AI features are powered by Vercel Serverless Functions that proxy Gemini and ElevenLabs APIs.

---

## 1. System Topology

```
┌─────────────────────────────────────────────────────────┐
│                   Browser (Client Only)                 │
│                                                         │
│   React 19 + TypeScript + Vite                          │
│   ┌─────────────┐  ┌──────────────┐  ┌──────────────┐  │
│   │ Student UI  │  │  Teacher UI  │  │  Parent UI   │  │
│   └──────┬──────┘  └──────┬───────┘  └──────┬───────┘  │
│          └────────────────┼──────────────────┘          │
│                    ┌──────▼──────┐                      │
│                    │   Zustand   │  (In-memory state)   │
│                    └──────┬──────┘                      │
│                    ┌──────▼──────┐                      │
│                    │  Dexie.js   │  (IndexedDB store)   │
│                    └─────────────┘                      │
└─────────────────────────────────────────────────────────┘
              │ fetch /api/*
┌─────────────▼──────────────────────────────────────────┐
│            Vercel Serverless Functions (Edge)           │
│   /api/tts  /api/parse-syllabus                         │
│   /api/fetch-syllabus  /api/generate-chapter-content    │
└─────────────┬──────────────────────────────────────────┘
              │
    ┌─────────▼──────────┐
    │   External APIs    │
    │  Gemini 1.5 Flash  │
    │  ElevenLabs TTS    │
    └────────────────────┘
```

---

## 2. Directory Structure

```
pathwise/
├── api/                          # Vercel Serverless Functions
│   ├── tts.js                    # ElevenLabs TTS proxy
│   ├── fetch-syllabus.js         # URL scraper & HTML stripper
│   ├── parse-syllabus.js         # Gemini syllabus parser
│   └── generate-chapter-content.js  # Gemini chapter content generator
├── src/
│   ├── main.tsx                  # Application entrypoint
│   ├── App.tsx                   # Routing + ErrorBoundary shell
│   ├── index.css                 # Design tokens (CSS variables) + global styles
│   ├── types/index.ts            # TypeScript interfaces (Quiz, BKT, User, SM2…)
│   ├── lib/
│   │   ├── db.ts                 # Dexie.js DB schema & table definitions
│   │   ├── bkt.ts                # Bayesian Knowledge Tracing (BKT) engine
│   │   ├── sm2.ts                # SuperMemo-2 spaced repetition scheduler
│   │   ├── compute-mastery.ts    # Chapter mastery aggregation (BKT + quiz scores)
│   │   ├── weakness.ts           # Weakness scoring and subject name parsing
│   │   ├── ai-engine.ts          # Rule-based offline quiz/flashcard generator
│   │   ├── markdown-utils.ts     # AI JSON → Markdown converter (offline notes)
│   │   ├── voice.ts              # TTS speech synthesis wrapper
│   │   └── utils.ts              # Helpers: generateId, xpToLevel, clamp, formatTime
│   ├── store/
│   │   ├── appStore.ts           # App-wide state (theme, language, isMobile)
│   │   └── authStore.ts          # Auth sessions, user profiles, onboarding
│   ├── components/
│   │   ├── ErrorBoundary.tsx     # React error boundary with recovery UI
│   │   ├── ui/                   # Buttons, Cards, Progress, Modal primitives
│   │   ├── mascot/               # Gyani owl SVG with speech bubbles
│   │   └── layout/               # AppShell, sidebar, bottom nav
│   └── pages/
│       ├── Landing.tsx           # Marketing / feature showcase page
│       ├── auth/Auth.tsx         # Login, signup, PIN gate, onboarding wizard
│       ├── student/
│       │   ├── Dashboard.tsx     # Student home: XP, streak, recommendations
│       │   ├── Subjects.tsx      # Chapter browser, notes viewer, offline banner
│       │   ├── Quiz.tsx          # Adaptive quiz engine with BKT updates
│       │   ├── Flashcards.tsx    # SM-2 spaced repetition flashcard reviewer
│       │   ├── AIChat.tsx        # AI tutor chat session
│       │   └── Progress.tsx      # Mastery charts and analytics
│       ├── teacher/              # Classroom manager, assignment creator
│       └── parent/
│           ├── Dashboard.tsx     # Child progress overview
│           └── WeeklyReport.tsx  # Weekly study report with strength/weakness analysis
├── documentation/                # Technical docs (this file and more)
├── public/                       # Static assets (icons, favicon, manifest)
├── vercel.json                   # Vercel build + routing configuration
└── vite.config.ts                # Vite build config + dev API middleware
```

---

## 3. Tech Stack

| Layer | Technology | Reason |
|---|---|---|
| UI Framework | React 19 + TypeScript | Hooks, strict types, component reuse |
| Build Tool | Vite 8 | Fast HMR, ESM-native bundling |
| Client State | Zustand | Lightweight, no boilerplate, persists via `localStorage` |
| Local Storage | Dexie.js (IndexedDB) | Transactional, Promise-based, schema versioning |
| Routing | React Router v7 | SPA routing with auth guards |
| Styling | Vanilla CSS + CSS Variables | Zero-runtime, design token system |
| AI Content | Gemini 1.5 Flash (via Vercel) | Chapter notes, quiz, flashcards |
| TTS | ElevenLabs Multilingual v2 (via Vercel) | Hindi + English voice support |
| Deployment | Vercel | SPA + serverless functions in one platform |

---

## 4. Adaptive Learning Data Flow

```
Student answers question
         │
         ▼
Quiz.tsx scores answer
         │
         ├──► updateBKT()  → writes bktMastery to IndexedDB
         ├──► computeWeaknessScore() → writes weaknessScores to IndexedDB
         └──► updateStudentProfile()  → XP via xpToLevel(), streak via UTC date comparison
```

All updates are **synchronous to IndexedDB** — no network round-trip needed.

---

## 5. Offline Behaviour

| Feature | Online | Offline |
|---|---|---|
| Curriculum browse | ✅ IndexedDB | ✅ IndexedDB |
| Chapter notes (AI) | ✅ Gemini API | ✅ Rule-based fallback (`ai-engine.ts`) |
| Flashcards | ✅ Cached in IndexedDB | ✅ Cached |
| Quiz | ✅ Cached questions | ✅ AI generates from fallback engine |
| TTS audio | ✅ ElevenLabs API | ❌ Error toast shown, no blocking alert |
| Syllabus import | ✅ Fetch + Gemini | ⚠️ Manual entry still works |

---

## 6. Error Handling

- **`ErrorBoundary.tsx`**: Wraps the entire React tree. Catches runtime crashes and shows a recovery screen with a "Reload App" button. Prevents white-screen failures.
- **TTS errors**: Displayed as 3-second non-blocking toast notifications (replaced all `alert()` calls).
- **API failures**: Handled gracefully with fallback content; no unhandled promise rejections.
- **Missing DB records**: All Dexie queries use `.first()` / `.toArray()` with null checks to prevent crashes.
