// If you deploy the frontend separately from the backend (e.g. frontend on
// GitHub Pages / embedded in anuppudasaini.com.np, backend on Render/Vercel),
// set this to your backend's full URL, e.g. "https://your-backend.onrender.com".
// Leave empty if frontend and backend are served together.
const API_BASE = '';

let currentLang = 'en';
let chatHistory = []; // sent to backend so the advisor has conversation context

// ---------- Language toggle ----------
function setLang(lang) {
  currentLang = lang;
  document.getElementById('lang-en').classList.toggle('active', lang === 'en');
  document.getElementById('lang-np').classList.toggle('active', lang === 'np');

  document.querySelectorAll('[data-en]').forEach((el) => {
    const text = lang === 'np' ? el.getAttribute('data-np') : el.getAttribute('data-en');
    if (text !== null) el.textContent = text;
  });
  document.querySelectorAll('[data-en-placeholder]').forEach((el) => {
    const text =
      lang === 'np'
        ? el.getAttribute('data-np-placeholder')
        : el.getAttribute('data-en-placeholder');
    if (text !== null) el.placeholder = text;
  });
}
document.getElementById('lang-en').addEventListener('click', () => setLang('en'));
document.getElementById('lang-np').addEventListener('click', () => setLang('np'));

// ---------- Tabs ----------
document.querySelectorAll('.tab-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach((b) => b.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach((p) => p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(`tab-${btn.dataset.tab}`).classList.add('active');
  });
});

// ---------- Chat ----------
const chatWindow = document.getElementById('chat-window');
const chatForm = document.getElementById('chat-form');
const chatInput = document.getElementById('chat-input');

function addMessage(text, sender) {
  const div = document.createElement('div');
  div.className = `msg ${sender}`;
  div.textContent = text;
  chatWindow.appendChild(div);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

function speak(text) {
  if (!('speechSynthesis' in window)) return;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = currentLang === 'np' ? 'ne-NP' : 'en-US';
  window.speechSynthesis.speak(utterance);
}

chatForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const message = chatInput.value.trim();
  if (!message) return;

  addMessage(message, 'user');
  chatInput.value = '';

  const thinking = document.createElement('div');
  thinking.className = 'msg bot';
  thinking.textContent = currentLang === 'np' ? 'सोच्दैछु...' : 'Thinking...';
  chatWindow.appendChild(thinking);
  chatWindow.scrollTop = chatWindow.scrollHeight;

  try {
    const res = await fetch(`${API_BASE}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, history: chatHistory }),
    });
    const data = await res.json();
    thinking.remove();

    if (!res.ok) {
      addMessage(data.error || 'Something went wrong.', 'bot');
      return;
    }

    addMessage(data.reply, 'bot');
    speak(data.reply);

    chatHistory.push({ role: 'user', content: message });
    chatHistory.push({ role: 'assistant', content: data.reply });
    // Keep history from growing unbounded
    if (chatHistory.length > 20) chatHistory = chatHistory.slice(-20);
  } catch (err) {
    thinking.remove();
    addMessage('Could not reach the server.', 'bot');
  }
});

// ---------- Voice input (Web Speech API — Chrome/Edge support only) ----------
const micBtn = document.getElementById('mic-btn');
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognizer = null;

if (SpeechRecognition) {
  recognizer = new SpeechRecognition();
  recognizer.continuous = false;
  recognizer.interimResults = false;

  recognizer.onresult = (event) => {
    chatInput.value = event.results[0][0].transcript;
    micBtn.classList.remove('recording');
  };
  recognizer.onerror = () => micBtn.classList.remove('recording');
  recognizer.onend = () => micBtn.classList.remove('recording');

  micBtn.addEventListener('click', () => {
    recognizer.lang = currentLang === 'np' ? 'ne-NP' : 'en-US';
    micBtn.classList.add('recording');
    recognizer.start();
  });
} else {
  micBtn.addEventListener('click', () => {
    alert('Voice input is not supported in this browser. Try Chrome or Edge.');
  });
}

// ---------- Weather ----------
const weatherForm = document.getElementById('weather-form');
const weatherResult = document.getElementById('weather-result');

async function fetchWeather(params) {
  weatherResult.textContent = currentLang === 'np' ? 'लोड हुँदैछ...' : 'Loading...';
  try {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/api/weather?${query}`);
    const data = await res.json();
    if (!res.ok) {
      weatherResult.textContent = data.error || 'Could not load weather.';
      return;
    }
    renderWeather(data);
  } catch (err) {
    weatherResult.textContent = 'Could not reach the server.';
  }
}

