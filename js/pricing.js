/* ============================================================
   pricing.js — renders the three pricing plans.
   ============================================================ */
import { $ } from './utils.js';

const CHECK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12l4 4 10-10"/></svg>';

const PLANS = [
  { name: 'Starter', price: '$299', per: 'one-time', feat: false,
    desc: 'A clean, fast landing site to get you online.',
    items: ['Up to 5 sections', 'Responsive design', 'Contact form', 'Basic SEO', '7-day delivery'] },
  { name: 'Business', price: '$699', per: 'one-time', feat: true,
    desc: 'A complete multi-page site with light 3D accents.',
    items: ['Up to 8 pages', '3D hero / accents', 'CMS or blog', 'Advanced SEO', 'Analytics setup', '2 weeks delivery'] },
  { name: 'Premium 3D', price: '$1,499+', per: 'project', feat: false,
    desc: 'A full cinematic, interactive 3D experience.',
    items: ['Custom 3D experience', 'Scroll storytelling', 'Interactive product', 'Performance tuning', 'Priority support'] },
];

export function initPricing() {
  const grid = $('#pricingGrid');
  if (!grid) return;
  grid.innerHTML = PLANS.map((p) => `
    <article class="plan glass reveal ${p.feat ? 'feat-plan' : ''}">
      ${p.feat ? '<span class="ribbon">Most popular</span>' : ''}
      <h3>${p.name}</h3>
      <div class="price">${p.price} <small>/ ${p.per}</small></div>
      <p class="desc">${p.desc}</p>
      <ul>${p.items.map((i) => `<li>${CHECK} ${i}</li>`).join('')}</ul>
      <a href="#contact" class="btn ${p.feat ? 'btn-primary' : 'btn-ghost'}">Get started</a>
    </article>`).join('');
}
