/* =========================================================
   KRISHAK SARATHI — PROFESSIONAL FRONTEND APP
   ---------------------------------------------------------
   Professional UI, AI advisor, loan/subsidy guide,
   crop health, calculator, weather and mandi modules.
========================================================= */

const API_BASE = '';

let currentLang = 'en';
let chatHistory = [];
let allSchemes = [];
let activeTag = null;
let selectedSchemeId = null;
let allCropHealth = [];
let activeCropType = null;
let selectedCropHealthId = null;

const BOOKMARK_KEY = 'krishak-sarathi-bookmarked-schemes';

/* =========================================================
   PROFESSIONAL UI LAYER
========================================================= */

function injectProfessionalUI() {
  if (document.getElementById('ks-professional-ui')) return;

  const style = document.createElement('style');
  style.id = 'ks-professional-ui';

  style.textContent = `
    :root {
      --ks-green: #214d3a;
      --ks-green-dark: #173b2d;
      --ks-green-deep: #102b21;
      --ks-green-soft: #eaf1ec;

      --ks-gold: #d39a25;
      --ks-gold-dark: #b67d15;
      --ks-gold-soft: #f7ecd0;

      --ks-terracotta: #a85d32;
      --ks-terracotta-soft: #f3e5dc;

      --ks-cream: #f7f4ec;
      --ks-paper: #fffdf9;
      --ks-white: #ffffff;

      --ks-text: #1f2a26;
      --ks-muted: #68736d;
      --ks-light-text: #8a938e;

      --ks-border: #e2ded3;
      --ks-border-dark: #d2cbbd;

      --ks-success: #3d7857;
      --ks-danger: #b44e42;
      --ks-info: #55788d;

      --ks-shadow-sm:
        0 2px 10px rgba(24, 54, 40, .055);

      --ks-shadow:
        0 10px 35px rgba(24, 54, 40, .08);

      --ks-shadow-lg:
        0 20px 60px rgba(24, 54, 40, .12);

      --ks-radius-sm: 10px;
      --ks-radius: 16px;
      --ks-radius-lg: 22px;

      --ks-transition:
        all .22s cubic-bezier(.2,.65,.3,1);
    }

    *,
    *::before,
    *::after {
      box-sizing: border-box;
    }

    html {
      scroll-behavior: smooth;
    }

    body {
      background:
        radial-gradient(
          circle at 8% 0%,
          rgba(211,154,37,.065),
          transparent 28%
        ),
        radial-gradient(
          circle at 92% 12%,
          rgba(33,77,58,.045),
          transparent 26%
        ),
        linear-gradient(
          180deg,
          #f8f5ed 0%,
          #f5f3ec 100%
        );

      color: var(--ks-text);
    }

    body::selection {
      background: rgba(211,154,37,.25);
    }

    button,
    input,
    select,
    textarea {
      font-family: inherit;
    }

    button {
      cursor: pointer;
    }

    /* -----------------------------------------
       TOP BAR
    ----------------------------------------- */

    .topbar {
      position: sticky;
      top: 0;
      z-index: 1000;

      min-height: 86px;

      display: flex;
      align-items: center;
      justify-content: space-between;

      padding: 0 4.5%;

      background:
        linear-gradient(
          135deg,
          var(--ks-green-dark),
          var(--ks-green)
        );

      box-shadow:
        0 5px 22px rgba(20,45,34,.14);
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 14px;

      transition: var(--ks-transition);
    }

    .brand:hover {
      transform: translateY(-1px);
    }

    .brand-mark {
      width: 48px;
      height: 48px;

      display: grid;
      place-items: center;

      border-radius: 50%;

      background:
        linear-gradient(
          145deg,
          #e0a72c,
          #c88b18
        );

      color: var(--ks-green-dark);

      font-family:
        'Noto Sans Devanagari',
        sans-serif;

      font-size: 25px;
      font-weight: 700;

      box-shadow:
        inset 0 1px 0 rgba(255,255,255,.28),
        0 5px 16px rgba(0,0,0,.13);
    }

    .brand-name {
      color: #fff;

      font-family:
        Fraunces,
        Georgia,
        serif;

      font-size: clamp(22px, 2.2vw, 30px);
      font-weight: 600;
      letter-spacing: -.2px;
    }

    /* -----------------------------------------
       LANGUAGE SWITCHER
    ----------------------------------------- */

    .lang-toggle {
      display: flex;
      align-items: center;
      gap: 6px;

      padding: 4px;

      border: 1px solid rgba(255,255,255,.25);
      border-radius: 999px;

      background: rgba(255,255,255,.06);

      backdrop-filter: blur(10px);
    }

    .lang-btn {
      min-width: 58px;
      height: 38px;

      padding: 0 15px;

      border: 0;
      border-radius: 999px;

      background: transparent;
      color: rgba(255,255,255,.88);

      font-size: 14px;
      font-weight: 600;

      transition: var(--ks-transition);
    }

    .lang-btn:hover {
      background: rgba(255,255,255,.12);
    }

    .lang-btn.active {
      background: var(--ks-gold);
      color: var(--ks-green-dark);

      box-shadow:
        0 3px 10px rgba(0,0,0,.12);
    }

    /* -----------------------------------------
       TERRACE DECORATIVE LINE
    ----------------------------------------- */

    .terrace-line {
      height: 8px;

      background:
        repeating-linear-gradient(
          90deg,
          var(--ks-gold) 0 54px,
          var(--ks-terracotta) 54px 110px,
          #82968b 110px 164px,
          var(--ks-gold) 164px 218px
        );

      opacity: .95;
    }

    /* -----------------------------------------
       MAIN NAVIGATION
    ----------------------------------------- */

    .tabs {
      position: sticky;
      top: 86px;
      z-index: 900;

      display: grid;
      grid-template-columns:
        repeat(6, minmax(0, 1fr));

      min-height: 70px;

      background: rgba(255,253,249,.97);

      border-bottom:
        1px solid var(--ks-border);

      box-shadow:
        0 3px 15px rgba(30,45,38,.045);

      backdrop-filter: blur(14px);
    }

    .tab-btn {
      position: relative;

      display: flex;
      align-items: center;
      justify-content: center;

      padding: 0 18px;

      border: 0;
      border-bottom: 3px solid transparent;

      background: transparent;
      color: #27372f;

      font-size: 16px;
      font-weight: 600;

      transition: var(--ks-transition);
    }

    .tab-btn::after {
      content: '';

      position: absolute;
      left: 50%;
      bottom: -3px;

      width: 0;
      height: 3px;

      transform: translateX(-50%);

      background: var(--ks-gold);

      transition:
        width .25s ease;
    }

    .tab-btn:hover {
      background: var(--ks-green-soft);
      color: var(--ks-green-dark);
    }

    .tab-btn.active {
      color: var(--ks-green-dark);
      background: rgba(234,241,236,.48);
    }

    .tab-btn.active::after {
      width: 100%;
    }

    /* -----------------------------------------
       MAIN CONTENT
    ----------------------------------------- */

    main {
      width: min(1180px, 92%);
      margin: 0 auto;

      padding:
        38px 0 70px;
    }

    .tab-panel {
      animation:
        ksPanelIn .28s ease both;
    }

    @keyframes ksPanelIn {
      from {
        opacity: 0;
        transform: translateY(7px);
      }

      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .section-lede {
      max-width: 820px;

      margin:
        0 auto 27px;

      color: #53615a;

      font-size: 16px;
      line-height: 1.75;
      letter-spacing: .15px;
    }

    /* -----------------------------------------
       CARD SYSTEM
    ----------------------------------------- */

    .result-box,
    .chat-window,
    .scheme-detail,
    .schemes-list,
    .emi-form {
      border:
        1px solid var(--ks-border);

      background:
        rgba(255,253,249,.92);

      box-shadow:
        var(--ks-shadow);

      border-radius:
        var(--ks-radius);
    }

    /* -----------------------------------------
       CHAT AREA
    ----------------------------------------- */

    .chat-window {
      min-height: 430px;

      padding: 22px;

      overflow-y: auto;

      background:
        linear-gradient(
          180deg,
          rgba(255,253,249,.98),
          rgba(250,248,241,.95)
        );
    }

    .chat-window::-webkit-scrollbar {
      width: 8px;
    }

    .chat-window::-webkit-scrollbar-track {
      background: transparent;
    }

    .chat-window::-webkit-scrollbar-thumb {
      background: #d7d2c7;
      border-radius: 20px;
    }

    .msg {
      max-width: 82%;

      padding: 15px 18px;

      margin:
        0 0 14px;

      border-radius: 17px;

      font-size: 15px;
      line-height: 1.65;

      animation:
        ksMessageIn .25s ease both;
    }

    @keyframes ksMessageIn {
      from {
        opacity: 0;
        transform: translateY(5px);
      }

      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .msg.bot {
      margin-right: auto;

      border:
        1px solid #e0e7e1;

      border-top-left-radius: 5px;

      background:
        linear-gradient(
          145deg,
          #edf2ed,
          #e7eee9
        );

      color: #20362b;
    }

    .msg.user {
      margin-left: auto;

      border-top-right-radius: 5px;

      background:
        linear-gradient(
          145deg,
          var(--ks-green),
          var(--ks-green-dark)
        );

      color: #fff;

      box-shadow:
        0 5px 15px rgba(33,77,58,.12);
    }

    .msg.system {
      max-width: 100%;

      border: 1px dashed var(--ks-border-dark);

      background: #faf8f2;

      color: var(--ks-muted);

      font-size: 13px;
    }

    .msg strong {
      font-weight: 700;
    }

    .msg a {
      color: inherit;
      text-decoration: underline;
      text-underline-offset: 3px;
    }

    /* -----------------------------------------
       CHAT HEADER
    ----------------------------------------- */

    .ks-chat-header {
      display: flex;
      align-items: center;
      justify-content: space-between;

      gap: 15px;

      margin-bottom: 14px;

      padding: 17px 19px;

      border:
        1px solid var(--ks-border);

      border-radius:
        var(--ks-radius);

      background:
        rgba(255,253,249,.96);

      box-shadow:
        var(--ks-shadow-sm);
    }

    .ks-chat-identity {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .ks-ai-avatar {
      width: 43px;
      height: 43px;

      display: grid;
      place-items: center;

      border-radius: 13px;

      background:
        linear-gradient(
          145deg,
          var(--ks-green),
          var(--ks-green-dark)
        );

      color: #fff;

      font-size: 19px;

      box-shadow:
        0 5px 14px rgba(33,77,58,.18);
    }

    .ks-ai-title {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .ks-ai-title strong {
      font-size: 15px;
      color: var(--ks-green-dark);
    }

    .ks-ai-status {
      display: flex;
      align-items: center;
      gap: 6px;

      color: var(--ks-muted);

      font-size: 12px;
    }

    .ks-status-dot {
      width: 7px;
      height: 7px;

      border-radius: 50%;

      background: #4f8c61;

      box-shadow:
        0 0 0 4px rgba(79,140,97,.10);
    }

    /* -----------------------------------------
       QUICK ACTIONS
    ----------------------------------------- */

    .quick-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 9px;

      margin:
        15px 0;
    }

    .quick-chip {
      min-height: 39px;

      display: inline-flex;
      align-items: center;

      padding: 8px 14px;

      border:
        1px solid var(--ks-border);

      border-radius: 999px;

      background:
        rgba(255,253,249,.95);

      color: #42534b;

      font-size: 13px;
      font-weight: 500;

      box-shadow:
        0 2px 7px rgba(25,45,35,.035);

      transition: var(--ks-transition);
    }

    .quick-chip:hover {
      transform: translateY(-2px);

      border-color:
        rgba(33,77,58,.35);

      background:
        var(--ks-green-soft);

      color:
        var(--ks-green-dark);

      box-shadow:
        0 7px 17px rgba(33,77,58,.08);
    }

    /* -----------------------------------------
       CHAT INPUT
    ----------------------------------------- */

    .chat-input-row {
      display: grid;
      grid-template-columns:
        auto 1fr auto;

      gap: 9px;

      margin-top: 13px;

      padding: 7px;

      border:
        1px solid var(--ks-border);

      border-radius:
        15px;

      background:
        var(--ks-paper);

      box-shadow:
        0 5px 20px rgba(24,54,40,.055);
    }

    .chat-input-row input {
      width: 100%;

      min-height: 47px;

      padding: 0 12px;

      border: 0;
      outline: 0;

      background: transparent;

      color: var(--ks-text);

      font-size: 15px;
    }

    .chat-input-row input::placeholder {
      color: #929b96;
    }

    .chat-input-row > button {
      min-width: 48px;

      border: 0;

      border-radius: 11px;

      background:
        var(--ks-green);

      color: #fff;

      font-weight: 600;

      transition: var(--ks-transition);
    }

    .chat-input-row > button:hover {
      background:
        var(--ks-green-dark);

      transform:
        translateY(-1px);
    }

    #mic-btn {
      background:
        #f0f2ed;

      color:
        var(--ks-green-dark);

      font-size: 17px;
    }

    #mic-btn:hover {
      background:
        var(--ks-green-soft);
    }

    #mic-btn.listening {
      background:
        var(--ks-terracotta);

      color: #fff;

      animation:
        ksPulse 1.2s infinite;
    }

    @keyframes ksPulse {
      0% {
        box-shadow:
          0 0 0 0 rgba(168,93,50,.28);
      }

      70% {
        box-shadow:
          0 0 0 10px rgba(168,93,50,0);
      }

      100% {
        box-shadow:
          0 0 0 0 rgba(168,93,50,0);
      }
    }

    /* -----------------------------------------
       FORM ELEMENTS
    ----------------------------------------- */

    input,
    select,
    textarea {
      border:
        1px solid var(--ks-border);

      border-radius:
        var(--ks-radius-sm);

      background:
        var(--ks-paper);

      color:
        var(--ks-text);

      transition:
        border-color .18s ease,
        box-shadow .18s ease,
        background .18s ease;
    }

    input:focus,
    select:focus,
    textarea:focus {
      outline: none;

      border-color:
        rgba(33,77,58,.55);

      box-shadow:
        0 0 0 4px rgba(33,77,58,.08);

      background:
        #fff;
    }

    button {
      transition:
        var(--ks-transition);
    }

    /* -----------------------------------------
       GENERAL BUTTONS
    ----------------------------------------- */

    main button:not(.tab-btn):not(.lang-btn):not(.quick-chip) {
      font-weight: 600;
    }

    /* -----------------------------------------
       TOOLBAR
    ----------------------------------------- */

    .loan-toolbar {
      display: flex;
      align-items: center;
      gap: 13px;

      flex-wrap: wrap;

      margin-bottom: 18px;
    }

    .scheme-search {
      flex:
        1 1 280px;

      min-height: 47px;

      padding:
        0 15px;
    }

    .tag-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 7px;
    }

    .tag-chip {
      padding:
        8px 12px;

      border:
        1px solid var(--ks-border);

      border-radius:
        999px;

      background:
        #fff;

      color:
        #53615a;

      font-size:
        12px;

      transition:
        var(--ks-transition);
    }

    .tag-chip:hover,
    .tag-chip.active {
      border-color:
        var(--ks-green);

      background:
        var(--ks-green);

      color:
        #fff;
    }

    /* -----------------------------------------
       LOAN LAYOUT
    ----------------------------------------- */

    .loan-layout {
      display:
        grid;

      grid-template-columns:
        minmax(290px, .85fr)
        minmax(0, 1.6fr);

      gap: 18px;

      align-items: start;
    }

    .schemes-list {
      padding:
        10px;

      max-height:
        680px;

      overflow-y:
        auto;
    }

    .scheme-detail {
      min-height:
        520px;

      padding:
        26px;
    }

    .scheme-card {
      position:
        relative;

      display:
        block;

      width:
        100%;

      padding:
        15px 16px;

      margin-bottom:
        7px;

      border:
        1px solid transparent;

      border-radius:
        13px;

      background:
        transparent;

      text-align:
        left;

      transition:
        var(--ks-transition);
    }

    .scheme-card:hover {
      border-color:
        var(--ks-border);

      background:
        #faf9f5;

      transform:
        translateX(2px);
    }

    .scheme-card.active {
      border-color:
        rgba(33,77,58,.2);

      background:
        var(--ks-green-soft);

      box-shadow:
        inset 3px 0 0 var(--ks-green);
    }

    .scheme-card-title {
      color:
        var(--ks-green-dark);

      font-size:
        14px;

      font-weight:
        700;

      line-height:
        1.45;
    }

    .scheme-card-meta {
      display:
        flex;

      flex-wrap:
        wrap;

      gap:
        6px;

      margin-top:
        7px;
    }

    .scheme-card-tag {
      display:
        inline-flex;

      padding:
        4px 8px;

      border-radius:
        999px;

      background:
        #f1eee6;

      color:
        #68736d;

      font-size:
        10px;

      font-weight:
        600;
    }

    /* -----------------------------------------
       EMPTY STATES
    ----------------------------------------- */

    .scheme-detail-empty,
    .ks-empty {
      min-height:
        300px;

      display:
        flex;

      flex-direction:
        column;

      align-items:
        center;

      justify-content:
        center;

      padding:
        40px;

      color:
        var(--ks-muted);

      text-align:
        center;

      line-height:
        1.7;
    }

    .ks-empty-icon {
      width:
        55px;

      height:
        55px;

      display:
        grid;

      place-items:
        center;

      margin-bottom:
        13px;

      border-radius:
        17px;

      background:
        var(--ks-green-soft);

      color:
        var(--ks-green);

      font-size:
        22px;
    }

    /* -----------------------------------------
       DETAIL HEADERS
    ----------------------------------------- */

    .scheme-detail h2,
    .scheme-detail h3 {
      color:
        var(--ks-green-dark);

      font-family:
        Fraunces,
        Georgia,
        serif;
    }

    .scheme-detail h2 {
      margin:
        0 0 9px;

      font-size:
        28px;

      line-height:
        1.2;
    }

    .scheme-detail h3 {
      margin-top:
        25px;

      margin-bottom:
        10px;

      font-size:
        19px;
    }

    .scheme-detail p {
      color:
        #59665f;

      line-height:
        1.7;
    }

    /* -----------------------------------------
       INFORMATION BOXES
    ----------------------------------------- */

    .ks-info-box {
      margin:
        17px 0;

      padding:
        15px 17px;

      border:
        1px solid #eadfc7;

      border-left:
        4px solid var(--ks-gold);

      border-radius:
        12px;

      background:
        #fcf7e9;
    }

    .ks-info-box strong {
      display:
        block;

      margin-bottom:
        4px;

      color:
        #6e521b;

      font-size:
        13px;
    }

    .ks-info-box p {
      margin:
        0;

      color:
        #6c624d;

      font-size:
        13px;
    }

    /* -----------------------------------------
       STEP LIST
    ----------------------------------------- */

    .ks-steps {
      display:
        grid;

      gap:
        10px;

      margin:
        14px 0;
    }

    .ks-step {
      display:
        grid;

      grid-template-columns:
        34px 1fr;

      gap:
        11px;

      padding:
        12px;

      border:
        1px solid var(--ks-border);

      border-radius:
        12px;

      background:
        #fff;
    }

    .ks-step-number {
      width:
        32px;

      height:
        32px;

      display:
        grid;

      place-items:
        center;

      border-radius:
        10px;

      background:
        var(--ks-green-soft);

      color:
        var(--ks-green-dark);

      font-size:
        12px;

      font-weight:
        700;
    }

    .ks-step-content {
      padding-top:
        4px;

      color:
        #4f5e56;

      font-size:
        13px;

      line-height:
        1.55;
    }

    /* -----------------------------------------
       TABLES
    ----------------------------------------- */

    .ks-table-wrap {
      overflow-x:
        auto;

      margin:
        14px 0;

      border:
        1px solid var(--ks-border);

      border-radius:
        12px;
    }

    .ks-table {
      width:
        100%;

      border-collapse:
        collapse;

      min-width:
        560px;

      background:
        #fff;
    }

    .ks-table th {
      padding:
        11px 13px;

      background:
        #f0f3ef;

      color:
        var(--ks-green-dark);

      font-size:
        12px;

      font-weight:
        700;

      text-align:
        left;

      border-bottom:
        1px solid var(--ks-border);
    }

    .ks-table td {
      padding:
        11px 13px;

      color:
        #56635c;

      font-size:
        12px;

      line-height:
        1.5;

      border-bottom:
        1px solid #eeeae1;
    }

    .ks-table tr:last-child td {
      border-bottom:
        0;
    }

    .ks-table tr:hover td {
      background:
        #fafaf7;
    }

    /* -----------------------------------------
       CALCULATOR
    ----------------------------------------- */

    .emi-form {
      display:
        grid;

      grid-template-columns:
        repeat(3, 1fr)
        auto;

      gap:
        14px;

      padding:
        21px;
    }

    .emi-form label {
      display:
        flex;

      flex-direction:
        column;

      gap:
        7px;

      color:
        #53615a;

      font-size:
        13px;

      font-weight:
        600;
    }

    .emi-form input {
      min-height:
        46px;

      padding:
        0 13px;

      font-size:
        15px;
    }

    .emi-form > button,
    #weather-form button,
    #mandi-refresh {
      min-height:
        46px;

      padding:
        0 18px;

      border:
        0;

      border-radius:
        11px;

      background:
        var(--ks-green);

      color:
        #fff;

      font-weight:
        600;

      box-shadow:
        0 5px 13px rgba(33,77,58,.13);
    }

    .emi-form > button:hover,
    #weather-form button:hover,
    #mandi-refresh:hover {
      background:
        var(--ks-green-dark);

      transform:
        translateY(-1px);
    }

    .emi-result {
      margin-top:
        17px;

      padding:
        25px;
    }

    .emi-headline {
      display:
        flex;

      align-items:
        center;

      justify-content:
        space-between;

      gap:
        20px;

      padding-bottom:
        19px;

      border-bottom:
        1px solid var(--ks-border);
    }

    .emi-label {
      color:
        var(--ks-muted);

      font-size:
        14px;
    }

    .emi-value {
      color:
        var(--ks-green-dark);

      font-family:
        Fraunces,
        Georgia,
        serif;

      font-size:
        32px;

      font-weight:
        600;
    }

    .emi-breakdown {
      display:
        grid;

      grid-template-columns:
        repeat(2, 1fr);

      gap:
        12px;

      margin-top:
        16px;
    }

    .emi-breakdown > div {
      display:
        flex;

      align-items:
        center;

      justify-content:
        space-between;

      gap:
        12px;

      padding:
        14px;

      border:
        1px solid var(--ks-border);

      border-radius:
        11px;

      background:
        #faf9f5;
    }

    .emi-breakdown span {
      color:
        var(--ks-muted);

      font-size:
        13px;
    }

    .emi-breakdown strong {
      color:
        var(--ks-green-dark);

      font-size:
        14px;
    }

    .emi-note {
      margin:
        16px 0 0;

      color:
        #7b847f;

      font-size:
        12px;

      line-height:
        1.6;
    }

    /* -----------------------------------------
       WEATHER
    ----------------------------------------- */

    .inline-form {
      display:
        grid;

      grid-template-columns:
        1fr auto auto;

      gap:
        10px;

      margin-bottom:
        17px;
    }

    .inline-form input {
      min-height:
        47px;

      padding:
        0 15px;
    }

    .inline-form button {
      padding:
        0 17px;
    }

    #geo-btn {
      background:
        #f0eee7 !important;

      color:
        var(--ks-green-dark) !important;

      box-shadow:
        none !important;
    }

    #geo-btn:hover {
      background:
        var(--ks-green-soft) !important;
    }

    .weather-card {
      display:
        grid;

      grid-template-columns:
        1fr auto;

      gap:
        20px;

      padding:
        27px;

      border-radius:
        var(--ks-radius);

      background:
        linear-gradient(
          145deg,
          #edf3ee,
          #f9f7f0
        );

      border:
        1px solid var(--ks-border);
    }

    .weather-main {
      display:
        flex;

      align-items:
        center;

      gap:
        18px;
    }

    .weather-icon {
      width:
        72px;

      height:
        72px;

      display:
        grid;

      place-items:
        center;

      border-radius:
        21px;

      background:
        rgba(255,255,255,.75);

      font-size:
        36px;

      box-shadow:
        var(--ks-shadow-sm);
    }

    .weather-temp {
      color:
        var(--ks-green-dark);

      font-family:
        Fraunces,
        Georgia,
        serif;

      font-size:
        42px;

      line-height:
        1;
    }

    /* -----------------------------------------
       MANDI
    ----------------------------------------- */

    #mandi-refresh {
      margin-bottom:
        17px;
    }

    .mandi-grid {
      display:
        grid;

      grid-template-columns:
        repeat(3, minmax(0, 1fr));

      gap:
        13px;
    }

    .mandi-card {
      padding:
        18px;

      border:
        1px solid var(--ks-border);

      border-radius:
        14px;

      background:
        #fff;

      box-shadow:
        var(--ks-shadow-sm);

      transition:
        var(--ks-transition);
    }

    .mandi-card:hover {
      transform:
        translateY(-3px);

      box-shadow:
        var(--ks-shadow);
    }

    .mandi-card h3 {
      margin:
        0 0 8px;

      color:
        var(--ks-green-dark);

      font-size:
        15px;
    }

    .mandi-price {
      color:
        var(--ks-green);

      font-family:
        Fraunces,
        Georgia,
        serif;

      font-size:
        25px;

      font-weight:
        600;
    }

    /* -----------------------------------------
       LOADING
    ----------------------------------------- */

    .ks-loading {
      display:
        flex;

      align-items:
        center;

      justify-content:
        center;

      gap:
        10px;

      padding:
        28px;

      color:
        var(--ks-muted);

      font-size:
        13px;
    }

    .ks-spinner {
      width:
        20px;

      height:
        20px;

      border:
        2px solid #dfe4df;

      border-top-color:
        var(--ks-green);

      border-radius:
        50%;

      animation:
        ksSpin .7s linear infinite;
    }

    @keyframes ksSpin {
      to {
        transform:
          rotate(360deg);
      }
    }

    /* -----------------------------------------
       ERROR
    ----------------------------------------- */

    .ks-error {
      padding:
        17px;

      border:
        1px solid #ecd5d1;

      border-left:
        4px solid var(--ks-danger);

      border-radius:
        12px;

      background:
        #fbf0ee;

      color:
        #7e4a44;

      font-size:
        13px;

      line-height:
        1.6;
    }

    /* -----------------------------------------
       FOOTER
    ----------------------------------------- */

    footer {
      padding:
        25px 5% 35px;

      border-top:
        1px solid var(--ks-border);

      background:
        #f0eee7;

      color:
        #78827c;

      text-align:
        center;

      font-size:
        12px;

      line-height:
        1.6;
    }

    footer p {
      max-width:
        800px;

      margin:
        0 auto;
    }

    /* -----------------------------------------
       MOBILE
    ----------------------------------------- */

    @media (max-width: 900px) {
      .tabs {
        overflow-x:
          auto;

        display:
          flex;

        justify-content:
          flex-start;
      }

      .tab-btn {
        flex:
          0 0 auto;

        min-width:
          150px;
      }

      .loan-layout {
        grid-template-columns:
          1fr;
      }

      .schemes-list {
        max-height:
          330px;
      }

      .emi-form {
        grid-template-columns:
          repeat(2, 1fr);
      }

      .emi-form > button {
        grid-column:
          1 / -1;
      }

      .mandi-grid {
        grid-template-columns:
          repeat(2, 1fr);
      }
    }

    @media (max-width: 650px) {
      .topbar {
        min-height:
          70px;

        padding:
          0 16px;
      }

      .brand-mark {
        width:
          41px;

        height:
          41px;

        font-size:
          21px;
      }

      .brand-name {
        font-size:
          21px;
      }

      .lang-btn {
        min-width:
          45px;

        padding:
          0 10px;
      }

      .terrace-line {
        height:
          6px;
      }

      .tabs {
        top:
          70px;

        min-height:
          57px;
      }

      .tab-btn {
        min-width:
          132px;

        padding:
          0 12px;

        font-size:
          13px;
      }

      main {
        width:
          94%;

        padding:
          25px 0 45px;
      }

      .section-lede {
        font-size:
          14px;

        line-height:
          1.65;
      }

      .chat-window {
        min-height:
          400px;

        padding:
          13px;
      }

      .msg {
        max-width:
          91%;

        font-size:
          14px;
      }

      .chat-input-row {
        grid-template-columns:
          auto 1fr auto;
      }

      .loan-toolbar {
        align-items:
          stretch;
      }

      .scheme-search {
        flex:
          1 1 100%;
      }

      .emi-form {
        grid-template-columns:
          1fr;

        padding:
          16px;
      }

      .emi-form > button {
        grid-column:
          auto;
      }

      .emi-breakdown {
        grid-template-columns:
          1fr;
      }

      .emi-headline {
        align-items:
          flex-start;

        flex-direction:
          column;
      }

      .inline-form {
        grid-template-columns:
          1fr;
      }

      .inline-form button {
        min-height:
          45px;
      }

      .weather-card {
        grid-template-columns:
          1fr;
      }

      .mandi-grid {
        grid-template-columns:
          1fr;
      }

      .scheme-detail {
        padding:
          18px;
      }
    }
  `;

  document.head.appendChild(style);
}

