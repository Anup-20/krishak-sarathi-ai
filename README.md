# Krishak Sarathi — AI Farm & Loan Advisor

An original, independent AI-powered agriculture web app built for **Krishak Sarathi**
(कृषक सारथी) — not related to, and not copied from, any other project with a
similar name. Built to pair with anuppudasaini.com.np, with a strong focus on
making Nepal's agriculture **loan and subsidy process** easy to understand in
both Nepali and English.

## Features

- 🤖 **AI Advisor** — bilingual (English/Nepali) chat, powered by the Claude
  API, with voice input (speech-to-text) and voice output (text-to-speech) in
  supported browsers. The advisor's system prompt is **grounded in your own
  curated loan/subsidy data** (`backend/data/schemes.json`), so it names the
  specific scheme it's drawing from and always tells the farmer to confirm
  current numbers locally, instead of inventing rates.
- 📋 **Loan & Subsidy Guide** — a searchable, filterable library of agriculture
  loan and subsidy schemes (concessional loans, equipment subsidy, youth
  self-employment loans, dairy/livestock support, crop & livestock insurance,
  cooperative micro-loans). Each entry shows:
  - Required documents and a step-by-step process (in EN + NP)
  - Interest-rate and collateral notes (written as "confirm current terms"
    rather than a fixed number, since these change every fiscal year)
  - The office to visit, a source link, and a "last checked" date
  - A ⭐ bookmark (saved locally in the browser) and a ⬇ downloadable /
    🖨 printable document checklist for the farmer to take to the office
  - Tag filters (loan / subsidy / dairy / youth / insurance / etc.) and a
    text search box
- 🧮 **Loan Calculator** — an EMI (monthly payment) calculator. The farmer
  enters their own loan amount, the rate quoted by their bank/cooperative,
  and the term — the app never assumes a specific scheme's rate, since those
  change yearly and vary by lender.
- 🌦️ **Weather** — current conditions + 5-day forecast for any place, free
  via Open-Meteo (no API key needed).
- 🥕 **Mandi Prices** — attempts to read today's wholesale prices from
  kalimatimarket.gov.np. Government site layouts change, so this scraper may
  need occasional maintenance (see comments in `backend/routes/mandi.js`).

**Before publishing:** the content in `backend/data/schemes.json` is a
**sample structure** — replace the summaries, notes, offices, and dates with
your own verified, current details. See `NEPAL_DATA_SOURCES_AND_TOOLS.md` for
where to find and verify that information, and how to grow this into
semantic search over a larger knowledge base if you outgrow a single JSON
file.

## Project structure

```
krishak-sarathi-ai/
├── backend/          Express API (chat, weather, mandi, schemes)
│   ├── routes/
│   │   ├── chat.js       AI advisor — grounds answers in schemes.json
│   │   ├── weather.js    Open-Meteo forecast
│   │   ├── mandi.js      Kalimati price scraper (best-effort)
│   │   └── schemes.js    Loan/subsidy API — list, search, filter, detail
│   ├── data/schemes.json Curated, versioned loan & subsidy dataset
│   ├── server.js
│   └── .env.example
├── frontend/         Plain HTML/CSS/JS (no build step needed)
│   ├── index.html    5 tabs: AI Advisor, Loan & Subsidy Guide, Loan
│   │                 Calculator, Weather, Mandi Prices
│   ├── style.css     Custom "rice terrace" design system (see below)
│   └── app.js
└── NEPAL_DATA_SOURCES_AND_TOOLS.md   Where to source/verify real Nepal data
```

Vanilla JS was used instead of React to keep this simple to run, host, and
hand-edit without a build pipeline. It's easy to migrate to React/Vite later
if you want a richer UI.

## Design

The frontend uses a custom design system themed around Nepal's terraced
hill farming rather than a generic template look: a deep paddy-green /
turmeric-gold / terracotta-soil palette, a serif display face (Fraunces)
paired with Work Sans for body text, and Noto Sans/Serif Devanagari so
Nepali text renders with proper weight and spacing rather than a fallback
font. A repeating terrace-stripe motif marks section breaks instead of the
usual card-shadow treatment.

## Running it locally

```bash
cd backend
npm install
cp .env.example .env
# edit .env and add your ANTHROPIC_API_KEY
npm start
```

Then open http://localhost:5000 — the backend also serves the frontend.

## Getting an Anthropic API key

Create one at https://console.anthropic.com (this is separate from your
claude.ai subscription — it's billed per use). Put it in `backend/.env` as
`ANTHROPIC_API_KEY`. **Never commit `.env` to GitHub** — `.gitignore` already
excludes it.

## Putting this on your own GitHub

```bash
cd krishak-sarathi-ai
git init
git add .
git commit -m "Krishak Sarathi AI assistant with Loan & Subsidy Guide"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo>.git
git push -u origin main
```

## Deploying (free-tier friendly options)

- **Backend**: Render, Railway, or Fly.io all have free/cheap tiers that run
  a Node/Express server continuously (needed for the API routes and to keep
  your Anthropic key server-side, never in frontend code).
- **Frontend**: can be served by the same backend (already wired up), or
  deployed separately to GitHub Pages / Vercel and pointed at your backend
  by setting `API_BASE` in `frontend/app.js`.
- **Embedding on anuppudasaini.com.np**: once deployed, you can either link
  to it directly, or embed it with an `<iframe src="https://your-app-url">`
  on a page of your existing site.

## Keeping the Loan & Subsidy Guide accurate

1. Re-check each entry in `backend/data/schemes.json` against the official
   source listed in that entry every few months (fiscal-year changes are
   common in July/August — Shrawan).
2. Update `last_checked` whenever you re-verify an entry.
3. Because `chat.js` builds its system-prompt briefing directly from this
   file at server start, restarting the backend after an edit is enough to
   refresh what the AI advisor knows — no separate re-training step.
4. If the dataset grows past a few dozen entries, see the semantic-search
   (Supabase + pgvector) suggestion in `NEPAL_DATA_SOURCES_AND_TOOLS.md`.

## What to customize before going live

1. Fill in real, verified content in `backend/data/schemes.json`.
2. Adjust the AI's system prompt in `backend/routes/chat.js` to match your
   voice and areas of expertise.
3. Swap the color variables in `style.css` (`--terrace-deep`, `--turmeric`,
   `--soil`, etc.) if you want a different palette than the one shipped here.
4. Test the mandi scraper against the live site and fix selectors if needed.
5. Test voice input/output — it currently relies on the browser's Web Speech
   API (best support in Chrome/Edge; limited on iOS Safari).
