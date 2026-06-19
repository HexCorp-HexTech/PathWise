# Pathwise — Learning Style Detection Architecture

Pathwise incorporates an adaptive learning style detection engine that classifies student interactions and dynamically updates the visual presentation order of dashboard blocks. This guide details the theory, math, and code implementation of this system.

## 1. Classification Categories
Pathwise classifies student learning modalities into four distinct preferences based on the Fleming VARK model:

1. **Visual (V)**: Students who absorb concepts best through structural visual layouts, SVG charts, parabolas, number lines, and diagrams.
2. **Auditory (A)**: Students who learn best by listening. They engage with voice synthesis features, text-to-speech reading buttons, and sound callouts.
3. **Kinesthetic (K)**: Students who learn through interactive, tactile inputs. They engage with flashcard swiping, 3D card flips, dragging sliders, and clicking options.
4. **Reading/Writing (R)**: Students who prefer text. They read complete theoretical descriptions, exam guides, summaries, and bullet points.

---

## 2. Dynamic Engagement Profiling Heuristic
To determine a student's learning style without requiring long diagnostic surveys, the system tracks engagement duration (in seconds) across different educational activities.

### Engagement Vectors
Each study session type acts as an input vector matching one or more learning styles:

| Activity / Event | Primary Modality | Weight | Tracking Metric |
| :--- | :--- | :--- | :--- |
| Viewing SVG Diagram | Visual | `0.4` | Viewport time in diagram div |
| Clicking Copy LaTeX | Visual / Reading | `0.3` | Copy button click event |
| Playing Voice Text-to-Speech | Auditory | `0.8` | Audio playback duration |
| Swiping Flashcard | Kinesthetic | `0.6` | Count of card reviews |
| Clicking MCQ Quiz Option | Kinesthetic | `0.3` | Quiz attempts & select inputs |
| Scroll Duration in Notes text | Reading | `0.5` | Scroll time in notes body |

---

## 3. Classification Formula
The student's preference profile is a normalized vector:

$$\vec{P} = [P_v, P_a, P_k, P_r]$$

For each category $c \in \{v, a, k, r\}$:

$$S_c = \sum_{i \in \text{activities}} (\text{Duration}_i \times \text{Weight}_{i,c}) + (\text{Count}_i \times \text{ClickWeight}_{i,c})$$

$$P_c = \frac{S_c}{\sum_{j} S_j}$$

The learning style preference is assigned to the modality with the highest score $P_c$:

$$\text{Preference} = \arg\max_{c} (P_c)$$

---

## 4. Code Implementation

The following is the TypeScript module implementing this classification check:

```typescript
import type { StudySession, LearningStyle } from '../types';

interface ScoreMatrix {
  visual: number;
  auditory: number;
  kinesthetic: number;
  reading: number;
}

/**
 * Detects and returns the dominant learning style based on historical study sessions.
 */
export function detectLearningStyle(sessions: StudySession[]): LearningStyle {
  const scores: ScoreMatrix = {
    visual: 0,
    auditory: 0,
    kinesthetic: 0,
    reading: 0,
  };

  // Base weight profiles matching activity durations (seconds)
  sessions.forEach((session) => {
    const duration = session.durationSec;
    
    switch (session.activityType) {
      case 'video':
        scores.visual += duration * 0.7;
        scores.auditory += duration * 0.3;
        break;
      case 'chat':
        scores.reading += duration * 0.5;
        scores.kinesthetic += duration * 0.5;
        break;
      case 'notes':
        scores.reading += duration * 0.6;
        scores.visual += duration * 0.4;
        break;
      case 'quiz':
        scores.kinesthetic += duration * 0.8;
        scores.reading += duration * 0.2;
        break;
      case 'flashcard':
        scores.kinesthetic += duration * 0.9;
        scores.visual += duration * 0.1;
        break;
      default:
        scores.reading += duration * 0.5;
        break;
    }
  });

  const total = scores.visual + scores.auditory + scores.kinesthetic + scores.reading;
  if (total === 0) return 'visual'; // Default fallback

  // Find dominant category
  let maxScore = -1;
  let dominant: LearningStyle = 'visual';

  const entries = Object.entries(scores) as [LearningStyle, number][];
  for (const [style, score] of entries) {
    if (score > maxScore) {
      maxScore = score;
      dominant = style;
    }
  }

  return dominant;
}
```

## 5. UI Presentation Adaptation
Based on the detected preference, the Student Dashboard re-orders its visual blocks dynamically:
- **Visual Preferenced**: Conceptual maps, SVG charts, and progress circles are pinned to the top.
- **Auditory Preferenced**: "Ask Gyani" and text-to-speech audio controls are highlighted.
- **Kinesthetic Preferenced**: Spaced repetition flashcards and quick quiz reviews are featured.
- **Reading Preferenced**: Bullet point textbook notes and exam prep checklists are expanded.
