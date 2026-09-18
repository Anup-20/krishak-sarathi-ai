const express = require('express');
const router = express.Router();
const data = require('../data/crop_health.json');

// GET /api/crop-health              -> lightweight list (for cards)
// GET /api/crop-health?crop=Rice    -> filtered by crop (partial match)
// GET /api/crop-health?type=fungal  -> filtered by disease/pest type
// GET /api/crop-health?q=blight     -> text search across crop/name (EN+NP)
// GET /api/crop-health/:id          -> one entry's full detail

router.get('/', (req, res) => {
  let list = data.entries;
  const { crop, type, q } = req.query;

  if (crop) {
    const needle = String(crop).toLowerCase();
    list = list.filter(
      (e) =>
        e.crop_en.toLowerCase().includes(needle) || e.crop_np.includes(crop)
    );
  }

  if (type) {
    const needle = String(type).toLowerCase();
    list = list.filter((e) => e.type.toLowerCase().includes(needle));
  }

  if (q) {
    const needle = String(q).toLowerCase();
    list = list.filter((e) =>
      [e.crop_en, e.crop_np, e.name_en, e.name_np, e.causal_agent]
        .filter(Boolean)
        .some((field) => field.toLowerCase().includes(needle))
    );
  }

  res.json(
    list.map(({ id, crop_en, crop_np, name_en, name_np, type, causal_agent, last_checked }) => ({
      id,
      crop_en,
      crop_np,
      name_en,
      name_np,
      type,
      causal_agent,
      last_checked,
    }))
  );
});

router.get('/:id', (req, res) => {
  const entry = data.entries.find((e) => e.id === req.params.id);
  if (!entry) return res.status(404).json({ error: 'Entry not found.' });
  res.json(entry);
});

module.exports = router;
