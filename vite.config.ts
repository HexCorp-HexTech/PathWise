import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import type { ViteDevServer } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      react(),
      {
        name: 'tts-and-syllabus-proxy',
        configureServer(server: ViteDevServer) {
          server.middlewares.use(async (req: any, res: any, next: any) => {
            const urlPath = req.url ? req.url.split('?')[0] : '';
            
            if (urlPath === '/api/tts' && req.method === 'POST') {
              try {
                let body = '';
                for await (const chunk of req) {
                  body += chunk;
                }
                const { text, voiceId } = JSON.parse(body);

                const apiKey = env.ELEVENLABS_API_KEY || process.env.ELEVENLABS_API_KEY;
                if (!apiKey) {
                  console.error('[Server TTS] ELEVENLABS_API_KEY is missing on the server.');
                  res.statusCode = 500;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ error: 'Voice services temporarily unavailable.' }));
                  return;
                }

                const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
                  method: 'POST',
                  headers: {
                    'xi-api-key': apiKey,
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    text: text,
                    model_id: 'eleven_multilingual_v2',
                    voice_settings: {
                      stability: 0.5,
                      similarity_boost: 0.75,
                    },
                  }),
                });

                if (!response.ok) {
                  const errorText = await response.text();
                  console.error('[Server TTS] ElevenLabs API error response:', errorText);
                  res.statusCode = 500;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ error: 'Voice services temporarily unavailable.' }));
                  return;
                }

                const arrayBuffer = await response.arrayBuffer();
                res.statusCode = 200;
                res.setHeader('Content-Type', 'audio/mpeg');
                res.end(Buffer.from(arrayBuffer));
              } catch (err) {
                console.error('[Server TTS] Error during proxy execution:', err);
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: 'Voice services temporarily unavailable.' }));
              }
            } else if (urlPath === '/api/fetch-syllabus' && req.method === 'POST') {
              try {
                let body = '';
                for await (const chunk of req) {
                  body += chunk;
                }
                const { url } = JSON.parse(body);
                if (!url) {
                  res.statusCode = 400;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ error: 'URL is required.' }));
                  return;
                }
                const response = await fetch(url);
                if (!response.ok) {
                  res.statusCode = 500;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ error: `Failed to fetch syllabus from website. Status: ${response.status}` }));
                  return;
                }
                const html = await response.text();
                const cleanText = html
                  .replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, '')
                  .replace(/<style[^>]*>([\s\S]*?)<\/style>/gi, '')
                  .replace(/<head[^>]*>([\s\S]*?)<\/head>/gi, '')
                  .replace(/<[^>]*>/g, ' ')
                  .replace(/\s+/g, ' ')
                  .trim();

                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ text: cleanText.slice(0, 100000) }));
              } catch (err: any) {
                console.error('[Server Syllabus] Fetch error:', err);
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: err.message || 'Error fetching website syllabus.' }));
              }
            } else if (urlPath === '/api/parse-syllabus' && req.method === 'POST') {
              try {
                let body = '';
                for await (const chunk of req) {
                  body += chunk;
                }
                const { board, grade, text } = JSON.parse(body);
                const geminiKey = env.GEMINI_API_KEY || process.env.GEMINI_API_KEY;

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

                  const apiResp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
                  });

                  if (apiResp.ok) {
                    const json = (await apiResp.json()) as any;
                    const geminiText = json.candidates?.[0]?.content?.parts?.[0]?.text || '';
                    const cleanedJsonText = geminiText.replace(/```json|```/g, '').trim();
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(cleanedJsonText);
                    return;
                  } else {
                    console.error('[Parser API Error]', await apiResp.text());
                  }
                }

                console.log('[Parser] Falling back to structural regex parser.');
                const parsed = fallbackParseSyllabus(text);
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(parsed));
              } catch (err: any) {
                console.error('[Server Syllabus] Parse error:', err);
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: err.message || 'Error parsing syllabus.' }));
              }
            } else if (urlPath === '/api/generate-chapter-content' && req.method === 'POST') {
              try {
                let body = '';
                for await (const chunk of req) {
                  body += chunk;
                }
                const { title, description, learningObjectives, board, grade, subject, lang } = JSON.parse(body);
                const geminiKey = env.GEMINI_API_KEY || process.env.GEMINI_API_KEY;

                if (geminiKey) {
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
3. No placeholders or placeholders phrases like PLACEHOLDER or TODO.
4. If Language is Hindi (hi), >=95% words in text must be Hindi (Devanagari script), keeping mathematical symbols in English standard form.`;

                  const apiResp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
                  });

                  if (apiResp.ok) {
                    const json = (await apiResp.json()) as any;
                    const geminiText = json.candidates?.[0]?.content?.parts?.[0]?.text || '';
                    const cleanedJsonText = geminiText.replace(/```json|```/g, '').trim();
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(cleanedJsonText);
                    return;
                  } else {
                    console.error('[Server ContentGen] Gemini API request failed:', apiResp.status, await apiResp.text());
                  }
                } else {
                  console.log('[Server ContentGen] Gemini API key not found. Triggering client-side fallback...');
                }

                res.statusCode = 503;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: 'AI Content Generation Service is temporarily unavailable. Falling back to rule-based engine.' }));
              } catch (err: any) {
                console.error('[Server ContentGen] Generate error:', err);
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: err.message || 'Error generating content.' }));
              }
            } else {
              next();
            }
          });
        }
      }
    ],
  };
})

function fallbackParseSyllabus(text: string) {
  const lowercaseText = text.toLowerCase();
  const subjects: any[] = [];
  
  const subjectList = [
    { name: 'Mathematics', keywords: ['math', 'algebra', 'geometry', 'arithmetic'] },
    { name: 'Science', keywords: ['science', 'physics', 'chemistry', 'biology', 'acid', 'motion'] },
    { name: 'English', keywords: ['english', 'grammar', 'literature', 'prose', 'poetry'] },
    { name: 'Social Science', keywords: ['social', 'history', 'geography', 'civics', 'polity'] }
  ];

  for (const subj of subjectList) {
    const hasSubject = subj.keywords.some(k => lowercaseText.includes(k));
    if (hasSubject || (subjects.length === 0 && subj.name === 'Mathematics')) {
      const chapters: any[] = [];
      const paragraphs = text.split(/[.\n]/).map(p => p.trim()).filter(p => p.length > 20);
      
      let limit = 4;
      for (const p of paragraphs) {
        if (chapters.length >= limit) break;
        const cleanTitle = p.split(/[:;,]/)[0].slice(0, 40).replace(/[^a-zA-Z0-9\s]/g, '').trim();
        if (cleanTitle.length > 8 && !chapters.some(c => c.title.toLowerCase() === cleanTitle.toLowerCase())) {
          chapters.push({
            title: cleanTitle,
            description: p.slice(0, 150) + '...',
            learningObjectives: [`Understand the basics of ${cleanTitle}`, `Apply core theorems of ${cleanTitle}`],
            difficulty: 0.3 + Math.random() * 0.4,
            estimatedTimeMin: 45 + Math.round(Math.random() * 6) * 5
          });
        }
      }

      if (chapters.length === 0) {
        if (subj.name === 'Mathematics') {
          chapters.push(
            { title: 'Number Systems', description: 'Real numbers, rational and irrational representation.', learningObjectives: ['Master prime numbers', 'Prove irrationality'], difficulty: 0.4, estimatedTimeMin: 60 },
            { title: 'Algebraic Formulations', description: 'Solving linear equations and variables.', learningObjectives: ['Apply substitution method', 'Model equations'], difficulty: 0.5, estimatedTimeMin: 75 }
          );
        } else {
          chapters.push(
            { title: 'Core Principles', description: 'Overview and foundations of the curriculum topics.', learningObjectives: ['Recall key terminology', 'Describe main relationships'], difficulty: 0.4, estimatedTimeMin: 60 },
            { title: 'Applied Solutions', description: 'Practical problems and worked solutions in action.', learningObjectives: ['Analyze sample exercises', 'Solve test models'], difficulty: 0.5, estimatedTimeMin: 70 }
          );
        }
      }

      subjects.push({
        name: subj.name,
        chapters: chapters
      });
    }
  }

  return { subjects };
}

