# PathWise — Deployment Guide (Vercel)

This guide covers deploying PathWise to Vercel for production. PathWise is a frontend-only React/Vite SPA with four Vercel Serverless Functions for AI and TTS features.

---

## Prerequisites

- A [Vercel](https://vercel.com) account
- Your project pushed to a Git repository (GitHub, GitLab, or Bitbucket)
- API keys for:
  - **Google Gemini** (`GEMINI_API_KEY`) — for AI chapter content & syllabus parsing
  - **ElevenLabs** (`ELEVENLABS_API_KEY`) — for multilingual text-to-speech

---

## 1. One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

Import your Git repository from the Vercel dashboard. Vercel will auto-detect the `vercel.json` configuration.

---

## 2. Build Settings

These are already configured in [`vercel.json`](file:///d:/Projects/PathWise/vercel.json) at the project root:

| Setting | Value |
|---|---|
| Framework | None (Custom) |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Install Command | `npm install` |

> **No manual changes needed** — Vercel reads `vercel.json` automatically.

---

## 3. Environment Variables

Set the following environment variables in the Vercel project dashboard under **Settings → Environment Variables**:

| Variable | Required | Description |
|---|---|---|
| `GEMINI_API_KEY` | ✅ Recommended | Google Gemini 1.5 Flash API key for AI chapter content and syllabus parsing |
| `ELEVENLABS_API_KEY` | ✅ Recommended | ElevenLabs API key for multilingual TTS audio |

> **Note:** If `GEMINI_API_KEY` is not set, the app falls back to its built-in rule-based offline content engine. If `ELEVENLABS_API_KEY` is not set, TTS is silently disabled with a toast notification — no white-screen or crash occurs.

### Getting API Keys

- **Gemini**: [Google AI Studio → Get API Key](https://aistudio.google.com/app/apikey) (free tier available)
- **ElevenLabs**: [ElevenLabs Dashboard → API Keys](https://elevenlabs.io/app/api-keys) (free tier: 10k characters/month)

---

## 4. Serverless API Functions

The following serverless functions live in the [`api/`](file:///d:/Projects/PathWise/api) directory and are automatically deployed by Vercel:

| Route | File | Description |
|---|---|---|
| `POST /api/tts` | `api/tts.js` | Proxies TTS requests to ElevenLabs |
| `POST /api/fetch-syllabus` | `api/fetch-syllabus.js` | Fetches & strips HTML from a URL |
| `POST /api/parse-syllabus` | `api/parse-syllabus.js` | Parses syllabus text with Gemini AI |
| `POST /api/generate-chapter-content` | `api/generate-chapter-content.js` | Generates chapter notes/quiz/flashcards with Gemini |

All routes have CORS headers configured in `vercel.json`.

---

## 5. SPA Routing

The `vercel.json` rewrites ensure all non-API routes fall through to `index.html` so React Router handles client-side navigation:

```json
{ "source": "/((?!api/).*)", "destination": "/index.html" }
```

This prevents 404 errors on direct navigation to routes like `/student/dashboard`.

---

## 6. Custom Domain (Optional)

1. Go to **Vercel Project → Settings → Domains**
2. Add your custom domain (e.g. `pathwise.app`)
3. Follow DNS instructions for your registrar
4. Vercel auto-provisions TLS (HTTPS) via Let's Encrypt

---

## 7. Deploying Updates

All commits to your **main branch** trigger automatic deployments. Pull requests get **preview deployments** at unique URLs.

To deploy manually:
```bash
npx vercel --prod
```

---

## 8. Local Development

```bash
# Install dependencies
npm install

# Start dev server (API middleware runs inside Vite via vite.config.ts)
npm run dev

# Build for production locally
npm run build

# Preview the production build
npm run preview
```

The Vite dev server includes the same API middleware as the Vercel serverless functions, so the development experience is identical to production.

---

## 9. Environment Variable Checklist

Before going live, verify:

- [ ] `GEMINI_API_KEY` set in Vercel dashboard
- [ ] `ELEVENLABS_API_KEY` set in Vercel dashboard
- [ ] Domain configured (if using custom domain)
- [ ] Preview deployment tested and working
- [ ] `npm run build` passes with zero TypeScript errors locally

---

## 10. Data Privacy

PathWise stores **all user data locally in the browser** (IndexedDB). No user data is ever sent to the PathWise servers. The only external network calls are:

- `/api/tts` → ElevenLabs (text content only, no PII)
- `/api/generate-chapter-content` → Gemini (chapter title/description only)
- `/api/parse-syllabus` → Gemini (syllabus text only)
- `/api/fetch-syllabus` → the user-provided URL

Inform users that clearing browser data / site data will erase their progress, as there is no cloud backup.
