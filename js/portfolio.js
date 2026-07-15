/* ============================================================
   portfolio.js — premium Work showcase + category filtering.

   Cards "drop / pop" into place from RANDOM positions — a fresh
   scatter on every page load and on every filter change. Respects
   prefers-reduced-motion (cards just appear).

   ▸ TO ADD A REAL PROJECT: give it an `img` (a screenshot at
     assets/portfolio/<file>.jpg, ~1200×750, JPG/WebP) and a live
     `url`. With no `img` it falls back to a branded gradient tile.
     Set `featured: true` on your strongest project (spans 2 cols).
   ============================================================ */
import { $, $$ } from './utils.js';

/* ▸ Live client demos. Each `url` opens the real, deployed site.
     Add a screenshot at assets/portfolio/<file>.jpg and set `img` to
     replace the branded gradient tile with a real thumbnail. */
const PROJECTS = [
  { cat: '3d', name: 'Aurum Café', tag: '3D / WebGL', featured: true,
    result: 'An immersive luxury cafe & lounge experience — live WebGL hero, scroll-driven storytelling and molecular-craft styling.',
    tech: ['Three.js', 'GSAP', 'WebGL'], url: 'https://sh0urya07.github.io/aurum/', img: '',
    g: 'linear-gradient(135deg,#6aa717,#283618)' },
  { cat: 'web', name: 'Brewing Bliss Café', tag: 'Website',
    result: 'A warm, conversion-focused site for a Jaipur coffee destination — menu, offers, reviews and table reservations.',
    tech: ['GSAP', 'Responsive'], url: 'https://sh0urya07.github.io/brewing-bliss-cafe/', img: '',
    g: 'linear-gradient(135deg,#8aab3c,#4f7016)' },
  { cat: 'web', name: 'Anokhi Café', tag: 'Website',
    result: 'An editorial, farm-to-table brand site with a refined organic aesthetic and a smooth reservation flow.',
    tech: ['GSAP', 'Editorial'], url: 'https://sh0urya07.github.io/anokhi/', img: '',
    g: 'linear-gradient(135deg,#9cbb63,#5f8f1a)' },
  { cat: 'web', name: 'Kyfesto Café', tag: 'Website',
    result: 'A golden-lit, award-worthy cafe site — specialty coffee, gallery, menu and reservations, tuned to convert.',
    tech: ['GSAP', 'Responsive'], url: 'https://sh0urya07.github.io/kyfesto-remake/', img: '',
    g: 'linear-gradient(135deg,#b08d2e,#5f4a12)' },
  { cat: 'ecom', name: 'cro_slayy_holic', tag: 'E-commerce',
    result: 'A playful handmade-crochet storefront — shop the pieces, request custom orders and DM-to-buy in a tap.',
    tech: ['Storefront', 'Responsive'], url: 'https://sh0urya07.github.io/cro-slayy-holic/', img: '',
    g: 'linear-gradient(135deg,#c2748a,#7a2f47)' },
];

const EXT = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M14 4h6v6M20 4l-9 9M19 14v5H5V5h5"/></svg>';
const rand = (a, b) => a + Math.random() * (b - a);

