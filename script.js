const menuBtn = document.getElementById('menuBtn'), navLinks = document.getElementById('navLinks');

menuBtn.addEventListener('click', () => {
  const open = navLinks.classList.toggle('open');
  menuBtn.setAttribute('aria-expanded', String(open));
  menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  menuBtn.classList.toggle('active', open);
  document.body.classList.toggle('menu-open', open);
});

navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
  navLinks.classList.remove('open');
  menuBtn.setAttribute('aria-expanded', 'false');
  menuBtn.setAttribute('aria-label', 'Open menu');
  menuBtn.classList.remove('active');
  document.body.classList.remove('menu-open');
}));

document.getElementById('year').textContent = new Date().getFullYear();

const revealObserver = new IntersectionObserver(entries => entries.forEach(entry => {
  if (entry.isIntersecting) {
    entry.target.classList.add('visible');
    revealObserver.unobserve(entry.target);
  }
}), { threshold: .12 });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

const scrollProgress = document.getElementById('scrollProgress');
window.addEventListener('scroll', () => {
  const h = document.documentElement.scrollHeight - window.innerHeight;
  const p = h > 0 ? (window.scrollY / h) * 100 : 0;
  scrollProgress.style.width = p + '%';
}, { passive: true });

/* ===== Nav shrink on scroll ===== */
(function () {
  const nav = document.querySelector('.nav');
  if (!nav) return;
  let ticking = false;
  const apply = () => {
    nav.classList.toggle('shrink', window.scrollY > 40);
    ticking = false;
  };
  window.addEventListener('scroll', () => {
    if (!ticking) { ticking = true; requestAnimationFrame(apply); }
  }, { passive: true });
  apply();
})();

/* ===== Back to top button + progress ring ===== */
(function () {
  const toTop = document.getElementById('toTop');
  const bar = document.getElementById('toTopBar');
  if (!toTop || !bar) return;

  const CIRC = 2 * Math.PI * 26;
  bar.style.strokeDasharray = CIRC;

  let ticking = false;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  function update() {
    const h = document.documentElement.scrollHeight - window.innerHeight;
    const y = window.scrollY || document.documentElement.scrollTop || 0;
    const p = h > 0 ? Math.min(1, Math.max(0, y / h)) : 0;
    bar.style.strokeDashoffset = CIRC * (1 - p);
    toTop.classList.toggle('show', y > 320);
    ticking = false;
  }

  function requestUpdate() {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }

  window.addEventListener('scroll', requestUpdate, { passive: true });
  window.addEventListener('resize', requestUpdate);
  window.addEventListener('load', requestUpdate);

  toTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: reduceMotion.matches ? 'auto' : 'smooth' });
  });

  update();
})();

/* ===== Build section — form injection ===== */
document.querySelectorAll('.choose-build').forEach(btn => {
  btn.addEventListener('click', () => {
    openModal(btn.dataset.build);
  });
});

/* ===== FAQ smooth accordion ===== */
document.querySelectorAll('.faq-item').forEach(item => {
  const btn = item.querySelector('.faq-q');
  const panel = item.querySelector('.faq-a');
  
  btn.addEventListener('click', () => {
    const isOpen = item.classList.contains('open');
    
    document.querySelectorAll('.faq-item.open').forEach(other => {
      if (other !== item) {
        const oP = other.querySelector('.faq-a');
        oP.style.maxHeight = oP.scrollHeight + 'px';
        requestAnimationFrame(() => { oP.style.maxHeight = '0px'; });
        other.classList.remove('open');
        other.querySelector('.faq-q').setAttribute('aria-expanded', 'false');
      }
    });

    if (isOpen) {
      panel.style.maxHeight = panel.scrollHeight + 'px';
      requestAnimationFrame(() => { panel.style.maxHeight = '0px'; });
      item.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
    } else {
      item.classList.add('open');
      btn.setAttribute('aria-expanded', 'true');
      panel.style.maxHeight = panel.scrollHeight + 'px';
      panel.addEventListener('transitionend', function onEnd(e) {
        if (e.propertyName === 'max-height' && item.classList.contains('open')) {
          panel.style.maxHeight = 'none';
        }
        panel.removeEventListener('transitionend', onEnd);
      });
    }
  });
});

/* ===== Time on site + record ===== */
(function(){
  const start = Date.now();
  const curEl = document.getElementById('timeOnSite');
  const recEl = document.getElementById('timeRecord');
  const KEY = 'krynexlabs_time_record';
  const saved = parseInt(localStorage.getItem(KEY) || '0', 10);
  let record = Number.isFinite(saved) ? saved : 0;

  function fmt(sec) {
    if (sec < 60) return sec + 's';
    const m = Math.floor(sec / 60), s = sec % 60;
    if (m < 60) return m + 'm ' + s + 's';
    const h = Math.floor(m / 60), mm = m % 60;
    return h + 'h ' + mm + 'm';
  }

  if (recEl) recEl.textContent = fmt(record);

  function tick() {
    const elapsed = Math.floor((Date.now() - start) / 1000);
    if (curEl) curEl.textContent = fmt(elapsed);
    if (elapsed > record) {
      record = elapsed;
      if (recEl) recEl.textContent = fmt(record);
      try { localStorage.setItem(KEY, String(record)); } catch(e) {}
    }
  }

  tick();
  setInterval(tick, 1000);
})();

/* ===== Modal Logic ===== */
const modal = document.getElementById('contactModal'), plan = document.getElementById('plan');
let contactOpener = null;

function openModal(selected, opener) {
  contactOpener = opener || null;
  const fallback = document.getElementById('fallbackText');
  fallback.hidden = true;
  fallback.value = '';
  document.getElementById('copyMessage').hidden = true;
  document.getElementById('formStatus').textContent = '';
  if (selected) {
    let found = false;
    for (const opt of plan.options) {
      if (opt.value === selected || opt.textContent === selected) {
        plan.value = opt.value || opt.textContent;
        found = true;
        break;
      }
    }
    if (!found) {
      const opt = document.createElement('option');
      opt.value = selected;
      opt.textContent = selected;
      opt.selected = true;
      plan.appendChild(opt);
    }
  }
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
  setTimeout(() => document.getElementById('name').focus({ preventScroll: true }), 80);
}

function closeModal() {
  modal.classList.remove('open');
  document.body.style.overflow = '';
  if (contactOpener && document.contains(contactOpener)) contactOpener.focus({ preventScroll: true });
  contactOpener = null;
}

