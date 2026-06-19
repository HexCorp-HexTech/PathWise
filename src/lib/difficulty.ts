/* ============================================
   VIDYA AI — Difficulty Adaptation Engine
   
   Dynamically adjusts content difficulty based on:
   1. Current BKT mastery level
   2. Recent quiz performance
   3. Learning velocity (how fast they're improving)
   4. Engagement metrics (are they spending enough time?)
   ============================================ */

import { clamp } from './utils';

export interface DifficultyContext {
  currentDifficulty: number;  // 0.0 - 1.0
  recentScores: number[];     // Last N quiz scores (0-1)
  pKnow: number;              // BKT knowledge probability
  avgTimeRatio: number;       // actual time / expected time
  sessionCount: number;       // Total sessions for this topic
}

export interface DifficultyResult {
  newDifficulty: number;
  direction: 'easier' | 'same' | 'harder';
  reason: string;
}

/**
 * Adaptive difficulty algorithm
 * 
 * Target zone: 65-80% success rate (Zone of Proximal Development)
 * 
 * Rules:
 * 1. If success rate > 85% for last 3 attempts → increase difficulty
 * 2. If success rate < 50% for last 3 attempts → decrease difficulty
 * 3. If mastery (pKnow) > 0.8 → bias toward harder
 * 4. If time ratio > 1.5 → slight decrease (struggling with pace)
 * 5. Gradual adjustment (max ±0.15 per step)
 */
export function adaptDifficulty(ctx: DifficultyContext): DifficultyResult {
  const { currentDifficulty, recentScores, pKnow, avgTimeRatio } = ctx;

  if (recentScores.length === 0) {
    return {
      newDifficulty: currentDifficulty,
      direction: 'same',
      reason: 'Not enough data',
    };
  }

  // Calculate recent performance
  const recentN = recentScores.slice(-5);
  const avgScore = recentN.reduce((s, v) => s + v, 0) / recentN.length;
  const last3 = recentScores.slice(-3);
  const avg3 = last3.length > 0 ? last3.reduce((s, v) => s + v, 0) / last3.length : avgScore;

  // Learning velocity — are scores improving?
  let velocity = 0;
  if (recentScores.length >= 3) {
    const firstHalf = recentScores.slice(0, Math.floor(recentScores.length / 2));
    const secondHalf = recentScores.slice(Math.floor(recentScores.length / 2));
    const avgFirst = firstHalf.reduce((s, v) => s + v, 0) / firstHalf.length;
    const avgSecond = secondHalf.reduce((s, v) => s + v, 0) / secondHalf.length;
    velocity = avgSecond - avgFirst; // Positive = improving
  }

  let adjustment = 0;
  let reason = '';

  // Rule 1: High performance → increase difficulty
  if (avg3 > 0.85) {
    adjustment = 0.10 + (pKnow > 0.8 ? 0.05 : 0);
    reason = 'Excellent recent performance';
  }
  // Rule 2: Low performance → decrease difficulty
  else if (avg3 < 0.50) {
    adjustment = -0.12;
    reason = 'Struggling with current level';
  }
  // Rule 3: Moderate performance with high mastery → slight increase
  else if (avgScore > 0.70 && pKnow > 0.7) {
    adjustment = 0.05;
    reason = 'Strong knowledge foundation, ready for challenge';
  }
  // Rule 4: Moderate performance with improving velocity
  else if (velocity > 0.1) {
    adjustment = 0.05;
    reason = 'Showing improvement trend';
  }
  // Rule 5: Moderate performance with declining velocity
  else if (velocity < -0.15) {
    adjustment = -0.08;
    reason = 'Performance declining, reducing load';
  } else {
    reason = 'Maintaining current level';
  }

  // Time-based adjustment
  if (avgTimeRatio > 1.5 && adjustment > 0) {
    adjustment *= 0.5; // Halve increase if taking too long
    reason += ' (tempered due to pace)';
  }

  // Apply adjustment with max step size
  const maxStep = 0.15;
  const clampedAdjustment = clamp(adjustment, -maxStep, maxStep);
  const newDifficulty = clamp(currentDifficulty + clampedAdjustment, 0.05, 0.95);

  const direction: DifficultyResult['direction'] =
    clampedAdjustment > 0.01 ? 'harder' :
    clampedAdjustment < -0.01 ? 'easier' : 'same';

  return { newDifficulty, direction, reason };
}

/**
 * Map difficulty level to descriptive label
 */
export function difficultyLabel(difficulty: number): string {
  if (difficulty < 0.2) return 'Very Easy';
  if (difficulty < 0.4) return 'Easy';
  if (difficulty < 0.6) return 'Medium';
  if (difficulty < 0.8) return 'Hard';
  return 'Very Hard';
}

/**
 * Get color for difficulty level
 */
export function difficultyColor(difficulty: number): string {
  if (difficulty < 0.3) return 'var(--color-success)';
  if (difficulty < 0.6) return 'var(--color-warning)';
  return 'var(--color-error)';
}