/* =========================================================
   HELPERS
========================================================= */

function $(selector, root = document) {
  return root.querySelector(selector);
}

function $$(selector, root = document) {
  return [...root.querySelectorAll(selector)];
}

function escapeHTML(value) {
  if (value === null || value === undefined) {
    return '';
  }

  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function formatNumber(value, decimals = 0) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return '—';
  }

  return number.toLocaleString(
    'en-IN',
    {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }
  );
}

function formatNPR(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return '—';
  }

  return `NPR ${formatNumber(number)}`;
}

function getField(obj, base) {
  if (!obj) return '';

  const enVal = obj[`${base}_en`];
  const npVal = obj[`${base}_np`];

  if (enVal !== undefined || npVal !== undefined) {
    return currentLang === 'np'
      ? (npVal || enVal || '')
      : (enVal || npVal || '');
  }

  return getLocalized(obj[base], '');
}

function getLocalized(value, fallback = '') {
  if (!value) {
    return fallback;
  }

  if (typeof value === 'string') {
    return value;
  }

  if (currentLang === 'np') {
    return value.np || value.ne || value.en || fallback;
  }

  return value.en || value.np || value.ne || fallback;
}

function normalizeText(value) {
  return String(value || '')
    .trim()
    .toLowerCase();
}

function debounce(fn, delay = 250) {
  let timeout;

  return (...args) => {
    clearTimeout(timeout);

    timeout = setTimeout(
      () => fn(...args),
      delay
    );
  };
}

