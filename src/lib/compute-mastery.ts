/* ============================================
   VIDYA AI — Student Mastery Computation Helper
   ============================================ */
import { db } from './db';

export async function computeStudentMastery(userId: string): Promise<number> {
  try {
    const bkt = await db.bktMastery.where('userId').equals(userId).toArray();

    if (bkt.length > 0) {
      const sumBkt = bkt.reduce((sum, b) => {
        let p = b.pKnow ?? 0;
        if (p > 1.0) p = p / 100.0;
        return sum + p;
      }, 0);
      return Math.min(1.0, Math.max(0.0, sumBkt / bkt.length));
    }

    const attempts = await db.quizAttempts.where('userId').equals(userId).toArray();
    if (attempts.length > 0) {
      const sumAttempts = attempts.reduce((sum, a) => {
        let s = a.score ?? 0;
        if (s > 1.0) s = s / 100.0;
        return sum + s;
      }, 0);
      return Math.min(1.0, Math.max(0.0, sumAttempts / attempts.length));
    }

    const profile = await db.studentProfiles.get(userId);
    return profile?.difficultyLevel ?? 0.5;
  } catch (err) {
    console.error('Failed to compute student mastery', err);
    return 0.5;
  }
}
