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
import { NOVA_LLM } from './config.js';

/* ===== inlined chat-knowledge (was js/chat-knowledge.js) ===== */
/* ============================================================
   chat-knowledge.js — WEBRO AI assistant brain data.

   This is the "training data". It does NOT use a neural model — it
   recognises THOUSANDS of customer phrasings by matching keywords +
   synonyms against a curated set of intents. Edit the data here to
   teach the bot new answers; the engine lives in chatbot.js.

   Sections:
     BUSINESS  — facts the bot speaks from (prices, services, etc.)
     SYNONYMS  — word groups so many phrasings map to one meaning
     SMALLTALK — greetings, thanks, identity, etc.
     OBJECTIONS— price/trust/"thinking about it" handling (sales)
     INTENTS   — ~80 topics, each matching dozens of questions
   ============================================================ */

export const BUSINESS = {
  name: 'WEBRO',
  phone: '+916377093356',
  phoneDisplay: '+91 63770 93356',
  email: 'webro284@gmail.com',
  city: 'Online · Worldwide',
  hours: 'Mon–Sat, 10am–7pm IST (we reply to messages anytime)',
  plans: {
    starter: { price: '$299', blurb: 'a clean, fast landing site (up to 5 sections)', time: '5–7 days' },
    business: { price: '$699', blurb: 'a full multi-page site with light 3D accents', time: '~2 weeks' },
    premium: { price: '$1,499+', blurb: 'a full cinematic, interactive 3D experience', time: '3–6 weeks' },
  },
  proof: '120+ projects delivered, 90+ happy clients across 12+ countries, 4.9/5 average rating',
  services: ['3D / WebGL experiences', 'Website development', 'UI/UX & logo design',
    'E-commerce stores', 'Mobile apps', 'SEO & digital marketing', 'AI automation'],
};

/* Each group: the FIRST word is canonical; the rest are treated as it.
   The engine rewrites a user message through these before matching. */
export const SYNONYMS = [
  ['price', 'cost', 'costs', 'pricing', 'charge', 'charges', 'rate', 'rates', 'fee', 'fees', 'quote', 'budget', 'amount'],
  ['time', 'timeline', 'long', 'duration', 'deadline', 'fast', 'quick', 'days', 'weeks', 'when', 'eta', 'delivery', 'deliver', 'ready'],
  ['website', 'site', 'webpage', 'web', 'page', 'landing'],
  ['ecommerce', 'e-commerce', 'store', 'shop', 'shopify', 'woocommerce', 'cart', 'checkout', 'sell', 'selling', 'product', 'products'],
  ['app', 'application', 'mobile', 'android', 'ios', 'iphone', 'play store', 'appstore'],
  ['seo', 'rank', 'ranking', 'google', 'traffic', 'search', 'keywords', 'visibility'],
  ['design', 'ui', 'ux', 'figma', 'mockup', 'prototype', 'interface', 'layout'],
  ['logo', 'branding', 'brand', 'identity'],
  ['3d', 'three', 'threejs', 'webgl', 'animation', 'animated', 'interactive', 'immersive', 'cinematic'],
  ['ai', 'chatbot', 'automation', 'bot', 'gpt', 'assistant'],
  ['start', 'begin', 'hire', 'order', 'proceed', 'interested', 'engage', 'onboard', 'kickoff'],
  ['contact', 'reach', 'call', 'phone', 'whatsapp', 'email', 'connect', 'talk', 'speak'],
  ['support', 'maintenance', 'maintain', 'update', 'updates', 'fix', 'bug', 'help', 'after'],
  ['payment', 'pay', 'installment', 'advance', 'upi', 'bank', 'card', 'paypal', 'razorpay', 'stripe'],
  ['hosting', 'host', 'domain', 'server', 'deploy', 'deployment'],
  ['revise', 'revision', 'revisions', 'changes', 'edit', 'edits', 'modify'],
  ['refund', 'refunds', 'cancel', 'cancellation', 'guarantee'],
  ['portfolio', 'examples', 'samples', 'case', 'projects', 'previous', 'past'],
  ['location', 'where', 'based', 'office', 'address', 'country', 'city'],
  ['meeting', 'call', 'demo', 'consultation', 'discuss', 'schedule', 'book'],
];

