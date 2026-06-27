/* ============================================================
   contact-form.js — client-side validation + success state.
   Note: this is front-end only (no backend). On success it shows
   a confirmation; wire `onSuccess` to your email/CRM endpoint.
   ============================================================ */
import { $, $$ } from './utils.js';

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

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let valid = true;
    valid &= setErr('name', value('name').length < 2);
    valid &= setErr('email', !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value('email')));
    valid &= setErr('phone', value('phone').replace(/\D/g, '').length < 7);
    valid &= setErr('service', value('service') === '');
    valid &= setErr('message', value('message').length < 5);

    if (valid) {
      if (ok) { ok.classList.remove('show'); void ok.offsetWidth; ok.classList.add('show'); }
      form.reset();
      // onSuccess hook — replace with fetch() to your endpoint:
      // fetch('/api/contact', { method:'POST', body: new FormData(form) })
    } else {
      // focus first invalid field for accessibility
      form.querySelector('.field.invalid input, .field.invalid select, .field.invalid textarea')?.focus();
    }
  });

  // clear error as the user fixes a field
  $$('input, select, textarea', form).forEach((f) =>
    f.addEventListener('input', () => {
      f.closest('.field')?.classList.remove('invalid');
      f.setAttribute('aria-invalid', 'false');
    }));
}
