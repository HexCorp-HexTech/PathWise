# API CONTRACTS & DOCUMENTATION — VIDYA AI

## 1. Authentication
- **POST /api/auth/student/signup**: Registration using PIN. Returns JWT token and studentProfile.
- **POST /api/auth/student/login**: Login using PIN.
- **POST /api/auth/teacher/signup**: Signup using email, password, and verified School Code.

## 2. Content Generation & AI Tutor
- **POST /api/content/generate**: AI-powered notes, quiz questions, and flashcard deck creation based on Bloom's taxonomy.
- **POST /api/ai/chat/stream**: Server-Sent Events (SSE) streaming endpoint for AI Tutor chat responses.

## 3. Data Sync
- **POST /api/sync/push**: Submit local sync queue operations (inserts, updates, deletes) to remote databases.
- **POST /api/sync/pull**: Fetch latest operations based on server transaction version markers.
