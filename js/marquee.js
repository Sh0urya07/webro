/* ============================================================
   marquee.js — fills the country + tech scrolling strips.
   Content duplicated once so the CSS loop scrolls seamlessly.
   ============================================================ */
import { $ } from './utils.js';
import { COUNTRIES, TECHS } from './config.js';

function fill(track, items, builder) {
  if (!track) return;
  const frag = document.createDocumentFragment();
  // build twice for a seamless -50% loop
  [...items, ...items].forEach((item) => frag.appendChild(builder(item)));
  track.appendChild(frag);
}

function flagEl([name, code]) {
  const span = document.createElement('span');
  span.className = 'flag';
  const img = document.createElement('img');
  img.src = `https://flagcdn.com/w80/${code}.png`;
  img.alt = ''; img.loading = 'lazy'; img.width = 22;
  img.addEventListener('error', () => { img.style.display = 'none'; });
  span.append(img, document.createTextNode(name));
  return span;
}

function techEl([name, path]) {
  const span = document.createElement('span');
  span.className = 'tech-chip';
  const img = document.createElement('img');
  img.src = `https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/${path}.svg`;
  img.alt = ''; img.loading = 'lazy'; img.width = 26; img.height = 26;
  // Defensive: if an icon path 404s, hide the image — text label stays clean.
  img.addEventListener('error', () => { img.style.display = 'none'; });
  span.append(img, document.createTextNode(name));
  return span;
}

export function initMarquee() {
  fill($('#flagTrack'), COUNTRIES, flagEl);
  fill($('#techTrack'), TECHS, techEl);
}
