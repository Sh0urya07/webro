/* ============================================================
   motion.js — the "make it a motion site" controller.

   Pure, dependency-light (no libraries required; uses GSAP
   ScrollTrigger only if it happens to be present for parallax).
   Everything is CSP-safe (self-hosted) and fully reduced-motion
   aware: when the user asks their OS for reduced motion, we skip
   splitting / magnetics / parallax and simply show everything.

   Responsibilities:
     • split target text into animated word/char spans (SEO/A11y safe)
     • observe [data-reveal] / [data-stagger] / split text → animate in
     • top scroll-progress bar
     • magnetic buttons + hero pointer spotlight
     • light scroll parallax
     • loader hand-off (adds body.m-ready → hero entrance, no flash)
   ============================================================ */
import { $, $$, prefersReducedMotion } from './utils.js';

const reduced = () => prefersReducedMotion();

/* ---------- text splitting (preserves inline tags like <em>) ---------- */
function splitEl(el, mode /* 'words' | 'chars' */) {
  if (el.dataset.mSplit) return;
  el.dataset.mSplit = '1';

  // Keep the natural reading for assistive tech + search engines.
  const original = el.textContent.replace(/\s+/g, ' ').trim();
  el.setAttribute('aria-label', original);

  let i = 0;
  const frag = (txt, isChar) => {
    const out = document.createDocumentFragment();
    if (isChar) {
      for (const ch of txt) {
        const s = document.createElement('span');
        s.className = 'm-char';
        s.style.setProperty('--i', i++);
        s.setAttribute('aria-hidden', 'true');
        s.textContent = ch === ' ' ? ' ' : ch;
        out.appendChild(s);
      }
    } else {
      // split on spaces but KEEP the trailing space inside the word span
      txt.split(/(\s+)/).forEach((part) => {
        if (part === '') return;
        if (/^\s+$/.test(part)) { out.appendChild(document.createTextNode(part)); return; }
        const s = document.createElement('span');
        s.className = 'm-word';
        s.style.setProperty('--i', i++);
        s.setAttribute('aria-hidden', 'true');
        s.textContent = part;
        out.appendChild(s);
      });
    }
    return out;
  };

  // Walk children so inline elements (e.g. <em>Worlds</em>) survive.
  const walk = (node) => {
    const kids = Array.from(node.childNodes);
    kids.forEach((child) => {
      if (child.nodeType === Node.TEXT_NODE) {
        if (!child.textContent.trim() && child.textContent.indexOf('\n') > -1) return;
        node.replaceChild(frag(child.textContent, mode === 'chars'), child);
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        if (child.tagName === 'BR') return;
        // Emphasis wrappers (e.g. <em>Worlds</em>) carry a gradient text-clip
        // that only works when the element stays intact — so animate the whole
        // element as ONE word unit instead of splitting its inner glyphs.
        if (/^(EM|STRONG|B|I|MARK|SPAN)$/.test(child.tagName)) {
          child.classList.add('m-word');
          child.style.setProperty('--i', i++);
          child.setAttribute('aria-hidden', 'true');
          return;
        }
        child.setAttribute('aria-hidden', 'true');
        walk(child);
      }
    });
  };
  walk(el);

  el.classList.add('m-split', 'm-anim');
  if (mode === 'chars') el.classList.add('m-chars');
}

/* ---------- one shared IntersectionObserver → adds .m-in ---------- */
function makeInObserver() {
  return new IntersectionObserver((entries, obs) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const el = e.target;
      // stagger children (grids/lists)
      if (el.hasAttribute('data-stagger')) {
        const step = parseFloat(el.dataset.stagger) || 0.08;
        Array.from(el.children).forEach((c, idx) => {
          c.style.transitionDelay = (idx * step) + 's';
        });
      }
      el.classList.add('m-in');
      obs.unobserve(el);
    });
  }, { threshold: 0.18, rootMargin: '0px 0px -8% 0px' });
}

/* ---------- scroll progress bar ---------- */
function initProgress() {
  const bar = document.createElement('div');
  bar.className = 'scroll-progress';
  bar.setAttribute('aria-hidden', 'true');
  document.body.appendChild(bar);
  let raf = 0;
  const update = () => {
    raf = 0;
    const h = document.documentElement.scrollHeight - window.innerHeight;
    const p = h > 0 ? (window.scrollY / h) * 100 : 0;
    bar.style.width = p + '%';
  };
  const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  update();
}

/* ---------- cascade stagger for existing .reveal grids ---------- */
function staggerGrids() {
  ['#svcGrid', '#pricingGrid', '#whyList', '.stats', '.vv'].forEach((sel) => {
    const c = $(sel);
    if (!c) return;
    Array.from(c.children).forEach((ch, i) => {
      ch.style.transitionDelay = (i * 0.08) + 's';
    });
  });
}

