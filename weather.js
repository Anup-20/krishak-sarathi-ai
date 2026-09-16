const express = require('express');
const fetch = require('node-fetch');
const router = express.Router();

// Uses Open-Meteo (https://open-meteo.com) — free, no API key required.
// GET /api/weather?place=Kavrepalanchowk  OR  ?lat=..&lon=..

router.get('/', async (req, res) => {
  try {
    const { place, lat, lon } = req.query;
    let latitude = lat;
    let longitude = lon;
    let resolvedName = place;

    if (!latitude || !longitude) {
      if (!place) {
        return res
          .status(400)
          .json({ error: 'Provide either "place" or "lat" & "lon".' });
      }

      const geoRes = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
          place
        )}&count=1&language=en&format=json`
      );
      const geoData = await geoRes.json();

      if (!geoData.results || geoData.results.length === 0) {
        return res.status(404).json({ error: `Could not find location "${place}".` });
      }

      latitude = geoData.results[0].latitude;
      longitude = geoData.results[0].longitude;
      resolvedName = geoData.results[0].name;
    }

    const weatherRes = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}` +
        `&current=temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m` +
        `&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum` +
        `&timezone=auto&forecast_days=5`
    );
    const weatherData = await weatherRes.json();

    res.json({
      place: resolvedName || place,
      latitude,
      longitude,
      current: weatherData.current,
      daily: weatherData.daily,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch weather data.' });
  }
});

module.exports = router;
