/* ============================================
   VIDYA AI — Student Mastery Computation Helper
   ============================================ */
import { db } from './db';

export async function computeStudentMastery(userId: string): Promise<number> {
  try {
    const attempts = await db.quizAttempts.where('userId').equals(userId).toArray();
    const bkt = await db.bktMastery.where('userId').equals(userId).toArray();

    let totalScoreSum = 0;
    let totalCount = 0;

    for (const a of attempts) {
      let s = a.score ?? 0;
      if (s > 1.0) {
        s = s / 100.0; // sanitize percentage
      }
      totalScoreSum += s;
      totalCount++;
    }

    for (const b of bkt) {
      let p = b.pKnow ?? 0;
      if (p > 1.0) {
        p = p / 100.0; // sanitize percentage
      }
      totalScoreSum += p;
      totalCount++;
    }

    if (totalCount === 0) {
      const profile = await db.studentProfiles.get(userId);
      return profile?.difficultyLevel ?? 0.5;
    }

    return Math.min(1.0, Math.max(0.0, totalScoreSum / totalCount));
  } catch (err) {
    console.error('Failed to compute student mastery', err);
    return 0.5;
  }
}