document.getElementById('openContact').addEventListener('click', e => openModal(undefined, e.currentTarget));
document.querySelectorAll('.choose-plan').forEach(btn => btn.addEventListener('click', e => openModal(e.currentTarget.dataset.plan, e.currentTarget)));
document.getElementById('closeModal').addEventListener('click', closeModal);
modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
document.addEventListener('keydown', e => {
  if (!modal.classList.contains('open')) return;
  if (e.key === 'Escape') { e.preventDefault(); closeModal(); return; }
  if (e.key !== 'Tab') return;
  const items = Array.from(modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'))
    .filter(el => !el.hidden && el.offsetParent !== null);
  if (!items.length) return;
  const first = items[0], last = items[items.length - 1];
  if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
  else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
});

document.getElementById('contactForm').addEventListener('submit', e => {
  e.preventDefault();
  const f = new FormData(e.currentTarget);
  const message = `KrynexLabs request\nName: ${f.get('name')}\nEmail: ${f.get('email')}\nInterest: ${f.get('plan')}\nTask: ${f.get('message') || 'Not specified'}`;
  const fallback = document.getElementById('fallbackText');
  fallback.hidden = false;
  fallback.value = message;
  
  const copy = document.getElementById('copyMessage');
  copy.hidden = false;
  
  document.getElementById('formStatus').textContent = 'Text prepared. Now trying to open your email app.';
  window.location.href = 'mailto:krynexlabs@gmail.com?subject=' + encodeURIComponent('KrynexLabs request') + '&body=' + encodeURIComponent(message);
});

document.getElementById('copyMessage').addEventListener('click', async () => {
  const text = document.getElementById('fallbackText').value;
  try {
    await navigator.clipboard.writeText(text);
    document.getElementById('formStatus').textContent = 'Message copied.';
  } catch {
    document.getElementById('fallbackText').focus();
    document.getElementById('fallbackText').select();
    document.getElementById('formStatus').textContent = 'Select the text and copy it manually.';
  }
});
/* ===== Appearance: theme + accent + background + saved themes ===== */
(function () {
  const T = window.KrynexTheme;
  const panel = document.getElementById('settingsModal');
  if (!T || !panel) return;

  const trigger = document.getElementById('themeBtn');
  const openers = Array.from(document.querySelectorAll('[data-open-settings]'));
  // The same controls live in the modal and in the standalone Appearance section.
  const pair = (id, attr) => [document.getElementById(id)]
    .concat(Array.from(document.querySelectorAll(attr))).filter(Boolean);
  const valueEls = pair('appearanceValue', '[data-appearance-value]');
  const closeBtn = document.getElementById('closeSettings');
  const resetBtns = pair('resetAppearance', '[data-reset-appearance]');
  const themeButtons = Array.from(document.querySelectorAll('[data-theme-choice]'));
  const accentButtons = Array.from(document.querySelectorAll('[data-accent-choice]'));
  const bgButtons = Array.from(document.querySelectorAll('[data-bg-choice]'));
  const accentPickers = pair('accentPicker', '[data-accent-picker]');
  const accentHexes = pair('accentHex', '[data-accent-hex]');
  const accentWells = pair('accentWell', '[data-accent-well]');
  const bgPickers = pair('bgPicker', '[data-bg-picker]');
  const bgHexes = pair('bgHex', '[data-bg-hex]');
  const bgWells = pair('bgWell', '[data-bg-well]');
  const themeNames = pair('themeName', '[data-theme-name]');
  const saveThemeBtns = pair('saveTheme', '[data-save-theme]');
  const themeLists = pair('themeList', '[data-theme-list]');
  const THEMES_KEY = 'krynexlabs_custom_themes';
  const DEFAULT_STATE = { theme: 'dark', accent: 'orange', accentHex: '#ff6a2a', bg: 'default', bgHex: '#10100f' };

  let state = T.read();
  let lastMode = 'dark';
  let lastAccentHex = state.accentHex;
  let lastBgValue = '#10100f';

  function persist() {
    syncMode();
    T.save(state);
    paint();
  }

  function syncMode() {
    const hex = state.bg === 'custom' ? state.bgHex : T.BGS[state.bg];
    const c = hex ? T.parse(hex) : null;
    if (c) state.theme = T.lum(c) < .45 ? 'dark' : 'light';
  }

  function paint() {
    syncMode();
    const info = T.apply(state);
    lastMode = info.mode;
    lastAccentHex = info.accentHex;
    lastBgValue = info.bgHex || (info.mode === 'light' ? '#f6f5f0' : '#10100f');

    themeButtons.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.themeChoice === state.theme)));
    accentButtons.forEach(b => b.setAttribute('aria-pressed', String(state.accent === b.dataset.accentChoice)));
    bgButtons.forEach(b => b.setAttribute('aria-pressed', String(state.bg === b.dataset.bgChoice)));
    presetButtons.forEach(b => {
      const preset = PRESETS.find(p => p.id === b.dataset.preset);
      b.setAttribute('aria-pressed', String(!!preset && isPresetActive(preset)));
    });

    accentPickers.forEach(el => { el.value = info.accentHex; });
    accentWells.forEach(el => el.style.setProperty('--pick', info.accentHex));
    accentHexes.forEach(el => {
      if (document.activeElement === el) return;
      el.value = info.accentHex.replace('#', '');
      const wrap = el.closest('.hex-input');
      if (wrap) wrap.classList.remove('invalid');
    });

    const bgValue = info.bgHex || (info.mode === 'light' ? '#f6f5f0' : '#10100f');
    bgPickers.forEach(el => { el.value = bgValue; });
    bgWells.forEach(el => el.style.setProperty('--pick', bgValue));
    bgHexes.forEach(el => {
      if (document.activeElement === el) return;
      el.value = bgValue.replace('#', '');
      const wrap = el.closest('.hex-input');
      if (wrap) wrap.classList.remove('invalid');
    });

    const next = lastMode === 'light' ? 'dark' : 'light';
    if (trigger) {
      trigger.setAttribute('aria-label', 'Switch to ' + next + ' theme');
      trigger.title = 'Switch to ' + next + ' theme';
    }
    const custom = state.accent === 'custom' || state.bg !== 'default';
    const label = (state.theme === 'system' ? 'System · ' : '') +
      (lastMode === 'light' ? 'Light' : 'Dark') + (custom ? ' · Custom' : '');
    valueEls.forEach(el => { el.textContent = label; });
  }

  /* ---- Color pickers + hex fields ---- */
  function applyHex(kind, value) {
    if (!value) return false;
    if (kind === 'accent') {
      state.accent = 'custom';
      state.accentHex = value;
    } else {
      state.bg = 'custom';
      state.bgHex = value;
    }
    persist();
    return true;
  }

  function bindHex(input, kind) {
    if (!input) return;
    const wrap = input.closest('.hex-input');
    input.addEventListener('input', () => {
      const value = T.normalizeHex(input.value);
      const typed = input.value.trim().replace(/^#/, '');
      if (wrap) wrap.classList.toggle('invalid', !value && typed.length >= 6);
      if (value) applyHex(kind, value);
    });
    input.addEventListener('blur', () => {
      if (!T.normalizeHex(input.value)) {
        input.value = (kind === 'accent' ? lastAccentHex : lastBgValue).replace('#', '');
        if (wrap) wrap.classList.remove('invalid');
      }
    });
    input.addEventListener('keydown', e => {
      if (e.key === 'Enter') { e.preventDefault(); input.blur(); }
    });
  }

  accentPickers.forEach(el => el.addEventListener('input', () => {
    state.accent = 'custom';
    state.accentHex = el.value;
    persist();
  }));
  bgPickers.forEach(el => el.addEventListener('input', () => {
    state.bg = 'custom';
    state.bgHex = el.value;
    persist();
  }));
  accentHexes.forEach(el => bindHex(el, 'accent'));
  bgHexes.forEach(el => bindHex(el, 'bg'));

  /* ---- Presets ---- */
  themeButtons.forEach(b => b.addEventListener('click', () => {
    state.theme = b.dataset.themeChoice;
    state.bg = 'default';
    persist();
  }));

  accentButtons.forEach(b => b.addEventListener('click', () => {
    state.accent = b.dataset.accentChoice;
    state.accentHex = T.ACCENTS[state.accent] || state.accentHex;
    persist();
  }));

  bgButtons.forEach(b => b.addEventListener('click', () => {
    state.bg = b.dataset.bgChoice;
    persist();
  }));

  /* ---- Built-in theme presets ---- */
  const PRESETS = [
    { id: 'classic', name: 'Classic', theme: 'dark', accent: 'orange', accentHex: '#ff6a2a', bg: 'default', bgHex: '#10100f' },
    { id: 'midnight', name: 'Midnight', theme: 'dark', accent: 'blue', accentHex: '#3b82f6', bg: 'midnight', bgHex: '#0b1020' },
    { id: 'forest', name: 'Forest', theme: 'dark', accent: 'emerald', accentHex: '#10b981', bg: 'forest', bgHex: '#0d1a14' },
    { id: 'sunset', name: 'Sunset', theme: 'dark', accent: 'rose', accentHex: '#f43f5e', bg: 'plum', bgHex: '#180f20' },
    { id: 'paper', name: 'Paper', theme: 'light', accent: 'slate', accentHex: '#64748b', bg: 'paper', bgHex: '#f8f6f0' }
  ];
  const presetLists = Array.from(document.querySelectorAll('[data-theme-presets]'));
  let presetButtons = [];

  function renderPresets() {
    presetButtons = [];
    presetLists.forEach(list => {
      list.textContent = '';
      PRESETS.forEach(preset => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'preset-chip';
        btn.dataset.preset = preset.id;
        btn.setAttribute('aria-pressed', 'false');
        const dot = document.createElement('i');
        dot.style.setProperty('--a', preset.accentHex);
        const label = document.createElement('span');
        label.textContent = preset.name;
        btn.append(dot, label);
        list.appendChild(btn);
        presetButtons.push(btn);
      });
    });
  }

  function isPresetActive(preset) {
    return state.theme === preset.theme &&
      state.accent === preset.accent &&
      (T.normalizeHex(state.accentHex) || '').toLowerCase() === preset.accentHex &&
      state.bg === preset.bg;
  }

  presetLists.forEach(list => list.addEventListener('click', e => {
    const btn = e.target.closest('[data-preset]');
    if (!btn) return;
    const preset = PRESETS.find(p => p.id === btn.dataset.preset);
    if (!preset) return;
    state = {
      theme: preset.theme,
      accent: preset.accent,
      accentHex: preset.accentHex,
      bg: preset.bg,
      bgHex: preset.bgHex
    };
    persist();
  }));

  /* ---- Saved custom themes ---- */
  function getThemes() {
    try {
      const list = JSON.parse(localStorage.getItem(THEMES_KEY) || '[]');
      return Array.isArray(list) ? list : [];
    } catch (e) { return []; }
  }

  function setThemes(list) {
    try { localStorage.setItem(THEMES_KEY, JSON.stringify(list)); } catch (e) {}
  }

  function renderThemes() {
    const list = getThemes();
    themeLists.forEach(themeList => {
      themeList.textContent = '';
      if (!list.length) {
        const empty = document.createElement('p');
        empty.className = 'theme-empty';
        empty.textContent = 'No saved themes yet — pick your colors, name them, and save.';
        themeList.appendChild(empty);
        return;
      }
      list.forEach(t => {
        const wrap = document.createElement('div');
        wrap.className = 'theme-chip-wrap';

        const apply = document.createElement('button');
        apply.type = 'button';
        apply.className = 'theme-chip';
        apply.dataset.themeApply = t.id;
        const dot = document.createElement('i');
        dot.style.setProperty('--a', t.accentHex || '#ff6a2a');
        const label = document.createElement('span');
        label.textContent = t.name;
        apply.append(dot, label);

        const del = document.createElement('button');
        del.type = 'button';
        del.className = 'theme-chip-del';
        del.dataset.themeDel = t.id;
        del.setAttribute('aria-label', 'Delete theme ' + t.name);
        del.textContent = '×';

        wrap.append(apply, del);
        themeList.appendChild(wrap);
      });
    });
  }

  themeLists.forEach(themeList => themeList.addEventListener('click', e => {
    const apply = e.target.closest('[data-theme-apply]');
    const del = e.target.closest('[data-theme-del]');
    if (apply) {
      const t = getThemes().find(x => x.id === apply.dataset.themeApply);
      if (t) {
        state = {
          theme: t.theme || state.theme,
          accent: t.accent || 'orange',
          accentHex: t.accentHex || '#ff6a2a',
          bg: t.bg || 'default',
          bgHex: t.bgHex || '#10100f'
        };
        persist();
      }
    }
    if (del) {
      setThemes(getThemes().filter(x => x.id !== del.dataset.themeDel));
      renderThemes();
    }
  }));

  saveThemeBtns.forEach((btn, i) => btn.addEventListener('click', () => {
    const list = getThemes();
    const input = themeNames[i];
    let name = (input && input.value ? input.value : '').trim().slice(0, 24);
    if (!name) name = 'Theme ' + (list.length + 1);
    const entry = {
      id: 't' + Date.now().toString(36),
      name: name,
      theme: state.theme,
      accent: state.accent,
      accentHex: state.accentHex,
      bg: state.bg,
      bgHex: state.bgHex
    };
    const same = list.findIndex(x => String(x.name).toLowerCase() === name.toLowerCase());
    if (same >= 0) list[same] = entry;
    else list.unshift(entry);
    setThemes(list.slice(0, 12));
    themeNames.forEach(el => { el.value = ''; });
    renderThemes();
  }));

  /* ---- Reset + header toggle ---- */
  resetBtns.forEach(btn => btn.addEventListener('click', () => {
    state = Object.assign({}, DEFAULT_STATE);
    persist();
  }));

  if (trigger) trigger.addEventListener('click', () => {
    state.bg = 'default';
    state.theme = lastMode === 'light' ? 'dark' : 'light';
    persist();
  });

  let lastOpener = null;

  function openSettings(event) {
    renderPresets();
    paint();
    renderThemes();
    lastOpener = event && event.currentTarget instanceof Element ? event.currentTarget : null;
    if (navLinks.classList.contains('open')) {
      navLinks.classList.remove('open');
      menuBtn.setAttribute('aria-expanded', 'false');
      menuBtn.setAttribute('aria-label', 'Open menu');
      menuBtn.classList.remove('active');
      document.body.classList.remove('menu-open');
    }
    panel.classList.add('open');
    document.body.style.overflow = 'hidden';
    openers.forEach(b => b.setAttribute('aria-expanded', 'true'));
    setTimeout(() => {
      const active = panel.querySelector('[aria-pressed="true"]') || closeBtn;
      if (active) active.focus({ preventScroll: true });
    }, 60);
  }

  function closeSettings() {
    panel.classList.remove('open');
    document.body.style.overflow = '';
    openers.forEach(b => b.setAttribute('aria-expanded', 'false'));
    let back = lastOpener && document.contains(lastOpener) ? lastOpener : openers[0];
    if (back && navLinks.contains(back) && !navLinks.classList.contains('open')) back = menuBtn;
    if (back) back.focus({ preventScroll: true });
  }

  openers.forEach(b => b.addEventListener('click', openSettings));

  if (closeBtn) closeBtn.addEventListener('click', closeSettings);
  panel.addEventListener('click', e => { if (e.target === panel) closeSettings(); });

  document.addEventListener('keydown', e => {
    if (!panel.classList.contains('open')) return;
    if (e.key === 'Escape') { e.preventDefault(); closeSettings(); }
    if (e.key === 'Tab') {
      const items = panel.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      if (!items.length) return;
      const first = items[0], last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  const onSchemeChange = () => { if (state.theme === 'system' && state.bg === 'default') paint(); };
  if (window.matchMedia) {
    const mq = window.matchMedia('(prefers-color-scheme: light)');
    if (mq.addEventListener) mq.addEventListener('change', onSchemeChange);
    else if (mq.addListener) mq.addListener(onSchemeChange);
  }

  renderPresets();
  paint();
  renderThemes();
})();

/* ===== AI Feed: parse posts about AI from Hugging Face + Telegram ===== */
(function(){
  const listEl = document.getElementById('aiFeedList');
  const loadingEl = document.getElementById('aiFeedLoading');
  if (!listEl) return;

  const TELEGRAM_CHANNEL = 'KrynexLabs';
  const AI_RE = /ai\b|llm|gpt|claude|gemini|anthropic|openai|neural|transformer|fine-tun|нейро/i;
  const DATE_FMT = {month:'short',day:'numeric',year:'numeric'};

  function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')}

  function parseRss(text){
    const out = [];
    try {
      const doc = new DOMParser().parseFromString(text, 'text/xml');
      doc.querySelectorAll('item').forEach(item => {
        const title = (item.querySelector('title') || {}).textContent;
        const link = (item.querySelector('link') || {}).textContent;
        const date = (item.querySelector('pubDate') || {}).textContent || '';
        if (!link) return;
        out.push({source:'Hugging Face', title: String(title||'').trim(), link, date});
      });
    } catch(e){}
    return out;
  }

  function parseTelegram(html){
    const out = [];
    try {
      const doc = new DOMParser().parseFromString(html, 'text/html');
      doc.querySelectorAll('.tgme_widget_message_bubble').forEach(el => {
        const a = el.querySelector('a.tgme_widget_message_link');
        const t = el.querySelector('.tgme_widget_message_text');
        if (!a || !t) return;
        const text = t.textContent.replace(/\s+/g,' ').trim();
        if (!text || !AI_RE.test(text)) return;
        const href = (a.getAttribute('href')||'').trim();
        let link = href;
        if (link && !/^https?:\/\//.test(link)) link = 'https://t.me' + (link.startsWith('/') ? link : '/' + link);
        const dt = (el.closest('[datetime]')||{}).getAttribute ? el.closest('[datetime]').getAttribute('datetime') : null;
        out.push({source:'Telegram', title: text.slice(0,120), link: link || ('https://t.me/' + TELEGRAM_CHANNEL), date: dt || ''});
      });
    } catch(e){}
    return out;
  }

  function fmtDate(iso){
    try { return new Date(iso).toLocaleDateString('en-US', DATE_FMT); } catch(e){ return String(iso).slice(0,10); }
  }

  async function load(){
    const posts = [];
    await Promise.all([
      (async () => { try { const r = await fetch('https://huggingface.co/blog/feed.xml', {mode:'cors'}); if (r.ok) posts.push(...parseRss(await r.text())); } catch(e){} })(),
      (async () => { try { const r = await fetch('https://t.me/s/' + TELEGRAM_CHANNEL, {mode:'cors'}); if (r.ok) posts.push(...parseTelegram(await r.text())); } catch(e){} })()
    ]);
    const seen = new Set();
    const uniq = posts.filter(p => p.link && (seen.has(p.link) ? false : seen.add(p.link)));
    if (loadingEl) loadingEl.remove();
    if (!uniq.length) { listEl.innerHTML = '<div class="ai-feed-empty">No AI posts yet — sources are being updated.</div>'; return; }
    listEl.innerHTML = uniq.slice(0, 12).map(p =>
      '<a class="ai-post" href="' + esc(p.link) + '" target="_blank" rel="noopener">' +
      '<span class="ai-post-source">' + esc(p.source) + '</span>' +
      '<span class="ai-post-title">' + esc(p.title || '(Untitled)') + '</span>' +
      (p.date ? '<span class="ai-post-date">' + esc(fmtDate(p.date)) + '</span>' : '') +
      '</a>'
    ).join('');
  }
  load();
})();

/* ===== Section collapse (animated) ===== */
document.querySelectorAll('[data-collapse]').forEach(btn => {
  const initial = document.getElementById(btn.dataset.collapse);
  if (initial) btn.setAttribute('aria-expanded', String(!initial.classList.contains('collapsed')));
  btn.addEventListener('click', () => {
    const section = document.getElementById(btn.dataset.collapse);
    if (!section) return;
    const willCollapse = !section.classList.contains('collapsed');
    const content = [];
    section.querySelectorAll(':scope > *:not(.section-head):not(.faq-intro):not(.faq)').forEach(el => content.push(el));
    if (section.id === 'faq') {
      const list = section.querySelector('.faq-list');
      if (list) content.push(list);
    }
    if (willCollapse) {
      content.forEach(el => { el.style.maxHeight = el.scrollHeight + 'px'; });
      section.classList.add('collapsed');
      requestAnimationFrame(() => content.forEach(el => { el.style.maxHeight = '0px'; el.style.pointerEvents = 'none'; }));
    } else {
      const natural = [];
      content.forEach(el => { natural.push(el.scrollHeight); });
      section.classList.remove('collapsed');
      content.forEach(el => { el.style.opacity = '0'; });
      requestAnimationFrame(() => content.forEach((el, i) => {
        el.style.maxHeight = natural[i] + 'px';
        el.style.opacity = '1';
        el.style.pointerEvents = '';
        const clear = e => {
          if (e && e.propertyName !== 'max-height') return;
          el.style.maxHeight = '';
          el.removeEventListener('transitionend', clear);
          clearTimeout(timer);
        };
        const timer = setTimeout(clear, 600);
        el.addEventListener('transitionend', clear);
      }));
    }
    btn.classList.toggle('collapsed', willCollapse);
    btn.setAttribute('aria-expanded', String(!willCollapse));
    btn.setAttribute('aria-label', willCollapse ? 'Expand section' : 'Collapse section');
    if (!willCollapse) section.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
  });
});

/* ===== Gamification: levels, tasks, achievements, coins, streak, discount ===== */
(function(){
  const KEY = 'krynexlabs_gamification';
  const EXCHANGE_ADDRESS = 'krynexlabs@gmail.com';
  const EXCHANGE_SUBJECT = 'Coins exchange';
  const COINS_PER_DISCOUNT = 10;
  const MAX_DISCOUNT = 10;
  const MAIN_SECTIONS = ['services','about','process','pricing','build','ai-feed','reviews','appearance'];
  const LEVELS = [
    {min:0, name:'Newcomer'},
    {min:10, name:'Explorer'},
    {min:20, name:'Regular'},
    {min:32, name:'Enthusiast'},
    {min:45, name:'Veteran'}
  ];
  const GROUPS = [
    {id:'explore', label:'Explore the site'},
    {id:'interact', label:'Interact'},
    {id:'time', label:'Time on site'}
  ];
  const TIER_POINTS = {common:5,rare:10,epic:20};
  const SVG_ATTRS = 'viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"';
  const ICONS = {
    coin:'<svg '+SVG_ATTRS+'><circle cx="12" cy="12" r="9"/><path d="M12 7v10M9.5 9.8h4.2a1.9 1.9 0 0 1 0 3.8H9.5h4.6a1.9 1.9 0 0 1 0 3.8H9.5"/></svg>',
    star:'<svg '+SVG_ATTRS+'><path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1L3.2 9.5l6.1-.9L12 3z"/></svg>',
    level:'<svg '+SVG_ATTRS+'><path d="M12 19V5M5 12l7-7 7 7"/></svg>',
    sparkle:'<svg '+SVG_ATTRS+'><path d="M12 3l1.9 5.6L19.5 10l-5.6 1.9L12 17.5l-1.9-5.6L4.5 10l5.6-1.4L12 3z"/><path d="M19 16l.7 2.3L22 19l-2.3.7L19 22l-.7-2.3L16 19l2.3-.7L19 16z"/></svg>',
    share:'<svg '+SVG_ATTRS+'><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.7 13.5l6.6 4M15.3 6.5l-6.6 4"/></svg>',
    check:'<svg '+SVG_ATTRS+'><path d="M5 12l4 4L19 6"/></svg>',
    down:'<svg '+SVG_ATTRS+'><path d="M12 5v14M5 12l7 7 7-7"/></svg>',
    error:'<svg '+SVG_ATTRS+'><circle cx="12" cy="12" r="9"/><path d="M12 7v6M12 17h.01"/></svg>'
  };
  const DAILY_BONUS = 3;
  const QUEST_REWARD = 5;
  const WHEEL_PRIZES = [1,2,3,5,8,12,15,25];
  const QUESTS = ['visit-solutions','visit-about','visit-process','visit-pricing','visit-build','visit-ai-feed','visit-reviews','visit-appearance','read-faq','open-contact','try-theme','read-review','back-to-top','share','daily-bonus'];
  const TASKS = [
    {id:'visit-solutions', group:'explore', section:'services', name:'Visit the Solutions section', coins:3},
    {id:'visit-about', group:'explore', section:'about', name:'Visit the About section', coins:3},
    {id:'visit-process', group:'explore', section:'process', name:'Visit the How we work section', coins:3},
    {id:'visit-pricing', group:'explore', section:'pricing', name:'Visit the Pricing section', coins:3},
    {id:'visit-build', group:'explore', section:'build', name:'Visit the Build section', coins:3},
    {id:'visit-ai-feed', group:'explore', section:'ai-feed', name:'Visit the AI Feed section', coins:3},
    {id:'visit-reviews', group:'explore', section:'reviews', name:'Visit the Reviews section', coins:3},
    {id:'visit-appearance', group:'explore', section:'appearance', name:'Visit the Themes section', coins:3},
    {id:'read-faq', group:'interact', name:'Read the FAQ questions', coins:3},
    {id:'open-contact', group:'interact', name:'Open the contact form', coins:4},
    {id:'try-theme', group:'interact', name:'Try a theme or accent color', coins:4},
    {id:'read-review', group:'interact', name:'Browse the reviews', coins:3},
    {id:'back-to-top', group:'interact', name:'Use the back-to-top button', coins:2},
    {id:'share', group:'interact', action:'share', name:'Share the site with a friend', coins:5},
    {id:'time-10m', group:'time', min:10, name:'Spend 10 minutes on the site', coins:2},
    {id:'time-20m', group:'time', min:20, name:'Spend 20 minutes on the site', coins:2},
    {id:'time-30m', group:'time', min:30, name:'Spend 30 minutes on the site', coins:3}
  ];
  const ACHIEVEMENTS = [
    {id:'first-visit', title:'First visit', desc:'You opened the site.'},
    {id:'explorer', title:'Explorer', desc:'Visited all the main sections.', tier:'rare'},
    {id:'faq-reader', title:'FAQ fan', desc:'Read the FAQ questions.'},
    {id:'on-site-10m', title:'10 minutes on the site', desc:'Spent 10 minutes browsing.'},
    {id:'task-master', title:'Task master', desc:'Completed 5 site tasks.', tier:'rare'},
    {id:'return-visitor', title:'Welcome back', desc:'Came back to the site.'},
    {id:'style-setter', title:'Style setter', desc:'Tried a theme or accent color.'},
    {id:'critic', title:'Critic', desc:'Browsed the reviews.'},
    {id:'round-trip', title:'Round trip', desc:'Used the back-to-top button.'},
    {id:'coin-collector', title:'Coin collector', desc:'Earned 25 coins in total.', tier:'rare'},
    {id:'streak-3', title:'Three in a row', desc:'Visited three days in a row.', tier:'rare'},
    {id:'completionist', title:'Completionist', desc:'Finished every site task.', tier:'epic'},
    {id:'secret', title:'Hidden signature', desc:'You found the secret combination.', tier:'epic', secret:true}
  ];

  function escHtml(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;')}

  function getState(){
    let saved=null;
    try{saved=JSON.parse(localStorage.getItem(KEY)||'null')}catch(e){}
    return Object.assign({coins:0,totalEarned:0,tasks:{},visited:{},achievements:{},history:[],shared:{},stats:{}},saved||{});
  }

  const state=getState();
  state.coins=Math.max(0,Number(state.coins)||0);
  state.totalEarned=Math.max(0,Number(state.totalEarned)||0);
  if(!state.totalEarned)state.totalEarned=TASKS.reduce((sum,t)=>sum+(state.tasks[t.id]?t.coins:0),0);
  if(!Array.isArray(state.history))state.history=[];
  if(!state.shared||typeof state.shared!=='object')state.shared={};

  function save(){
    try{localStorage.setItem(KEY,JSON.stringify({coins:state.coins,totalEarned:state.totalEarned,tasks:state.tasks,visited:state.visited,achievements:state.achievements,history:state.history,shared:state.shared,stats:state.stats}))}catch(e){}
  }

  function elapsedMin(){return(Date.now()-state.stats.sessionStart)/60000}

  function formatMin(m){
    const t=Math.max(0,Math.floor(m));
    const h=Math.floor(t/60);
    return h?h+'h '+(t%60)+'m':t+'m';
  }

  function doneCount(){return TASKS.filter(t=>state.tasks[t.id]).length}

  function levelFor(total){
    let i=0;
    LEVELS.forEach((level,index)=>{if(total>=level.min)i=index});
    const current=LEVELS[i], next=LEVELS[i+1]||null;
    const start=current.min, target=next?next.min:total;
    const progress=next?Math.min(1,(total-start)/(target-start)):1;
    return {index:i,current,next,start,target,progress};
  }

  function discountFor(coins){
    return Math.min(MAX_DISCOUNT,Math.floor(coins/COINS_PER_DISCOUNT));
  }

  function bumpCoins(){
    const el=document.getElementById('gamCoins');
    if(!el)return;
    el.classList.remove('bump');
    void el.offsetWidth;
    el.classList.add('bump');
  }

  function celebrate(){
    if(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
    const box=document.getElementById('gamConfetti');
    if(!box)return;
    const colors=['var(--accent)','var(--accent-2)','var(--accent-3)','var(--ok)'];
    for(let i=0;i<18;i++){
      const bit=document.createElement('i');
      bit.style.left=Math.random()*100+'%';
      bit.style.background=colors[i%colors.length];
      bit.style.animationDelay=(Math.random()*0.18)+'s';
      bit.style.animationDuration=(0.9+Math.random()*0.5)+'s';
      box.appendChild(bit);
      setTimeout(()=>bit.remove(),1600);
    }
  }

  function dateKey(d){
    return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
  }

  function logEvent(type,text,amount){
    state.history.unshift({t:Date.now(),type,text,amount:amount||0});
    if(state.history.length>100)state.history.length=100;
  }

  function achievementStats(){
    const earned=ACHIEVEMENTS.filter(a=>state.achievements[a.id]);
    return {earned:earned.length,points:earned.reduce((sum,a)=>sum+(TIER_POINTS[a.tier||'common']||0),0)};
  }

  function timeAgo(ts){
    const d=new Date(ts), now=new Date();
    const time=d.toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit'});
    if(d.toDateString()===now.toDateString())return 'Today, '+time;
    if(new Date(now.getTime()-86400000).toDateString()===d.toDateString())return 'Yesterday, '+time;
    return d.toLocaleDateString('en-US',{month:'short',day:'numeric'})+', '+time;
  }

  function normalizeProgress(raw){
    if(!raw||typeof raw!=='object'||Array.isArray(raw))return null;
    const coins=Math.max(0,Math.floor(Number(raw.coins)||0));
    const totalEarned=Math.max(coins,Math.floor(Number(raw.totalEarned)||0));
    const flags={tasks:{},visited:{},achievements:{},shared:{}};
    Object.keys(flags).forEach(key=>{
      const src=raw[key];
      if(!src||typeof src!=='object'||Array.isArray(src))return;
      Object.keys(src).forEach(k=>{
        if(/^[A-Za-z0-9_-]{1,60}$/.test(k))flags[key][k]=!!src[k];
      });
    });
    const tasks={},visited={},achievements={},shared={};
    TASKS.forEach(t=>{if(flags.tasks[t.id])tasks[t.id]=true});
    MAIN_SECTIONS.forEach(k=>{if(flags.visited[k])visited[k]=true});
    ACHIEVEMENTS.forEach(a=>{if(flags.achievements[a.id])achievements[a.id]=true});
    Object.keys(flags.shared).forEach(k=>{if(flags.shared[k])shared[k]=true});
    const history=[];
    if(Array.isArray(raw.history)){
      raw.history.slice(0,100).forEach(item=>{
        if(!item||typeof item!=='object')return;
        const t=Number(item.t);
        if(!Number.isFinite(t))return;
        history.push({
          t,
          type:['coins','achievement','level','bonus'].indexOf(item.type)>=0?item.type:'coins',
          text:String(item.text||'').slice(0,120),
          amount:Math.max(0,Math.floor(Number(item.amount)||0))
        });
      });
    }
    const srcStats=raw.stats&&typeof raw.stats==='object'?raw.stats:{};
    const stats={returned:!!srcStats.returned,sessionStart:Date.now()};
    ['firstVisit','lastVisit','lastBonus','questClaimed','lastSpin'].forEach(k=>{
      const v=srcStats[k];
      stats[k]=typeof v==='string'&&/^\d{4}-\d{2}-\d{2}/.test(v)?v.slice(0,40):'';
    });
    ['streak','bestStreak','lastPrize'].forEach(k=>{
      const n=Number(srcStats[k]);
      stats[k]=Number.isFinite(n)&&n>=0?Math.floor(n):0;
    });
    return {coins,totalEarned,tasks,visited,achievements,shared,history,stats};
  }

  function questForDay(key){
    let hash=0;
    key.split('').forEach(ch=>{hash=(hash*31+ch.charCodeAt(0))>>>0});
    return QUESTS[hash%QUESTS.length];
  }

  function questDone(id){
    if(id==='daily-bonus')return state.stats.lastBonus===todayKey;
    return !!state.tasks[id];
  }

  function floatCoins(n){
    const host=document.getElementById('gamCoins');
    if(!host||!host.parentElement)return;
    const el=document.createElement('span');
    el.className='gam-float';
    el.textContent='+'+n;
    host.parentElement.appendChild(el);
    setTimeout(()=>el.remove(),1200);
  }

  function unlockAchievement(id){
    const a=ACHIEVEMENTS.find(x=>x.id===id);
    if(!a||state.achievements[id])return;
    state.achievements[id]=true;
    logEvent('achievement',a.title);
    save();
    render();
    celebrate();
    queueToast('Achievement unlocked: '+a.title,'achievement');
  }

  function checkAchievement(a){
    switch(a.id){
      case 'first-visit':return!!state.stats.firstVisit;
      case 'explorer':return MAIN_SECTIONS.every(k=>state.visited[k]);
      case 'faq-reader':return!!state.tasks['read-faq'];
      case 'on-site-10m':return elapsedMin()>=10;
      case 'task-master':return doneCount()>=5;
      case 'return-visitor':return!!state.stats.returned;
      case 'style-setter':return!!state.tasks['try-theme'];
      case 'critic':return!!state.tasks['read-review'];
      case 'round-trip':return!!state.tasks['back-to-top'];
      case 'coin-collector':return state.totalEarned>=25;
      case 'streak-3':return(state.stats.streak||1)>=3;
      case 'completionist':return doneCount()===TASKS.length;
      default:return false
    }
  }

  function refreshAchievements(){
    const unlocked=[];
    ACHIEVEMENTS.forEach(a=>{
      if(!state.achievements[a.id]&&checkAchievement(a)){
        state.achievements[a.id]=true;
        unlocked.push(a);
      }
    });
    if(unlocked.length)save();
    return unlocked;
  }

  function award(id){
    const task=TASKS.find(t=>t.id===id);
    if(!task||state.tasks[task.id])return;
    const before=levelFor(state.totalEarned).index;
    state.tasks[task.id]=true;
    state.coins+=task.coins;
    state.totalEarned+=task.coins;
    const after=levelFor(state.totalEarned);
    logEvent('coins',task.name,task.coins);
    if(after.index>before)logEvent('level','Reached '+after.current.name);
    const unlocked=refreshAchievements();
    unlocked.forEach(a=>logEvent('achievement',a.title));
    save();
    render();
    bumpCoins();
    floatCoins(task.coins);
    queueToast('Earned +'+task.coins+' coins: '+task.name,'coins');
    unlocked.forEach(a=>{
      celebrate();
      queueToast('Achievement unlocked: '+a.title,'achievement');
    });
  }

  function observeSection(t){
    const el=document.getElementById(t.section);
    if(!el)return;
    const obs=new IntersectionObserver(entries=>{
      entries.forEach(e=>{
        if(e.isIntersecting&&!state.tasks[t.id]){
          state.visited[t.section]=true;
          save();
          award(t.id);
        }
      })
    },{threshold:.2});
    obs.observe(el);
  }

  function renderTasks(){
    const progress=document.getElementById('gamTasksProgress');
    if(progress)progress.textContent=doneCount()+' / '+TASKS.length;
    const list=document.getElementById('gamTasks');
    if(!list)return;
    let html='';
    GROUPS.forEach(group=>{
      html+='<h4 class="gam-group">'+escHtml(group.label)+'</h4>';
      TASKS.filter(t=>t.group===group.id).forEach(t=>{
        const done=!!state.tasks[t.id];
        const anchor=t.section||(t.id==='read-faq'?'faq':'');
        const action=t.action?'<button class="gam-task-open gam-action" type="button" data-action="'+t.action+'">'+ICONS.share+'<span>Share</span></button>':
          (anchor?'<a class="gam-task-open" href="#'+anchor+'">'+ICONS.down+'<span>Go</span></a>':'');
        html+='<article class="gam-task'+(done?' is-done':'')+'">'+
          '<div class="gam-task-row"><span class="gam-task-name">'+escHtml(t.name)+'</span>'+
          '<span class="gam-task-coin">'+(done?ICONS.check:'')+'+'+t.coins+'</span>'+action+'</div></article>';
      });
    });
    list.innerHTML=html;
  }

  function renderAchievements(){
    const stats=achievementStats();
    const progress=document.getElementById('gamAchProgress');
    if(progress)progress.textContent=stats.earned+' / '+ACHIEVEMENTS.length+' · '+stats.points+' AP';
    const list=document.getElementById('gamAchievements');
    if(!list)return;
    let html='';
    ACHIEVEMENTS.forEach(a=>{
      const unlocked=!!state.achievements[a.id];
      const hidden=a.secret&&!unlocked;
      const tier=a.tier?'<span class="gam-ach-tier tier-'+a.tier+'">'+a.tier+'</span>':'';
      const share=unlocked?'<button class="gam-ach-share" type="button" data-share-ach="'+a.id+'" aria-label="Share achievement '+escHtml(a.title)+'">'+ICONS.share+'</button>':'';
      html+='<article class="gam-ach'+(unlocked?' is-earned':'')+(hidden?' is-secret':'')+'">'+
        '<span class="gam-ach-mark">'+(unlocked?ICONS.check:'')+'</span>'+
        '<div class="gam-ach-text"><span class="gam-ach-title">'+escHtml(hidden?'???':a.title)+'</span>'+
        '<span class="gam-ach-desc">'+escHtml(hidden?'A hidden badge — keep exploring.':a.desc)+'</span></div>'+tier+share+'</article>';
    });
    list.innerHTML=html;
  }

  function updateExchange(){
    const mail=document.getElementById('gamExchangeMail');
    if(!mail)return;
    const body='Hi! I want to exchange '+state.coins+' coins for a discount.\n\n'+
      'Current balance: '+state.coins+' coins (approx. '+discountFor(state.coins)+'% discount).\n'+
      'Level: '+levelFor(state.totalEarned).current.name+'\n'+
      'Day streak: '+(state.stats.streak||1)+' day(s).';
    mail.href='mailto:'+EXCHANGE_ADDRESS+'?subject='+encodeURIComponent(EXCHANGE_SUBJECT)+'&body='+encodeURIComponent(body);
  }

  function updateTime(){
    const el=document.getElementById('gamOnSite');
    if(el)el.textContent=formatMin(elapsedMin());
  }

  function renderLevel(){
    const level=levelFor(state.totalEarned);
    const num=document.getElementById('gamLevelNum');
    if(num)num.textContent=String(level.index+1).padStart(2,'0');
    const name=document.getElementById('gamLevelName');
    if(name)name.textContent=level.current.name;
    const hint=document.getElementById('gamLevelHint');
    if(hint)hint.textContent=level.next?(level.target-state.totalEarned)+' coins to '+level.next.name:'Top level reached — nice work';
    const xp=document.getElementById('gamLevelProgress');
    if(xp)xp.textContent=level.next?state.totalEarned+' / '+level.target:String(state.totalEarned);
    const pct=Math.round(level.progress*100);
    const bar=document.getElementById('gamLevelBar');
    if(bar)bar.style.width=pct+'%';
    const wrap=document.getElementById('gamLevelBarWrap');
    if(wrap)wrap.setAttribute('aria-valuenow',String(pct));
  }

  function renderDiscount(){
    const remainder=state.coins%COINS_PER_DISCOUNT;
    const discount=discountFor(state.coins);
    const el=document.getElementById('gamDiscount');
    if(el)el.textContent=discount+'%';
    const pct=discount>=MAX_DISCOUNT?100:remainder*10;
    const bar=document.getElementById('gamDiscountBar');
    if(bar)bar.style.width=pct+'%';
    const wrap=document.getElementById('gamDiscountBarWrap');
    if(wrap)wrap.setAttribute('aria-valuenow',String(pct));
    const hint=document.getElementById('gamDiscountHint');
    if(hint){
      const left=COINS_PER_DISCOUNT-remainder;
      hint.textContent=discount>=MAX_DISCOUNT
        ?'Maximum discount reached — send us a screenshot to claim it.'
        :left+(left===1?' coin':' coins')+' until '+(discount+1)+'%.';
    }
  }

  function renderDaily(){
    const claimed=state.stats.lastBonus===todayKey;
    const btn=document.getElementById('gamDailyClaim');
    if(btn){
      btn.disabled=claimed;
      btn.innerHTML=claimed?ICONS.check+'<span>Claimed</span>':'Claim +'+DAILY_BONUS;
    }
    const hint=document.getElementById('gamDailyHint');
    if(hint)hint.textContent=claimed?'Come back tomorrow for more coins':'+'+DAILY_BONUS+' coins once a day';
  }

  function renderQuest(){
    const id=questForDay(todayKey);
    const task=TASKS.find(t=>t.id===id);
    const name=id==='daily-bonus'?'Claim the daily bonus':(task?task.name:'Explore the site');
    const desc=document.getElementById('gamQuestDesc');
    if(desc)desc.textContent=name+' · +'+QUEST_REWARD+' coins';
    const btn=document.getElementById('gamQuestClaim');
    if(!btn)return;
    const claimed=state.stats.questClaimed===todayKey;
    const done=questDone(id);
    btn.disabled=claimed||!done;
    btn.innerHTML=claimed?ICONS.check+'<span>Done</span>':(done?'Claim +'+QUEST_REWARD:'In progress');
  }

  function drawWheel(){
    const canvas=document.getElementById('wheelCanvas');
    if(!canvas)return;
    const ctx=canvas.getContext&&canvas.getContext('2d');
    if(!ctx)return;
    const size=canvas.width, cx=size/2, cy=size/2, r=size/2-8;
    const seg=360/WHEEL_PRIZES.length;
    const styles=getComputedStyle(document.documentElement);
    const rgb=(styles.getPropertyValue('--accent-rgb')||'255,106,42').trim();
    ctx.clearRect(0,0,size,size);
    WHEEL_PRIZES.forEach((prize,i)=>{
      const a0=(-90+i*seg)*Math.PI/180, a1=(-90+(i+1)*seg)*Math.PI/180;
      ctx.beginPath();
      ctx.moveTo(cx,cy);
      ctx.arc(cx,cy,r,a0,a1);
      ctx.closePath();
      ctx.fillStyle=i%2?'rgba('+rgb+',.32)':'rgba('+rgb+',.68)';
      ctx.fill();
      ctx.strokeStyle='rgba(255,255,255,.25)';
      ctx.lineWidth=1.5;
      ctx.stroke();
      ctx.save();
      ctx.translate(cx,cy);
      ctx.rotate((i*seg+seg/2)*Math.PI/180);
      ctx.textAlign='right';
      ctx.textBaseline='middle';
      ctx.fillStyle='#ffffff';
      ctx.shadowColor='rgba(0,0,0,.45)';
      ctx.shadowBlur=4;
      ctx.font='700 15px Manrope, sans-serif';
      ctx.fillText('+'+prize,r-16,0);
      ctx.restore();
    });
    ctx.beginPath();
    ctx.arc(cx,cy,15,0,Math.PI*2);
    ctx.fillStyle='rgba(255,255,255,.9)';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx,cy,7,0,Math.PI*2);
    ctx.fillStyle='rgba('+rgb+',.9)';
    ctx.fill();
  }

  function renderWheel(){
    const spun=state.stats.lastSpin===todayKey;
    const btn=document.getElementById('wheelSpin');
    if(btn){
      btn.disabled=spun;
      btn.textContent=spun?'DONE':'SPIN';
    }
    const reward=document.getElementById('wheelReward');
    if(reward)reward.textContent=spun&&state.stats.lastPrize?'You won +'+state.stats.lastPrize+' coins!':'Ready to spin. Good luck!';
  }

  function renderDashboard(){
    const records=document.getElementById('dashRecords');
    if(records){
      let recordSec=0;
      try{recordSec=Math.max(0,Number(localStorage.getItem('krynexlabs_time_record'))||0)}catch(e){}
      const first=state.stats.firstVisit?new Date(state.stats.firstVisit):null;
      const firstLabel=first&&!isNaN(first.getTime())?first.toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}):'—';
      const cards=[
        ['Best streak',(state.stats.bestStreak||1)+'d'],
        ['Coins earned',String(state.totalEarned)],
        ['Site record',formatMin(recordSec/60)],
        ['First visit',firstLabel]
      ];
      records.innerHTML=cards.map(c=>'<div class="dash-record"><span>'+c[0]+'</span><strong>'+escHtml(c[1])+'</strong></div>').join('');
    }
    const history=document.getElementById('dashHistory');
    if(history){
      if(!state.history.length){
        history.innerHTML='<p class="dash-empty">No activity yet. Complete a task or claim the daily bonus to start your log.</p>';
      }else{
        const icons={coins:ICONS.coin,achievement:ICONS.star,level:ICONS.level,bonus:ICONS.sparkle};
        history.innerHTML=state.history.slice(0,20).map(item=>
          '<div class="dash-event type-'+item.type+'"><span class="dash-icon" aria-hidden="true">'+(icons[item.type]||ICONS.coin)+'</span>'+
          '<span class="dash-event-text">'+escHtml(item.text)+'</span>'+
          (item.amount?'<span class="dash-event-amount">+'+item.amount+'</span>':'')+
          '<span class="dash-event-time">'+escHtml(timeAgo(item.t))+'</span></div>'
        ).join('');
      }
    }
    const snapshot=document.getElementById('dashSnapshot');
    if(snapshot){
      const level=levelFor(state.totalEarned), ach=achievementStats();
      const rows=[
        ['Level',level.current.name+' ('+(level.index+1)+')'],
        ['Balance',state.coins+' coins'],
        ['Tasks',doneCount()+' / '+TASKS.length],
        ['Achievements',ach.earned+' / '+ACHIEVEMENTS.length+' ('+ach.points+' AP)'],
        ['Discount',discountFor(state.coins)+'%'],
        ['Streak',(state.stats.streak||1)+'d · best '+(state.stats.bestStreak||1)+'d'],
        ['This session',formatMin(elapsedMin())]
      ];
      snapshot.innerHTML=rows.map(r=>'<div><span>'+r[0]+'</span><b>'+escHtml(r[1])+'</b></div>').join('');
    }
    const calendar=document.getElementById('dashCalendar');
    if(calendar){
      const byDay={};
      state.history.forEach(item=>{
        const d=new Date(item.t);
        if(isNaN(d.getTime()))return;
        const key=dateKey(d);
        byDay[key]=(byDay[key]||0)+(item.amount||1);
      });
      if(state.stats.firstVisit){
        const d=new Date(state.stats.firstVisit);
        if(!isNaN(d.getTime())){
          const key=dateKey(d);
          if(!byDay[key])byDay[key]=1;
        }
      }
      const end=new Date(now.getFullYear(),now.getMonth(),now.getDate());
      const start=new Date(end.getTime());
      start.setDate(start.getDate()-end.getDay()-77);
      let html='', active=0;
      for(let i=0;i<84;i++){
        const day=new Date(start.getTime());
        day.setDate(start.getDate()+i);
        const key=dateKey(day), value=byDay[key]||0;
        const level=value<=0?0:value<3?1:value<7?2:value<12?3:4;
        if(value>0&&day<=end)active++;
        html+='<i class="cal-cell lvl-'+(day>end?0:level)+'" title="'+key+': '+value+' coins"></i>';
      }
      calendar.innerHTML=html;
      const summary=document.getElementById('dashCalSummary');
      if(summary)summary.textContent='Last 12 weeks · '+active+' active days';
    }
  }

  function render(){
    const coins=document.getElementById('gamCoins');
    if(coins)coins.textContent=String(state.coins);
    const doneEl=document.getElementById('gamTasksDone');
    if(doneEl)doneEl.textContent=String(doneCount());
    const streak=document.getElementById('gamStreak');
    if(streak)streak.textContent=(state.stats.streak||1)+'d';
    renderLevel();
    renderDiscount();
    renderDaily();
    renderQuest();
    renderWheel();
    renderDashboard();
    updateTime();
    renderTasks();
    renderAchievements();
    updateExchange();
  }

  const toastQueue=[];
  let toastTimer=null;
  function showToast(){
    if(toastTimer||!toastQueue.length)return;
    const item=toastQueue.shift();
    const el=document.getElementById('gamToast');
    if(!el)return;
    const icon=document.createElement('span');
    icon.className='gam-toast-icon';
    icon.setAttribute('aria-hidden','true');
    icon.innerHTML=item.kind==='achievement'?ICONS.star:item.kind==='error'?ICONS.error:ICONS.coin;
    el.textContent='';
    el.append(icon,document.createTextNode(item.text));
    el.classList.toggle('achievement',item.kind==='achievement');
    el.classList.toggle('error',item.kind==='error');
    el.classList.add('visible');
    toastTimer=setTimeout(()=>{
      el.classList.remove('visible');
      toastTimer=null;
      setTimeout(showToast,220);
    },2600);
  }
  function queueToast(text,kind){
    toastQueue.push({text,kind});
    showToast();
  }

  const now=new Date();
  const today=new Date(now.getFullYear(),now.getMonth(),now.getDate());
  const todayKey=dateKey(now);
  if(state.stats.lastVisit){
    const raw=new Date(state.stats.lastVisit);
    if(!isNaN(raw.getTime())){
      const last=new Date(raw.getFullYear(),raw.getMonth(),raw.getDate());
      const days=Math.round((today-last)/86400000);
      if(days===1)state.stats.streak=(state.stats.streak||1)+1;
      else if(days>1)state.stats.streak=1;
      if(days>=1)state.stats.returned=true;
    }
  }else{
    state.stats.streak=1;
  }
  if(!state.stats.streak)state.stats.streak=1;
  state.stats.bestStreak=Math.max(state.stats.bestStreak||0,state.stats.streak);
  state.stats.sessionStart=now.getTime();
  if(!state.stats.firstVisit)state.stats.firstVisit=now.toISOString();
  state.stats.lastVisit=now.toISOString();

  TASKS.forEach(t=>{if(t.section)observeSection(t)});
  document.addEventListener('click',e=>{
    const t=e.target;
    if(!t||!t.closest)return;
    if(t.closest('#faq .faq-q'))award('read-faq');
    if(t.closest('#openContact,.choose-plan'))award('open-contact');
    if(t.closest('#reviewsPrev,#reviewsNext,.review-dot'))award('read-review');
    if(t.closest('#toTop'))award('back-to-top');
    if(t.closest('[data-theme-choice],[data-accent-choice],[data-bg-choice],[data-preset],[data-accent-picker],[data-bg-picker],[data-save-theme],[data-reset-appearance],#themeBtn')){
      award('try-theme');
      drawWheel();
    }
  });
  const reviewsTrack=document.getElementById('reviewsTrack');
  if(reviewsTrack)reviewsTrack.addEventListener('scroll',()=>award('read-review'),{passive:true});
  const appearance=window.KrynexTheme;
  document.querySelectorAll('[data-accent-hex],[data-bg-hex]').forEach(input=>{
    input.addEventListener('input',()=>{
      if(appearance&&appearance.parse(input.value))award('try-theme');
    });
  });
  const claim=document.getElementById('gamDailyClaim');
  if(claim)claim.addEventListener('click',()=>{
    if(state.stats.lastBonus===todayKey)return;
    state.stats.lastBonus=todayKey;
    state.coins+=DAILY_BONUS;
    state.totalEarned+=DAILY_BONUS;
    logEvent('bonus','Daily bonus',DAILY_BONUS);
    refreshAchievements();
    save();
    render();
    bumpCoins();
    floatCoins(DAILY_BONUS);
    queueToast('Daily bonus: +'+DAILY_BONUS+' coins','coins');
  });

  const questBtn=document.getElementById('gamQuestClaim');
  if(questBtn)questBtn.addEventListener('click',()=>{
    const id=questForDay(todayKey);
    if(state.stats.questClaimed===todayKey||!questDone(id))return;
    state.stats.questClaimed=todayKey;
    state.coins+=QUEST_REWARD;
    state.totalEarned+=QUEST_REWARD;
    logEvent('bonus','Daily quest',QUEST_REWARD);
    refreshAchievements();
    save();
    render();
    bumpCoins();
    floatCoins(QUEST_REWARD);
    queueToast('Daily quest complete: +'+QUEST_REWARD+' coins','coins');
  });

  const wheelCanvas=document.getElementById('wheelCanvas');
  const wheelBtn=document.getElementById('wheelSpin');
  drawWheel();
  if(wheelBtn)wheelBtn.addEventListener('click',()=>{
    if(state.stats.lastSpin===todayKey||!wheelCanvas)return;
    const index=Math.floor(Math.random()*WHEEL_PRIZES.length);
    const prize=WHEEL_PRIZES[index];
    const segment=360/WHEEL_PRIZES.length;
    const rotation=360*5+(360-(index*segment+segment/2));
    wheelBtn.disabled=true;
    wheelBtn.textContent='...';
    wheelCanvas.style.transform='rotate('+rotation+'deg)';
    let done=false;
    const finish=()=>{
      if(done)return;
      done=true;
      state.stats.lastSpin=todayKey;
      state.stats.lastPrize=prize;
      state.coins+=prize;
      state.totalEarned+=prize;
      logEvent('bonus','Lucky wheel',prize);
      const unlocked=refreshAchievements();
      save();
      render();
      bumpCoins();
      floatCoins(prize);
      celebrate();
      queueToast('Lucky wheel: +'+prize+' coins','coins');
      unlocked.forEach(a=>queueToast('Achievement unlocked: '+a.title,'achievement'));
    };
    wheelCanvas.addEventListener('transitionend',finish,{once:true});
    setTimeout(finish,4600);
  });

  async function shareSite(){
    const data={title:document.title,text:'KrynexLabs — AI automation for business',url:window.location.href.split('#')[0]};
    try{
      if(navigator.share)await navigator.share(data);
      else if(navigator.clipboard&&navigator.clipboard.writeText)await navigator.clipboard.writeText(data.url);
      else{
        const helper=document.createElement('textarea');
        helper.value=data.url;
        document.body.appendChild(helper);
        helper.select();
        document.execCommand('copy');
        helper.remove();
      }
      award('share');
    }catch(e){}
  }
  const shareBtn=document.getElementById('gamShare');
  if(shareBtn)shareBtn.addEventListener('click',shareSite);

  async function shareAchievement(id){
    const a=ACHIEVEMENTS.find(x=>x.id===id);
    if(!a||!state.achievements[id])return;
    const url=window.location.href.split('#')[0];
    const text='Achievement unlocked: "'+a.title+'" on KrynexLabs — '+a.desc+' '+url;
    try{
      if(navigator.share)await navigator.share({title:'KrynexLabs achievement',text,url});
      else if(navigator.clipboard&&navigator.clipboard.writeText)await navigator.clipboard.writeText(text);
      else{
        const helper=document.createElement('textarea');
        helper.value=text;
        document.body.appendChild(helper);
        helper.select();
        document.execCommand('copy');
        helper.remove();
      }
      if(!state.shared[id]){
        state.shared[id]=true;
        state.coins+=2;
        state.totalEarned+=2;
        logEvent('coins','Shared achievement: '+a.title,2);
        save();
        render();
        bumpCoins();
        floatCoins(2);
      }
      queueToast('Achievement shared','coins');
    }catch(e){}
  }
  const achList=document.getElementById('gamAchievements');
  if(achList)achList.addEventListener('click',e=>{
    const btn=e.target&&e.target.closest('[data-share-ach]');
    if(btn)shareAchievement(btn.dataset.shareAch);
  });
  const tasksBox=document.getElementById('gamTasks');
  if(tasksBox)tasksBox.addEventListener('click',e=>{
    if(e.target&&e.target.closest('[data-action="share"]')){e.preventDefault();shareSite();}
  });

  const KONAMI=['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
  let konami=0;
  document.addEventListener('keydown',e=>{
    const key=e.key.length===1?e.key.toLowerCase():e.key;
    konami=key===KONAMI[konami]?konami+1:(key===KONAMI[0]?1:0);
    if(konami===KONAMI.length){konami=0;unlockAchievement('secret');}
  });

  const exportBtn=document.getElementById('dashExport');
  if(exportBtn)exportBtn.addEventListener('click',()=>{
    try{
      const data={exportedAt:new Date().toISOString(),progress:state};
      const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});
      const url=URL.createObjectURL(blob);
      const link=document.createElement('a');
      link.href=url;
      link.download='krynexlabs-progress.json';
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(()=>URL.revokeObjectURL(url),1000);
      queueToast('Progress exported as JSON','coins');
    }catch(e){}
  });

  const importBtn=document.getElementById('dashImport');
  const importFile=document.getElementById('dashImportFile');
  if(importBtn&&importFile){
    importBtn.addEventListener('click',()=>importFile.click());
    importFile.addEventListener('change',async()=>{
      const file=importFile.files&&importFile.files[0];
      importFile.value='';
      if(!file)return;
      try{
        if(file.size>1024*1024)throw new Error('file too large');
        const text=typeof file.text==='function'?await file.text():await new Promise((resolve,reject)=>{
          const reader=new FileReader();
          reader.onload=()=>resolve(String(reader.result));
          reader.onerror=reject;
          reader.readAsText(file);
        });
        const data=JSON.parse(text);
        const clean=normalizeProgress(data&&data.progress?data.progress:data);
        if(!clean)throw new Error('invalid format');
        Object.keys(state).forEach(k=>{if(!(k in clean))delete state[k]});
        Object.assign(state,clean);
        save();
        render();
        bumpCoins();
        queueToast('Progress imported — welcome back!','coins');
      }catch(e){
        queueToast('Import failed — not a valid progress file','error');
      }
    });
  }

  const reset=document.getElementById('gamReset');
  if(reset)reset.addEventListener('click',()=>{
    if(!window.confirm('Reset all coins, tasks, levels and achievements?'))return;
    try{localStorage.removeItem(KEY)}catch(e){}
    window.location.reload();
  });
  refreshAchievements();
  render();
  updateTime();
  setInterval(()=>{
    TASKS.forEach(t=>{
      if(t.min&&!state.tasks[t.id]&&elapsedMin()>=t.min)award(t.id);
    });
    updateTime();
  },5000);
})();

