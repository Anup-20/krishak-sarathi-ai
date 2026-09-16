const express = require('express');
const fetch = require('node-fetch');
const router = express.Router();

// System prompt shapes how the AI advisor behaves. Tune this to match your
// tone and areas of expertise. Keep answers practical and locally relevant.
const SYSTEM_PROMPT = `You are Sarathi, the AI farming advisor for Krishak Sarathi
(कृषक सारथी), an agriculture consultancy in Nepal. You help smallholder farmers
with practical advice on crops, soil, pests, fertilizer/subsidy schemes, and
market decisions.

Rules:
- Reply in the same language the farmer writes in (Nepali or English). If they
  mix both (Roman Nepali / Nepanglish), respond the same natural way.
- Keep answers short, concrete, and locally relevant to Nepal's agro-climate
  zones (Terai, Hill, Mountain) when relevant.
- If you are not fully certain about a government scheme's current rules,
  amounts, or deadlines, say so plainly and suggest the farmer confirm with
  their local Agriculture Knowledge Center (कृषि ज्ञान केन्द्र) or ward office,
  rather than inventing numbers.
- Never give advice that could damage crops or harm health (e.g. unsafe
  pesticide mixing or dosing) without a clear safety caveat.
- You are not a substitute for an in-person soil test or expert site visit for
  serious or high-value decisions — say so when it matters.`;

router.post('/', async (req, res) => {
  try {
    const { message, history } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'A "message" string is required.' });
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return res.status(500).json({
        error:
          'Server is missing ANTHROPIC_API_KEY. Add it to your .env (see .env.example).',
      });
    }

    // history: optional array of { role: 'user'|'assistant', content: string }
    // sent from the frontend so the advisor remembers the conversation so far.
    const messages = Array.isArray(history) ? [...history] : [];
    messages.push({ role: 'user', content: message });

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        // Check https://docs.claude.com/en/docs/about-claude/models for the
        // current recommended model name before you deploy.
        model: 'claude-sonnet-5',
        max_tokens: 700,
        system: SYSTEM_PROMPT,
        messages,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Anthropic API error:', data);
      return res.status(502).json({ error: 'AI service error', detail: data });
    }

    const textBlocks = (data.content || [])
      .filter((block) => block.type === 'text')
      .map((block) => block.text)
      .join('\n');

    res.json({ reply: textBlocks });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Unexpected server error.' });
  }
});

module.exports = router;
