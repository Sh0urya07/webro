/* ============================================================
   reveal.js — scroll-in reveals + animated number counters.
   Pure IntersectionObserver (no dependency), reduced-motion safe.
   ============================================================ */
import { $$, prefersReducedMotion } from './utils.js';

export function initReveal() {
  const reduced = prefersReducedMotion();

  // Reveal-on-scroll
  const reveals = $$('.reveal');
  if (reduced) {
    reveals.forEach((el) => el.classList.add('in'));
  } else if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12 });
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add('in'));
  }

  // Counters
  const counters = $$('[data-count]');
  const runCount = (el) => {
    const target = +el.dataset.count;
    const suf = el.dataset.suffix || '';
    if (reduced) { el.textContent = target + suf; return; }
    let n = 0;
    const step = Math.max(1, Math.round(target / 45));
    const t = setInterval(() => {
      n += step;
      if (n >= target) { n = target; clearInterval(t); }
      el.textContent = n + suf;
    }, 26);
  };

  if ('IntersectionObserver' in window && !reduced) {
    const cio = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { runCount(e.target); cio.unobserve(e.target); }
      });
    }, { threshold: 0.5 });
    counters.forEach((c) => cio.observe(c));
  } else {
    counters.forEach(runCount);
  }
}