function showLoading(container, text = 'Loading…') {
  if (!container) return;

  container.innerHTML = `
    <div class="ks-loading">
      <span class="ks-spinner"></span>
      <span>${escapeHTML(text)}</span>
    </div>
  `;
}

function showError(container, message) {
  if (!container) return;

  container.innerHTML = `
    <div class="ks-error">
      ${escapeHTML(message)}
    </div>
  `;
}

function showEmpty(
  container,
  icon = '🌱',
  title = 'Nothing to show yet',
  message = ''
) {
  if (!container) return;

  container.innerHTML = `
    <div class="ks-empty">
      <div class="ks-empty-icon">${icon}</div>
      <strong>${escapeHTML(title)}</strong>
      ${
        message
          ? `<div>${escapeHTML(message)}</div>`
          : ''
      }
    </div>
  `;
}

/* =========================================================
   LANGUAGE
========================================================= */

function applyLanguage(lang) {
  currentLang = lang === 'np'
    ? 'np'
    : 'en';

  document.documentElement.lang =
    currentLang === 'np'
      ? 'ne'
      : 'en';

  $$('[data-en][data-np]').forEach(
    element => {
      const value =
        currentLang === 'np'
          ? element.dataset.np
          : element.dataset.en;

      if (
        element.tagName === 'INPUT' ||
        element.tagName === 'TEXTAREA'
      ) {
        return;
      }

      element.innerHTML = value;
    }
  );

  $$('[data-en-placeholder][data-np-placeholder]')
    .forEach(element => {
      element.placeholder =
        currentLang === 'np'
          ? element.dataset.npPlaceholder
          : element.dataset.enPlaceholder;
    });

  $$('.lang-btn').forEach(button => {
    button.classList.toggle(
      'active',
      button.id ===
        `lang-${currentLang}`
    );
  });

  renderQuickChips();
  renderTagChips();
  renderSchemes();

  if (selectedSchemeId !== null) {
    renderSchemeDetail(selectedSchemeId);
  }

  renderCropHealth();

  if (
    typeof window.updateLocalizedUI ===
    'function'
  ) {
    window.updateLocalizedUI();
  }
}

