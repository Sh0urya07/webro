/* ============================================================
   main.js — single entry point.

   Design goal (per project brief): each section lives in its own
   module and is initialized inside an isolated `safe()` wrapper.
   If any one module throws, it is caught and logged — the rest of
   the site keeps working. One broken section can never take the
   whole experience down.
   ============================================================ */

import { getQuality } from './utils.js';
import { initLoader } from './loader.js';
import { initNav } from './nav.js';
import { initReveal } from './reveal.js';
import { initSmoothScroll } from './smooth-scroll.js';
import { initMarquee } from './marquee.js';
import { initServices } from './services.js';
import { initPortfolio } from './portfolio.js';
import { initPricing } from './pricing.js';
import { initTestimonials } from './testimonials.js';
import { initFaq } from './faq.js';
import { initContactForm } from './contact-form.js';
import { initChatbot } from './chatbot.js';
import { initTilt } from './tilt.js';

/* NOTE: the Three.js scenes are loaded with dynamic import() below — NOT
   statically — so that if the Three.js CDN ever fails to load, only the 3D
   is disabled. The entire 2D/UI site keeps working. */

/** Run an init fn in isolation; log + continue on failure. */
function safe(name, fn) {
  try {
    fn();
  } catch (err) {
    console.error(`[WEBRO] "${name}" failed to initialize — site continues.`, err);
  }
}

/** Like safe(), but for async/dynamically-imported modules. */
async function safeAsync(name, fn) {
  try {
    await fn();
  } catch (err) {
    console.error(`[WEBRO] "${name}" failed to initialize — site continues.`, err);
  }
}

async function boot() {
  const quality = getQuality();
  // Expose for debugging / scenes.
  window.__WEBRO__ = { quality };

  // 1) Content + UI modules (independent, render immediately).
  safe('nav', initNav);
  safe('reveal', initReveal);
  safe('marquee', initMarquee);
  safe('services', initServices);
  safe('portfolio', initPortfolio);
  safe('pricing', initPricing);
  safe('testimonials', initTestimonials);
  safe('faq', initFaq);
  safe('contact-form', initContactForm);
  safe('chatbot', initChatbot);
  safe('tilt', () => initTilt(quality));

  // 2) Smooth scroll (needs GSAP/Lenis globals, loaded with defer).
  safe('smooth-scroll', initSmoothScroll);

  // 3) Heavy 3D scenes — start after the loader lifts so they don't
  //    compete with first paint. Loaded via dynamic import so a CDN/WebGL
  //    failure can't break the rest of the page.
  await initLoader();
  await safeAsync('hero-scene', async () => {
    const { initHeroScene } = await import('./scene/hero-scene.js');
    initHeroScene(quality);
  });
  await safeAsync('showcase-scene', async () => {
    const { initShowcaseScene } = await import('./scene/showcase-scene.js');
    initShowcaseScene(quality);
  });

  // ScrollTrigger may need a refresh once scenes/layout settle.
  if (window.ScrollTrigger) {
    setTimeout(() => window.ScrollTrigger.refresh(), 300);
  }
}

// GSAP plugin registration (defer scripts may land after this module).
function registerGsap() {
  if (window.gsap && window.ScrollTrigger) {
    window.gsap.registerPlugin(window.ScrollTrigger);
    return true;
  }
  return false;
}

if (!registerGsap()) {
  window.addEventListener('load', registerGsap, { once: true });
}

boot();
