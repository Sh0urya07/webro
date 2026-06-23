/* ============================================================
   variations.js — ADDITIVE. Picks a fresh animation variant on
   every page load so the entrance feels different each refresh.
   Standalone module (loaded before main.js); modifies nothing else.
   ============================================================ */
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const rand = (a, b) => a + Math.random() * (b - a);
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

function applyVariation() {
  const body = document.body;
  if (!body) return;
  const root = document.documentElement.style;

  // 1) Random reveal direction flavor (0–5) → styled by variations.css
  body.dataset.anim = String(Math.floor(Math.random() * 6));

  // 2) Random duration + easing for this load
  root.setProperty('--reveal-dur', rand(0.6, 1.0).toFixed(2) + 's');
  root.setProperty('--reveal-ease', pick([
    'cubic-bezier(.16,1,.3,1)',
    'cubic-bezier(.22,1,.36,1)',
    'cubic-bezier(.34,1.3,.5,1)',
    'cubic-bezier(.4,0,.2,1)',
  ]));

  // 3) Random marquee speed
  root.setProperty('--mq', Math.round(rand(34, 60)) + 's');

  // 4) Shuffle the decorative background glow blobs (purely cosmetic)
  if (!reduced) {
    document.querySelectorAll('.bg-fx .blob').forEach((b) => {
      b.style.top = Math.round(rand(-20, 75)) + '%';
      b.style.left = Math.round(rand(-15, 75)) + '%';
      b.style.right = 'auto';
      b.style.transform = `scale(${rand(0.8, 1.3).toFixed(2)})`;
      b.style.animationDelay = (-rand(0, 6)).toFixed(1) + 's';
    });
  }
}

try {
  if (document.body) applyVariation();
  else document.addEventListener('DOMContentLoaded', applyVariation, { once: true });
} catch (err) {
  console.error('[WEBRO] variations failed — site continues.', err);
}