export const SMALLTALK = [
  { kw: ['hi', 'hello', 'hey', 'yo', 'hii', 'helo', 'namaste', 'greetings'], a: ["Hey there! 👋 Welcome to WEBRO. Are you looking to build a website, an online store, an app, or a 3D experience?", "Hi! 👋 Great to see you. What can I help you build today — a website, store, app or something more immersive?"] },
  { kw: ['good morning', 'good afternoon', 'good evening'], a: ["Hello! 👋 Thanks for stopping by WEBRO. What project can I help you with today?"] },
  { kw: ['how are you', 'how r u', 'hows it going', 'how do you do'], a: ["Doing great and ready to help 😄 More importantly — what are you looking to build?"] },
  { kw: ['who are you', 'what are you', 'your name', 'are you a bot', 'are you human', 'real person'], a: ["I'm Nova, WEBRO's AI consultant — I can walk you through our services, pricing and process, recommend the right approach, and set you up with the team. What are you working on?"] },
  { kw: ['thanks', 'thank you', 'thx', 'ty', 'thank u', 'appreciate'], a: ["Anytime! 🙌 Want me to put together a quick quote for your project while you're here?", "You're welcome! Happy to help. Shall I get you a free quote?"] },
  { kw: ['bye', 'goodbye', 'see you', 'later', 'gtg'], a: ["Thanks for chatting! Whenever you're ready, we're at " + BUSINESS.phoneDisplay + " or " + BUSINESS.email + ". 👋"] },
  { kw: ['ok', 'okay', 'cool', 'nice', 'great', 'awesome', 'got it'], a: ["Glad that helps! 🙂 Want me to start a quick quote or connect you with the team?"] },
  { kw: ['lol', 'haha', 'lmao'], a: ["😄 Glad you're enjoying it! So — what shall we build for you?"] },
];

export const OBJECTIONS = [
  { kw: ['expensive', 'too much', 'costly', 'high price', 'out of budget', 'cant afford', 'lower price', 'discount', 'cheaper'], a: ["I hear you 🙂 We price for results — most clients earn the cost back through more enquiries and sales. We also have a $299 Starter plan and can phase the work to fit your budget. What budget did you have in mind? I'll tailor something."] },
  { kw: ['thinking', 'think about it', 'not sure', 'maybe later', 'ill get back', 'consider'], a: ["Totally fair to think it over 👍 If it helps, I can send a free no-obligation quote and a couple of sample concepts so you have something concrete to weigh. Want me to set that up?"] },
  { kw: ['competitor', 'other company', 'someone else', 'freelancer', 'fiverr', 'cheaper elsewhere'], a: ["Plenty of options out there 🙂 What sets WEBRO apart is real 3D/WebGL craft, 90+ PageSpeed performance, and support that lasts past launch — " + BUSINESS.proof + ". Want to compare a quick quote against what you've been offered?"] },
  { kw: ['trust', 'scam', 'legit', 'genuine', 'reliable', 'safe'], a: ["Great question — trust matters. We're a remote studio with" + BUSINESS.proof + ", clear milestones, and a contract. We can start small to prove ourselves. Want me to share a couple of references and a quote?"] },
  { kw: ['why you', 'why should', 'why choose', 'what makes you', 'better than'], a: ["Honestly? Three things: cinematic 3D most agencies can't do, obsessive performance & accessibility, and we actually stick around after launch. Plus " + BUSINESS.proof + ". Shall I show you what that'd look like for your project?"] },
];

/* The core knowledge. Each intent: id, kw (keywords/phrases after synonym
   normalisation), a (answer — string or array of variants). Keep answers
   warm, specific, and usually ending with a forward-moving question. */