/* =========================================================
   TAB NAVIGATION
========================================================= */

function initTabs() {
  $$('.tab-btn').forEach(button => {
    button.addEventListener(
      'click',
      () => {
        const tab =
          button.dataset.tab;

        if (!tab) return;

        $$('.tab-btn').forEach(btn => {
          btn.classList.toggle(
            'active',
            btn === button
          );
        });

        $$('.tab-panel').forEach(panel => {
          panel.classList.toggle(
            'active',
            panel.id === `tab-${tab}`
          );
        });

        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      }
    );
  });
}

/* =========================================================
   CHAT HEADER
========================================================= */

function createChatHeader() {
  const chatWindow =
    $('#chat-window');

  if (!chatWindow) return;

  if ($('#ks-chat-header')) {
    return;
  }

  const header =
    document.createElement('div');

  header.id =
    'ks-chat-header';

  header.className =
    'ks-chat-header';

  header.innerHTML = `
    <div class="ks-chat-identity">
      <div class="ks-ai-avatar">✦</div>

      <div class="ks-ai-title">
        <strong>
          ${
            currentLang === 'np'
              ? 'कृषक सारथी AI'
              : 'Krishak Sarathi AI'
          }
        </strong>

        <span class="ks-ai-status">
          <span class="ks-status-dot"></span>

          ${
            currentLang === 'np'
              ? 'सहायता गर्न तयार'
              : 'Ready to assist'
          }
        </span>
      </div>
    </div>
  `;

  chatWindow.parentNode.insertBefore(
    header,
    chatWindow
  );
}

/* =========================================================
   QUICK CHAT CHIPS
========================================================= */

function renderQuickChips() {
  const container =
    $('#chat-quick-chips');

  if (!container) return;

  const chips =
    currentLang === 'np'
      ? [
          'टमाटरमा रोग कसरी नियन्त्रण गर्ने?',
          'कृषि कर्जा कसरी लिने?',
          'कृषि अनुदान योजना के छन्?',
          'आजको तरकारी बजार भाउ',
          'मौसम अनुसार खेती सुझाव',
          'माटो परीक्षण किन आवश्यक छ?'
        ]
      : [
          'How do I control disease in tomato?',
          'How can I get an agriculture loan?',
          'What agriculture subsidies are available?',
          "Today's vegetable market prices",
          'Farming advice based on weather',
          'Why is soil testing important?'
        ];

  container.innerHTML =
    chips.map(
      chip => `
        <button
          type="button"
          class="quick-chip"
          data-question="${escapeHTML(chip)}"
        >
          ${escapeHTML(chip)}
        </button>
      `
    ).join('');

  $$('.quick-chip', container).forEach(
    button => {
      button.addEventListener(
        'click',
        () => {
          const input =
            $('#chat-input');

          if (!input) return;

          input.value =
            button.dataset.question || '';

          input.focus();

          const form =
            $('#chat-form');

          if (form) {
            form.requestSubmit();
          }
        }
      );
    }
  );
}

/* =========================================================
   CHAT MESSAGE RENDERING
========================================================= */

function appendMessage(
  role,
  text,
  options = {}
) {
  const windowEl =
    $('#chat-window');

  if (!windowEl) return;

  const message =
    document.createElement('div');

  message.className =
    `msg ${role}`;

  if (options.html) {
    message.innerHTML = text;
  } else {
    message.textContent = text;
  }

  windowEl.appendChild(message);

  windowEl.scrollTo({
    top: windowEl.scrollHeight,
    behavior: 'smooth'
  });

  return message;
}

