# Krishak Sarathi — Nepal Data Sources & Free Tool Stack

Companion doc to `README.md`. Two things live here: (1) where to pull real,
citable Nepal-specific agriculture data from, and (2) what free/cheap tools
turn this from a nice prototype into something that actually feels trained
on Nepal's situation.

---

## 1. Public data sources worth wiring in

| Area | Source | What it gives you | Access |
|---|---|---|---|
| Subsidy & loan policy | [moald.gov.np](https://moald.gov.np) — Ministry of Agriculture & Livestock Development | Official schemes, budget allocations, circulars | Website; no API, so scrape/monitor notices page |
| Interest subsidy / lending rules | [nrb.org.np](https://www.nrb.org.np) — Nepal Rastra Bank | Circulars on the concessional agriculture loan program, refinancing | Website, PDF circulars |
| Bank-specific loan products | [adbl.gov.np](https://adbl.gov.np), plus other commercial banks' "Krishi Karja" pages | Real current products, sometimes rates | Website (no public API — scrape carefully, respect robots.txt) |
| Local-level subsidy notices | Your target municipality/rural municipality websites (e.g. `<palika-name>.gov.np`) | The actual 7–15 day application windows that decide *when* a farmer can apply — these are hyperlocal and MoALD's national page won't show them | Website, often PDF notices |
| Statistics (production, livestock, area by district) | [data.nsonepal.gov.np](https://data.nsonepal.gov.np) — National Statistics Office | Agriculture census data, CSV/JSON | **CKAN API available** — machine-readable |
| Open/crowdsourced datasets | [opendatanepal.com](https://opendatanepal.com) — Open Knowledge Nepal | Historical MoALD statistics already converted to CSV/JSON | **CKAN API available** |
| Wholesale market prices | [kalimatimarket.gov.np](https://kalimatimarket.gov.np) (already in your README) | Daily mandi prices | No official API — scrape, or use the community `kalimati-rate` npm package as a fallback |
| Weather | Open-Meteo (already wired up) | Forecasts | Free, no key |
| Laws/regulations behind schemes | [lawcommission.gov.np](https://lawcommission.gov.np) | Acts & regulations, e.g. what documents an office can legally demand | Website, PDFs |
| Dairy sector specifics | [nddb.gov.np](https://nddb.gov.np) — National Dairy Development Board | Training calendars, dairy subsidy notices | Website |

**Practical note:** almost none of these expose a clean REST API except the
two CKAN portals (NSO and Open Data Nepal). Everything else is a website or
PDF, so for the subsidy/loan guide the realistic approach is: maintain a
curated, versioned JSON (see `schemes.json`) that you or a small team updates
a few times a year by checking these sources — not a live scraper hitting
government sites on every chat message. Government site layouts change
often (your own README already flags this for Kalimati); a scraper that
breaks silently is worse than a dataset with a visible "last checked" date.

---

## 2. Free/cheap tools to make it more advanced and "trained"

You don't need to fine-tune a model to make this feel domain-trained — at
this data scale (a few hundred KB of schemes, prices, and FAQs), **prompt
engineering + retrieval over your own curated data** gets you 90% of the
value of fine-tuning at near-zero cost.

**Grounding the AI in Nepal-specific data**
- Simplest, and enough for v1: load `schemes.json` (and a similar curated
  FAQ/crop-guide file) directly into the system prompt in `chat.js`. It's
  small enough to fit in context and costs nothing extra to set up.
- If the knowledge base grows past what comfortably fits in a prompt:
  **Supabase** (free tier, Postgres + `pgvector`) is the standard free way
  to add real semantic search without adding a separate vector-database
  vendor — you already have Postgres-shaped data (schemes, prices), so it
  fits naturally, and you don't hit a paid tier until well past what this
  app needs.
- Keep Claude's own web search / prompt-caching in mind for anything that
  changes often (mandi prices, budget-year subsidy amounts) rather than
  re-baking it into static files every time.

**Nepali language support**
- Claude already handles Nepali natively for the chat feature — no extra
  tool needed there.
- For **Nepali OCR** (e.g. a future "scan your citizenship/land document"
  feature): open-source **Tesseract** with the Nepali trained data is free
  and self-hostable; **Google Cloud Vision** has a free monthly quota if you
  want higher accuracy without hosting anything yourself.
- For **Nepali text-to-speech**, since browser Web Speech API support for
  Nepali is inconsistent (you already note this for iOS Safari): open-source
  **Piper TTS** or **Coqui TTS** can run self-hosted for free and have
  Nepali-adjacent language support worth testing, as a fallback when the
  browser's built-in voice isn't available.

**Making the AI advisor feel more expert**
- Write a strong, structured system prompt (crop calendars for Nepal's
  agro-ecological zones, common pest/disease patterns by region, the
  subsidy/loan data above) rather than relying on the base model's general
  knowledge — this is the actual "training" lever available to you without
  an ML team.
- Add **source citations** in the AI's answers when it quotes a subsidy
  figure, and have it explicitly tell farmers to confirm current numbers
  locally — this matches the caution your own README already asks for.

**Hosting & ops (free tiers, as your README already points at)**
- Backend: Render / Railway / Fly.io free tiers (as noted).
- Frontend: Vercel or GitHub Pages.
- Error monitoring: **Sentry** free tier.
- Analytics without cost or privacy concerns: self-hosted **Umami** or
  **Plausible** (open source).
- CI/CD: GitHub Actions free tier for auto-deploy on push.

**Testing & evaluation**
- Before publishing subsidy content, spot-check a sample of the AI's answers
  against the actual `schemes.json` sources listed above — a simple manual
  eval checklist (does it cite a source, does it flag "verify locally",
  does it avoid inventing a specific rate) catches most of the risk your
  README already warns about.

---

## 3. What I didn't have to work from

I only received `README.md` and `.gitignore` — not the actual
`backend/`/`frontend/` source. If you upload the full project (or the repo
URL), I can wire `schemes.json` and this data straight into
`backend/routes/chat.js` and `backend/data/schemes.json`, and update the
system prompt to cite sources and add the "verify locally" caveat
automatically.
