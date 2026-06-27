export function convertAiJsonToMarkdown(data: any, title: string, subject: string, board: string, grade: number): string {
  let text = `<div class="pdf-cover-page">
  <div class="pdf-cover-badge">${board} • Grade ${grade}</div>
  <h1 class="pdf-cover-title">${title}</h1>
  <div class="pdf-cover-subtitle">Complete Concept Notes & Diagnostic Guide</div>
  <div class="pdf-cover-metadata">Subject: ${subject} • Board: ${board} • Grade: Class ${grade} • Compiled by Pathwise AI Engine</div>
</div>\n\n`;

  text += `\n\n---\n**Curriculum Focus Information**:\n- **Board**: ${board}\n- **Class/Grade**: Grade ${grade}\n- **Subject**: ${subject}\n- **Chapter**: ${title}\n---\n\n`;

  text += `## Executive Summary & Overview\n\n${data.overview || ''}\n\n`;

  if (data.theorySections && data.theorySections.length > 0) {
    text += `## Core Concepts and Explanations\n\n`;
    data.theorySections.forEach((s: any) => {
      text += `### ${s.title}\n\n${s.content}\n\n`;
    });
  }

  if (data.formulas && data.formulas.length > 0) {
    text += `## Formula Cheat Sheet\n\n`;
    text += `| Formula Name | Equation | Explanation |\n`;
    text += `| :--- | :---: | :--- |\n`;
    data.formulas.forEach((f: any) => {
      text += `| **${f.name}** | $${f.formula}$ | ${f.explanation} |\n`;
    });
    text += `\n`;
  }

  if (data.workedExamples && data.workedExamples.length > 0) {
    text += `## Step-by-Step Worked Problems\n\n`;
    data.workedExamples.forEach((ex: any, idx: number) => {
      text += `### Problem ${idx + 1}:\n${ex.question}\n\n**Step-by-step Solution**:\n`;
      if (Array.isArray(ex.stepByStep)) {
        ex.stepByStep.forEach((step: string, stepIdx: number) => {
          text += `${stepIdx + 1}. ${step}\n`;
        });
      } else {
        text += `${ex.stepByStep}\n`;
      }
      text += `\n**Final Answer**: ${ex.solution}\n\n`;
    });
  }

  if (data.commonMistakes && data.commonMistakes.length > 0) {
    text += `## Common Mistakes to Avoid\n\n`;
    text += `| Common Pitfall | Recommended Correction | Explanation |\n`;
    text += `| :--- | :--- | :--- |\n`;
    data.commonMistakes.forEach((m: any) => {
      text += `| *${m.mistake}* | **${m.correction}** | ${m.explanation} |\n`;
    });
    text += `\n`;
  }

  if ((data.examTricks && data.examTricks.length > 0) || (data.memoryTips && data.memoryTips.length > 0)) {
    text += `## High-Yield Exam Preparation\n\n`;
    if (data.examTricks) {
      data.examTricks.forEach((trick: string) => {
        text += `> [!TIP]\n> **Exam Trick**: ${trick}\n\n`;
      });
    }
    if (data.memoryTips) {
      data.memoryTips.forEach((tip: string) => {
        text += `> [!NOTE]\n> **Memory Mnemonic**: ${tip}\n\n`;
      });
    }
  }

  if (data.summaryPoints && data.summaryPoints.length > 0) {
    text += `## Key Takeaways\n\n`;
    data.summaryPoints.forEach((point: string) => {
      text += `- ${point}\n`;
    });
    text += `\n`;
  }

  text += `## Revision Checklist\n\n`;
  text += `- [ ] Memorize the core definitions.\n`;
  text += `- [ ] Master the formulas on the cheat sheet.\n`;
  text += `- [ ] Re-solve the worked examples without looking.\n`;
  text += `- [ ] Double-check common exam pitfalls.\n`;
  text += `- [ ] Complete the diagnostic quiz and check solutions.\n`;

  return text;
}
