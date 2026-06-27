# PathWise — Authentication Flow

PathWise uses a **local-first, PIN-based authentication system**. All session state is stored in Zustand with `localStorage` persistence. There is no remote auth server — credentials are verified against locally stored hashed PINs in IndexedDB.

---

## 1. Role Boundaries

| Role | Login Method | Access Scope |
|---|---|---|
| **Student** | Numeric PIN (4–6 digits) or emoji sequence | Student dashboard, quiz, flashcards, AI tutor, progress |
| **Teacher** | Email + Password + verified School Code | Classroom manager, student grids, assignments, doubt room |
| **Parent** | PIN linked to their child's student ID | Child's analytics, weekly report |

Route guards in `App.tsx` enforce these boundaries — a student cannot access `/teacher/*` routes and vice versa.

---

## 2. Student Registration Flow

```
Landing Page → "Get Started"
      │
      ▼
Onboarding Wizard (multi-step)
  Step 1: Enter name + choose avatar
  Step 2: Select grade (1–10) + board (CBSE / ICSE / State MH)
  Step 3: Choose language (English / Hindi)
  Step 4: Set PIN (4–6 digit numeric)
      │
      ▼
Creates:
  - users record  (id, name, role='student', avatarId, language, theme)
  - studentProfiles record  (userId, grade, board, difficultyLevel=0.5, xpTotal=0, level=1, streakCurrent=0)
      │
      ▼
Redirects → /student/dashboard
```

---

## 3. Teacher Registration Flow

```
Auth Page → "Teacher Sign Up"
      │
      ▼
  Enter: name, email, password, School Code (e.g. DPS-001)
      │
      ▼
  School Code validated against local registry
      │
      ▼
Creates:
  - users record  (role='teacher')
  - teacherProfiles record  (userId, schoolCode)
      │
      ▼
Redirects → /teacher/dashboard
```

---

## 4. Parent Registration Flow

```
Auth Page → "Parent Sign Up"
      │
      ▼
  Enter: name, child's Student ID, set PIN
      │
      ▼
  Verifies child's Student ID exists in local users table
      │
      ▼
Creates:
  - users record  (role='parent')
  - parentProfiles record  (userId, linkedStudentId)
      │
      ▼
Redirects → /parent/dashboard
```

---

## 5. Login Flow

```
Auth Page → Select role tab → Enter PIN / Email+Password
      │
      ▼
  Query IndexedDB users table for matching credentials
      │
  ┌───┴────────────┐
  │ Match found    │ No match
  ▼                ▼
Set Zustand      Show inline error
authStore        toast (no alert())
user + profile
      │
      ▼
Redirect based on role:
  student  → /student/dashboard
  teacher  → /teacher/dashboard
  parent   → /parent/dashboard
```

---

## 6. Auth Guard — Already Logged In

If a user navigates to `/auth/login` or `/auth/signup` while already authenticated, they are **immediately redirected** to their role's dashboard. This prevents double-login and session duplication.

Implemented in `src/pages/auth/Auth.tsx` using `useEffect` + `useNavigate`.

---

## 7. Demo Accounts (Development Only)

Quick-login demo buttons are visible **only in development mode** (`import.meta.env.DEV === true`). In production builds on Vercel, these buttons are hidden — users must go through the full onboarding flow.

---

## 8. Session Persistence

Sessions are persisted via Zustand's `persist` middleware to `localStorage`. On page reload, the stored user and profile are rehydrated instantly without a DB query. The session is cleared on logout by calling `useAuthStore.getState().logout()`, which clears both Zustand state and `localStorage`.
