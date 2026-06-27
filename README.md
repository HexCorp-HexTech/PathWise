<div align="center">

# 🧭 PathWise
### *Adaptive AI Learning Platform for K–10 Students*

**Personalised education that works anywhere — online or offline.**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)
![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?style=flat-square&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=flat-square&logo=vite&logoColor=white)
![Offline First](https://img.shields.io/badge/Offline-First-34D399?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-F59E0B?style=flat-square)

</div>

---

## 🔴 The Problem

India educates **260 million** school-age children, but classrooms teach to the average.

A student who hasn't grasped quadratic equations moves on with the rest of the class anyway — the gap compounds silently until it becomes an unrecoverable deficit. Quality tutoring exists, but it is **expensive and geographically concentrated**. Existing edtech platforms face three systemic failures:

| Problem | Impact |
|---|---|
| 🌐 Require constant internet | Rural and semi-urban students (60%+ of India) are locked out |
| 🎲 Generic AI content | Drifts from board syllabi; hallucinated formulas break student trust |
| 📹 Passive consumption | Video lectures give no adaptive feedback loop — students don't know what they don't know |
| 📊 No mastery tracking | Teachers find out a student is struggling only at the exam |

No lightweight, truly offline tool exists that combines **personalised mastery tracking** with **curriculum-accurate content** for the K–10 segment.

---

## 💡 Proposed Solution

**PathWise** is an offline-first Progressive Web App (PWA) that runs almost entirely on the student's device.

> *"Instead of streaming content from the cloud, PathWise brings intelligence to the device."*

### What makes it different

- **🧠 Adaptive by design** — Every question is chosen by a Bayesian Knowledge Tracing engine that models exactly what the student knows and doesn't know, in real time.
- **📡 Offline-first** — Core learning (quiz, flashcards, notes, mastery tracking) works with zero internet. AI features degrade gracefully with fallback content.
- **📚 Curriculum-accurate** — Content is compiled from a curated Knowledge Graph seeded from real CBSE / ICSE / MH curricula. No hallucinated formulas, no off-syllabus questions.
- **👪 Three-role ecosystem** — Student learns, Teacher monitors, Parent stays informed — all from one codebase.
- **🗣️ Multilingual** — Full Hindi + English UI with AI-generated Hindi chapter content and native TTS voice.

---

## ✨ Key Features

### For Students
- 📖 **AI Chapter Notes** — Rich, illustrated notes generated per chapter with formulas (KaTeX), examples, memory tips, and exam tricks
- 🃏 **Spaced Repetition Flashcards** — SuperMemo-2 algorithm schedules reviews at optimal intervals
- 🎯 **Adaptive Quizzes** — BKT-driven difficulty that adjusts after every answer
- 🤖 **Gyani AI Tutor** — Step-by-step math solver + concept Q&A (works offline via structured knowledge graph)
- 🔊 **Text-to-Speech** — ElevenLabs multilingual voice with Web Speech API fallback
- 🏆 **XP, Levels & Streaks** — Gamified progress with achievement badges
- 📈 **Personal Analytics** — Mastery heatmaps, weakness scores, study recommendations

### For Teachers
- 🏫 **Classroom Dashboard** — Real-time view of all students' mastery per chapter
- ⚠️ **At-Risk Alerts** — Students with weakness score > 0.7 are flagged automatically
- 📝 **Assignment Creator** — Push chapter-specific quiz assignments to students
- 💬 **Doubt Room** — Moderated Q&A thread per chapter

### For Parents
- 📊 **Weekly Progress Report** — Strength/weakness analysis with subject mastery %
- 📱 **WhatsApp Sharing** — One-tap share of child's weekly report

---

## 🏗️ Architecture

PathWise is a **100% frontend application** with thin serverless API functions for AI and TTS. All adaptive logic runs in the browser.

```
┌───────────────────────────────────────────────────────────────┐
│                      Browser (Client)                         │
│                                                               │
│   ┌───────────┐   ┌──────────────┐   ┌──────────────────┐   │
│   │ Student   │   │   Teacher    │   │     Parent       │   │
│   │ Dashboard │   │  Dashboard   │   │    Dashboard     │   │
│   └─────┬─────┘   └──────┬───────┘   └────────┬─────────┘   │
│         └────────────────┼──────────────────────┘            │
│                   ┌──────▼──────┐                            │
│                   │   Zustand   │  ← in-memory UI state      │
│                   └──────┬──────┘                            │
│                   ┌──────▼──────┐                            │
│                   │  Dexie.js   │  ← IndexedDB (all data)    │
│                   └─────────────┘                            │
│                                                               │
│   ┌─────────────────────────────────────────────────────┐   │
│   │  Adaptive Engines (run in-browser)                   │   │
│   │  BKT Mastery  │  SM-2 Scheduler  │  ZPD Difficulty  │   │
│   │  Weakness Scoring  │  AI Content Engine (offline)    │   │
│   └─────────────────────────────────────────────────────┘   │
└────────────────────────┬──────────────────────────────────────┘
                         │  fetch /api/*
          ┌──────────────▼──────────────────────┐
          │      Vercel Serverless Functions     │
          │  /api/tts          (ElevenLabs)      │
          │  /api/generate-chapter-content       │
          │  /api/parse-syllabus   (Gemini)      │
          │  /api/fetch-syllabus   (URL scraper) │
          └──────────────┬───────────────────────┘
                         │
              ┌──────────▼──────────┐
              │   External APIs     │
              │  Gemini 1.5 Flash   │
              │  ElevenLabs TTS     │
              └─────────────────────┘
```

---

## 🧠 Adaptive Learning Engines

### 1. Bayesian Knowledge Tracing (BKT)
Models each student's mastery of every concept as a **Hidden Markov Model** with four parameters:

| Parameter | Symbol | Meaning |
|---|---|---|
| Prior knowledge | P(L₀) | Probability student already knew the concept |
| Learning rate | P(T) | Probability of learning after a correct attempt |
| Slip probability | P(S) | Probability of wrong answer despite mastery |
| Guess probability | P(G) | Probability of right answer without mastery |

After every quiz answer, `pKnow` is updated. Chapters unlock at **≥ 95% mastery**.

```
After correct answer:  P(Lₙ) = P(Lₙ₋₁|correct) × (1 - P(S)) + (1 - P(Lₙ₋₁|correct)) × P(G)
After wrong answer:    P(Lₙ) = P(Lₙ₋₁|wrong) × P(S) + (1 - P(Lₙ₋₁|wrong)) × (1 - P(G))
```

### 2. SM-2 Spaced Repetition
Flashcard intervals follow **SuperMemo-2**. Students rate recall (0–5); the Easiness Factor (EF) adjusts the next review interval. Cards due today show first; mastered cards appear weeks later.

### 3. ZPD Difficulty Adaptation
Targets **65–80% success rate** (Zone of Proximal Development). Adjusts difficulty using:
- Last 3 quiz scores (exponential moving average)
- Current BKT mastery
- Learning velocity trend
- Time-ratio dampener (halves adjustment if student takes >50% longer than expected)

### 4. Composite Weakness Scoring
$$W = 0.35 \cdot (1-\text{perf}) + 0.30 \cdot (1-\text{BKT}) + 0.15 \cdot \text{timeRatio} + 0.20 \cdot \text{variance}$$

Students with $W > 0.7$ are flagged **High Risk** on the teacher dashboard.

---

## 🛠️ Tech Stack

| Layer | Technology | Why |
|---|---|---|
| **Framework** | React 19 + TypeScript | Hook boundaries, strict typing across all BKT/quiz schemas |
| **Build Tool** | Vite 8 | Fast HMR, ESM-native bundling, dev API middleware |
| **State** | Zustand | Lightweight atomic store; persists auth via `localStorage` |
| **Local DB** | Dexie.js (IndexedDB) | Promise-based, transactional, compound indexes, schema versioning |
| **Routing** | React Router v7 | SPA routing with per-role auth guards |
| **Styling** | Vanilla CSS + CSS Variables | Zero-runtime design token system; instant dark/light theming |
| **AI Content** | Gemini 1.5 Flash | Chapter notes, quiz generation, syllabus parsing |
| **TTS** | ElevenLabs Multilingual v2 | Hindi + English voice; Web Speech API fallback |
| **Deployment** | Vercel | SPA + serverless functions in one platform, zero server cost |
| **Math Rendering** | KaTeX | Fast in-browser LaTeX rendering for formulas |
| **Markdown** | marked + highlight.js | Notes rendering with code syntax highlighting |

---

## 🌐 API Reference

All API routes are Vercel Serverless Functions located in the `api/` directory.

### `POST /api/generate-chapter-content`
Generates a full content package for a chapter using Gemini AI. Falls back with `503` to trigger the client's offline rule-based engine.

**Request body:**
```json
{
  "title": "Real Numbers",
  "description": "Properties of real numbers, HCF and LCM.",
  "learningObjectives": ["Prove irrationality", "Calculate HCF"],
  "board": "CBSE",
  "grade": 10,
  "subject": "Mathematics",
  "lang": "en"
}
```

**Response:**
```json
{
  "overview": "...",
  "theorySections": [...],
  "formulas": [...],
  "workedExamples": [...],
  "flashcards": [...],
  "quizQuestions": [...]
}
```

---

### `POST /api/tts`
Proxies text to ElevenLabs for multilingual speech synthesis.

**Request body:**
```json
{ "text": "Real numbers include rational and irrational numbers.", "voiceId": "EXAVITQu4vr4xnSDxMaL" }
```

**Response:** `audio/mpeg` binary stream

---

### `POST /api/fetch-syllabus`
Fetches a URL and returns cleaned plain text (strips HTML, scripts, styles).

**Request body:** `{ "url": "https://cbseacademic.nic.in/..." }`

**Response:** `{ "text": "Chapter 1: Real Numbers..." }`

---

### `POST /api/parse-syllabus`
Parses raw syllabus text into a structured JSON curriculum using Gemini. Falls back to a structural regex parser.

**Request body:** `{ "board": "CBSE", "grade": 10, "text": "..." }`

**Response:**
```json
{
  "subjects": [
    { "name": "Mathematics", "chapters": [{ "title": "Real Numbers", "difficulty": 0.4, ... }] }
  ]
}
```

---

## 📁 Project Structure

```
pathwise/
├── api/                            # Vercel Serverless Functions
│   ├── tts.js                      # ElevenLabs TTS proxy
│   ├── fetch-syllabus.js           # URL scraper & HTML stripper
│   ├── parse-syllabus.js           # Gemini syllabus parser
│   └── generate-chapter-content.js # Gemini chapter content generator
│
├── src/
│   ├── main.tsx                    # App entrypoint
│   ├── App.tsx                     # Router + ErrorBoundary shell
│   ├── index.css                   # Design tokens (CSS vars) + global styles
│   ├── types/index.ts              # TypeScript interfaces
│   │
│   ├── lib/                        # Core adaptive engines
│   │   ├── db.ts                   # Dexie.js schema
│   │   ├── bkt.ts                  # Bayesian Knowledge Tracing
│   │   ├── sm2.ts                  # SuperMemo-2 scheduler
│   │   ├── compute-mastery.ts      # Chapter mastery aggregation
│   │   ├── weakness.ts             # Weakness scoring
│   │   ├── ai-engine.ts            # Offline rule-based content engine
│   │   ├── markdown-utils.ts       # AI JSON → Markdown converter
│   │   ├── voice.ts                # TTS wrapper (ElevenLabs + Web Speech)
│   │   └── utils.ts                # generateId, xpToLevel, clamp, formatTime
│   │
│   ├── store/
│   │   ├── appStore.ts             # Theme, language, isMobile
│   │   └── authStore.ts            # Auth sessions, profiles, roles
│   │
│   ├── components/
│   │   ├── ErrorBoundary.tsx       # Global error recovery UI
│   │   ├── ui/                     # Button, Card, Progress, Modal
│   │   ├── mascot/                 # Gyani owl SVG + speech bubbles
│   │   └── layout/                 # AppShell, sidebar, bottom nav
│   │
│   └── pages/
│       ├── Landing.tsx             # Marketing page
│       ├── auth/Auth.tsx           # Login, signup, onboarding
│       ├── student/                # Dashboard, Subjects, Quiz, Flashcards, AIChat
│       ├── teacher/                # Classroom, Assignments, Doubt Room
│       └── parent/                 # Dashboard, WeeklyReport
│
├── documentation/                  # Technical documentation
│   ├── SYSTEM_ARCHITECTURE.md
│   ├── DATABASE_SCHEMA.md
│   ├── DEPLOYMENT_GUIDE.md
│   ├── BKT_IMPLEMENTATION.md
│   ├── SM2_IMPLEMENTATION.md
│   ├── WEAKNESS_SCORING.md
│   ├── AI_PIPELINE.md
│   └── ...
│
├── public/                         # Static assets, icons, manifest
├── vercel.json                     # Vercel build + routing config
├── vite.config.ts                  # Vite config + dev API middleware
└── package.json
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm 9+

### 1. Clone and install
```bash
git clone https://github.com/your-org/pathwise.git
cd pathwise
npm install
```

### 2. Configure environment variables
Create a `.env` file at the project root:
```env
GEMINI_API_KEY=your_google_gemini_api_key
ELEVENLABS_API_KEY=your_elevenlabs_api_key
```

> Both keys are optional — the app works fully offline without them using its built-in rule-based engine and browser TTS.

### 3. Run the development server
```bash
npm run dev
```
The Vite dev server includes all API middleware (TTS, content generation, syllabus parsing) — no separate backend needed.

### 4. Build for production
```bash
npm run build
# Output: /dist — deploy to Vercel or any static host
```

---

## ☁️ Deploying to Vercel

1. Push to GitHub
2. Import the repo at [vercel.com/new](https://vercel.com/new)
3. Vercel auto-detects `vercel.json` — no manual settings needed
4. Add environment variables in **Settings → Environment Variables**:
   - `GEMINI_API_KEY`
   - `ELEVENLABS_API_KEY`
5. Click **Deploy** 🚀

All SPA routes are handled by the `/((?!api/).*)` → `index.html` rewrite rule in `vercel.json`.

For detailed deployment steps, see [`documentation/DEPLOYMENT_GUIDE.md`](documentation/DEPLOYMENT_GUIDE.md).

---

## 📶 Offline Behaviour

| Feature | Online | Offline |
|---|---|---|
| Curriculum browse | ✅ | ✅ IndexedDB cache |
| Chapter notes | ✅ Gemini AI | ✅ Rule-based engine |
| Flashcards | ✅ | ✅ Cached in IndexedDB |
| Adaptive quiz | ✅ | ✅ Offline engine generates questions |
| BKT mastery tracking | ✅ | ✅ All local |
| TTS audio | ✅ ElevenLabs | ⚠️ Web Speech API fallback |
| AI Tutor (Gyani) | ✅ Full | ✅ Knowledge graph mode |

---

## 🔒 Auth Model

| Role | Method |
|---|---|
| **Student** | Numeric PIN or emoji sequence (no email required) |
| **Teacher** | Email + Password + verified School Code |
| **Parent** | PIN linked to child's student ID |

All sessions are stored locally in Zustand + `localStorage`. Demo accounts are only accessible in development mode (`import.meta.env.DEV`).

---

## 📊 Data & Privacy

PathWise stores **all user data locally in the browser** (IndexedDB). No personal data is ever transmitted to PathWise servers. The only external calls are:

- Chapter title/description → **Gemini** (for content generation)
- Text → **ElevenLabs** (for TTS audio, no PII)
- User-provided URLs → Fetch (for syllabus import)

> ⚠️ Clearing browser site data will erase student progress. There is no cloud backup in the current version.

---

## 📚 Documentation

| Document | Description |
|---|---|
| [SYSTEM_ARCHITECTURE.md](documentation/SYSTEM_ARCHITECTURE.md) | Architecture topology, tech stack, data flow |
| [DATABASE_SCHEMA.md](documentation/DATABASE_SCHEMA.md) | Full Dexie.js schema, field reference, query patterns |
| [DEPLOYMENT_GUIDE.md](documentation/DEPLOYMENT_GUIDE.md) | Step-by-step Vercel deployment guide |
| [BKT_IMPLEMENTATION.md](documentation/BKT_IMPLEMENTATION.md) | Bayesian Knowledge Tracing math and code |
| [SM2_IMPLEMENTATION.md](documentation/SM2_IMPLEMENTATION.md) | SuperMemo-2 spaced repetition |
| [WEAKNESS_SCORING.md](documentation/WEAKNESS_SCORING.md) | Composite weakness score formula |
| [AI_PIPELINE.md](documentation/AI_PIPELINE.md) | Content generation pipeline and validation |
| [DIFFICULTY_ADAPTATION.md](documentation/DIFFICULTY_ADAPTATION.md) | ZPD engine parameters |

---

## 🗺️ Scope

| Dimension | Supported |
|---|---|
| **Grades** | 1 – 10 |
| **Boards** | CBSE, ICSE, Maharashtra State Board |
| **Subjects** | Mathematics, Science, English, Social Science |
| **Languages** | English, Hindi (UI + content + TTS) |
| **Roles** | Student, Teacher, Parent |
| **Platform** | Any modern browser (PWA installable on Android, iOS, Desktop) |

---

## 🤝 Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you'd like to change.

```bash
# Run linting
npm run lint

# Build and verify TypeScript
npm run build
```

---

<div align="center">

Built with ❤️ for every student who deserves personalised education.

</div>