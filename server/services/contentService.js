import { getOne } from "../db.js";
import {
  generateLessonWithAI,
  generateNotesWithAI,
  generateQuizWithAI,
  isContentAIAvailable,
} from "./aiContentService.js";

function normalizeStandard(standard) {
  return String(standard || "").replace(/[^0-9]/g, "");
}

function normalizeKey(value) {
  return String(value || "").trim().toLowerCase();
}

async function getLocalChapter(standardInput, subjectInput, chapterInput) {
  const standard = normalizeStandard(standardInput);
  const subject = normalizeKey(subjectInput);
  const chapter = normalizeKey(chapterInput);

  if (!standard || !subject || !chapter) return null;

  const row = await getOne(
    `SELECT * FROM syllabus_content WHERE standard = ? AND LOWER(subject) = ? AND LOWER(chapter) = ?`,
    [standard, subject, chapter]
  );

  if (!row) return null;

  return {
    standard: row.standard,
    subject: row.subject,
    chapter: row.chapter,
    data: {
      lesson: row.lesson_text,
      notes: JSON.parse(row.notes_json || "[]"),
      quiz: JSON.parse(row.quiz_json || "[]")
    }
  };
}

// ── Lesson ───────────────────────────────────────────────────────────

export async function getLesson(standard, subject, chapter) {
  // Try AI first
  if (isContentAIAvailable()) {
    const aiResult = await generateLessonWithAI(standard, subject, chapter);
    if (aiResult.success && aiResult.data) {
      return {
        lesson: aiResult.data,
        source: "ai",
        ai_powered: true,
        reason: null,
      };
    }
    // AI failed — fall through to local with reason
    const local = await getLocalChapter(standard, subject, chapter);
    if (local?.data?.lesson) {
      return {
        lesson: local.data.lesson,
        source: "fallback",
        ai_powered: false,
        reason: aiResult.reason,
      };
    }
    // No local data either
    throw new Error(aiResult.reason || "Lesson content unavailable");
  }

  // No AI key — use local directly
  const local = await getLocalChapter(standard, subject, chapter);
  if (local?.data?.lesson) {
    return { lesson: local.data.lesson, source: "db", ai_powered: false, reason: null };
  }

  throw new Error("Lesson content unavailable");
}

// ── Notes ────────────────────────────────────────────────────────────

export async function getNotes(standard, subject, chapter) {
  // Try AI first
  if (isContentAIAvailable()) {
    const aiResult = await generateNotesWithAI(standard, subject, chapter);
    if (aiResult.success && aiResult.data) {
      return {
        notes: aiResult.data,
        source: "ai",
        ai_powered: true,
        reason: null,
      };
    }
    // AI failed — fall through to local with reason
    const local = await getLocalChapter(standard, subject, chapter);
    if (local?.data?.notes) {
      return {
        notes: local.data.notes,
        source: "fallback",
        ai_powered: false,
        reason: aiResult.reason,
      };
    }
    // No local data either
    throw new Error(aiResult.reason || "Notes content unavailable");
  }

  // No AI key — use local directly
  const local = await getLocalChapter(standard, subject, chapter);
  if (local?.data?.notes) {
    return { notes: local.data.notes, source: "db", ai_powered: false, reason: null };
  }

  throw new Error("Notes content unavailable");
}

// ── Quiz ─────────────────────────────────────────────────────────────

export async function getQuiz(standard, subject, chapter) {
  // Try AI first
  if (isContentAIAvailable()) {
    const aiResult = await generateQuizWithAI(standard, subject, chapter);
    if (aiResult.success && aiResult.data) {
      return {
        quiz: aiResult.data,
        source: "ai",
        ai_powered: true,
        reason: null,
      };
    }
    // AI failed — fall through to local with reason
    const local = await getLocalChapter(standard, subject, chapter);
    if (local?.data?.quiz) {
      return {
        quiz: local.data.quiz,
        source: "fallback",
        ai_powered: false,
        reason: aiResult.reason,
      };
    }
    // No local data either
    throw new Error(aiResult.reason || "Quiz content unavailable");
  }

  // No AI key — use local directly
  const local = await getLocalChapter(standard, subject, chapter);
  if (local?.data?.quiz) {
    return { quiz: local.data.quiz, source: "db", ai_powered: false, reason: null };
  }

  throw new Error("Quiz content unavailable");
}

export async function hasPrototypeChapter(standard, subject, chapter) {
  const local = await getLocalChapter(standard, subject, chapter);
  return Boolean(local);
}
