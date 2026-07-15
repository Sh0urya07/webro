/* ============================================================
   smooth-scroll.js — Lenis inertia scroll, bridged to GSAP
   ScrollTrigger. Gracefully no-ops if Lenis isn't available or
   the user prefers reduced motion.
   Exposes the instance on window.__lenis for other modules.
   ============================================================ */
import { prefersReducedMotion, isMobile } from './utils.js';

export function initSmoothScroll() {
  if (prefersReducedMotion()) return null;
  // On touch / small screens, use NATIVE scroll. Lenis' inertia fights
  // mobile scrolling and desyncs the scroll-driven 3D; native scroll is
  // smoother here and keeps the showcase perfectly in step.
  if (isMobile()) return null;
  // Hard touch guard: never start Lenis on a touch device. In-app browsers
  // (Instagram/Facebook/Snapchat/TikTok) can mis-report as desktop, and Lenis
  // then breaks native touch scrolling — the page renders but won't scroll.
  if (('ontouchstart' in window) || (navigator.maxTouchPoints || 0) > 0) return null;
  if (typeof window.Lenis === 'undefined') return null;

  const lenis = new window.Lenis({
    duration: 1.15,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    touchMultiplier: 1.6,
  });
  window.__lenis = lenis;

  // Drive Lenis from GSAP's ticker when GSAP is present (single RAF loop).
  if (window.gsap && window.ScrollTrigger) {
    lenis.on('scroll', window.ScrollTrigger.update);
    window.gsap.ticker.add((time) => lenis.raf(time * 1000));
    window.gsap.ticker.lagSmoothing(0);
  } else {
    const raf = (time) => { lenis.raf(time); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
  }

  // Make in-page anchor links use Lenis (deferred to avoid forced reflows).
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
      document.querySelectorAll('a[href^="#"]').forEach((a) => {
        a.addEventListener('click', (e) => {
          const id = a.getAttribute('href');
          if (!id || id === '#') return;
          const target = document.querySelector(id);
          if (target) { e.preventDefault(); lenis.scrollTo(target, { offset: -70 }); }
        });
      });
    });
  } else {
    // Fallback for older browsers
    setTimeout(() => {
      document.querySelectorAll('a[href^="#"]').forEach((a) => {
        a.addEventListener('click', (e) => {
          const id = a.getAttribute('href');
          if (!id || id === '#') return;
          const target = document.querySelector(id);
          if (target) { e.preventDefault(); lenis.scrollTo(target, { offset: -70 }); }
        });
      });
    }, 100);
  }

  return lenis;
}
