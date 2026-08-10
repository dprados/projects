// Lectu landing — tiny progressive enhancement (no dependencies).

/* ─────────────────────────  i18n  ───────────────────────── */
const I18N = window.LECTU_I18N || {};
const SUPPORTED = ['es', 'en'];
const STORAGE_KEY = 'lectu-lang';

// Pick a language: saved choice → device language → Spanish.
function pickLang() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved && SUPPORTED.includes(saved)) return saved;
  const nav = (navigator.language || navigator.userLanguage || 'es').toLowerCase();
  return nav.startsWith('en') ? 'en' : 'es';
}

// Build the differentiators marquee (two identical halves for a seamless loop).
function renderMarquee(tokens) {
  const track = document.getElementById('marqueeTrack');
  if (!track || !Array.isArray(tokens)) return;
  const half = tokens.map((t) => `<span>${t}</span><i>✦</i>`).join('');
  track.innerHTML = half + half;
}

// Apply a language to the whole document.
function applyLang(lang) {
  const dict = I18N[lang];
  if (!dict) return;

  document.documentElement.lang = lang;
  if (dict['meta.title']) document.title = dict['meta.title'];

  // textContent
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const v = dict[el.getAttribute('data-i18n')];
    if (v != null) el.textContent = v;
  });
  // innerHTML (strings that carry markup)
  document.querySelectorAll('[data-i18n-html]').forEach((el) => {
    const v = dict[el.getAttribute('data-i18n-html')];
    if (v != null) el.innerHTML = v;
  });
  // alt attributes
  document.querySelectorAll('[data-i18n-alt]').forEach((el) => {
    const v = dict[el.getAttribute('data-i18n-alt')];
    if (v != null) el.setAttribute('alt', v);
  });
  // src attributes (e.g. the localized App Store badge)
  document.querySelectorAll('[data-i18n-src]').forEach((el) => {
    const v = dict[el.getAttribute('data-i18n-src')];
    if (v != null) el.setAttribute('src', v);
  });
  // aria-label attributes
  document.querySelectorAll('[data-i18n-aria]').forEach((el) => {
    const v = dict[el.getAttribute('data-i18n-aria')];
    if (v != null) el.setAttribute('aria-label', v);
  });
  // meta description
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc && dict['meta.description']) metaDesc.setAttribute('content', dict['meta.description']);

  renderMarquee(dict['marquee']);

  // Reflect the active language on the toggle.
  document.querySelectorAll('.lang__btn').forEach((btn) => {
    const active = btn.dataset.lang === lang;
    btn.classList.toggle('is-active', active);
    btn.setAttribute('aria-pressed', String(active));
  });
}

let currentLang = pickLang();
applyLang(currentLang);

// Language toggle.
document.querySelectorAll('.lang__btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    const lang = btn.dataset.lang;
    if (lang === currentLang || !SUPPORTED.includes(lang)) return;
    currentLang = lang;
    localStorage.setItem(STORAGE_KEY, lang);
    applyLang(lang);
  });
});

/* ─────────────────────────  UI  ───────────────────────── */

// Current year in the footer.
document.getElementById('year').textContent = new Date().getFullYear();

// Sticky nav: add a hairline once the page scrolls.
const nav = document.getElementById('nav');
const onScroll = () => nav.classList.toggle('is-scrolled', window.scrollY > 8);
onScroll();
window.addEventListener('scroll', onScroll, { passive: true });

// Mobile menu.
const burger = document.getElementById('burger');
burger.addEventListener('click', () => {
  const open = nav.classList.toggle('is-open');
  burger.setAttribute('aria-expanded', String(open));
});
// Close the menu after tapping a link.
nav.querySelectorAll('.nav__links a').forEach((a) =>
  a.addEventListener('click', () => {
    nav.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
  })
);

// Cover Flow demo video: only autoplay when motion is allowed. Under
// prefers-reduced-motion, keep the static poster (no autoplay, no fetch).
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
document.querySelectorAll('.coverflow-demo__video').forEach((v) => {
  if (reduceMotion) {
    v.removeAttribute('autoplay');
    v.pause();
  } else {
    // Load + play once it scrolls near view (preload="none" keeps it cheap until then).
    v.preload = 'auto';
    const tryPlay = () => v.play().catch(() => {});
    if ('IntersectionObserver' in window) {
      const vo = new IntersectionObserver((entries) => {
        entries.forEach((e) => { if (e.isIntersecting) { tryPlay(); vo.unobserve(e.target); } });
      }, { threshold: 0.25 });
      vo.observe(v);
    } else {
      tryPlay();
    }
  }
});

// Reveal-on-scroll (respects reduced motion — CSS disables the transition there).
const reveals = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('is-in');
          io.unobserve(e.target);
        }
      });
    },
    { rootMargin: '0px 0px -10% 0px', threshold: 0.12 }
  );
  reveals.forEach((el) => io.observe(el));
} else {
  reveals.forEach((el) => el.classList.add('is-in'));
}
