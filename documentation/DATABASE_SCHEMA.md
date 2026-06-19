# Pathwise — IndexedDB Database Schema (Dexie.js)

Pathwise relies on a client-side IndexedDB database powered by **Dexie.js** to manage sync queues, offline curriculum cache, adaptive state variables, and chat histories. This document details the database stores, indexes, relationship modeling, and query execution.

---

## 1. Schema Configuration & Compound Indexes
The database instance `PathwiseAI` is configured inside [db.ts](file:///c:/Users/Arnav/OneDrive/Desktop/better/src/lib/db.ts) using the following store definitions. Compound indexes are used to enable fast composite index matches (such as query queries matching a user and card ID simultaneously).

```typescript
this.version(1).stores({
  users: 'id, role, email',
  studentProfiles: 'userId, grade, board',
  teacherProfiles: 'userId, schoolCode',
  subjects: 'id, grade, board, sortOrder',
  chapters: 'id, subjectId, sortOrder',
  notes: 'id, chapterId',
  quizQuestions: 'id, chapterId, difficulty',
  quizAttempts: 'id, userId, chapterId, startedAt',
  flashcards: 'id, chapterId',
  sm2Cards: 'id, [userId+flashcardId], userId, nextReviewDate',
  bktMastery: 'id, [userId+chapterId+skillId], userId',
  weaknessScores: 'id, [userId+chapterId], userId',
  chatSessions: 'id, userId, updatedAt',
  chatMessages: 'id, sessionId, createdAt',
  assignments: 'id, teacherId, createdAt',
  assignmentSubmissions: 'id, assignmentId, studentId',
  doubtPosts: 'id, userId, chapterId, status',
  doubtReplies: 'id, postId',
  studySessions: 'id, userId, startedAt',
  earnedAchievements: 'id, userId, badgeId',
  syncQueue: 'id, status, priority, createdAt',
  voiceCache: 'id, text, voiceId',
});
```

---

## 2. Store Models & Properties

### `users`
Represents student, teacher, or parent system profiles:
* **`id`** (string, Primary Key): Unique uuid.
* **`role`** (string): `'student' | 'teacher' | 'parent'`.
* **`name`** (string): Display name.
* **`email`** (string, optional): Login email.
* **`avatarId`** (string): Selected owl or character profile.
* **`language`** (string): `'en' | 'hi'`.
* **`theme`** (string): `'dark' | 'light'`.
* **`createdAt`** / **`updatedAt`** (number): Epoch timestamps.

### `studentProfiles`
Adaptive parameters for student progress mapping:
* **`userId`** (string, Primary Key): Foreign key matching `users.id`.
* **`grade`** (number): Current academic grade (1-10).
* **`board`** (string): `'CBSE' | 'ICSE' | 'STATE_MH'`.
* **`difficultyLevel`** (number): Floating ZPD scale between `0.1` and `0.9`.
* **`streakCurrent`** / **`streakBest`** (number): Day counters.
* **`xpTotal`** (number): Accumulated experience points.
* **`level`** (number): Current academic progression level.
* **`lastStudyDate`** (string): Date in `YYYY-MM-DD` format.

### `sm2Cards`
Calculations mapping spaced reviews to memory stabilization:
* **`id`** (string, Primary Key).
* **`userId`** (string): Matching user.
* **`flashcardId`** (string): Matching target card.
* **`easiness`** (number): Ease Factor (EF), defaults to `2.5`.
* **`interval`** (number): Days until next review.
* **`repetitions`** (number): Consecutive correct recalls.
* **`nextReviewDate`** (string): ISO formatted date.

### `bktMastery`
Tracks dynamic skill mastery for Bayesian adaptive quizzes:
* **`id`** (string, Primary Key).
* **`userId`** (string): User identifier.
* **`chapterId`** (string): Associated chapter.
* **`skillId`** (string): Targeted conceptual skill tag.
* **`pKnow`** (number): Mastery probability (0.0 to 1.0).
* **`attempts`** (number): Practice count.

---

## 3. Relationship Joins & Query Examples
Since IndexedDB is a non-relational document store, joins are implemented at query time using helper methods.

### Joining Student Profile and User Data
```typescript
import { db } from '../lib/db';

export async function getStudentWithUser(userId: string) {
  const user = await db.users.get(userId);
  if (!user) return null;

  const profile = await db.studentProfiles.where('userId').equals(userId).first();
  return {
    ...user,
    profile
  };
}
```

### Retrieving Due Flashcards for a Chapter
```typescript
export async function getDueFlashcards(userId: string, chapterId: string) {
  const today = new Date().toISOString().split('T')[0];
  
  // Find all card associations due today or overdue
  const sm2Records = await db.sm2Cards
    .where('userId')
    .equals(userId)
    .and(card => card.nextReviewDate <= today)
    .toArray();
    
  const dueIds = sm2Records.map(r => r.flashcardId);
  
  // Join with static/cached flashcard content
  const allCards = await db.flashcards.where('chapterId').equals(chapterId).toArray();
  return allCards.filter(c => dueIds.includes(c.id));
}
```
