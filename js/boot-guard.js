/* ============================================================
   boot-guard.js — classic script (runs even when modules can't).
   ES modules + import maps require http(s); opening the site
   directly (file://) will not boot. Show clear instructions
   instead of a frozen loader. Externalized so the CSP can drop
   'unsafe-inline' for scripts.
   ============================================================ */
(function () {
  if (location.protocol === 'file:') {
    document.addEventListener('DOMContentLoaded', function () {
      var l = document.getElementById('loader');
      if (!l) return;
      requestAnimationFrame(function () {
        l.style.padding = '24px';
        l.innerHTML =
          '<div style="max-width:480px;text-align:center;font-family:DM Sans,system-ui,sans-serif">' +
            '<h2 style="font-family:Space Grotesk,sans-serif;font-size:24px;margin-bottom:14px;color:#1C1B14">Run WEBRO from a local server</h2>' +
            '<p style="color:#5b5848;line-height:1.6;margin-bottom:14px">This site uses modern ES modules, which browsers only allow over <b>http://</b> — not when a file is opened directly. From the project folder, run one of these:</p>' +
            '<pre style="text-align:left;background:#FBF7EE;border:1px solid rgba(77,124,15,.22);border-radius:10px;padding:14px;font-size:13px;overflow:auto;color:#1C1B14">python -m http.server 8080\n\n# or, if you have Node:\nnpx serve .</pre>' +
            '<p style="color:#5b5848;line-height:1.6;margin-top:14px">Then open <b>http://localhost:8080</b></p>' +
            '<p style="color:#5b5848;margin-top:12px">On Windows, you can also just double-click <b>start-server.bat</b> in this folder.</p>' +
          '</div>';
      });
    });
  }

  // Optimize critical rendering path: use will-change for 3D scenes
  var styles = document.createElement('style');
  styles.textContent = '#hero-canvas,#showcase-canvas,#bubbles-canvas{will-change:transform;contain:layout style paint}';
  document.head.appendChild(styles);
})();
