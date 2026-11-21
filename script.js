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
  let record = saved;

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

function openModal(selected) {
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
  setTimeout(() => document.getElementById('name').focus(), 80);
}

function closeModal() {
  modal.classList.remove('open');
  document.body.style.overflow = '';
}

document.getElementById('openContact').addEventListener('click', () => openModal());
document.querySelectorAll('.choose-plan').forEach(btn => btn.addEventListener('click', () => openModal(btn.dataset.plan)));
document.getElementById('closeModal').addEventListener('click', closeModal);
modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

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
        dot.style.setProperty('--b', t.bgHex || '#10100f');
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
      }));
    }
    btn.classList.toggle('collapsed', willCollapse);
    btn.setAttribute('aria-expanded', String(!willCollapse));
    btn.setAttribute('aria-label', willCollapse ? 'Expand section' : 'Collapse section');
    if (!willCollapse) section.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
  });
});

/* ===== Gamification: achievements, site tasks, coins, discount exchange ===== */
(function(){
  const KEY = 'krynexlabs_gamification';
  const EXCHANGE_ADDRESS = 'krynexlabs@gmail.com';
  const EXCHANGE_SUBJECT = 'Coins exchange';
  const MAIN_SECTIONS = ['services','about','process','pricing','build'];
  const TASKS = [
    {id:'visit-solutions', section:'services', name:'Visit the Solutions section', coins:2},
    {id:'visit-about', section:'about', name:'Visit the About section', coins:2},
    {id:'visit-process', section:'process', name:'Visit the How we work section', coins:2},
    {id:'visit-pricing', section:'pricing', name:'Visit the Pricing section', coins:2},
    {id:'visit-build', section:'build', name:'Visit the Build section', coins:2},
    {id:'read-faq', name:'Read the FAQ questions', coins:2},
    {id:'open-contact', name:'Open the contact form', coins:2},
    {id:'time-10m', min:10, name:'Spend 10 minutes on the site', coins:1},
    {id:'time-20m', min:20, name:'Spend 20 minutes on the site', coins:1},
    {id:'time-30m', min:30, name:'Spend 30 minutes on the site', coins:1}
  ];
  const ACHIEVEMENTS = [
    {id:'first-visit', title:'First visit', desc:'You opened the site.'},
    {id:'explorer', title:'Explorer', desc:'Visited all the main sections.'},
    {id:'faq-reader', title:'FAQ fan', desc:'Read the FAQ questions.'},
    {id:'on-site-10m', title:'10 minutes on the site', desc:'Spent 10 minutes browsing.'},
    {id:'task-master', title:'Task master', desc:'Completed 5 site tasks.'},
    {id:'return-visitor', title:'Welcome back', desc:'Came back to the site.'}
  ];

  function escHtml(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;')}

  function getState(){
    let saved=null;
    try{saved=JSON.parse(localStorage.getItem(KEY)||'null')}catch(e){}
    return Object.assign({coins:0,tasks:{},visited:{},achievements:{},stats:{}},saved||{});
  }

  const state=getState();

  function save(){
    try{localStorage.setItem(KEY,JSON.stringify({coins:state.coins,tasks:state.tasks,visited:state.visited,achievements:state.achievements,stats:state.stats}))}catch(e){}
  }

  function elapsedMin(){return(Date.now()-state.stats.sessionStart)/60000}

  function formatMin(m){
    const t=Math.max(0,Math.floor(m));
    const h=Math.floor(t/60);
    return h?h+'h '+(t%60)+'m':t+'m';
  }

  function doneCount(){return TASKS.filter(t=>state.tasks[t.id]).length}

  function checkAchievement(a){
    switch(a.id){
      case 'first-visit':return!!state.stats.firstVisit;
      case 'explorer':return MAIN_SECTIONS.every(k=>state.visited[k]);
      case 'faq-reader':return!!state.tasks['read-faq'];
      case 'on-site-10m':return elapsedMin()>=10;
      case 'task-master':return doneCount()>=5;
      case 'return-visitor':return!!state.stats.returned;
      default:return false
    }
  }

  function refreshAchievements(){
    let changed=false;
    ACHIEVEMENTS.forEach(a=>{
      if(!state.achievements[a.id]&&checkAchievement(a)){state.achievements[a.id]=true;changed=true}
    });
    if(changed)save();
  }

  function award(id){
    const task=TASKS.find(t=>t.id===id);
    if(!task||state.tasks[task.id])return;
    state.tasks[task.id]=true;
    state.coins+=task.coins;
    refreshAchievements();
    save();
    render();
    toast('Earned +'+task.coins+' coins: '+task.name);
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
    const list=document.getElementById('gamTasks');
    if(!list)return;
    let html='';
    TASKS.forEach(t=>{
      const done=!!state.tasks[t.id];
      const anchor=t.section||(t.id==='read-faq'?'faq':'');
      const open=anchor?'<a class="gam-task-open" href="#'+anchor+'">Go ↓</a>':'';
      html+='<article class="gam-task'+(done?' is-done':'')+'">'+
        '<div class="gam-task-row"><span class="gam-task-name">'+escHtml(t.name)+'</span>'+
        '<span class="gam-task-coin">'+(done?'✓ ':'')+'+'+t.coins+'</span>'+open+'</div></article>';
    });
    list.innerHTML=html;
  }

  function renderAchievements(){
    const list=document.getElementById('gamAchievements');
    if(!list)return;
    let html='';
    ACHIEVEMENTS.forEach(a=>{
      const earned=!!state.achievements[a.id];
      html+='<article class="gam-ach'+(earned?' is-earned':'')+'">'+
        '<span class="gam-ach-mark">'+(earned?'✓':'')+'</span>'+
        '<div class="gam-ach-text"><span class="gam-ach-title">'+escHtml(a.title)+'</span>'+
        '<span class="gam-ach-desc">'+escHtml(a.desc)+'</span></div></article>';
    });
    list.innerHTML=html;
  }

  function updateExchange(){
    const mail=document.getElementById('gamExchangeMail');
    if(!mail)return;
    mail.href='mailto:'+EXCHANGE_ADDRESS+'?subject='+encodeURIComponent(EXCHANGE_SUBJECT)+
      '&body='+encodeURIComponent('Hi! I want to exchange '+state.coins+' coins for a discount.\n\nCurrent balance: '+state.coins+' coins.');
  }

  function updateTime(){
    const el=document.getElementById('gamOnSite');
    if(el)el.textContent=formatMin(elapsedMin());
  }

  function render(){
    const coins=document.getElementById('gamCoins');
    if(coins)coins.textContent=String(state.coins);
    const doneEl=document.getElementById('gamTasksDone');
    if(doneEl)doneEl.textContent=String(doneCount());
    updateTime();
    renderTasks();
    renderAchievements();
    updateExchange();
  }

  let toastTimer=null;
  function toast(text){
    const el=document.getElementById('gamToast');
    if(!el)return;
    el.textContent=text;
    el.classList.add('visible');
    if(toastTimer)clearTimeout(toastTimer);
    toastTimer=setTimeout(()=>el.classList.remove('visible'),2600);
  }

  const now=new Date();
  state.stats.sessionStart=now.getTime();
  if(!state.stats.firstVisit)state.stats.firstVisit=now.toISOString();
  if(state.stats.lastVisit&&new Date(state.stats.lastVisit).toISOString().slice(0,10)!==now.toISOString().slice(0,10))state.stats.returned=true;
  state.stats.lastVisit=now.toISOString();

  TASKS.forEach(t=>{if(t.section)observeSection(t)});
  document.addEventListener('click',e=>{
    const t=e.target;
    if(t&&t.closest&&t.closest('#faq .faq-q'))award('read-faq');
    if(t&&t.closest&&t.closest('#openContact,.choose-plan'))award('open-contact');
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
      slider.style.setProperty('--fill',volume+'%');
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
      if(e.key==='Escape'){input.value=String(volume);input.blur();}
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
