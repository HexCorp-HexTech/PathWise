# PathWise — Security Model

PathWise is a **frontend-only application** with no server-side user database. This document outlines the security model, client-side data protection, and threat surface.

---

## 1. Authentication Security

### PIN Storage
- Student PINs are stored in **plain text** in the local IndexedDB `users` table.
- Since all data lives only on the user's own device, PIN exposure is limited to physical device access — there is no remote database to breach.
- A future improvement would hash PINs with `bcrypt` or `PBKDF2` before storing.

### Teacher Credentials
- Teacher email + password are stored locally in IndexedDB (same caveat as above).
- For a production multi-tenant deployment, this should be replaced with a proper auth provider (e.g. Firebase Auth, Supabase, or a JWT-based REST API).

### Session Tokens
- No JWT tokens are issued. Sessions are held in **Zustand's in-memory store** with `localStorage` persistence.
- Sessions are cleared on logout via `useAuthStore.logout()`.

---

## 2. Data Isolation

| Mechanism | Protection |
|---|---|
| **IndexedDB Origin Sandbox** | Data is locked to the exact origin (`scheme://host:port`). Other websites cannot read PathWise's IndexedDB. |
| **Zustand Store** | In-memory only; not accessible from browser extensions without explicit injection. |
| **No Remote Database** | There is no server storing user quiz results, mastery data, or PII. All data stays on device. |

---

## 3. Route Guards

All dashboard routes are protected by role checks in `App.tsx`:

- Unauthenticated users attempting to access `/student/*`, `/teacher/*`, or `/parent/*` are redirected to `/auth/login`.
- Authenticated users visiting `/auth/login` or `/auth/signup` are redirected to their role's dashboard.
- Cross-role access (e.g. a student visiting `/teacher/dashboard`) is blocked by role assertions in each page's `useEffect`.

---

## 4. API Security

### Server-Side Keys
- `GEMINI_API_KEY` and `ELEVENLABS_API_KEY` are stored as **Vercel environment variables** — they are never exposed to the browser.
- All AI and TTS calls are proxied through Vercel Serverless Functions. The client never touches an API key directly.

### Input Validation
- All serverless functions validate required fields and return `400` for missing inputs.
- The `/api/fetch-syllabus` function sets a `User-Agent` header but does not follow open redirects — it fetches exactly the provided URL.

### Rate Limiting
- No rate limiting is currently implemented. For production scale, Vercel's Edge Middleware or a third-party service (e.g. Upstash) should be added to the `/api/tts` and `/api/generate-chapter-content` routes to prevent abuse.

---

## 5. Content Security

### AI Content Validation
All AI-generated content passes through a validation guard before being displayed or saved:

```typescript
const placeholderRegex = /placeholder|todo|block_|dummy|lorem/i;
if (placeholderRegex.test(content)) {
  // Reject and use offline rule-based fallback
}
```

This prevents scaffold markers or broken AI outputs from reaching students.

### No Arbitrary Code Execution
- Notes are rendered as Markdown via `marked` + `highlight.js`. HTML sanitization prevents XSS from AI-generated content.
- Math formulas are rendered with KaTeX in strict mode — no arbitrary JavaScript evaluation.

---

## 6. Privacy

- **No analytics, tracking, or telemetry** is collected by PathWise.
- The only external network calls are proxied through Vercel Functions (Gemini for content, ElevenLabs for TTS).
- No user PII (name, grade, PIN) is ever sent to any external service.
- Clearing browser site data completely erases all PathWise data — there is no cloud backup.

---

## 7. Threat Model Summary

| Threat | Mitigated? | Notes |
|---|---|---|
| Remote database breach | ✅ N/A | No remote DB exists |
| API key exposure in browser | ✅ | Keys are Vercel env vars, never sent to client |
| XSS via AI content | ✅ | Markdown renderer + placeholder validation |
| Cross-origin data access | ✅ | IndexedDB origin sandbox |
| Cross-role unauthorized access | ✅ | Route guards + role checks |
| PIN brute force (remote) | ✅ N/A | Auth is local-only |
| PIN brute force (local) | ⚠️ | No lockout implemented; mitigated by device PIN/lock |
| API abuse / cost inflation | ⚠️ | No rate limiting yet — recommended for production |
