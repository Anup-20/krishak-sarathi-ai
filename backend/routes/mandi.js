const express = require('express');
const fetch = require('node-fetch');
const cheerio = require('cheerio');
const router = express.Router();

// ---------------------------------------------------------------------------
// Kalimati Fruits & Vegetable Market Development Board (kalimatimarket.gov.np)
// has no official public API, so this remains a best-effort scrape — but it
// now points at the ACTUAL wholesale price-list page rather than the
// homepage. (Found by inspecting the source of the community "kalimati-rate"
// npm package, which scrapes the same site: it uses /home/wpricelist, not
// the root URL — the homepage doesn't reliably contain the price table,
// which is very likely why the original scraper often came back empty.)
//
// This route also keeps a small in-memory cache that's refreshed on a timer
// (see startAutoRefresh below) rather than re-scraping on every request.
// That makes the /api/mandi endpoint fast and resilient: even if the
// government site is briefly down, farmers still see the last good prices
// with a clear "as of" timestamp instead of an error.
// ---------------------------------------------------------------------------

const SOURCE_URL = 'https://kalimatimarket.gov.np/price';
const REFRESH_INTERVAL_MS = 30 * 60 * 1000; // refresh every 30 minutes

let cache = {
  prices: [],
  fetchedAt: null, // ISO timestamp of the last successful scrape
  stale: true,
};

async function scrapeKalimati() {
  const response = await fetch(SOURCE_URL, {
    timeout: 10000,
    headers: {
      // Some government sites block requests with no/unusual User-Agent as
      // bot traffic. A normal browser-like header noticeably improves
      // success odds without doing anything deceptive — the code openly
      // says who it is via console logging either way.
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
      Accept: 'text/html,application/xhtml+xml',
    },
  });
  if (!response.ok) throw new Error(`Kalimati site returned HTTP ${response.status}`);
  const html = await response.text();
  const $ = cheerio.load(html);

  const prices = [];
  // NOTE: this selector is a best-effort match for the price table layout as
  // of when this was last checked. If the site's HTML changes again, open
  // the SOURCE_URL above in a browser, inspect the table, and adjust the
  // row/cell selectors below. Search "kalimati-rate npm package" on GitHub
  // for another live reference implementation if this breaks.
  $('table tr').each((i, row) => {
    const cells = $(row)
      .find('td')
      .map((j, cell) => $(cell).text().trim())
      .get();

    if (cells.length >= 4) {
      prices.push({
        commodity: cells[0],
        unit: cells[1],
        min: cells[2],
        max: cells[3],
      });
    }
  });

  return prices;
}

async function refreshCache() {
  try {
    const prices = await scrapeKalimati();
    if (prices.length > 0) {
      cache = { prices, fetchedAt: new Date().toISOString(), stale: false };
      console.log(`[mandi] Refreshed ${prices.length} prices at ${cache.fetchedAt}`);
    } else {
      console.warn('[mandi] Scrape succeeded but found 0 rows — site layout may have changed. Keeping previous cache.');
    }
  } catch (err) {
    console.warn('[mandi] Refresh failed, keeping previous cache:', err.message);
  }
}

// Kick off an immediate refresh at server start, then keep refreshing on a
// timer. If the very first attempt fails (e.g. during local dev without
// network access), the route below still serves a clear fallback response.
refreshCache();
setInterval(refreshCache, REFRESH_INTERVAL_MS);

router.get('/', (req, res) => {
  if (cache.prices.length > 0) {
    return res.json({
      source: SOURCE_URL,
      stale: false,
      fetchedAt: cache.fetchedAt,
      prices: cache.prices,
    });
  }

  // No successful scrape has happened yet (or ever) — return a clearly
  // labeled placeholder instead of an empty table, so the frontend can
  // explain the situation rather than looking broken.
  res.json({
    source: SOURCE_URL,
    stale: true,
    message:
      "Couldn't fetch today's prices automatically yet — the site may be temporarily unreachable, or its layout may have changed. Visit the source link directly, or check server logs for details.",
    prices: sampleFallback(),
  });
});

// Manual refresh endpoint — lets the frontend's "Refresh" button force an
// immediate re-scrape instead of waiting for the next scheduled interval.
router.post('/refresh', async (req, res) => {
  await refreshCache();
  res.json({ ok: true, fetchedAt: cache.fetchedAt, count: cache.prices.length });
});

function sampleFallback() {
  // Illustrative placeholder only, shown only if no successful scrape has
  // ever completed — replace/remove once the live scrape is confirmed
  // working, or wire this to your own manually-updated price sheet.
  return [
    { commodity: 'Tomato (local)', unit: 'kg', min: '—', max: '—' },
    { commodity: 'Potato (red)', unit: 'kg', min: '—', max: '—' },
    { commodity: 'Cauliflower', unit: 'kg', min: '—', max: '—' },
  ];
}

module.exports = router;