export const INTENTS = [
  { id: 'pricing', kw: ['price', 'how much', 'how much do you charge'], a: ["Here's our pricing 👇\n• Starter — $299 (landing site)\n• Business — $699 (full multi-page + light 3D)\n• Premium 3D — $1,499+ (cinematic interactive experience)\nEvery project gets a free custom quote. What type of project is it, so I can point you to the right one? {{services:web-dev,web-design,landing-pages}}"] },
  { id: 'price_website', kw: ['price', 'website'], a: ["A standard website runs $299–$699 depending on pages and features. A 3D/animated one starts around $1,499. Tell me roughly how many pages and whether you want 3D, and I'll narrow it down."] },
  { id: 'price_ecom', kw: ['price', 'ecommerce'], a: ["E-commerce stores typically start around $699 and scale with the number of products and integrations (payments, shipping, inventory). How many products are you planning to sell?"] },
  { id: 'price_app', kw: ['price', 'app'], a: ["Mobile apps are quoted per scope — simple apps start around $1,499, bigger ones more. What should the app do? I'll give you a ballpark."] },
  { id: 'price_3d', kw: ['price', '3d'], a: ["A full 3D / WebGL experience starts at $1,499+ and depends on how many interactive scenes you want. Want me to suggest a scope that fits your budget?"] },
  { id: 'timeline', kw: ['time'], a: ["Timelines: a landing site goes live in 5–7 days, a full site in ~2 weeks, and 3D experiences, stores or apps in 3–6 weeks. When are you hoping to launch?"] },
  { id: 'services', kw: ['services', 'what do you do', 'what you offer', 'offerings'], a: ["We cover the whole journey: 3D/WebGL experiences, websites, UI/UX & logo design, e-commerce, mobile apps, SEO & marketing, and AI automation. Which one fits what you need? {{services:web-dev,uiux,ai-automation}}"] },
  { id: 'website', kw: ['website'], a: ["We build fast, modern, custom websites (Next.js/React) that look stunning and convert. 90+ PageSpeed, fully responsive, SEO-ready. Is this a new site or a redesign?"] },
  { id: 'ecommerce', kw: ['ecommerce'], a: ["We build online stores on Shopify, WooCommerce or fully custom — with payments, inventory, and conversion-focused design. What are you selling, and roughly how many products?"] },
  { id: 'app', kw: ['app'], a: ["We build mobile apps for Android & iOS from one codebase (React Native), with native-feel performance. What's the app idea?"] },
  { id: 'seo', kw: ['seo'], a: ["Our SEO covers technical fixes, local SEO, Google Business setup, content and reporting so you actually rank and get traffic. Do you have a site already, or starting fresh?"] },
  { id: 'design', kw: ['design'], a: ["We design in Figma — clean, modern interfaces and full design systems, with interactive prototypes before we build. Do you need just design, or design + build?"] },
  { id: 'logo', kw: ['logo'], a: ["Yes — we design logos and full brand identities (colours, type, guidelines). Do you want a standalone logo or branding as part of a website?"] },
  { id: '3d', kw: ['3d'], a: ["3D is our specialty 🔥 — cinematic, interactive experiences rendered live in the browser (the kind that win design awards), running smoothly even on mobile. Want a quick concept for your brand?"] },
  { id: 'ai', kw: ['ai'], a: ["We build AI automations — chatbots (like me!), lead capture, auto follow-ups and smart integrations that work 24/7. What would you want to automate?"] },
  { id: 'start', kw: ['start'], a: ["Love it — let's get you started! 🚀 Quick question first so I can tailor things: what are you looking to build?", "Awesome, let's do this 🚀 Tell me what you need and I'll set up your free quote right away."] },
  { id: 'contact', kw: ['contact'], a: ["Easiest is WhatsApp or a call at " + BUSINESS.phoneDisplay + ", or email " + BUSINESS.email + ". Want me to prepare a WhatsApp message with your project details so the team can reply fast?"] },
  { id: 'support', kw: ['support'], a: ["Every plan includes post-launch support, and we offer ongoing maintenance (updates, fixes, improvements) if you want us to keep optimising. Are you asking for a new build or support on an existing site?"] },
  { id: 'payment', kw: ['payment'], a: ["We usually take 50% to start and 50% at delivery, and accept bank transfer, cards, and PayPal (international too). For larger projects we can split into milestones. Does that work for you?"] },
  { id: 'hosting', kw: ['hosting'], a: ["We handle hosting, domains and deployment for you, or set it up on your accounts — your choice. Hosting is often very low-cost or free for the sites we build. Do you already have a domain?"] },
  { id: 'domain', kw: ['domain', 'domain name'], a: ["We can register and connect your domain, or use one you already own. Have a name in mind? I can help you pick one too."] },
  { id: 'revisions', kw: ['revise'], a: ["Yes — revisions are included. We refine the design with you until it's right (each plan includes a set of revision rounds). Want to see how our process works?"] },
  { id: 'refund', kw: ['refund'], a: ["We work in milestones with your sign-off at each stage, so you're never paying for work you haven't approved. We'll always make it right. What's your concern — I'm happy to address it directly."] },
  { id: 'portfolio', kw: ['portfolio'], a: ["You can see selected work in the Work section of this site — 3D experiences, stores, apps and brand sites. Want to see a few most relevant to your industry? {{portfolio}}"] },
  { id: 'location', kw: ['location'], a: ["We work with clients across 12+ countries fully online. Where are you located? We've likely worked in your timezone before."] },
  { id: 'international', kw: ['international', 'abroad', 'foreign', 'overseas', 'usa', 'uk', 'dubai', 'canada', 'australia', 'europe'], a: ["Absolutely — we work with international clients every week across 12+ countries, all over email, WhatsApp and video calls with clear milestones. Which country are you in?"] },
  { id: 'meeting', kw: ['meeting'], a: ["Happy to set up a quick call or demo. The fastest way is WhatsApp at " + BUSINESS.phoneDisplay + " — pick a slot and the team will confirm right away. {{meeting}}"] },
  { id: 'process', kw: ['process', 'how do you work', 'steps', 'workflow', 'procedure', 'how it works'], a: ["Our process is simple: 1) Discovery & strategy → 2) Design & 3D concept → 3) Build & integrate → 4) Launch & optimise. You sign off at each stage. Want to kick off step 1 with a free quote?"] },
  { id: 'tech', kw: ['tech', 'technology', 'tech stack', 'framework', 'react', 'nextjs', 'wordpress', 'language', 'built with'], a: ["We build with modern tech — Next.js/React, Three.js for 3D, Tailwind, Node, and WordPress/Shopify when that fits best. We pick what's right for your goals. Any preference on your side?"] },
  { id: 'mobile_responsive', kw: ['responsive', 'mobile friendly', 'phone', 'tablet', 'devices'], a: ["Every site we build is fully responsive and tested on phones, tablets and desktops — including the 3D, which adapts for mobile performance. Is most of your audience on mobile?"] },
  { id: 'performance', kw: ['speed', 'performance', 'fast loading', 'pagespeed', 'slow'], a: ["Performance is a core focus — we target 90+ PageSpeed and 60fps even with heavy visuals, using lazy loading and optimised assets. A fast site ranks better and converts more. Want us to audit your current site's speed?"] },
  { id: 'maintenance_plan', kw: ['amc', 'monthly', 'retainer', 'ongoing'], a: ["Yes, we offer monthly maintenance/retainer plans for updates, content changes, security and improvements. Want me to include a maintenance option in your quote?"] },
  { id: 'content', kw: ['content', 'copywriting', 'text', 'images', 'photos', 'copy'], a: ["We can write the copy and source/optimise images for you, or work with content you provide. Don't worry if you don't have content ready — we'll guide you. Do you have text and images, or need help?"] },
  { id: 'cms', kw: ['cms', 'edit', 'myself', 'edit myself', 'update content', 'admin panel', 'dashboard', 'manage'], a: ["Yes — we can build it so you easily edit content yourself (blog, products, pages) through a simple dashboard, no coding needed. Would self-editing be important for you?"] },
  { id: 'industries', kw: ['restaurant', 'real estate', 'clinic', 'doctor', 'gym', 'salon', 'school', 'hotel', 'startup', 'agency', 'portfolio site', 'personal'], a: ["We've built for many industries — restaurants, real estate, clinics, startups, agencies and personal brands. The approach is tailored to your audience. What's your business about?"] },
  { id: 'guarantee', kw: ['guarantee', 'assurance', 'promise', 'satisfaction'], a: ["We guarantee work you approve at every milestone, on-time delivery, and post-launch support. If something's not right, we fix it. Anything specific you'd like reassurance on?"] },
  { id: 'ownership', kw: ['ownership', 'own the code', 'source code', 'rights', 'who owns'], a: ["You own everything — the code, design and content — once the project is paid. No lock-in. Want that in writing in the proposal?"] },
  { id: 'nda', kw: ['nda', 'confidential', 'privacy', 'non disclosure'], a: ["Happy to sign an NDA — your idea and data stay confidential. Want us to send one over with the proposal?"] },
  { id: 'team', kw: ['team', 'who works', 'how many people', 'freelancer or company', 'company'], a: ["WEBRO is a dedicated studio team — design, 3D, engineering and AI working together (not a single freelancer juggling everything). You'll have a clear point of contact throughout. Want to meet the team on a call?"] },
  { id: 'languages_spoken', kw: ['english', 'hindi', 'language support', 'speak'], a: ["We work fluently in English and Hindi, and can build multi-language websites too. Which language(s) should your site support?"] },
  { id: 'multilingual', kw: ['multilingual', 'multi language', 'translation', 'languages on site'], a: ["Yes, we build multi-language sites with easy switching and proper SEO for each language. How many languages do you need?"] },
  { id: 'redesign', kw: ['redesign', 'revamp', 'improve existing', 'update my site', 'old site'], a: ["We love redesigns — we'll modernise the look, speed and conversions while keeping what works. Can you share your current site URL so I can take a quick look?"] },
  { id: 'analytics', kw: ['analytics', 'tracking', 'google analytics', 'measure'], a: ["We set up analytics and conversion tracking so you can see exactly what's working. Want reporting included in your plan?"] },
  { id: 'social', kw: ['social media', 'instagram', 'facebook', 'marketing', 'ads', 'campaign'], a: ["Beyond the website we offer SEO, social and ad campaigns to drive traffic. Want to bundle marketing with your build for better results?"] },
  { id: 'integrations', kw: ['integration', 'integrate', 'crm', 'whatsapp api', 'booking', 'calendar', 'payment gateway', 'api', 'connect tools'], a: ["We integrate whatever you need — payment gateways, CRMs, WhatsApp, booking/calendars, email tools and custom APIs. What tools do you want it to connect to?"] },
  { id: 'booking_system', kw: ['booking', 'appointment', 'reservation', 'schedule system'], a: ["Yes — we build booking/appointment systems with calendar sync, reminders and payments. What kind of bookings do you need to take?"] },
  { id: 'examples_3d', kw: ['3d examples', 'show 3d', '3d demo', 'like this site'], a: ["This very site is a live example of our 3D work 😄 — the floating hero and the scroll-driven assembling object. We can craft something just as immersive for your brand. Want a concept?"] },
  { id: 'free_quote', kw: ['free quote', 'estimate', 'quotation', 'get quote'], a: ["Yes — quotes are 100% free and no-obligation. I can start one right now. What are you looking to build?"] },
  { id: 'discount_offer', kw: ['offer', 'deal', 'discount', 'coupon', 'promo'], a: ["We occasionally run offers and can flex on scope to fit budgets 🙂 Tell me your budget and what you need — I'll get you the best possible package."] },
  { id: 'urgent', kw: ['urgent', 'asap', 'rush', 'immediately', 'today', 'tomorrow', 'quickly'], a: ["We can fast-track urgent projects — a landing page can go live in as little as 2–3 days. What's your deadline? Let's make it happen."] },
  { id: 'small_business', kw: ['small business', 'startup budget', 'low budget', 'tight budget'], a: ["We work with plenty of small businesses and startups — the $299 Starter is built exactly for that, and we can grow your site as you grow. What's your business?"] },
  { id: 'enterprise', kw: ['enterprise', 'large project', 'big company', 'corporate'], a: ["We handle larger, complex builds too — multi-page platforms, integrations, custom 3D and ongoing support with clear SLAs. Want to set up a scoping call?"] },
  { id: 'accessibility', kw: ['accessibility', 'accessible', 'disabled', 'screen reader', 'wcag'], a: ["Accessibility is built in — keyboard navigation, screen-reader support, focus states and reduced-motion options. Is accessibility a specific requirement for you?"] },
  { id: 'security', kw: ['security', 'secure', 'hacking', 'ssl', 'https', 'protection'], a: ["Security comes standard — HTTPS/SSL, secure code, and best practices to protect your site and users' data. Any specific security needs (logins, payments)?"] },
  { id: 'hosting_cost', kw: ['hosting cost', 'monthly cost', 'running cost', 'recurring'], a: ["Running costs are usually low — domain (~$12–20/yr) and hosting that's often free or a few dollars a month for the sites we build. Want exact numbers in your quote?"] },
  { id: 'maintenance_free', kw: ['free maintenance', 'free support', 'warranty'], a: ["Yes — every project includes a support window after launch at no extra cost to fix any issues. After that, optional maintenance keeps things fresh. Sound good?"] },
  { id: 'sample_work', kw: ['can i see', 'send samples', 'reference'], a: ["Of course — I can share relevant samples. What industry are you in, so I send the most useful ones?"] },
  { id: 'why_3d', kw: ['why 3d', 'benefit of 3d', 'need 3d', 'point of 3d'], a: ["3D makes people stop, explore and remember you — it boosts time-on-site and conversions and instantly signals a premium brand. Even subtle 3D accents lift a site hugely. Curious what it'd look like for you?"] },
  { id: 'help_decide', kw: ['not sure what i need', 'help me decide', 'recommend', 'suggestion', 'what should i'], a: ["No problem — that's what I'm here for 🙂 Tell me about your business and your goal (more sales, more leads, look premium…) and I'll recommend the right approach."] },
  { id: 'how_many_pages', kw: ['how many pages', 'number of pages', 'pages needed'], a: ["Most small business sites need 4–6 pages (Home, About, Services, Portfolio, Contact). We'll advise based on your goals. Do you know roughly what pages you want?"] },
  { id: 'free_consultation', kw: ['consultation', 'advice', 'talk to expert'], a: ["The first consultation is free — we'll review your goals and suggest the best path, no pressure. Want to lock a slot? {{meeting}}"] },
];

