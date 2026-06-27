/**
 * Vercel Serverless Function: /api/fetch-syllabus
 * Fetches a URL and returns stripped plain text for syllabus parsing.
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'URL is required.' });
    }

    const response = await fetch(url, {
      headers: { 'User-Agent': 'PathWise-Bot/1.0' },
    });

    if (!response.ok) {
      return res.status(502).json({
        error: `Failed to fetch syllabus from website. Status: ${response.status}`,
      });
    }

    const html = await response.text();
    const cleanText = html
      .replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, '')
      .replace(/<style[^>]*>([\s\S]*?)<\/style>/gi, '')
      .replace(/<head[^>]*>([\s\S]*?)<\/head>/gi, '')
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    return res.status(200).json({ text: cleanText.slice(0, 100000) });
  } catch (err) {
    console.error('[fetch-syllabus] Error:', err);
    return res.status(500).json({ error: err.message || 'Error fetching website syllabus.' });
  }
}
