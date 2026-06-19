/* ============================================
   VIDYA AI — SM-2 Spaced Repetition Algorithm
   
   SuperMemo-2 algorithm for optimal review scheduling.
   
   Variables:
   - EF (Easiness Factor): minimum 1.3, default 2.5
   - interval: days until next review
   - repetitions: count of successful reviews in a row
   
   Quality scale: 0-5
   - 5: perfect response
   - 4: correct response after hesitation
   - 3: correct response with difficulty
   - 2: incorrect but remembered upon seeing answer
   - 1: incorrect, vague memory
   - 0: complete blackout
   ============================================ */

import type { SM2Card } from '../types';

export interface SM2Result {
  easiness: number;
  interval: number;
  repetitions: number;
  nextReviewDate: string;
}

/**
 * SM-2 Algorithm Implementation
 * 
 * Algorithm:
 * 1. If quality >= 3 (correct):
 *    - repetitions++
 *    - if repetitions == 1: interval = 1
 *    - if repetitions == 2: interval = 6
 *    - else: interval = round(interval * EF)
 * 2. If quality < 3 (incorrect):
 *    - repetitions = 0
 *    - interval = 1
 * 3. Update EF:
 *    EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
 *    EF = max(1.3, EF')
 */
export function calculateSM2(
  currentEasiness: number,
  currentInterval: number,
  currentRepetitions: number,
  quality: number // 0-5
): SM2Result {
  // Clamp quality to valid range
  const q = Math.max(0, Math.min(5, Math.round(quality)));

  let easiness = currentEasiness;
  let interval = currentInterval;
  let repetitions = currentRepetitions;

  // Update easiness factor
  easiness = easiness + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
  easiness = Math.max(1.3, easiness);

  if (q >= 3) {
    // Correct response
    repetitions += 1;
    if (repetitions === 1) {
      interval = 1;
    } else if (repetitions === 2) {
      interval = 6;
    } else {
      interval = Math.round(interval * easiness);
    }
  } else {
    // Incorrect response — reset
    repetitions = 0;
    interval = 1;
  }

  // Calculate next review date
  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + interval);
  const nextReviewDate = nextDate.toISOString().split('T')[0];

  return {
    easiness,
    interval,
    repetitions,
    nextReviewDate,
  };
}

/**
 * Convert quiz score (0-100) to SM-2 quality (0-5)
 */
export function scoreToQuality(scorePercent: number): number {
  if (scorePercent >= 95) return 5;
  if (scorePercent >= 80) return 4;
  if (scorePercent >= 60) return 3;
  if (scorePercent >= 40) return 2;
  if (scorePercent >= 20) return 1;
  return 0;
}

/**
 * Get cards due for review today
 */
export function isDueForReview(card: SM2Card): boolean {
  if (!card.nextReviewDate) return true;
  const today = new Date().toISOString().split('T')[0];
  return card.nextReviewDate <= today;
}

/**
 * Priority score for review ordering
 * Lower interval = higher priority (more urgent)
 * Lower easiness = higher priority (harder cards first)
 */
export function reviewPriority(card: SM2Card): number {
  const overdueDays = card.nextReviewDate
    ? Math.max(0, Math.floor((Date.now() - new Date(card.nextReviewDate).getTime()) / 86400000))
    : 100;

  return overdueDays * 10 + (3 - card.easiness) * 5 + (1 / (card.interval || 1));
}

/**
 * Create a new SM-2 card record
 */
export function createSM2Card(
  userId: string,
  flashcardId: string
): Omit<SM2Card, 'id'> {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  return {
    userId,
    flashcardId,
    easiness: 2.5,
    interval: 1,
    repetitions: 0,
    nextReviewDate: tomorrow.toISOString().split('T')[0],
  };
}

/**
 * Estimate retention rate based on current SM-2 parameters
 * Uses approximate forgetting curve: R = e^(-t/S)
 * where S is stability (proportional to interval * easiness)
 */
export function estimateRetention(card: SM2Card): number {
  if (!card.lastReviewDate) return 0.5;

  const daysSinceReview = Math.floor(
    (Date.now() - new Date(card.lastReviewDate).getTime()) / 86400000
  );

  const stability = card.interval * card.easiness;
  const retention = Math.exp(-daysSinceReview / Math.max(stability, 1));

  return Math.max(0, Math.min(1, retention));
}