/* ===== Project cost calculator ===== */
(function(){
  const root=document.getElementById('calculator');
  if(!root)return;
  const GAM_KEY='krynexlabs_gamification';
  const CHECK_SVG='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M5 12l4 4L19 6"/></svg>';
  const OPTIONS=[
    {id:'assistant',name:'AI assistant',desc:'Answers common questions, searches your docs.',price:99,days:4},
    {id:'workflow',name:'Workflow automation',desc:'Connects services, removes copy-paste steps.',price:149,days:6},
    {id:'leads',name:'Lead handling',desc:'Collects, sorts and routes every request.',price:129,days:5},
    {id:'slm',name:'Custom SLM ≤ 0.5B',desc:'A small model trained on your data.',price:249,days:14},
    {id:'hire',name:'Prompt engineer',desc:'Vetted specialist for your stack.',price:199,days:7},
    {id:'course',name:'Team workshop',desc:'Hands-on training, project-based.',price:149,days:5},
    {id:'care',name:'Care & support',desc:'Health checks and minor fixes, monthly.',price:49,days:2}
  ];
  const selected=new Set();
  const optionsBox=document.getElementById('calcOptions');
  const listBox=document.getElementById('calcSelected');
  const totalEl=document.getElementById('calcTotal');
  const rangeEl=document.getElementById('calcRange');
  const timeEl=document.getElementById('calcTime');
  const countEl=document.getElementById('calcCount');
  const sendBtn=document.getElementById('calcSend');
  const printBtn=document.getElementById('calcPrint');
  const printDate=document.getElementById('calcPrintDate');
  if(!optionsBox||!listBox||!totalEl||!sendBtn)return;
  if(printDate)printDate.textContent='Generated '+new Date().toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'});

  function coins(){
    try{
      const s=JSON.parse(localStorage.getItem(GAM_KEY)||'null');
      return Math.max(0,Number(s&&s.coins)||0);
    }catch(e){return 0}
  }

  function fmtDays(d){
    if(d<14)return d+' business days';
    const w=Math.round(d/7);
    return w+'\u2013'+(w+1)+' weeks';
  }

  function estimate(){
    const items=OPTIONS.filter(o=>selected.has(o.id));
    const subtotal=items.reduce((sum,o)=>sum+o.price,0);
    const bundle=items.length>=4?.15:items.length>=3?.1:items.length>=2?.05:0;
    const coin=Math.min(10,Math.floor(coins()/10))/100;
    const final=Math.round(subtotal*(1-bundle)*(1-coin));
    return {items,subtotal,bundle,coin,final};
  }

  function renderOptions(){
    optionsBox.innerHTML=OPTIONS.map(o=>
      '<button class="calc-option" type="button" data-option="'+o.id+'" aria-pressed="'+selected.has(o.id)+'">'+
      '<span class="calc-box" aria-hidden="true">'+(selected.has(o.id)?CHECK_SVG:'')+'</span>'+
      '<span class="calc-option-text"><span class="calc-option-name">'+o.name+'</span>'+
      '<span class="calc-option-desc">'+o.desc+'</span></span>'+
      '<span class="calc-option-price">€'+o.price+'</span></button>'
    ).join('');
  }

  function render(){
    renderOptions();
    const e=estimate();
    if(countEl)countEl.textContent=String(e.items.length);
    if(!e.items.length){
      totalEl.textContent='€0';
      if(rangeEl)rangeEl.textContent='Select an option';
      if(timeEl)timeEl.textContent='—';
      listBox.innerHTML='<p class="calc-empty">Nothing selected yet.</p>';
      sendBtn.disabled=true;
      if(printBtn)printBtn.disabled=true;
      return;
    }
    sendBtn.disabled=false;
    if(printBtn)printBtn.disabled=false;
    totalEl.textContent='€'+e.final;
    if(rangeEl)rangeEl.textContent='Rough range €'+Math.round(e.final*.85)+'\u2013€'+Math.round(e.final*1.15);
    const days=Math.max.apply(null,e.items.map(o=>o.days))+(e.items.length-1)*2;
    if(timeEl)timeEl.textContent='Timeline: '+fmtDays(days);
    let html=e.items.map(o=>'<div class="calc-line"><span>'+o.name+'</span><b>€'+o.price+'</b></div>').join('');
    if(e.bundle)html+='<div class="calc-line discount"><span>Multi-task discount −'+Math.round(e.bundle*100)+'%</span><b>−€'+Math.round(e.subtotal*e.bundle)+'</b></div>';
    if(e.coin)html+='<div class="calc-line discount"><span>Your site coins −'+Math.round(e.coin*100)+'%</span><b>−€'+Math.round(e.subtotal*(1-e.bundle)*e.coin)+'</b></div>';
    listBox.innerHTML=html;
  }

  optionsBox.addEventListener('click',event=>{
    const btn=event.target&&event.target.closest('[data-option]');
    if(!btn)return;
    const id=btn.dataset.option;
    if(selected.has(id))selected.delete(id);else selected.add(id);
    render();
  });

  sendBtn.addEventListener('click',()=>{
    const e=estimate();
    if(!e.items.length)return;
    openModal('Custom estimate');
    const msg=document.getElementById('message');
    if(!msg)return;
    msg.value='I would like to discuss this estimate:\n'+
      e.items.map(o=>'• '+o.name+' — €'+o.price).join('\n')+
      '\n\nSubtotal: €'+e.subtotal+
      (e.bundle?'\nMulti-task discount: −'+Math.round(e.bundle*100)+'%':'')+
      (e.coin?'\nSite coins discount: −'+Math.round(e.coin*100)+'%':'')+
      '\nEstimated budget: €'+e.final+' ('+(rangeEl?rangeEl.textContent:'')+')'+
      '\nTimeline: '+(timeEl?timeEl.textContent.replace('Timeline: ',''):'');
    setTimeout(()=>{
      msg.focus();
      msg.setSelectionRange(msg.value.length,msg.value.length);
    },100);
  });

  if(printBtn)printBtn.addEventListener('click',()=>window.print());

  if(window.IntersectionObserver){
    const observer=new IntersectionObserver(entries=>{
      if(entries.some(entry=>entry.isIntersecting))render();
    },{threshold:.3});
    observer.observe(root);
  }
  render();
})();

