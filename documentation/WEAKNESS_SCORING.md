# PathWise — Adaptive Weakness Scoring Engine

Pathwise implements an analytical cognitive scoring model to diagnose student conceptual gaps. This document covers the mathematical framework, parameters, decay profiles, and code implementations used to track student struggles.

---

## 1. Math Model Overview
The weakness score ($W$) is normalized from `0.0` (exceptional strength/mastery) to `1.0` (extreme weakness/critical gap). The score combines historical performance, latent cognitive mastery, time overheads, and score variance.

The composite scoring equation is:

$$W = w_p \cdot P_f + w_k \cdot K_f + w_s \cdot S_f + w_c \cdot C_f$$

Where:
* **$P_f$ (Performance Factor)**: Sourced from quiz history.
* **$K_f$ (Knowledge Factor)**: Sourced from the Bayesian Knowledge Tracing state.
* **$S_f$ (Speed/Time Factor)**: Sourced from average completion time relative to expected targets.
* **$C_f$ (Consistency Factor)**: Measures variance in student scores.

### Target Component Weights
* $w_p = 0.35$ (Performance weight)
* $w_k = 0.30$ (BKT latent state weight)
* $w_s = 0.15$ (Time overhead weight)
* $w_c = 0.20$ (Inconsistency weight)

---

## 2. Factor Computations

### 1. Performance Factor ($P_f$)
Uses an Exponentially Weighted Moving Average (EWMA) to place greater emphasis on recent quiz attempts. The decay rate $\alpha$ is calibrated to `0.8`:

$$\text{EWMA}_t = \frac{\sum_{i=1}^{n} \text{Score}_i \cdot \alpha^{n - i}}{\sum_{i=1}^{n} \alpha^{n - i}}$$

$$P_f = 1 - \text{EWMA}_t$$

### 2. Knowledge Factor ($K_f$)
Uses the BKT mastery probability $P(L_n)$ mapped inversely:

$$K_f = 1 - P(L_n)$$

### 3. Speed Factor ($S_f$)
Slower response times relative to the expected chapter timeframe denote hesitation. The time ratio is computed as:

$$\text{Ratio} = \frac{\text{Average Time Taken (seconds)}}{\text{Expected Timeframe (seconds)}}$$

$$S_f = \text{clamp}(\text{Ratio} - 0.5, 0.1, 0.9)$$

* A ratio $\le 0.5$ (twice as fast as expected) yields a speed factor of $0$.
* A ratio $\ge 1.5$ (slower than expected) yields a speed factor of $1$.

### 4. Consistency Factor ($C_f$)
High variance across quiz scores indicates unstable knowledge. The consistency factor is calculated from the variance of scores:

$$\sigma^2 = \frac{1}{n}\sum_{i=1}^{n} (\text{Score}_i - \mu)^2$$

$$C_f = \text{clamp}(\sigma \cdot 2, 0, 1)$$

---

## 3. Evidence Confidence Modeling
To prevent jumping to conclusions on limited evidence, the engine maps a logarithmic confidence bound based on the count of quiz attempts ($n$):

$$\text{Confidence} = \text{clamp}\left(\frac{\log_2(n + 1)}{4}, 0, 1\right)$$

* **$n = 0$**: Confidence = $0$ (weakness score defaults to `0.5`).
* **$n = 3$**: Confidence = $0.5$.
* **$n = 15$**: Confidence = $1.0$ (complete statistical certainty).

---

## 4. Code Implementation

This mathematical pipeline is executed in [`src/lib/weakness.ts`](../src/lib/weakness.ts):

```typescript
import type { QuizAttempt, BKTMastery } from '../types';
import { clamp } from './utils';

interface WeaknessInput {
  quizAttempts: QuizAttempt[];
  bktMastery?: BKTMastery;
  expectedTimeSec?: number;
}

export function computeWeaknessScore(input: WeaknessInput) {
  const { quizAttempts, bktMastery, expectedTimeSec } = input;

  if (quizAttempts.length === 0) {
    return {
      score: 0.5,
      confidence: 0,
      factors: { performance: 0.5, knowledge: 0.5, speed: 0.5, consistency: 0.5 }
    };
  }

  // 1. EWMA Performance factor
  const sorted = [...quizAttempts].sort((a, b) => a.startedAt - b.startedAt);
  let weightedSum = 0;
  let weightTotal = 0;
  const decayFactor = 0.8;

  for (let i = 0; i < sorted.length; i++) {
    const weight = Math.pow(decayFactor, sorted.length - 1 - i);
    weightedSum += sorted[i].score * weight;
    weightTotal += weight;
  }
  const performanceFactor = 1 - (weightedSum / weightTotal);

  // 2. Latent BKT Knowledge factor
  const knowledgeFactor = bktMastery ? 1 - bktMastery.pKnow : 0.5;

  // 3. Normalized speed factor
  let speedFactor = 0.5;
  if (expectedTimeSec) {
    const avgTime = sorted.reduce((sum, a) => sum + a.timeTakenSec, 0) / sorted.length;
    speedFactor = clamp(avgTime / expectedTimeSec - 0.5, 0, 1);
  }

  // 4. Score variance (Inconsistency factor)
  const scores = sorted.map(a => a.score);
  const mean = scores.reduce((s, v) => s + v, 0) / scores.length;
  const variance = scores.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / scores.length;
  const inconsistencyFactor = clamp(Math.sqrt(variance) * 2, 0, 1);

  // Combine factors using the weight matrices
  const score = clamp(
    0.35 * performanceFactor +
    0.30 * knowledgeFactor +
    0.15 * speedFactor +
    0.20 * inconsistencyFactor,
    0,
    1
  );

  const confidence = clamp(Math.log2(quizAttempts.length + 1) / 4, 0, 1);

  return {
    score,
    confidence,
    factors: {
      performance: performanceFactor,
      knowledge: knowledgeFactor,
      speed: speedFactor,
      consistency: inconsistencyFactor
    }
  };
}
```
---

## 5. Academic Remediation Triggering
The student dashboard and class recommendations filter tasks based on these triggers:
* **`needsRevision(weakness)`**: True if the weakness score exceeds `0.4` with a confidence score greater than `0.3`.
* **High Gaps ($W > 0.7$)**: Triggers fundamental revision exercises on the dashboard and labels the student as **"High Risk"** on the teacher dashboard to suggest manual intervention.
* **Medium Gaps ($0.5 \le W \le 0.7$)**: Prompts BKT quiz practice recommendations with customized help sheets.
