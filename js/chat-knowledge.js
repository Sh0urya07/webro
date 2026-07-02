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
  { id: 'aurora', industry: 'Interior design studio', headline: 'A portfolio site that books consultations on autopilot', result: '2.4× more consultation requests within 90 days; page-1 rankings for 12 local keywords.' },
  { id: 'fitfuel', industry: 'D2C nutrition brand', headline: 'Abandoned carts recovered over WhatsApp', result: '18% of abandoned carts recovered via automated WhatsApp flows; support replies cut from hours to seconds.' },
  { id: 'lexbridge', industry: 'Legal consultancy', headline: 'An AI intake assistant that qualifies clients 24/7', result: '61% of qualified leads arrive pre-screened with case details; partners save ~10 hours a week on intake.' },
  { id: 'novacart', industry: 'Retail SaaS', headline: 'From 41 to 96 Lighthouse in three weeks', result: 'Checkout completion up 14% after the redesign and performance rescue; bounce rate down 23%.' },
];
