/* ============================================
   VIDYA AI — TypeScript Type Definitions
   ============================================ */

// ---- Roles & Auth ----
export type UserRole = 'student' | 'teacher' | 'parent';
export type Board = 'CBSE' | 'ICSE' | 'STATE_UP' | 'STATE_MH' | 'STATE_TN' | 'STATE_KA' | 'STATE_AP';
export type Language = 'en' | 'hi';
export type Theme = 'dark' | 'light';
export type LearningStyle = 'visual' | 'auditory' | 'kinesthetic' | 'reading';
export type NetworkState = 'online' | 'offline' | 'syncing' | 'poor';

export interface User {
  id: string;
  role: UserRole;
  name: string;
  email?: string;
  avatarId: string;
  language: Language;
  theme: Theme;
  pin?: string;
  password?: string;
  createdAt: number;
  updatedAt: number;
  lastLoginAt?: number;
}

export interface StudentProfile {
  userId: string;
  grade: number;
  board: Board;
  schoolCode?: string;
  parentId?: string;
  learningStyle?: LearningStyle;
  difficultyLevel: number;
  streakCurrent: number;
  streakBest: number;
  xpTotal: number;
  level: number;
  lastStudyDate?: string;
  learningMode?: 'solo' | 'classroom';
  classCode?: string;
}

export interface TeacherProfile {
  userId: string;
  schoolCode: string;
  schoolName?: string;
  subjects: string[];
  grades: number[];
  isVerified: boolean;
  activeClassroomCode?: string;
}

// ---- Content ----
export interface Subject {
  id: string;
  name: string;
  nameHi: string;
  icon: string;
  color: string;
  grade: number;
  board: Board;
  sortOrder: number;
}

export interface Chapter {
  id: string;
  subjectId: string;
  title: string;
  titleHi: string;
  description: string;
  sortOrder: number;
  estimatedTimeMin: number;
  difficulty: number;
  prerequisites: string[];
  learningObjectives: string[];
  isAvailableOffline: boolean;
}

export interface Note {
  id: string;
  chapterId: string;
  content: string;
  contentHi?: string;
  generatedBy: 'ai' | 'teacher' | 'curated';
  version: number;
  createdAt: number;
}

// ---- Quiz ----
export type QuestionType = 'mcq' | 'fill_blank' | 'true_false' | 'short_answer';
export type BloomLevel = 'remember' | 'understand' | 'apply' | 'analyze' | 'evaluate' | 'create';

export interface QuizQuestion {
  id: string;
  chapterId: string;
  questionText: string;
  questionType: QuestionType;
  options?: string[];
  correctAnswer: string;
  explanation: string;
  difficulty: number;
  bloomLevel: BloomLevel;
  tags: string[];
}

export interface QuizAttempt {
  id: string;
  userId: string;
  chapterId: string;
  questions: string[];
  answers: string[];
  score: number;
  timeTakenSec: number;
  startedAt: number;
  completedAt?: number;
  synced: boolean;
}

// ---- Flashcards & SM-2 ----
export interface Flashcard {
  id: string;
  chapterId: string;
  front: string;
  back: string;
  difficulty: number;
}

export interface SM2Card {
  id: string;
  userId: string;
  flashcardId: string;
  easiness: number;
  interval: number;
  repetitions: number;
  nextReviewDate: string;
  lastReviewDate?: string;
}

// ---- BKT (Bayesian Knowledge Tracing) ----
export interface BKTMastery {
  id: string;
  userId: string;
  chapterId: string;
  skillId: string;
  pKnow: number;
  pTransit: number;
  pSlip: number;
  pGuess: number;
  attempts: number;
  lastUpdated: number;
}

// ---- Weakness ----
export interface WeaknessScore {
  id: string;
  userId: string;
  subjectId: string;
  chapterId: string;
  skillTag?: string;
  weaknessScore: number;
  confidence: number;
  evidenceCount: number;
  lastComputed: number;
}

// ---- Chat ----
export interface ChatSession {
  id: string;
  userId: string;
  chapterId?: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messageCount: number;
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  contentType: 'text' | 'image' | 'math' | 'code';
  createdAt: number;
  synced: boolean;
}

