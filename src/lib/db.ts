/* ============================================
   PATHWISE — Database Layer (Dexie.js / IndexedDB)
   ============================================ */
import Dexie, { type Table } from 'dexie';
import type {
  User, StudentProfile, TeacherProfile,
  Subject, Chapter, Note,
  QuizQuestion, QuizAttempt,
  Flashcard, SM2Card, BKTMastery, WeaknessScore,
  ChatSession, ChatMessage,
  Assignment, AssignmentSubmission,
  DoubtPost, DoubtReply,
  StudySession, EarnedAchievement,
  SyncQueueItem, Classroom,
} from '../types';

class PathwiseDatabase extends Dexie {
  users!: Table<User>;
  studentProfiles!: Table<StudentProfile>;
  teacherProfiles!: Table<TeacherProfile>;
  subjects!: Table<Subject>;
  chapters!: Table<Chapter>;
  notes!: Table<Note>;
  quizQuestions!: Table<QuizQuestion>;
  quizAttempts!: Table<QuizAttempt>;
  flashcards!: Table<Flashcard>;
  sm2Cards!: Table<SM2Card>;
  bktMastery!: Table<BKTMastery>;
  weaknessScores!: Table<WeaknessScore>;
  chatSessions!: Table<ChatSession>;
  chatMessages!: Table<ChatMessage>;
  assignments!: Table<Assignment>;
  assignmentSubmissions!: Table<AssignmentSubmission>;
  doubtPosts!: Table<DoubtPost>;
  doubtReplies!: Table<DoubtReply>;
  studySessions!: Table<StudySession>;
  earnedAchievements!: Table<EarnedAchievement>;
  syncQueue!: Table<SyncQueueItem>;
  voiceCache!: Table<{ id: string; text: string; voiceId: string; audioBlob: Blob; createdAt: number }>;
  classrooms!: Table<Classroom>;

  constructor() {
    super('PathwiseAI');

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
      classrooms: 'id, teacherId',
    });
  }
}

import { SUBJECTS, CHAPTERS, DEMO_CLASSROOMS, DEMO_STUDENT, DEMO_TEACHER, DEMO_STUDENTS } from '../data/seed';

export const db = new PathwiseDatabase();

// Database initialization with seed data
export async function initializeDatabase(): Promise<void> {
  const count = await db.subjects.count();
  if (count === 0) {
    console.log('[DB] Seeding database subjects, chapters, and classrooms...');
    await db.subjects.bulkPut(SUBJECTS);
    await db.chapters.bulkPut(CHAPTERS);
    await db.classrooms.bulkPut(DEMO_CLASSROOMS);
    
    // Seed demo student user & profile
    await db.users.put(DEMO_STUDENT.user);
    await db.studentProfiles.put(DEMO_STUDENT.profile);
    
    // Seed demo teacher user & profile
    await db.users.put(DEMO_TEACHER.user);
    await db.teacherProfiles.put(DEMO_TEACHER.profile);
    
    // Seed student list from DEMO_STUDENTS into Dexie users & studentProfiles
    for (let i = 0; i < DEMO_STUDENTS.length; i++) {
      const ds = DEMO_STUDENTS[i];
      const studentId = `demo-student-id-${i + 1}`;
      
      const userRecord: User = {
        id: studentId,
        role: 'student',
        name: ds.name,
        avatarId: ds.avatarId,
        language: 'en',
        theme: 'dark',
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      
      const profileRecord: StudentProfile = {
        userId: studentId,
        grade: 7, // Default grade
        board: 'CBSE',
        difficultyLevel: ds.mastery,
        streakCurrent: ds.streak,
        streakBest: ds.streak,
        xpTotal: Math.round(ds.mastery * 1000),
        level: Math.max(1, Math.round(ds.mastery * 6)),
        learningMode: 'classroom',
        classCode: ds.classCode
      };
      
      await db.users.put(userRecord);
      await db.studentProfiles.put(profileRecord);
    }

    console.log('[DB] Database seeded successfully!');
  }
}
