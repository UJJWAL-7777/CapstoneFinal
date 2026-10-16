// ═══════════════════════════════════════════════════════════════
// LexBot — LegalConnect Multilingual & Vernacular Intelligence Engine v4
// Deep Intellectual Jurisprudence, BNS 2023 vs IPC, & Landmark Precedents
// Client-side Instant Fallback Engine for 100% Uptime
// ═══════════════════════════════════════════════════════════════

export const INTENTS = {
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
  GLOSSARY: 'glossary',
  LANDMARK_CASES: 'landmark_cases',
  APPLIED_SECTIONS: 'applied_sections',
  UNKNOWN: 'unknown',
};

// ─── Language Detection ─────────────────────────────────────────
export function detectLanguage(text, preferredLang = null) {
  if (preferredLang && ['hi', 'hinglish', 'en'].includes(preferredLang)) {
    return preferredLang;
  }
  if (!text || typeof text !== 'string') return 'en';

  // Check for Devanagari Unicode block (\u0900 - \u097F)
  if (/[\u0900-\u097F]/.test(text)) {
    return 'hi';
  }

  // Common Hinglish legal/conversational markers
  const hinglishMarkers = [
    /\b(kya|kaise|karo|kare|karen|hoga|hogi|hote|mera|meri|mere|mujhe|humko|aap|tum|nahi|nahin|konsi|kon\s*si)\b/i,
    /\b(vakil|vakeel|advocte|kanoon|kanun|kanoonee|nyaya|faisla|adalat|shikayat|dhokha|dhokhadhadi|dhara)\b/i,
    /\b(cheque|bounce|kirayedar|kiraya|makan\s*malik|jamanaat|zamanat|talaq|paisa|paise|fees|chori|thappad)\b/i,
    /\b(batao|samjhao|chahiye|de\s*raha|rok|stay|arzi|tarika|madad|marpeet|gaali|lagegi)\b/i,
  ];

  const matchCount = hinglishMarkers.filter((p) => p.test(text)).length;
  if (matchCount >= 1) {
    return 'hinglish';
  }

  return 'en';
}

// ─── Pattern Definitions ────────────────────────────────────────
const GREETING_PATTERNS = [
  /^(hi|hello|hey|good\s*(morning|afternoon|evening)|namaste|namaskar|pranam|greetings|howdy|sup)$/i,
  /^(नमस्ते|नमस्कार|प्रणाम|हेलो|हाय)$/i,
];

