/* ============================================================
   testimonials.js — auto-rotating quote slider with dots.
   Pauses on hover/focus; cleans its own interval.
   ============================================================ */
import { $, $$, prefersReducedMotion } from './utils.js';

const ITEMS = [
  { q: 'WEBRO turned our boring site into an experience people actually talk about. Bookings doubled.', who: 'Aarav M.', role: 'Founder, Helix', av: 'A' },
  { q: 'The 3D product page is unreal — clients think we spent 10x what we did. Worth every rupee.', who: 'Sara K.', role: 'CMO, Verde Market', av: 'S' },
  { q: 'Fast, communicative, and genuinely talented. The smoothest web project we have ever run.', who: 'David R.', role: 'Director, Northwind', av: 'D' },
];

export function initTestimonials() {
  const root = $('#tslider');
  if (!root) return;

  root.innerHTML = `
    ${ITEMS.map((t, i) => `
      <figure class="tcard ${i === 0 ? 'on' : ''}">
        <div class="stars">★★★★★</div>
        <blockquote><q>${t.q}</q></blockquote>
        <figcaption class="who"><span class="av">${t.av}</span><span><b>${t.who}</b><span>${t.role}</span></span></figcaption>
      </figure>`).join('')}
    <div class="tdots">${ITEMS.map((_, i) => `<button aria-label="Show testimonial ${i + 1}" class="${i === 0 ? 'on' : ''}"></button>`).join('')}</div>
  `;

  const cards = $$('.tcard', root);
  const dots = $$('.tdots button', root);
  let i = 0, timer = null;

  const show = (n) => {
    i = (n + cards.length) % cards.length;
    cards.forEach((c, j) => c.classList.toggle('on', j === i));
    dots.forEach((d, j) => d.classList.toggle('on', j === i));
  };
  dots.forEach((d, n) => d.addEventListener('click', () => { show(n); restart(); }));

  const start = () => { if (!prefersReducedMotion()) timer = setInterval(() => show(i + 1), 5500); };
  const stop = () => { if (timer) clearInterval(timer); };
  const restart = () => { stop(); start(); };

  root.addEventListener('mouseenter', stop);
  root.addEventListener('mouseleave', start);
  root.addEventListener('focusin', stop);
  root.addEventListener('focusout', start);
  start();
}
