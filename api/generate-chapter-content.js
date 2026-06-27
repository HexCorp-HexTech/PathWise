/**
 * Vercel Serverless Function: /api/generate-chapter-content
 * Uses Gemini AI to generate full chapter content packages (notes, flashcards, quiz questions).
 * Falls back with a 503 to trigger the client's rule-based offline engine.
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { title, description, learningObjectives, board, grade, subject, lang } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'title is required.' });
    }

    const geminiKey = process.env.GEMINI_API_KEY;

    if (!geminiKey) {
      console.log('[generate-chapter-content] GEMINI_API_KEY not configured. Triggering client fallback.');
      return res.status(503).json({
        error: 'AI Content Generation Service is temporarily unavailable. Falling back to rule-based engine.',
      });
    }

    const prompt = `You are a premium AI teacher. Generate a comprehensive educational content package in JSON format for the chapter:
Chapter: "${title}"
Description: "${description}"
Learning Objectives: ${JSON.stringify(learningObjectives)}
Grade: Class ${grade}
Board: ${board}
Subject: ${subject}
Language: ${lang === 'hi' ? 'Hindi (convert headers/content to Devanagari Hindi)' : 'English'}

The JSON output must strictly fit this schema (do NOT wrap in markdown \`\`\`json block, return only the raw JSON string):
{
  "overview": "Detailed chapter summary overview. Math formulas must use KaTeX $ and $$.",
  "theorySections": [
    { "title": "Section Title", "content": "Detailed textbook explanation of the topic." }
  ],
  "formulas": [
    { "name": "Formula Name", "formula": "KaTeX string (e.g. E = mc^2)", "explanation": "Brief explanation of terms" }
  ],
  "workedExamples": [
    { "question": "Question text", "stepByStep": ["Step 1 explanation", "Step 2 explanation"], "solution": "Final answer" }
  ],
  "commonMistakes": [
    { "mistake": "Typical student mistake", "correction": "Correct approach", "explanation": "Why this happens" }
  ],
  "examTricks": ["Tip 1", "Tip 2"],
  "memoryTips": ["Mnemonic/trick 1"],
  "summaryPoints": ["Key point 1", "Key point 2"],
  "flashcards": [
    { "front": "Question/definition front", "back": "Answer back", "difficulty": 0.3 }
  ],
  "quizQuestions": [
    {
      "questionText": "Question text",
      "questionType": "mcq",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": "Option A",
      "explanation": "Why this is correct",
      "difficulty": 0.4,
      "bloomLevel": "apply",
      "tags": ["tag1", "tag2"]
    }
  ]
}

Enforce:
1. Generate exactly 15 flashcards (5 definition, 5 concept, 5 application).
2. Generate exactly 15 quiz questions.
3. No placeholders or placeholder phrases like PLACEHOLDER or TODO.
4. If Language is Hindi (hi), >=95% words in text must be Hindi (Devanagari script), keeping mathematical symbols in English standard form.`;

    const apiResp = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      }
    );

    if (apiResp.ok) {
      const json = await apiResp.json();
      const geminiText = json.candidates?.[0]?.content?.parts?.[0]?.text || '';
      const cleanedJsonText = geminiText.replace(/```json|```/g, '').trim();
      res.setHeader('Content-Type', 'application/json');
      return res.status(200).send(cleanedJsonText);
    }

    console.error('[generate-chapter-content] Gemini API request failed:', apiResp.status, await apiResp.text());
    return res.status(503).json({
      error: 'AI Content Generation Service is temporarily unavailable. Falling back to rule-based engine.',
    });
  } catch (err) {
    console.error('[generate-chapter-content] Handler error:', err);
    return res.status(500).json({ error: err.message || 'Error generating content.' });
  }
}
