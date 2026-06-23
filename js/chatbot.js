/* ============================================================
   chatbot.js — lightweight rule-based assistant.
   SECURITY: all message text is inserted via textContent, never
   innerHTML, so user input cannot inject markup/scripts.
   ============================================================ */
import { $, $$ } from './utils.js';
import { CHAT_REPLIES } from './config.js';

export function initChatbot() {
  const fab = $('#chatFab');
  const panel = $('#chatPanel');
  const closeBtn = $('#chatClose');
  const body = $('#chatBody');
  const input = $('#chatInput');
  const send = $('#chatSend');
  if (!fab || !panel || !body) return;

  const setOpen = (open) => {
    panel.classList.toggle('open', open);
    if (open) input?.focus();
  };
  fab.addEventListener('click', () => setOpen(!panel.classList.contains('open')));
  closeBtn?.addEventListener('click', () => setOpen(false));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setOpen(false); });

  const addMsg = (text, who) => {
    const m = document.createElement('div');
    m.className = 'msg ' + who;
    m.textContent = text;            // XSS-safe
    body.appendChild(m);
    body.scrollTop = body.scrollHeight;
  };

  const botReply = (text) => setTimeout(() => addMsg(text, 'bot'), 450);

  const route = (raw) => {
    const t = raw.toLowerCase();
    if (CHAT_REPLIES[t]) return botReply(CHAT_REPLIES[t]);
    if (/price|cost|quote|plan|budget/.test(t)) return botReply(CHAT_REPLIES.pricing);
    if (/time|long|days|deadline|fast/.test(t)) return botReply(CHAT_REPLIES.time);
    if (/service|website|app|seo|design|ecom|store|3d/.test(t)) return botReply(CHAT_REPLIES.services);
    if (/contact|call|email|phone|reach|whatsapp|number/.test(t)) return botReply(CHAT_REPLIES.contact);
    if (/hi|hello|hey/.test(t)) return botReply("Hey there! 👋 Ask me about our services, pricing, or timelines — or tap a quick option below.");
    return botReply("Great question! For specifics, drop your details in the contact form and the team will reply within a day. Meanwhile, I can help with pricing, timelines, or services 🙂");
  };

  $$('.chat-quick button').forEach((b) =>
    b.addEventListener('click', () => { addMsg(b.textContent.trim(), 'user'); route(b.dataset.q); }));

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
