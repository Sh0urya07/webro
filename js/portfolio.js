/* ============================================================
   portfolio.js — renders project cards + category filtering.
   ============================================================ */
import { $, $$ } from './utils.js';

const PROJECTS = [
  { cat: '3d', name: 'Aurora Studio', tag: '3D / WebGL', tech: 'Three.js · GSAP · Lenis', g: 'linear-gradient(135deg,#6aa717,#3f6212)' },
  { cat: 'ecom', name: 'Verde Market', tag: 'E-commerce', tech: 'Shopify · Custom theme', g: 'linear-gradient(135deg,#8aab3c,#4f7016)' },
  { cat: 'web', name: 'Northwind Co.', tag: 'Website', tech: 'Next.js · Tailwind', g: 'linear-gradient(135deg,#9cbb63,#5f8f1a)' },
  { cat: 'app', name: 'PulseFit', tag: 'Mobile App', tech: 'React Native · Firebase', g: 'linear-gradient(135deg,#c2d98a,#6aa717)' },
  { cat: '3d', name: 'Helix Product', tag: '3D Product', tech: 'R3F · Drei · Bloom', g: 'linear-gradient(135deg,#4f7016,#283618)' },
  { cat: 'web', name: 'Lumen Agency', tag: 'Website', tech: 'Next.js · Framer Motion', g: 'linear-gradient(135deg,#7a9a3a,#3f6212)' },
];

const EXT = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 4h6v6M20 4l-9 9M19 14v5H5V5h5"/></svg>';

export function initPortfolio() {
  const grid = $('#portfolio');
  if (grid) {
    grid.innerHTML = PROJECTS.map((p) => `
      <article class="proj" data-cat="${p.cat}">
        <div class="thumb" style="background:${p.g}">${p.name}</div>
        <div class="body">
          <span class="tag">${p.tag}</span>
          <h3>${p.name}</h3>
          <p class="tech">${p.tech}</p>
          <a href="#contact" class="live">View case ${EXT}</a>
        </div>
      </article>`).join('');
  }

  const fbtns = $$('#filters button');
  fbtns.forEach((b) => b.addEventListener('click', () => {
    fbtns.forEach((x) => x.classList.remove('active'));
    b.classList.add('active');
    const f = b.dataset.filter;
    $$('.proj', grid).forEach((p) => {
      p.style.display = (f === 'all' || p.dataset.cat === f) ? '' : 'none';
    });
  }));
}
