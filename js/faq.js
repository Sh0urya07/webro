/* ============================================================
   faq.js — accessible accordion (one open at a time).
   ============================================================ */
import { $, $$ } from './utils.js';

const QAS = [
  { q: 'How long does a project take?', a: 'Simple sites go live in 7–14 days. 3D experiences, e-commerce and apps typically take 3–6 weeks. You get an exact timeline in your free quote.' },
  { q: 'Do you work with international clients?', a: 'Yes — we work with clients across 12+ countries. Everything runs over email, WhatsApp and video calls, with clear milestones.' },
  { q: 'Will my 3D site be fast on mobile?', a: 'Absolutely. We use adaptive quality, lazy loading and mobile fallbacks so the experience stays smooth even on budget devices.' },
  { q: 'What do you need to get started?', a: 'Just your goals and any brand assets you have. We handle strategy, design, 3D, build and launch from there.' },
  { q: 'Do you provide support after launch?', a: 'Yes. Every plan includes post-launch support, and we offer ongoing maintenance if you want us to keep optimizing.' },
];

export function initFaq() {
  const root = $('#faqList');
  if (!root) return;

  root.innerHTML = QAS.map((item, i) => `
    <div class="qa">
      <button aria-expanded="false" aria-controls="ans-${i}" id="q-${i}">
        ${item.q}<span class="plus" aria-hidden="true"></span>
      </button>
      <div class="ans" id="ans-${i}" role="region" aria-labelledby="q-${i}"><p>${item.a}</p></div>
    </div>`).join('');

  $$('.qa button', root).forEach((btn) => {
    btn.addEventListener('click', () => {
      const qa = btn.parentElement;
      const ans = qa.querySelector('.ans');
      const isOpen = qa.classList.contains('open');

      $$('.qa', root).forEach((o) => {
        o.classList.remove('open');
        o.querySelector('.ans').style.maxHeight = null;
        o.querySelector('button').setAttribute('aria-expanded', 'false');
      });

      if (!isOpen) {
        qa.classList.add('open');
        ans.style.maxHeight = ans.scrollHeight + 'px';
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });
}