/* ---------- Nova service catalogue (rendered as {{services:…}} cards) ---------- */
export const NOVA_SERVICES = [
  { id: 'web-design', name: 'Website Design', short: 'Premium UI design that makes brands feel expensive.', priceFrom: '$299', timeline: '1–3 weeks', detail: 'Research-driven, conversion-first website design in Figma: information architecture, wireframes, high-fidelity UI, an interactive prototype and a full design-system handoff.' },
  { id: 'web-dev', name: 'Website Development', short: 'Fast, SEO-ready websites on modern stacks.', priceFrom: '$499', timeline: '2–6 weeks', detail: 'Pixel-perfect development of marketing sites, corporate sites and e-commerce on Next.js, React, Tailwind, Shopify or WordPress. Performance, accessibility and SEO are part of the definition of done.' },
  { id: 'uiux', name: 'UI/UX Design', short: 'Product design users understand in seconds.', priceFrom: '$449', timeline: '2–5 weeks', detail: 'End-to-end product design: user flows, wireframes, usability testing, design systems and developer-ready specs for web and mobile apps.' },
  { id: 'seo', name: 'SEO', short: 'Technical + content SEO that compounds monthly.', priceFrom: '$199/mo', timeline: 'compounds over 3–6 months', detail: 'Technical audits, on-page optimization, content strategy, local SEO and monthly reporting. We fix what blocks rankings, then build what earns them.' },
  { id: 'branding', name: 'Branding', short: 'Identity systems: logo, voice, guidelines.', priceFrom: '$249', timeline: '1–3 weeks', detail: 'Naming support, logo design, colour and type systems, brand voice and a practical brand book your whole team can actually use.' },
  { id: 'graphic-design', name: 'Graphic Design', short: 'Scroll-stopping creatives for every channel.', priceFrom: '$99/mo', timeline: 'ongoing or per project', detail: 'Social creatives, ad banners, pitch decks, brochures and packaging — on a predictable monthly cadence or per project.' },
  { id: 'social-media', name: 'Social Media Management', short: 'Strategy, content and growth, handled end to end.', priceFrom: '$149/mo', timeline: 'monthly retainer', detail: 'Content calendars, creative production, posting, community management and monthly analytics across Instagram, LinkedIn, X and Facebook.' },
  { id: 'ai-automation', name: 'AI Automation', short: 'Automate the busywork with AI agents and workflows.', priceFrom: '$399', timeline: '1–4 weeks', detail: 'Custom AI workflows: document processing, email triage, CRM enrichment, report generation and internal copilots built on OpenAI and open-source models.' },
  { id: 'whatsapp-automation', name: 'WhatsApp Automation', short: 'Sell and support where your customers already are.', priceFrom: '$249', timeline: '1–2 weeks', detail: 'WhatsApp Business API setup, automated replies, broadcast campaigns, catalogues, order updates and AI conversations with human handover.' },
  { id: 'chatbots', name: 'AI Chatbots', short: '24/7 AI sales reps trained on your business.', priceFrom: '$299', timeline: '1–3 weeks', detail: 'Custom AI chatbots (like Nova) trained on your services, pricing and FAQs — capturing leads, qualifying them and booking meetings around the clock.' },
  { id: 'custom-software', name: 'Custom Software', short: 'Web apps, dashboards, portals and internal tools.', priceFrom: '$999', timeline: '4–12 weeks', detail: 'Full-stack product development: CRMs, booking systems, client portals, admin dashboards and SaaS MVPs with clean, maintainable architecture.' },
  { id: 'landing-pages', name: 'Landing Pages', short: 'Single pages engineered for one job: conversion.', priceFrom: '$149', timeline: '3–7 days', detail: 'Copy-assisted, A/B-testable landing pages with analytics wired in. Ideal for campaigns, launches and lead generation.' },
  { id: 'performance', name: 'Performance Optimization', short: 'Make slow sites fast — and keep them fast.', priceFrom: '$129', timeline: '3–10 days', detail: 'Core Web Vitals rescue: audits, image/CDN strategy, code splitting, caching and monitoring. Typical outcome: 90+ Lighthouse scores.' },
];

