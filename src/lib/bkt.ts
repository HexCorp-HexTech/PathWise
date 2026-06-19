/* ============================================
   VIDYA AI — Bayesian Knowledge Tracing (BKT)
   
   BKT models student knowledge as a hidden Markov model.
   P(L_n) = probability student has learned skill after n attempts
   
   Parameters:
   - P(L_0): initial probability of knowing (prior)
   - P(T):   probability of transitioning from unlearned to learned  
   - P(S):   probability of slipping (knows but answers wrong)
   - P(G):   probability of guessing (doesn't know but answers right)
   ============================================ */

import type { BKTMastery } from '../types';

// Default BKT parameters (calibrated for Indian curriculum)
const DEFAULT_P_KNOW = 0.1;
const DEFAULT_P_TRANSIT = 0.1;
const DEFAULT_P_SLIP = 0.1;
const DEFAULT_P_GUESS = 0.25;

// Mastery threshold — above this, the skill is considered mastered
const MASTERY_THRESHOLD = 0.95;

export interface BKTParams {
  pKnow: number;
  pTransit: number;
  pSlip: number;
  pGuess: number;
}

export interface BKTUpdateResult {
  pKnow: number;
  isMastered: boolean;
  confidence: number;
}

/**
 * Update P(L_n) given whether the student answered correctly
 * 
 * Using the standard BKT update equations:
 * 
 * If correct:
 *   P(L_n | correct) = P(L_n-1) * (1 - P(S)) / 
 *                       [P(L_n-1) * (1 - P(S)) + (1 - P(L_n-1)) * P(G)]
 * 
 * If incorrect:
 *   P(L_n | incorrect) = P(L_n-1) * P(S) / 
 *                          [P(L_n-1) * P(S) + (1 - P(L_n-1)) * (1 - P(G))]
 * 
 * Then apply learning transition:
 *   P(L_n) = P(L_n | obs) + (1 - P(L_n | obs)) * P(T)
 */
export function updateBKT(
  params: BKTParams,
  isCorrect: boolean
): BKTUpdateResult {
  const { pKnow, pTransit, pSlip, pGuess } = params;

  // Step 1: Posterior update given observation
  let pLnGivenObs: number;

  if (isCorrect) {
    const numerator = pKnow * (1 - pSlip);
    const denominator = pKnow * (1 - pSlip) + (1 - pKnow) * pGuess;
    pLnGivenObs = denominator > 0 ? numerator / denominator : pKnow;
  } else {
    const numerator = pKnow * pSlip;
    const denominator = pKnow * pSlip + (1 - pKnow) * (1 - pGuess);
    pLnGivenObs = denominator > 0 ? numerator / denominator : pKnow;
  }

  // Step 2: Apply learning transition
  const pKnowNew = pLnGivenObs + (1 - pLnGivenObs) * pTransit;

  // Clamp to valid probability range
  const clampedPKnow = Math.max(0.001, Math.min(0.999, pKnowNew));

  return {
    pKnow: clampedPKnow,
    isMastered: clampedPKnow >= MASTERY_THRESHOLD,
    confidence: Math.abs(clampedPKnow - 0.5) * 2, // 0 to 1, how confident we are
  };
}

/**
 * Batch update BKT for multiple responses
 */
export function batchUpdateBKT(
  initialParams: BKTParams,
  responses: boolean[]
): BKTUpdateResult {
  let currentParams = { ...initialParams };

  for (const isCorrect of responses) {
    const result = updateBKT(currentParams, isCorrect);
    currentParams = { ...currentParams, pKnow: result.pKnow };
  }

  return updateBKT(currentParams, responses[responses.length - 1]);
}

/**
 * Predict probability of correct response
 * P(correct) = P(L_n) * (1 - P(S)) + (1 - P(L_n)) * P(G)
 */
export function predictCorrect(params: BKTParams): number {
  return params.pKnow * (1 - params.pSlip) + (1 - params.pKnow) * params.pGuess;
}

/**
 * Calculate the number of practice items needed to reach mastery
 * Uses geometric series estimation
 */
export function estimatePracticeToMastery(params: BKTParams): number {
  let pKnow = params.pKnow;
  let count = 0;
  const maxIterations = 100;

  while (pKnow < MASTERY_THRESHOLD && count < maxIterations) {
    // Assume correct answers (optimistic estimate)
    const result = updateBKT({ ...params, pKnow }, true);
    pKnow = result.pKnow;
    count++;
  }

  return count;
}

/**
 * Create default BKT mastery record for a new skill
 */
export function createDefaultBKT(
  userId: string,
  chapterId: string,
  skillId: string
): Omit<BKTMastery, 'id'> {
  return {
    userId,
    chapterId,
    skillId,
    pKnow: DEFAULT_P_KNOW,
    pTransit: DEFAULT_P_TRANSIT,
    pSlip: DEFAULT_P_SLIP,
    pGuess: DEFAULT_P_GUESS,
    attempts: 0,
    lastUpdated: Date.now(),
  };
}

/**
 * Get recommended difficulty based on current knowledge state
 * Maps P(L_n) to an optimal difficulty level for maximum learning
 * 
 * Based on Zone of Proximal Development (ZPD):
 * - Too easy (mastery > 0.8): increase difficulty
 * - Sweet spot (0.4-0.8): maintain
 * - Too hard (< 0.4): decrease difficulty
 */
export function recommendDifficulty(pKnow: number): number {
  // Target ~70% success rate for optimal learning
  // difficulty = 1 - (pKnow * 0.7 + 0.15)
  return Math.max(0.1, Math.min(0.9, 1 - (pKnow * 0.6 + 0.2)));
}

export { MASTERY_THRESHOLD, DEFAULT_P_KNOW, DEFAULT_P_TRANSIT, DEFAULT_P_SLIP, DEFAULT_P_GUESS };