/* ===== Reviews carousel ===== */
(function(){
  const section=document.getElementById('reviews');
  const track=document.getElementById('reviewsTrack');
  if(!section||!track)return;
  const cards=Array.from(track.querySelectorAll('.review-card'));
  const dotsBox=document.getElementById('reviewsDots');
  const counter=document.getElementById('reviewsCount');
  const prev=document.getElementById('reviewsPrev');
  const next=document.getElementById('reviewsNext');
  if(!cards.length)return;

  let index=0;
  const step=()=>cards.length>1?cards[1].offsetLeft-cards[0].offsetLeft:track.clientWidth;

  function sync(){
    if(dotsBox)Array.from(dotsBox.children).forEach((dot,i)=>dot.setAttribute('aria-current',String(i===index)));
    if(counter)counter.textContent=String(index+1).padStart(2,'0')+' / '+String(cards.length).padStart(2,'0');
    if(prev)prev.disabled=index===0;
    if(next)next.disabled=index===cards.length-1;
  }

  function go(i){
    index=Math.max(0,Math.min(cards.length-1,i));
    track.scrollTo({left:index*step(),behavior:'smooth'});
    sync();
  }

  cards.forEach((_,i)=>{
    if(!dotsBox)return;
    const dot=document.createElement('button');
    dot.type='button';
    dot.className='review-dot';
    dot.setAttribute('aria-label','Review '+(i+1));
    dot.addEventListener('click',()=>go(i));
    dotsBox.appendChild(dot);
  });
  if(prev)prev.addEventListener('click',()=>go(index-1));
  if(next)next.addEventListener('click',()=>go(index+1));

  track.addEventListener('scroll',()=>{
    const s=step();
    if(!s)return;
    const i=Math.round(track.scrollLeft/s);
    const clamped=Math.max(0,Math.min(cards.length-1,i));
    if(clamped!==index){index=clamped;sync();}
  },{passive:true});

  section.addEventListener('keydown',e=>{
    if(e.key!=='ArrowLeft'&&e.key!=='ArrowRight')return;
    if(!section.contains(document.activeElement))return;
    e.preventDefault();
    go(index+(e.key==='ArrowRight'?1:-1));
  });

  sync();
})();

