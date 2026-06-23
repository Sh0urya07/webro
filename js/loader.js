/* ============================================================
   loader.js — premium intro sequence + progress.
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
    // Fake-but-smooth progress that always completes on window load.
    const tick = setInterval(() => {
      p = Math.min(96, p + Math.random() * 14);
      if (fill) fill.style.width = p + '%';
      if (pct) pct.textContent = Math.round(p);
    }, 180);

    const finish = () => {
      clearInterval(tick);
      if (fill) fill.style.width = '100%';
      if (pct) pct.textContent = '100';
      setTimeout(() => {
        loader.classList.add('hide');
        // Let other modules start once the curtain begins lifting.
        resolve();
      }, 500);
    };

    if (document.readyState === 'complete') {
      setTimeout(finish, 1400);
    } else {
      window.addEventListener('load', () => setTimeout(finish, 1200), { once: true });
      // Hard safety net so the loader can never get stuck.
      setTimeout(finish, 6000);
    }
  });
}