// ---- Assignments ----
export interface Assignment {
  id: string;
  teacherId: string;
  classId?: string;
  title: string;
  description: string;
  chapterId?: string;
  questions: QuizQuestion[];
  dueDate?: string;
  createdAt: number;
  isPublished: boolean;
  classCode?: string;
}

export interface AssignmentSubmission {
  id: string;
  assignmentId: string;
  studentId: string;
  answers: string[];
  score?: number;
  feedback?: string;
  submittedAt: number;
  gradedAt?: number;
  synced: boolean;
}

// ---- Doubt Room ----
export interface DoubtPost {
  id: string;
  userId: string;
  chapterId?: string;
  question: string;
  status: 'open' | 'answered' | 'closed';
  createdAt: number;
  synced: boolean;
  classCode?: string;
}

export interface DoubtReply {
  id: string;
  postId: string;
  userId: string;
  content: string;
  isAIGenerated: boolean;
  createdAt: number;
  synced: boolean;
  isPinned?: boolean;
}

// ---- Progress & Analytics ----
export type ActivityType = 'notes' | 'quiz' | 'flashcard' | 'chat' | 'video';

export interface StudySession {
  id: string;
  userId: string;
  chapterId: string;
  activityType: ActivityType;
  durationSec: number;
  startedAt: number;
  endedAt?: number;
  synced: boolean;
}

export interface Achievement {
  id: string;
  badgeId: string;
  title: string;
  description: string;
  icon: string;
  xpReward: number;
  condition: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface EarnedAchievement {
  id: string;
  userId: string;
  badgeId: string;
  earnedAt: number;
}

// ---- Sync ----
export type SyncOperationType = 'CREATE' | 'UPDATE' | 'DELETE';
export type SyncStatus = 'pending' | 'syncing' | 'synced' | 'failed';

export interface SyncQueueItem {
  id: string;
  operation: SyncOperationType;
  tableName: string;
  recordId: string;
  payload: Record<string, unknown>;
  priority: number;
  status: SyncStatus;
  retryCount: number;
  createdAt: number;
  lastAttemptAt?: number;
}

// ---- Dashboard ----
export interface DashboardSection {
  id: string;
  type: 'continue_learning' | 'weak_subjects' | 'daily_plan' | 'achievements' | 'challenges' | 'recommended' | 'streak' | 'ai_suggestion';
  priority: number;
  data: Record<string, unknown>;
}

export interface SubjectProgress {
  subjectId: string;
  subjectName: string;
  color: string;
  totalChapters: number;
  completedChapters: number;
  mastery: number;
  weakChapters: string[];
}

// ---- Teacher Analytics ----
export interface ClassOverviewData {
  totalStudents: number;
  activeToday: number;
  avgScore: number;
  totalDoubts: number;
  trends: {
    students: number;
    active: number;
    score: number;
    doubts: number;
  };
}

export interface StudentSummary {
  userId: string;
  name: string;
  avatarId: string;
  grade: number;
  mastery: number;
  streak: number;
  lastActive: string;
  riskLevel: 'low' | 'medium' | 'high';
}

export interface HeatmapCell {
  chapterId: string;
  chapterName: string;
  studentId: string;
  studentName: string;
  mastery: number;
}

// ---- Parent ----
export interface ChildProgress {
  studyTimeThisWeek: number;
  studyTimeLastWeek: number;
  quizzesTaken: number;
  avgScore: number;
  streakCurrent: number;
  xpEarned: number;
  strengths: string[];
  weaknesses: string[];
  dailyStudyTime: { day: string; minutes: number }[];
}

// ---- Voice ----
export interface VoiceConfig {
  language: Language;
  voiceIdEn: string;
  voiceIdHi: string;
  speed: number;
  enabled: boolean;
}

// ---- Avatar ----
export interface AvatarOption {
  id: string;
  name: string;
  emoji: string;
  color: string;
}

// ---- Classroom ----
export interface Classroom {
  id: string; // Classroom Code (e.g. 7A-XR92K)
  name: string; // e.g. Class 7A
  teacherId: string;
  grade: number;
  subjectId?: string;
  createdAt: number;
}
