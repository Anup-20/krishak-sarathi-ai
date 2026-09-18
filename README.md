# Krishak Sarathi — AI Farm & Loan Advisor

An original, independent AI-powered agriculture web app built for **Krishak Sarathi**
(कृषक सारथी) — not related to, and not copied from, any other project with a
similar name. Built to pair with anuppudasaini.com.np, with a strong focus on
making Nepal's agriculture **loan and subsidy process** easy to understand in
both Nepali and English.

## Features

- 🤖 **AI Advisor** — bilingual (English/Nepali) chat, powered by Google's
  Gemini API (free tier), with voice input (speech-to-text) and voice output
  (text-to-speech) in supported browsers. The advisor's system prompt is
  **grounded in two curated datasets** — `backend/data/schemes.json` (loans
  and subsidies) and `backend/data/crop_health.json` (pests and diseases) —
  so it names the specific scheme or disease it's drawing from and always
  tells the farmer to confirm current numbers or a diagnosis locally,
  instead of inventing details.
- 📋 **Loan & Subsidy Guide** — a searchable, filterable library of
  agriculture loan and subsidy schemes, researched from Nepal Rastra Bank,
  MoALD, and reporting on the 2082 BS concessional-loan revision and the
  current agriculture insurance premium subsidy tiers. Each entry shows:
  - Required documents and a step-by-step process (in EN + NP)
  - Interest-rate and collateral notes grounded in real, cited program
    history — written as "confirm current terms" rather than a single fixed
    number, since these are revised most fiscal years
  - The office to visit, a source link, and a "last checked" date
  - A ⭐ bookmark (saved locally in the browser) and a ⬇ downloadable /
    🖨 printable document checklist
  - Tag filters and a text search box
- 🌾 **Crop Health Guide** *(new)* — a researched reference on Nepal-specific
  crop pests and diseases (rice blast, bacterial leaf blight, maize fall
  armyworm, potato late blight, and large cardamom's chirke/foorkey viral
  disease), each with symptoms, favorable conditions, region notes, and
  management steps, sourced from published agricultural research. Same
  search/filter pattern as the Loan Guide, and the AI advisor can name and
  explain any entry directly in chat.
- 🧮 **Loan Calculator** — an EMI (monthly payment) calculator. The farmer
  enters their own loan amount and the rate quoted by their bank, so the app
  never assumes a specific scheme's rate.
- 🌦️ **Weather** — current conditions + 5-day forecast for any place, free
  via Open-Meteo — a genuine live automated feed, no key needed.
- 🥕 **Mandi Prices** *(improved)* — now points at Kalimati market's actual
  wholesale price-list endpoint (`/home/wpricelist`) instead of the
  homepage, which is very likely why the old scraper often came back empty.
  Prices are now cached in memory and **auto-refreshed every 30 minutes** in
  the background, so the tab loads instantly and stays useful even if the
  government site is briefly slow or down — the UI shows an "Updated: ..."
  timestamp so farmers know how fresh the numbers are. A `POST /api/mandi/refresh`
  endpoint lets you force an immediate re-scrape.

**Before publishing:** the content in `backend/data/schemes.json` is a
**sample structure** — replace the summaries, notes, offices, and dates with
your own verified, current details. See `NEPAL_DATA_SOURCES_AND_TOOLS.md` for
where to find and verify that information, and how to grow this into
semantic search over a larger knowledge base if you outgrow a single JSON
file.

## Project structure

```
krishak-sarathi-ai/
├── backend/          Express API (chat, weather, mandi, schemes, crop health)
│   ├── routes/
│   │   ├── chat.js       AI advisor — grounds answers in both JSON datasets
│   │   ├── weather.js    Open-Meteo forecast
│   │   ├── mandi.js      Kalimati price scraper w/ cache + auto-refresh
│   │   ├── schemes.js    Loan/subsidy API — list, search, filter, detail
│   │   └── crophealth.js Crop pest/disease API — list, search, filter, detail
│   ├── data/
│   │   ├── schemes.json      Curated, versioned loan & subsidy dataset
│   │   └── crop_health.json  Curated, sourced crop pest/disease dataset
│   ├── server.js
│   └── .env.example
├── frontend/         Plain HTML/CSS/JS (no build step needed)
│   ├── index.html    6 tabs: AI Advisor, Loan & Subsidy Guide, Crop Health
│   │                 Guide, Loan Calculator, Weather, Mandi Prices
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
# edit .env and add your GEMINI_API_KEY
npm start
```

Then open http://localhost:5000 — the backend also serves the frontend.

## Getting a Gemini API key (free, no credit card)

The AI advisor runs on Google's Gemini API (`gemini-2.5-flash`), which has a
genuinely free tier — no credit card, no expiration, roughly 1,500 requests/
day as of 2026. To get a key:

1. Go to https://aistudio.google.com and sign in with a Google account.
2. Click "Get API key" → "Create API key".
3. Copy it and put it in `backend/.env` as `GEMINI_API_KEY`.

**Never commit `.env` to GitHub** — `.gitignore` already excludes it.

Want to use Claude instead later (e.g. once you're ready to pay for API
usage)? `backend/routes/chat.js` has the original Anthropic implementation
kept as a commented-out reference at the bottom of the file — swap it back
in and set `ANTHROPIC_API_KEY` instead.

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

## Keeping the datasets accurate

1. Re-check each entry in `backend/data/schemes.json` and
   `backend/data/crop_health.json` against the official/cited source listed
   in that entry every few months — fiscal-year loan/subsidy changes are
   common around July/August (Shrawan), and NRB publishes an updated
   subsidized-loan report roughly monthly at
   https://www.nrb.org.np/category/concessional-loan/.
2. Update `last_checked` whenever you re-verify an entry.
3. Because `chat.js` builds its system-prompt briefing directly from both
   files at server start, restarting the backend after an edit is enough to
   refresh what the AI advisor knows — no separate re-training step.
4. If either dataset grows past a few dozen entries, see the semantic-search
   (Supabase + pgvector) suggestion in `NEPAL_DATA_SOURCES_AND_TOOLS.md`.
5. If the Kalimati price scraper (`backend/routes/mandi.js`) starts
   returning the fallback placeholder again, the site's HTML has likely
   changed — open `https://kalimatimarket.gov.np/home/wpricelist` in a
   browser, inspect the table, and update the cheerio selectors. Check
   server logs for `[mandi]` lines, which report every refresh attempt and
   why it succeeded or failed.

## What to customize before going live

1. Fill in real, verified content in `backend/data/schemes.json`.
2. Adjust the AI's system prompt in `backend/routes/chat.js` to match your
   voice and areas of expertise.
3. Swap the color variables in `style.css` (`--terrace-deep`, `--turmeric`,
   `--soil`, etc.) if you want a different palette than the one shipped here.
4. Test the mandi scraper against the live site and fix selectors if needed.
5. Test voice input/output — it currently relies on the browser's Web Speech
   API (best support in Chrome/Edge; limited on iOS Safari).
