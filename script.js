const menuBtn = document.getElementById('menuBtn'), navLinks = document.getElementById('navLinks');

menuBtn.addEventListener('click', () => {
  const open = navLinks.classList.toggle('open');
  menuBtn.setAttribute('aria-expanded', String(open));
  menuBtn.classList.toggle('active', open);
  menuBtn.textContent = open ? '×' : '☰';
  document.body.classList.toggle('menu-open', open);
});

navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
  navLinks.classList.remove('open');
  menuBtn.setAttribute('aria-expanded', 'false');
  menuBtn.classList.remove('active');
  menuBtn.textContent = '☰';
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