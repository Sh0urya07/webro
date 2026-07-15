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
import { initReveal, rescanReveal } from './reveal.js';
import { initMotion } from './motion.js';
import { initSmoothScroll } from './smooth-scroll.js';
import { initServices } from './services.js';
import { initPortfolio } from './portfolio.js';
import { initPricing } from './pricing.js';
import { initFaq } from './faq.js';
import { initContactForm } from './contact-form.js';
import { initChatbot } from './chatbot.js';
import { initTilt } from './tilt.js';
import { initWaterRipple } from './water-ripple.js';

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

/** Is WebGL available at all? (single site — no separate mobile/2D page). */
function hasWebGL() {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl') || c.getContext('experimental-webgl'));
  } catch (e) { return false; }
}

async function boot() {
  const quality = getQuality();
  // Expose for debugging / scenes.
  window.__WEBRO__ = { quality };

  // Full 3D on EVERY device that supports WebGL — phones show the exact same
  // experience as desktop, no separate mobile or 2D version. Only if a device
  // has no WebGL at all do we tag .no-3d so a dead canvas is hidden.
  const canRun3D = hasWebGL();
  if (!canRun3D) document.body.classList.add('no-3d');

  // 1) Critical content + UI modules (non-blocking, render immediately).
  safe('nav', initNav);
  safe('reveal', initReveal);
  safe('services', initServices);
  safe('portfolio', initPortfolio);
  safe('pricing', initPricing);
  safe('faq', initFaq);
  safe('contact-form', initContactForm);
  safe('chatbot', initChatbot);

  // Pick up any `.reveal` / counter elements that the content modules
  // injected after initReveal() ran — otherwise injected cards (services,
  // pricing) would stay invisible at opacity:0.
  safe('reveal-rescan', rescanReveal);

  // Maximalist motion layer — runs AFTER content modules have injected
  // their cards so split-text / stagger targets all exist.
  safe('motion', initMotion);

  // 2) Deferred UI enhancements (non-critical, use requestIdleCallback)
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
      safe('tilt', () => initTilt(quality));
      safe('water-ripple', initWaterRipple);
    }, { timeout: 2000 });
  } else {
    setTimeout(() => {
      safe('tilt', () => initTilt(quality));
      safe('water-ripple', initWaterRipple);
    }, 800);
  }

  // 3) Smooth scroll (needs GSAP/Lenis globals, loaded with defer).
  // Use requestIdleCallback to avoid blocking if GSAP isn't ready yet.
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
      safe('smooth-scroll', initSmoothScroll);
    }, { timeout: 3000 });
  } else {
    setTimeout(() => {
      safe('smooth-scroll', initSmoothScroll);
    }, 400);
  }

  // 4) Heavy 3D scenes — start after the loader lifts so they don't
  //    compete with first paint. Loaded via dynamic import so a CDN/WebGL
  //    failure can't break the rest of the page.
  //    Use requestIdleCallback to defer scene initialization until the main thread is free.
  // Start the intro loader IMMEDIATELY (not inside the idle-deferred scene
  // scheduler). On a busy mobile main thread requestIdleCallback can be
  // starved, which would leave the full-screen loader up and block touch
  // scrolling. Kicking it off here guarantees the curtain lifts on load.
  const loaderDone = (async () => { try { await initLoader(); } catch (e) {} })();

  const initScenes = async () => {
    await loaderDone;

    // Only skip the heavy scenes when the device genuinely has no WebGL.
    if (!canRun3D) return;

    // Hero scene only — it's above the fold.
    await safeAsync('hero-scene', async () => {
      try {
        const { initHeroScene } = await import('./scene/hero-scene.js');
        initHeroScene(quality);
      } catch (err) {
        // No separate 2D page. If the hero's WebGL fails, degrade in place:
        // hide the empty canvases via .no-3d and keep the rest of the site.
        document.body.classList.add('no-3d');
        throw err;
      }
    });

    // Below-the-fold scenes: initialize lazily when the user scrolls
    // within 800px of them. Keeps their cost out of the initial load (TBT).
    const lazyScene = (selector, name, load) => {
      const el = document.querySelector(selector);
      if (!el) return;
      if (!('IntersectionObserver' in window)) { safeAsync(name, load); return; }
      const io = new IntersectionObserver((entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          io.disconnect();
          safeAsync(name, async () => {
            await load();
            // ScrollTrigger may need a refresh once the scene settles.
            if (window.ScrollTrigger) setTimeout(() => window.ScrollTrigger.refresh(), 300);
          });
        }
      }, { rootMargin: '800px 0px' });
      io.observe(el);
    };

    lazyScene('#showcase', 'showcase-scene', async () => {
      const { initShowcaseScene } = await import('./scene/showcase-scene.js');
      initShowcaseScene(quality);
    });

    lazyScene('#bubbles-canvas', 'bubbles-scene', async () => {
      const { initBubblesScene } = await import('./scene/bubbles-scene.js');
      initBubblesScene(quality);
    });

  };

  // Defer scene initialization with requestIdleCallback if available
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => initScenes(), { timeout: 5000 });
  } else {
    // Fallback for older browsers: defer by 600ms
    setTimeout(initScenes, 600);
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
