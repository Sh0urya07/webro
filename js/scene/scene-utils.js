/* ============================================================
   scene-utils.js — shared Three.js helpers.
   - makeRenderer: configured WebGLRenderer
   - RenderLoop: RAF loop that auto-pauses when the canvas is off
     screen or the tab is hidden (saves battery / GPU).
   - onResize: debounced resize wiring
   ============================================================ */
import * as THREE from 'three';
import { debounce } from '../utils.js';

export function makeRenderer(canvas, dpr) {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: dpr < 2,           // AA only when not already super-sampled
    powerPreference: 'high-performance',
  });
  renderer.setPixelRatio(dpr);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  return renderer;
}

/** Wire a debounced resize that updates camera + renderer (+ optional cb). */
export function onResize(getSize, camera, renderer, composer, cb) {
  const handler = debounce(() => {
    const { w, h } = getSize();
    if (camera) { camera.aspect = w / h; camera.updateProjectionMatrix(); }
    if (renderer) renderer.setSize(w, h, false);
    if (composer) composer.setSize(w, h);
    if (cb) cb(w, h);
  }, 120);
  window.addEventListener('resize', handler);
  return handler;
}

/**
 * RenderLoop pauses when the element is not intersecting the viewport
 * or when the page is hidden, so off-screen scenes cost nothing.
 */
export class RenderLoop {
  constructor(el, frame) {
    this.frame = frame;
    this.running = false;
    this.visible = true;
    this._raf = null;

    if ('IntersectionObserver' in window && el) {
      this._io = new IntersectionObserver((entries) => {
        this.visible = entries[0].isIntersecting;
        this.visible ? this.start() : this.stop();
      }, { threshold: 0.01 });
      this._io.observe(el);
    }
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) this.stop();
      else if (this.visible) this.start();
    });
  }

  _tick = (t) => {
    if (!this.running) return;
    this.frame(t);
    this._raf = requestAnimationFrame(this._tick);
  };

  start() {
    if (this.running) return;
    this.running = true;
    this._raf = requestAnimationFrame(this._tick);
  }

  stop() {
    this.running = false;
    if (this._raf) cancelAnimationFrame(this._raf);
  }

  /** Render exactly one frame (used for reduced-motion). */
  once(t = 0) { this.frame(t); }
}
