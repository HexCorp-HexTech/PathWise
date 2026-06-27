/**
 * Vercel Serverless Function: /api/parse-syllabus
 * Parses raw syllabus text into a structured JSON curriculum using Gemini AI,
 * with a regex-based structural fallback.
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { board, grade, text } = req.body;

    if (!board || !grade || !text) {
      return res.status(400).json({ error: 'board, grade, and text are required.' });
    }

    const geminiKey = process.env.GEMINI_API_KEY;

    if (geminiKey) {
      const prompt = `You are an expert syllabus parser and curriculum designer.
Parse the following official school syllabus text and extract the subjects and their chapter lists suitable for Grade ${grade} under the ${board} board.
For each subject, list the chapter names, a brief description, learning objectives, difficulty (0.0 to 1.0), and estimated study time in minutes.

Return the result STRICTLY as a JSON object of this structure:
{
  "subjects": [
    {
      "name": "Mathematics",
      "chapters": [
        {
          "title": "Real Numbers",
          "description": "Properties of real numbers, prime factorization, HCF and LCM.",
          "learningObjectives": ["Verify prime factorization", "Calculate HCF and LCM"],
          "difficulty": 0.4,
          "estimatedTimeMin": 60
        }
      ]
    }
  ]
}

DO NOT wrap the response in markdown blocks or write anything else. Output only the raw JSON string.

Syllabus Text:
${text.slice(0, 15000)}`;

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
      } else {
        console.error('[parse-syllabus] Gemini API error:', await apiResp.text());
      }
    }

    // Fallback: structural regex parser
    console.log('[parse-syllabus] Falling back to regex parser.');
    const parsed = fallbackParseSyllabus(text);
    return res.status(200).json(parsed);
  } catch (err) {
    console.error('[parse-syllabus] Handler error:', err);
    return res.status(500).json({ error: err.message || 'Error parsing syllabus.' });
  }
}

function fallbackParseSyllabus(text) {
  const lowercaseText = text.toLowerCase();
  const subjects = [];

  const subjectList = [
    { name: 'Mathematics', keywords: ['math', 'algebra', 'geometry', 'arithmetic'] },
    { name: 'Science', keywords: ['science', 'physics', 'chemistry', 'biology', 'acid', 'motion'] },
    { name: 'English', keywords: ['english', 'grammar', 'literature', 'prose', 'poetry'] },
    { name: 'Social Science', keywords: ['social', 'history', 'geography', 'civics', 'polity'] },
  ];

  for (const subj of subjectList) {
    const hasSubject = subj.keywords.some((k) => lowercaseText.includes(k));
    if (hasSubject || (subjects.length === 0 && subj.name === 'Mathematics')) {
      const chapters = [];
      const paragraphs = text
        .split(/[.\n]/)
        .map((p) => p.trim())
        .filter((p) => p.length > 20);

      for (const p of paragraphs) {
        if (chapters.length >= 4) break;
        const cleanTitle = p
          .split(/[:;,]/)[0]
          .slice(0, 40)
          .replace(/[^a-zA-Z0-9\s]/g, '')
          .trim();
        if (cleanTitle.length > 8 && !chapters.some((c) => c.title.toLowerCase() === cleanTitle.toLowerCase())) {
          chapters.push({
            title: cleanTitle,
            description: p.slice(0, 150) + '...',
            learningObjectives: [
              `Understand the basics of ${cleanTitle}`,
              `Apply core theorems of ${cleanTitle}`,
            ],
            difficulty: parseFloat((0.3 + Math.random() * 0.4).toFixed(2)),
            estimatedTimeMin: 45 + Math.round(Math.random() * 6) * 5,
          });
        }
      }

      if (chapters.length === 0) {
        if (subj.name === 'Mathematics') {
          chapters.push(
            {
              title: 'Number Systems',
              description: 'Real numbers, rational and irrational representation.',
              learningObjectives: ['Master prime numbers', 'Prove irrationality'],
              difficulty: 0.4,
              estimatedTimeMin: 60,
            },
            {
              title: 'Algebraic Formulations',
              description: 'Solving linear equations and variables.',
              learningObjectives: ['Apply substitution method', 'Model equations'],
              difficulty: 0.5,
              estimatedTimeMin: 75,
            }
          );
        } else {
          chapters.push(
            {
              title: 'Core Principles',
              description: 'Overview and foundations of the curriculum topics.',
              learningObjectives: ['Recall key terminology', 'Describe main relationships'],
              difficulty: 0.4,
              estimatedTimeMin: 60,
            },
            {
              title: 'Applied Solutions',
              description: 'Practical problems and worked solutions in action.',
              learningObjectives: ['Analyze sample exercises', 'Solve test models'],
              difficulty: 0.5,
              estimatedTimeMin: 70,
            }
          );
        }
      }

      subjects.push({ name: subj.name, chapters });
    }
  }

  return { subjects };
}
