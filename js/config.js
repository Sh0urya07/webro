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

export const COUNTRIES = [
  ['India','in'],['UAE','ae'],['Saudi Arabia','sa'],['Qatar','qa'],['Singapore','sg'],
  ['USA','us'],['Canada','ca'],['UK','gb'],['Germany','de'],['Australia','au'],
  ['Japan','jp'],['Netherlands','nl'],
];

export const TECHS = [
  ['Three.js','threejs/threejs-original'],['React','react/react-original'],['Next.js','nextjs/nextjs-original'],
  ['GSAP','greensock/greensock-original'],['TypeScript','typescript/typescript-original'],['JavaScript','javascript/javascript-original'],
  ['Node.js','nodejs/nodejs-original'],['Tailwind','tailwindcss/tailwindcss-original'],['Figma','figma/figma-original'],
  ['WordPress','wordpress/wordpress-plain'],['Firebase','firebase/firebase-plain'],['Flutter','flutter/flutter-original'],
];

export const CHAT_REPLIES = {
  pricing: "Our plans start at $299 (Starter), $699 (Business), and $1,499+ (Premium 3D). Every project gets a free custom quote — want me to point you to the form?",
  time: "Most websites go live in 7–14 days. 3D experiences, e-commerce and apps take 3–6 weeks. We'll confirm an exact timeline in your free quote.",
  services: "We do 3D / WebGL experiences, Website Development, UI/UX & Logo Design, E-commerce, Mobile Apps, SEO & Marketing, and AI Automation. Which one fits your project?",
  contact: "Call or WhatsApp us at +91 63770 93356, or email webro284@gmail.com. We reply within one business day!",
};
