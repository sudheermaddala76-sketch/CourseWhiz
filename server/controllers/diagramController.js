const { generateContent } = require('../services/gemini');

const MAX_TEXT_LENGTH = 5000;

const sanitizeString = (value, fallback = '') => {
    if (typeof value !== 'string') return fallback;
    return value.trim();
};

const safeParseModelJson = (rawText) => {
    if (typeof rawText !== 'string' || !rawText.trim()) {
        throw new Error('Model returned empty response');
    }

    const cleaned = rawText
        .replace(/```json/gi, '')
        .replace(/```/g, '')
        .trim();

    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');
    if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
        throw new Error('Model response is not valid JSON object');
    }

    return JSON.parse(cleaned.slice(firstBrace, lastBrace + 1));
};

const validateAndNormalizeVisual = (payload) => {
    if (!payload || typeof payload !== 'object') {
        throw new Error('Invalid visual payload');
    }

    const title = sanitizeString(payload.title, 'Visual Summary');
    const layout = sanitizeString(payload.layout, 'infographic').toLowerCase();
    const allowedLayouts = new Set([
        'infographic',
        'comparison',
        'step-by-step',
        'hierarchy',
        'concept-summary',
        'timeline',
        'process'
    ]);
    const normalizedLayout = allowedLayouts.has(layout) ? layout : 'infographic';

    const rawSections = Array.isArray(payload.sections) ? payload.sections : [];
    if (rawSections.length === 0) {
        throw new Error('At least one section is required');
    }

    const sections = rawSections.slice(0, 8).map((section, index) => ({
        label: sanitizeString(section?.label, `Point ${index + 1}`),
        icon: sanitizeString(section?.icon, 'sparkles').toLowerCase(),
        color: sanitizeString(section?.color, 'blue').toLowerCase(),
        content: sanitizeString(section?.content, 'No details provided')
    }));

    return { title, layout: normalizedLayout, sections };
};

const buildPrompt = ({ text, action = 'generate', previousDiagram = null }) => `
You are a visual learning designer creating elegant educational infographic cards.
Convert the selected text into a beautiful visual summary structure.

Rules:
- Output JSON only. No markdown, no comments, no code fences.
- Use this exact shape:
{
  "title": "Visualization: Representing Information Visually",
  "layout": "infographic",
  "sections": [
    {
      "label": "Purpose",
      "icon": "target",
      "color": "yellow",
      "content": "Representing information, data, and ideas visually"
    }
  ]
}
- Valid layout values: "infographic", "comparison", "step-by-step", "hierarchy", "concept-summary", "timeline", "process"
- Sections count: 3 to 6
- Keep labels short and educational
- Keep content concise and student-friendly
- Prefer presentation-style wording
- Never output node-edge graph format

Action: ${action}
${previousDiagram ? `Previous visual JSON:\n${JSON.stringify(previousDiagram)}` : ''}

Selected text:
${text}
`;

const generateDiagram = async (req, res) => {
    try {
        const { text, action, previousDiagram } = req.body || {};
        const cleanedText = sanitizeString(text);

        if (!cleanedText) {
            return res.status(400).json({ error: 'text is required' });
        }

        if (cleanedText.length < 20) {
            return res.status(400).json({ error: 'Please select more descriptive text' });
        }

        if (cleanedText.length > MAX_TEXT_LENGTH) {
            return res.status(400).json({ error: `Text must be under ${MAX_TEXT_LENGTH} characters` });
        }

        const prompt = buildPrompt({ text: cleanedText, action, previousDiagram });
        const modelOutput = await generateContent(prompt);
        const parsed = safeParseModelJson(modelOutput);
        const normalized = validateAndNormalizeVisual(parsed);

        return res.json({ diagram: normalized });
    } catch (error) {
        console.error('Generate Diagram Error:', error);
        return res.status(422).json({
            error: 'Unable to generate a valid visual summary from the selected text'
        });
    }
};

module.exports = { generateDiagram };
