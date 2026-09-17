const express = require('express');
const fetch = require('node-fetch');
const router = express.Router();
const schemesData = require('../data/schemes.json');

// This route uses Google's Gemini API, which has a genuinely free tier (no
// credit card, no expiration — see https://aistudio.google.com) rather than
// Anthropic's Claude API, which requires either a paid trial or billing set
// up. If you later want to switch to Claude (e.g. once you can add billing),
// see the commented-out ANTHROPIC VERSION block near the bottom of this file
// for the original implementation — the SYSTEM_PROMPT and schemes-grounding
// logic above it works with either provider unchanged.
const GEMINI_MODEL = 'gemini-2.5-flash'; // free-tier model, see aistudio.google.com

// Build a compact, model-friendly summary of the curated schemes dataset so the
// advisor can ground loan/subsidy answers in YOUR verified data instead of
// guessing. Keeping this compact (not the full JSON) leaves room in context for
// the actual conversation. Regenerated fresh on every server start, so editing
// backend/data/schemes.json and restarting the server is enough to update it.
function buildSchemesBriefing() {
  const lines = schemesData.schemes.map((s) => {
    const bits = [
      `- [${s.id}] ${s.category_en} / ${s.category_np}`,
      `  Summary: ${s.summary_en}`,
      s.interest_note_en ? `  Interest note: ${s.interest_note_en}` : null,
      s.collateral_note_en ? `  Collateral note: ${s.collateral_note_en}` : null,
      s.office_en ? `  Office: ${s.office_en}` : null,
      `  Docs required: ${(s.docs_required || []).join('; ')}`,
      `  Source: ${s.source_url || 'n/a'} (last checked ${s.last_checked || 'unknown'})`,
    ].filter(Boolean);
    return bits.join('\n');
  });
  return lines.join('\n\n');
}

const SCHEMES_BRIEFING = buildSchemesBriefing();

// System prompt shapes how the AI advisor behaves. Tune this to match your
// tone and areas of expertise. Keep answers practical and locally relevant.
const SYSTEM_PROMPT = `You are Sarathi, the AI farming and loan/subsidy advisor for
Krishak Sarathi (कृषक सारथी), an agriculture consultancy in Nepal. You help
smallholder farmers with practical advice on crops, soil, pests, and — a
major focus — navigating agriculture loans and government subsidy schemes.

Rules:
- Reply in the same language the farmer writes in (Nepali or English). If they
  mix both (Roman Nepali / Nepanglish), respond the same natural way.
- Keep answers short, concrete, and locally relevant to Nepal's agro-climate
  zones (Terai, Hill, Mountain) when relevant.
- For loan/subsidy questions, ground your answer in the CURATED SCHEMES DATA
  below whenever it's relevant, and name which scheme you're drawing from
  (e.g. "Under the Concessional Agriculture Loan program..."). Mention the
  required documents or steps from that entry rather than inventing your own.
- ALWAYS tell the farmer to confirm current interest rates, subsidy amounts,
  and deadlines with the office/bank listed (or their local Agriculture
  Knowledge Center / ward office), because these figures change by fiscal
  year and this dataset may be out of date. Never state a specific rate or
  amount as certain — the dataset itself intentionally avoids fixed numbers
  for this reason.
- If a farmer's question isn't covered by the curated data, say so plainly
  rather than inventing scheme details.
- Never give advice that could damage crops or harm health (e.g. unsafe
  pesticide mixing or dosing) without a clear safety caveat.
- You are not a substitute for an in-person soil test, bank consultation, or
  expert site visit for serious or high-value decisions — say so when it
  matters.

CURATED SCHEMES DATA (source: backend/data/schemes.json — verify against the
official sources listed before quoting a number):
${SCHEMES_BRIEFING}`;

router.post('/', async (req, res) => {
  try {
    const { message, history } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'A "message" string is required.' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error:
          'Server is missing GEMINI_API_KEY. Add it to your .env (see .env.example). Get a free key at https://aistudio.google.com — no credit card required.',
      });
    }

    // history: optional array of { role: 'user'|'assistant', content: string }
    // sent from the frontend so the advisor remembers the conversation so far.
    // Gemini uses 'model' instead of 'assistant' for the AI's turns, and
    // wraps text in a `parts` array, so we translate our stored format here.
    const priorTurns = Array.isArray(history) ? history : [];
    const contents = priorTurns
      .map((turn) => ({
        role: turn.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: turn.content }],
      }))
      .concat([{ role: 'user', parts: [{ text: message }] }]);

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': process.env.GEMINI_API_KEY,
        },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents,
          generationConfig: { maxOutputTokens: 800 },
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error('Gemini API error:', data);
      return res.status(502).json({ error: 'AI service error', detail: data });
    }

    const reply =
      (data.candidates &&
        data.candidates[0] &&
        data.candidates[0].content &&
        data.candidates[0].content.parts &&
        data.candidates[0].content.parts.map((p) => p.text).join('\n')) ||
      '';

    res.json({ reply });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Unexpected server error.' });
  }
});

module.exports = router;

/* ---------------------------------------------------------------------------
 * ANTHROPIC VERSION (kept for reference — switch back to this if you later
 * set up Claude API billing; it needs ANTHROPIC_API_KEY instead of
 * GEMINI_API_KEY in your .env, and no other file needs to change):
 *
 * const response = await fetch('https://api.anthropic.com/v1/messages', {
 *   method: 'POST',
 *   headers: {
 *     'Content-Type': 'application/json',
 *     'x-api-key': process.env.ANTHROPIC_API_KEY,
 *     'anthropic-version': '2023-06-01',
 *   },
 *   body: JSON.stringify({
 *     model: 'claude-sonnet-5',
 *     max_tokens: 800,
 *     system: SYSTEM_PROMPT,
 *     messages: [...(history || []), { role: 'user', content: message }],
 *   }),
 * });
 * const data = await response.json();
 * const textBlocks = (data.content || [])
 *   .filter((block) => block.type === 'text')
 *   .map((block) => block.text)
 *   .join('\n');
 * -------------------------------------------------------------------------*/