function addTypingIndicator() {
  const windowEl =
    $('#chat-window');

  if (!windowEl) return null;

  const element =
    document.createElement('div');

  element.className =
    'msg bot ks-typing';

  element.innerHTML = `
    <div style="
      display:flex;
      align-items:center;
      gap:5px;
    ">
      <span style="
        width:6px;
        height:6px;
        border-radius:50%;
        background:#718078;
        animation:ksTyping 1s infinite;
      "></span>

      <span style="
        width:6px;
        height:6px;
        border-radius:50%;
        background:#718078;
        animation:ksTyping 1s .15s infinite;
      "></span>

      <span style="
        width:6px;
        height:6px;
        border-radius:50%;
        background:#718078;
        animation:ksTyping 1s .3s infinite;
      "></span>
    </div>
  `;

  windowEl.appendChild(element);

  windowEl.scrollTo({
    top: windowEl.scrollHeight,
    behavior: 'smooth'
  });

  return element;
}

function formatChatResponse(text) {
  if (!text) return '';

  let safe =
    escapeHTML(text);

  safe = safe.replace(
    /\*\*(.*?)\*\*/g,
    '<strong>$1</strong>'
  );

  safe = safe.replace(
    /\*(.*?)\*/g,
    '<em>$1</em>'
  );

  safe = safe.replace(
    /\n/g,
    '<br>'
  );

  return safe;
}

/* =========================================================
   CHAT API
========================================================= */

async function sendChatMessage(question) {
  const trimmed =
    String(question || '').trim();

  if (!trimmed) return;

  appendMessage(
    'user',
    trimmed
  );

  chatHistory.push({
    role: 'user',
    content: trimmed
  });

  const typing =
    addTypingIndicator();

  try {
    const response =
      await fetch(
        `${API_BASE}/api/chat`,
        {
          method: 'POST',

          headers: {
            'Content-Type':
              'application/json'
          },

          body: JSON.stringify({
            message: trimmed,

            question: trimmed,

            language:
              currentLang,

            history:
              chatHistory
          })
        }
      );

    if (!response.ok) {
      throw new Error(
        `Request failed (${response.status})`
      );
    }

    const data =
      await response.json();

    if (typing) {
      typing.remove();
    }

    const answer =
      data.answer ||
      data.response ||
      data.message ||
      data.reply ||
      (
        currentLang === 'np'
          ? 'माफ गर्नुहोस्, अहिले उत्तर उपलब्ध भएन।'
          : 'Sorry, I could not generate an answer right now.'
      );

    appendMessage(
      'bot',
      formatChatResponse(answer),
      { html: true }
    );

    chatHistory.push({
      role: 'assistant',
      content: answer
    });

  } catch (error) {
    if (typing) {
      typing.remove();
    }

    console.error(
      'Chat error:',
      error
    );

    appendMessage(
      'bot',
      currentLang === 'np'
        ? 'माफ गर्नुहोस्। अहिले सेवा उपलब्ध हुन सकेन। कृपया केही समयपछि पुनः प्रयास गर्नुहोस्।'
        : 'Sorry, the advisor is temporarily unavailable. Please try again in a moment.'
    );
  }
}

/* =========================================================
   CHAT FORM
========================================================= */

function initChat() {
  const form =
    $('#chat-form');

  const input =
    $('#chat-input');

  if (!form || !input) {
    return;
  }

  form.addEventListener(
    'submit',
    event => {
      event.preventDefault();

      const question =
        input.value.trim();

      if (!question) {
        input.focus();
        return;
      }

      input.value = '';

      sendChatMessage(
        question
      );
    }
  );
}

/* =========================================================
   VOICE INPUT
========================================================= */

function initVoiceInput() {
  const button =
    $('#mic-btn');

  const input =
    $('#chat-input');

  if (!button || !input) {
    return;
  }

  const SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    button.title =
      currentLang === 'np'
        ? 'तपाईंको ब्राउजरले voice input समर्थन गर्दैन'
        : 'Voice input is not supported by this browser';

    button.addEventListener(
      'click',
      () => {
        alert(
          currentLang === 'np'
            ? 'तपाईंको ब्राउजरले voice input समर्थन गर्दैन।'
            : 'Voice input is not supported by your browser.'
        );
      }
    );

    return;
  }

  const recognition =
    new SpeechRecognition();

  recognition.continuous =
    false;

  recognition.interimResults =
    true;

  recognition.lang =
    currentLang === 'np'
      ? 'ne-NP'
      : 'en-US';

  recognition.onstart =
    () => {
      button.classList.add(
        'listening'
      );

      button.setAttribute(
        'aria-label',
        currentLang === 'np'
          ? 'सुन्दैछ'
          : 'Listening'
      );
    };

  recognition.onend =
    () => {
      button.classList.remove(
        'listening'
      );
    };

  recognition.onerror =
    error => {
      console.warn(
        'Speech recognition error:',
        error
      );

      button.classList.remove(
        'listening'
      );
    };

  recognition.onresult =
    event => {
      let transcript = '';

      for (
        let i = event.resultIndex;
        i < event.results.length;
        i++
      ) {
        transcript +=
          event.results[i][0].transcript;
      }

      input.value =
        transcript.trim();
    };

  button.addEventListener(
    'click',
    () => {
      recognition.lang =
        currentLang === 'np'
          ? 'ne-NP'
          : 'en-US';

      try {
        recognition.start();
      } catch (error) {
        console.warn(
          'Recognition could not start:',
          error
        );
      }
    }
  );
}

/* =========================================================
   SCHEME BOOKMARKS
========================================================= */

function getBookmarks() {
  try {
    const saved =
      localStorage.getItem(
        BOOKMARK_KEY
      );

    return saved
      ? JSON.parse(saved)
      : [];
  } catch {
    return [];
  }
}

function setBookmarks(bookmarks) {
  try {
    localStorage.setItem(
      BOOKMARK_KEY,
      JSON.stringify(bookmarks)
    );
  } catch {
    /* localStorage may be unavailable */
  }
}

function isBookmarked(id) {
  return getBookmarks()
    .includes(String(id));
}

function toggleBookmark(id) {
  const key =
    String(id);

  const bookmarks =
    getBookmarks();

  const index =
    bookmarks.indexOf(key);

  if (index >= 0) {
    bookmarks.splice(
      index,
      1
    );
  } else {
    bookmarks.push(key);
  }

  setBookmarks(
    bookmarks
  );

  renderSchemes();

  if (selectedSchemeId !== null) {
    renderSchemeDetail(
      selectedSchemeId
    );
  }
}

/* =========================================================
   SCHEME FETCH
========================================================= */

async function fetchSchemes() {
  const list =
    $('#schemes-list');

  if (list) {
    showLoading(
      list,
      currentLang === 'np'
        ? 'योजनाहरू लोड हुँदैछन्…'
        : 'Loading schemes…'
    );
  }

  try {
    const response =
      await fetch(
        `${API_BASE}/api/schemes`
      );

    if (!response.ok) {
      throw new Error(
        `Schemes request failed (${response.status})`
      );
    }

    const data =
      await response.json();

    if (Array.isArray(data)) {
      allSchemes = data;
    } else if (
      Array.isArray(data.schemes)
    ) {
      allSchemes =
        data.schemes;
    } else {
      allSchemes = [];
    }

    renderTagChips();
    renderSchemes();

  } catch (error) {
    console.error(
      'Scheme fetch error:',
      error
    );

    if (list) {
      showError(
        list,
        currentLang === 'np'
          ? 'योजनाहरू लोड गर्न सकिएन।'
          : 'Unable to load schemes.'
      );
    }
  }
}

/* =========================================================
   SCHEME TAGS
========================================================= */

function getSchemeTags() {
  const tags =
    new Set();

  allSchemes.forEach(
    scheme => {
      const schemeTags =
        scheme.tags ||
        scheme.categories ||
        scheme.category ||
        [];

      if (Array.isArray(schemeTags)) {
        schemeTags.forEach(
          tag => {
            if (tag) {
              tags.add(
                String(tag)
              );
            }
          }
        );
      } else if (
        schemeTags
      ) {
        tags.add(
          String(schemeTags)
        );
      }
    }
  );

  return [
    ...tags
  ];
}

function renderTagChips() {
  const container =
    $('#tag-chips');

  if (!container) return;

  const tags =
    getSchemeTags();

  if (!tags.length) {
    container.innerHTML =
      '';

    return;
  }

  const allLabel =
    currentLang === 'np'
      ? 'सबै'
      : 'All';

  container.innerHTML = `
    <button
      type="button"
      class="tag-chip ${
        activeTag === null
          ? 'active'
          : ''
      }"
      data-tag=""
    >
      ${allLabel}
    </button>

    ${tags.map(
      tag => `
        <button
          type="button"
          class="tag-chip ${
            normalizeText(activeTag) ===
            normalizeText(tag)
              ? 'active'
              : ''
          }"
          data-tag="${escapeHTML(tag)}"
        >
          ${escapeHTML(tag)}
        </button>
      `
    ).join('')}
  `;

  $$('.tag-chip', container)
    .forEach(button => {
      button.addEventListener(
        'click',
        () => {
          const tag =
            button.dataset.tag;

          activeTag =
            tag || null;

          renderTagChips();
          renderSchemes();
        }
      );
    });
}

/* =========================================================
   SCHEME SEARCH
========================================================= */

