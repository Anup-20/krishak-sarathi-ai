# Krishak Sarathi — AI Farm Assistant

An original, independent AI-powered agriculture web app built for **Krishak Sarathi**
(कृषक सारथी) — not related to, and not copied from, any other project with a
similar name. Built from scratch to pair with anuppudasaini.com.np.

## Features (v1)

- 🤖 **AI Advisor** — bilingual (English/Nepali) chat, powered by the Claude API,
  with voice input (speech-to-text) and voice output (text-to-speech) in supported browsers.
- 🌦️ **Weather** — current conditions + 5-day forecast for any place, free via Open-Meteo (no API key needed).
- 🥕 **Bazar Prices** — attempts to read today's wholesale prices from
  kalimatimarket.gov.np. Government site layouts change, so this scraper may
  need occasional maintenance (see comments in `backend/routes/mandi.js`).
- 📋 **Subsidy & Loan Guide** — documentation checklists and step-by-step
  process for common agriculture subsidies/loans. **The content in
  `backend/data/schemes.json` is a sample structure only — replace it with
  your own verified, current details** before publishing; don't ship
  government scheme specifics you haven't confirmed.

## Project structure

```
krishak-sarathi-ai/
├── backend/          Express API (chat, weather, mandi, schemes)
│   ├── routes/
│   ├── data/schemes.json
│   ├── server.js
│   └── .env.example
└── frontend/         Plain HTML/CSS/JS (no build step needed)
    ├── index.html
    ├── style.css
    └── app.js
```

Vanilla JS was used instead of React (unlike the example repo you found) to
keep this simple to run, host, and hand-edit without a build pipeline. It's
easy to migrate to React/Vite later if you want a richer UI.

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
git commit -m "Initial version of Krishak Sarathi AI assistant"
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

## Notes on the two data sources

- **Weather** (Open-Meteo) is genuinely free and reliable — no key, no
  rate-limit worries for this scale of traffic.
- **Mandi prices**: kalimatimarket.gov.np has no official public API, so the
  scraper here is best-effort. If it breaks, either fix the CSS selectors in
  `mandi.js` against the live page, or swap in the community-maintained
  `kalimati-rate` npm package as an alternative source.

## What to customize before going live

1. Fill in real, verified content in `backend/data/schemes.json`.
2. Adjust the AI's system prompt in `backend/routes/chat.js` to match your
   voice and areas of expertise.
3. Swap the color variables in `style.css` to match your site's navy/bronze
   design system.
4. Test the mandi scraper against the live site and fix selectors if needed.
5. Test voice input/output — it currently relies on the browser's Web Speech
   API (best support in Chrome/Edge; limited on iOS Safari).
