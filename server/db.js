import { createClient } from "@libsql/client";
import dotenv from "dotenv";
import { hashPassword } from "./authUtils.js";
import path from "path";
import { fileURLToPath } from "url";

const serverDir = path.dirname(fileURLToPath(import.meta.url));
dotenv.config();
dotenv.config({ path: path.join(serverDir, ".env") });

const isVercel = process.env.VERCEL || process.env.VERCEL_ENV;

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

export const db = url && authToken ? createClient({ url, authToken }) : null;

export function getDatabaseStatus() {
  return {
    configured: Boolean(db),
    missing: {
      TURSO_DATABASE_URL: !url,
      TURSO_AUTH_TOKEN: !authToken,
    },
  };
}

function requireDatabase() {
  if (!db) {
    const missing = Object.entries(getDatabaseStatus().missing)
      .filter(([, isMissing]) => isMissing)
      .map(([key]) => key)
      .join(', ');
    throw new Error(`Database is not configured. Missing ${missing}.`);
  }

  return db;
}

export async function runSQL(sql, params = []) {
  const result = await requireDatabase().execute({ sql, args: params });
  return { changes: result.rowsAffected, lastInsertRowid: Number(result.lastInsertRowid || 0) };
}

export async function getOne(sql, params = []) {
  const result = await requireDatabase().execute({ sql, args: params });
  if (result.rows.length > 0) {
    return result.rows[0];
  }
  return null;
}

export async function getAll(sql, params = []) {
  const result = await requireDatabase().execute({ sql, args: params });
  return result.rows;
}

// Ensure tables exist on startup
export async function initializeDatabase() {
  await requireDatabase().executeMultiple(`
    CREATE TABLE IF NOT EXISTS students (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      age INTEGER DEFAULT 14,
      grade INTEGER DEFAULT 8,
      board TEXT DEFAULT 'CBSE',
      goals TEXT DEFAULT 'Math',
      level TEXT DEFAULT 'beginner',
      study_time TEXT DEFAULT '30 min',
      language TEXT DEFAULT 'en',
      device_type TEXT DEFAULT 'mobile',
      connectivity TEXT DEFAULT '3g',
      streak_count INTEGER DEFAULT 0,
      last_active DATETIME DEFAULT CURRENT_TIMESTAMP,
      progress_percent REAL DEFAULT 0,
      needs_reengagement INTEGER DEFAULT 0,
      username TEXT DEFAULT '',
      password TEXT DEFAULT '',
      class_code TEXT DEFAULT '',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      last_active_date DATETIME
    );

    CREATE TABLE IF NOT EXISTS teachers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      pin TEXT DEFAULT '1234',
      username TEXT DEFAULT '',
      password TEXT DEFAULT '',
      class_code TEXT DEFAULT '',
      school TEXT DEFAULT '',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS learning_paths (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER NOT NULL,
      path_json TEXT NOT NULL,
      generated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      ai_powered INTEGER DEFAULT 0,
      update_reason TEXT DEFAULT '',
      FOREIGN KEY (student_id) REFERENCES students(id)
    );

    CREATE TABLE IF NOT EXISTS topic_progress (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER NOT NULL,
      path_id INTEGER,
      topic_name TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      quiz_score INTEGER,
      feedback TEXT,
      attempts INTEGER DEFAULT 0,
      last_attempt DATETIME,
      completed_at DATETIME,
      weak_concepts TEXT DEFAULT '',
      FOREIGN KEY (student_id) REFERENCES students(id)
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER NOT NULL,
      action TEXT DEFAULT '',
      topic TEXT,
      score INTEGER,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES students(id)
    );

    CREATE TABLE IF NOT EXISTS teacher_assigned_paths (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      teacher_id INTEGER NOT NULL,
      student_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      topics_json TEXT NOT NULL,
      status TEXT DEFAULT 'active',
      assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (teacher_id) REFERENCES teachers(id),
      FOREIGN KEY (student_id) REFERENCES students(id)
    );

    CREATE TABLE IF NOT EXISTS assigned_path_content (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      path_id INTEGER NOT NULL,
      topic_index INTEGER NOT NULL,
      topic_name TEXT NOT NULL,
      content TEXT NOT NULL,
      generated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (path_id) REFERENCES teacher_assigned_paths(id)
    );

    CREATE TABLE IF NOT EXISTS syllabus_content (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      standard TEXT NOT NULL,
      subject TEXT NOT NULL,
      chapter TEXT NOT NULL,
      theme TEXT,
      examples_json TEXT,
      lesson_text TEXT,
      notes_json TEXT,
      quiz_json TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_students_username ON students(username);
    CREATE INDEX IF NOT EXISTS idx_students_class_code ON students(class_code);
    CREATE INDEX IF NOT EXISTS idx_teachers_username ON teachers(username);
    CREATE INDEX IF NOT EXISTS idx_learning_paths_student ON learning_paths(student_id);
    CREATE INDEX IF NOT EXISTS idx_topic_progress_student ON topic_progress(student_id);
    CREATE INDEX IF NOT EXISTS idx_topic_progress_compound ON topic_progress(student_id, topic_name);
    CREATE INDEX IF NOT EXISTS idx_syllabus_lookup ON syllabus_content(standard, subject, chapter);
  `);

  // Seed Demo Teacher
  const teacherCount = await getOne('SELECT COUNT(*) as count FROM teachers');
  if (teacherCount && Number(teacherCount.count) === 0) {
    const passwordHash = await hashPassword('1234');
    await runSQL(`INSERT INTO teachers (name, pin, username, password, class_code, school) VALUES (?, ?, ?, ?, ?, ?)`,
      ['Demo Teacher', '1234', 'teacher1', passwordHash, 'CLASS-8A', 'Demo School']);
    console.log('👨‍🏫 Demo teacher seeded');
  }

  console.log('✅ Turso Database initialized');
}

if (db) {
  await initializeDatabase().catch((err) => {
    console.error('Database initialization failed:', err);
  });
} else {
  console.error('Missing TURSO_DATABASE_URL or TURSO_AUTH_TOKEN in environment variables.');
}

export default db;
