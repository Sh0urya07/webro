/* ============================================================
   loader.js — intro loader + progress.

   Lifts as soon as the DOM is interactive (NOT the full window
   `load` event) so a slow CDN resource (GSAP / Lenis / three.js /
   fonts) can never leave the full-screen loader stuck over the
   page — which on mobile looks like "the site doesn't work / won't
   scroll". A hard 2.5s cap guarantees it always lifts.

   Resolves when the loader is dismissed so scenes can kick in.
   ============================================================ */
import { $ } from './utils.js';

export function initLoader() {
  const loader = $('#loader');
  if (!loader) return Promise.resolve();

  const fill = $('#loadFill');
  const pct = $('#loadPct');
  let p = 0;

  return new Promise((resolve) => {
    const tick = setInterval(() => {
      p = Math.min(96, p + Math.random() * 18);
      if (fill) fill.style.width = p + '%';
      if (pct) pct.textContent = Math.round(p);
    }, 140);

    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      clearInterval(tick);
      if (fill) fill.style.width = '100%';
      if (pct) pct.textContent = '100';
      setTimeout(() => { loader.classList.add('hide'); resolve(); }, 300);
    };

    // Lift on DOM-ready (content is present) — don't block on slow network.
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
      setTimeout(finish, 500);
    } else {
      document.addEventListener('DOMContentLoaded', () => setTimeout(finish, 500), { once: true });
    }
    // Hard safety cap — the loader can NEVER stay up longer than this.
    setTimeout(finish, 2500);
  });
}