/* ---------- Case studies (rendered as {{portfolio}} cards) ---------- */
export const NOVA_CASES = [
  { id: 'aurum', industry: 'Luxury cafe & lounge', headline: 'Aurum Café — immersive WebGL brand site', result: 'A live 3D hero with scroll-driven storytelling and a molecular-craft aesthetic.', url: 'https://sh0urya07.github.io/aurum/' },
  { id: 'brewingbliss', industry: 'Coffee shop · Jaipur', headline: 'Brewing Bliss Café — warm, conversion-focused site', result: 'Menu, offers, reviews and table reservations in a cozy, on-brand experience.', url: 'https://sh0urya07.github.io/brewing-bliss-cafe/' },
  { id: 'anokhi', industry: 'Organic cafe · Jaipur', headline: 'Anokhi Café — editorial farm-to-table brand site', result: 'A refined, organic aesthetic with a smooth reservation flow.', url: 'https://sh0urya07.github.io/anokhi/' },
  { id: 'kyfesto', industry: 'Specialty coffee · Jaipur', headline: 'Kyfesto Café — golden-lit cafe website', result: 'Menu, gallery and reservations, tuned to convert.', url: 'https://sh0urya07.github.io/kyfesto-remake/' },
  { id: 'croslay', industry: 'Handmade crochet', headline: 'cro_slayy_holic — playful crochet storefront', result: 'Shop the pieces, request custom orders, and DM-to-buy.', url: 'https://sh0urya07.github.io/cro-slayy-holic/' },
];

