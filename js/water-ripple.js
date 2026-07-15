/* ============================================================
   water-ripple.js — ADDITIVE. Liquid click/tap ripple for buttons.
   Isolated module: one delegated listener, no dependencies beyond
   the reduced-motion helper. Does nothing if the user prefers
   reduced motion. Pairs with the .wf-ripple rules in water-flow.css.
   ============================================================ */
import { prefersReducedMotion } from './utils.js';

const SELECTOR = '.btn, .filters button, .chat-quick button';

export function initWaterRipple() {
  if (prefersReducedMotion()) return;

  document.addEventListener('pointerdown', (e) => {
    const btn = e.target.closest(SELECTOR);
    if (!btn) return;

    const rect = btn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 2;

    const span = document.createElement('span');
    span.className = 'wf-ripple';
    span.style.width = span.style.height = size + 'px';
    span.style.left = (e.clientX - rect.left) + 'px';
    span.style.top = (e.clientY - rect.top) + 'px';
    span.addEventListener('animationend', () => span.remove(), { once: true });

    btn.appendChild(span);
  }, { passive: true });
}