/* ===== PWA: service worker registration ===== */
(function(){
  if(!('serviceWorker' in navigator))return;
  window.addEventListener('load',()=>{
    navigator.serviceWorker.register('sw.js').catch(()=>{});
  });
})();

/* ===== Background music ===== */
(function(){
  const toggles=Array.from(document.querySelectorAll('[data-music-toggle]'));
  const sliders=Array.from(document.querySelectorAll('[data-music-volume]'));
  const valueButtons=Array.from(document.querySelectorAll('[data-music-value]'));
  const valueInputs=Array.from(document.querySelectorAll('[data-music-input]'));
  if(!toggles.length||!sliders.length)return;
  const KEY='krynexlabs_music_volume';
  const MAX_GAIN=0.35; // quiet even at 100%
  const DEFAULT_VOLUME=35;
  const audio=new Audio('assets/music.mp3');
  audio.loop=true;
  audio.preload='none';
  let volume=DEFAULT_VOLUME;
  try{
    const saved=Number(localStorage.getItem(KEY));
    if(Number.isFinite(saved)&&saved>=0&&saved<=100)volume=Math.round(saved);
  }catch(e){}
  audio.volume=(volume/100)*MAX_GAIN;

  function sync(){
    const playing=!audio.paused;
    toggles.forEach(btn=>{
      btn.setAttribute('aria-pressed',String(playing));
      btn.setAttribute('aria-label',playing?'Pause background music':'Play background music');
      const label=btn.querySelector('[data-music-label]');
      if(label)label.textContent=playing?'Playing':'Off';
    });
    sliders.forEach(slider=>{
      if(document.activeElement!==slider)slider.value=String(volume);
      slider.style.setProperty('--music-fill',volume+'%');
      const out=slider.parentElement&&slider.parentElement.querySelector('[data-music-value]');
      if(out)out.textContent=volume+'%';
    });
    valueInputs.forEach(input=>{
      if(document.activeElement!==input)input.value=String(volume);
    });
  }

  function setVolume(value){
    volume=Math.max(0,Math.min(100,Math.round(value)));
    audio.volume=(volume/100)*MAX_GAIN;
    try{localStorage.setItem(KEY,String(volume))}catch(e){}
    sync();
  }

  toggles.forEach(btn=>btn.addEventListener('click',()=>{
    if(audio.paused){
      const promise=audio.play();
      if(promise&&promise.catch)promise.catch(()=>{});
    }else{
      audio.pause();
    }
    sync();
  }));
  sliders.forEach(slider=>slider.addEventListener('input',()=>setVolume(Number(slider.value))));

  function closeEditor(input){
    const wrap=input.closest('.music-volume');
    if(!wrap)return;
    input.hidden=true;
    const btn=wrap.querySelector('[data-music-value]');
    if(btn)btn.hidden=false;
  }

  valueButtons.forEach(btn=>btn.addEventListener('click',()=>{
    const wrap=btn.closest('.music-volume');
    if(!wrap)return;
    const input=wrap.querySelector('[data-music-input]');
    if(!input)return;
    btn.hidden=true;
    input.hidden=false;
    input.value=String(volume);
    input.focus();
    input.select();
  }));

  valueInputs.forEach(input=>{
    input.addEventListener('keydown',e=>{
      if(e.key==='Enter'){e.preventDefault();input.blur();}
      if(e.key==='Escape'){e.preventDefault();e.stopPropagation();input.value=String(volume);input.blur();}
    });
    input.addEventListener('blur',()=>{
      const raw=input.value.trim();
      setVolume(raw===''?volume:Number(raw));
      closeEditor(input);
    });
  });

  audio.addEventListener('play',sync);
  audio.addEventListener('pause',sync);
  sync();
})();