function renderWeather(data) {
  const c = data.current || {};
  const d = data.daily || {};
  let html = `<h3>${data.place || ''}</h3>`;
  html += `<p><strong>${currentLang === 'np' ? 'हाल' : 'Now'}:</strong> ${c.temperature_2m ?? '—'}°C, ${
    currentLang === 'np' ? 'आर्द्रता' : 'humidity'
  } ${c.relative_humidity_2m ?? '—'}%, ${currentLang === 'np' ? 'वर्षा' : 'rain'} ${
    c.precipitation ?? 0
  }mm</p>`;

  if (d.time) {
    html += '<table class="price-table"><tr><th>Date</th><th>Max°C</th><th>Min°C</th><th>Rain(mm)</th></tr>';
    d.time.forEach((date, i) => {
      html += `<tr><td>${date}</td><td>${d.temperature_2m_max[i]}</td><td>${d.temperature_2m_min[i]}</td><td>${d.precipitation_sum[i]}</td></tr>`;
    });
    html += '</table>';
  }
  weatherResult.innerHTML = html;
}

weatherForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const place = document.getElementById('weather-place').value.trim();
  if (!place) return;
  fetchWeather({ place });
});

document.getElementById('geo-btn').addEventListener('click', () => {
  if (!navigator.geolocation) {
    alert('Geolocation not supported in this browser.');
    return;
  }
  navigator.geolocation.getCurrentPosition(
    (pos) => fetchWeather({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
    () => alert('Could not get your location.')
  );
});

// ---------- Mandi prices ----------
const mandiResult = document.getElementById('mandi-result');

async function fetchMandi() {
  mandiResult.textContent = currentLang === 'np' ? 'लोड हुँदैछ...' : 'Loading...';
  try {
    const res = await fetch(`${API_BASE}/api/mandi`);
    const data = await res.json();

    let html = '';
    if (data.stale) {
      html += `<p style="color:#b5895c;">${data.message || ''}</p>`;
    }
    html += '<table class="price-table"><tr><th>Commodity</th><th>Unit</th><th>Min</th><th>Max</th></tr>';
    (data.prices || []).forEach((p) => {
      html += `<tr><td>${p.commodity}</td><td>${p.unit}</td><td>${p.min}</td><td>${p.max}</td></tr>`;
    });
    html += '</table>';
    mandiResult.innerHTML = html;
  } catch (err) {
    mandiResult.textContent = 'Could not reach the server.';
  }
}
document.getElementById('mandi-refresh').addEventListener('click', fetchMandi);

// ---------- Schemes / subsidy & loan documentation ----------
const schemesList = document.getElementById('schemes-list');
const schemeDetail = document.getElementById('scheme-detail');

async function fetchSchemes() {
  schemesList.textContent = currentLang === 'np' ? 'लोड हुँदैछ...' : 'Loading...';
  try {
    const res = await fetch(`${API_BASE}/api/schemes`);
    const list = await res.json();
    schemesList.innerHTML = '';
    list.forEach((s) => {
      const card = document.createElement('div');
      card.className = 'scheme-card';
      card.innerHTML = `<h4>${currentLang === 'np' ? s.category_np : s.category_en}</h4>
        <p>${currentLang === 'np' ? s.summary_np : s.summary_en}</p>`;
      card.addEventListener('click', () => loadSchemeDetail(s.id));
      schemesList.appendChild(card);
    });
  } catch (err) {
    schemesList.textContent = 'Could not reach the server.';
  }
}

async function loadSchemeDetail(id) {
  schemeDetail.textContent = currentLang === 'np' ? 'लोड हुँदैछ...' : 'Loading...';
  const res = await fetch(`${API_BASE}/api/schemes/${id}`);
  const s = await res.json();

  const docs = s.docs_required || [];
  const steps = currentLang === 'np' ? s.steps_np : s.steps_en;

  let html = `<h3>${currentLang === 'np' ? s.category_np : s.category_en}</h3>`;
  html += `<h4>${currentLang === 'np' ? 'चाहिने कागजातहरू' : 'Documents required'}</h4><ul>`;
  docs.forEach((d) => (html += `<li>${d}</li>`));
  html += '</ul>';
  html += `<h4>${currentLang === 'np' ? 'प्रक्रिया' : 'Process'}</h4><ol>`;
  (steps || []).forEach((st) => (html += `<li>${st}</li>`));
  html += '</ol>';

  schemeDetail.innerHTML = html;
}

// Load schemes once on first visit to that tab
document.querySelector('[data-tab="schemes"]').addEventListener(
  'click',
  () => {
    if (!schemesList.dataset.loaded) {
      fetchSchemes();
      schemesList.dataset.loaded = 'true';
    }
  },
  { once: false }
);

// Load mandi prices once on first visit
document.querySelector('[data-tab="mandi"]').addEventListener(
  'click',
  () => {
    if (!mandiResult.dataset.loaded) {
      fetchMandi();
      mandiResult.dataset.loaded = 'true';
    }
  },
  { once: false }
);