const FAREWELL_PATTERNS = [
  /^(bye|goodbye|see you|take care|thanks|thank you|tata|alvida|done|that'?s all|dhanyawad|shukriya)$/i,
  /^(अलविदा|धन्यवाद|शुक्रिया|बाय|नमस्ते)$/i,
];

const HELP_PATTERNS = [
  /\b(help|how\s+to|guide|what\s+can\s+you\s+do|features|tutorial|explain|show me)\b/i,
  /\b(मदद|सहायता|गाइड|फीचर्स|समझाओ|कैसे|क्या कर सकते हो)\b/i,
  /\b(madad|sahayata|kaise kare|guide karo|features batao)\b/i,
];

const BOOKING_PATTERNS = [
  /\b(how\s*to\s*book|book\s*(an?\s*)?(appointment|slot|advocate|lawyer|consultation)|schedule\s*(a\s*)?consultation|hire\s*(an?\s*)?(advocate|lawyer))\b/i,
  /^(book|appointment|hire\s*lawyer|consult\s*lawyer)$/i,
  /\b(अपॉइंटमेंट\s*बुक|वकील\s*बुक|परामर्श\s*बुक|वकील\s*चाहिए)\b/i,
  /\b(book\s*karna\s*hai|appointment\s*lena\s*hai|advocate\s*book\s*karein)\b/i,
];

const CASE_PATTERNS = [
  /\b(track\s*(my\s*)?case|case\s*status|check\s*case\s*progress|hearing\s*date\s*update|my\s*cases\s*(dashboard|page|workspace))\b/i,
  /^(my\s*cases?|cases?|case\s*status|hearing\s*date)$/i,
  /\b(केस\s*स्टेटस|मुकदमा\s*ट्रैक|केस\s*ट्रैक|सुनवाई\s*की\s*तारीख)\b/i,
  /^(मेरे\s*केस|केस\s*स्टेटस)$/i,
  /\b(mera\s*case\s*status|case\s*track\s*karna|hearing\s*date\s*kab\s*hai)\b/i,
];

const PAYMENT_PATTERNS = [
  /\b(how\s*to\s*pay|platform\s*fee|consultation\s*fee|payment\s*method|escrow\s*refund|invoice\s*download|refund\s*policy)\b/i,
  /^(payment|pay|fees|fee|refund|escrow)$/i,
  /\b(भुगतान\s*कैसे|फीस\s*कितनी|पेमेंट\s*का\s*तरीका|एस्क्रो\s*रिफंड|रसीद)\b/i,
  /\b(fees\s*kitni\s*hai|payment\s*kaise\s*kare|refund\s*kaise\s*milega|escrow\s*paisa)\b/i,
];

const DOCUMENT_PATTERNS = [
  /\b(upload\s*document|upload\s*file|manage\s*documents|documents\s*section|paperwork\s*upload)\b/i,
  /^(documents?|my\s*documents?|upload)$/i,
  /\b(दस्तावेज़\s*अपलोड|कागज़ात\s*अपलोड|फाइल\s*अपलोड)\b/i,
  /\b(dastavez\s*upload|kagaz\s*upload|documents\s*kahan\s*dalein)\b/i,
];

const CONSULTATION_PATTERNS = [
  /\b(join\s*consultation|join\s*meeting|join\s*video\s*call|upcoming\s*consultation|meeting\s*link)\b/i,
  /^(consultations?|video\s*call|meeting)$/i,
  /\b(वीडियो\s*कॉल\s*जॉइन|मीटिंग\s*लिंक|परामर्श\s*शुरू)\b/i,
  /\b(video\s*call\s*join|meeting\s*kahan\s*hogi|consultation\s*kaise\s*join)\b/i,
];

const GLOSSARY_PATTERNS = [
  /\b(meaning of|what is|define|glossary|kosh|shabd|artha|kya hota hai|kise kehte)\b/i,
  /\b(अर्थ|मतलब|परिभाषा|शब्दकोश|किसे कहते हैं|क्या है)\b/i,
  /\b(injunction|stay order|bail|zamanat|cognizable|caveat|affidavit|halfnama|power of attorney|fir)\b/i,
];

// ─── Legal Practice Areas (Multilingual keywords) ───────────────
const PRACTICE_AREAS = {
  'Cheque Bounce & Banking': [
    'cheque', 'bounce', 'dishonour', '138', 'bank', 'loan', 'emi', 'nbfc', 'debt', 'recovery',
    'चेक', 'बाउंस', 'लोन', 'बैंक', 'कर्ज', 'ऋण', 'ईएमआई',
    'cheque bounce', 'bank loan', 'paisa wapas'
  ],
  'Property & Tenancy': [
    'property', 'land', 'real estate', 'builder', 'possession', 'title', 'registry', 'encroachment', 'rent', 'tenancy', 'eviction', 'lease', 'flat', 'deposit',
    'संपत्ति', 'जमीन', 'किराया', 'किरायेदार', 'मकान मालिक', 'रजिस्ट्री', 'कब्जा', 'प्लॉट', 'एग्रीमेंट',
    'makan malik', 'kirayedar', 'jamin', 'zameen', 'registry', 'kabja', 'deposit wapas'
  ],
  'Criminal & Bail': [
    'fir', 'police', 'arrest', 'bail', 'crime', 'theft', 'fraud', 'assault', 'bns', 'bnss', 'ipc', 'crpc',
    'पुलिस', 'एफआईआर', 'गिरफ्तारी', 'ज़मानत', 'अपराध', 'चोरी', 'धोखाधड़ी', 'जमानत',
    'jamanaat', 'zamanat', 'thana', 'police case', 'dhokha'
  ],
  'Family & Matrimonial': [
    'divorce', 'marriage', 'custody', 'alimony', 'maintenance', 'domestic violence', 'dowry', 'matrimonial', 'separation',
    'तलाक', 'विवाह', 'शादी', 'घरेलू हिंसा', 'दहेज', 'भरण-पोषण', 'कस्टडी',
    'talaq', 'shadi', 'gharelu hinsa', 'kharcha', 'dahej'
  ],
  'Consumer Protection': [
    'consumer', 'product', 'defective', 'refund', 'service', 'forum', 'unfair trade', 'cheating',
    'उपभोक्ता', 'कंज्यूमर', 'खराब सामान', 'रिफंड', 'ठगी', 'शिकायत',
    'consumer court', 'refund nahi mila', 'kharab product'
  ],
  'Cyber Law': [
    'cyber', 'online fraud', 'hacking', 'data', 'privacy', 'social media', 'it act', 'otp fraud', 'upi fraud',
    'साइबर', 'ऑनलाइन ठगी', 'हैकिंग', 'ओटीपी', 'यूपीआई फ्रॉड',
    'cyber crime', 'online thagi', 'otp scam'
  ],
  'Labour & Employment': [
    'employment', 'job', 'salary', 'termination', 'wrongful', 'labour', 'pf', 'gratuity', 'unpaid',
    'नौकरी', 'वेतन', 'सैलरी', 'बर्खास्त', 'मजदूर', 'पीएफ',
    'salary nahi di', 'job se nikal diya', 'naukri'
  ],
};

// ─── Vernacular Legal Database ──────────────────────────────────
const VERNACULAR_LEGAL_DB = {
  'Cheque Bounce & Banking': {
    en: {
      title: 'Cheque Bounce & Banking Law (Section 138 NI Act)',
      summary: 'Cheque bounce is a criminal offense under Section 138 of the Negotiable Instruments Act with up to 2 years imprisonment.',
      steps: [
        'Collect the original cheque and the Bank Return Memo stating reasons (e.g. Insufficient Funds)',
        'Send a formal Statutory Legal Notice via registered post within 30 days of memo',
        'Give counterparty 15 days from notice receipt to clear the dues',
        'If unpaid after 15 days, file a complaint before the Judicial Magistrate within the next 30 days'
      ],
      note: 'Preserve postal dispatch receipts and delivery tracking as primary court proof.',
    },
    hi: {
      title: 'चेक बाउंस कानून (धारा 138, एन.आई. एक्ट)',
      summary: 'चेक बाउंस होना पराक्रम्य लिखत अधिनियम (Negotiable Instruments Act) की धारा 138 के तहत एक दंडनीय अपराध है, जिसमें 2 साल तक की जेल व चेक राशि का दोगुना जुर्माना हो सकता है।',
      steps: [
        'बैंक से मूल चेक और "Cheque Return Memo" (असमर्थता पर्ची) प्राप्त करें।',
        'बैंक पर्ची मिलने के 30 दिनों के भीतर देनदार को पंजीकृत डाक से कानूनी नोटिस (Legal Notice) भेजें।',
        'नोटिस मिलने के बाद उसे भुगतान के लिए 15 दिन का अनिवार्य समय दें।',
        'यदि 15 दिनों में भुगतान नहीं होता, तो अगले 30 दिनों के अंदर संबंधित मजिस्ट्रेट कोर्ट में केस दर्ज करें।'
      ],
      note: 'डाक रसीद और ट्रैकिंग रिपोर्ट को संभाल कर रखें, यह कोर्ट में सबसे अहम सबूत होती है।',
    },
    hinglish: {
      title: 'Cheque Bounce & Recovery (Sec 138 NI Act)',
      summary: 'Cheque bounce hona Section 138 NI Act ke tehat ek criminal offense hai. Isme 2 saal tak ki jail ya double amount ka jurmana ho sakta hai.',
      steps: [
        'Bank se original cheque aur Cheque Return Memo lein (jisme insufficient funds likha ho).',
        'Bank memo milne ke 30 dino ke andar opposite party ko Legal Notice bhejein.',
        'Notice receive hone ke baad 15 din ka payment time dena mandatory hai.',
        'Agar 15 dino me paise na milein, to agle 30 days me Magistrate Court me case file karein.'
      ],
      note: 'Speed post ki receipt aur tracking report hamesha safe rakhein.',
    },
  },
  'Property & Tenancy': {
    en: {
      title: 'Property & Tenancy Dispute Law',
      summary: 'Governed by the Transfer of Property Act and State Rent Control legislation. Covers security deposit recovery, illegal eviction, and title disputes.',
      steps: [
        'Compile the registered Rent/Lease Agreement, rent payment receipts, and bank proofs',
        'Send a formal Demand Notice to the landlord/tenant outlining the dispute and statutory timeline',
        'Approach the Rent Authority / Rent Tribunal under the Tenancy Act',
        'For illegal dispossession, seek urgent interim injunction (Stay Order) from the civil court'
      ],
      note: 'A landlord cannot cut electricity/water supplies or forcefully evict without due process of law.',
    },
    hi: {
      title: 'मकान मालिक व किरायेदार विवाद (Rent & Property Law)',
      summary: 'किरायेदारी विवाद रेंट कंट्रोल एक्ट और ट्रांसफर ऑफ़ प्रॉपर्टी एक्ट के तहत आते हैं। मकान मालिक मनमाने ढंग से किराया नहीं बढ़ा सकता और न ही बिना कानूनी प्रक्रिया के बेदखल कर सकता है।',
      steps: [
        'रेंट एग्रीमेंट, किराया भुगतान की रसीदें और बैंक ट्रांसफर रिकॉर्ड सुरक्षित रखें।',
        'सिक्योरिटी डिपॉजिट न मिलने पर या अवैध बेदखली पर मकान मालिक को कानूनी नोटिस (Legal Notice) भेजें।',
        'समाधान न होने पर स्थानीय रेंट कंट्रोलर (Rent Tribunal) या सिविल कोर्ट में वाद दायर करें।',
        'यदि जबरन निकाला जा रहा हो, तो तत्काल सिविल कोर्ट से स्टे ऑर्डर (Injunction) प्राप्त करें।'
      ],
      note: 'मकान मालिक बिना कोर्ट आदेश के बिजली/पानी नहीं काट सकता और न ही ताला लगा सकता है।',
    },
    hinglish: {
      title: 'Tenant & Landlord Dispute (Deposit & Eviction)',
      summary: 'Rent Control Act ke mutabik makan malik bina notice ke kirayedar ko nikal nahi sakta aur na hi security deposit bina wajah rok sakta hai.',
      steps: [
        'Rent agreement aur sabhi payment receipts/bank statements gather karein.',
        'Deposit wapas na milne par pehle formal Legal Notice send karein.',
        'Local Rent Authority ya Civil Court me application lagayein.',
        'Agar forcefully vacate karwaya ja raha ho to court se Injunction (Stay Order) le sakte hain.'
      ],
      note: 'Landlord legally bijli ya paani ka connection nahi kaat sakta.',
    },
  },
  'Criminal & Bail': {
    en: {
      title: 'Criminal Matters & Bail Rights (BNS / BNSS)',
      summary: 'Governed by Bharatiya Nyaya Sanhita (BNS) and Bharatiya Nagarik Suraksha Sanhita (BNSS). Everyone has the fundamental right to legal counsel under Article 22(1).',
      steps: [
        'In case of cognizable crime, police are mandated to register a Zero FIR or regular FIR',
        'If police refuse, submit a written complaint to the Superintendent of Police (SP) or file under BNSS Sec 175(3)',
        'For anticipated arrest, immediately apply for Anticipatory Bail before the Sessions Court or High Court',
        'Maintain detailed chronological logs, CCTV footage, and digital communications'
      ],
      note: 'Arrested persons must be produced before the nearest magistrate within 24 hours of arrest.',
    },
    hi: {
      title: 'आपराधिक मामले और ज़मानत के अधिकार (BNS व BNSS)',
      summary: 'भारतीय न्याय संहिता (BNS) और भारतीय नागरिक सुरक्षा संहिता (BNSS) के तहत हर नागरिक को निष्पक्ष जांच और कानूनी प्रतिनिधित्व (वकील रखने) का संवैधानिक अधिकार प्राप्त है।',
      steps: [
        'संज्ञेय अपराध में पुलिस थाने में तत्काल प्रथम सूचना रिपोर्ट (FIR) दर्ज कराएं।',
        'यदि पुलिस FIR दर्ज न करे, तो पुलिस अधीक्षक (SP/DCP) को लिखित शिकायत भेजें या मजिस्ट्रेट के समक्ष आवेदन करें।',
        'गिरफ्तारी की आशंका होने पर सेशन कोर्ट या हाईकोर्ट में अग्रिम ज़मानत (Anticipatory Bail) की अर्जी लगाएं।',
        'गिरफ्तारी के बाद नियमित ज़मानत (Regular Bail) हेतु तुरंत अनुभवी क्रिमिनल वकील से संपर्क करें।'
      ],
      note: 'गिरफ्तार व्यक्ति को 24 घंटे के भीतर नजदीकी मजिस्ट्रेट के सामने पेश करना अनिवार्य है।',
    },
    hinglish: {
      title: 'Criminal Law & Bail Process (BNS & BNSS)',
      summary: 'Indian Constitution Article 22 aur BNSS ke tehat har vyakti ko lawyer hire karne aur 24 ghante ke andar magistrate ke samne pesh hone ka adhikar hai.',
      steps: [
        'Serious offense me police station me turant FIR darj karayein.',
        'Agar police mana kare to SP/DCP ko registered complaint bhein ya Magistrate court jayein.',
        'Arrest ka darr ho to pehle hi Sessions Court se Anticipatory Bail apply karein.',
        'Case ke sabhi proofs, messages aur call logs safely preserve karein.'
      ],
      note: 'Police bina warrant ke non-cognizable cases me arrest nahi kar sakti.',
    },
  },
  'Family & Matrimonial': {
    en: {
      title: 'Family, Matrimonial & Domestic Violence Law',
      summary: 'Governed by Hindu Marriage Act, Special Marriage Act, and DV Act 2005. Guarantees rights to maintenance, residence, and custody.',
      steps: [
        'In domestic violence situations, immediately dial Women Helpline 181 or Police 112',
        'File an application before the Magistrate under Section 12 of the DV Act for Protection & Residence orders',
        'Seek interim maintenance under Section 144 of BNSS / Section 125 CrPC',
        'Explore mutual consent divorce (Section 13B) or contested petition with a family lawyer'
      ],
      note: 'Emergency shelter and legal aid are available free of cost through District Legal Services Authorities (DLSA).',
    },
    hi: {
      title: 'पारिवारिक कानून व घरेलू हिंसा संरक्षण (DV Act)',
      summary: 'घरेलू हिंसा अधिनियम 2005 और वैवाहिक कानून महिलाओं को सुरक्षा, भरण-पोषण (Maintenance) और साझे घर में रहने का अधिकार प्रदान करते हैं।',
      steps: [
        'तत्काल संकट की स्थिति में महिला हेल्पलाइन 181 या पुलिस 112 पर कॉल करें।',
        'मजिस्ट्रेट के समक्ष घरेलू हिंसा कानून की धारा 12 के तहत संरक्षण (Protection Order) की अर्जी दें।',
        'अपने व बच्चों के खर्च हेतु धारा 125 CrPC / 144 BNSS के तहत भरण-पोषण की मांग करें।',
        'आपसी सहमति से तलाक (Mutual Consent) या विवादित मामले हेतु पारिवारिक वकील से सलाह लें।'
      ],
      note: 'ज़िला विधिक सेवा प्राधिकरण (DLSA) के माध्यम से मुफ्त कानूनी सहायता (Free Legal Aid) का अधिकार है।',
    },
    hinglish: {
      title: 'Family & Domestic Violence Protection',
      summary: 'Domestic Violence Act 2005 aur Family Law ke tehat mahilao ko maintenance, shelter aur protection orders ka poora adhikar hai.',
      steps: [
        'Emergency me Women Helpline 181 ya Police 112 par call karein.',
        'Protection Officer ya Magistrate ke pas DV Act Sec 12 me application file karein.',
        'Kharcha (Maintenance) lene ke liye Sec 125 CrPC / BNSS me apply karein.',
        'Mutual settlement ya divorce ke liye verified Family Lawyer se consult karein.'
      ],
      note: 'Har district me Free Legal Aid (DLSA) available hota hai.',
    },
  },
  'Consumer Protection': {
    en: {
      title: 'Consumer Protection Act 2019',
      summary: 'Enables consumers to claim full refunds, replacements, and compensation for mental agony caused by defective products or deficient services.',
      steps: [
        'Preserve invoice/bill, warranty cards, and written email complaints sent to the seller/company',
        'Lodge an informal complaint on the National Consumer Helpline (NCH: 1915 or consumerhelpline.gov.in)',
        'If unresolved, file an online case on the e-Daakhil portal (edaakhil.nic.in)',
        'Claims up to ₹50 Lakhs are heard by the District Consumer Commission without hefty court fees'
      ],
      note: 'No lawyer is strictly mandatory to file in consumer court, but an advocate helps secure maximum compensation.',
    },
    hi: {
      title: 'उपभोक्ता संरक्षण कानून 2019 (Consumer Rights)',
      summary: 'उपभोक्ता संरक्षण अधिनियम 2019 के तहत खराब उत्पाद, अनुचित व्यापार प्रथा (Unfair Trade Practice) या सेवा में कमी पर हर्जाने और रिफंड का कानूनी हक है।',
      steps: [
        'खरीद रसीद (Bill), वारंटी कार्ड, ईमेल व चैट के स्क्रीनशॉट संभाल कर रखें।',
        'पहले राष्ट्रीय उपभोक्ता हेल्पलाइन नंबर 1915 पर या consumerhelpline.gov.in पर शिकायत दर्ज करें।',
        'समाधान न मिलने पर ई-दाखिल (edaakhil.nic.in) पोर्टल के जरिए उपभोक्ता फोरम में केस फाइल करें।',
        '₹50 लाख तक के मामले जिला उपभोक्ता आयोग (District Forum) में सुने जाते हैं।'
      ],
      note: 'उपभोक्ता अदालत में केस दायर करने के लिए बहुत कम फीस लगती है और मानसिक परेशानी का हर्जाना भी मिलता है।',
    },
    hinglish: {
      title: 'Consumer Court & Refund Process',
      summary: 'Consumer Protection Act 2019 ke under agar koi company kharab product ya service deti hai, to aap full refund + compensation claim kar sakte hain.',
      steps: [
        'Original bill, warranty card aur company ko bheje gaye emails preserve karein.',
        'National Consumer Helpline 1915 par call karke complaint register karein.',
        'Agar resolution na mile to e-Daakhil portal (edaakhil.nic.in) par online case karein.',
        '50 Lakh tak ke dispute District Consumer Forum me bina heavy fee ke solve hote hain.'
      ],
      note: 'Consumer court me mental harassment ka compensation bhi milta hai.',
    },
  },
  'Cyber Law': {
    en: {
      title: 'Cyber Crime & Online Financial Fraud',
      summary: 'Covered under Information Technology Act 2000. Rapid golden-hour reporting within 2 hours can freeze stolen bank funds.',
      steps: [
        'Immediately call National Cyber Crime Helpline 1930 to freeze the fraudulent transaction',
        'Lodge a formal digital complaint on cybercrime.gov.in and download the acknowledgment',
        'Notify your bank immediately to block affected cards and net banking credentials',
        'Consult a Cyber Law advocate to trace jurisdiction and file under Section 66D IT Act'
      ],
      note: 'Never share OTPs, remote desktop app codes (AnyDesk, TeamViewer), or click unverified links.',
    },
    hi: {
      title: 'साइबर अपराध व ऑनलाइन वित्तीय धोखाधड़ी',
      summary: 'सूचना प्रौद्योगिकी अधिनियम (IT Act 2000) के तहत ऑनलाइन ठगी, फर्जी कॉल/ओटीपी स्कैम और हैकिंग दंडनीय अपराध हैं।',
      steps: [
        'ठगी होते ही बिना देरी किए राष्ट्रीय साइबर हेल्पलाइन नंबर 1930 पर कॉल करें (गोल्डन ऑवर में बैंक खाता फ्रीज हो सकता है)।',
        'आधिकारिक पोर्टल cybercrime.gov.in पर विस्तृत शिकायत दर्ज करें और पावती (Acknowledgment) डाउनलोड करें।',
        'अपने बैंक को तुरंत सूचित करके कार्ड, नेट बैंकिंग और यूपीआई ब्लॉक करवाएं।',
        'आईटी एक्ट की धारा 66D के तहत कानूनी कार्रवाई के लिए साइबर विशेषज्ञ वकील से परामर्श लें।'
      ],
      note: 'कभी भी अनजान लिंक पर क्लिक न करें और एनीडेस्क/टीमव्यूअर जैसे ऐप किसी के कहने पर इंस्टॉल न करें।',
    },
    hinglish: {
      title: 'Cyber Crime & Online Thagi (IT Act)',
      summary: 'Online financial fraud ya account hack hone par IT Act 2000 ke tehat turant action liya ja sakta hai.',
      steps: [
        'Fraud hote hi sabse pehle National Cyber Helpline 1930 par call karein.',
        'cybercrime.gov.in portal par complaint register karke receipt download karein.',
        'Apne bank ko inform karke immediately card aur UPI block karwayein.',
        'Recovery aur court proceeding ke liye Cyber Law advocate se consult karein.'
      ],
      note: 'OTP aur screen sharing app access kisi ke sath share na karein.',
    },
  },
  'Labour & Employment': {
    en: {
      title: 'Labour & Employment Rights',
      summary: 'Protects against wrongful termination, unpaid salaries, arbitrary deduction, and PF/Gratuity withholding.',
      steps: [
        'Gather your employment agreement, appointment letter, salary slips, and attendance records',
        'Issue a formal legal notice for recovery of outstanding dues and gratuity',
        'File a conciliation application before the Labour Commissioner / Labour Court',
        'For sexual harassment at workplace, lodge a complaint with the Internal Complaints Committee (ICC) under POSH Act'
      ],
      note: 'Gratuity is mandatory for employees completing 5 continuous years of service under the Payment of Gratuity Act.',
    },
    hi: {
      title: 'श्रम कानून व नौकरी संबंधी अधिकार (Employment Rights)',
      summary: 'श्रम कानूनों के तहत बिना पूर्व सूचना नौकरी से निकालना, वेतन रोकना, पीएफ या ग्रेच्युटी न देना कानूनन गलत है।',
      steps: [
        'अपॉइंटमेंट लेटर, सैलरी स्लिप्स, ईमेल रिकॉर्ड और उपस्थिति प्रमाण एकत्र करें।',
        'बकाया वेतन और भत्तों की वसूली हेतु कंपनी को कानूनी नोटिस (Legal Notice) भिजवाएं।',
        'समाधान न होने पर श्रम आयुक्त (Labour Commissioner) या लेबर कोर्ट के समक्ष आवेदन दें।',
        'कार्यस्थल पर प्रताड़ना की स्थिति में पॉश एक्ट (POSH Act) के तहत आंतरिक समिति (ICC) में शिकायत करें।'
      ],
      note: '5 वर्ष की निरंतर सेवा पूरी करने वाले कर्मचारी को ग्रेच्युटी मिलना अनिवार्य कानूनी अधिकार है।',
    },
    hinglish: {
      title: 'Job & Salary Dispute (Labour Laws)',
      summary: 'Company bina notice ke terminate nahi kar sakti aur na hi salary ya PF/Gratuity rok sakti hai.',
      steps: [
        'Offer letter, resignation/termination email aur salary slips safe rakhein.',
        'Unpaid salary ke liye lawyer ke through company ko Legal Notice bhein.',
        'Labour Commissioner / Labour Court me conciliation file karein.',
        '5 saal work complete karne par Gratuity claim karna legal right hai.'
      ],
      note: 'Kisi bhi verbal termination par written confirmation demand karein.',
    },
  },
};

// ─── Nyaya Kosh (Legal Glossary) ────────────────────────────────
const NYAYA_KOSH = {
  'stay order': {
    term: 'Stay Order / Injunction (स्थगन आदेश)',
    en: 'A court order restraining a party from carrying out an action or preserving the status quo until final hearing.',
    hi: 'अदालत का वह आदेश जो किसी पक्ष को कोई काम करने से रोकता है या विवादित संपत्ति/मामले में यथास्थिति (Status Quo) बनाए रखने का निर्देश देता है।',
    hinglish: 'Court ka ek emergency order jo kisi kaam ko rokne ya status quo banaye rakhne ke liye diya jata hai jab tak faisla na aaye.',
  },
  'injunction': {
    term: 'Injunction (निषेधाज्ञा / स्टे)',
    en: 'A judicial remedy compelling a party to do or refrain from doing a specific act.',
    hi: 'न्यायालय द्वारा जारी निषेधाज्ञा जिसके तहत किसी व्यक्ति को कोई विशेष कार्य करने से रोका जाता है या कोई कार्य करने का निर्देश दिया जाता है।',
    hinglish: 'Ek judicial order jo samne wali party ko koi galat step lene se legal tarike se rokta hai.',
  },
  'bail': {
    term: 'Bail (ज़मानत)',
    en: 'The temporary release of an accused person awaiting trial, sometimes on condition that a sum of money or surety is lodged.',
    hi: 'मुकदमे की सुनवाई पूरी होने तक किसी आरोपी को अदालत द्वारा इस शर्त पर रिहा करना कि वह हर सुनवाई पर उपस्थित रहेगा और जांच में सहयोग करेगा।',
    hinglish: 'Court dwara kisi accused ko temporary release milna is shart par ki wo trial me time par present hoga.',
  },
  'zamanat': {
    term: 'Bail (ज़मानत)',
    en: 'The temporary release of an accused person awaiting trial.',
    hi: 'मुकदमे की सुनवाई के दौरान आरोपी को जेल से रिहा करने का आदेश। अग्रिम ज़मानत (Anticipatory Bail) गिरफ्तारी से पहले और नियमित ज़मानत (Regular Bail) गिरफ्तारी के बाद ली जाती है।',
    hinglish: 'Arrest se pehle Anticipatory Bail li jati hai, aur arrest hone ke baad Regular Bail apply ki jati hai.',
  },
  'cognizable': {
    term: 'Cognizable Offence (संज्ञेय अपराध)',
    en: 'A serious category of offense in which a police officer may arrest without a court warrant and initiate investigation without court order.',
    hi: 'गंभीर प्रकृति का अपराध (जैसे हत्या, डकैती, बलात्कार) जिसमें पुलिस बिना किसी मजिस्ट्रेट वारंट के आरोपी को गिरफ्तार कर सकती है और तुरंत FIR दर्ज करने के लिए बाध्य है।',
    hinglish: 'Serious crime jisme police bina court warrant ke seedhe arrest kar sakti hai aur FIR likhna mandatory hota hai.',
  },
  'caveat': {
    term: 'Caveat Petition (कैविएट याचिका)',
    en: 'A formal legal notice filed in court requesting that no order or judgment be passed against the applicant without giving them prior notice.',
    hi: 'अदालत में दायर की गई वह पूर्व चेतावनी जिसके तहत कोर्ट को यह निवेदन किया जाता है कि कैविएटर (आवेदक) को सुने बिना विरोधी पक्ष के पक्ष में कोई एकतरफा (Ex-Parte) आदेश न दिया जाए।',
    hinglish: 'Court me file ki gayi prior application ki opposite party ki petition par mujhe bina sune koi stay ya order pass na karein.',
  },
  'affidavit': {
    term: 'Affidavit (हलफनामा / शपथ पत्र)',
    en: 'A written statement confirmed by oath or affirmation, for use as evidence in court.',
    hi: 'शपथपूर्वक दिया गया लिखित बयान जिसे नोटरी या ओथ कमिश्नर द्वारा सत्यापित किया जाता है और अदालत में वैध साक्ष्य माना जाता है।',
    hinglish: 'Oath par diya gaya written statement jo notary se verified hota hai aur court me proof ke roop me use hota hai.',
  },
  'power of attorney': {
    term: 'Power of Attorney (मुख्तारनामा)',
    en: 'A written authorization to represent or act on another\'s behalf in private affairs, business, or legal matters.',
    hi: 'एक कानूनी दस्तावेज़ जिसके माध्यम से कोई व्यक्ति किसी अन्य विश्वसनीय व्यक्ति को अपनी ओर से संपत्ति बेचने, कोर्ट में पेश होने या हस्ताक्षर करने का कानूनी अधिकार देता है।',
    hinglish: 'Ek legal document jisse aap kisi doosre person ko apni jagah legal ya financial decision lene ka right dete hain.',
  },
  'fir': {
    term: 'FIR / First Information Report (प्रथम सूचना रिपोर्ट)',
    en: 'Information recorded by the police relating to the commission of a cognizable offence.',
    hi: 'संज्ञेय अपराध की सूचना मिलने पर पुलिस अधिकारी द्वारा थाने में दर्ज किया गया पहला लिखित आधिकारिक दस्तावेज़।',
    hinglish: 'Cognizable crime ki information milne par police station me pehli official entry jo case ka base banti hai.',
  },
};

// ─── Landmark Supreme Court Cases Database ───────────────────────
const LANDMARK_CASES_DB = [
  {
    id: 'arnesh_kumar',
    patterns: [/arnesh\s*kumar/i, /arrest\s*guideline/i, /41a\s*notice/i, /under\s*7\s*years\s*arrest/i],
    title: 'Arnesh Kumar v. State of Bihar (2014) 8 SCC 273',
    topic: 'Police Arrest Guidelines (Offences < 7 Years)',
    en: {
      headline: 'Police cannot automatically arrest citizens for offences carrying punishment up to 7 years.',
      ruling: 'The Supreme Court ruled that arrests must not be made routinely upon filing of an FIR. Police MUST serve a Notice of Appearance (Section 41A CrPC / Sec 35(3) BNSS 2023) giving 14 days to appear. Failure to follow this makes the arresting officer personally liable for contempt of court.',
      howToCite: 'Cite this if police threaten arbitrary arrest without serving formal written statutory notice.',
    },
    hi: {
      headline: '7 साल से कम सज़ा वाले अपराधों में पुलिस सीधे गिरफ्तार नहीं कर सकती।',
      ruling: 'सुप्रीम कोर्ट ने स्पष्ट किया कि FIR दर्ज होते ही गिरफ्तारी अनिवार्य नहीं है। पुलिस को पहले धारा 41A CrPC (अब धारा 35 BNSS) का लिखित नोटिस देना होगा। यदि पुलिस अधिकारी इसका उल्लंघन करते हैं तो उनके खिलाफ हाईकोर्ट में अवमानना (Contempt) की कार्रवाई हो सकती है।',
      howToCite: 'यदि पुलिस बिना लिखित नोटिस के गिरफ्तारी की धमकी दे, तो अर्नेश कुमार जजमेंट का हवाला दें।',
    },
    hinglish: {
      headline: '7 years se kam punishment wale cases me police directly arrest nahi kar sakti.',
      ruling: 'Supreme Court ne mandate kiya hai ki police pehle Section 41A CrPC (ab Section 35 BNSS) ka written notice degi. Bina solid reasons ke arrest karne wale police officer par High Court Contempt chal sakta hai.',
      howToCite: 'Agar police bina legal notice ke dhamki de to Arnesh Kumar ruling cite karein.',
    },
  },
  {
    id: 'dk_basu',
    patterns: [/d\.?k\.?\s*basu/i, /custodial\s*(violence|death|torture)/i, /11\s*rules\s*of\s*arrest/i],
    title: 'D.K. Basu v. State of West Bengal (1997) 1 SCC 416',
    topic: '11 Golden Rules Against Custodial Torture',
    en: {
      headline: '11 mandatory guidelines to eliminate police brutality, custodial torture, and secret detention.',
      ruling: 'The Supreme Court mandated that every arrest must have a signed arrest memo with a witness, family must be informed within 8-12 hours, medical exam conducted every 48 hours, and the arrestee has the constitutional right to meet their advocate during interrogation.',
      howToCite: 'Cite whenever police detain someone without informing relatives, deny access to a lawyer, or commit physical assault in custody.',
    },
    hi: {
      headline: 'हिरासत में प्रताड़ना व मौतों को रोकने हेतु 11 अनिवार्य नियम।',
      ruling: 'सुप्रीम कोर्ट ने निर्देश दिया कि गिरफ्तारी के समय अरेस्ट मेमो बनाना, 8-12 घंटे में परिवार को सूचित करना, हर 48 घंटे में मेडिकल जांच और पूछताछ के दौरान वकील से मिलने की अनुमति देना अनिवार्य है।',
      howToCite: 'यदि किसी को बिना कारण हिरासत में रखा जाए या वकील से न मिलने दिया जाए, तो डी.के. बसु जजमेंट तुरंत लागू होता है।',
    },
    hinglish: {
      headline: 'Custodial torture aur illegal detention rokne ke 11 mandatory Supreme Court rules.',
      ruling: 'Arrest memo banana, family ko 8-12 hours me inform karna, mandatory medical checkup aur inquiry ke waqt lawyer se milne ka right D.K. Basu case ne diya.',
      howToCite: 'Agar police secret detention kare ya lawyer se na milne de to D.K. Basu guidelines cite karein.',
    },
  },
  {
    id: 'lalita_kumari',
    patterns: [/lalita\s*kumari/i, /fir\s*mandatory/i, /refus(e|al)\s*to\s*(file|register)\s*fir/i, /zero\s*fir/i],
    title: 'Lalita Kumari v. Govt. of UP (2014) 2 SCC 1',
    topic: 'Mandatory FIR Registration in Cognizable Crime',
    en: {
      headline: 'Registration of FIR is mandatory under Section 154 CrPC if complaint discloses a cognizable offence.',
      ruling: 'A 5-judge Constitution Bench held that police have zero discretion to refuse an FIR or delay it under the guise of an open-ended inquiry if a cognizable crime is alleged.',
      howToCite: 'Cite before the SHO, SP, or Magistrate under Section 156(3) if a police station refuses to lodge your FIR.',
    },
    hi: {
      headline: 'संज्ञेय अपराध में पुलिस के लिए तत्काल FIR दर्ज करना अनिवार्य है।',
      ruling: 'सुप्रीम कोर्ट की 5 जजों की संविधान पीठ ने फैसला दिया कि यदि शिकायत में संज्ञेय अपराध (Cognizable Offence) का उल्लेख है, तो पुलिस अधिकारी FIR दर्ज करने से इनकार नहीं कर सकता।',
      howToCite: 'यदि थाना आपकी FIR दर्ज न करे, तो ललिता कुमारी केस का हवाला देकर उच्चाधिकारियों या कोर्ट में शिकायत करें।',
    },
    hinglish: {
      headline: 'Cognizable crime me FIR register karna police ke liye compulsory hai.',
      ruling: 'Police preliminary enquiry ke naam par FIR delay nahi kar sakti. 5-judge bench ne FIR registration mandatory kiya hai.',
      howToCite: 'Agar police FIR likhne se mana kare to Lalita Kumari ruling cite karein.',
    },
  },
  {
    id: 'ks_puttaswamy',
    patterns: [/puttaswamy/i, /right\s*to\s*privacy/i, /privacy\s*(case|judgment)/i, /aadhaar\s*case/i],
    title: 'Justice K.S. Puttaswamy v. Union of India (2017) 10 SCC 1',
    topic: 'Fundamental Right to Privacy (Article 21)',
    en: {
      headline: 'Unanimous 9-judge bench declared Right to Privacy an inalienable Fundamental Right.',
      ruling: 'Privacy covers bodily autonomy, informational privacy, and personal choices. Any state surveillance or data collection must pass the 3-fold proportionality test: Legality, Legitimate State Aim, and Proportionality.',
      howToCite: 'Cite in cases of phone tapping, unauthorized leak of personal photos/chats, or financial data theft.',
    },
    hi: {
      headline: 'सुप्रीम कोर्ट ने निजता के अधिकार (Right to Privacy) को मौलिक अधिकार घोषित किया।',
      ruling: '9 जजों की पीठ ने माना कि निजता संविधान के अनुच्छेद 21 के तहत हर नागरिक का बुनियादी हक है। फोन टैपिंग या अनधिकृत डेटा लीक करना इसका सीधा उल्लंघन है।',
      howToCite: 'डेटा चोरी, फोन टैपिंग या निजी संदेशों के सार्वजनिक प्रसार पर इस निर्णय को उद्धृत करें।',
    },
    hinglish: {
      headline: 'Right to Privacy ab Article 21 ke under ek Fundamental Right hai.',
      ruling: '9-judge Constitution Bench ne kaha ki citizen ka data, personal chats aur surveillance bina legal proportionality ke violate nahi kiya ja sakta.',
      howToCite: 'Privacy violation ya unauthorized data leak me Puttaswamy judgment cite karein.',
    },
  },
  {
    id: 'vishaka',
    patterns: [/vishaka/i, /posh\s*(act|guidelines)/i, /sexual\s*harassment\s*(at\s*workplace|guidelines)/i],
    title: 'Vishaka & Ors. v. State of Rajasthan (1997) 7 SCC 241',
    topic: 'Workplace Sexual Harassment & POSH Guidelines',
    en: {
      headline: 'Framed historic guidelines creating Internal Complaints Committees (ICC) for women safety at workplaces.',
      ruling: 'Mandated every organization with 10+ employees to institute an Internal Complaints Committee presided over by a senior woman to investigate harassment within 90 days.',
      howToCite: 'Cite when an employer fails to provide a safe working environment or victimizes an employee reporting harassment.',
    },
    hi: {
      headline: 'कार्यस्थल पर महिलाओं के यौन उत्पीड़न की रोकथाम के लिए विशाखा गाइडलाइन्स।',
      ruling: 'सुप्रीम कोर्ट ने हर संस्थान में आंतरिक शिकायत समिति (ICC) का गठन अनिवार्य किया, जिसके आधार पर संसद ने 2013 में POSH Act पारित किया।',
      howToCite: 'ऑफिस में प्रताड़ना या ICC न होने की स्थिति में विशाखा निर्णय का संदर्भ दें।',
    },
    hinglish: {
      headline: 'Workplace par women safety aur Internal Complaints Committee (ICC) ka landmark case.',
      ruling: 'Har company jisme 10+ employees hain, wahan POSH committee mandatory hai jo 90 days me inquiry complete kare.',
      howToCite: 'Workplace harassment ya missing ICC complaint me Vishaka guidelines cite karein.',
    },
  },
  {
    id: 'kesavananda_bharati',
    patterns: [/kesavananda/i, /basic\s*structure/i, /mool\s*dhancha/i, /13\s*judge/i],
    title: 'Kesavananda Bharati v. State of Kerala (1973) 4 SCC 225',
    topic: 'Basic Structure Doctrine of Constitution',
    en: {
      headline: 'Parliament can amend the Constitution, but cannot alter its Basic Structure (democracy, judicial review, rule of law).',
      ruling: 'A 13-judge bench established that fundamental democratic pillars are inviolable and cannot be wiped away even by a 2/3rd majority constitutional amendment.',
      howToCite: 'Cite when a government law attempts to undermine judicial independence or overturn constitutional guarantees.',
    },
    hi: {
      headline: 'संसद संविधान में संशोधन कर सकती है, लेकिन इसके "मूल ढांचे" (Basic Structure) को नष्ट नहीं कर सकती।',
      ruling: '13 जजों की सबसे बड़ी संविधान पीठ ने लोकतंत्र, निष्पक्ष न्यायपालिका और कानून के राज को संविधान का अमिट आधार माना।',
      howToCite: 'संवैधानिक अधिकारों या न्यायिक स्वतंत्रता पर किसी भी सरकारी अतिक्रमण के विरुद्ध यह निर्णय सर्वोपरि है।',
    },
    hinglish: {
      headline: 'Parliament Constitution amend kar sakti hai par "Basic Structure" destroy nahi kar sakti.',
      ruling: 'Democracy, judicial review aur fundamental rights ko 2/3rd majority se bhi remove nahi kiya ja sakta.',
      howToCite: 'Constitutional validity challenge karne ke liye Kesavananda Bharati cite karein.',
    },
  },
  {
    id: 'dashrathbhai',
    patterns: [/dashrathbhai/i, /part\s*payment\s*cheque/i, /138\s*part\s*payment/i],
    title: 'Dashrathbhai Patel v. Hitesh Patel (2022 INSC 1084)',
    topic: 'Section 138 Cheque Bounce & Part-Payment Defense',
    en: {
      headline: 'Notice demanding full cheque amount after receiving partial payment invalidates Section 138 complaint.',
      ruling: 'Under Section 56 of the NI Act, an endorsement must be made for part-payment. If a complainant demands the full ₹20 Lakhs when ₹4 Lakhs was already paid, the statutory demand notice is legally defective.',
      howToCite: 'Use as a complete defense if you paid part of the debt via bank transfer but the opponent still demanded the whole original cheque amount.',
    },
    hi: {
      headline: 'आंशिक भुगतान के बाद पूरे चेक का नोटिस भेजना धारा 138 के केस को खारिज कर देता है।',
      ruling: 'सुप्रीम कोर्ट ने कहा कि चेक बाउंस का नोटिस केवल वास्तविक बकाया राशि का ही हो सकता है। यदि पहले से प्राप्त भुगतान को छिपाकर पूरे चेक का नोटिस भेजा गया, तो केस रद्द होगा।',
      howToCite: 'यदि आपने आंशिक भुगतान कर दिया था और फिर भी पूरे चेक का केस हुआ है, तो इस केस का बचाव लें।',
    },
    hinglish: {
      headline: 'Part-payment receive karne ke baad full cheque amount ka notice Section 138 me dismiss ho jata hai.',
      ruling: 'Notice strictly actual pending balance ka hona chahiye. Agar opponent ne part payment chupaya to notice illegal hai.',
      howToCite: 'Cheque bounce defense me part payment proof ke sath Dashrathbhai case cite karein.',
    },
  },
  {
    id: 'bishan_das',
    patterns: [/bishan\s*das/i, /forceful\s*(eviction|lock|locking)/i, /makan\s*malik.*tala/i, /tenant\s*locked/i],
    title: 'Bishan Das v. State of Punjab (1961 2 SCR 69)',
    topic: 'Protection Against Forcible Eviction & Lockout',
    en: {
      headline: 'Landlords cannot take the law into their own hands to forcefully lock or evict a tenant without a court decree.',
      ruling: 'Even if a lease has expired, possession can only be recovered through competent court proceedings. Locking rooms, cutting electricity, or throwing belongings is criminal dispossession.',
      howToCite: 'Cite before the police or civil judge if your landlord puts their own lock on your door or cuts electricity/water.',
    },
    hi: {
      headline: 'मकान मालिक बिना कोर्ट आदेश के किरायेदार को जबरन बाहर नहीं निकाल सकता और न ताला लगा सकता है।',
      ruling: 'सुप्रीम कोर्ट की संविधान पीठ ने माना कि कानून के राज में किसी को भी जबरन बेदखल करने की अनुमति नहीं है। बिजली-पानी काटना या ताला लगाना अवैध है।',
      howToCite: 'मकान मालिक द्वारा ताला लगाने या सामान बाहर फेंकने पर इस निर्णय का संदर्भ देकर पुलिस व कोर्ट से राहत पाएं।',
    },
    hinglish: {
      headline: 'Landlord bina court order ke tenant ko forcefully evict ya tala nahi lag sakta.',
      ruling: 'Bijli-paani cut karna ya door par padlock lagana criminal act hai. Eviction ke liye formal court process mandatory hai.',
      howToCite: 'Landlord ke illegal lockout par police complaint aur court me Bishan Das case cite karein.',
    },
  },
];

// ─── Intellectual Applied Sections & Jurisprudential Scenarios ───
const APPLIED_SECTIONS_DB = [
  // 0. Advocate Abandonment Midway & Unauthorized Concession of Guilt
  {
    id: 'advocate_misconduct_abandonment',
    patterns: [
      /(advocate|lawyer|counsel|vakeel).*(leave|left|quit|abandon|drop|withdraw|midway|between|beech).*(case|guilty|confess|betray|bci|misconduct|say|said)/i,
      /(advocate|lawyer|counsel|vakeel).*(say|said|tell|told|stated).*(client.*guilty|guilty|confess)/i,
      /(what\s*if\s*advocate|what\s*if\s*lawyer|what\s*if\s*my\s*advocate).*(leave|abandon|quit|guilty)/i,
      /(advocate|lawyer|vakeel).*(beech\s*me\s*chhod|dhokha|gunehgar|vakalatnama)/i,
      /(client\s*is\s*guilty|lawyer\s*said\s*guilty|advocate\s*leaves\s*the\s*case|lawyer\s*leaves\s*case)/i,
      /(professional\s*misconduct.*(advocate|lawyer)|bar\s*council.*complaint)/i,
      /\b(advocate\s*abandon|lawyer\s*abandon|sayd\s*that\s*my\s*client\s*is\s*guilty|say.*client.*guilty)\b/i,
    ],
    incident: 'Advocate Abandoning Case Midway & Unauthorized Admission of Client Guilt',
    en: {
      title: 'Advocate Abandonment Midway & Unauthorized Concession of Guilt (Professional Misconduct vs Criminal Due Process)',
      summary: 'If an advocate abandons your case in between or unilaterally tells the court "my client is guilty", it represents an egregious violation of **The Advocates Act, 1961**, the **Bar Council of India (BCI) Rules of Professional Conduct**, and settled Supreme Court criminal jurisprudence.',
      sections: [
        '🏛️ **Supreme Court Ruling on Counsel Concessions (Babu v. State of Kerala, 2010 & Periasami v. State of Madras)**: In criminal law, **an advocate\'s admission of guilt DOES NOT bind the accused**! The court is legally prohibited from convicting you based on your advocate\'s concession or personal opinion. The prosecution carries the independent, non-delegable burden of proving guilt beyond reasonable doubt under Article 20(3) & 21 of the Constitution.',
        '🛡️ **Section 132 Bharatiya Sakshya Adhiniyam, 2023 (Old Section 126 Evidence Act) — Attorney-Client Privilege**: Communications between client and advocate are strictly confidential by law. An advocate is legally prohibited from disclosing any communication or stating personal opinions regarding your guilt. Doing so is an illegal breach of professional privilege.',
        '⚖️ **Section 35 The Advocates Act, 1961 — Professional Misconduct**: Disclosing client secrets, colluding with the prosecution, or falsely admitting guilt constitutes gross professional misconduct. The State Bar Council Disciplinary Committee has statutory powers to **suspend or permanently cancel the advocate\'s license to practice**.',
        '📜 **Rule 12 & Rule 15 Bar Council of India (BCI) Rules (Part VI, Ch. II)**: An advocate **cannot withdraw** from an engagement once accepted without sufficient cause and without giving reasonable notice to the client in advance. If an advocate withdraws unlawfully, they are legally bound to **refund the unearned legal fees**.',
      ],
      intellectualAnalysis: 'In the landmark judgment *Himalayan Coop. Group Housing Society v. Balwan Singh (2015 7 SCC 373)*, the Supreme Court authoritatively held that a counsel has no implied authority to make admissions or compromises prejudicial to the client\'s rights without express instructions. Furthermore, an accused has an inalienable Constitutional Right to fair legal representation under **Article 22(1)** and **Article 39A (Free Legal Aid / Section 341 BNSS)**.',
      action: '1. Immediately address the Judge: "Your Honour, my counsel\'s statement was unauthorized and contrary to instructions; please expunge it."\n2. File an Affidavit cancelling the advocate\'s Vakalatnama for breach of trust.\n3. Request the Court for time to engage a new advocate or apply for Free Legal Aid (DLSA).\n4. Lodge a formal complaint under Section 35 Advocates Act with the State Bar Council Disciplinary Committee.\n5. File a civil petition for refund of fees and damages for professional negligence.',
    },
    hi: {
      title: 'वकील द्वारा बीच में केस छोड़ना व मुवक्किल को दोषी बताना (व्यावसायिक कदाचार व कानूनी अधिकार)',
      summary: 'यदि कोई वकील बीच में केस छोड़ दे या कोर्ट में मुवक्किल को दोषी बता दे, तो यह **अधिवक्ता अधिनियम, 1961 (Advocates Act)**, बार काउंसिल ऑफ इंडिया (BCI) के नियमों और संविधान के तहत एक गंभीर विधिक कदाचार (Professional Misconduct) है।',
      sections: [
        '🏛️ **सुप्रीम कोर्ट का ऐतिहासिक सिद्धांत (बाबू बनाम केरल राज्य 2010 व पेरियासामी केस)**: आपराधिक कानून में **वकील द्वारा मुवक्किल को दोषी मानना कोर्ट पर बाध्यकारी नहीं होता**! सुप्रीम कोर्ट ने स्पष्ट किया है कि वकील के कहने मात्र से किसी को सज़ा नहीं दी जा सकती। अभियोजन पक्ष (Prosecution) को स्वतंत्र रूप से अपराध साबित करना अनिवार्य है (अनुच्छेद 20(3) व 21)।',
        '🛡️ **धारा 132 भारतीय साक्ष्य अधिनियम, 2023 (पुरानी धारा 126 Evidence Act) — विशेषाधिकार प्राप्त संवाद (Attorney-Client Privilege)**: मुवक्किल और वकील के बीच की बातें गोपनीय होती हैं। वकील द्वारा कोर्ट में मुवक्किल के खिलाफ बोलना कानूनन पूर्णतः निषिद्ध और अवैध है।',
        '⚖️ **धारा 35 अधिवक्ता अधिनियम, 1961 — व्यावसायिक कदाचार (Professional Misconduct)**: विरोधी पक्ष से मिलीभगत या मुवक्किल के साथ विश्वासघात करने पर स्टेट बार काउंसिल की अनुशासन समिति (Disciplinary Committee) वकील का **लाइसेंस निलंबित या हमेशा के लिए रद्द** कर सकती है।',
        '📜 **बार काउंसिल ऑफ इंडिया नियम (नियम 12 व 15)**: वकील बिना पर्याप्त कारण और पूर्व लिखित नोटिस के बीच में केस नहीं छोड़ सकता। यदि वह छोड़ता है, तो उसे **पूरी गैर-उपार्जित फीस लौटानी होगी**।',
      ],
      intellectualAnalysis: 'सुप्रीम कोर्ट ने *हिमालयन कोऑपरेटिव केस (2015)* में कहा कि वकील को मुवक्किल की स्पष्ट अनुमति के बिना उसके अधिकारों के विरुद्ध कोई भी बयान देने का अधिकार नहीं है। संविधान के अनुच्छेद 22(1) के तहत निष्पक्ष कानूनी रक्षा पाना आपका मौलिक अधिकार है।',
      action: '1. कोर्ट में तुरंत जज साहब को बताएं: "श्रीमान, वकील का यह बयान अनधिकृत है, इसे निरस्त (Expunge) किया जाए।"\n2. वकालतनामा रद्द करने का हलफनामा (Affidavit) दाखिल करें।\n3. नए वकील की नियुक्ति हेतु कोर्ट से समय मांगें या मुफ्त सरकारी वकील (DLSA धारा 341 BNSS) लें।\n4. स्टेट बार काउंसिल में धारा 35 के तहत वकील के खिलाफ अनुशासनात्मक शिकायत दर्ज कराएं।\n5. फीस वापसी और हर्जाने के लिए कानूनी कार्रवाई करें।',
    },
    hinglish: {
      title: 'Advocate beech me case chhod de ya client ko guilty bol de (Legal Remedies & BCI Rules)',
      summary: 'Agar vakeel beech me case chhod de ya adalat me bol de ki "mera client guilty hai", to yeh **Advocates Act 1961** aur **Bar Council Rules** ke tehat illegal Professional Misconduct hai.',
      sections: [
        '🏛️ **Supreme Court Ruling (Babu v. State of Kerala & Periasami Case)**: Criminal case me **lawyer ke bolne se accused guilty nahi hota**! Court lawyer ke statement par conviction nahi kar sakti; prosecution ko crime independently prove karna padta hai.',
        '🛡️ **Section 132 BSA 2023 (Old Section 126 Evidence Act) — Client Privilege**: Client aur advocate ke beech ki baatein legally confidential hoti hain. Lawyer legally apne client ke khilaf statement nahi de sakta.',
        '⚖️ **Section 35 Advocates Act 1961 — Professional Misconduct**: Opponent party se collusion ya client ko betray karne par State Bar Council lawyer ka **licence suspend ya cancel** kar sakti hai.',
        '📜 **Rule 12 BCI Rules**: Lawyer bina valid reason aur notice ke case nahi chhod sakta, aur beech me chhodne par **fees wapas (refund)** karni padti hai.',
      ],
      intellectualAnalysis: 'Himalayan Coop Case (2015 SC) me Supreme Court ne hold kiya ki lawyer bina client ki explicit instruction ke guilt concede nahi kar sakta. Article 22(1) aur Section 341 BNSS (Legal Aid) aapka constitutional right hai.',
      action: '1. Court me Magistrate ko bole ki lawyer ka statement unauthorized hai aur use expunge karein.\n2. Vakalatnama cancel karne ka application file karein.\n3. Naya advocate appoint karein ya free Legal Aid (DLSA) claim karein.\n4. State Bar Council me Section 35 Advocates Act ki complaint darj karein.\n5. Fees refund aur damages claim karein.',
    },
  },

  // 0.1 False Criminal Case & Quashing Frivolous FIR
  {
    id: 'false_case_quashing',
    patterns: [
      /(false\s*case|fake\s*fir|jhootha\s*case|fake\s*case|false\s*complaint|quash\s*fir|section\s*482|528\s*bnss)/i,
      /(झूठा\s*केस|फर्जी\s*एफआईआर|झूठी\s*शिकायत|केस\s*रद्द)/i,
      /(jhootha\s*mukadma|false\s*allegation|quash\s*karwana)/i,
    ],
    incident: 'Protection Against False Cases & Quashing of Frivolous FIRs',
    en: {
      title: 'False Criminal Cases & Quashing of FIR (Inherent Powers of High Court)',
      summary: 'Facing a fabricated criminal case or extortionate FIR is governed by the High Court\'s extraordinary inherent powers to prevent abuse of the judicial process.',
      sections: [
        '⚖️ **Section 528 BNSS 2023 (Old Section 482 CrPC) — Quashing Petition**: Extraordinary inherent power of the High Court to quash a malicious, absurd, or groundless FIR to prevent miscarriage of justice.',
        '⚖️ **Section 217 & 218 BNS 2023 (Old Section 182 & 211 IPC) — False Charges with Intent to Injure**: Whoever falsely charges someone knowing there is no just or lawful ground faces up to 7 years imprisonment + fine.',
        '🏛️ **Supreme Court Ruling (State of Haryana v. Bhajan Lal, 1992)**: Formulated 7 golden categories where High Courts must quash FIRs, including where allegations are inherently improbable or manifestly attended with mala fide motives.',
      ],
      intellectualAnalysis: 'The Supreme Court in *Geeta Mehrotra v. State of UP* and *Kahkashan Kausar v. State of Bihar* strictly held that general and omnibus allegations without specific overt acts cannot be sustained to harass family members.',
      action: 'File a Criminal Miscellaneous Petition under Section 528 BNSS before the High Court for quashing the FIR, and seek interim stay on arrest.',
    },
    hi: {
      title: 'झूठे मुकदमों से सुरक्षा व FIR रद्द कराना (हाई कोर्ट की अंतर्निहित शक्तियां)',
      summary: 'फर्जी या दुर्भावनापूर्ण मुकदमों से बचाव के लिए कानून में त्वरित राहत और झूठी शिकायत करने वाले पर कड़ी सज़ा का प्रावधान है।',
      sections: [
        '⚖️ **धारा 528 BNSS 2023 (पुरानी धारा 482 CrPC) — FIR रद्द (Quashing) याचिका**: हाई कोर्ट को किसी भी फर्जी या बदले की भावना से दर्ज FIR को सीधे रद्द करने का पूर्ण अधिकार है।',
        '⚖️ **धारा 217 व 218 BNS 2023 (पुरानी धारा 182 व 211 IPC) — झूठा आरोप लगाने पर सज़ा**: किसी पर जानबूझकर झूठा केस दर्ज कराने वाले को 7 वर्ष तक की कठोर जेल हो सकती है।',
        '🏛️ **भजन लाल केस (1992 SC)**: सुप्रीम कोर्ट ने 7 स्थितियां तय की हैं जहां हाई कोर्ट को तुरंत केस निरस्त करना अनिवार्य है।',
      ],
      intellectualAnalysis: 'सुप्रीम कोर्ट के अनुसार बिना ठोस सबूत केवल दबाव बनाने के लिए दर्ज कराए गए मुकदमों को न्यायिक प्रक्रिया का दुरुपयोग माना जाता है।',
      action: 'हाई कोर्ट में धारा 528 BNSS के तहत FIR निरस्तीकरण (Quashing) की याचिका दाखिल करें और गिरफ्तारी पर रोक (Stay) मांगें।',
    },
    hinglish: {
      title: 'Jhoothe Case se Bachav aur FIR Quashing Rules',
      summary: 'Fake FIR se bachne ke liye High Court me Section 528 BNSS (Old 482 CrPC) ke tehat FIR quash karwai ja sakti hai.',
      sections: [
        '⚖️ **Section 528 BNSS (Old 482 CrPC) — Quashing**: High Court ke paas fake aur baseless FIR ko permanently dismiss karne ki inherent power hai.',
        '⚖️ **Section 217/218 BNS (Old IPC 182/211) — Penalty for False Charges**: Jhootha case karne wale ko 7 saal tak ki jail ho sakti hai.',
        '🏛️ **Bhajan Lal Landmark Precedent**: 7 criteria jisme court FIR dismiss karti hai agar allegations absurd ya malicious hon.',
      ],
      intellectualAnalysis: 'General allegations bina proof ke family ko harass karne ke liye use nahi kiye ja sakte (Geeta Mehrotra ruling).',
      action: 'High Court me 528 BNSS Quashing Petition file karein aur advocate ke zariye arrest stay lein.',
    },
  },

  // 1. Theft / Stealing Pen / Petty Items
  {
    id: 'theft_petty',
    patterns: [
      /(steal|stole|theft|thief|chori|frien.*pen|pen|pencil|notebook|wallet|purse|mobile|laptop)/i,
      /(चोरी|पेन|कलम|दोस्त.*पेन|सामान.*चुराना|पर्स|मोबाइल)/i,
      /(pen.*chura|pen.*le\s*liya|chori.*kar|pen\s*chori)/i,
    ],
    incident: 'Stealing a Friend\'s Pen or Petty Movable Property',
    en: {
      title: 'Stealing a Friend\'s Pen / Petty Property (Theft vs The Doctrine of Trifles)',
      summary: 'Under strict black-letter law, taking someone\'s movable property without consent constitutes Theft under **Section 303(2) of the Bharatiya Nyaya Sanhita (BNS 2023)** [Old **Section 379 IPC**]. However, the legal system applies a profound jurisprudential shield: **The Doctrine of "De Minimis Non Curat Lex"**.',
      sections: [
        '⚖️ **Section 303(2) BNS 2023 (Old Section 379 IPC) — Criminal Theft**: Whoever, intending to dishonestly take movable property out of another\'s possession without consent, moves it, commits theft. Standard punishment: Up to 3 years imprisonment or fine or both.',
        '🏛️ **The 2023 BNS Reform (Section 303(2) Proviso)**: Where stolen property is valued at **less than ₹5,000** and the offender is a first-time offender (restoring the item), the court is statutorily empowered to sentence them to **Community Service** rather than jail!',
        '🛡️ **Section 21 BNS 2023 (Old Section 95 IPC) — "De Minimis Non Curat Lex" (The law does not concern itself with trifles)**: "Nothing is an offence by reason that it causes harm so slight that no person of ordinary sense and temper would complain." Taking a friend\'s ordinary pen lacks the felonious Mens Rea (*animus furandi* — intention to permanently deprive) required to sustain a criminal prosecution.',
      ],
      intellectualAnalysis: 'In criminal jurisprudence, 5 elements (*sine qua non*) must coincide for theft: (1) Dishonest intention, (2) Movable property, (3) Taken out of lawful possession, (4) Absence of consent, (5) Physical asportation (moving). Because friends possess implied social licenses and the value is trivial, Section 21 BNS operates as an absolute statutory defence unless the pen is an ultra-rare luxury fountain pen (e.g. ₹50,000 Montblanc) taken with fraudulent felonious intent.',
      action: 'No court or police station will register an FIR for an ordinary pen under Section 21 BNS. If valuable property was misappropriated, Section 303(2) BNS applies with the Community Service proviso.',
    },
    hi: {
      title: 'दोस्त का पेन या छोटी वस्तु चुराना (चोरी बनाम तुच्छता का सिद्धांत)',
      summary: 'शाब्दिक कानून के तहत किसी की चल संपत्ति बिना सहमति लेना **भारतीय न्याय संहिता (BNS 2023) की धारा 303(2)** [पुरानी **IPC धारा 379**] के तहत चोरी है। लेकिन भारतीय न्यायशास्त्र एक महत्वपूर्ण संरक्षण प्रदान करता है: **"De Minimis Non Curat Lex" (तुच्छ बातों पर कानून संज्ञान नहीं लेता)**।',
      sections: [
        '⚖️ **धारा 303(2) BNS 2023 (पुरानी IPC धारा 379) — चोरी का अपराध**: बेईमानी के इरादे से किसी की संपत्ति को बिना सहमति हटाना चोरी है। सामान्य सज़ा: 3 वर्ष तक की जेल या जुर्माना या दोनों।',
        '🏛️ **BNS 2023 का नया सुधार (धारा 303(2) परंतुक)**: यदि चुराई गई वस्तु का मूल्य **₹5,000 से कम** है और आरोपी पहली बार का अपराधी है, तो अदालत जेल भेजने के बजाय **सामुदायिक सेवा (Community Service)** का आदेश दे सकती है!',
        '🛡️ **धारा 21 BNS 2023 (पुरानी IPC धारा 95) — तुच्छता का सिद्धांत (De Minimis Rule)**: कानून स्पष्ट करता है कि यदि कोई कार्य इतना मामूली है कि सामान्य समझ का कोई भी व्यक्ति उसकी शिकायत नहीं करेगा, तो वह कोई अपराध नहीं है। दोस्त का पेन लेना इसी श्रेणी में आता है क्योंकि इसमें स्थायी नुकसान पहुंचाने की आपराधिक मंशा (Mens Rea) नहीं होती।',
      ],
      intellectualAnalysis: 'चोरी सिद्ध करने हेतु 5 अनिवार्य तत्व चाहिए: (1) बेईमानी का इरादा, (2) चल संपत्ति, (3) कब्जे से बाहर करना, (4) सहमति का अभाव, (5) स्थान परिवर्तन। सामान्य पेन के मामले में धारा 21 BNS के तहत मुकदमा चलने योग्य नहीं होता, जब तक कि वह कोई अत्यंत कीमती विंटेज पेन न हो जिसे जानबूझकर हड़पने की नीयत से चुराया गया हो।',
      action: 'सामान्य पेन के लिए पुलिस FIR दर्ज नहीं कर सकती (धारा 21 BNS)। कीमती वस्तु होने पर धारा 303(2) BNS लागू होगी।',
    },
    hinglish: {
      title: 'Friend ka Pen churana ya Petty Theft (Theft vs De Minimis Rule)',
      summary: 'Technically kisi ki movable property bina permission lena **Section 303(2) BNS 2023** (Old **Section 379 IPC**) ke under Theft (Chori) hai. Lekin Indian Law me ek classic doctrine lagti hai: **"De Minimis Non Curat Lex" (Law chhote mamlon par dhyan nahi deta)**.',
      sections: [
        '⚖️ **Section 303(2) BNS 2023 (Old IPC 379) — Theft**: Dishonest intention se bina consent property move karna theft hai. Maximum punishment: 3 saal jail ya fine.',
        '🏛️ **BNS 2023 New Reform (Sec 303(2) Proviso)**: Agar stolen property ki value **₹5,000 se kam** hai aur offender first-timer hai, to court jail ke badle **Community Service** ka order de sakti hai!',
        '🛡️ **Section 21 BNS 2023 (Old IPC 95) — Doctrine of Trifles**: "Jo harm itna slight ho ki normal insaan complaint na kare, wo crime nahi hota." Friend ka pen lena Section 21 BNS ke doctrine of trifles me cover hota hai kyunki isme felonious Mens Rea (permanent loss) nahi hota.',
      ],
      intellectualAnalysis: 'Theft ke 5 elements hote hain: (1) Dishonest intent, (2) Movable property, (3) Out of possession, (4) Lack of consent, (5) Movement. Normal pen ke case me Section 21 BNS complete legal shield deta hai. Par agar pen ₹25,000 ka Montblanc antique ho aur intentionally churaya gaya ho, to Section 303(2) BNS lag sakti hai!',
      action: 'Normal pen ke liye koi FIR nahi hoti under Sec 21 BNS. High-value item hone par Section 303(2) BNS apply hota hai.',
    },
  },

  // 2. Assault / Slapping someone
  {
    id: 'assault_slap',
    patterns: [
      /(slap|punch|hit|thappad|marpeet|beat.*someone|physical.*fight|assault.*me|slapped|mara|peeta|haath\s*uthaya)/i,
      /(थप्पड़|मारपीट|हाथापाई|मारा|पीटा|चोट)/i,
      /(thappad\s*mar|kisi\s*ko\s*mara|haath\s*uthaya)/i,
    ],
    incident: 'Physical Altercation, Slapping & Assault',
    en: {
      title: 'Physical Assault & Slapping (Voluntarily Causing Hurt vs Self-Defence)',
      summary: 'Slapping or physically hitting someone constitutes Voluntarily Causing Hurt and Criminal Force under the Bharatiya Nyaya Sanhita 2023, subject to the statutory Right of Private Defence.',
      sections: [
        '⚖️ **Section 115(2) BNS 2023 (Old Section 323 IPC) — Simple Hurt**: Voluntarily causing bodily pain, disease, or infirmity. Punishment: Imprisonment up to 1 year, or fine up to ₹10,000, or both (Non-Cognizable, Bailable).',
        '⚖️ **Section 131 BNS 2023 (Old Section 352 IPC) — Assault or Criminal Force**: Assault without grave provocation. Punishment: Imprisonment up to 3 months or fine up to ₹1,000.',
        '⚖️ **Section 117 BNS 2023 (Old Section 325 IPC) — Grievous Hurt**: If the slap causes fracture, permanent disfigurement, or tooth dislocation. Punishment: Up to 7 years jail (Cognizable & Non-Bailable).',
        '🛡️ **Sections 34–44 BNS 2023 (Old IPC 96–106) — Right of Private Defence**: Every citizen has a statutory right to defend their own body. However, the legal **Test of Proportionality** mandates that the defensive force cannot exceed what is strictly necessary to repel the imminent threat. Mere verbal provocation never legally justifies a physical slap.',
      ],
      intellectualAnalysis: 'Under the Doctrine of Grave and Sudden Provocation, liability can be mitigated if the accused was deprived of self-control by immediate, unprovoked acts. However, the provocation must not be self-sought or voluntary.',
      action: 'If assaulted, dial 112, undergo a government Medico-Legal Case (MLC) examination within 24 hours, and file an NC/FIR under Section 115(2) BNS.',
    },
    hi: {
      title: 'थप्पड़ मारना व शारीरिक हमला (चोट पहुंचाना बनाम आत्मरक्षा का अधिकार)',
      summary: 'किसी को थप्पड़ मारना या चोट पहुंचाना BNS 2023 के तहत स्वेच्छा से चोट पहुंचाने का अपराध है, जिस पर आत्मरक्षा (Private Defence) के कड़े नियम लागू होते हैं।',
      sections: [
        '⚖️ **धारा 115(2) BNS 2023 (पुरानी IPC धारा 323) — साधारण चोट (Simple Hurt)**: स्वेच्छा से शारीरिक पीड़ा पहुंचाना। सज़ा: 1 वर्ष तक की जेल या ₹10,000 तक जुर्माना (असंज्ञेय, जमानती)।',
        '⚖️ **धारा 131 BNS 2023 (पुरानी IPC धारा 352) — आपराधिक बल प्रयोग**: बिना गंभीर उकसावे के हमला करना। सज़ा: 3 माह तक जेल या ₹1,000 जुर्माना।',
        '⚖️ **धारा 117 BNS 2023 (पुरानी IPC धारा 325) — गंभीर चोट (Grievous Hurt)**: यदि थप्पड़ से दांत टूट जाए या हड्डी में फ्रैक्चर आए। सज़ा: 7 वर्ष तक की कठोर जेल (संज्ञेय व गैर-जमानती)।',
        '🛡️ **धाराएं 34–44 BNS 2023 (पुरानी IPC 96–106) — आत्मरक्षा का अधिकार (Private Defence)**: कानूनन हर व्यक्ति को अपने शरीर की रक्षा का अधिकार है, लेकिन **समानुपातिकता का सिद्धांत (Doctrine of Proportionality)** अनिवार्य है—हमले का जवाब केवल तात्कालिक खतरे को रोकने जितना ही हो सकता है। केवल गाली-गलौज के जवाब में हाथ उठाना कानूनन अपराध है।',
      ],
      intellectualAnalysis: 'गंभीर व तात्कालिक उकसावे (Grave & Sudden Provocation) के तहत सज़ा कम हो सकती है, यदि व्यक्ति का आत्म-नियंत्रण पूरी तरह छिन गया हो।',
      action: 'मारपीट होने पर तुरंत 112 पर फोन करें, 24 घंटे में सरकारी अस्पताल से MLC बनवाएं और धारा 115(2) BNS में शिकायत दें।',
    },
    hinglish: {
      title: 'Thappad marna ya Assault (Voluntarily Causing Hurt & Self Defence)',
      summary: 'Kisi par haath uthana ya thappad marna BNS 2023 ke under Voluntarily Causing Hurt ka offense hai.',
      sections: [
        '⚖️ **Section 115(2) BNS 2023 (Old IPC 323) — Simple Hurt**: Pain ya swelling cause karna. Punishment: 1 saal tak jail ya ₹10,000 fine (Bailable).',
        '⚖️ **Section 131 BNS 2023 (Old IPC 352) — Criminal Force**: Bina grave provocation ke attack. Punishment: 3 months jail.',
        '⚖️ **Section 117 BNS 2023 (Old IPC 325) — Grievous Hurt**: Agar daant toot jaye ya fracture aaye to up to 7 years jail (Non-Bailable).',
        '🛡️ **Sections 34–44 BNS 2023 (Old IPC 96–106) — Right of Private Defence**: Self-defence ka right hai par **Proportionality Rule** follow karna padta hai—force sirf threat rokne tak ho sakti hai. Sirf gaali sunkar thappad marna illegal assault hai.',
      ],
      intellectualAnalysis: 'Agar sudden aur unprovoked provocation tha to punishment reduce ho sakti hai under Indian criminal doctrines.',
      action: 'Chot lagne par 112 call karein, hospital se MLC karwayein aur Section 115(2) BNS me complaint karein.',
    },
  },

  // 3. Borrowed Money Not Returned / Cheating vs Debt
  {
    id: 'borrow_debt',
    patterns: [
      /(borrow|lent|udhar|debt|420|fraud).*(money|paisa|return|pay|back|laut)/i,
      /(money|paisa|cash).*(borrow|not\s*return|not\s*pay|wapas|laut|fasa|cheat)/i,
      /(उधार|पैसे\s*वापस|धोखा|कर्ज|420|पैसे.*भाग)/i,
      /(paise.*laut|udhari|paisa.*fasa|420\s*ka\s*case)/i,
    ],
    incident: 'Money Borrowed and Not Returned (Civil Debt vs Criminal Cheating)',
    en: {
      title: 'Money Borrowed & Not Returned (Criminal Cheating vs Civil Debt Recovery)',
      summary: 'Under Indian law, a critical jurisprudential divide exists between a mere Civil Breach of Contract and Criminal Cheating under the Bharatiya Nyaya Sanhita.',
      sections: [
        '⚖️ **Section 318(4) BNS 2023 (Old Section 420 IPC) — Criminal Cheating**: Dishonestly inducing delivery of property with fraudulent intent. Punishment: Up to 7 years imprisonment + fine (Cognizable & Non-Bailable).',
        '⚖️ **Order 37 Code of Civil Procedure (CPC) — Summary Suit**: Expedited civil recovery of commercial debt and unpaid promissory notes within 3 years limitation.',
        '⚖️ **Section 138 Negotiable Instruments Act**: If a cheque was issued that bounced. Punishment: Up to 2 years imprisonment + double the cheque amount.',
      ],
      intellectualAnalysis: '🏛️ **The "Test of Inception" (Supreme Court: Hridaya Ranjan Prasad Verma v. State of Bihar & S.W. Palanitkar)**: The Supreme Court decisively ruled that mere failure or financial inability to repay a debt is strictly a **Civil Dispute**. To sustain an FIR for Criminal Cheating (Section 318 BNS), the complainant must prove that the borrower harbored fraudulent intention (*mens rea*) **at the very inception** (the exact moment of taking the money). If the intent was originally honest, subsequent non-payment cannot be criminalized.',
      action: 'Send a formal Statutory Demand Notice within 3 years. If cheque was dishonoured, initiate Section 138 NI Act proceedings within 30 days.',
    },
    hi: {
      title: 'उधार लेकर पैसे न लौटाना (आपराधिक धोखाधड़ी बनाम सिविल कर्ज वसूली)',
      summary: 'भारतीय कानून में सिविल संविदा भंग (Breach of Contract) और आपराधिक धोखाधड़ी (Cheating) के बीच एक स्पष्ट संवैधानिक व न्यायिक सीमा है।',
      sections: [
        '⚖️ **धारा 318(4) BNS 2023 (पुरानी IPC धारा 420) — धोखाधड़ी (Cheating)**: बेईमानी से संपत्ति प्राप्त करना। सज़ा: 7 वर्ष तक की जेल व जुर्माना (संज्ञेय, गैर-जमानती)।',
        '⚖️ **ऑर्डर 37 सिविल प्रक्रिया संहिता (CPC) — समरी सूट**: कर्ज वसूली हेतु 3 वर्ष के भीतर त्वरित सिविल वाद।',
        '⚖️ **धारा 138 पराक्रम्य लिखत अधिनियम (NI Act)**: यदि देनदार का चेक बाउंस हुआ हो। सज़ा: 2 साल तक की जेल व चेक राशि का दोगुना जुर्माना।',
      ],
      intellectualAnalysis: '🏛️ **सुप्रीम कोर्ट का "शुरुआती मंशा का सिद्धांत" (Test of Inception — हृदय रंजन प्रसाद वर्मा केस)**: सुप्रीम कोर्ट ने स्पष्ट किया कि केवल पैसा न लौटा पाना दीवानी विवाद (Civil Dispute) है, अपराध नहीं। धारा 318 BNS (पुरानी 420) के तहत FIR तभी टिक सकती है जब साबित हो कि उधार लेते समय पहली ही घड़ी से आरोपी की नीयत बेईमान थी।',
      action: 'वकील के माध्यम से तत्काल कानूनी नोटिस (Legal Notice) भेजें। चेक बाउंस होने पर 30 दिन में धारा 138 की कानूनी प्रक्रिया शुरू करें।',
    },
    hinglish: {
      title: 'Borrow kiya paisa wapas na karna (Civil Debt vs Sec 318 BNS 420)',
      summary: 'Paisa wapas na aana automatically criminal offense nahi hota—ye Civil Dispute aur Criminal Cheating ke difference par depend karta hai.',
      sections: [
        '⚖️ **Section 318(4) BNS 2023 (Old IPC 420) — Cheating**: Fraudulent intent se paisa lena. Punishment: Up to 7 years jail (Non-Bailable).',
        '⚖️ **Order 37 CPC — Summary Suit**: Civil Court me fast-track money recovery lawsuit.',
        '⚖️ **Section 138 NI Act**: Agar cheque bounce hua to 2 saal tak ki jail aur double penalty.',
      ],
      intellectualAnalysis: '🏛️ **Supreme Court Test of Inception (Hridaya Ranjan Case)**: Agar borrowing ke waqt borrower ka intention honest tha par baad me financial crisis hui, to ye strictly Civil Matter hai. FIR tabhi valid hoti hai jab prove ho ki starting se hi dhokha dene ki planning thi.',
      action: 'Pehle formal Legal Demand Notice send karein. Check Legal Notice Generator on our platform.',
    },
  },

  // 4. Taking Photos Without Consent / Voyeurism
  {
    id: 'photo_voyeurism',
    patterns: [
      /(photo|video|camera|record|voyeur).*(consent|permission|secret|hidden|bina|without)/i,
      /(बिना\s*अनुमति\s*फोटो|गुप्त\s*वीडियो|निजता|फोटो\s*खींच|प्राइवेसी)/i,
      /(bina\s*permission\s*photo|hidden\s*camera|secret\s*video|photo\s*viral)/i,
    ],
    incident: 'Taking Photos/Videos Without Consent & Voyeurism',
    en: {
      title: 'Taking Photos/Videos Without Consent (Voyeurism & Privacy Rights)',
      summary: 'Capturing or circulating intimate or non-consensual images violates constitutional privacy and statutory penal provisions.',
      sections: [
        '⚖️ **Section 77 BNS 2023 (Old Section 354C IPC) — Voyeurism**: Capturing, viewing, or distributing images of a woman in private circumstances where she has reasonable expectation of privacy. 1st conviction: 1 to 3 years imprisonment (Bailable); 2nd conviction: 3 to 7 years imprisonment (Non-Bailable).',
        '⚖️ **Section 66E Information Technology Act 2000 — Privacy Violation**: Intentionally capturing or transmitting images of private body parts without consent. Punishment: Up to 3 years imprisonment or fine up to ₹2 Lakhs.',
        '⚖️ **Section 356 BNS 2023 (Old Section 499 IPC) — Defamation**: If photos are doctored, weaponized, or circulated to destroy social reputation.',
      ],
      intellectualAnalysis: '🏛️ **Constitutional Doctrine: Justice K.S. Puttaswamy v. Union of India (2017)**: The 9-judge Constitution Bench held that bodily autonomy and informational privacy are inalienable Fundamental Rights under **Article 21**. Under Rule 3(2)(b) of the IT Rules 2021, social media platforms are statutorily mandated to remove non-consensual intimate imagery within **24 hours** of complaint.',
      action: 'Preserve digital screenshots and URLs. Dial 1930 Cyber Helpline and register complaint on cybercrime.gov.in and Women Helpline 181.',
    },
    hi: {
      title: 'बिना सहमति फोटो/वीडियो लेना (वॉयरिज्म व निजता का अधिकार)',
      summary: 'किसी व्यक्ति की अनुमति के बिना फोटो खींचना या वीडियो बनाना संवैधानिक निजता और आपराधिक कानूनों का गंभीर उल्लंघन है।',
      sections: [
        '⚖️ **धारा 77 BNS 2023 (पुरानी IPC धारा 354C) — वॉयरिज्म (दृश्यरतिकता)**: महिला की निजी पलों में बिना सहमति फोटो खींचना या शेयर करना। पहली बार: 1 से 3 साल जेल (जमानती); दूसरी बार: 3 से 7 साल जेल (गैर-जमानती)।',
        '⚖️ **धारा 66E सूचना प्रौद्योगिकी अधिनियम (IT Act)**: सहमति के बिना निजी अंगों की तस्वीरें प्रसारित करना। सज़ा: 3 साल तक की जेल या ₹2 लाख जुर्माना।',
        '⚖️ **धारा 356 BNS 2023 (पुरानी IPC 499) — मानहानि**: यदि तस्वीरों का इस्तेमाल बदनामी करने या ब्लैकमेल करने हेतु किया जाए।',
      ],
      intellectualAnalysis: '🏛️ **पुट्टास्वामी वाद (2017)**: सुप्रीम कोर्ट ने माना कि निजता संविधान के अनुच्छेद 21 के तहत मौलिक अधिकार है। आईटी रूल्स 2021 (नियम 3(2)(b)) के अनुसार सोशल मीडिया प्लेटफॉर्म को शिकायत मिलने के 24 घंटे के भीतर आपत्तिजनक सामग्री हटानी होगी।',
      action: 'डिजिटल स्क्रीनशॉट और यूआरएल सुरक्षित रखें। 1930 साइबर हेल्पलाइन और cybercrime.gov.in पर तत्काल रिपोर्ट करें।',
    },
    hinglish: {
      title: 'Bina Permission Photo/Video lena (Voyeurism & Section 77 BNS)',
      summary: 'Kisi ki bina consent photo lena ya circulate karna Article 21 Privacy aur BNS ke tehat punishable offense hai.',
      sections: [
        '⚖️ **Section 77 BNS 2023 (Old IPC 354C) — Voyeurism**: Private space me bina permission women ki photo/video lena. 1st offence: 1-3 years jail; Repeat offence: 3-7 years jail (Non-Bailable).',
        '⚖️ **Section 66E IT Act — Bodily Privacy**: Private images capture ya forward karna. 3 saal tak jail / ₹2 Lakh fine.',
        '⚖️ **IT Rules 2021 (24-Hour Takedown Rule)**: Social media platforms 24 ghante ke andar content remove karne ke liye legally bound hain.',
      ],
      intellectualAnalysis: 'Puttaswamy judgment ke mutabik informational aur bodily privacy Fundamental Right hai Article 21 ke tehat.',
      action: 'Screenshots aur links save karein. 1930 Cyber helpline par call karein aur cybercrime.gov.in par FIR darj karayein.',
    },
  },

  // 5. Abuse, Insult & Defamation
  {
    id: 'abuse_defamation',
    patterns: [
      /(gaali|abuse|insult|defamation|defame|badnaam|verbal\s*threat|badnaami|apman)/i,
      /(गाली|अपमान|बदनाम|मानहानि|अपमानजनक|धमकी)/i,
      /(gaali\s*di|badnaam\s*kiya|defamation\s*case|apmanit\s*kiya)/i,
    ],
    incident: 'Verbal Abuse, Insult & Criminal Defamation',
    en: {
      title: 'Verbal Abuse, Public Insult & Criminal Defamation (BNS 352 & 356)',
      summary: 'Hurls of abusive words or false allegations that damage personal reputation are actionable under both criminal and tort law.',
      sections: [
        '⚖️ **Section 352 BNS 2023 (Old Section 504 IPC) — Intentional Insult**: Provoking breach of public peace or provoking someone to commit an offense. Punishment: Imprisonment up to 2 years or fine or both.',
        '⚖️ **Section 356 BNS 2023 (Old Section 499/500 IPC) — Criminal Defamation**: Making or publishing defamatory imputations knowing it harms reputation. Punishment: Simple imprisonment up to 2 years, or fine, or Community Service.',
        '⚖️ **Section 79 BNS 2023 (Old Section 509 IPC)**: Word, gesture, or sound intended to insult the modesty of a woman. Punishment: Up to 3 years imprisonment (Cognizable).',
      ],
      intellectualAnalysis: 'Constitutional Balancing: Article 19(1)(a) (Freedom of Speech) is subject to Article 19(2) Reasonable Restrictions. Under the **First Exception to Section 356 BNS**, an imputation of truth made for the public good is an absolute legal defense against criminal defamation.',
      action: 'Preserve audio recordings, WhatsApp messages, or witness statements. Send a formal Cease & Desist Legal Notice demanding unconditional apology.',
    },
    hi: {
      title: 'गाली-गलौज, सार्वजनिक अपमान व आपराधिक मानहानि (BNS 352 व 356)',
      summary: 'गाली देना, उकसाना या झूठे आरोप लगाकर प्रतिष्ठा को नुकसान पहुंचाना कानूनन दंडनीय अपराध है।',
      sections: [
        '⚖️ **धारा 352 BNS 2023 (पुरानी IPC धारा 504) — जानबूझकर अपमान**: शांति भंग करने के इरादे से अपमानित करना। सज़ा: 2 साल तक की जेल या जुर्माना या दोनों।',
        '⚖️ **धारा 356 BNS 2023 (पुरानी IPC 499/500) — आपराधिक मानहानि**: किसी की छवि धूमिल करने वाले बयान प्रकाशित करना। सज़ा: 2 साल तक साधारण कारावास या सामुदायिक सेवा।',
        '⚖️ **धारा 79 BNS 2023 (पुरानी IPC 509)**: किसी महिला की मर्यादा को ठेस पहुंचाने वाले शब्द या इशारे करना। सज़ा: 3 साल तक की जेल (संज्ञेय)।',
      ],
      intellectualAnalysis: 'संविधान के अनुच्छेद 19(1)(a) का वाक् स्वातंत्र्य असीमित नहीं है। धारा 356 BNS के पहले अपवाद के तहत, लोककल्याण (Public Good) के लिए बोला गया सत्य मानहानि नहीं माना जाता।',
      action: 'ऑडियो रिकॉर्डिंग या चैट सबूत सहेजें और वकील के जरिए मानहानि का कानूनी नोटिस (Legal Notice) भेजें।',
    },
    hinglish: {
      title: 'Gaali Galoch aur Criminal Defamation (BNS 352 & 356)',
      summary: 'Publicly gali dena ya false allegations lagana BNS ke tehat punishable criminal act hai.',
      sections: [
        '⚖️ **Section 352 BNS 2023 (Old IPC 504) — Intentional Insult**: Peace disrupt karne ke liye provoke karna. 2 years jail.',
        '⚖️ **Section 356 BNS 2023 (Old IPC 499) — Criminal Defamation**: Image kharab karne wale jhoothe bayaan. 2 years jail ya Community Service.',
        '⚖️ **Section 79 BNS 2023 (Old IPC 509)**: Women modesty ke khilaf abusive language use karna (Cognizable crime).',
      ],
      intellectualAnalysis: 'Article 19(1)(a) Free Speech vs Reputation Protection. Agar koi statement public good ke liye sach hai, to defamation nahi hota.',
      action: 'Audio/text proof preserve karein aur Cease & Desist Legal Notice send karein.',
    },
  },

  // 6. Rash Driving & Accidents
  {
    id: 'rash_driving',
    patterns: [
      /(rash\s*driving|accident|car\s*hit|bike\s*crash|road\s*accident|speeding|hit\s*and\s*run|gadi\s*thok)/i,
      /(सड़क\s*दुर्घटना|लापरवाही\s*से\s*गाड़ी|एक्सीडेंट|गाड़ी\s*भिड़ंत|हिट\s*एंड\s*रन)/i,
      /(accident\s*ho\s*gaya|gadi\s*se\s*chot|rash\s*drive|hit\s*run)/i,
    ],
    incident: 'Rash Driving, Vehicular Accident & Hit and Run',
    en: {
      title: 'Rash Driving & Vehicular Accidents (BNS 281 & Section 106)',
      summary: 'Governed by the Bharatiya Nyaya Sanhita 2023 and the Motor Vehicles Act 1988.',
      sections: [
        '⚖️ **Section 281 BNS 2023 (Old Section 279 IPC) — Rash Driving**: Driving in a rash or negligent manner endangering human life. Punishment: Up to 6 months imprisonment or fine up to ₹1,000.',
        '⚖️ **Section 125 BNS 2023 (Old Section 337/338 IPC) — Endangering Life or Grievous Hurt**: Causing hurt or grievous hurt by rash/negligent act. Punishment: Up to 3 years imprisonment.',
        '⚖️ **Section 106(1) BNS 2023 (Old Section 304A IPC) — Death by Negligence**: Causing death not amounting to culpable homicide. Punishment: Up to 5 years imprisonment + fine.',
        '⚖️ **Section 106(2) BNS 2023 — Hit and Run Reform**: Escaping the scene without reporting to police or magistrate immediately. Punishment: Up to 10 years imprisonment + fine.',
      ],
      intellectualAnalysis: 'Jurisprudence: The doctrine of **Res Ipsa Loquitur** (the thing speaks for itself) is often invoked in vehicular negligence. Compensation is adjudicated by the Motor Accident Claims Tribunal (MACT) regardless of criminal conviction under Section 166 of the MV Act.',
      action: 'Dial 112 immediately. Note the offending vehicle number plate, photograph skid marks, and file an FIR under Sections 281/125 BNS.',
    },
    hi: {
      title: 'सड़क दुर्घटना व लापरवाही से वाहन चलाना (BNS 281 व धारा 106)',
      summary: 'भारतीय न्याय संहिता 2023 और मोटर वाहन अधिनियम (MV Act) के तहत तेज या लापरवाह वाहन चलाना गैरकानूनी है।',
      sections: [
        '⚖️ **धारा 281 BNS 2023 (पुरानी IPC धारा 279) — लापरवाही से वाहन चलाना**: जनजीवन को खतरे में डालना। सज़ा: 6 माह तक की जेल या जुर्माना।',
        '⚖️ **धारा 125 BNS 2023 (पुरानी IPC 338) — गंभीर चोट पहुंचाना**: लापरवाही से किसी की जान जोखिम में डालना या चोटिल करना। सज़ा: 3 साल तक की जेल।',
        '⚖️ **धारा 106(1) BNS 2023 (पुरानी IPC 304A) — लापरवाही से मृत्यु**: गैर-इरादतन मौत। सज़ा: 5 वर्ष तक जेल।',
        '⚖️ **धारा 106(2) BNS 2023 — हिट एंड रन का कड़ा कानून**: दुर्घटना के बाद बिना पुलिस को सूचित किए भागना। सज़ा: 10 वर्ष तक की जेल व जुर्माना।',
      ],
      intellectualAnalysis: 'आपराधिक मुकदमे के साथ-साथ पीड़ित या परिवार को मोटर दुर्घटना दावा अधिकरण (MACT) से असीमित मुआवजे का कानूनी अधिकार प्राप्त है।',
      action: '112 पर कॉल करें, वाहन का नंबर नोट करें, और MACT क्लेम हेतु पुलिस की विस्तृत दुर्घटना रिपोर्ट (DAR) प्राप्त करें।',
    },
    hinglish: {
      title: 'Rash Driving aur Accident Law (BNS 281 & Section 106)',
      summary: 'BNS 2023 aur Motor Vehicles Act ke tehat reckless driving par strict criminal aur compensation provisions hain.',
      sections: [
        '⚖️ **Section 281 BNS 2023 (Old IPC 279) — Rash Driving**: 6 months tak jail ya fine.',
        '⚖️ **Section 125 BNS 2023 (Old IPC 338) — Causing Hurt**: Up to 3 years imprisonment.',
        '⚖️ **Section 106(1) BNS 2023 (Old IPC 304A) — Negligent Death**: 5 years tak jail.',
        '⚖️ **Section 106(2) BNS 2023 — Hit and Run**: Spot se bhagna bina police report ke—Up to 10 years jail.',
      ],
      intellectualAnalysis: 'Criminal prosecution ke alawa MACT Court se accident compensation lene ka statutory right hota hai.',
      action: '112 par call karein, vehicle number photograph karein aur FIR copy lekar MACT claim initiate karein.',
    },
  },

  // 7. Landlord Forcefully Locking Flat
  {
    id: 'landlord_lock',
    patterns: [
      /landlord.*lock/i, /makan\s*malik.*tala/i, /room\s*locked/i, /evict.*without\s*notice/i,
      /मकान\s*मालिक.*ताला/i, /कमरा\s*बंद/i, /जबरन\s*निकाल/i,
    ],
    incident: 'Landlord Forcefully Locking Tenant / Dispossession',
    en: {
      title: 'Landlord Forcefully Locking Flat & Illegal Eviction',
      summary: 'Under the Constitution and the Transfer of Property Act, peaceful possession cannot be disturbed without due process of law.',
      sections: [
        '⚖️ **Section 126 BNS 2023 (Old IPC 341) — Wrongful Restraint**: Obstructing tenant from entering their leased home. Punishment: Up to 1 month jail or ₹5,000 fine (Cognizable).',
        '⚖️ **Section 329 BNS 2023 (Old IPC 448) — Criminal Trespass**: Entering without permission. Punishment: Up to 1 year jail.',
        '⚖️ **Section 316 BNS 2023 (Old IPC 406) — Criminal Breach of Trust**: Seizing tenant luggage or furniture. Punishment: Up to 5 years jail (Non-Bailable).',
        '🏛️ **Section 108 Transfer of Property Act**: Right to quiet and peaceful enjoyment.',
      ],
      intellectualAnalysis: 'Precedent: Bishan Das v. State of Punjab (1961 2 SCR 69) — The Supreme Court Constitution Bench held that landlords cannot take the law into their own hands. Even if the lease expired, physical lockout is criminal dispossession.',
      action: 'Call 112 immediately, record video proof of the padlock, and file complaint under Section 126 BNS.',
    },
    hi: {
      title: 'मकान मालिक द्वारा फ्लैट पर ताला लगाना व अवैध बेदखली',
      summary: 'मकान मालिक बिना कोर्ट के आदेश के किरायेदार का सामान बाहर नहीं फेंक सकता और न ही ताला लगा सकता है।',
      sections: [
        '⚖️ **धारा 126 BNS (पुरानी IPC 341) — गलत तरीके से रोकना**: 1 माह जेल या ₹5,000 जुर्माना (संज्ञेय अपराध)।',
        '⚖️ **धारा 329 BNS (पुरानी IPC 448) — आपराधिक अतिचार (Trespass)**: 1 साल तक की जेल।',
        '⚖️ **धारा 316 BNS (पुरानी IPC 406) — सामान ज़ब्त करने पर अमानत में खयानत**: 5 साल तक जेल (गैर-जमानती)।',
      ],
      intellectualAnalysis: 'बिशन दास बनाम पंजाब राज्य (1961): सुप्रीम कोर्ट ने कहा कि कानून के राज में जबरन बेदखली पूरी तरह गैरकानूनी है।',
      action: '112 पर पुलिस बुलाएं, ताले की वीडियो बनाएं और धारा 126 BNS के तहत लिखित तहरीर दें।',
    },
    hinglish: {
      title: 'Landlord ka Flat par Tala lagana aur Illegal Eviction',
      summary: 'Rent Control laws aur Transfer of Property Act ke tehat landlord forcefully lock nahi laga sakta.',
      sections: [
        '⚖️ **Section 126 BNS (Old IPC 341) — Wrongful Restraint**: 1 month jail / ₹5,000 fine (Police FIR mandatory).',
        '⚖️ **Section 329 BNS (Old IPC 448) — Criminal Trespass**: 1 year jail.',
        '⚖️ **Section 316 BNS (Old IPC 406) — Luggage hold karna**: 5 years jail (Non-Bailable).',
      ],
      intellectualAnalysis: 'Bishan Das Case (1961): Landlord legally force use nahi kar sakta bina competent court order ke.',
      action: '112 par call karein, lock ki video banayein aur police station me Section 126 BNS me complaint dein.',
    },
  },

  // 8. Online Financial Fraud
  {
    id: 'cyber_fraud',
    patterns: [
      /online\s*(fraud|scam|thagi)/i, /upi\s*(scam|fraud)/i, /otp\s*(fraud|scam)/i, /cyber\s*crime\s*section/i,
      /ऑनलाइन\s*(ठगी|फ्रॉड)/i, /ओटीपी\s*स्कैम/i,
    ],
    incident: 'Online Financial Fraud, UPI & OTP Scams',
    en: {
      title: 'Online Financial Fraud & Cyber Impersonation',
      summary: 'Regulated under the Information Technology Act 2000 and Section 318 of BNS 2023.',
      sections: [
        '⚖️ **Section 66D IT Act — Cheating by Personation**: Using computer/phone to defraud. Punishment: Up to 3 years imprisonment + ₹1,00,000 fine (Non-Bailable).',
        '⚖️ **Section 318(4) BNS 2023 (Old IPC 420) — Cheating**: Inducing delivery of property. Up to 7 years imprisonment.',
        '⚖️ **Section 66C IT Act — Identity Theft**: Misusing OTPs or passwords. Up to 3 years jail.',
      ],
      intellectualAnalysis: 'RBI Zero-Liability Circular: If an unauthorized electronic transaction is reported within 3 days, the customer has zero liability and the bank must reverse the lost funds.',
      action: 'Call 1930 Cyber Helpline within the golden hour (2 hours) to freeze the recipient bank wallet, and file on cybercrime.gov.in.',
    },
    hi: {
      title: 'ऑनलाइन वित्तीय ठगी, यूपीआई व ओटीपी फ्रॉड',
      summary: 'साइबर ठगी के मामलों में त्वरित शिकायत करने पर बैंक खाते फ्रीज किए जा सकते हैं।',
      sections: [
        '⚖️ **आईटी एक्ट धारा 66D — डिजिटल प्रतिरूपण द्वारा धोखाधड़ी**: 3 साल जेल व ₹1,00,000 जुर्माना (गैर-जमानती)।',
        '⚖️ **धारा 318(4) BNS (पुरानी IPC 420) — छल व धोखाधड़ी**: 7 साल तक की जेल।',
        '⚖️ **आईटी एक्ट धारा 66C — पहचान व पासवर्ड की चोरी**: 3 साल तक जेल।',
      ],
      intellectualAnalysis: 'आरबीआई जीरो-लायबिलिटी सर्कुलर: 3 दिनों के भीतर बैंक को सूचित करने पर उपभोक्ता की देयता शून्य होती है।',
      action: 'ठगी होते ही 2 घंटे के अंदर 1930 पर कॉल करें और cybercrime.gov.in पर पावती दर्ज करें।',
    },
    hinglish: {
      title: 'Online Financial Fraud & Cyber Scam Sections',
      summary: 'IT Act 2000 aur BNS ke under rapid action se paisa recover ho sakta hai.',
      sections: [
        '⚖️ **Section 66D IT Act — Cheating by personation**: 3 years jail (Non-Bailable).',
        '⚖️ **Section 318(4) BNS (Old IPC 420) — Cheating**: Up to 7 years imprisonment.',
        '⚖️ **Section 66C IT Act — OTP & Identity Theft**: 3 years jail.',
      ],
      intellectualAnalysis: 'RBI Zero Liability Policy ke tehat 3 din me report karne par bank se refund milta hai.',
      action: '1930 helpline par turant call karein aur cybercrime.gov.in par complaint receipt download karein.',
    },
  },
];

// ─── Vernacular FAQs ────────────────────────────────────────────
const VERNACULAR_FAQS = [
  {
    patterns: [
      /how\s*to\s*book/i,
      /booking\s*process/i,
      /वकील\s*(कैसे|कहाँ)\s*बुक/i,
      /booking\s*kaise/i,
      /hire\s*lawyer/i,
    ],
    answer: {
      en: 'To consult an advocate on LegalConnect:\n\n1. Go to **Find Advocates**\n2. Filter by practice area, rating, or consultation fee\n3. Select your preferred date & time slot\n4. Complete secure escrow payment — your funds are released only after consultation!\n5. Join the secure video meeting from your dashboard at the scheduled time.',
      hi: 'LegalConnect पर वकील से परामर्श बुक करने की प्रक्रिया:\n\n1. **"वकील खोजें" (Find Advocates)** सेक्शन पर जाएं\n2. विशेषता (जैसे चेक बाउंस, संपत्ति, परिवार) और फीस के आधार पर वकील चुनें\n3. उपलब्ध तारीख और समय का स्लॉट चुनें\n4. सुरक्षित एस्क्रो पेमेंट करें — परामर्श पूरा होने तक आपकी राशि सुरक्षित रहती है!\n5. तय समय पर डैशबोर्ड से सीधे वीडियो कॉल जॉइन करें।',
      hinglish: 'LegalConnect par advocate book karne ka simple process:\n\n1. **Find Advocates** par click karein\n2. Category (Cheque, Property, Divorce) filter karein\n3. Available date aur time slot choose karein\n4. Secure Escrow payment karein (paisa consult hone ke baad hi advocate ko jata hai)\n5. Scheduled time par video meeting join karein.',
    },
    navKey: 'advocates',
  },
  {
    patterns: [
      /track.*case/i,
      /hearing\s*date/i,
      /केस\s*ट्रैक/i,
      /hearing\s*kab/i,
      /case\s*progress/i,
    ],
    answer: {
      en: 'You can monitor your case timeline, upload evidence documents, and review the next hearing date directly inside **My Cases**.',
      hi: 'आप अपने केस की प्रगति, अगली सुनवाई की तारीख, और आवश्यक अदालती दस्तावेज़ **"मेरे केस" (My Cases)** सेक्शन में आसानी से देख सकते हैं।',
      hinglish: 'Apne case ki latest hearing date aur progress dekhne ke liye **My Cases** section open karein.',
    },
    navKey: 'cases',
  },
  {
    patterns: [
      /escrow/i,
      /payment\s*safe/i,
      /refund\s*policy/i,
      /एस्क्रो/i,
      /पैसा\s*सुरक्षित/i,
      /paisa\s*safe/i,
    ],
    answer: {
      en: 'LegalConnect uses a **Bank-Grade Escrow System**. Your payment is held safely until the consultation is verified as completed. If an advocate misses the call, you receive a 100% instant refund.',
      hi: 'LegalConnect पर आपका भुगतान **सुरक्षित एस्क्रो (Escrow)** में रहता है। जब तक वीडियो परामर्श सफलतापूर्वक पूरा नहीं होता, वकील को राशि नहीं दी जाती। यदि वकील उपस्थित नहीं होते, तो पूरी फीस स्वतः रिफंड हो जाती है।',
      hinglish: 'Aapka payment **Escrow Account** me 100% safe rehta hai. Consultation complete hone ke baad hi release hota hai. Advocate absent ho to instant full refund milta hai.',
    },
    navKey: 'consultations',
  },
  {
    patterns: [
      /legal\s*notice/i,
      /draft\s*(a\s*)?notice/i,
      /नोटिस\s*(कैसे|बनाएं|भेजें|चाहिए|जनरेटर)/i,
      /notice\s*(kaise|banaye|bheje|draft|generate)/i,
    ],
    answer: {
      en: 'You can generate a court-ready statutory legal notice in 1 click:\n\n1. Open our **Notice Generator**\n2. Select your dispute (Cheque Bounce Sec 138, Security Deposit, Unpaid Salary, Consumer Refund)\n3. Fill in the counterparty details & claim amount\n4. Instantly print or download your court-formatted Legal Notice PDF! 📝',
      hi: 'आप LegalConnect के **Notice Generator (नोटिस जनरेटर)** से 1 क्लिक में कानूनी नोटिस तैयार कर सकते हैं:\n\n1. साइडबार से **Notice Generator** खोलें\n2. अपनी समस्या चुनें (चेक बाउंस धारा 138, मकान मालिक डिपॉजिट, बकाया वेतन, उपभोक्ता रिफंड)\n3. संबंधित जानकारी व राशि भरें\n4. सीधे कोर्ट-मान्य कानूनी नोटिस का प्रिंट या PDF प्राप्त करें! 📝',
      hinglish: 'Aap 1-click me court-ready Legal Notice generate kar sakte hain:\n\n1. Sidebar se **Notice Generator** par jayein\n2. Category choose karein (Cheque Bounce Sec 138, Security Deposit, Salary, Consumer Court)\n3. Details fill karke instant Court-ready Notice PDF download ya print karein! 📝',
    },
    navKey: 'notices',
  },
];

// ─── Navigation Routes ──────────────────────────────────────────
const NAV_ROUTES = {
  client: {
    dashboard:     { path: '/client/dashboard',      labelEn: 'Dashboard',        labelHi: 'डैशबोर्ड',          icon: '📊', desc: 'Overview of your cases and consultations' },
    advocates:     { path: '/client/advocates',      labelEn: 'Find Advocates',   labelHi: 'वकील खोजें',        icon: '🔍', desc: 'Browse verified legal professionals' },
    consultations: { path: '/client/consultations',  labelEn: 'Consultations',    labelHi: 'परामर्श व मीटिंग्स', icon: '📅', desc: 'View upcoming and past consultations' },
    cases:         { path: '/client/cases',          labelEn: 'My Cases',         labelHi: 'मेरे केस',          icon: '📋', desc: 'Track all your legal cases' },
    documents:     { path: '/client/documents',      labelEn: 'Documents',        labelHi: 'दस्तावेज़',         icon: '📁', desc: 'Upload and manage legal files' },
    notices:       { path: '/client/legal-notice',   labelEn: 'Notice Generator', labelHi: 'नोटिस जनरेटर',      icon: '📝', desc: '1-Click statutory legal demand notice generator' },
    resources:     { path: '/legal-resources',       labelEn: 'Landmark Cases & Study', labelHi: 'ऐतिहासिक केस व धाराएं', icon: '🏛️', desc: 'Supreme Court landmark judgments & statutory guides' },
    messages:      { path: '/client/messages',       labelEn: 'Messages',         labelHi: 'संदेश',             icon: '💬', desc: 'Chat with your advocates' },
    notifications: { path: '/client/notifications',  labelEn: 'Notifications',    labelHi: 'सूचनाएं',          icon: '🔔', desc: 'View alerts and updates' },
    profile:       { path: '/client/profile',        labelEn: 'Profile',          labelHi: 'प्रोफ़ाइल',         icon: '👤', desc: 'Update your personal information' },
  },
  advocate: {
    dashboard:     { path: '/advocate/dashboard',     labelEn: 'Dashboard',        labelHi: 'डैशबोर्ड',          icon: '📊', desc: "Today's schedule and practice overview" },
    consultations: { path: '/advocate/consultations', labelEn: 'Consultations',    labelHi: 'परामर्श',           icon: '📅', desc: 'Manage booking requests' },
    clients:       { path: '/advocate/clients',       labelEn: 'Clients',          labelHi: 'क्लाइंट्स',         icon: '👥', desc: 'View your client directory' },
    cases:         { path: '/advocate/cases',         labelEn: 'Cases',            labelHi: 'केस मैनेजमेंट',     icon: '📋', desc: 'Track and update case progress' },
    notices:       { path: '/advocate/legal-notice',  labelEn: 'Notice Drafts',    labelHi: 'नोटिस ड्राफ्ट्स',   icon: '📝', desc: 'Generate court-ready statutory notices' },
    resources:     { path: '/legal-resources',        labelEn: 'Landmark Cases & Study', labelHi: 'ऐतिहासिक केस व धाराएं', icon: '🏛️', desc: 'Supreme Court landmark judgments & statutory guides' },
    messages:      { path: '/advocate/messages',      labelEn: 'Messages',         labelHi: 'संदेश',             icon: '💬', desc: 'Communicate with clients' },
    availability:  { path: '/advocate/availability',  labelEn: 'Availability',     labelHi: 'समय सारिणी',       icon: '🕐', desc: 'Set your consultation schedule' },
    earnings:      { path: '/advocate/earnings',      labelEn: 'Earnings',         labelHi: 'कमाई व भुगतान',     icon: '💰', desc: 'Track payments and payouts' },
  },
  admin: {
    dashboard:     { path: '/admin/dashboard',       labelEn: 'Dashboard',        labelHi: 'डैशबोर्ड',          icon: '📊', desc: 'Platform KPIs and statistics' },
    users:         { path: '/admin/users',           labelEn: 'Users',            labelHi: 'उपयोगकर्ता',        icon: '👥', desc: 'Manage all platform users' },
    verification:  { path: '/admin/verification',    labelEn: 'Verification',     labelHi: 'सत्यापन',           icon: '✅', desc: 'Approve advocate credentials' },
    consultations: { path: '/admin/consultations',   labelEn: 'Consultations',    labelHi: 'परामर्श',           icon: '📅', desc: 'Monitor all consultations' },
    cases:         { path: '/admin/cases',           labelEn: 'Cases',            labelHi: 'केस',               icon: '📋', desc: 'View all platform cases' },
    analytics:     { path: '/admin/analytics',       labelEn: 'Analytics',        labelHi: 'एनालिटिक्स',        icon: '📈', desc: 'Platform trends and growth' },
  },
};

// ═══════════════════════════════════════════════════════════════
// Main Chat Generator Function
// ═══════════════════════════════════════════════════════════════
export function generateChatResponse(message, userRole = 'client', userName = 'User', preferredLang = null) {
  const text = (message || '').trim();
  const lang = detectLanguage(text, preferredLang);
  const role = userRole || 'client';
  const name = (userName || 'User').split(' ')[0];
  const routes = NAV_ROUTES[role] || NAV_ROUTES.client;

  let response = '';
  let suggestions = [];
  let navLinks = [];
  let quickActions = [];
  let type = 'text';
  let intent = INTENTS.UNKNOWN;

  const lowerText = text.toLowerCase();

  // 1. Check Applied Sections & Situational Guide (Theft, Slap, Debt, Photo, Defamation, Accidents, etc.)
  for (const s of APPLIED_SECTIONS_DB) {
    if (s.patterns.some((p) => p.test(text))) {
      intent = INTENTS.APPLIED_SECTIONS;
      type = 'applied_sections';
      const info = s[lang] || s.en;

      if (lang === 'hi') {
        response = `📚 **विधिक विश्लेषण व लागू धाराएं (Statutory Jurisprudence):**\n` +
          `*विषय: ${info.title}*\n\n` +
          `${info.summary}\n\n` +
          `📌 **विस्तृत विधिक धाराएं (BNS 2023 व विशेष कानून):**\n` +
          info.sections.map((sec) => `• ${sec}`).join('\n') + `\n\n` +
          `⚖️ **न्यायशास्त्रीय सिद्धांत व विश्लेषण (Jurisprudence):**\n${info.intellectualAnalysis}\n\n` +
          `✅ **व्यावहारिक कानूनी कदम (Action Plan):**\n${info.action}`;
        suggestions = ['वकील से सलाह लें', 'और धाराएं देखें', 'ऐतिहासिक सुप्रीम कोर्ट केस'];
      } else if (lang === 'hinglish') {
        response = `📚 **Applicable Legal Sections & Jurisprudence Guide:**\n` +
          `*Topic: ${info.title}*\n\n` +
          `${info.summary}\n\n` +
          `📌 **Statutory Sections (BNS 2023 & IPC Comparison):**\n` +
          info.sections.map((sec) => `• ${sec}`).join('\n') + `\n\n` +
          `⚖️ **Legal Doctrine & Intellectual Jurisprudence:**\n${info.intellectualAnalysis}\n\n` +
          `✅ **Practical Action Plan:**\n${info.action}`;
        suggestions = ['Consult advocate for this', 'View Landmark Cases', 'Explore all sections'];
      } else {
        response = `📚 **Applicable Statutory Sections & Jurisprudential Analysis:**\n` +
          `*Topic: ${info.title}*\n\n` +
          `${info.summary}\n\n` +
          `📌 **Statutory Enactments (New BNS 2023 vs IPC):**\n` +
          info.sections.map((sec) => `• ${sec}`).join('\n') + `\n\n` +
          `⚖️ **Jurisprudential Doctrine & Intellectual Analysis:**\n${info.intellectualAnalysis}\n\n` +
          `✅ **Actionable Citizen Verdict:**\n${info.action}`;
        suggestions = ['Consult a specialist lawyer', 'Explore Landmark Cases', 'Open Legal Study Hub'];
      }

      navLinks = [
        {
          path: '/legal-resources',
          label: lang === 'hi' ? '📚 पूरा विधिक अध्ययन हब खोलें' : '📚 Open Legal Resources Hub',
          icon: '📚',
          desc: 'Study side-by-side BNS vs IPC section tables, punishments & doctrines',
        },
        {
          path: routes.advocates?.path,
          label: lang === 'hi' ? '🔍 संबंधित विशेषज्ञ वकील खोजें' : '🔍 Find Specialist Advocates',
          icon: '🔍',
          desc: 'Consult Bar Council verified legal professionals',
        },
      ];

      return { response, suggestions, navLinks, quickActions: [], type, intent, lang, timestamp: new Date().toISOString() };
    }
  }

  // 2. Check General Section Query ("what section applied on me", "which section", "konsi dhara lagegi")
  if (/\b(what\s*section|which\s*section|konsi\s*dhara|kon\s*si\s*dhara|dhara\s*lagegi|sections?\s*applied|what\s*if\s*i)\b/i.test(text)) {
    intent = INTENTS.APPLIED_SECTIONS;
    type = 'applied_sections';

    if (lang === 'hi') {
      response = `⚖️ **भारतीय कानून में धाराओं के निर्धारण का बौद्धिक ढांचा (Statutory Analytical Rubric):**\n\n` +
        `किसी भी कृत्य पर कौन सी धारा लगेगी, यह भारतीय न्यायशास्त्र में निम्नलिखित 4 मुख्य स्तंभों पर निर्भर करता है:\n\n` +
        `1. **Actus Reus (भौतिक कृत्य)**: क्या कोई कानूनन निषिद्ध कार्य किया गया या कानूनी कर्तव्य का लोप हुआ?\n` +
        `2. **Mens Rea (आपराधिक मंशा)**: क्या वह कार्य बेईमानी, कपट, दुर्भावना या घोर लापरवाही से किया गया? (अपवाद: धारा 21 BNS तुच्छता सिद्धांत व आत्मरक्षा)।\n` +
        `3. **अपराध का वर्गीकरण (Classification)**:\n` +
        `   • **संज्ञेय (Cognizable)**: गंभीर अपराध, पुलिस बिना वारंट तुरंत FIR दर्ज करती है (धारा 173 BNSS)।\n` +
        `   • **असंज्ञेय (Non-Cognizable)**: साधारण मामले (NC Report), केवल मजिस्ट्रेट के आदेश से जांच।\n` +
        `4. **BNS 2023 बनाम IPC 1860**: 1 जुलाई 2024 से भारतीय न्याय संहिता (BNS) प्रभावी है।`;
      suggestions = ['दोस्त का पेन चुराना', 'थप्पड़ मारना', 'चेक बाउंस धारा', 'ऐतिहासिक केस हब'];
    } else if (lang === 'hinglish') {
      response = `⚖️ **Which Section Applies? Intellectual Legal Framework:**\n\n` +
        `Indian Law me kisi bhi action par kaunsi dhara lagegi, wo 4 core legal pillars par decide hota hai:\n\n` +
        `1. **Actus Reus (The Physical Act)**: Kya koi physically prohibited act kiya gaya?\n` +
        `2. **Mens Rea (The Mental State)**: Kya dishonest intention ya criminal knowledge thi? (Section 21 BNS Trifles Rule aur Self-Defence exceptions apply hote hain).\n` +
        `3. **Cognizable vs Non-Cognizable**:\n` +
        `   • **Cognizable**: Serious crime jisme police direct FIR likhti hai.\n` +
        `   • **Non-Cognizable**: Simple dispute jisme Magistrate order required hota hai.\n` +
        `4. **New BNS 2023 Framework**: 1 July 2024 se puraane IPC ke sections naye BNS sections me convert ho chuke hain.`;
      suggestions = ['Stealing a friend pen', 'Slapping someone', 'Cheque bounce Sec 138', 'Landmark Cases'];
    } else {
      response = `⚖️ **Statutory Section Determination Framework (Actus Reus & Mens Rea):**\n\n` +
        `In Indian criminal jurisprudence, determining the applicable statutory section involves an intellectual evaluation of four essential legal pillars:\n\n` +
        `1. **Actus Reus (Prohibited Physical Conduct)**: Has an overt physical act or statutory omission occurred?\n` +
        `2. **Mens Rea (Culpable Mental State)**: Did the actor harbor malicious intention (*animus furandi*), dishonest knowledge, or gross negligence? (Note: Section 21 BNS eliminates liability for trivialities).\n` +
        `3. **Procedural Classification**:\n` +
        `   • **Cognizable vs Non-Cognizable**: Mandates police FIR under BNSS Section 173 vs Magistrate-directed NC report.\n` +
        `   • **Bailable vs Non-Bailable**: Right of bail under BNSS Sec 478 vs judicial discretion under Sec 480.\n` +
        `4. **Statutory Transition (BNS 2023 vs IPC 1860)**: India transitioned to the Bharatiya Nyaya Sanhita on July 1, 2024.`;
      suggestions = ['Stealing a friend pen', 'Slapping someone', 'Online fraud section', 'Landmark Cases'];
    }

    navLinks = [
      {
        path: '/legal-resources',
        label: lang === 'hi' ? '📚 पूरा विधिक अध्ययन हब खोलें' : '📚 Open Legal Resources Hub',
        icon: '📚',
        desc: 'Explore comprehensive section comparison charts and study guides',
      },
    ];

    return { response, suggestions, navLinks, quickActions: [], type, intent, lang, timestamp: new Date().toISOString() };
  }

  // 3. Check Landmark Supreme Court Cases match
  for (const c of LANDMARK_CASES_DB) {
    if (c.patterns.some((p) => p.test(text))) {
      intent = INTENTS.LANDMARK_CASES;
      type = 'landmark_case';
      const info = c[lang] || c.en;

      if (lang === 'hi') {
        response = `🏛️ **ऐतिहासिक सुप्रीम कोर्ट वाद — ${c.title}**\n*विषय: ${c.topic}*\n\n` +
          `📌 **मुख्य निष्कर्ष:** ${info.headline}\n\n` +
          `⚖️ **फैसला व कानूनी सिद्धांत (Ratio Decidendi):**\n${info.ruling}\n\n` +
          `💡 **आप इसका उपयोग कैसे कर सकते हैं:**\n${info.howToCite}\n\n` +
          `*विस्तृत विधिक अध्ययन के लिए हमारे Resources हब पर जाएं!*`;
        suggestions = ['और ऐतिहासिक केस देखें', 'अर्नेश कुमार जजमेंट', 'वकील से परामर्श करें'];
      } else if (lang === 'hinglish') {
        response = `🏛️ **Landmark Supreme Court Case — ${c.title}**\n*Topic: ${c.topic}*\n\n` +
          `📌 **Key Ruling:** ${info.headline}\n\n` +
          `⚖️ **Verdict & Legal Principle:**\n${info.ruling}\n\n` +
          `💡 **How You Can Cite This:**\n${info.howToCite}\n\n` +
          `*Full case brief study karne ke liye Resources hub visit karein!*`;
        suggestions = ['View more landmark cases', 'Arnesh Kumar ruling', 'Consult an advocate'];
      } else {
        response = `🏛️ **Landmark Supreme Court Precedent — ${c.title}**\n*Topic: ${c.topic}*\n\n` +
          `📌 **Headline:** ${info.headline}\n\n` +
          `⚖️ **Verdict & Legal Principle (Ratio Decidendi):**\n${info.ruling}\n\n` +
          `💡 **How You Can Use This Today:**\n${info.howToCite}\n\n` +
          `*Explore full case briefs on our Legal Resources & Study Hub!*`;
        suggestions = ['Explore more landmark cases', 'D.K. Basu arrest rules', 'Book a consultation'];
      }

      navLinks = [
        {
          path: '/legal-resources',
          label: lang === 'hi' ? '🏛️ ऐतिहासिक केस हब खोलें' : '🏛️ Open Landmark Cases Hub',
          icon: '🏛️',
          desc: 'Read full Supreme Court case briefs and study notes',
        },
      ];

      return { response, suggestions, navLinks, quickActions: [], type, intent, lang, timestamp: new Date().toISOString() };
    }
  }

  // 4. General Landmark Cases query ("famous cases", "landmark cases", "aitihasik faisle")
  if (/\b(famous\s*cases?|landmark\s*cases?|supreme\s*court\s*(cases?|judgments?|verdicts?)|aitihasik\s*(case|faisle)|top\s*cases?)\b/i.test(text)) {
    intent = INTENTS.LANDMARK_CASES;
    type = 'landmark_case';

    if (lang === 'hi') {
      response = `🏛️ **भारत के प्रमुख ऐतिहासिक सुप्रीम कोर्ट वाद (Landmark Precedents):**\n\n` +
        `1. **अर्नेश कुमार बनाम बिहार राज्य (2014)**: 7 साल से कम सज़ा वाले मामलों में मनमानी गिरफ्तारी पर रोक (धारा 41A नोटिस अनिवार्य)।\n` +
        `2. **डी.के. बसु बनाम प. बंगाल (1997)**: पुलिस हिरासत में प्रताड़ना रोकने हेतु 11 अनिवार्य नियम।\n` +
        `3. **के.एस. पुट्टास्वामी बनाम भारत संघ (2017)**: निजता का अधिकार (Right to Privacy) एक मौलिक अधिकार है।\n` +
        `4. **विशाखा बनाम राजस्थान राज्य (1997)**: कार्यस्थल पर महिलाओं के यौन उत्पीड़न की रोकथाम (POSH Guidelines)।\n` +
        `5. **केशवानंद भारती बनाम केरल राज्य (1973)**: संविधान का मूल ढांचा सिद्धांत (Basic Structure Doctrine)।`;
      suggestions = ['अर्नेश कुमार केस समझाओ', 'डी.के. बसु के 11 नियम', 'पुट्टास्वामी प्राइवेसी केस'];
    } else if (lang === 'hinglish') {
      response = `🏛️ **India ke Top Landmark Supreme Court Cases:**\n\n` +
        `1. **Arnesh Kumar v. State of Bihar (2014)**: Offences < 7 years me automatic arrest banned; Section 41A notice mandatory.\n` +
        `2. **D.K. Basu v. State of West Bengal (1997)**: 11 golden rules against custodial torture and secret police detention.\n` +
        `3. **K.S. Puttaswamy v. UOI (2017)**: Right to Privacy is a Fundamental Right under Article 21.\n` +
        `4. **Vishaka v. State of Rajasthan (1997)**: Workplace sexual harassment prevention (POSH).\n` +
        `5. **Kesavananda Bharati (1973)**: Parliament cannot destroy Basic Structure of Constitution.`;
      suggestions = ['Explain Arnesh Kumar case', 'D.K. Basu guidelines', 'Puttaswamy privacy ruling'];
    } else {
      response = `🏛️ **Top Landmark Supreme Court Judgments of India:**\n\n` +
        `1. **Arnesh Kumar v. State of Bihar (2014)**: Protection against arbitrary police arrest for offences carrying < 7 years jail.\n` +
        `2. **D.K. Basu v. State of West Bengal (1997)**: 11 golden rules protecting arrestees from custodial torture and secret lockup.\n` +
        `3. **Justice K.S. Puttaswamy v. UOI (2017)**: Right to Privacy affirmed as a Fundamental Right under Article 21.\n` +
        `4. **Vishaka v. State of Rajasthan (1997)**: Established mandatory Internal Complaints Committees (ICC) under POSH.\n` +
        `5. **Kesavananda Bharati (1973)**: Formulated the inviolable Basic Structure Doctrine of the Constitution.`;
      suggestions = ['Explain Arnesh Kumar', 'D.K. Basu 11 arrest rules', 'Puttaswamy privacy case'];
    }

    navLinks = [
      {
        path: '/legal-resources',
        label: lang === 'hi' ? '🏛️ ऐतिहासिक केस हब खोलें' : '🏛️ Open Landmark Cases Hub',
        icon: '🏛️',
        desc: 'Explore comprehensive case briefs, ratio decidendi & citations',
      },
    ];

    return { response, suggestions, navLinks, quickActions: [], type, intent, lang, timestamp: new Date().toISOString() };
  }

  // 5. Check Nyaya Kosh (Legal Glossary) match
  for (const [key, termObj] of Object.entries(NYAYA_KOSH)) {
    if (lowerText.includes(key) && (GLOSSARY_PATTERNS.some((p) => p.test(text)) || lowerText.length < 35)) {
      intent = INTENTS.GLOSSARY;
      type = 'glossary';

      if (lang === 'hi') {
        response = `📖 **कानूनी शब्दकोश — ${termObj.term}**\n\n${termObj.hi}\n\n*क्या आप इस विषय पर अधिक जानकारी या वकील से सलाह चाहते हैं?*`;
        suggestions = ['वकील खोजें', 'चेक बाउंस नियम', 'स्टे आर्डर क्या है?'];
      } else if (lang === 'hinglish') {
        response = `📖 **Nyaya Kosh — ${termObj.term}**\n\n${termObj.hinglish}\n\n*Kya aap is matter me advocate se consult karna chahte hain?*`;
        suggestions = ['Find an advocate', 'Check bounce process', 'Stay order detail'];
      } else {
        response = `📖 **Legal Glossary — ${termObj.term}**\n\n${termObj.en}\n\n*Would you like to speak to a specialist advocate regarding this?*`;
        suggestions = ['Find an advocate', 'Ask another legal term', 'How to book?'];
      }

      navLinks = [routes.advocates, routes.cases].filter(Boolean).map((r) => ({
        path: r.path,
        label: lang === 'hi' ? r.labelHi : r.labelEn,
        icon: r.icon,
        desc: r.desc,
      }));

      return {
        response,
        suggestions,
        navLinks,
        quickActions: [],
        type,
        intent,
        lang,
        timestamp: new Date().toISOString(),
      };
    }
  }

  // 6. Greetings
  if (GREETING_PATTERNS.some((p) => p.test(text))) {
    intent = INTENTS.GREETING;
    if (lang === 'hi') {
      response = `नमस्ते ${name}! 🙏 मैं **LexBot** हूँ, आपका LegalConnect विधिक सहायक।\n\nमैं आपको भारतीय कानूनों (BNS 2023, NI Act, IT Act), ऐतिहासिक सुप्रीम कोर्ट फैसलों और आपके अधिकारों को समझाने में मदद कर सकता हूँ।\n\nआज मैं आपकी क्या सहायता करूँ?`;
      suggestions = ['🏛️ ऐतिहासिक केस', '📚 कौन सी धारा लगेगी?', 'चेक बाउंस सलाह', 'वकील खोजें'];
      quickActions = [
        { label: '🏛️ ऐतिहासिक केस', path: '/legal-resources' },
        { label: '🔍 वकील खोजें', path: routes.advocates?.path },
        { label: '📋 मेरे केस', path: routes.cases?.path },
      ];
    } else if (lang === 'hinglish') {
      response = `Namaste ${name}! 🙏 Main hoon **LexBot**, aapka LegalConnect legal assistant.\n\nAap yahan Indian legal procedures, applicable statutory sections (BNS vs IPC) aur Supreme Court landmark judgments jaan sakte hain.\n\nBataiye, aaj kis matter me help chahiye?`;
      suggestions = ['🏛️ Landmark Cases', '📚 Which Section Applies?', 'Cheque bounce advice', 'Property dispute'];
      quickActions = [
        { label: '🏛️ Landmark Cases', path: '/legal-resources' },
        { label: '🔍 Find Advocates', path: routes.advocates?.path },
        { label: '📋 My Cases', path: routes.cases?.path },
      ];
    } else {
      response = `Hello ${name}! 👋 I'm **LexBot**, your multilingual LegalConnect assistant.\n\nI can help you navigate Indian legal statutes (BNS 2023, IPC), analyze applied sections for real-world scenarios, explain landmark Supreme Court judgments, and connect you with verified advocates. How can I assist you today?`;
      suggestions = ['🏛️ Landmark Cases', '📚 Which Section Applies?', 'Cheque bounce advice', 'Legal Glossary'];
      quickActions = [
        { label: '🏛️ Landmark Cases', path: '/legal-resources' },
        { label: '🔍 Find Advocates', path: routes.advocates?.path },
        { label: '📋 My Cases', path: routes.cases?.path },
      ];
    }

    return {
      response,
      suggestions,
      navLinks: [],
      quickActions,
      type: 'greeting',
      intent,
      lang,
      timestamp: new Date().toISOString(),
    };
  }

  // 7. Farewells
  if (FAREWELL_PATTERNS.some((p) => p.test(text))) {
    intent = INTENTS.FAREWELL;
    if (lang === 'hi') {
      response = `धन्यवाद ${name}! 🙏 यदि कोई भी अन्य कानूनी सहायता चाहिए हो, तो कभी भी पूछ सकते हैं। न्याय और सुरक्षा आपका अधिकार है। शुभ दिन!`;
    } else if (lang === 'hinglish') {
      response = `Dhanyawad ${name}! 🙏 Agar koi aur legal advice chahiye ho to kabhi bhi pooch sakte hain. Have a great day!`;
    } else {
      response = `Goodbye ${name}! Take care. 🙏 Remember that LegalConnect is always here to safeguard your legal rights!`;
    }
    return { response, suggestions: ['Namaste', 'Help'], navLinks: [], quickActions: [], type: 'text', intent, lang, timestamp: new Date().toISOString() };
  }

  // 8. Check FAQs (Booking, Cases, Payment, Escrow)
  for (const faq of VERNACULAR_FAQS) {
    if (faq.patterns.some((p) => p.test(text))) {
      intent = INTENTS.HELP;
      const ansObj = faq.answer;
      response = ansObj[lang] || ansObj.en;
      const targetNav = routes[faq.navKey];
      if (targetNav) {
        navLinks = [{
          path: targetNav.path,
          label: lang === 'hi' ? targetNav.labelHi : targetNav.labelEn,
          icon: targetNav.icon,
          desc: targetNav.desc,
        }];
      }
      suggestions = lang === 'hi' ? ['वकील खोजें', 'केस स्टेटस', 'मदद'] : ['Find advocate', 'My cases', 'Help'];
      return { response, suggestions, navLinks, quickActions: [], type: 'faq', intent, lang, timestamp: new Date().toISOString() };
    }
  }

  // 9. Practice Area & Citizen Remedies Matching
  for (const [area, keywords] of Object.entries(PRACTICE_AREAS)) {
    if (keywords.some((kw) => lowerText.includes(kw))) {
      intent = INTENTS.LEGAL_QUERY;
      type = 'legal_info';
      const info = VERNACULAR_LEGAL_DB[area] || VERNACULAR_LEGAL_DB['Civil Litigation'];
      const localized = info[lang] || info.en;

      if (lang === 'hi') {
        response = `⚖️ **${localized.title}**\n\n${localized.summary}\n\n**कानूनी प्रक्रिया व सुझाव:**\n` +
          localized.steps.map((s, idx) => `${idx + 1}. ${s}`).join('\n') +
          (localized.note ? `\n\n💡 *सलाह: ${localized.note}*` : '');
        suggestions = ['इस विषय के वकील खोजें', 'परामर्श बुक करें', 'दस्तावेज़ कैसे तैयार करें'];
      } else if (lang === 'hinglish') {
        response = `⚖️ **${localized.title}**\n\n${localized.summary}\n\n**Key Legal Steps:**\n` +
          localized.steps.map((s, idx) => `${idx + 1}. ${s}`).join('\n') +
          (localized.note ? `\n\n💡 *Important Tip: ${localized.note}*` : '');
        suggestions = ['Find an advocate for this', 'Book consultation', 'Next steps'];
      } else {
        response = `⚖️ **${localized.title}**\n\n${localized.summary}\n\n**Recommended Legal Steps:**\n` +
          localized.steps.map((s, idx) => `${idx + 1}. ${s}`).join('\n') +
          (localized.note ? `\n\n💡 *Note: ${localized.note}*` : '');
        suggestions = ['Find advocates in this field', 'Book consultation', 'Track my case'];
      }

      navLinks = [
        {
          path: routes.advocates?.path,
          label: lang === 'hi' ? '🔍 संबंधित वकील खोजें' : '🔍 Find Specialist Advocates',
          icon: '🔍',
          desc: lang === 'hi' ? 'सत्यापित वकीलों की प्रोफाइल देखें' : 'Consult verified Bar Council advocates',
        },
      ];

      return { response, suggestions, navLinks, quickActions: [], type, intent, lang, timestamp: new Date().toISOString() };
    }
  }

  // 10. Navigation keywords (strictly guarded against legal questions)
  const isSituationalQuery = /\b(what\s*if|what\s*happens|why|how\s*can|can\s*(i|we|they|he|she|police|advocate|lawyer|judge|court|landlord|someone)|guilty|punishment|penalty|rights|kya\s*hoga|kya\s*karein|dhara|section)\b/i.test(text);

  if (!isSituationalQuery) {
    if (BOOKING_PATTERNS.some((p) => p.test(text))) {
      intent = INTENTS.BOOKING;
      const r = routes.advocates || routes.consultations;
      if (lang === 'hi') {
        response = `परामर्श (Consultation) बुक करने के लिए आप हमारे सत्यापित वकीलों की सूची देख सकते हैं और अपनी पसंद का समय चुन सकते हैं।`;
      } else if (lang === 'hinglish') {
        response = `Advocate book karne ke liye niche diye gaye link par jayein aur date/time choose karein.`;
      } else {
        response = `To book a consultation, browse verified advocates and pick an available time slot.`;
      }
      navLinks = [{ path: r.path, label: lang === 'hi' ? r.labelHi : r.labelEn, icon: r.icon, desc: r.desc }];
      return { response, suggestions: ['Find Advocates', 'Help'], navLinks, quickActions: [], type: 'nav', intent, lang, timestamp: new Date().toISOString() };
    }

    if (CASE_PATTERNS.some((p) => p.test(text))) {
      intent = INTENTS.CASE_STATUS;
      const r = routes.cases;
      if (lang === 'hi') {
        response = `अपने सभी मुकदमों और केस की अगली सुनवाई की जानकारी देखने के लिए **'मेरे केस'** सेक्शन खोलें।`;
      } else if (lang === 'hinglish') {
        response = `Apne sabhi active legal cases aur hearing dates dekhne ke liye **'My Cases'** par jayein.`;
      } else {
        response = `To track your ongoing legal cases and next hearing dates, open the **'My Cases'** workspace.`;
      }
      navLinks = [{ path: r.path, label: lang === 'hi' ? r.labelHi : r.labelEn, icon: r.icon, desc: r.desc }];
      return { response, suggestions: ['My Cases', 'Help'], navLinks, quickActions: [], type: 'nav', intent, lang, timestamp: new Date().toISOString() };
    }
  }

  // 11. Situational Legal Jurisprudence Evaluator
  if (isSituationalQuery) {
    intent = INTENTS.LEGAL_QUERY;
    type = 'legal_analysis';

    if (lang === 'hi') {
      response = `⚖️ **विधिक परिस्थिति का बौद्धिक विश्लेषण (Legal Jurisprudential Assessment):**\n\n` +
        `आपके प्रश्न का भारतीय न्याय संहिता (BNS 2023), भारतीय नागरिक सुरक्षा संहिता (BNSS 2023) और संवैधानिक सिद्धांतों के तहत विधिक मूल्यांकन:\n\n` +
        `1. **संवैधानिक व विधिक अधिकार**: भारतीय संविधान के अनुच्छेद 21 (जीवन व व्यक्तिगत स्वतंत्रता) और अनुच्छेद 22(1) के तहत हर नागरिक को प्राकृतिक न्याय (Natural Justice) और निष्पक्ष कानूनी रक्षा का मौलिक अधिकार प्राप्त है।\n` +
        `2. **साक्ष्य व साबित करने का भार**: भारतीय साक्ष्य कानून (BSA 2023) के अनुसार, 'साबित करने का दायित्व' उस पक्ष पर होता है जो आरोप लगाता है (*Burden of Proof* — धारा 104)। कोई भी आरोप बिना दस्तावेजी या ठोस मौखिक साक्ष्य के कानूनन मान्य नहीं होता।\n` +
        `3. **अदालती व कानूनी सुरक्षा उपाय**: यदि मामला वकील की कार्यशैली, पुलिस कार्रवाई, या झूठे आरोपों से संबंधित है, तो कोई भी मनमानी या गैर-कानूनी कार्रवाई सीधे चुनौती योग्य है। आप सक्षम न्यायालय में हलफनामा (Affidavit) दाखिल कर सकते हैं, स्टेट बार काउंसिल में शिकायत कर सकते हैं, या हाई कोर्ट से संरक्षण ले सकते हैं।\n\n` +
        `💡 **सलाह**: इस मामले में अपने विधिक अधिकारों की सुरक्षा हेतु बार काउंसिल से सत्यापित विशेषज्ञ वकील से तुरंत कानूनी परामर्श (Legal Consultation) लें।`;
      suggestions = ['वकील से परामर्श करें', '🏛️ ऐतिहासिक केस', 'कानूनी नोटिस भेजें'];
    } else if (lang === 'hinglish') {
      response = `⚖️ **Legal Jurisprudential Assessment:**\n\n` +
        `Aapke scenario ka Indian statutory framework (BNS 2023, BNSS 2023 & Constitution) ke tehat legal assessment:\n\n` +
        `1. **Constitutional Protection**: Article 21 (Personal Liberty) aur Article 22(1) ke under har citizen ko Fair Hearing aur Due Process of Law ka Fundamental Right hai.\n` +
        `2. **Burden of Proof**: Indian law me 'Innocent until proven guilty' ka doctrine apply hota hai. Kisi ke kehne ya unilateral concession se adalat convict nahi karti.\n` +
        `3. **Immediate Legal Recourse**: Agar yeh matter advocate conduct, police harassment, ya false allegations ka hai, to court me instant objection/affidavit file karke aur Bar Council ya High Court ke zariye immediate legal relief li ja sakti hai.\n\n` +
        `💡 **Action Plan**: Bar Council verified specialist advocate se 1-on-1 consultation book karke official legal opinion lein.`;
      suggestions = ['Consult an advocate', 'Explore Landmark Cases', 'Draft Legal Notice'];
    } else {
      response = `⚖️ **Jurisprudential Assessment & Statutory Evaluation:**\n\n` +
        `Analyzing your scenario under the Bharatiya Nyaya Sanhita (BNS 2023), Bharatiya Nagarik Suraksha Sanhita (BNSS 2023), and Constitutional Principles:\n\n` +
        `1. **Constitutional Due Process & Natural Justice**: Under Article 21 (Personal Liberty) and Article 22(1) of the Constitution of India, every citizen is entitled to fair procedure and effective legal representation. No unilateral action or unauthorized statement prejudicial to your rights can be sustained without strict adherence to *Audi Alteram Partem* (Listen to the other side).\n` +
        `2. **Presumption of Innocence & Evidentiary Standard**: In Indian criminal jurisprudence (*Ei incumbit probatio qui dicit, non qui negat*), the legal burden of proof rests entirely on the asserting party. An unauthorized concession or arbitrary accusation cannot substitute proof beyond reasonable doubt.\n` +
        `3. **Statutory & Judicial Safeguards**:\n` +
        `   • Immediate right to file an Affidavit of Repudiation before the Presiding Judge.\n` +
        `   • Remedy under High Court inherent jurisdiction (BNSS Section 528 / Article 226) against procedural abuse.\n` +
        `   • Disciplinary recourse before the State Bar Council under Section 35 of the Advocates Act, 1961 for professional misconduct.\n\n` +
        `💡 **Actionable Counsel**: It is strongly advised to schedule a consultation with a Bar Council verified advocate on LegalConnect to formally safeguard your legal position.`;
      suggestions = ['Consult a specialist lawyer', 'Explore Landmark Cases', 'Open Legal Study Hub'];
    }

    navLinks = [
      {
        path: routes.advocates?.path,
        label: lang === 'hi' ? '🔍 संबंधित विशेषज्ञ वकील खोजें' : '🔍 Consult Verified Advocates',
        icon: '🔍',
        desc: 'Consult Bar Council verified legal professionals for formal legal opinion',
      },
      {
        path: '/legal-resources',
        label: lang === 'hi' ? '🏛️ ऐतिहासिक केस व विधिक अध्ययन हब' : '🏛️ Landmark Cases & Legal Resources',
        icon: '🏛️',
        desc: 'Explore comprehensive Supreme Court case briefs and statutory frameworks',
      },
    ].filter(Boolean);

    return { response, suggestions, navLinks, quickActions: [], type, intent, lang, timestamp: new Date().toISOString() };
  }

  // 11. Default Fallback
  if (lang === 'hi') {
    response = `नमस्ते ${name}! 🙏 मैं LexBot हूँ, आपका विधिक सहायक।\n\nआप मुझसे भारतीय कानूनों (BNS 2023 / IPC), परिस्थितियों पर लागू धाराओं और कानूनी प्रक्रियाओं के बारे में सीधे पूछ सकते हैं।`;
    suggestions = ['दोस्त का पेन चुराना', '🏛️ ऐतिहासिक केस', 'थप्पड़ मारने पर धारा', 'वकील खोजें'];
  } else if (lang === 'hinglish') {
    response = `Hello ${name}! Main hoon LexBot, aapka AI legal assistant.\n\nAap mujhse kisi bhi legal incident, applicable IPC/BNS sections aur court procedures ke bare me pooch sakte hain.`;
    suggestions = ['Stealing a friend pen', '🏛️ Landmark Cases', 'Slapping someone', 'Cheque bounce advice'];
  } else {
    response = `Hello ${name}! I am LexBot, your AI legal assistant.\n\nYou can ask me regarding any legal scenario, applicable statutory sections (BNS 2023 / IPC), or court procedures.`;
    suggestions = ['Stealing a friend pen', '🏛️ Landmark Cases', 'Slapping someone', 'Find an advocate'];
  }

  navLinks = [
    {
      path: '/legal-resources',
      label: lang === 'hi' ? '🏛️ ऐतिहासिक केस व धाराएं हब' : '🏛️ Landmark Cases & Sections Hub',
      icon: '🏛️',
      desc: 'Explore comprehensive Supreme Court case briefs and BNS vs IPC tables',
    },
    {
      path: routes.advocates?.path,
      label: lang === 'hi' ? '🔍 विशेषज्ञ वकील खोजें' : '🔍 Find Specialist Advocates',
      icon: '🔍',
      desc: 'Consult verified Bar Council advocates',
    },
  ].filter(Boolean);

  return {
    response,
    suggestions,
    navLinks,
    quickActions: [],
    type: 'text',
    intent: INTENTS.UNKNOWN,
    lang,
    timestamp: new Date().toISOString(),
  };
}
