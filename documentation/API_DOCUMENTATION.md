# PathWise — API Documentation

PathWise's API layer consists of **four Vercel Serverless Functions** located in the `api/` directory. These proxy external AI and TTS services — no user data is stored server-side. All other app logic runs entirely client-side.

> **Base URL (production):** `https://your-app.vercel.app`
> **Base URL (development):** `http://localhost:5173` (handled by Vite middleware in `vite.config.ts`)

---

## Endpoints Overview

| Method | Endpoint | Service | Description |
|---|---|---|---|
| `POST` | `/api/generate-chapter-content` | Gemini 1.5 Flash | Generate full chapter content package |
| `POST` | `/api/parse-syllabus` | Gemini 1.5 Flash | Parse syllabus text into structured curriculum |
| `POST` | `/api/fetch-syllabus` | HTTP Fetch | Fetch & strip HTML from a URL |
| `POST` | `/api/tts` | ElevenLabs | Text-to-speech audio synthesis |

---

## `POST /api/generate-chapter-content`

Generates a complete educational content package for a chapter. Uses **Gemini 1.5 Flash**. Returns `503` when Gemini is unavailable — the client falls back to its built-in offline rule-based engine automatically.

### Request Body
```json
{
  "title": "Real Numbers",
  "description": "Properties of real numbers, prime factorization, HCF and LCM.",
  "learningObjectives": ["Verify prime factorization", "Calculate HCF and LCM"],
  "board": "CBSE",
  "grade": 10,
  "subject": "Mathematics",
  "lang": "en"
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `title` | string | ✅ | Chapter title |
| `description` | string | — | Short chapter description |
| `learningObjectives` | string[] | — | List of learning goals |
| `board` | string | — | `'CBSE' \| 'ICSE' \| 'STATE_MH'` |
| `grade` | number | — | Academic grade 1–10 |
| `subject` | string | — | Subject name |
| `lang` | string | — | `'en'` or `'hi'` |

### Response `200 OK`
```json
{
  "overview": "Real numbers include all rational and irrational numbers...",
  "theorySections": [
    { "title": "Rational Numbers", "content": "A number p/q where q ≠ 0..." }
  ],
  "formulas": [
    { "name": "HCF-LCM Relation", "formula": "HCF(a,b) \\times LCM(a,b) = a \\times b", "explanation": "Product of two numbers equals product of their HCF and LCM." }
  ],
  "workedExamples": [
    { "question": "Find HCF of 12 and 18", "stepByStep": ["Factor 12 = 2²×3", "Factor 18 = 2×3²", "HCF = 2×3 = 6"], "solution": "6" }
  ],
  "commonMistakes": [...],
  "examTricks": ["Always verify HCF×LCM = product of numbers"],
  "memoryTips": ["PEMDAS for order of operations"],
  "summaryPoints": ["Every real number is either rational or irrational"],
  "flashcards": [
    { "front": "What is an irrational number?", "back": "A number that cannot be expressed as p/q", "difficulty": 0.3 }
  ],
  "quizQuestions": [
    {
      "questionText": "Which of the following is irrational?",
      "questionType": "mcq",
      "options": ["√4", "√2", "1/3", "0.5"],
      "correctAnswer": "√2",
      "explanation": "√2 cannot be expressed as a fraction.",
      "difficulty": 0.4,
      "bloomLevel": "remember",
      "tags": ["real-numbers", "irrational"]
    }
  ]
}
```

### Error Responses
| Status | Meaning |
|---|---|
| `400` | Missing `title` field |
| `503` | Gemini unavailable — client should use offline fallback |
| `500` | Internal server error |

---

## `POST /api/parse-syllabus`

Parses raw syllabus text into a structured JSON curriculum using Gemini AI. Falls back to a structural regex parser if Gemini is unavailable.

### Request Body
```json
{
  "board": "CBSE",
  "grade": 10,
  "text": "Chapter 1: Real Numbers. Euclid's division lemma..."
}
```

### Response `200 OK`
```json
{
  "subjects": [
    {
      "name": "Mathematics",
      "chapters": [
        {
          "title": "Real Numbers",
          "description": "Euclid's lemma, prime factorization, HCF and LCM.",
          "learningObjectives": ["Apply Euclid's algorithm", "Prove irrationality of √2"],
          "difficulty": 0.4,
          "estimatedTimeMin": 60
        }
      ]
    }
  ]
}
```

---

## `POST /api/fetch-syllabus`

Fetches a public URL and returns the page content as cleaned plain text (strips all HTML tags, scripts, and styles). Used before calling `/api/parse-syllabus`.

### Request Body
```json
{ "url": "https://cbseacademic.nic.in/curriculum_2024.html" }
```

### Response `200 OK`
```json
{ "text": "Chapter 1 Real Numbers Chapter 2 Polynomials..." }
```

| Field | Note |
|---|---|
| `text` | Capped at 100,000 characters |

### Error Responses
| Status | Meaning |
|---|---|
| `400` | Missing `url` |
| `502` | Target URL returned non-2xx status |
| `500` | Network error fetching the URL |

---

## `POST /api/tts`

Proxies text-to-speech synthesis to **ElevenLabs Multilingual v2**. Returns raw `audio/mpeg` binary.

### Request Body
```json
{
  "text": "Real numbers include rational and irrational numbers.",
  "voiceId": "EXAVITQu4vr4xnSDxMaL"
}
```

| Field | Description |
|---|---|
| `text` | Text to synthesize (plain text, no markdown) |
| `voiceId` | ElevenLabs voice ID |

### Response `200 OK`
```
Content-Type: audio/mpeg
[binary audio data]
```

The client plays this via the Web Audio API. On failure, the client silently degrades to the browser's built-in `SpeechSynthesis` API.

### Error Responses
| Status | Meaning |
|---|---|
| `400` | Missing `text` or `voiceId` |
| `503` | `ELEVENLABS_API_KEY` not configured |
| `502` | ElevenLabs returned an error |
| `500` | Internal error |

---

## Environment Variables

| Variable | Used By | Required |
|---|---|---|
| `GEMINI_API_KEY` | `/api/generate-chapter-content`, `/api/parse-syllabus` | Recommended |
| `ELEVENLABS_API_KEY` | `/api/tts` | Recommended |

Both degrade gracefully — the app functions fully offline without either key.

---

## CORS Headers

All `/api/*` routes return:
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
```

Configured in `vercel.json`.
