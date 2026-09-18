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
    if (text !== null) el.innerHTML = text;
  });
  document.querySelectorAll('[data-en-placeholder]').forEach((el) => {
    const text =
      lang === 'np'
        ? el.getAttribute('data-np-placeholder')
        : el.getAttribute('data-en-placeholder');
    if (text !== null) el.placeholder = text;
  });

  // Re-render dynamic content that isn't covered by data-en/data-np attributes
  if (allSchemes.length) renderSchemesList();
  if (selectedSchemeId) loadSchemeDetail(selectedSchemeId);
  if (allCropHealth.length) renderCropHealthList();
  if (selectedCropHealthId) loadCropHealthDetail(selectedCropHealthId);
  renderQuickChips();
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

    if (btn.dataset.tab === 'loans' && !schemesList.dataset.loaded) {
      fetchSchemes();
      schemesList.dataset.loaded = 'true';
    }
    if (btn.dataset.tab === 'mandi' && !mandiResult.dataset.loaded) {
      fetchMandi();
      mandiResult.dataset.loaded = 'true';
    }
    if (btn.dataset.tab === 'crophealth' && !cropHealthList.dataset.loaded) {
      fetchCropHealth();
      cropHealthList.dataset.loaded = 'true';
    }
  });
});

// ---------- Chat ----------
const chatWindow = document.getElementById('chat-window');
const chatForm = document.getElementById('chat-form');
const chatInput = document.getElementById('chat-input');
const quickChipsEl = document.getElementById('chat-quick-chips');

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

async function sendChat(message) {
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
    if (chatHistory.length > 20) chatHistory = chatHistory.slice(-20);
  } catch (err) {
    thinking.remove();
    addMessage('Could not reach the server.', 'bot');
  }
}

chatForm.addEventListener('submit', (e) => {
  e.preventDefault();
  sendChat(chatInput.value.trim());
});

// Quick chips: one tap to ask about a scheme by name, in the current language
function renderQuickChips() {
  quickChipsEl.innerHTML = '';
  if (!allSchemes.length) return;
  allSchemes.slice(0, 5).forEach((s) => {
    const label = currentLang === 'np' ? s.category_np : s.category_en;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'quick-chip';
    btn.textContent = label;
    btn.addEventListener('click', () => {
      const prompt =
        currentLang === 'np'
          ? `${label} बारे मलाई बताउनुहोस् — कागजात र प्रक्रिया के हो?`
          : `Tell me about ${label} — what documents and steps are involved?`;
      sendChat(prompt);
    });
    quickChipsEl.appendChild(btn);
  });
}

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
      html += `<p style="color:#a85c32;">${data.message || ''}</p>`;
    } else if (data.fetchedAt) {
      const asOf = new Date(data.fetchedAt).toLocaleString(currentLang === 'np' ? 'ne-NP' : 'en-US');
      html += `<p style="color:var(--ink-soft); font-size:0.82rem;">${
        currentLang === 'np' ? 'अद्यावधिक' : 'Updated'
      }: ${asOf} (${currentLang === 'np' ? 'स्वतः हरेक ३० मिनेटमा ताजा हुन्छ' : 'auto-refreshes every 30 min'})</p>`;
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

// ---------- Loan & Subsidy Guide ----------
const schemesList = document.getElementById('schemes-list');
const schemeDetail = document.getElementById('scheme-detail');
const schemeSearch = document.getElementById('scheme-search');
const tagChipsEl = document.getElementById('tag-chips');

let allSchemes = [];
let activeTag = null;
let selectedSchemeId = null;

const BOOKMARK_KEY = 'krishak-sarathi-bookmarked-schemes';
function getBookmarks() {
  try {
    return JSON.parse(localStorage.getItem(BOOKMARK_KEY) || '[]');
  } catch (e) {
    return [];
  }
}
function toggleBookmark(id) {
  const marks = getBookmarks();
  const idx = marks.indexOf(id);
  if (idx === -1) marks.push(id);
  else marks.splice(idx, 1);
  try {
    localStorage.setItem(BOOKMARK_KEY, JSON.stringify(marks));
  } catch (e) {
    /* storage unavailable — bookmarks just won't persist */
  }
  renderSchemesList();
}

async function fetchSchemes() {
  schemesList.textContent = currentLang === 'np' ? 'लोड हुँदैछ...' : 'Loading...';
  try {
    const res = await fetch(`${API_BASE}/api/schemes`);
    allSchemes = await res.json();
    renderTagChips();
    renderSchemesList();
    renderQuickChips();
  } catch (err) {
    schemesList.textContent = 'Could not reach the server.';
  }
}

function renderTagChips() {
  const tagSet = new Set();
  allSchemes.forEach((s) => (s.tags || []).forEach((t) => tagSet.add(t)));
  tagChipsEl.innerHTML = '';

  const allBtn = document.createElement('button');
  allBtn.type = 'button';
  allBtn.className = 'tag-chip' + (activeTag === null ? ' active' : '');
  allBtn.textContent = currentLang === 'np' ? 'सबै' : 'All';
  allBtn.addEventListener('click', () => {
    activeTag = null;
    renderTagChips();
    renderSchemesList();
  });
  tagChipsEl.appendChild(allBtn);

  [...tagSet].sort().forEach((tag) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'tag-chip' + (activeTag === tag ? ' active' : '');
    btn.textContent = tag;
    btn.addEventListener('click', () => {
      activeTag = activeTag === tag ? null : tag;
      renderTagChips();
      renderSchemesList();
    });
    tagChipsEl.appendChild(btn);
  });
}

