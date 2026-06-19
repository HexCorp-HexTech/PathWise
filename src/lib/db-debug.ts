/* ============================================
   VIDYA AI / PATHWISE — IndexedDB Console Debugger
   ============================================ */
import { db } from './db';

export function registerDbDebugger() {
  const showDb = async () => {
    console.log("%c--- PATHWISE INDEXEDDB DEBUG VIEW ---", "color: #4ECDC4; font-weight: bold; font-size: 14px;");
    try {
      const tables = [
        { name: 'users', ref: db.users },
        { name: 'studentProfiles', ref: db.studentProfiles },
        { name: 'teacherProfiles', ref: db.teacherProfiles },
        { name: 'classrooms', ref: db.classrooms },
        { name: 'quizAttempts', ref: db.quizAttempts },
        { name: 'bktMastery', ref: db.bktMastery },
        { name: 'weaknessScores', ref: db.weaknessScores },
        { name: 'doubtPosts', ref: db.doubtPosts },
        { name: 'doubtReplies', ref: db.doubtReplies },
        { name: 'assignments', ref: db.assignments },
        { name: 'assignmentSubmissions', ref: db.assignmentSubmissions },
        { name: 'studySessions', ref: db.studySessions }
      ];

      for (const t of tables) {
        const data = await t.ref.toArray();
        console.group(`Table: ${t.name} (${data.length} records)`);
        if (data.length > 0) {
          console.table(data);
        } else {
          console.log("Empty table");
        }
        console.groupEnd();
      }
    } catch (err) {
      console.error("Failed to dump IndexedDB", err);
    }
  };

  // Expose to window object
  (window as any).showDb = showDb;
  (window as any).pathwiseDb = showDb;

  // Print startup instruction
  console.log("%c[Pathwise DB] Exposed 'window.showDb()' and 'window.pathwiseDb()' to console. Run either in F12 to inspect IndexedDB tables!", "color: #FF6B6B; font-weight: bold;");
}
