require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const chatRoute = require('./routes/chat');
const weatherRoute = require('./routes/weather');
const mandiRoute = require('./routes/mandi');
const schemesRoute = require('./routes/schemes');

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = (process.env.ALLOWED_ORIGINS || '*')
  .split(',')
  .map((o) => o.trim());

app.use(
  cors({
    origin: allowedOrigins.includes('*') ? true : allowedOrigins,
  })
);
app.use(express.json());

// API routes
app.use('/api/chat', chatRoute);
app.use('/api/weather', weatherRoute);
app.use('/api/mandi', mandiRoute);
app.use('/api/schemes', schemesRoute);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'krishak-sarathi-ai-backend' });
});

// Serve the frontend as static files (useful when deploying frontend+backend
// together, e.g. on Render/Railway/a single VPS). If you deploy the frontend
// separately (Vercel static, GitHub Pages, or embedded in
// anuppudasaini.com.np), you can remove this block and just keep /api/*.
app.use(express.static(path.join(__dirname, '..', 'frontend')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Krishak Sarathi AI backend running on port ${PORT}`);
});