function renderSchemesList() {
  const query = (schemeSearch.value || '').trim().toLowerCase();
  const bookmarks = getBookmarks();

  const filtered = allSchemes.filter((s) => {
    const matchesTag = !activeTag || (s.tags || []).includes(activeTag);
    const matchesQuery =
      !query ||
      [s.category_en, s.category_np, s.summary_en, s.summary_np]
        .filter(Boolean)
        .some((f) => f.toLowerCase().includes(query));
    return matchesTag && matchesQuery;
  });

  schemesList.innerHTML = '';

  if (filtered.length === 0) {
    const empty = document.createElement('p');
    empty.style.color = 'var(--ink-soft)';
    empty.style.fontSize = '0.9rem';
    empty.textContent =
      currentLang === 'np' ? 'कुनै योजना फेला परेन।' : 'No schemes match your search.';
    schemesList.appendChild(empty);
    return;
  }

  filtered.forEach((s) => {
    const card = document.createElement('div');
    card.className = 'scheme-card' + (s.id === selectedSchemeId ? ' selected' : '');

    const isSaved = bookmarks.includes(s.id);
    const difficultyLabel =
      currentLang === 'np'
        ? { easy: 'सजिलो', medium: 'मध्यम', hard: 'कठिन' }[s.difficulty] || s.difficulty
        : s.difficulty;

    card.innerHTML = `
      <button class="bookmark-btn ${isSaved ? 'saved' : ''}" title="Bookmark" aria-label="Bookmark">${isSaved ? '★' : '☆'}</button>
      <h4>${currentLang === 'np' ? s.category_np : s.category_en}</h4>
      <p>${currentLang === 'np' ? s.summary_np : s.summary_en}</p>
      <div class="scheme-meta">
        ${s.difficulty ? `<span>${difficultyLabel}</span>` : ''}
        ${(currentLang === 'np' ? s.processing_time_np : s.processing_time_en) ? `<span>${currentLang === 'np' ? s.processing_time_np : s.processing_time_en}</span>` : ''}
        ${s.last_checked ? `<span>${currentLang === 'np' ? 'पछिल्लो जाँच' : 'checked'}: ${s.last_checked}</span>` : ''}
      </div>
    `;

    card.querySelector('.bookmark-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      toggleBookmark(s.id);
    });

    card.addEventListener('click', () => {
      selectedSchemeId = s.id;
      loadSchemeDetail(s.id);
      renderSchemesList();
    });

    schemesList.appendChild(card);
  });
}

