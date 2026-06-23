/* ============================================================
   hero-scene.js — layered cinematic hero world.

   Layers:  background fog gradient  ·  midground particle field
            ·  foreground floating crystals (icosahedrons w/ wire)
   Effects: UnrealBloom (high tier only), mouse-parallax camera,
            gentle float + rotation, atmospheric point lights.
   Adaptive: particle count + DPR scale with quality tier; bloom
            disabled on medium/low; single static frame on reduced.
   ============================================================ */
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { PALETTE } from '../config.js';
import { lerp } from '../utils.js';
import { makeRenderer, onResize, RenderLoop } from './scene-utils.js';

export function initHeroScene(quality) {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;

  const hero = canvas.closest('.hero') || canvas.parentElement;
  const size = () => ({ w: hero.clientWidth, h: hero.clientHeight });
  let { w, h } = size();

  const renderer = makeRenderer(canvas, quality.dpr);
  renderer.setSize(w, h, false);

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(PALETTE.beige, 0.028);

  const camera = new THREE.PerspectiveCamera(55, w / h, 0.1, 100);
  camera.position.set(0, 0, 9);

  // ---- Lighting ----
  scene.add(new THREE.AmbientLight(0xcdd9a8, 0.9));
  const p1 = new THREE.PointLight(PALETTE.glowA, 1.2, 60); p1.position.set(6, 6, 8); scene.add(p1);
  const p2 = new THREE.PointLight(PALETTE.glowB, 0.95, 60); p2.position.set(-7, -4, 6); scene.add(p2);

  // ---- Foreground crystals ----
  const group = new THREE.Group(); scene.add(group);
  const defs = [
    { p: [-5.4, 2.2, -2], s: 1.05 }, { p: [5.6, 1.6, -1], s: 1.3 },
    { p: [4.8, -2.6, -2], s: 0.9 }, { p: [-5.0, -2.2, -1], s: 0.8 },
    { p: [0.2, 3.3, -4], s: 0.65 }, { p: [-2.4, -3.2, -3], s: 0.7 },
  ];
  const crystals = [];
  defs.forEach((d) => {
    const geo = new THREE.IcosahedronGeometry(d.s, 0);
    const mat = new THREE.MeshStandardMaterial({
      color: PALETTE.crystal, emissive: PALETTE.emissive,
      metalness: 0.2, roughness: 0.55, flatShading: true,
      transparent: true, opacity: 0.55,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.add(new THREE.LineSegments(
      new THREE.WireframeGeometry(geo),
      new THREE.LineBasicMaterial({ color: PALETTE.glowB, transparent: true, opacity: 0.3 })
    ));
    mesh.position.set(...d.p);
    mesh.userData = {
      rx: (Math.random() - 0.5) * 0.003 + 0.0014,
      ry: (Math.random() - 0.5) * 0.003 + 0.0018,
      fo: Math.random() * Math.PI * 2,
      fa: 0.14 + Math.random() * 0.18,
      baseY: d.p[1],
    };
    group.add(mesh); crystals.push(mesh);
  });

  // ---- Midground particle field ----
  const pcount = quality.tier === 'high' ? 700 : quality.tier === 'medium' ? 350 : 160;
  const pg = new THREE.BufferGeometry();
  const pos = new Float32Array(pcount * 3);
  for (let i = 0; i < pcount * 3; i++) pos[i] = (Math.random() - 0.5) * 28;
  pg.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const stars = new THREE.Points(pg, new THREE.PointsMaterial({
    color: PALETTE.glowB, size: 0.05, transparent: true, opacity: 0.35,
    depthWrite: false, blending: THREE.AdditiveBlending,
  }));
  scene.add(stars);

  // ---- Postprocessing (bloom) ----
  let composer = null;
  if (quality.bloom) {
    composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    composer.addPass(new UnrealBloomPass(new THREE.Vector2(w, h), 0.55, 0.85, 0.2));
    composer.setSize(w, h);
  }

  // ---- Parallax input ----
  let mx = 0, my = 0, tx = 0, ty = 0;
  const onMove = (e) => {
    const cx = e.touches ? e.touches[0].clientX : e.clientX;
    const cy = e.touches ? e.touches[0].clientY : e.clientY;
    mx = cx / window.innerWidth - 0.5;
    my = cy / window.innerHeight - 0.5;
  };
  window.addEventListener('mousemove', onMove, { passive: true });
  window.addEventListener('touchmove', onMove, { passive: true });

  let t = 0;
  const render = () => (composer ? composer.render() : renderer.render(scene, camera));
  const frame = () => {
    t += 0.01;
    crystals.forEach((m) => {
      m.rotation.x += m.userData.rx;
      m.rotation.y += m.userData.ry;
      m.position.y = m.userData.baseY + Math.sin(t + m.userData.fo) * m.userData.fa;
    });
    stars.rotation.y += 0.0006;
    tx = lerp(tx, mx, 0.05); ty = lerp(ty, my, 0.05);
    group.rotation.y = tx * 0.5; group.rotation.x = ty * 0.4;
    camera.position.x = tx * 1.4; camera.position.y = -ty * 1.0;
    camera.lookAt(0, 0, 0);
    render();
  };

  onResize(size, camera, renderer, composer);

  if (quality.reduced) {
    render(); // single static frame
    return;
  }
  const loop = new RenderLoop(hero, frame);
  loop.start();
}
