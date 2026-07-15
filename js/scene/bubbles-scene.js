/* ============================================================
   bubbles-scene.js — ADDITIVE 3D accent.
   Translucent spheres that drift upward like rising bubbles
   behind the CTA banner. Reuses scene-utils (adaptive renderer +
   visibility-aware loop). Lightweight and reduced-motion aware.
   Loaded via dynamic import() so a CDN/WebGL failure can never
   break the rest of the page.
   ============================================================ */
import * as THREE from 'three';
import { makeRenderer, onResize, RenderLoop } from './scene-utils.js';

export function initBubblesScene(quality) {
  const canvas = document.getElementById('bubbles-canvas');
  if (!canvas) return;
  // Decorative accent only — skip on phones/tablets so it doesn't add a
  // 3rd WebGL context competing with the hero + showcase scenes.

  const host = canvas.closest('.cta-banner') || canvas.parentElement;
  const size = () => ({ w: host.clientWidth, h: host.clientHeight });
  let { w, h } = size();
  if (!w || !h) return;

  const renderer = makeRenderer(canvas, quality.dpr);
  renderer.setSize(w, h, false);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 100);
  camera.position.set(0, 0, 12);

  scene.add(new THREE.AmbientLight(0xffffff, 0.9));
  const key = new THREE.PointLight(0xffffff, 1.15, 80);
  key.position.set(6, 9, 12);
  scene.add(key);

  const COUNT = quality.tier === 'high' ? 26 : quality.tier === 'medium' ? 16 : 9;
  const FIELD_W = 18, FIELD_H = 13;
  const geo = new THREE.SphereGeometry(1, 16, 16);
  const COLORS = [0xe9f4cf, 0xc2d98a, 0xbfe06b, 0xf1ebdd];
  const bubbles = [];

  const reset = (m, atBottom) => {
    m.position.set(
      (Math.random() - 0.5) * FIELD_W,
      atBottom ? -FIELD_H / 2 - 1 : (Math.random() - 0.5) * FIELD_H,
      (Math.random() - 0.5) * 6 - 1,
    );
  };

  for (let i = 0; i < COUNT; i++) {
    const mat = new THREE.MeshStandardMaterial({
      color: COLORS[i % COLORS.length],
      metalness: 0.1, roughness: 0.35,
      transparent: true, opacity: 0.5,
    });
    const m = new THREE.Mesh(geo, mat);
    const s = 0.25 + Math.random() * 0.85;
    m.scale.setScalar(s);
    reset(m, false);
    m.userData = {
      vy: 0.004 + Math.random() * 0.01 + s * 0.004,
      sway: Math.random() * Math.PI * 2,
      swayAmp: 0.2 + Math.random() * 0.5,
      spin: (Math.random() - 0.5) * 0.01,
    };
    scene.add(m);
    bubbles.push(m);
  }

  let t = 0;
  const frame = () => {
    t += 0.01;
    for (const m of bubbles) {
      m.position.y += m.userData.vy;
      m.position.x += Math.sin(t + m.userData.sway) * 0.004 * m.userData.swayAmp;
      m.rotation.y += m.userData.spin;
      if (m.position.y > FIELD_H / 2 + 1) reset(m, true);
    }
    renderer.render(scene, camera);
  };

  onResize(size, camera, renderer, null);

  if (quality.reduced) { renderer.render(scene, camera); return; }
  const loop = new RenderLoop(host, frame);
  loop.start();
}
