# WEBRO — Immersive 3D Website

A cinematic, modular 3D website for WEBRO. Built with **vanilla ES modules** (no build step) so any one section can be edited in isolation — and a bug in one module can never take the whole site down.

## Run it

No install, no build. Because it uses native ES modules, it must be served over HTTP (opening `index.html` via `file://` will be blocked by the browser).

```bash
# any static server works — pick one:
npx serve .
# or
python3 -m http.server 8080
```

Then open the printed URL (e.g. http://localhost:8080).

## How it's wired

`index.html` loads the libraries and one entry module, `js/main.js`. That entry file initializes every section inside an isolated `safe()` wrapper, so a failure in one section is logged and skipped while everything else keeps running.

```
index.html                 ← shell + semantic section markup + importmap
css/                       ← one stylesheet per concern (edit in isolation)
  tokens.css   base.css    loader.css  nav.css     hero.css
  showcase.css sections.css components.css contact.css widgets.css
  responsive.css           ← breakpoints + reduced-motion (loads last)
js/
  main.js                  ← entry point; isolates each module
  config.js                ← brand, palette, content data (single source)
  utils.js                 ← helpers + adaptive quality detection
  loader.js  nav.js  reveal.js  smooth-scroll.js
  marquee.js services.js portfolio.js pricing.js
  testimonials.js faq.js contact-form.js chatbot.js tilt.js
  scene/
    scene-utils.js         ← renderer, resize, visibility-aware RAF loop
    hero-scene.js          ← layered hero world + bloom + parallax
    showcase-scene.js      ← scroll-driven, draggable 3D showcase
```

## Editing a section

* **Change content/data** → `js/config.js` (brand, countries, tech, chat) or the data array at the top of the relevant module (`services.js`, `portfolio.js`, `pricing.js`, `testimonials.js`, `faq.js`).
* **Restyle a section** → its matching file in `css/`.
* **Re-theme everything** → colours live once in `css/tokens.css` and `PALETTE` in `js/config.js`.

## Libraries (loaded from CDN, pinned versions)

* [Three.js](https://threejs.org) `0.160.0` — WebGL scenes (via import map)
* [GSAP + ScrollTrigger](https://greensock.com) `3.12.5` — scroll animation
* [Lenis](https://github.com/darkroomengineering/lenis) `1.0.42` — smooth inertia scroll

## Performance & accessibility

* Adaptive quality: particle counts, DPR and bloom scale to the device (`getQuality()`).
* 3D render loops auto-pause when off-screen or the tab is hidden.
* Full `prefers-reduced-motion` support — scenes render a single static frame, animations disable.
* Keyboard navigable, focus-visible states, skip link, ARIA labels, semantic landmarks.

## Deploy

It's static — drop the folder on any host:

* **Netlify / Vercel / Cloudflare Pages** — drag the folder in, or connect the repo. No build command; output dir is `.`.
* **GitHub Pages** — push and enable Pages on the branch.
* **Any web server** — copy the files to the web root.

### Suggested security headers (set at your host)

```
Content-Security-Policy: default-src 'self';
  script-src 'self' https://cdn.jsdelivr.net 'unsafe-inline';
  style-src 'self' https://fonts.googleapis.com 'unsafe-inline';
  font-src https://fonts.gstatic.com;
  img-src 'self' https://flagcdn.com https://cdn.jsdelivr.net data:;
  connect-src 'self' https://cdn.jsdelivr.net;
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
```

Notes:
* `script-src` includes `'unsafe-inline'` because the page uses a native **import map** (`<script type="importmap">`), which is inline. For a stricter policy, replace `'unsafe-inline'` with the import map's SHA-256 hash (`'sha256-…'`) — there are no inline event handlers anywhere else in the markup, so that's the only inline script.
* `style-src 'unsafe-inline'` covers a few `style="…"` attributes used for one-off layout. Remove them into a CSS file if you want to drop it.
* All third-party code is pinned to exact versions and loaded only from `cdn.jsdelivr.net`. For maximum integrity you can self-host the three libraries and tighten `script-src`/`connect-src` to `'self'`.

## Wiring the contact form to a backend

`js/contact-form.js` validates and shows a success state but does not send anywhere yet. Replace the marked hook with a `fetch()` to your endpoint (Formspree, a serverless function, etc.).

> If you point the form at an external endpoint, add that origin to **`connect-src`** and **`form-action`** in both the `<meta>` CSP in `index.html` and the `.htaccess` header — otherwise the browser will block the request.

## Production hardening (this build)

Canonical domain is **https://webro.studio** (matches `CNAME`). The following were added — all non‑visual:

* **Favicons / PWA** — the complete icon set ships in this folder and is wired into `index.html`: `favicon.svg`, `favicon.ico` (multi-size 16–256), `favicon-16x16.png`, `favicon-32x32.png`, `apple-touch-icon.png`, `android-chrome-192/512.png`, `maskable-512.png`, `mstile-150x150.png`, plus the 1200×630 `og-image.png` and `site.webmanifest`.
* **SEO** — corrected canonical/OG domain, full Open Graph + Twitter tags with a 1200×630 share image, enriched JSON‑LD, `robots.txt`, `sitemap.xml`, branded `404.html`.
* **Security** — Content‑Security‑Policy as an in‑page `<meta>` (works on GitHub Pages) and as full headers in `.htaccess` (Hostinger), plus `crossorigin`/`referrerpolicy` on the CDN scripts.
* **GitHub Pages** — `.nojekyll` added. `.htaccess` is ignored there (Apache‑only) and applies on Hostinger.

### Add Subresource Integrity to the CDN scripts (recommended)

Run, then paste each `integrity="sha384-…"` onto the matching `<script>` (they already have `crossorigin`):

```bash
for u in \
  https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js \
  https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/ScrollTrigger.min.js \
  https://cdn.jsdelivr.net/npm/lenis@1.0.42/dist/lenis.min.js ; do
  echo "$u"; curl -fsSL "$u" | openssl dgst -sha384 -binary | openssl base64 -A; echo; done
```

See `WEBRO-AUDIT-REPORT.md` for the full audit, severity list, and deployment checklist.