async function loadSchemeDetail(id) {
  schemeDetail.innerHTML =
    currentLang === 'np' ? 'लोड हुँदैछ...' : 'Loading...';
  const res = await fetch(`${API_BASE}/api/schemes/${id}`);
  const s = await res.json();
  if (!res.ok) {
    schemeDetail.textContent = s.error || 'Could not load this scheme.';
    return;
  }

  const docs = s.docs_required || [];
  const steps = currentLang === 'np' ? s.steps_np : s.steps_en;
  const isNp = currentLang === 'np';

  let html = `<h3>${isNp ? s.category_np : s.category_en}</h3>`;
  html += `<div class="verified-line">${
    isNp ? 'स्रोत' : 'Source'
  }: ${s.source_url ? `<a href="${s.source_url}" target="_blank" rel="noopener">${s.source_url}</a>` : '—'} · ${
    isNp ? 'पछिल्लो जाँच' : 'last checked'
  }: ${s.last_checked || '—'}</div>`;

  const interestNote = isNp ? s.interest_note_np : s.interest_note_en;
  const collateralNote = isNp ? s.collateral_note_np : s.collateral_note_en;
  const office = isNp ? s.office_np : s.office_en;

  if (interestNote) html += `<div class="note-box">💰 ${interestNote}</div>`;
  if (collateralNote) html += `<div class="note-box">🔒 ${collateralNote}</div>`;
  if (office) html += `<div class="note-box">🏢 ${isNp ? 'कार्यालय' : 'Office'}: ${office}</div>`;

  html += `<h4>${isNp ? 'चाहिने कागजातहरू' : 'Documents required'}</h4><ul>`;
  docs.forEach((d) => (html += `<li>${d}</li>`));
  html += '</ul>';

  html += `<h4>${isNp ? 'प्रक्रिया' : 'Process'}</h4><ol>`;
  (steps || []).forEach((st) => (html += `<li>${st}</li>`));
  html += '</ol>';

  html += `<div class="detail-actions">
      <button id="download-checklist">${isNp ? '⬇ चेकलिस्ट डाउनलोड गर्नुहोस्' : '⬇ Download checklist'}</button>
      <button id="print-checklist">${isNp ? '🖨 प्रिन्ट गर्नुहोस्' : '🖨 Print'}</button>
      <button id="ask-about-scheme">${isNp ? '💬 यसबारे सोध्नुहोस्' : '💬 Ask about this'}</button>
    </div>`;

  schemeDetail.innerHTML = html;

  document.getElementById('download-checklist').addEventListener('click', () => downloadChecklist(s, isNp));
  document.getElementById('print-checklist').addEventListener('click', () => printChecklist(s, isNp));
  document.getElementById('ask-about-scheme').addEventListener('click', () => {
    document.querySelector('.tab-btn[data-tab="chat"]').click();
    const label = isNp ? s.category_np : s.category_en;
    sendChat(
      isNp
        ? `${label} बारे मलाई विस्तृत बताउनुहोस्।`
        : `Tell me more about ${label} and how I should prepare.`
    );
  });
}

function checklistText(s, isNp) {
  const docs = s.docs_required || [];
  const steps = isNp ? s.steps_np : s.steps_en;
  const lines = [];
  lines.push(isNp ? s.category_np : s.category_en);
  lines.push('='.repeat(30));
  lines.push('');
  lines.push(isNp ? 'चाहिने कागजातहरू:' : 'Documents required:');
  docs.forEach((d) => lines.push(`[ ] ${d}`));
  lines.push('');
  lines.push(isNp ? 'प्रक्रिया:' : 'Process:');
  (steps || []).forEach((st, i) => lines.push(`${i + 1}. ${st}`));
  lines.push('');
  lines.push(`${isNp ? 'स्रोत' : 'Source'}: ${s.source_url || '—'}`);
  lines.push(`${isNp ? 'पछिल्लो जाँच' : 'Last checked'}: ${s.last_checked || '—'}`);
  lines.push('');
  lines.push(
    isNp
      ? 'सूचना: भर पर्नुअघि हालको ब्याजदर, अनुदान रकम, र म्याद माथिको कार्यालयसँग पक्का गर्नुहोस्।'
      : 'Note: confirm current interest rates, subsidy amounts, and deadlines with the office above before relying on them.'
  );
  return lines.join('\n');
}

