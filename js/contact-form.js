/* ============================================================
   contact-form.js — client-side validation + handoff.
   On a valid submit it builds a pre-filled message from the
   fields and hands it off to BOTH WhatsApp and an email draft
   (static site — no server). WhatsApp opens automatically;
   both are also offered as buttons in the success panel.
   ============================================================ */
import { $, $$ } from './utils.js';
import { BRAND } from './config.js';

export function initContactForm() {
  const form = $('#contactForm');
  if (!form) return;
  const ok = $('#formOk');

  const value = (id) => ($(`#${id}`)?.value || '').trim();
  const setErr = (id, bad) => {
    const el = $(`#${id}`);
    el?.closest('.field')?.classList.toggle('invalid', bad);
    el?.setAttribute('aria-invalid', String(bad));
    return !bad;
  };

  const clearAll = () =>
    $$('input, select, textarea', form).forEach((f) => {
      f.closest('.field')?.classList.remove('invalid');
      f.setAttribute('aria-invalid', 'false');
    });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let valid = true;
    valid &= setErr('name', value('name').length < 2);
    valid &= setErr('email', !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value('email')));
    valid &= setErr('phone', value('phone').replace(/\D/g, '').length < 7);
    valid &= setErr('service', value('service') === '');
    valid &= setErr('message', value('message').length < 5);

    if (!valid) {
      form.querySelector('.field.invalid input, .field.invalid select, .field.invalid textarea')?.focus();
      return;
    }

    // ---- Build the pre-filled enquiry ----
    const name = value('name');
    const body = [
      'New project enquiry — WEBRO',
      'Name: ' + name,
      'Email: ' + value('email'),
      'Phone: ' + value('phone'),
      'Service: ' + value('service'),
      'Details: ' + value('message'),
    ].join('\n');

    const waUrl = `https://wa.me/${BRAND.phone.replace(/\D/g, '')}?text=${encodeURIComponent(body)}`;
    const mailUrl = `mailto:${BRAND.email}?subject=${encodeURIComponent('New project enquiry from ' + name)}&body=${encodeURIComponent(body)}`;

    // ---- Success panel with both send options (XSS-safe DOM build) ----
    if (ok) {
      ok.textContent = '';
      const check = document.createElement('div');
      check.className = 'check-anim';
      check.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 13l4 4L19 7"/></svg>';
      ok.appendChild(check);
      ok.appendChild(document.createTextNode(
        `Thanks, ${name}! Your details are ready — send them to us:`));

      const row = document.createElement('div');
      row.className = 'form-send';
      const wa = document.createElement('a');
      wa.className = 'btn btn-primary';
      wa.href = waUrl; wa.target = '_blank'; wa.rel = 'noopener noreferrer';
      wa.textContent = 'Send on WhatsApp';
      const ml = document.createElement('a');
      ml.className = 'btn btn-ghost';
      ml.href = mailUrl;
      ml.textContent = 'Send via Email';
      row.append(wa, ml);
      ok.appendChild(row);

      ok.classList.remove('show'); void ok.offsetWidth; ok.classList.add('show');
    }

    // Best-effort: open WhatsApp straight away (user-gesture, so allowed).
    // The buttons above are the fallback if a popup blocker intervenes.
    window.open(waUrl, '_blank', 'noopener');

    form.reset();
    clearAll();
  });

  // clear error as the user fixes a field
  $$('input, select, textarea', form).forEach((f) =>
    f.addEventListener('input', () => {
      f.closest('.field')?.classList.remove('invalid');
      f.setAttribute('aria-invalid', 'false');
    }));
}