export function initPortfolio() {
  const grid = $('#portfolio');
  if (!grid) return;

  grid.innerHTML = PROJECTS.map((p) => {
    // Branded gradient tile always renders instantly; a live, scaled
    // preview of the real site fades in on top once it lazy-loads.
    const thumb = `<div class="pthumb-fallback" style="background:${p.g}">${p.name}</div>`
      + (p.url ? `<div class="pthumb-live" data-live="${p.url}" aria-hidden="true"></div>` : '');
    const live = p.url
      ? `<a href="${p.url}" target="_blank" rel="noopener noreferrer" class="plive">View live ${EXT}</a>`
      : `<a href="#contact" class="plive">Start a project like this ${EXT}</a>`;
    const techs = p.tech.map((t) => `<span class="ptech">${t}</span>`).join('');
    return `
      <article class="proj ${p.featured ? 'proj-featured' : ''}" data-cat="${p.cat}">
        <div class="pthumb">
          ${thumb}
          <div class="pthumb-veil" aria-hidden="true"></div>
          <span class="ptag">${p.tag}</span>
        </div>
        <div class="pbody">
          <h3>${p.name}</h3>
          <p class="presult">${p.result}</p>
          <div class="ptechs">${techs}</div>
          ${live}
        </div>
      </article>`;
  }).join('');

  // Live iframe previews — desktop/full experience only (kept off the
  // light 2D/mobile pages and coarse-pointer devices to stay fast). Each
  // preview loads lazily as its card nears the viewport.
  const mode = (window.__WEBRO__ && window.__WEBRO__.mode) || 'full';
  const allowLive = mode === 'full'
    && window.matchMedia('(hover:hover) and (pointer:fine)').matches
    && window.matchMedia('(min-width:900px)').matches;
  if (allowLive && 'IntersectionObserver' in window) {
    const scaleFit = (box, ifr) => { ifr.style.transform = 'scale(' + (box.clientWidth / 1280) + ')'; };
    const io2 = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        const box = e.target; io2.unobserve(box);
        const ifr = document.createElement('iframe');
        ifr.src = box.dataset.live;
        ifr.loading = 'lazy'; ifr.width = 1280; ifr.height = 720;
        ifr.tabIndex = -1; ifr.setAttribute('scrolling', 'no');
        ifr.setAttribute('title', 'Live site preview');
        ifr.setAttribute('aria-hidden', 'true');
        ifr.addEventListener('load', () => box.classList.add('is-live'));
        box.appendChild(ifr);
        scaleFit(box, ifr);
        window.addEventListener('resize', () => scaleFit(box, ifr), { passive: true });
      });
    }, { rootMargin: '400px 0px' });
    $$('.pthumb-live', grid).forEach((b) => io2.observe(b));
  }

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const cards = () => $$('.proj', grid);

  /** Scatter each card to a random start offset/rotation/scale (hidden). */
  function scatter(list) {
    list.forEach((c, i) => {
      c.classList.remove('landed');
      c.classList.add('drop');
      c.style.setProperty('--dx', rand(-140, 140).toFixed(0) + 'px');
      c.style.setProperty('--dy', rand(-95, 55).toFixed(0) + 'px');
      c.style.setProperty('--drot', rand(-15, 15).toFixed(1) + 'deg');
      c.style.setProperty('--dscale', rand(0.68, 0.86).toFixed(2));
      c.style.setProperty('--ddelay', (i * 55 + rand(0, 150)).toFixed(0) + 'ms');
    });
  }
  /** Release them so they spring into their real grid positions. */
  function land(list) {
    requestAnimationFrame(() => requestAnimationFrame(() =>
      list.forEach((c) => c.classList.add('landed'))));
  }

  // Initial entrance: scatter now, land when the section scrolls into view.
  if (!reduce) {
    const all = cards();
    scatter(all);
    const io = new IntersectionObserver((entries, obs) => {
      if (entries.some((e) => e.isIntersecting)) { land(all); obs.disconnect(); }
    }, { threshold: 0.12 });
    io.observe(grid);
  }

  // Filter ("search") — re-scatter and re-drop the matching set, fresh random.
  const fbtns = $$('#filters button');
  fbtns.forEach((b) => b.addEventListener('click', () => {
    fbtns.forEach((x) => x.classList.remove('active'));
    b.classList.add('active');
    const f = b.dataset.filter;
    const visible = [];
    cards().forEach((p) => {
      const show = (f === 'all' || p.dataset.cat === f);
      p.style.display = show ? '' : 'none';
      if (show) visible.push(p);
    });
    if (!reduce) { scatter(visible); land(visible); }
  }));
}
