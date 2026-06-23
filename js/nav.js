/* ============================================================
   nav.js — header scroll state + accessible mobile menu.
   ============================================================ */
import { $, $$ } from './utils.js';

export function initNav() {
  const hdr = $('#hdr');
  const burger = $('#burger');
  const mobileMenu = $('#mobileMenu');

  if (hdr) {
    const onScroll = () => hdr.classList.toggle('scrolled', window.scrollY > 30);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  if (burger && mobileMenu) {
    const setOpen = (open) => {
      mobileMenu.classList.toggle('open', open);
      burger.setAttribute('aria-expanded', String(open));
    };
    burger.addEventListener('click', () =>
      setOpen(!mobileMenu.classList.contains('open')));
    $$('a', mobileMenu).forEach((a) =>
      a.addEventListener('click', () => setOpen(false)));
    // Close on Escape for keyboard users.
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') setOpen(false);
    });
  }

  // Footer year.
  const year = $('#year');
  if (year) year.textContent = new Date().getFullYear();
}