function getFilteredSchemes() {
  const search =
    normalizeText(
      $('#scheme-search')?.value
    );

  return allSchemes.filter(
    scheme => {
      const searchable =
        [
          getField(scheme, 'category'),
          getField(scheme, 'summary'),
          ...(Array.isArray(scheme.tags)
            ? scheme.tags
            : [])
        ]
          .filter(Boolean)
          .join(' ');

      const matchesSearch =
        !search ||
        normalizeText(
          searchable
        ).includes(search);

      let matchesTag =
        true;

      if (activeTag) {
        const tags =
          Array.isArray(
            scheme.tags
          )
            ? scheme.tags
            : [
                scheme.category
              ];

        matchesTag =
          tags.some(
            tag =>
              normalizeText(tag) ===
              normalizeText(activeTag)
          );
      }

      return (
        matchesSearch &&
        matchesTag
      );
    }
  );
}

/* =========================================================
   SCHEME LIST
========================================================= */

function renderSchemes() {
  const container =
    $('#schemes-list');

  if (!container) return;

  const schemes =
    getFilteredSchemes();

  if (!schemes.length) {
    showEmpty(
      container,
      '🔎',
      currentLang === 'np'
        ? 'योजना भेटिएन'
        : 'No schemes found',
      currentLang === 'np'
        ? 'खोज शब्द वा फिल्टर परिवर्तन गरेर पुनः प्रयास गर्नुहोस्।'
        : 'Try changing your search or filter.'
    );

    return;
  }

  container.innerHTML =
    schemes.map(
      scheme => {
        const id =
          scheme.id ??
          scheme._id ??
          scheme.slug ??
          '';

        const title =
          getField(scheme, 'category') ||
          (currentLang === 'np'
            ? 'नाम उपलब्ध छैन'
            : 'Untitled scheme');

        const tags =
          Array.isArray(
            scheme.tags
          )
            ? scheme.tags
            : scheme.category
              ? [scheme.category]
              : [];

        return `
          <button
            type="button"
            class="scheme-card ${
              String(
                selectedSchemeId
              ) === String(id)
                ? 'active'
                : ''
            }"
            data-scheme-id="${escapeHTML(id)}"
          >
            <div class="scheme-card-title">
              ${escapeHTML(title)}
            </div>

            ${
              tags.length
                ? `
                  <div class="scheme-card-meta">
                    ${tags
                      .slice(0, 3)
                      .map(
                        tag => `
                          <span class="scheme-card-tag">
                            ${escapeHTML(tag)}
                          </span>
                        `
                      )
                      .join('')}
                  </div>
                `
                : ''
            }
          </button>
        `;
      }
    ).join('');

  $$('.scheme-card', container)
    .forEach(button => {
      button.addEventListener(
        'click',
        () => {
          const id =
            button.dataset.schemeId;

          selectedSchemeId =
            id;

          renderSchemes();
          fetchAndRenderSchemeDetail(
            id
          );
        }
      );
    });
}

/* =========================================================
   SCHEME DETAIL
========================================================= */

async function fetchAndRenderSchemeDetail(
  id
) {
  const detail =
    $('#scheme-detail');

  if (!detail) return;

  showLoading(
    detail,
    currentLang === 'np'
      ? 'योजनाको विवरण लोड हुँदैछ…'
      : 'Loading scheme details…'
  );

  try {
    const response =
      await fetch(
        `${API_BASE}/api/schemes/${encodeURIComponent(id)}`
      );

    if (!response.ok) {
      throw new Error(
        `Scheme detail request failed (${response.status})`
      );
    }

    const data =
      await response.json();

    const scheme =
      data.scheme ||
      data;

    renderSchemeObject(
      scheme
    );

  } catch (error) {
    console.error(
      'Scheme detail error:',
      error
    );

    const local =
      allSchemes.find(
        scheme =>
          String(
            scheme.id ??
            scheme._id ??
            scheme.slug
          ) === String(id)
      );

    if (local) {
      renderSchemeObject(
        local
      );
    } else {
      showError(
        detail,
        currentLang === 'np'
          ? 'योजनाको विवरण लोड गर्न सकिएन।'
          : 'Unable to load scheme details.'
      );
    }
  }
}

function renderSchemeDetail(id) {
  const scheme =
    allSchemes.find(
      item =>
        String(
          item.id ??
          item._id ??
          item.slug
        ) === String(id)
    );

  if (scheme) {
    renderSchemeObject(
      scheme
    );
  }
}

function renderSchemeObject(
  scheme
) {
  const detail =
    $('#scheme-detail');

  if (!detail || !scheme) return;

  const id =
    scheme.id ??
    scheme._id ??
    scheme.slug ??
    '';

  const title =
    getField(scheme, 'category') ||
    (currentLang === 'np'
      ? 'कृषि योजना'
      : 'Agriculture Scheme');

  const description =
    getField(scheme, 'summary');

  const provider =
    getField(scheme, 'provider') ||
    getField(scheme, 'implementing_agency') ||
    getField(scheme, 'office');

  const bookmarked =
    isBookmarked(id);

  const documents =
    scheme.documents ||
    scheme.required_documents ||
    scheme.requiredDocuments ||
    [];

  const steps =
    scheme.steps ||
    scheme.process ||
    scheme.application_steps ||
    [];

  const verification =
    getLocalized(
      scheme.verify_at ||
      scheme.verification ||
      scheme.confirmation ||
      scheme.where_to_confirm,
      currentLang === 'np'
        ? 'सम्बन्धित कार्यालयसँग हालको विवरण पुष्टि गर्नुहोस्।'
        : 'Confirm current details with the relevant office.'
    );

  detail.innerHTML = `
    <div style="
      display:flex;
      justify-content:space-between;
      gap:15px;
      align-items:flex-start;
    ">
      <div>
        <h2>
          ${escapeHTML(title)}
        </h2>

        ${
          provider
            ? `
              <div style="
                color:#78837d;
                font-size:12px;
                margin-bottom:12px;
              ">
                ${escapeHTML(provider)}
              </div>
            `
            : ''
        }
      </div>

      <button
        type="button"
        id="scheme-bookmark"
        aria-label="${
          bookmarked
            ? 'Remove bookmark'
            : 'Bookmark scheme'
        }"
        style="
          width:40px;
          height:40px;
          border:1px solid var(--ks-border);
          border-radius:11px;
          background:${
            bookmarked
              ? 'var(--ks-gold-soft)'
              : '#fff'
          };
          color:${
            bookmarked
              ? 'var(--ks-gold-dark)'
              : 'var(--ks-muted)'
          };
          font-size:18px;
        "
      >
        ${bookmarked ? '★' : '☆'}
      </button>
    </div>

    ${
      description
        ? `
          <p>
            ${escapeHTML(description)}
          </p>
        `
        : ''
    }

    <div class="ks-info-box">
      <strong>
        ${
          currentLang === 'np'
            ? 'महत्त्वपूर्ण सूचना'
            : 'Important'
        }
      </strong>

      <p>
        ${escapeHTML(verification)}
      </p>
    </div>

    ${
      documents.length
        ? `
          <h3>
            ${
              currentLang === 'np'
                ? 'आवश्यक कागजात'
                : 'Required documents'
            }
          </h3>

          <div class="ks-steps">
            ${documents
              .map(
                (document, index) => `
                  <div class="ks-step">
                    <div class="ks-step-number">
                      ${index + 1}
                    </div>

                    <div class="ks-step-content">
                      ${escapeHTML(
                        getLocalized(
                          document,
                          String(document)
                        )
                      )}
                    </div>
                  </div>
                `
              )
              .join('')}
          </div>
        `
        : ''
    }

    ${
      steps.length
        ? `
          <h3>
            ${
              currentLang === 'np'
                ? 'आवेदन प्रक्रिया'
                : 'Application process'
            }
          </h3>

          <div class="ks-steps">
            ${steps
              .map(
                (step, index) => `
                  <div class="ks-step">
                    <div class="ks-step-number">
                      ${index + 1}
                    </div>

                    <div class="ks-step-content">
                      ${escapeHTML(
                        getLocalized(
                          step,
                          String(step)
                        )
                      )}
                    </div>
                  </div>
                `
              )
              .join('')}
          </div>
        `
        : ''
    }

    ${renderSchemeAdditionalInfo(scheme)}
  `;

  const bookmark =
    $('#scheme-bookmark');

  if (bookmark) {
    bookmark.addEventListener(
      'click',
      () => {
        toggleBookmark(id);
      }
    );
  }
}

