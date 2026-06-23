/* ============================================================
   tilt.js — magnetic 3D tilt on .tilt cards (desktop only).
   Disabled on touch / reduced-motion for comfort + performance.
   ============================================================ */
import { $$ } from './utils.js';

export function initTilt(quality) {
  if (quality.reduced || quality.mobile) return;
  if (!window.matchMedia('(min-width:981px)').matches) return;

  // Bind once per card (flag set inside bind so nothing double-binds).
  const bind = (card) => {
    if (card.dataset.tilt) return;
    card.dataset.tilt = '1';
    card.addEventListener('mousemove', (e) => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      card.style.transform =
        `perspective(900px) rotateY(${px * 4.5}deg) rotateX(${-py * 4.5}deg) translateY(-4px)`;
    });
    card.addEventListener('mouseleave', () => { card.style.transform = ''; });
  };

  // Cards present now + a retry pass for any injected by other modules.
  $$('.tilt').forEach(bind);
  setTimeout(() => $$('.tilt').forEach(bind), 600);
}
