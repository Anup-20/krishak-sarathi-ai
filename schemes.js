const express = require('express');
const router = express.Router();
const data = require('../data/schemes.json');

// GET /api/schemes  -> full list
// GET /api/schemes/:id -> one scheme's detail (docs + steps)
router.get('/', (req, res) => {
  res.json(
    data.schemes.map(({ id, category_en, category_np, summary_en, summary_np }) => ({
      id,
      category_en,
      category_np,
      summary_en,
      summary_np,
    }))
  );
});

router.get('/:id', (req, res) => {
  const scheme = data.schemes.find((s) => s.id === req.params.id);
  if (!scheme) return res.status(404).json({ error: 'Scheme not found.' });
  res.json(scheme);
});

module.exports = router;