function renderSchemeAdditionalInfo(
  scheme
) {
  const fields = [
    [
      'eligibility',
      currentLang === 'np'
        ? 'योग्यता'
        : 'Eligibility'
    ],

    [
      'interest_rate',
      currentLang === 'np'
        ? 'ब्याजदर'
        : 'Interest rate'
    ],

    [
      'subsidy_rate',
      currentLang === 'np'
        ? 'अनुदान'
        : 'Subsidy'
    ],

    [
      'loan_limit',
      currentLang === 'np'
        ? 'कर्जा सीमा'
        : 'Loan limit'
    ],

    [
      'deadline',
      currentLang === 'np'
        ? 'म्याद'
        : 'Deadline'
    ],

    [
      'contact',
      currentLang === 'np'
        ? 'सम्पर्क'
        : 'Contact'
    ]
  ];

  const available =
    fields.filter(
      ([key]) =>
        scheme[key] !== undefined &&
        scheme[key] !== null &&
        scheme[key] !== ''
    );

  if (!available.length) {
    return '';
  }

  return `
    <h3>
      ${
        currentLang === 'np'
          ? 'मुख्य विवरण'
          : 'Key details'
      }
    </h3>

    <div class="ks-table-wrap">
      <table class="ks-table">
        <tbody>
          ${available
            .map(
              ([key, label]) => `
                <tr>
                  <th>
                    ${escapeHTML(label)}
                  </th>

                  <td>
                    ${escapeHTML(
                      getLocalized(
                        scheme[key],
                        String(
                          scheme[key]
                        )
                      )
                    )}
                  </td>
                </tr>
              `
            )
            .join('')}
        </tbody>
      </table>
    </div>
  `;
}

/* =========================================================
   SCHEME SEARCH EVENTS
========================================================= */

function initSchemeSearch() {
  const search =
    $('#scheme-search');

  if (!search) return;

  search.addEventListener(
    'input',
    debounce(
      () => {
        renderSchemes();
      },
      180
    )
  );
}

/* =========================================================
   LOAN CALCULATOR
========================================================= */

function initEMICalculator() {
  const form =
    $('#emi-form');

  if (!form) return;

  form.addEventListener(
    'submit',
    event => {
      event.preventDefault();

      const principal =
        Number(
          $('#emi-principal')?.value
        );

      const annualRate =
        Number(
          $('#emi-rate')?.value
        );

      const months =
        Number(
          $('#emi-months')?.value
        );

      if (
        !Number.isFinite(principal) ||
        principal <= 0 ||
        !Number.isFinite(annualRate) ||
        annualRate < 0 ||
        !Number.isFinite(months) ||
        months <= 0
      ) {
        return;
      }

      const monthlyRate =
        annualRate / 100 / 12;

      let monthlyPayment;

      if (
        monthlyRate === 0
      ) {
        monthlyPayment =
          principal / months;
      } else {
        monthlyPayment =
          principal *
          monthlyRate *
          Math.pow(
            1 + monthlyRate,
            months
          ) /
          (
            Math.pow(
              1 + monthlyRate,
              months
            ) - 1
          );
      }

      const total =
        monthlyPayment *
        months;

      const interest =
        total -
        principal;

      const result =
        $('#emi-result');

      if (result) {
        result.hidden =
          false;
      }

      const monthly =
        $('#emi-monthly');

      const totalEl =
        $('#emi-total');

      const interestEl =
        $('#emi-interest');

      if (monthly) {
        monthly.textContent =
          formatNPR(
            monthlyPayment
          );
      }

      if (totalEl) {
        totalEl.textContent =
          formatNPR(
            total
          );
      }

      if (interestEl) {
        interestEl.textContent =
          formatNPR(
            interest
          );
      }
    }
  );
}

/* =========================================================
   WEATHER
========================================================= */

async function fetchWeather(
  place
) {
  const result =
    $('#weather-result');

  if (!result) return;

  showLoading(
    result,
    currentLang === 'np'
      ? 'मौसम विवरण लोड हुँदैछ…'
      : 'Loading weather…'
  );

  try {
    const response =
      await fetch(
        `${API_BASE}/api/weather?place=${encodeURIComponent(place)}`
      );

    if (!response.ok) {
      throw new Error(
        `Weather request failed (${response.status})`
      );
    }

    const data =
      await response.json();

    renderWeather(
      data
    );

  } catch (error) {
    console.error(
      'Weather error:',
      error
    );

    showError(
      result,
      currentLang === 'np'
        ? 'मौसम विवरण प्राप्त गर्न सकिएन।'
        : 'Unable to retrieve weather information.'
    );
  }
}

function renderWeather(
  data
) {
  const result =
    $('#weather-result');

  if (!result) return;

  const location =
    data.location ||
    data.place ||
    data.name ||
    '—';

  const temperature =
    data.temperature ??
    data.temp ??
    data.current?.temperature;

  const condition =
    data.condition ||
    data.description ||
    data.weather ||
    data.current?.condition ||
    '—';

  const humidity =
    data.humidity ??
    data.current?.humidity;

  const rainfall =
    data.rainfall ??
    data.precipitation ??
    data.current?.rainfall;

  const wind =
    data.wind_speed ??
    data.windSpeed ??
    data.current?.wind_speed;

  const icon =
    data.icon ||
    '🌤️';

  result.innerHTML = `
    <div class="weather-card">

      <div>
        <div style="
          color:var(--ks-muted);
          font-size:12px;
          margin-bottom:7px;
        ">
          ${
            currentLang === 'np'
              ? 'स्थान'
              : 'Location'
          }
        </div>

        <h2 style="
          margin:0 0 18px;
          color:var(--ks-green-dark);
          font-family:Fraunces,Georgia,serif;
        ">
          ${escapeHTML(location)}
        </h2>

        <div class="weather-main">
          <div class="weather-icon">
            ${escapeHTML(icon)}
          </div>

          <div>
            <div class="weather-temp">
              ${
                temperature !== undefined
                  ? `${formatNumber(temperature, 1)}°`
                  : '—'
              }
            </div>

            <div style="
              margin-top:6px;
              color:var(--ks-muted);
              font-size:13px;
            ">
              ${escapeHTML(condition)}
            </div>
          </div>
        </div>
      </div>

      <div style="
        min-width:180px;
        display:grid;
        gap:9px;
      ">

        ${weatherStat(
          currentLang === 'np'
            ? 'आर्द्रता'
            : 'Humidity',
          humidity !== undefined
            ? `${formatNumber(humidity)}%`
            : '—'
        )}

        ${weatherStat(
          currentLang === 'np'
            ? 'वर्षा'
            : 'Rainfall',
          rainfall !== undefined
            ? `${formatNumber(rainfall, 1)} mm`
            : '—'
        )}

        ${weatherStat(
          currentLang === 'np'
            ? 'हावा'
            : 'Wind',
          wind !== undefined
            ? `${formatNumber(wind, 1)}`
            : '—'
        )}

      </div>

    </div>
  `;
}

function weatherStat(
  label,
  value
) {
  return `
    <div style="
      display:flex;
      justify-content:space-between;
      gap:15px;
      padding:10px 12px;
      border:1px solid var(--ks-border);
      border-radius:10px;
      background:rgba(255,255,255,.65);
    ">
      <span style="
        color:var(--ks-muted);
        font-size:12px;
      ">
        ${escapeHTML(label)}
      </span>

      <strong style="
        color:var(--ks-green-dark);
        font-size:12px;
      ">
        ${escapeHTML(value)}
      </strong>
    </div>
  `;
}

function initWeather() {
  const form =
    $('#weather-form');

  const input =
    $('#weather-place');

  if (!form || !input) {
    return;
  }

  form.addEventListener(
    'submit',
    event => {
      event.preventDefault();

      const place =
        input.value.trim();

      if (!place) {
        input.focus();
        return;
      }

      fetchWeather(
        place
      );
    }
  );

  const geo =
    $('#geo-btn');

  if (geo) {
    geo.addEventListener(
      'click',
      () => {
        if (
          !navigator.geolocation
        ) {
          alert(
            currentLang === 'np'
              ? 'तपाईंको ब्राउजरले location समर्थन गर्दैन।'
              : 'Geolocation is not supported by your browser.'
          );

          return;
        }

        geo.disabled =
          true;

        navigator.geolocation.getCurrentPosition(
          async position => {
            const {
              latitude,
              longitude
            } = position.coords;

            try {
              const response =
                await fetch(
                  `${API_BASE}/api/weather?lat=${latitude}&lon=${longitude}`
                );

              if (!response.ok) {
                throw new Error(
                  'Weather request failed'
                );
              }

              const data =
                await response.json();

              renderWeather(
                data
              );

            } catch (error) {
              console.error(
                error
              );

              showError(
                $('#weather-result'),
                currentLang === 'np'
                  ? 'तपाईंको स्थानको मौसम प्राप्त गर्न सकिएन।'
                  : 'Unable to retrieve weather for your location.'
              );

            } finally {
              geo.disabled =
                false;
            }
          },

          error => {
            console.warn(
              'Geolocation error:',
              error
            );

            geo.disabled =
              false;

            alert(
              currentLang === 'np'
                ? 'स्थान प्राप्त गर्न सकिएन।'
                : 'Unable to access your location.'
            );
          }
        );
      }
    );
  }
}

/* =========================================================
   MANDI PRICES
========================================================= */

async function fetchMandi() {
  const result =
    $('#mandi-result');

  if (!result) return;

  showLoading(
    result,
    currentLang === 'np'
      ? 'आजको बजार भाउ लोड हुँदैछ…'
      : "Loading today's market prices…"
  );

  try {
    const response =
      await fetch(
        `${API_BASE}/api/mandi`
      );

    if (!response.ok) {
      throw new Error(
        `Mandi request failed (${response.status})`
      );
    }

    const data =
      await response.json();

    renderMandi(
      data
    );

  } catch (error) {
    console.error(
      'Mandi error:',
      error
    );

    showError(
      result,
      currentLang === 'np'
        ? 'बजार भाउ प्राप्त गर्न सकिएन।'
        : 'Unable to retrieve market prices.'
    );
  }
}

