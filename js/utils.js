/* ============================================================
   utils.js — small shared helpers + device/quality detection.
   ============================================================ */

/** Prefers-reduced-motion (live). */
export const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Coarse pointer / small screen => treat as mobile. */
export const isMobile = () =>
  window.matchMedia('(max-width: 760px)').matches ||
  window.matchMedia('(pointer: coarse)').matches;

/**
 * Detect a rendering quality tier so heavy 3D scenes can scale down
 * on weak GPUs / mobile and keep ~60fps.
 * @returns {{tier:'high'|'medium'|'low', dpr:number, bloom:boolean, mobile:boolean, reduced:boolean}}
 */
export function getQuality() {
  const reduced = prefersReducedMotion();
  const mobile = isMobile();
  const cores = navigator.hardwareConcurrency || 4;
  const mem = navigator.deviceMemory || 4;

  let tier = 'high';
  if (mobile || cores <= 4 || mem <= 4) tier = 'medium';
  if (cores <= 2 || mem <= 2) tier = 'low';

  // Bail to software-ish / weak GPU detection
  try {
    const c = document.createElement('canvas');
    const gl = c.getContext('webgl') || c.getContext('experimental-webgl');
    if (!gl) tier = 'low';
  } catch (e) { tier = 'low'; }

  const dpr = Math.min(window.devicePixelRatio || 1, mobile ? (tier === 'low' ? 1 : 1.2) : (tier === 'high' ? 2 : 1.5));
  return { tier, dpr, bloom: tier === 'high', mobile, reduced };
}

/** Clamp + linear interpolation helpers. */
export const lerp = (a, b, t) => a + (b - a) * t;
export const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

/** Safe query helpers. */
export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

/** Escape user text before inserting into the DOM (XSS-safe). */
export function escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = String(str);
  return div.innerHTML;
}

/** Debounce (e.g. resize). */
export function debounce(fn, wait = 150) {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), wait); };
}
