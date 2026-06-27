# PathWise — Spaced Repetition (SM-2) Model

Pathwise uses the SuperMemo-2 (SM-2) spaced repetition algorithm to schedule vocabulary and formula flashcards. This document details the algorithm's mathematical foundations, parameters, and the TypeScript scheduling implementations.

---

## 1. Algorithm Overview
The SM-2 algorithm computes the optimal intervals (in days) between successive reviews of a specific card to maximize memory retention while minimizing the number of review repetitions.

The scheduling calculations rely on three key parameters:
1. **Easiness Factor ($EF$)**: Indicates how easy the card is to remember. It defaults to `2.5`. The minimum allowed $EF$ is `1.3` (to prevent intervals from collapsing).
2. **Repetitions ($R$)**: Count of successive correct reviews. A single incorrect response resets this counter to `0`.
3. **Interval ($I$)**: The number of days the system waits before presenting the card again for review.

---

## 2. Mathematical Rules
When a user reviews a card, they rate their recall quality on a scale of $q \in \{0, 1, 2, 3, 4, 5\}$:

| Quality ($q$) | Description | Correctness |
| :---: | :--- | :---: |
| **5** | Perfect, instantaneous recall | Correct |
| **4** | Correct response after some hesitation | Correct |
| **3** | Correct response but with significant effort | Correct |
| **2** | Incorrect, but easily recognized upon seeing answer | Incorrect |
| **1** | Incorrect, but with vague trace of memory | Incorrect |
| **0** | Complete blackout | Incorrect |

### 1. Update the Easiness Factor ($EF$)
The Easiness Factor changes dynamically based on the review quality $q$:

$$EF' = EF + \left(0.1 - (5 - q) \cdot \left(0.08 + (5 - q) \cdot 0.02\right)\right)$$

$$EF = \max(1.3, EF')$$

### 2. Calculate the Next Interval ($I$)
- **If the answer was incorrect ($q < 3$)**: Reset repetitions to $0$ and set the interval to $1$ day.
  $$R = 0, \quad I = 1$$
- **If the answer was correct ($q \ge 3$)**:
  - For $R = 1$ (first review): $I = 1$ day.
  - For $R = 2$ (second review): $I = 6$ days.
  - For $R > 2$: Scale the interval by the updated Easiness Factor:
    $$I_R = \text{round}(I_{R-1} \cdot EF)$$

---

## 3. Code Implementation

These calculations are implemented in [`src/lib/sm2.ts`](../src/lib/sm2.ts):

```typescript
export interface SM2Result {
  easiness: number;
  interval: number;
  repetitions: number;
  nextReviewDate: string;
}

/**
 * Calculates updated SM-2 parameters based on response quality.
 */
export function calculateSM2(
  currentEasiness: number,
  currentInterval: number,
  currentRepetitions: number,
  quality: number // Range 0-5
): SM2Result {
  const q = Math.max(0, Math.min(5, Math.round(quality)));

  let easiness = currentEasiness;
  let interval = currentInterval;
  let repetitions = currentRepetitions;

  // 1. Calculate updated Easiness Factor
  easiness = easiness + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
  easiness = Math.max(1.3, easiness);

  // 2. Calculate updated Interval and Repetition count
  if (q >= 3) {
    repetitions += 1;
    if (repetitions === 1) {
      interval = 1;
    } else if (repetitions === 2) {
      interval = 6;
    } else {
      interval = Math.round(interval * easiness);
    }
  } else {
    repetitions = 0;
    interval = 1;
  }

  // 3. Compute target ISO date
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
```

---

## 4. Retrospective Forgetting Curves
To calculate progress analytics, the system estimates the student's *retention probability* $R$ based on the time elapsed since the last review:

$$R = e^{-\frac{t}{S}}$$

where:
- $t$ is the elapsed time (in days) since the card was last reviewed.
- $S$ is the memory stability factor, defined as:
  $$S = I \cdot EF$$
This is computed dynamically in `estimateRetention(card)` to populate study plans and parent dashboard analytics.
