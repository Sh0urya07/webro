/* ============================================================
   config.js — shared constants: palette, contact, content data.
   Change values here to update the whole site's data layer.
   ============================================================ */

export const BRAND = {
  name: 'WEBRO',
  phone: '+916377093356',
  phoneDisplay: '+91 63770 93356',
  email: 'webro284@gmail.com',
  city: 'Online · Worldwide',
};

/* 3D palette (hex ints for three.js) — mirrors css/tokens.css */
export const PALETTE = {
  beige: 0xf1ebdd,
  lime: 0xc2d98a,
  lime2: 0x8aab3c,
  limeDeep: 0x4f7016,
  glowA: 0xbfe06b,
  glowB: 0x9cbb63,
  crystal: 0x8aa35c,
  emissive: 0x303d1d,
};

/* ============================================================
   SHOWCASE_MODEL — optional self-hosted glTF/GLB used as the hero
   object inside the scroll showcase. Leave '' to use the built-in
   procedural crystal (zero external assets). To add one: drop a
   CC0/licensed .glb at assets/models/showcase.glb (< ~3 MB) and set
   SHOWCASE_MODEL = 'assets/models/showcase.glb'.
   ============================================================ */
export const SHOWCASE_MODEL = '';

/* ============================================================
   NOVA_LLM — optional "real thinking" for the Nova chatbot.
   ------------------------------------------------------------
   Leave '' and Nova uses its fast, built-in on-device engine.

   To enable a real LLM: deploy a tiny serverless proxy (e.g. a free
   Cloudflare Worker) that holds YOUR api key and calls the model,
   then paste its URL here. Nova POSTs JSON { message, history } and
   expects back { reply: "..." }. On any error it falls back to the
   on-device engine automatically, so the chat never breaks.
   ▸ When you set this, also add the proxy's origin to the CSP
     `connect-src` in index.html (e.g. https://your-worker.workers.dev).
   ============================================================ */
export const NOVA_LLM = '';
