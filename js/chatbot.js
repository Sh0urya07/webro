/* ============================================================
   chatbot.js — WEBRO AI assistant engine.

   Understands thousands of customer phrasings via synonym-expanded
   keyword scoring over the intents in chat-knowledge.js, handles
   small talk + sales objections, and runs a lead-qualification →
   close flow that ends in a pre-filled WhatsApp handoff.

   SECURITY: every piece of text is inserted with textContent (never
   innerHTML), and links are built with createElement + .href, so no
   user input can inject markup or scripts.
   ============================================================ */
import { $, $$ } from './utils.js';
import { BUSINESS, SYNONYMS, SMALLTALK, OBJECTIONS, INTENTS } from './chat-knowledge.js';

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

/** Return the normalized string, the raw token set, and a synonym-
    canonicalized token set. */
function analyze(raw) {
  const norm = normalize(raw);
  const tokens = norm.split(' ');
  const rawSet = new Set(tokens);
  const canon = new Set(tokens.map((t) => SYN_MAP.get(t) || t));
  return { norm, raw: rawSet, canon };
}

/** Score how well an entry's keywords match. Phrases (with spaces) match as
    substrings (+2). Single words match tokens (+1) — using synonym-expanded
    tokens for INTENTS (useSyn=true) but LITERAL tokens for objections/small
    talk (useSyn=false), so emotional words don't collide with topic synonyms. */
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

/* ---------- recommendation logic ---------- */
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