function downloadChecklist(s, isNp) {
  const text = checklistText(s, isNp);
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${s.id}-checklist.txt`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function printChecklist(s, isNp) {
  const text = checklistText(s, isNp).replace(/\n/g, '<br/>');
  const win = window.open('', '_blank');
  if (!win) return;
  win.document.write(`<html><head><title>${s.id}</title></head><body style="font-family: sans-serif; padding: 24px; line-height:1.6;">${text}</body></html>`);
  win.document.close();
  win.print();
}

schemeSearch.addEventListener('input', renderSchemesList);

// ---------- Crop Health Guide ----------
const cropHealthList = document.getElementById('crophealth-list');
const cropHealthDetail = document.getElementById('crophealth-detail');
const cropSearch = document.getElementById('crop-search');
const cropTypeChipsEl = document.getElementById('crop-type-chips');

let allCropHealth = [];
let activeCropType = null;
let selectedCropHealthId = null;

async function fetchCropHealth() {
  cropHealthList.textContent = currentLang === 'np' ? 'लोड हुँदैछ...' : 'Loading...';
  try {
    const res = await fetch(`${API_BASE}/api/crop-health`);
    allCropHealth = await res.json();
    renderCropTypeChips();
    renderCropHealthList();
  } catch (err) {
    cropHealthList.textContent = 'Could not reach the server.';
  }
}

function renderCropTypeChips() {
  const typeSet = new Set();
  allCropHealth.forEach((e) => e.type && typeSet.add(e.type));
  cropTypeChipsEl.innerHTML = '';

  const allBtn = document.createElement('button');
  allBtn.type = 'button';
  allBtn.className = 'tag-chip' + (activeCropType === null ? ' active' : '');
  allBtn.textContent = currentLang === 'np' ? 'सबै' : 'All';
  allBtn.addEventListener('click', () => {
    activeCropType = null;
    renderCropTypeChips();
    renderCropHealthList();
  });
  cropTypeChipsEl.appendChild(allBtn);

  [...typeSet].sort().forEach((type) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'tag-chip' + (activeCropType === type ? ' active' : '');
    btn.textContent = type;
    btn.addEventListener('click', () => {
      activeCropType = activeCropType === type ? null : type;
      renderCropTypeChips();
      renderCropHealthList();
    });
    cropTypeChipsEl.appendChild(btn);
  });
}

function renderCropHealthList() {
  const query = (cropSearch.value || '').trim().toLowerCase();

  const filtered = allCropHealth.filter((e) => {
    const matchesType = !activeCropType || e.type === activeCropType;
    const matchesQuery =
      !query ||
      [e.crop_en, e.crop_np, e.name_en, e.name_np, e.causal_agent]
        .filter(Boolean)
        .some((f) => f.toLowerCase().includes(query));
    return matchesType && matchesQuery;
  });

  cropHealthList.innerHTML = '';

  if (filtered.length === 0) {
    const empty = document.createElement('p');
    empty.style.color = 'var(--ink-soft)';
    empty.style.fontSize = '0.9rem';
    empty.textContent = currentLang === 'np' ? 'कुनै नतिजा फेला परेन।' : 'No matching entries.';
    cropHealthList.appendChild(empty);
    return;
  }

  filtered.forEach((e) => {
    const card = document.createElement('div');
    card.className = 'scheme-card' + (e.id === selectedCropHealthId ? ' selected' : '');
    card.innerHTML = `
      <h4>${currentLang === 'np' ? e.crop_np : e.crop_en} — ${currentLang === 'np' ? e.name_np : e.name_en}</h4>
      <p>${e.causal_agent || ''}</p>
      <div class="scheme-meta"><span>${e.type}</span>${e.last_checked ? `<span>${currentLang === 'np' ? 'पछिल्लो जाँच' : 'checked'}: ${e.last_checked}</span>` : ''}</div>
    `;
    card.addEventListener('click', () => {
      selectedCropHealthId = e.id;
      loadCropHealthDetail(e.id);
      renderCropHealthList();
    });
    cropHealthList.appendChild(card);
  });
}

async function loadCropHealthDetail(id) {
  cropHealthDetail.innerHTML = currentLang === 'np' ? 'लोड हुँदैछ...' : 'Loading...';
  const res = await fetch(`${API_BASE}/api/crop-health/${id}`);
  const e = await res.json();
  if (!res.ok) {
    cropHealthDetail.textContent = e.error || 'Could not load this entry.';
    return;
  }

  const isNp = currentLang === 'np';
  const management = isNp ? e.management_np : e.management_en;

  let html = `<h3>${isNp ? e.crop_np : e.crop_en} — ${isNp ? e.name_np : e.name_en}</h3>`;
  html += `<div class="verified-line">${isNp ? 'कारक' : 'Causal agent'}: ${e.causal_agent} · ${
    isNp ? 'स्रोत' : 'source'
  }: ${e.source_url ? `<a href="${e.source_url}" target="_blank" rel="noopener">${isNp ? 'लिंक' : 'link'}</a>` : '—'} · ${
    isNp ? 'पछिल्लो जाँच' : 'last checked'
  }: ${e.last_checked || '—'}</div>`;

  html += `<div class="note-box">🩺 ${isNp ? e.symptoms_np : e.symptoms_en}</div>`;
  html += `<div class="note-box">🌦️ ${isNp ? e.favorable_conditions_np : e.favorable_conditions_en}</div>`;
  if (isNp ? e.regions_np : e.regions_en) {
    html += `<div class="note-box">📍 ${isNp ? e.regions_np : e.regions_en}</div>`;
  }

  html += `<h4>${isNp ? 'व्यवस्थापन' : 'Management'}</h4><ul>`;
  (management || []).forEach((m) => (html += `<li>${m}</li>`));
  html += '</ul>';

  html += `<div class="detail-actions">
      <button id="ask-about-crophealth">${isNp ? '💬 सारथीलाई सोध्नुहोस्' : '💬 Ask Sarathi about this'}</button>
    </div>`;

  cropHealthDetail.innerHTML = html;

  document.getElementById('ask-about-crophealth').addEventListener('click', () => {
    document.querySelector('.tab-btn[data-tab="chat"]').click();
    const label = isNp ? e.name_np : e.name_en;
    const crop = isNp ? e.crop_np : e.crop_en;
    sendChat(
      isNp
        ? `मेरो ${crop} मा ${label} जस्तो देखिन्छ, मैले के गर्ने?`
        : `I think my ${crop} has ${label} — what should I do?`
    );
  });
}

cropSearch.addEventListener('input', renderCropHealthList);

// ---------- Loan (EMI) calculator ----------
const emiForm = document.getElementById('emi-form');
const emiResultBox = document.getElementById('emi-result');

function formatNPR(n) {
  return 'रु. ' + Math.round(n).toLocaleString('en-IN');
}

emiForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const principal = parseFloat(document.getElementById('emi-principal').value);
  const annualRate = parseFloat(document.getElementById('emi-rate').value);
  const months = parseInt(document.getElementById('emi-months').value, 10);

  if (!principal || principal <= 0 || months <= 0 || annualRate < 0) return;

  const monthlyRate = annualRate / 12 / 100;
  let monthlyPayment;
  if (monthlyRate === 0) {
    monthlyPayment = principal / months;
  } else {
    monthlyPayment =
      (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) /
      (Math.pow(1 + monthlyRate, months) - 1);
  }
  const totalRepayment = monthlyPayment * months;
  const totalInterest = totalRepayment - principal;

  document.getElementById('emi-monthly').textContent = formatNPR(monthlyPayment);
  document.getElementById('emi-total').textContent = formatNPR(totalRepayment);
  document.getElementById('emi-interest').textContent = formatNPR(totalInterest);
  emiResultBox.hidden = false;
});

// ---------- Initial load ----------
// Pre-load schemes in the background so quick chips are ready even before
// the user opens the Loan & Subsidy Guide tab.
fetchSchemes();
