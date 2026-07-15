/* ============================================================
   reveal.js — scroll-in reveals + animated number counters.
   Pure IntersectionObserver (no dependency), reduced-motion safe.

   IMPORTANT: some sections inject their `.reveal` cards AFTER this
   module runs (services, pricing, …). Those new elements must be
   picked up too, so the observer is kept and `rescanReveal()` is
   exported + called again once all content modules have rendered.
   ============================================================ */
import { $$, prefersReducedMotion } from './utils.js';

let io = null;
let cio = null;
const reduced = () => prefersReducedMotion();

function observeReveal(el) {
  if (el.dataset.revealBound) return;
  el.dataset.revealBound = '1';
  if (reduced() || !io) { el.classList.add('in'); return; }
  io.observe(el);
}

function runCount(el) {
  const target = +el.dataset.count;
  const suf = el.dataset.suffix || '';
  if (reduced()) { el.textContent = target + suf; return; }
  let n = 0;
  const step = Math.max(1, Math.round(target / 45));
  const t = setInterval(() => {
    n += step;
    if (n >= target) { n = target; clearInterval(t); }
    el.textContent = n + suf;
  }, 26);
}

function observeCount(el) {
  if (el.dataset.countBound) return;
  el.dataset.countBound = '1';
  if (reduced() || !cio) { runCount(el); return; }
  cio.observe(el);
}

export function initReveal() {
  if ('IntersectionObserver' in window && !reduced()) {
    io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12 });

    cio = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { runCount(e.target); cio.unobserve(e.target); }
      });
    }, { threshold: 0.5 });
  }

  $$('.reveal').forEach(observeReveal);
  $$('[data-count]').forEach(observeCount);
}

/** Re-scan the DOM for reveal/counter elements injected after init. */
export function rescanReveal() {
  $$('.reveal').forEach(observeReveal);
  $$('[data-count]').forEach(observeCount);
}
