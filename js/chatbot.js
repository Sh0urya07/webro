/* ============================================================
   chatbot.js — "Nova", WEBRO's AI sales consultant.

   Understands thousands of phrasings via synonym-expanded keyword
   scoring over chat-knowledge.js, handles small talk + objections,
   runs a lead-qualification → close flow, and renders rich cards
   (services, case studies, booking, lead form) from {{directives}}
   the reply text emits — streamed word-by-word for a live feel.

   SECURITY: all user/content text goes in via textContent; links and
   forms are built with createElement + property assignment; the only
   innerHTML used is for static, developer-authored SVG icons. No user
   input is ever parsed as HTML.
   ============================================================ */
import { $, $$ } from './utils.js';
import {
  BUSINESS, SYNONYMS, SMALLTALK, OBJECTIONS, INTENTS,
  NOVA_SERVICES, NOVA_CASES,
} from './chat-knowledge.js';

/* ---------- text processing ---------- */
const SYN_MAP = (() => {
  const m = new Map();
  SYNONYMS.forEach((group) => {
    const canonical = group[0];
    group.forEach((w) => m.set(w, canonical));
  });
  return m;
})();

const normalize = (s) => String(s).toLowerCase().replace(/[^\w\s'-]/g, ' ').replace(/\s+/g, ' ').trim();

function analyze(raw) {
  const norm = normalize(raw);
  const tokens = norm.split(' ');
  const rawSet = new Set(tokens);
  const canon = new Set(tokens.map((t) => SYN_MAP.get(t) || t));
  return { norm, raw: rawSet, canon };
}

function scoreEntry(kw, ctx, useSyn) {
  let score = 0;
  for (const k of kw) {
    if (k.includes(' ')) { if (ctx.norm.includes(k)) score += 2; }
    else if (useSyn) { if (ctx.canon.has(k) || ctx.canon.has(SYN_MAP.get(k) || k)) score += 1; }
    else if (ctx.raw.has(k)) score += 1;
  }
  return score;
}

function bestMatch(list, ctx, useSyn = true) {
  let best = null, bestScore = 0;
  for (const item of list) {
    const s = scoreEntry(item.kw, ctx, useSyn);
    if (s > bestScore) { bestScore = s; best = item; }
  }
  return { best, score: bestScore };
}

const pick = (a) => Array.isArray(a) ? a[Math.floor(Math.random() * a.length)] : a;
const waLink = (text) => `https://wa.me/${BUSINESS.phone.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`;

/* ---------- plan recommendation ---------- */
function recommendPlan(need) {
  const n = normalize(need || '');
  const has = (w) => n.includes(w);
  if (has('3d') || has('three') || has('webgl') || has('immersive') || has('animat')) return 'premium';
  if (has('app') || has('android') || has('ios') || has('mobile')) return 'premium';
  if (has('store') || has('shop') || has('ecom') || has('sell')) return 'business';
  if (has('redesign') || has('multi') || has('pages') || has('business') || has('company')) return 'business';
  if (has('landing') || has('simple') || has('one page') || has('basic') || has('cheap') || has('starter')) return 'starter';
  return 'business';
}

/* ---------- directive parsing ---------- */
/** Pull {{services:a,b}} {{portfolio}} {{meeting}} {{leadform}} out of a reply,
    returning the visible text plus the ordered list of cards to render. */
function parseDirectives(text) {
  const directives = [];
  const clean = String(text)
    .replace(/\{\{\s*(services:[\w,\-]+|portfolio|meeting|leadform)\s*\}\}/g, (_, g) => {
      if (g.startsWith('services:')) {
        directives.push({ type: 'services', ids: g.slice(9).split(',').map((s) => s.trim()).filter(Boolean) });
      } else {
        directives.push({ type: g });
      }
      return '';
    })
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  return { clean, directives };
}

const ICON = {
  arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
  cal: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" aria-hidden="true"><rect x="3" y="4" width="18" height="17" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>',
  send: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4z"/></svg>',
};

/* ---------- main ---------- */
export function initChatbot() {
  const fab = $('#chatFab');
  const panel = $('#chatPanel');
  const closeBtn = $('#chatClose');
  const body = $('#chatBody');
  const input = $('#chatInput');
  const send = $('#chatSend');
  if (!fab || !panel || !body) return;

  const lead = { name: '', need: '', when: '' };
  let step = null; // null | 'name' | 'need' | 'when'

  const scroll = () => { body.scrollTop = body.scrollHeight; };

  /* ---- message bubbles (XSS-safe) ---- */
  function addMsg(text, who) {
    const m = document.createElement('div');
    m.className = 'msg ' + who;
    m.textContent = text;
    body.appendChild(m);
    scroll();
    return m;
  }

  function addMsgWithLink(text, linkText, href) {
    const m = document.createElement('div');
    m.className = 'msg bot';
    m.textContent = text + '  ';
    const a = document.createElement('a');
    a.href = href;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.textContent = linkText;
    a.className = 'msg-link';
    m.appendChild(a);
    body.appendChild(m);
    scroll();
  }

  /** Reveal text word-by-word into an existing bubble, then run cb. */
  function stream(el, text, cb) {
    const parts = text.split(/(\s+)/);
    let i = 0;
    el.textContent = '';
    const tick = () => {
      if (i >= parts.length) { cb && cb(); return; }
      el.textContent += parts[i++];
      scroll();
      setTimeout(tick, 12);
    };
    tick();
  }

  let typingEl = null;
  function showTyping() {
    if (typingEl) return;
    typingEl = document.createElement('div');
    typingEl.className = 'msg bot typing';
    typingEl.innerHTML = '<span></span><span></span><span></span>';
    typingEl.setAttribute('aria-label', 'Nova is typing');
    body.appendChild(typingEl);
    scroll();
  }
  function hideTyping() { if (typingEl) { typingEl.remove(); typingEl = null; } }

  /** Bot speaks: typing pause → stream text → render any directive cards. */
  function say(text, after) {
    showTyping();
    const source = (typeof text === 'object') ? text.msg : text;
    const { clean, directives } = parseDirectives(String(source));
    const delay = Math.min(1000, 280 + clean.length * 6);
    setTimeout(() => {
      hideTyping();
      if (typeof text === 'object' && text.link) {
        addMsgWithLink(clean, text.link.text, text.link.href);
        renderCards(directives);
        after && after();
      } else {
        const el = addMsg('', 'bot');
        stream(el, clean, () => { renderCards(directives); after && after(); });
      }
    }, delay);
  }

  /* ---- rich cards ---- */
  function renderCards(directives) {
    if (!directives || !directives.length) return;
    const wrap = document.createElement('div');
    wrap.className = 'nova-cards';
    directives.forEach((d) => {
      if (d.type === 'services') serviceCards(d.ids, wrap);
      else if (d.type === 'portfolio') portfolioCards(wrap);
      else if (d.type === 'meeting') meetingBtn(wrap);
      else if (d.type === 'leadform') leadFormCard(wrap);
    });
    body.appendChild(wrap);
    scroll();
  }

  function serviceCards(ids, wrap) {
    let list = (ids || []).map((id) => NOVA_SERVICES.find((s) => s.id === id)).filter(Boolean).slice(0, 3);
    if (!list.length) list = NOVA_SERVICES.slice(0, 3);
    list.forEach((svc) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'nova-card nova-svc';
      const main = document.createElement('div');
      main.className = 'nova-svc-main';
      const n = document.createElement('p'); n.className = 'nova-svc-name'; n.textContent = svc.name;
      const s = document.createElement('p'); s.className = 'nova-svc-short'; s.textContent = svc.short;
      const meta = document.createElement('p'); meta.className = 'nova-svc-meta'; meta.textContent = `From ${svc.priceFrom} · ${svc.timeline}`;
      main.append(n, s, meta);
      const arrow = document.createElement('span'); arrow.className = 'nova-arrow'; arrow.innerHTML = ICON.arrow;
      b.append(main, arrow);
      b.addEventListener('click', () => { addMsg(`Tell me more about ${svc.name}`, 'user'); route(`tell me more about ${svc.name}`); });
      wrap.appendChild(b);
    });
  }

  function portfolioCards(wrap) {
    NOVA_CASES.slice(0, 3).forEach((c) => {
      const d = document.createElement('div');
      d.className = 'nova-card nova-case';
      const ind = document.createElement('p'); ind.className = 'nova-case-industry'; ind.textContent = c.industry;
      const h = document.createElement('p'); h.className = 'nova-case-headline'; h.textContent = c.headline;
      const r = document.createElement('p'); r.className = 'nova-case-result'; r.textContent = c.result;
      d.append(ind, h, r);
      wrap.appendChild(d);
    });
  }

  function meetingBtn(wrap) {
    const a = document.createElement('a');
    a.className = 'nova-cta';
    a.href = waLink("Hi WEBRO! I'd like to book a free discovery call.");
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.innerHTML = ICON.cal + '<span>Book a free call on WhatsApp</span>';
    wrap.appendChild(a);
  }

  function leadFormCard(wrap) {
    const f = document.createElement('form');
    f.className = 'nova-leadform';
    f.setAttribute('novalidate', '');
    const field = (tag, type, name, ph) => {
      const el = document.createElement(tag);
      if (tag !== 'textarea') el.type = type;
      el.name = name; el.placeholder = ph; el.autocomplete = name;
      return el;
    };
    const nm = field('input', 'text', 'name', 'Your name');
    const em = field('input', 'email', 'email', 'Email');
    const ph = field('input', 'tel', 'phone', 'Phone / WhatsApp');
    const pr = field('input', 'text', 'project', 'What do you need? (e.g. 3D website)');
    const btn = document.createElement('button');
    btn.type = 'submit'; btn.className = 'nova-cta nova-submit';
    btn.innerHTML = '<span>Send to WEBRO</span>' + ICON.send;
    f.append(nm, em, ph, pr, btn);

    f.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = nm.value.trim(), email = em.value.trim(), phone = ph.value.trim(), project = pr.value.trim();
      if (name.length < 2 || (!email && !phone)) { f.classList.add('nova-invalid'); (name.length < 2 ? nm : em).focus(); return; }
      const bodyText = [
        'New enquiry via Nova — WEBRO',
        `Name: ${name}`,
        `Email: ${email || '—'}`,
        `Phone: ${phone || '—'}`,
        `Project: ${project || '—'}`,
      ].join('\n');
      const mail = `mailto:${BUSINESS.email}?subject=${encodeURIComponent('New enquiry from ' + name)}&body=${encodeURIComponent(bodyText)}`;
      window.open(waLink(bodyText), '_blank', 'noopener');
      const ok = document.createElement('div');
      ok.className = 'nova-ok';
      ok.textContent = `Thanks, ${name}! WhatsApp is opening — or `;
      const ml = document.createElement('a'); ml.href = mail; ml.textContent = 'send it by email'; ml.className = 'nova-ok-link';
      ok.append(ml, document.createTextNode('. We reply within one business day.'));
      f.replaceWith(ok);
      scroll();
    });
    wrap.appendChild(f);
  }

  /* ---- lead-qualification flow ---- */
  function beginFlow() {
    step = 'name';
    say("Happy to put a tailored quote together. First — what's your name?");
  }

  function buildWhatsApp() {
    const plan = recommendPlan(lead.need);
    const p = BUSINESS.plans[plan];
    const planName = plan === 'starter' ? 'Starter' : plan === 'business' ? 'Business' : 'Premium 3D';
    const summary =
      `Hi WEBRO! I'd like a quote.\n` +
      `Name: ${lead.name || '—'}\n` +
      `Project: ${lead.need || '—'}\n` +
      `Timeline/Budget: ${lead.when || '—'}`;
    say(
      `Thanks${lead.name ? ', ' + lead.name : ''}. Based on what you described, the ${planName} plan (${p.price}, ${p.blurb}, ~${p.time}) looks like the right starting point — we'll confirm an exact, no-obligation quote.`,
      () => {
        say({
          msg: 'Send these details to the team and we’ll reply within the hour:',
          link: { text: 'Send on WhatsApp', href: waLink(summary) },
        }, () => { step = null; });
      }
    );
  }

  function advanceFlow(message) {
    if (step === 'name') {
      lead.name = message.replace(/^(my name is|i am|i'm|this is)\s+/i, '').trim().slice(0, 40);
      step = 'need';
      say(`Good to meet you, ${lead.name || 'there'}. What are you looking to build — a website, online store, app, or an immersive 3D experience?`);
      return;
    }
    if (step === 'need') {
      lead.need = message.trim().slice(0, 120);
      step = 'when';
      say('Understood. When are you hoping to launch, and do you have a rough budget in mind? (an estimate is fine)');
      return;
    }
    if (step === 'when') {
      lead.when = message.trim().slice(0, 120);
      step = null;
      buildWhatsApp();
      return;
    }
  }

  /* ---- routing ---- */
  const QUICK = {
    pricing: 'pricing', time: 'how long does it take', services: 'what services do you offer',
    portfolio: 'show me your portfolio', contact: 'how do I contact you', meeting: 'i want to book a call',
  };

  function route(raw) {
    const text = String(raw || '').trim();
    if (!text) return;
    const ctx = analyze(text);
    const isQuestion = /\?|^(what|how|when|where|why|who|which|can|do|does|is|are|will)\b/.test(ctx.norm);

    // Mid-flow capture unless it's clearly a new strong question.
    if (step) {
      const strong = bestMatch(INTENTS, ctx);
      if (!isQuestion && strong.score < 2) { advanceFlow(text); return; }
    }

    // Objections first (literal match).
    const obj = bestMatch(OBJECTIONS, ctx, false);
    if (obj.score >= 1) { say(pick(obj.best.a), () => { if (!step) maybeNudge(); }); return; }

    // Specific service detail (e.g. from a service card click).
    const svc = NOVA_SERVICES.find((s) => ctx.norm.includes(s.name.toLowerCase()));
    if (svc && /(more|about|detail|tell|explain|include|price|cost|how much)/.test(ctx.norm)) {
      say(`${svc.detail}\n\nStarting from ${svc.priceFrom} · ${svc.timeline}. Want a tailored estimate for your project?\n\n{{leadform}}`);
      return;
    }

    // Knowledge intents (synonym-expanded) vs small talk (literal).
    const hit = bestMatch(INTENTS, ctx);
    const st = bestMatch(SMALLTALK, ctx, false);

    if (hit.score >= 1 && hit.score >= st.score) {
      const startIds = ['start', 'free_quote', 'discount_offer'];
      say(pick(hit.best.a), () => { if (!step && startIds.includes(hit.best.id)) beginFlow(); });
      return;
    }
    if (st.score >= 1) { say(pick(st.best.a)); return; }

    // Fallback — never a dead end.
    say("I can help with services, pricing, timelines, our process, portfolio, or getting your project started. What would be most useful — or shall I prepare a tailored quote?\n\n{{services:web-dev,uiux,ai-automation}}");
  }

  let nudged = false;
  function maybeNudge() {
    if (nudged) return;
    nudged = true;
    setTimeout(() => say('If it helps, I can pull together a free, tailored estimate in under a minute — shall I?'), 700);
  }

  /* ---- wire UI ---- */
  const setOpen = (open) => {
    panel.classList.toggle('open', open);
    fab.setAttribute('aria-expanded', String(open));
    if (open && input) input.focus();
  };
  fab.addEventListener('click', () => setOpen(!panel.classList.contains('open')));
  closeBtn?.addEventListener('click', () => setOpen(false));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setOpen(false); });

  $$('.chat-quick button').forEach((b) =>
    b.addEventListener('click', () => {
      addMsg(b.textContent.replace(/^[^\w]+/, '').trim(), 'user');
      route(QUICK[b.dataset.q] || b.textContent.trim());
    }));

  const doSend = () => {
    const val = (input?.value || '').trim();
    if (!val) return;
    addMsg(val, 'user');
    input.value = '';
    route(val);
  };
  send?.addEventListener('click', doSend);
  input?.addEventListener('keydown', (e) => { if (e.key === 'Enter') doSend(); });
}