function renderMandi(
  data
) {
  const result =
    $('#mandi-result');

  if (!result) return;

  let items =
    Array.isArray(data)
      ? data
      : (
          data.prices ||
          data.items ||
          data.data ||
          []
        );

  if (!Array.isArray(items)) {
    items = [];
  }

  if (!items.length) {
    showEmpty(
      result,
      '🧺',
      currentLang === 'np'
        ? 'बजार भाउ उपलब्ध छैन'
        : 'No market prices available',
      currentLang === 'np'
        ? 'आजको मूल्य विवरण पछि पुनः जाँच गर्नुहोस्।'
        : 'Please check again later for updated prices.'
    );

    return;
  }

  result.innerHTML = `
    <div class="mandi-grid">
      ${items.map(
        item => {
          const crop =
            item.crop ||
            item.name ||
            item.commodity ||
            '—';

          const min =
            item.min ??
            item.price ??
            item.modal_price ??
            item.value;

          const max = item.max;

          const price =
            (min !== undefined && max !== undefined && min !== '—' && max !== '—')
              ? `NPR ${min} – ${max}`
              : (min !== undefined && min !== '—' ? `NPR ${min}` : '—');

          const unit =
            item.unit ||
            item.per ||
            'kg';

          const market =
            item.market ||
            item.location ||
            '';

          return `
            <div class="mandi-card">

              <h3>
                ${escapeHTML(crop)}
              </h3>

              <div class="mandi-price">
                ${escapeHTML(price)}
              </div>

              <div style="
                margin-top:5px;
                color:var(--ks-muted);
                font-size:11px;
              ">
                ${escapeHTML(unit)}
              </div>

              ${
                market
                  ? `
                    <div style="
                      margin-top:12px;
                      padding-top:10px;
                      border-top:1px solid var(--ks-border);
                      color:#7b857f;
                      font-size:11px;
                    ">
                      ${escapeHTML(market)}
                    </div>
                  `
                  : ''
              }

            </div>
          `;
        }
      ).join('')}
    </div>
  `;
}

function initMandi() {
  const button =
    $('#mandi-refresh');

  if (!button) return;

  button.addEventListener(
    'click',
    fetchMandi
  );
}

/* =========================================================
   CROP HEALTH
========================================================= */

async function fetchCropHealth() {
  const list =
    $('#crop-health-list');

  if (!list) return;

  showLoading(
    list,
    currentLang === 'np'
      ? 'बाली स्वास्थ्य जानकारी लोड हुँदैछ…'
      : 'Loading crop health information…'
  );

  try {
    const response =
      await fetch(
        `${API_BASE}/api/crop-health`
      );

    if (!response.ok) {
      throw new Error(
        `Crop health request failed (${response.status})`
      );
    }

    const data =
      await response.json();

    allCropHealth =
      Array.isArray(data)
        ? data
        : (
            data.crops ||
            data.items ||
            data.data ||
            []
          );

    renderCropHealth();

  } catch (error) {
    console.error(
      'Crop health error:',
      error
    );

    showError(
      list,
      currentLang === 'np'
        ? 'बाली स्वास्थ्य जानकारी लोड गर्न सकिएन।'
        : 'Unable to load crop health information.'
    );
  }
}

function renderCropHealth() {
  const list =
    $('#crop-health-list');

  if (!list) return;

  let items =
    [...allCropHealth];

  if (activeCropType) {
    items =
      items.filter(
        item =>
          normalizeText(
            item.crop ||
            item.crop_type ||
            item.type
          ) ===
          normalizeText(
            activeCropType
          )
      );
  }

  if (!items.length) {
    showEmpty(
      list,
      '🌿',
      currentLang === 'np'
        ? 'जानकारी भेटिएन'
        : 'No crop health information found'
    );

    return;
  }

  list.innerHTML =
    items.map(
      item => {
        const id =
          item.id ??
          item._id ??
          item.slug ??
          '';

        const crop =
          getLocalized(
            item.crop ||
            item.crop_name ||
            item.name,
            currentLang === 'np'
              ? 'बाली'
              : 'Crop'
          );

        const issue =
          getLocalized(
            item.issue ||
            item.problem ||
            item.disease ||
            item.pest,
            ''
          );

        return `
          <button
            type="button"
            class="scheme-card ${
              String(
                selectedCropHealthId
              ) === String(id)
                ? 'active'
                : ''
            }"
            data-crop-health-id="${escapeHTML(id)}"
          >
            <div class="scheme-card-title">
              ${escapeHTML(crop)}
            </div>

            ${
              issue
                ? `
                  <div style="
                    margin-top:5px;
                    color:var(--ks-muted);
                    font-size:12px;
                  ">
                    ${escapeHTML(issue)}
                  </div>
                `
                : ''
            }
          </button>
        `;
      }
    ).join('');

  $$('.scheme-card', list)
    .forEach(button => {
      button.addEventListener(
        'click',
        () => {
          selectedCropHealthId =
            button.dataset.cropHealthId;

          renderCropHealth();

          fetchCropHealthDetail(
            selectedCropHealthId
          );
        }
      );
    });
}

async function fetchCropHealthDetail(
  id
) {
  const detail =
    $('#crop-health-detail');

  if (!detail) return;

  showLoading(
    detail,
    currentLang === 'np'
      ? 'विवरण लोड हुँदैछ…'
      : 'Loading details…'
  );

  try {
    const response =
      await fetch(
        `${API_BASE}/api/crop-health/${encodeURIComponent(id)}`
      );

    if (!response.ok) {
      throw new Error(
        'Crop health detail request failed'
      );
    }

    const data =
      await response.json();

    renderCropHealthDetail(
      data.item ||
      data
    );

  } catch (error) {
    console.error(
      error
    );

    const local =
      allCropHealth.find(
        item =>
          String(
            item.id ??
            item._id ??
            item.slug
          ) === String(id)
      );

    if (local) {
      renderCropHealthDetail(
        local
      );
    } else {
      showError(
        detail,
        currentLang === 'np'
          ? 'विवरण लोड गर्न सकिएन।'
          : 'Unable to load details.'
      );
    }
  }
}

function renderCropHealthDetail(
  item
) {
  const detail =
    $('#crop-health-detail');

  if (!detail || !item) return;

  const crop =
    getLocalized(
      item.crop ||
      item.crop_name ||
      item.name,
      currentLang === 'np'
        ? 'बाली'
        : 'Crop'
    );

  const issue =
    getLocalized(
      item.issue ||
      item.problem ||
      item.disease ||
      item.pest,
      ''
    );

  const symptoms =
    getLocalized(
      item.symptoms ||
      item.signs,
      ''
    );

  const cause =
    getLocalized(
      item.cause ||
      item.causes,
      ''
    );

  const management =
    getLocalized(
      item.management ||
      item.control ||
      item.solution ||
      item.treatment,
      ''
    );

  detail.innerHTML = `
    <h2>
      ${escapeHTML(crop)}
    </h2>

    ${
      issue
        ? `
          <div class="ks-info-box">
            <strong>
              ${
                currentLang === 'np'
                  ? 'समस्या'
                  : 'Issue'
              }
            </strong>

            <p>
              ${escapeHTML(issue)}
            </p>
          </div>
        `
        : ''
    }

    ${
      symptoms
        ? `
          <h3>
            ${
              currentLang === 'np'
                ? 'लक्षण'
                : 'Symptoms'
            }
          </h3>

          <p>
            ${escapeHTML(symptoms)}
          </p>
        `
        : ''
    }

    ${
      cause
        ? `
          <h3>
            ${
              currentLang === 'np'
                ? 'कारण'
                : 'Cause'
            }
          </h3>

          <p>
            ${escapeHTML(cause)}
          </p>
        `
        : ''
    }

    ${
      management
        ? `
          <h3>
            ${
              currentLang === 'np'
                ? 'व्यवस्थापन तथा नियन्त्रण'
                : 'Management & control'
            }
          </h3>

          <div class="ks-info-box">
            <p>
              ${escapeHTML(management)}
            </p>
          </div>
        `
        : ''
    }
  `;
}

/* =========================================================
   LANGUAGE BUTTONS
========================================================= */

function initLanguageButtons() {
  const english =
    $('#lang-en');

  const nepali =
    $('#lang-np');

  if (english) {
    english.addEventListener(
      'click',
      () => {
        applyLanguage(
          'en'
        );
      }
    );
  }

  if (nepali) {
    nepali.addEventListener(
      'click',
      () => {
        applyLanguage(
          'np'
        );
      }
    );
  }
}

/* =========================================================
   INITIALIZATION
========================================================= */

function initializeApp() {
  injectProfessionalUI();

  createChatHeader();

  initTabs();

  initChat();

  initVoiceInput();

  initLanguageButtons();

  initSchemeSearch();

  initEMICalculator();

  initWeather();

  initMandi();

  renderQuickChips();

  fetchSchemes();

  fetchCropHealth();

  /*
    Do not automatically fetch weather or mandi prices
    on page load. They are requested by the user.
  */
}

if (
  document.readyState === 'loading'
) {
  document.addEventListener(
    'DOMContentLoaded',
    initializeApp
  );
} else {
  initializeApp();
}