/* ===== chatbot ===== */

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
    NOVA_CASES.slice(0, 4).forEach((c) => {
      const d = document.createElement(c.url ? 'a' : 'div');
      d.className = 'nova-card nova-case';
      if (c.url) { d.href = c.url; d.target = '_blank'; d.rel = 'noopener noreferrer'; }
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

  // ---- optional real-LLM path (falls back to the on-device engine) ----
  const llmHistory = [];
  async function askLLM(text) {
    showTyping();
    try {
      const r = await fetch(NOVA_LLM, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history: llmHistory.slice(-8) }),
      });
      if (!r.ok) throw new Error('llm ' + r.status);
      const data = await r.json();
      const reply = (data && (data.reply || data.text || data.message || data.content)) || '';
      hideTyping();
      if (!reply) { localRoute(text); return; }
      llmHistory.push({ role: 'user', content: text }, { role: 'assistant', content: reply });
      say(reply);
    } catch (e) {
      hideTyping();
      localRoute(text); // graceful fallback — chat never breaks
    }
  }

  function route(raw) {
    const text0 = String(raw || '').trim();
    if (!text0) return;
    // Use the real LLM when a proxy is configured (but let the built-in
    // lead-capture flow finish first).
    if (NOVA_LLM && !step) { askLLM(text0); return; }
    localRoute(text0);
  }

  function localRoute(raw) {
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

    // Fallback — outside Nova's knowledge: offer a live web search + a human.
    const q = encodeURIComponent(String(text).slice(0, 140));
    say({
      msg: "That's a little outside what I can answer directly, and I'd rather not guess. Here's a quick web search for it — or talk to a human on WhatsApp: {{meeting}}",
      link: { text: 'Search the web ↗', href: `https://www.google.com/search?q=${q}` },
    });
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
