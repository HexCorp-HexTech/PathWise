/* ============================================
   VIDYA AI — Weakness Scoring Engine
   
   Computes per-student weakness scores for each chapter/skill.
   Score: 0.0 (strong) to 1.0 (very weak)
   
   Factors considered:
   1. Quiz performance (recent weighted more heavily)
   2. BKT mastery state
   3. Time taken relative to expected
   4. Error patterns (consistent vs random)
   5. Recency decay (older evidence matters less)
   ============================================ */

import type { QuizAttempt, BKTMastery, WeaknessScore } from '../types';
import { clamp } from './utils';

interface WeaknessInput {
  quizAttempts: QuizAttempt[];
  bktMastery?: BKTMastery;
  expectedTimeSec?: number;
}

/**
 * Calculate weakness score for a specific chapter
 * 
 * Algorithm:
 * W = w1 * (1 - avgScore) + w2 * (1 - pKnow) + w3 * timeRatio + w4 * inconsistency
 * 
 * Where:
 * - avgScore: exponentially weighted moving average of quiz scores
 * - pKnow: BKT knowledge state
 * - timeRatio: normalized time-taken vs expected (>1 = slower than expected)
 * - inconsistency: variance in scores (high variance = unstable knowledge)
 * 
 * Weights: w1=0.35, w2=0.30, w3=0.15, w4=0.20
 */
export function computeWeaknessScore(input: WeaknessInput): {
  score: number;
  confidence: number;
  factors: Record<string, number>;
} {
  const { quizAttempts, bktMastery, expectedTimeSec } = input;

  if (quizAttempts.length === 0) {
    return {
      score: 0.5, // Unknown = medium weakness
      confidence: 0,
      factors: { performance: 0.5, knowledge: 0.5, speed: 0.5, consistency: 0.5 },
    };
  }

  // 1. Performance factor — exponentially weighted average
  const sortedAttempts = [...quizAttempts].sort((a, b) => a.startedAt - b.startedAt);
  let weightedSum = 0;
  let weightTotal = 0;
  const decayFactor = 0.8;

  for (let i = 0; i < sortedAttempts.length; i++) {
    const weight = Math.pow(decayFactor, sortedAttempts.length - 1 - i);
    weightedSum += sortedAttempts[i].score * weight;
    weightTotal += weight;
  }

  const avgScore = weightTotal > 0 ? weightedSum / weightTotal : 0.5;
  const performanceFactor = 1 - avgScore;

  // 2. Knowledge factor from BKT
  const knowledgeFactor = bktMastery ? 1 - bktMastery.pKnow : 0.5;

  // 3. Speed factor — are they taking too long?
  let speedFactor = 0.5;
  if (expectedTimeSec && sortedAttempts.length > 0) {
    const avgTime = sortedAttempts.reduce((sum, a) => sum + a.timeTakenSec, 0) / sortedAttempts.length;
    const timeRatio = avgTime / expectedTimeSec;
    speedFactor = clamp(timeRatio - 0.5, 0, 1); // 0.5x expected = no weakness, 1.5x+ = full weakness
  }

  // 4. Consistency factor — high variance = unstable knowledge
  const scores = sortedAttempts.map((a) => a.score);
  const mean = scores.reduce((s, v) => s + v, 0) / scores.length;
  const variance = scores.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / scores.length;
  const inconsistencyFactor = clamp(Math.sqrt(variance) * 2, 0, 1);

  // Weighted combination
  const weights = { performance: 0.35, knowledge: 0.30, speed: 0.15, consistency: 0.20 };

  const score = clamp(
    weights.performance * performanceFactor +
    weights.knowledge * knowledgeFactor +
    weights.speed * speedFactor +
    weights.consistency * inconsistencyFactor,
    0,
    1
  );

  // Confidence increases with more evidence
  const confidence = clamp(Math.log2(quizAttempts.length + 1) / 4, 0, 1);

  return {
    score,
    confidence,
    factors: {
      performance: performanceFactor,
      knowledge: knowledgeFactor,
      speed: speedFactor,
      consistency: inconsistencyFactor,
    },
  };
}

/**
 * Rank subjects by weakness — returns subjects sorted weakest first
 */
export function rankWeaknesses(weaknesses: WeaknessScore[]): WeaknessScore[] {
  return [...weaknesses]
    .filter((w) => w.confidence > 0.2) // Only consider sufficiently confident scores
    .sort((a, b) => {
      // Primary sort: weakness score (higher = weaker)
      // Secondary sort: confidence (higher confidence first)
      const scoreDiff = b.weaknessScore - a.weaknessScore;
      if (Math.abs(scoreDiff) > 0.1) return scoreDiff;
      return b.confidence - a.confidence;
    });
}

/**
 * Determine if a chapter needs revision based on weakness data
 */
export function needsRevision(weakness: WeaknessScore): boolean {
  return weakness.weaknessScore > 0.4 && weakness.confidence > 0.3;
}

/**
 * Generate personalized recommendations based on weakness profile
 */
export function generateRecommendations(
  weaknesses: WeaknessScore[],
  subjectNames: Record<string, string>
): string[] {
  const recommendations: string[] = [];
  const sorted = rankWeaknesses(weaknesses);

  for (const w of sorted.slice(0, 3)) {
    const subjectName = subjectNames[w.subjectId] || 'this subject';

    if (w.weaknessScore > 0.7) {
      recommendations.push(`Focus on revising ${subjectName} — your fundamentals need strengthening`);
    } else if (w.weaknessScore > 0.5) {
      recommendations.push(`Practice more problems in ${subjectName} to improve consistency`);
    } else if (w.weaknessScore > 0.3) {
      recommendations.push(`Review key concepts in ${subjectName} before moving ahead`);
    }
  }

  return recommendations;
}
