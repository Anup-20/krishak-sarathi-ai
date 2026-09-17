const express = require('express');
const fetch = require('node-fetch');
const cheerio = require('cheerio');
const router = express.Router();

// Attempts to read today's wholesale prices from the Kalimati Fruits & Vegetable
// Market Development Board site (kalimatimarket.gov.np) — the main public
// mandi price source for Nepal. Government sites change their HTML from time
// to time, so this scraper WILL need occasional maintenance: if it returns
// an empty list, open kalimatimarket.gov.np in a browser, inspect the price
// table's HTML, and update the cheerio selectors below.
//
// A small, actively maintained alternative is the community npm package
// "kalimati-rate" (github.com/adityathebe/kalimati-rate) if you'd rather not
// maintain your own scraper.

const SOURCE_URL = 'https://kalimatimarket.gov.np/';

router.get('/', async (req, res) => {
  try {
    const response = await fetch(SOURCE_URL, { timeout: 10000 });
    const html = await response.text();
    const $ = cheerio.load(html);

    const prices = [];
    // NOTE: selector is a best-effort guess at a typical price table layout.
    // Verify against the live page and adjust the row/cell selectors as needed.
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

    if (prices.length === 0) {
      return res.json({
        source: SOURCE_URL,
        stale: true,
        message:
          "Couldn't parse today's prices automatically — the site layout may have changed. Visit the source link directly, or update the scraper selectors.",
        prices: sampleFallback(),
      });
    }

    res.json({ source: SOURCE_URL, stale: false, prices });
  } catch (err) {
    console.error(err);
    res.json({
      source: SOURCE_URL,
      stale: true,
      message: 'Could not reach the market price source right now.',
      prices: sampleFallback(),
    });
  }
});

function sampleFallback() {
  // Illustrative placeholder only — replace/remove once the live scrape works,
  // or wire this up to your own manually-updated price sheet.
  return [
    { commodity: 'Tomato (local)', unit: 'kg', min: '—', max: '—' },
    { commodity: 'Potato (red)', unit: 'kg', min: '—', max: '—' },
    { commodity: 'Cauliflower', unit: 'kg', min: '—', max: '—' },
  ];
}

module.exports = router;
