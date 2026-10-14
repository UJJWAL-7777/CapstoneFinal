// ═══════════════════════════════════════════════════════════════
// LexBot — LegalConnect Chatbot Intelligence Engine v2
// With navigation links, quick actions, and role-aware routing
// ═══════════════════════════════════════════════════════════════

const INTENTS = {
  GREETING: 'greeting',
  FAREWELL: 'farewell',
  HELP: 'help',
  LEGAL_QUERY: 'legal_query',
  BOOKING: 'booking',
  CASE_STATUS: 'case_status',
  PAYMENT: 'payment',
  DOCUMENT: 'document',
  CONSULTATION: 'consultation',
  PROFILE: 'profile',
  REVIEW: 'review',
  COMPLAINT: 'complaint',
  NAVIGATION: 'navigation',
  UNKNOWN: 'unknown',
};

// ─── Pattern Definitions ────────────────────────────────────────
const GREETING_PATTERNS = [
  /^(hi|hello|hey|good\s*(morning|afternoon|evening)|namaste|greetings|howdy|sup)/i,
];
const FAREWELL_PATTERNS = [
  /^(bye|goodbye|see you|take care|thanks|thank you|tata|alvida|done|that'?s all)/i,
];
const HELP_PATTERNS = [
  /\b(help|how\s+to|guide|what\s+can\s+you\s+do|features|tutorial|explain|show me)\b/i,
];
const BOOKING_PATTERNS = [
  /\b(book|appointment|schedule|slot|hire|consult)\b/i,
];
const CASE_PATTERNS = [
  /\b(case|case\s*status|my\s*case|track|progress|hearing|update|court)\b/i,
];
const PAYMENT_PATTERNS = [
  /\b(pay|payment|fee|cost|charge|billing|invoice|receipt|escrow|refund|price|amount|money)\b/i,
];
const DOCUMENT_PATTERNS = [
  /\b(document|upload|file|paperwork|evidence|proof|certificate|affidavit)\b/i,
];
const CONSULTATION_PATTERNS = [
  /\b(consultation|upcoming|next|video\s*call|session|meeting|attend|join)\b/i,
];
const PROFILE_PATTERNS = [
  /\b(profile|account|edit\s*profile|update\s*info|personal|details|change\s*password)\b/i,
];
const REVIEW_PATTERNS = [
  /\b(review|rating|feedback|star|experience|recommend)\b/i,
];
const COMPLAINT_PATTERNS = [
  /\b(complaint|report|issue|problem|bug|error|wrong|fraud)\b/i,
];
const NAVIGATION_PATTERNS = [
  /\b(go\s+to|navigate|open|take\s+me|show\s+me|where\s+is|find|visit)\b/i,
  /\b(dashboard|messages|settings|notifications|clients|availability|calendar|advocates|earnings|badges|analytics|verification|users)\b/i,
];

// ─── Legal Practice Areas ───────────────────────────────────────
const PRACTICE_AREAS = {
  'Family Law': ['divorce', 'marriage', 'custody', 'alimony', 'maintenance', 'adoption', 'domestic violence', 'dowry', 'matrimonial', 'child support', 'guardian', 'separation'],
  'Property Law': ['property', 'land', 'real estate', 'builder', 'possession', 'title', 'registry', 'encroachment', 'rent', 'tenancy', 'eviction', 'lease', 'house', 'flat', 'sale deed', 'dispute'],
  'Criminal Law': ['fir', 'police', 'arrest', 'bail', 'crime', 'theft', 'fraud', 'assault', 'murder', 'cheating', 'criminal', 'accused', 'victim'],
  'Corporate Law': ['company', 'startup', 'incorporation', 'shareholder', 'director', 'mou', 'partnership', 'llp', 'pvt ltd', 'merger', 'acquisition', 'contract', 'board'],
  'Civil Litigation': ['civil', 'suit', 'injunction', 'damages', 'compensation', 'plaintiff', 'defendant', 'appeal', 'decree'],
  'Labour & Employment': ['employment', 'job', 'salary', 'termination', 'wrongful', 'labour', 'worker', 'employer', 'pf', 'gratuity', 'esi', 'retrenchment', 'workplace'],
  'Consumer Protection': ['consumer', 'product', 'defective', 'refund', 'service', 'forum', 'redressal', 'unfair trade', 'misleading'],
  'Tax Law': ['income tax', 'gst', 'tax', 'itr', 'assessment', 'penalty', 'tds', 'exemption'],
  'Intellectual Property': ['patent', 'trademark', 'copyright', 'ip', 'design', 'brand', 'infringement', 'plagiarism', 'license'],
  'Cyber Law': ['cyber', 'online', 'hacking', 'data', 'privacy', 'social media', 'it act', 'digital', 'internet', 'cybercrime'],
  'Banking & Finance': ['bank', 'loan', 'emi', 'nbfc', 'cheque', 'bounce', 'debt', 'recovery', 'credit', 'mortgage', 'insolvency'],
};

// ─── Legal Info Database ────────────────────────────────────────
const LEGAL_INFO = {
  'Family Law': {
    summary: 'Family law in India is governed by personal laws like the Hindu Marriage Act, Muslim Personal Law, and the Special Marriage Act.',
    steps: ['Gather your marriage certificate and relevant documents', 'Browse our verified Family Law advocates', 'Book a consultation to discuss your specific situation', 'Your advocate will guide you on the appropriate legal remedy'],
    urgentNote: "If you're in immediate danger due to domestic violence, please call the Women Helpline at 181 or the Police at 100.",
  },
  'Property Law': {
    summary: 'Property disputes involve title verification, encroachment, tenancy, sale agreements, and builder disputes under the Transfer of Property Act.',
    steps: ['Collect your property documents (sale deed, title, tax receipts)', 'Find a Property Law advocate on LegalConnect', 'Schedule a consultation to review your documents', 'Your advocate will advise on the best course of action'],
  },
  'Criminal Law': {
    summary: 'Criminal matters are governed by the Bharatiya Nyaya Sanhita (BNS) 2023. Everyone has the right to legal representation.',
    steps: ['If a crime occurred, file an FIR at the nearest police station', 'Consult a Criminal Law advocate immediately', 'Preserve all evidence and records', 'Your advocate will represent you in court proceedings'],
    urgentNote: 'For immediate legal assistance regarding arrest or bail, call our emergency legal helpline.',
  },
  'Corporate Law': {
    summary: 'Business and corporate matters are governed by the Companies Act 2013 including incorporation, shareholder disputes, and regulatory compliance.',
    steps: ['Gather your company documents (MOA, AOA, resolutions)', 'Identify the specific corporate issue', 'Find a Corporate Law advocate on LegalConnect', 'Schedule a consultation for professional guidance'],
  },
  'Consumer Protection': {
    summary: 'Consumer rights are protected under the Consumer Protection Act 2019. File complaints against defective products or deficient services.',
    steps: ['Keep purchase receipts, warranty documents, and correspondence', 'Try filing a complaint with the company first', 'If unresolved, consult an advocate to file a consumer court case', 'Cases can be filed in District, State, or National Consumer Forum'],
  },
  'Labour & Employment': {
    summary: 'Employment disputes are covered by the Industrial Disputes Act, Payment of Wages Act, and other labour laws.',
    steps: ['Collect your employment contract and pay slips', 'Document any correspondence related to the dispute', 'Consult a Labour Law advocate for guidance', 'Cases may be addressed through Labour Courts or Industrial Tribunals'],
  },
  'Tax Law': {
    summary: 'Tax matters are governed by the Income Tax Act and GST Act. Tax notices require prompt response within the specified timeframe.',
    steps: ['Gather your ITR filings, tax notices, and bank statements', 'Note the deadline mentioned in any notice', 'Consult a Tax Law advocate before responding', 'Your advocate will prepare the appropriate response or appeal'],
  },
  'Cyber Law': {
    summary: 'Cybercrime is addressed under the Information Technology Act 2000. Report cybercrime at cybercrime.gov.in.',
    steps: ['Take screenshots and preserve all digital evidence', 'Report at cybercrime.gov.in or nearest police station', 'Consult a Cyber Law advocate for legal remedies', 'Your advocate will guide you through the investigation'],
    urgentNote: 'For urgent cyber fraud, immediately contact your bank and file an FIR.',
  },
  'Intellectual Property': {
    summary: 'IP rights in India are protected under the Patents Act, Trade Marks Act, and Copyright Act.',
    steps: ['Identify the type of IP protection you need', 'Gather evidence of creation or use', 'Consult an IP advocate for registration or dispute resolution', 'Your advocate will handle filing and prosecution'],
  },
  'Banking & Finance': {
    summary: 'Banking disputes can be addressed through the Banking Ombudsman, Debt Recovery Tribunals, or civil courts.',
    steps: ['Collect loan agreements, bank statements, and correspondence', 'File a complaint with the Banking Ombudsman if applicable', 'Consult a Banking Law advocate for complex disputes', 'Your advocate will advise on DRT proceedings if needed'],
  },
  'Civil Litigation': {
    summary: 'Civil disputes are resolved through the Civil Procedure Code. Process involves filing a plaint and attending hearings.',
    steps: ['Gather all relevant agreements and correspondence', 'Identify the appropriate court jurisdiction', 'Consult a Civil Litigation advocate', 'Your advocate will draft the plaint and represent you in court'],
  },
};

// ─── Navigation Maps (role → page routes) ───────────────────────
const NAV_ROUTES = {
  client: {
    dashboard:     { path: '/client/dashboard',      label: 'Dashboard',        icon: '📊', desc: 'Overview of your cases, consultations, and activity' },
    advocates:     { path: '/client/advocates',      label: 'Find Advocates',   icon: '🔍', desc: 'Browse verified legal professionals' },
    consultations: { path: '/client/consultations',  label: 'Consultations',    icon: '📅', desc: 'View upcoming and past consultations' },
    cases:         { path: '/client/cases',          label: 'My Cases',         icon: '📋', desc: 'Track all your legal cases' },
    documents:     { path: '/client/documents',      label: 'Documents',        icon: '📁', desc: 'Upload and manage legal files' },
    messages:      { path: '/client/messages',       label: 'Messages',         icon: '💬', desc: 'Chat with your advocates' },
    notifications: { path: '/client/notifications',  label: 'Notifications',    icon: '🔔', desc: 'View alerts and updates' },
    profile:       { path: '/client/profile',        label: 'Profile',          icon: '👤', desc: 'Update your personal information' },
    settings:      { path: '/client/settings',       label: 'Settings',         icon: '⚙️', desc: 'Manage account preferences' },
  },
  advocate: {
    dashboard:     { path: '/advocate/dashboard',     label: 'Dashboard',        icon: '📊', desc: "Today's schedule and practice overview" },
    consultations: { path: '/advocate/consultations', label: 'Consultations',    icon: '📅', desc: 'Manage booking requests' },
    clients:       { path: '/advocate/clients',       label: 'Clients',          icon: '👥', desc: 'View your client directory' },
    cases:         { path: '/advocate/cases',         label: 'Cases',            icon: '📋', desc: 'Track and update case progress' },
    messages:      { path: '/advocate/messages',      label: 'Messages',         icon: '💬', desc: 'Communicate with clients' },
    availability:  { path: '/advocate/availability',  label: 'Availability',     icon: '🕐', desc: 'Set your consultation schedule' },
    earnings:      { path: '/advocate/earnings',      label: 'Earnings',         icon: '💰', desc: 'Track payments and payouts' },
    reviews:       { path: '/advocate/reviews',       label: 'Reviews',          icon: '⭐', desc: 'Client feedback and ratings' },
    badges:        { path: '/advocate/badges',        label: 'Badges',           icon: '🏆', desc: 'Platform achievements' },
    profile:       { path: '/advocate/profile',       label: 'Profile',          icon: '👤', desc: 'Professional profile and credentials' },
    settings:      { path: '/advocate/settings',      label: 'Settings',         icon: '⚙️', desc: 'Account preferences and security' },
  },
  admin: {
    dashboard:     { path: '/admin/dashboard',       label: 'Dashboard',        icon: '📊', desc: 'Platform KPIs and statistics' },
    users:         { path: '/admin/users',           label: 'Users',            icon: '👥', desc: 'Manage all platform users' },
    verification:  { path: '/admin/verification',    label: 'Verification',     icon: '✅', desc: 'Approve advocate credentials' },
    consultations: { path: '/admin/consultations',   label: 'Consultations',    icon: '📅', desc: 'Monitor all consultations' },
    cases:         { path: '/admin/cases',           label: 'Cases',            icon: '📋', desc: 'View all platform cases' },
    payments:      { path: '/admin/payments',        label: 'Payments',         icon: '💳', desc: 'Monitor transactions and escrow' },
    badges:        { path: '/admin/badges',          label: 'Badges',           icon: '🏆', desc: 'Manage badge system' },
    analytics:     { path: '/admin/analytics',       label: 'Analytics',        icon: '📈', desc: 'Platform trends and growth' },
    settings:      { path: '/admin/settings',        label: 'Settings',         icon: '⚙️', desc: 'Platform configuration' },
  },
};

// ─── FAQ Database ───────────────────────────────────────────────
const FAQS = [
  {
    patterns: [/how\s+(do|can|to)\s+(i\s+)?(book|schedule)/i, /book\s+a?\s*(consultation|appointment)/i],
    answer: 'To book a consultation:\n\n1. Go to **Find Advocates** from the sidebar\n2. Browse advocates by practice area or search by name\n3. Click on an advocate to view their profile\n4. Click **Book Consultation**\n5. Select your preferred date and available time slot\n6. Confirm booking and complete payment\n\nYou\'ll receive a confirmation notification once booked! 📅',
    navLinks: (role) => [NAV_ROUTES[role]?.advocates || NAV_ROUTES[role]?.consultations].filter(Boolean),
  },
  {
    patterns: [/how\s+(do|can|to)\s+(i\s+)?(track|check|see)\s+(my\s+)?case/i, /case\s*status/i, /where.*(case|track)/i],
    answer: 'To track your case:\n\n1. Go to **My Cases** from the sidebar\n2. Click on a case to open the workspace\n3. View the full timeline, status, documents, and notes\n\nYou\'ll get notifications when your advocate updates the case! 📋',
    navLinks: (role) => [NAV_ROUTES[role]?.cases].filter(Boolean),
  },
  {
    patterns: [/how\s+(do|can|to)\s+(i\s+)?(upload|share)\s+(a\s+)?document/i, /upload\s*document/i],
    answer: 'To upload documents:\n\n1. Go to **Documents** from the sidebar\n2. Click **Upload Document**\n3. Drag & drop or select your files\n4. Add a title and link to a case\n\nYou can also upload within a case workspace! 📁',
    navLinks: (role) => [NAV_ROUTES[role]?.documents || NAV_ROUTES[role]?.cases].filter(Boolean),
  },
  {
    patterns: [/how\s+(do|can|to)\s+(i\s+)?pay/i, /payment\s*(method|option|process)/i, /escrow/i],
    answer: 'LegalConnect uses a secure **escrow payment system**:\n\n1. When you book a consultation, the fee is held in escrow\n2. After completion, payment is released to the advocate\n3. View history under your dashboard\n4. Refunds are processed for cancelled consultations\n\nAll transactions are secure and traceable! 💳',
    navLinks: (role) => [NAV_ROUTES[role]?.payments || NAV_ROUTES[role]?.earnings].filter(Boolean),
  },
  {
    patterns: [/how\s+(do|can|to)\s+(i\s+)?message/i, /chat\s+with/i, /send\s*message/i],
    answer: 'To message your advocate:\n\n1. Go to **Messages** from the sidebar\n2. Select a conversation or start a new one\n3. Type and send messages in real-time\n4. You can share documents in chat too! 💬',
    navLinks: (role) => [NAV_ROUTES[role]?.messages].filter(Boolean),
  },
  {
    patterns: [/video\s*call/i, /join\s*(call|meeting|video)/i, /how.*(video|call)/i],
    answer: 'To join a video consultation:\n\n1. Go to **Consultations** from the sidebar\n2. Find your upcoming confirmed session\n3. Click **Join Video Call** when it\'s time\n4. Allow camera and microphone access\n\nVideo calls are secure and private! 📹',
    navLinks: (role) => [NAV_ROUTES[role]?.consultations].filter(Boolean),
  },
  {
    patterns: [/cost|price|fee|how\s+much|charges/i],
    answer: 'Consultation fees vary by advocate and are displayed on their profile:\n\n• Fees are shown per consultation slot (typically 30 min)\n• You can see the exact fee before booking\n• Payment is held in escrow until completion\n• Refunds available for cancellations\n\nBrowse advocates to see their fees! 💰',
    navLinks: (role) => [NAV_ROUTES[role]?.advocates].filter(Boolean),
  },
  {
    patterns: [/refund|cancel.*(?:booking|consultation)|cancellation/i],
    answer: 'Regarding cancellations:\n\n• Cancel pending consultations from the **Consultations** page\n• Cancellations before scheduled time get full refund\n• Refunds go back to original payment method\n• Raise a **Report** for issues\n\nNeed help? Contact support! 🔄',
    navLinks: (role) => [NAV_ROUTES[role]?.consultations].filter(Boolean),
  },
  {
    patterns: [/safe|secure|privacy|data|trust/i],
    answer: 'LegalConnect takes security seriously:\n\n🔒 **Encryption**: All data encrypted in transit and at rest\n🛡️ **Verified Advocates**: Bar Council credentials verified\n💼 **Escrow Payments**: Money protected until service delivered\n🔐 **Secure Messaging**: Private communication channel\n📋 **Audit Trail**: All activities logged for transparency',
  },
];

// ─── Navigation Keyword Map ─────────────────────────────────────
const NAV_KEYWORDS = {
  dashboard:     ['dashboard', 'home', 'overview', 'main'],
  advocates:     ['advocate', 'lawyer', 'find advocate', 'search advocate', 'browse'],
  consultations: ['consultation', 'appointment', 'booking', 'session'],
  cases:         ['case', 'my case', 'cases', 'legal case'],
  documents:     ['document', 'upload', 'file', 'paperwork'],
  messages:      ['message', 'chat', 'inbox', 'conversation'],
  notifications: ['notification', 'alert', 'bell', 'update'],
  profile:       ['profile', 'my profile', 'personal', 'info'],
  settings:      ['setting', 'preference', 'config', 'security', 'password'],
  clients:       ['client', 'my client'],
  availability:  ['availability', 'calendar', 'schedule', 'time slot'],
  earnings:      ['earning', 'income', 'payout', 'revenue'],
  reviews:       ['review', 'rating', 'feedback', 'star'],
  badges:        ['badge', 'achievement', 'award'],
  users:         ['user', 'user management', 'all users'],
  verification:  ['verification', 'verify', 'approve', 'pending'],
  payments:      ['payment', 'transaction', 'escrow', 'billing'],
  analytics:     ['analytics', 'stats', 'statistics', 'trend', 'growth'],
};

// ─── Detect Target Page ─────────────────────────────────────────
function detectNavTarget(text, role) {
  const lower = text.toLowerCase();
  const routes = NAV_ROUTES[role] || NAV_ROUTES.client;
  
  for (const [key, keywords] of Object.entries(NAV_KEYWORDS)) {
    if (routes[key] && keywords.some(kw => lower.includes(kw))) {
      return routes[key];
    }
  }
  return null;
}

// ─── Intent Detection ───────────────────────────────────────────
function detectIntent(message) {
  const text = message.trim();

  if (GREETING_PATTERNS.some(p => p.test(text))) return INTENTS.GREETING;
  if (FAREWELL_PATTERNS.some(p => p.test(text))) return INTENTS.FAREWELL;

  // Check FAQs
  for (const faq of FAQS) {
    if (faq.patterns.some(p => p.test(text))) return INTENTS.HELP;
  }

  // Navigation intent (explicit "go to", "open", "take me to")
  if (/\b(go\s+to|navigate|open|take\s+me|visit|show\s+me\s+my)\b/i.test(text)) return INTENTS.NAVIGATION;

  // Legal queries before generic intents
  const lowerText = text.toLowerCase();
  for (const keywords of Object.values(PRACTICE_AREAS)) {
    if (keywords.some(kw => lowerText.includes(kw))) return INTENTS.LEGAL_QUERY;
  }

  if (COMPLAINT_PATTERNS.some(p => p.test(text))) return INTENTS.COMPLAINT;
  if (BOOKING_PATTERNS.some(p => p.test(text))) return INTENTS.BOOKING;
  if (CONSULTATION_PATTERNS.some(p => p.test(text))) return INTENTS.CONSULTATION;
  if (CASE_PATTERNS.some(p => p.test(text))) return INTENTS.CASE_STATUS;
  if (PAYMENT_PATTERNS.some(p => p.test(text))) return INTENTS.PAYMENT;
  if (DOCUMENT_PATTERNS.some(p => p.test(text))) return INTENTS.DOCUMENT;
  if (PROFILE_PATTERNS.some(p => p.test(text))) return INTENTS.PROFILE;
  if (REVIEW_PATTERNS.some(p => p.test(text))) return INTENTS.REVIEW;
  if (NAVIGATION_PATTERNS.some(p => p.test(text))) return INTENTS.NAVIGATION;
  if (HELP_PATTERNS.some(p => p.test(text))) return INTENTS.HELP;

  return INTENTS.UNKNOWN;
}

// ─── Practice Area Detection ────────────────────────────────────
function detectPracticeArea(text) {
  const lower = text.toLowerCase();
  const scores = {};
  for (const [area, keywords] of Object.entries(PRACTICE_AREAS)) {
    scores[area] = keywords.filter(kw => lower.includes(kw)).length;
  }
  const sorted = Object.entries(scores).filter(([, s]) => s > 0).sort(([, a], [, b]) => b - a);
  return sorted[0]?.[0] || null;
}

// ─── FAQ Matcher ────────────────────────────────────────────────
function findFAQ(message, role) {
  for (const faq of FAQS) {
    if (faq.patterns.some(p => p.test(message))) {
      return { answer: faq.answer, navLinks: faq.navLinks?.(role) || [] };
    }
  }
  return null;
}

// ═══════════════════════════════════════════════════════════════
// Main Export: Generate Chat Response
// ═══════════════════════════════════════════════════════════════
export function generateChatResponse(message, userRole, userName) {
  const intent = detectIntent(message);
  const role = userRole || 'client';
  const name = userName?.split(' ')[0] || 'there';
  const routes = NAV_ROUTES[role] || NAV_ROUTES.client;

  let response = '';
  let suggestions = [];
  let navLinks = [];   // { path, label, icon, desc }
  let quickActions = []; // suggestion chips with paths
  let type = 'text';

  switch (intent) {
    case INTENTS.GREETING: {
      const greetings = [
        `Hello ${name}! 👋 I'm **LexBot**, your LegalConnect assistant.\n\nI can help you navigate the platform, answer legal questions, and guide you through features. What would you like to do?`,
        `Hi ${name}! Welcome to LegalConnect. 🙏\n\nI can help you with bookings, cases, payments, legal queries, and more. Just ask!`,
        `Namaste ${name}! ✨\n\nI'm your AI legal assistant. Ask me anything about the platform or your legal matters!`,
      ];
      response = greetings[Math.floor(Math.random() * greetings.length)];

      if (role === 'client') {
        quickActions = [
          { label: '🔍 Find Advocates', path: routes.advocates?.path },
          { label: '📋 My Cases', path: routes.cases?.path },
          { label: '📅 Consultations', path: routes.consultations?.path },
        ];
        suggestions = ['Book a consultation', 'Track my case', 'How does payment work?'];
      } else if (role === 'advocate') {
        quickActions = [
          { label: '📅 Consultations', path: routes.consultations?.path },
          { label: '💰 Earnings', path: routes.earnings?.path },
          { label: '🕐 Availability', path: routes.availability?.path },
        ];
        suggestions = ['View consultations', 'Check earnings', 'Update availability'];
      } else {
        quickActions = [
          { label: '📊 Dashboard', path: routes.dashboard?.path },
          { label: '✅ Verifications', path: routes.verification?.path },
          { label: '📈 Analytics', path: routes.analytics?.path },
        ];
        suggestions = ['Platform overview', 'Pending verifications', 'View analytics'];
      }
      break;
    }

    case INTENTS.FAREWELL: {
      const farewells = [
        `Goodbye ${name}! 👋 Don't hesitate to reach out if you need help.`,
        `Take care ${name}! I'm always here for legal assistance. 🙏`,
        `Thanks for chatting! Wishing you all the best. 😊`,
      ];
      response = farewells[Math.floor(Math.random() * farewells.length)];
      break;
    }

    case INTENTS.NAVIGATION: {
      const target = detectNavTarget(message, role);
      if (target) {
        response = `Taking you to **${target.label}**! 🚀\n\n${target.desc}`;
        navLinks = [target];
        type = 'navigation';
      } else {
        response = `Here are all the pages you can navigate to:\n\nClick any button below to go directly! 🗺️`;
        navLinks = Object.values(routes);
        type = 'navigation';
      }
      break;
    }

    case INTENTS.HELP: {
      const faqResult = findFAQ(message, role);
      if (faqResult) {
        response = faqResult.answer;
        navLinks = faqResult.navLinks || [];
        type = 'faq';
        break;
      }

      if (role === 'client') {
        response = `Here's what I can help you with, ${name}:\n\n` +
          '🔍 **Find Advocates** — Browse verified lawyers\n' +
          '📅 **Book Consultations** — Schedule video calls\n' +
          '📋 **Track Cases** — Monitor case progress\n' +
          '💬 **Messages** — Chat with your advocate\n' +
          '📁 **Documents** — Upload legal files\n' +
          '💳 **Payments** — View billing history\n' +
          '⚖️ **Legal Guidance** — Ask about any legal topic!\n\n' +
          'Click a page below or type your question!';
        navLinks = [routes.advocates, routes.consultations, routes.cases, routes.messages, routes.documents].filter(Boolean);
      } else if (role === 'advocate') {
        response = `Here's what I can help you with, ${name}:\n\n` +
          '📅 **Consultations** — Manage bookings\n' +
          '🕐 **Availability** — Set your schedule\n' +
          '📋 **Cases** — Track and update cases\n' +
          '👥 **Clients** — Client directory\n' +
          '💰 **Earnings** — Monitor payments\n' +
          '⭐ **Reviews** — Client feedback\n' +
          '🏆 **Badges** — Your achievements';
        navLinks = [routes.consultations, routes.availability, routes.cases, routes.earnings, routes.reviews].filter(Boolean);
      } else {
        response = `Admin features at your fingertips:\n\n` +
          '📊 **Dashboard** — Platform KPIs\n' +
          '👥 **User Management** — Manage users\n' +
          '✅ **Verifications** — Approve advocates\n' +
          '💳 **Payments** — Monitor transactions\n' +
          '📈 **Analytics** — Platform trends\n' +
          '⚙️ **Settings** — Platform configuration';
        navLinks = [routes.dashboard, routes.users, routes.verification, routes.payments, routes.analytics, routes.settings].filter(Boolean);
      }
      type = 'navigation';
      break;
    }

    case INTENTS.BOOKING: {
      if (role === 'client') {
        response = 'To book a consultation:\n\n' +
          '1. Browse advocates by practice area\n' +
          '2. View their profile and reviews\n' +
          '3. Click **Book Consultation**\n' +
          '4. Select date, time slot, and confirm\n\n' +
          '💡 Look for the ✅ verified badge for extra trust!';
        navLinks = [routes.advocates];
        quickActions = [{ label: '🔍 Browse Advocates', path: routes.advocates?.path }];
      } else if (role === 'advocate') {
        response = 'Clients book consultations based on your availability.\n\n' +
          '📅 **Set your availability** so clients can find open slots\n' +
          '📋 **View requests** under Consultations to accept/decline';
        navLinks = [routes.availability, routes.consultations];
      } else {
        response = 'Monitor all platform consultations and booking trends.';
        navLinks = [routes.consultations];
      }
      type = 'navigation';
      break;
    }

    case INTENTS.CASE_STATUS: {
      if (role === 'client') {
        response = 'Track your cases in the **My Cases** section:\n\n' +
          '📊 **Case statuses**: Open → In Progress → Under Review → Resolved\n' +
          '📝 View timeline, documents, notes, and hearing dates\n\n' +
          "You'll get notifications on every update!";
        navLinks = [routes.cases];
        quickActions = [{ label: '📋 Open My Cases', path: routes.cases?.path }];
      } else if (role === 'advocate') {
        response = 'Manage all your assigned cases:\n\n' +
          '• Update case status and add notes\n' +
          '• Upload documents to the case workspace\n' +
          '• Track hearings and deadlines';
        navLinks = [routes.cases];
      } else {
        response = 'View all platform cases, monitor resolution rates, and dispute patterns.';
        navLinks = [routes.cases];
      }
      type = 'navigation';
      break;
    }

    case INTENTS.PAYMENT: {
      if (role === 'client') {
        const faqResult = findFAQ(message, role);
        response = faqResult?.answer || "View your payment history, invoices, and escrow status.\n\n💡 LegalConnect uses escrow — your payment is secured until consultation is completed.";
        navLinks = [routes.dashboard];
      } else if (role === 'advocate') {
        response = 'Track your consultation fees, escrow payments, and payout history.\n\n' +
          '💰 **How it works**: Client pays → Escrow holds → Consultation completed → Payment released';
        navLinks = [routes.earnings];
        quickActions = [{ label: '💰 View Earnings', path: routes.earnings?.path }];
      } else {
        response = 'Monitor all platform financial transactions, escrow statuses, and revenue.';
        navLinks = [routes.payments];
      }
      type = 'navigation';
      break;
    }

    case INTENTS.DOCUMENT: {
      if (role === 'client') {
        response = 'Manage your legal documents:\n\n' +
          '📝 **Supported**: PDF, DOCX, JPG, PNG (up to 10MB)\n' +
          '🔒 All documents are stored securely and encrypted\n\n' +
          'Upload from Documents page or within a case workspace!';
        navLinks = [routes.documents, routes.cases];
      } else {
        response = 'Documents are managed within case workspaces. Open a case to upload or review files.';
        navLinks = [routes.cases];
      }
      type = 'navigation';
      break;
    }

    case INTENTS.CONSULTATION: {
      if (role === 'client') {
        response = 'View your upcoming and past consultations:\n\n' +
          '📹 **Video calls** can be joined directly from the page\n' +
          "⏰ You'll get a reminder notification before your session";
        navLinks = [routes.consultations];
        quickActions = [{ label: '📅 My Consultations', path: routes.consultations?.path }];
      } else if (role === 'advocate') {
        response = 'Manage all consultation requests:\n\n' +
          '⚡ Accept/Decline requests, join video calls, mark as completed';
        navLinks = [routes.consultations];
      } else {
        response = 'View all platform consultations, booking volumes, and completion rates.';
        navLinks = [routes.consultations];
      }
      type = 'navigation';
      break;
    }

    case INTENTS.PROFILE: {
      response = role === 'advocate'
        ? 'Update your professional profile, specializations, experience, and credentials.\n\n💡 A complete profile with photo and bio attracts more clients!'
        : 'Update your personal information, contact details, and preferences.';
      navLinks = [routes.profile, routes.settings];
      type = 'navigation';
      break;
    }

    case INTENTS.REVIEW: {
      if (role === 'client') {
        response = 'After completing a consultation, leave a review for your advocate.\n\n⭐ Your honest feedback helps other clients find the right advocate!';
        navLinks = [routes.consultations];
      } else if (role === 'advocate') {
        response = 'View your client reviews and ratings.\n\n⭐ High ratings help you appear higher in search results and earn badges!';
        navLinks = [routes.reviews];
        quickActions = [{ label: '⭐ My Reviews', path: routes.reviews?.path }];
      } else {
        response = 'Reviews are visible on advocate profiles. Monitor reviews from the admin panel.';
      }
      type = 'navigation';
      break;
    }

    case INTENTS.COMPLAINT: {
      if (role === 'client') {
        response = "If you're facing an issue:\n\n" +
          '1. **Raise a Report** from the consultation page\n' +
          '2. **Contact Support**: support@legalconnect.local\n' +
          "3. **Ask me** and I'll try to help!\n\n" +
          'Admin team reviews all reports within 24-48 hours.';
        suggestions = ['My consultations', 'Contact support', 'Track my case'];
      } else if (role === 'advocate') {
        response = "For platform issues:\n\n" +
          '1. **Technical Issues**: Clear browser cache or try another browser\n' +
          '2. **Payment Disputes**: Contact admin at support@legalconnect.local\n' +
          '3. **Client Issues**: Report through case/consultation interface';
        suggestions = ['Contact support', 'My earnings', 'My consultations'];
      } else {
        response = 'View all reports and disputes. Review, investigate, and resolve issues.';
        navLinks = [routes.dashboard];
      }
      break;
    }

    case INTENTS.LEGAL_QUERY: {
      const area = detectPracticeArea(message);
      if (area && LEGAL_INFO[area]) {
        const info = LEGAL_INFO[area];
        response = `📚 **${area}**\n\n${info.summary}\n\n` +
          '**Recommended Steps:**\n' +
          info.steps.map((s, i) => `${i + 1}. ${s}`).join('\n');
        if (info.urgentNote) response += `\n\n🚨 **Important**: ${info.urgentNote}`;
        response += '\n\n⚠️ *General information only. Consult a qualified advocate for specific advice.*';
        if (role === 'client' && routes.advocates) {
          navLinks = [routes.advocates];
          quickActions = [{ label: '🔍 Find Advocates', path: routes.advocates.path }];
        }
      } else {
        response = 'I can see you have a legal question. Tell me more about:\n\n' +
          '• Property disputes 🏠\n• Family matters 👨‍👩‍👧\n• Criminal cases ⚖️\n' +
          '• Employment issues 💼\n• Consumer complaints 🛒\n• And more!';
        suggestions = ['Property dispute', 'Family matter', 'Criminal case', 'Employment issue'];
      }
      type = 'legal_info';
      break;
    }

    default: {
      response = `I'm not sure I understood that, ${name}. 🤔\n\nI can help with:\n` +
        '• **Navigation** — "Go to my cases", "Open messages"\n' +
        '• **Legal topics** — "I have a property dispute"\n' +
        '• **Platform help** — "How to book?", "Upload documents"\n\n' +
        'Try clicking a quick link below or rephrase your question!';
      
      const topRoutes = role === 'client'
        ? [routes.dashboard, routes.advocates, routes.cases]
        : role === 'advocate'
        ? [routes.dashboard, routes.consultations, routes.cases]
        : [routes.dashboard, routes.users, routes.analytics];
      navLinks = topRoutes.filter(Boolean);
      suggestions = ['Help', 'Navigate', 'Legal guidance'];
      break;
    }
  }

  return {
    response,
    suggestions,
    navLinks: navLinks.filter(Boolean),
    quickActions: quickActions.filter(a => a?.path),
    type,
    intent,
    timestamp: new Date().toISOString(),
  };
}