/* ---------- main ---------- */
export function initChatbot() {
  const fab = $('#chatFab');
  const panel = $('#chatPanel');
  const closeBtn = $('#chatClose');
  const body = $('#chatBody');
  const input = $('#chatInput');
  const send = $('#chatSend');
  if (!fab || !panel || !body) return;

  /* lead-capture state machine */
  const lead = { name: '', need: '', when: '' };
  let step = null; // null | 'name' | 'need' | 'when'

  /* ---- UI helpers (all XSS-safe) ---- */
  const scroll = () => { body.scrollTop = body.scrollHeight; };

  function addMsg(text, who) {
    const m = document.createElement('div');
    m.className = 'msg ' + who;
    m.textContent = text;
    body.appendChild(m);
    scroll();
    return m;
  }

  /** A bot message that includes a safe action link (e.g. WhatsApp). */
  function addMsgWithLink(text, linkText, href) {
    const m = document.createElement('div');
    m.className = 'msg bot';
    m.textContent = text + '  ';
    const a = document.createElement('a');
    a.href = href;                 // set as property — not parsed as HTML
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.textContent = linkText;
    a.style.cssText = 'color:var(--lime-deep);font-weight:700;text-decoration:underline';
    m.appendChild(a);
    body.appendChild(m);
    scroll();
  }

  let typingEl = null;
  function showTyping() {
    if (typingEl) return;
    typingEl = document.createElement('div');
    typingEl.className = 'msg bot';
    typingEl.textContent = '…';
    typingEl.setAttribute('aria-label', 'WEBRO AI is typing');
    body.appendChild(typingEl);
    scroll();
  }
  function hideTyping() { if (typingEl) { typingEl.remove(); typingEl = null; } }

  /** Bot speaks after a human-like delay scaled to message length. */
  function say(text, after) {
    showTyping();
    const delay = Math.min(1500, 350 + String(text).length * 12);
    setTimeout(() => {
      hideTyping();
      if (typeof text === 'object' && text.link) addMsgWithLink(text.msg, text.link.text, text.link.href);
      else addMsg(text, 'bot');
      if (after) after();
    }, delay);
  }

  /* ---- closing flow ---- */
  function beginFlow() {
    step = 'name';
    say("Perfect — let's get you a free custom quote 🚀 First, what's your name?");
  }

  function buildWhatsApp() {
    const plan = recommendPlan(lead.need);
    const p = BUSINESS.plans[plan];
    const summary =
      `Hi WEBRO! I'd like a quote.\n` +
      `Name: ${lead.name || '—'}\n` +
      `Project: ${lead.need || '—'}\n` +
      `Timeline/Budget: ${lead.when || '—'}`;
    const href = `https://wa.me/${BUSINESS.phone.replace(/\D/g, '')}?text=${encodeURIComponent(summary)}`;
    const planName = plan === 'starter' ? 'Starter' : plan === 'business' ? 'Business' : 'Premium 3D';

    say(
      `Thanks${lead.name ? ', ' + lead.name : ''}! Based on what you described, the ${planName} plan (${p.price}, ${p.blurb}, ~${p.time}) looks like the best fit — but we'll confirm an exact quote for free.`,
      () => {
        say({
          msg: "Tap below to send these details to our team on WhatsApp and we'll reply within the hour — or drop them in the contact form on this page:",
          link: { text: '➡️ Send on WhatsApp', href },
        }, () => { step = null; });
      }
    );
  }

  function advanceFlow(message) {
    if (step === 'name') {
      lead.name = message.replace(/^(my name is|i am|i'm|this is)\s+/i, '').trim().slice(0, 40);
      step = 'need';
      say(`Nice to meet you, ${lead.name || 'there'}! 👋 What would you like to build — a website, online store, app, or a 3D experience?`);
      return;
    }
    if (step === 'need') {
      lead.need = message.trim().slice(0, 120);
      step = 'when';
      say("Got it 👍 And when are you hoping to launch, plus any rough budget? (totally fine to estimate)");
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
  const QUICK = { pricing: 'price', time: 'when launch', services: 'what services do you do', contact: 'contact' };

  function route(raw) {
    const text = String(raw || '').trim();
    if (!text) return;
    const ctx = analyze(text);
    const isQuestion = /\?|^(what|how|when|where|why|who|which|can|do|does|is|are|will)\b/.test(ctx.norm);

    // 1) If we're mid-flow and this isn't clearly a new strong question, capture it.
    if (step) {
      const strong = bestMatch(INTENTS, ctx);
      if (!isQuestion && strong.score < 2) { advanceFlow(text); return; }
      // otherwise fall through and answer their question, staying in-flow
    }

    // 2) Objections (emotional / buying signals) take priority. Literal match.
    const obj = bestMatch(OBJECTIONS, ctx, false);
    if (obj.score >= 1) { say(pick(obj.best.a), () => { if (!step) maybeNudge(); }); return; }

    // 3) Best knowledge intent (synonym-expanded).
    const hit = bestMatch(INTENTS, ctx);

    // 4) Small talk only if nothing better matched. Literal match.
    const st = bestMatch(SMALLTALK, ctx, false);

    if (hit.score >= 1 && hit.score >= st.score) {
      const startIds = ['start', 'free_quote', 'meeting', 'free_consultation', 'discount_offer'];
      say(pick(hit.best.a), () => { if (!step && startIds.includes(hit.best.id)) beginFlow(); });
      return;
    }
    if (st.score >= 1) { say(pick(st.best.a)); return; }

    // 5) Fallback — never a dead end; always move forward.
    say("Good question! I can help with services, pricing, timelines, our process, or starting a project. Could you tell me a bit more — or shall I prepare a free quote for you?");
  }

  let nudged = false;
  function maybeNudge() {
    if (nudged) return;
    nudged = true;
    setTimeout(() => say("By the way, I can put together a free quote in under a minute — want to start?", () => {}), 600);
  }

  /* ---- wire UI ---- */
  const setOpen = (open) => { panel.classList.toggle('open', open); fab.setAttribute('aria-expanded', String(open)); if (open && input) input.focus(); };
  fab.addEventListener('click', () => setOpen(!panel.classList.contains('open')));
  closeBtn?.addEventListener('click', () => setOpen(false));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setOpen(false); });

  $$('.chat-quick button').forEach((b) =>
    b.addEventListener('click', () => {
      addMsg(b.textContent.trim(), 'user');
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
