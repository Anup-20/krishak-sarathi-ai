const express = require('express');
const router = express.Router();
const data = require('../data/schemes.json');

// GET /api/schemes            -> lightweight list (for cards)
// GET /api/schemes?tag=loan   -> filtered by a tag
// GET /api/schemes?q=dairy    -> simple text search across category/summary (EN+NP)
// GET /api/schemes/:id        -> one scheme's full detail (docs + steps + notes)

router.get('/', (req, res) => {
  let list = data.schemes;

  const { tag, q } = req.query;

  if (tag) {
    list = list.filter((s) => (s.tags || []).includes(String(tag).toLowerCase()));
  }

  if (q) {
    const needle = String(q).toLowerCase();
    list = list.filter((s) =>
      [s.category_en, s.category_np, s.summary_en, s.summary_np]
        .filter(Boolean)
        .some((field) => field.toLowerCase().includes(needle))
    );
  }

  res.json(
    list.map(
      ({
        id,
        category_en,
        category_np,
        summary_en,
        summary_np,
        tags,
        difficulty,
        processing_time_en,
        processing_time_np,
        last_checked,
      }) => ({
        id,
        category_en,
        category_np,
        summary_en,
        summary_np,
        tags,
        difficulty,
        processing_time_en,
        processing_time_np,
        last_checked,
      })
    )
  );
});

router.get('/:id', (req, res) => {
  const scheme = data.schemes.find((s) => s.id === req.params.id);
  if (!scheme) return res.status(404).json({ error: 'Scheme not found.' });
  res.json(scheme);
});

module.exports = router;
