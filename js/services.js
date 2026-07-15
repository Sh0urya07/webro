/* ============================================================
   services.js — renders the Services grid + the "Why WEBRO" list.
   Data-driven; all markup is from trusted in-file constants.
   ============================================================ */
import { $ } from './utils.js';

const CHECK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12l4 4 10-10"/></svg>';
const ARROW = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';

const SERVICES = [
  { icon: '<path d="M3 5h18v14H3z"/><path d="M3 9h18M8 13l2 2-2 2M13 17h3"/>', title: '3D / WebGL Experiences',
    desc: 'Cinematic, interactive 3D worlds rendered live in the browser.',
    feats: ['Three.js & React Three Fiber', 'Scroll-driven storytelling', '60fps, mobile-optimized'] },
  { icon: '<path d="M4 5h16v11H4z"/><path d="M9 20h6M12 16v4"/>', title: 'Website Development',
    desc: 'Custom, lightning-fast, modern sites built to convert and rank.',
    feats: ['Next.js & React builds', '90+ PageSpeed scores', 'Fully responsive'] },
  { icon: '<circle cx="12" cy="12" r="9"/><path d="M12 3a9 9 0 000 18M3 12h18"/>', title: 'UI/UX & Logo Design',
    desc: 'Figma-based interfaces and brand identities people remember.',
    feats: ['Brand identity systems', 'Logo & style guides', 'Interactive prototypes'] },
  { icon: '<path d="M3 4h2l2.4 12.2a2 2 0 002 1.6h7.7a2 2 0 002-1.6L21 7H7"/><circle cx="9" cy="20" r="1.3"/><circle cx="18" cy="20" r="1.3"/>', title: 'E-commerce Stores',
    desc: 'Shopify, WooCommerce & custom stores that actually sell.',
    feats: ['Payment integrations', 'Inventory & orders', 'Conversion-optimized'] },
  { icon: '<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>', title: 'SEO & Digital Marketing',
    desc: 'Rank on Google, grow traffic, and dominate your local market.',
    feats: ['Technical & local SEO', 'Google Business setup', 'Performance reporting'] },
  { icon: '<path d="M12 3v3M12 18v3M3 12h3M18 12h3M6 6l2 2M16 16l2 2M18 6l-2 2M8 16l-2 2"/><circle cx="12" cy="12" r="3.2"/>', title: 'AI Automation',
    desc: 'Chatbots, lead capture & workflows that work while you sleep.',
    feats: ['AI chat assistants', 'Auto lead follow-up', 'Smart integrations'] },
];

const WHY = [
  { icon: '<path d="M13 2L3 14h7l-1 8 10-12h-7z"/>', title: 'Fast turnarounds', text: 'Most sites live in 7–14 days without cutting corners on quality.' },
  { icon: '<path d="M12 2l8 4v6c0 5-3.5 8-8 10-4.5-2-8-5-8-10V6z"/>', title: 'Built to last', text: 'Clean, maintainable, secure code with performance baked in.' },
  { icon: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/>', title: 'Real support', text: 'We stay with you past launch — updates, fixes and guidance.' },
  { icon: '<path d="M3 12h4l3 8 4-16 3 8h4"/>', title: 'Results-driven', text: 'Every decision serves your conversions, not just aesthetics.' },
];

export function initServices() {
  const grid = $('#svcGrid');
  if (grid) {
    grid.innerHTML = SERVICES.map((s) => `
      <article class="svc glass tilt reveal">
        <div class="ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">${s.icon}</svg></div>
        <h3>${s.title}</h3>
        <p>${s.desc}</p>
        <ul class="feat">${s.feats.map((f) => `<li>${CHECK} ${f}</li>`).join('')}</ul>
        <a href="#contact" class="svc-link">Start a project ${ARROW}</a>
      </article>`).join('');
  }

  const why = $('#whyList');
  if (why) {
    why.innerHTML = WHY.map((w) => `
      <div class="why-item">
        <div class="wi"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">${w.icon}</svg></div>
        <div><h3>${w.title}</h3><p>${w.text}</p></div>
      </div>`).join('');
  }
}