/* ---------- magnetic buttons ---------- */
function initMagnetic() {
  if (!window.matchMedia('(hover:hover) and (pointer:fine)').matches) return;
  // Opt-in via class, plus the highest-intent CTAs automatically.
  const targets = new Set([
    ...$$('.magnetic'),
    ...$$('.hero .btn'),
    ...$$('.cta-banner .btn'),
  ]);
  targets.forEach((el) => {
    if (el.dataset.magBound) return;
    el.dataset.magBound = '1';
    el.classList.add('magnetic');
    const strength = parseFloat(el.dataset.magnetic) || 0.35;
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      const x = e.clientX - (r.left + r.width / 2);
      const y = e.clientY - (r.top + r.height / 2);
      el.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
    });
    el.addEventListener('pointerleave', () => { el.style.transform = ''; });
  });
}

/* ---------- hero pointer spotlight ---------- */
function initSpotlight() {
  if (!window.matchMedia('(hover:hover) and (pointer:fine)').matches) return;
  const hero = $('.hero');
  if (!hero) return;
  const spot = document.createElement('div');
  spot.className = 'm-spotlight';
  spot.setAttribute('aria-hidden', 'true');
  hero.appendChild(spot);
  hero.addEventListener('pointermove', (e) => {
    const r = hero.getBoundingClientRect();
    spot.style.setProperty('--mx', ((e.clientX - r.left) / r.width) * 100 + '%');
    spot.style.setProperty('--my', ((e.clientY - r.top) / r.height) * 100 + '%');
  });
}

/* ---------- light parallax (ScrollTrigger if present, else scroll) ---------- */
function initParallax() {
  const els = $$('[data-parallax]');
  if (!els.length) return;
  if (window.gsap && window.ScrollTrigger) {
    els.forEach((el) => {
      const speed = parseFloat(el.dataset.parallax) || 0.2;
      window.gsap.to(el, {
        yPercent: -speed * 100,
        ease: 'none',
        scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true },
      });
    });
    return;
  }
  // fallback: rAF scroll transform
  let raf = 0;
  const update = () => {
    raf = 0;
    const vh = window.innerHeight;
    els.forEach((el) => {
      const r = el.getBoundingClientRect();
      const speed = parseFloat(el.dataset.parallax) || 0.2;
      const progress = (r.top + r.height / 2 - vh / 2) / vh; // -1..1-ish
      el.style.transform = `translateY(${-progress * speed * 100}px)`;
    });
  };
  window.addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(update); }, { passive: true });
  update();
}

/* ---------- loader hand-off: add body.m-ready when curtain lifts ---------- */
function initReadyHandoff() {
  const loader = $('#loader');
  const ready = () => {
    document.body.classList.add('m-ready');
    // Animate hero text exactly as the curtain lifts so it never
    // plays behind the loader (and never flashes empty).
    $$('.hero .m-anim').forEach((el) => el.classList.add('m-in'));
  };
  if (!loader) { ready(); return; }
  if (loader.classList.contains('hide')) { ready(); return; }
  const mo = new MutationObserver(() => {
    if (loader.classList.contains('hide')) { ready(); mo.disconnect(); }
  });
  mo.observe(loader, { attributes: true, attributeFilter: ['class'] });
  // safety net
  setTimeout(ready, 5000);
}

/* ---------- public entry ---------- */
export function initMotion() {
  initReadyHandoff();
  initProgress();

  if (reduced()) {
    // Reduced-motion: everything visible, no splitting/magnetics/parallax.
    $$('[data-reveal],[data-stagger]').forEach((el) => el.classList.add('m-in'));
    return;
  }

  // 1) split text targets
  $$('.hero h1, .sc-step h2, .sec-head h2, .cta-banner h2, .contact h2, .about h2, .why h2')
    .forEach((el) => splitEl(el, 'words'));
  $$('.hero h1').forEach((el) => el.classList.add('m-blur'));
  $$('.eyebrow').forEach((el) => splitEl(el, 'chars'));
  $$('.hero .sub').forEach((el) => splitEl(el, 'words'));

  // 2) observe everything that animates in (hero text is handled by the
  //    loader hand-off so it plays after the curtain lifts, not behind it)
  const io = makeInObserver();
  $$('.m-anim').forEach((el) => { if (!el.closest('.hero')) io.observe(el); });
  $$('[data-reveal]').forEach((el) => io.observe(el));
  $$('[data-stagger]').forEach((el) => io.observe(el));

  // 3) enhancements
  staggerGrids();
  initMagnetic();
  initSpotlight();
  initParallax();
}

/* Re-scan after late-injected content (services/pricing/portfolio cards). */
export function rescanMotion() {
  if (reduced()) {
    $$('[data-reveal],[data-stagger]').forEach((el) => el.classList.add('m-in'));
    return;
  }
  const io = makeInObserver();
  $$('.sec-head h2:not([data-m-split])').forEach((el) => splitEl(el, 'words'));
  $$('.eyebrow:not([data-m-split])').forEach((el) => splitEl(el, 'chars'));
  $$('.m-anim:not(.m-in)').forEach((el) => io.observe(el));
  $$('[data-reveal]:not(.m-in)').forEach((el) => io.observe(el));
  $$('[data-stagger]:not(.m-in)').forEach((el) => io.observe(el));
  initMagnetic();
}
