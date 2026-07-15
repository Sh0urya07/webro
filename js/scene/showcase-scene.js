/* ============================================================
   showcase-scene.js — scroll-driven, draggable 3D showcase.

   A signature object (a cluster of shards) ASSEMBLES from a
   scattered cloud into a glowing crystal core as the user scrolls
   through the section. Users can drag to orbit it, and pulsing
   "hotspots" hint at interactivity.

   Driven by GSAP ScrollTrigger when available; falls back to a
   scroll listener; renders a single assembled frame on reduced-
   motion. Self-skips bloom on weaker devices.
   ============================================================ */
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { PALETTE, SHOWCASE_MODEL } from '../config.js';
import { lerp, clamp } from '../utils.js';
import { makeRenderer, onResize, RenderLoop } from './scene-utils.js';

export function initShowcaseScene(quality) {
  const canvas = document.getElementById('showcase-canvas');
  const section = document.getElementById('showcase');
  if (!canvas || !section) return;

  const size = () => ({ w: window.innerWidth, h: canvas.clientHeight || window.innerHeight });
  let { w, h } = size();

  const rdpr = quality.bloom ? Math.min(quality.dpr, 1) : quality.dpr;
  const renderer = makeRenderer(canvas, rdpr, { antialias: !quality.bloom });
  renderer.setSize(w, h, false);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 100);
  camera.position.set(0, 0, 12);

  scene.add(new THREE.AmbientLight(0xcdd9a8, 0.8));
  const key = new THREE.PointLight(PALETTE.glowA, 1.4, 80); key.position.set(8, 8, 10); scene.add(key);
  const rim = new THREE.PointLight(PALETTE.limeDeep, 1.1, 80); rim.position.set(-9, -3, -4); scene.add(rim);

  // ---- Core + shards ----
  const core = new THREE.Group(); scene.add(core);

  const coreMesh = new THREE.Mesh(
    new THREE.IcosahedronGeometry(1.6, 1),
    new THREE.MeshStandardMaterial({
      color: PALETTE.crystal, emissive: PALETTE.emissive, emissiveIntensity: 1.2,
      metalness: 0.35, roughness: 0.35, flatShading: true,
    })
  );
  coreMesh.add(new THREE.LineSegments(
    new THREE.WireframeGeometry(coreMesh.geometry),
    new THREE.LineBasicMaterial({ color: PALETTE.lime, transparent: true, opacity: 0.4 })
  ));
  core.add(coreMesh);

  // ---- Optional self-hosted glTF/GLB model (drop-in slot) ----
  // When SHOWCASE_MODEL is set in config.js we load it and let it BE the
  // centrepiece the shards assemble around. If it fails or isn't set, the
  // procedural crystal above is used — nothing breaks either way.
  let modelObj = null;
  if (SHOWCASE_MODEL) {
    import('three/addons/loaders/GLTFLoader.js')
      .then(({ GLTFLoader }) => {
        new GLTFLoader().load(
          SHOWCASE_MODEL,
          (gltf) => {
            modelObj = gltf.scene;
            // Fit + centre the model to a ~3.2 unit box.
            const box = new THREE.Box3().setFromObject(modelObj);
            const c = box.getCenter(new THREE.Vector3());
            const s = box.getSize(new THREE.Vector3());
            const base = 3.2 / (Math.max(s.x, s.y, s.z) || 1);
            modelObj.position.sub(c.multiplyScalar(base));
            modelObj.userData.base = base;
            modelObj.scale.setScalar(base * 0.2);
            core.add(modelObj);
            coreMesh.visible = false; // model takes over the centre
          },
          undefined,
          (err) => console.warn('[WEBRO] showcase model failed to load — using procedural core.', err)
        );
      })
      .catch((err) => console.warn('[WEBRO] GLTFLoader unavailable — using procedural core.', err));
  }

  const SHARD_COUNT = quality.tier === 'low' ? 16 : quality.tier === 'medium' ? 26 : 38;
  const shards = [];
  const shardGeo = new THREE.TetrahedronGeometry(0.34, 0);
  for (let i = 0; i < SHARD_COUNT; i++) {
    const m = new THREE.Mesh(shardGeo, new THREE.MeshStandardMaterial({
      color: PALETTE.lime2, emissive: PALETTE.emissive,
      metalness: 0.3, roughness: 0.5, flatShading: true, transparent: true, opacity: 0.95,
    }));
    // assembled position: on a sphere shell around the core
    const phi = Math.acos(-1 + (2 * i) / SHARD_COUNT);
    const theta = Math.sqrt(SHARD_COUNT * Math.PI) * phi;
    const r = 2.5;
    const home = new THREE.Vector3(
      r * Math.cos(theta) * Math.sin(phi),
      r * Math.sin(theta) * Math.sin(phi),
      r * Math.cos(phi)
    );
    // scattered position: far random cloud
    const scatter = new THREE.Vector3(
      (Math.random() - 0.5) * 22,
      (Math.random() - 0.5) * 16,
      (Math.random() - 0.5) * 18
    );
    m.userData = { home, scatter, spin: (Math.random() - 0.5) * 0.04 };
    core.add(m); shards.push(m);
  }

  // ---- Pulsing hotspots ----
  const hotspots = [];
  [[2.4, 0.8, 1.2], [-1.6, -1.8, 1.8], [0.4, 2.2, -1.2]].forEach((p) => {
    const hs = new THREE.Mesh(
      new THREE.SphereGeometry(0.12, 16, 16),
      new THREE.MeshBasicMaterial({ color: PALETTE.lime })
    );
    hs.position.set(...p);
    core.add(hs); hotspots.push(hs);
  });

  // ---- Background particle dust ----
  const dustCount = quality.tier === 'high' ? 300 : 180;
  const dg = new THREE.BufferGeometry();
  const dp = new Float32Array(dustCount * 3);
  for (let i = 0; i < dustCount * 3; i++) dp[i] = (Math.random() - 0.5) * 34;
  dg.setAttribute('position', new THREE.BufferAttribute(dp, 3));
  const dust = new THREE.Points(dg, new THREE.PointsMaterial({
    color: PALETTE.glowB, size: 0.05, transparent: true, opacity: 0.3,
    depthWrite: false, blending: THREE.AdditiveBlending,
  }));
  scene.add(dust);

  // ---- Bloom (computed at HALF resolution — soft glow, ~4× cheaper) ----
  let composer = null, bloomPass = null;
  const halfW = () => Math.max(2, w >> 1);
  const halfH = () => Math.max(2, h >> 1);
  if (quality.bloom) {
    composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    bloomPass = new UnrealBloomPass(new THREE.Vector2(halfW(), halfH()), 0.7, 0.9, 0.15);
    composer.addPass(bloomPass);
    composer.setSize(w, h);
    bloomPass.setSize(halfW(), halfH());
  }

  // ---- State ----
  let progress = 0;          // 0 scattered -> 1 assembled (scroll)
  let targetProg = 0;
  let orbitX = 0, orbitY = 0; // accumulated user orbit (radians)
  let velX = 0, velY = 0;     // drag inertia
  let autoSpin = 0;           // continuous gentle spin
  let dragging = false, lastX = 0, lastY = 0;

  // Drag to orbit (pointer events cover mouse + touch).
  canvas.style.touchAction = 'pan-y';
  const down = (e) => { dragging = true; lastX = e.clientX; lastY = e.clientY; };
  const move = (e) => {
    if (!dragging) return;
    velY = (e.clientX - lastX) * 0.006;   // horizontal drag -> yaw
    velX = (e.clientY - lastY) * 0.006;   // vertical drag   -> pitch
    orbitY += velY;
    orbitX = clamp(orbitX + velX, -0.8, 0.8);
    lastX = e.clientX; lastY = e.clientY;
  };
  const up = () => { dragging = false; };
  canvas.addEventListener('pointerdown', down);
  window.addEventListener('pointermove', move, { passive: true });
  window.addEventListener('pointerup', up);

  // ---- Scroll → progress ----
  const setFromScroll = () => {
    const rect = section.getBoundingClientRect();
    const total = section.offsetHeight - window.innerHeight;
    const scrolled = clamp(-rect.top, 0, total);
    targetProg = total > 0 ? scrolled / total : 0;
  };

  // Desktop: GSAP ScrollTrigger scrub. Mobile: read the scroll position
  // every frame (in frame() below) — that tracks iOS momentum scrolling,
  // where scroll events don't fire, so the 3D never lags or "sticks".
  const staticMode = quality.reduced;   // only reduced-motion renders one static frame
  // Touch devices read the scroll position each frame (tracks iOS/Android
  // momentum, where scroll events don't fire) instead of ScrollTrigger scrub.
  const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints || 0) > 0;
  const useST = window.gsap && window.ScrollTrigger && !quality.reduced && !isTouch;
  if (useST) {
    window.ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: 'bottom bottom',
      scrub: true,
      onUpdate: (self) => { targetProg = self.progress; },
    });
  } else {
    setFromScroll();
  }

  // ---- Frame ----
  const tmp = new THREE.Vector3();
  let time = 0;
  const easeInOut = (x) => x * x * (3 - 2 * x);

  const frame = () => {
    time += 0.01;
    if (!useST && !staticMode) setFromScroll();   // RAF-driven scroll read (iOS momentum)
    progress = lerp(progress, targetProg, 0.15);
    const a = easeInOut(progress);

    shards.forEach((m, i) => {
      tmp.copy(m.userData.scatter).lerp(m.userData.home, a);
      m.position.copy(tmp);
      m.rotation.x += m.userData.spin;
      m.rotation.y += m.userData.spin * 0.8;
      m.material.opacity = 0.35 + a * 0.6;
    });

    coreMesh.scale.setScalar(0.2 + a * 0.85);
    coreMesh.material.emissiveIntensity = 0.4 + a * 1.4;
    // A loaded model assembles (scales up) with the same scroll progress.
    if (modelObj) {
      const b = modelObj.userData.base || 1;
      modelObj.scale.setScalar(b * (0.2 + a * 0.85));
      modelObj.rotation.y += 0.004;
    }

    hotspots.forEach((hs, i) => {
      const s = 1 + Math.sin(time * 3 + i) * 0.35;
      hs.scale.setScalar(s * (0.4 + a));
      hs.material.opacity = a;
    });

    // auto-spin + drag inertia
    if (!dragging) {
      velX *= 0.94; velY *= 0.94;
      orbitY += velY;
      orbitX = clamp(orbitX + velX, -0.8, 0.8);
    }
    autoSpin += 0.0025;
    core.rotation.y = autoSpin + orbitY;
    core.rotation.x = lerp(core.rotation.x, orbitX, 0.1);

    dust.rotation.y += 0.0004;
    camera.position.z = lerp(12, 8.5, a);
    camera.lookAt(0, 0, 0);

    composer ? composer.render() : renderer.render(scene, camera);
  };

  onResize(size, camera, renderer, composer, (nw, nh) => {
    w = nw; h = nh;
    if (bloomPass) bloomPass.setSize(halfW(), halfH());
    if (staticMode) frame();
  });

  if (staticMode) {
    targetProg = 1; progress = 1; frame();
    return;
  }
  const loop = new RenderLoop(section, frame);
  loop.start();
}
