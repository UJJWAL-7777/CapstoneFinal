// ═══════════════════════════════════════════════════════════════
// LexBot — LegalConnect Multilingual & Vernacular Intelligence Engine v3
// Supports English, हिन्दी (Hindi), and Hinglish with Voice & Nyaya Kosh
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
    /\b(kya|kaise|karo|kare|karen|hoga|hogi|hote|mera|meri|mere|mujhe|humko|aap|tum|nahi|nahin)\b/i,
    /\b(vakil|vakeel|advocte|kanoon|kanun|kanoonee|nyaya|faisla|adalat|shikayat|dhokha|dhokhadhadi)\b/i,
    /\b(cheque|bounce|kirayedar|kiraya|makan\s*malik|jamanaat|zamanat|talaq|paisa|paise|fees)\b/i,
    /\b(batao|samjhao|chahiye|de\s*raha|rok|stay|arzi|tarika|madad)\b/i,
  ];

  const matchCount = hinglishMarkers.filter((p) => p.test(text)).length;
  if (matchCount >= 1) {
    return 'hinglish';
  }

  return 'en';
}

// ─── Pattern Definitions ────────────────────────────────────────
const GREETING_PATTERNS = [
  /^(hi|hello|hey|good\s*(morning|afternoon|evening)|namaste|namaskar|pranam|greetings|howdy|sup)/i,
  /^(नमस्ते|नमस्कार|प्रणाम|हेलो|हाय)/i,
];

const FAREWELL_PATTERNS = [
  /^(bye|goodbye|see you|take care|thanks|thank you|tata|alvida|done|that'?s all|dhanyawad|shukriya)/i,
  /^(अलविदा|धन्यवाद|शुक्रिया|बाय|नमस्ते)/i,
];

const HELP_PATTERNS = [
  /\b(help|how\s+to|guide|what\s+can\s+you\s+do|features|tutorial|explain|show me)\b/i,
  /\b(मदद|सहायता|गाइड|फीचर्स|समझाओ|कैसे|क्या कर सकते हो)\b/i,
  /\b(madad|sahayata|kaise kare|guide karo|features batao)\b/i,
];

const BOOKING_PATTERNS = [
  /\b(book|appointment|schedule|slot|hire|consult)\b/i,
  /\b(बुक|अपॉइंटमेंट|परामर्श|वकील बुक|तारीख)\b/i,
  /\b(book karna|appointment lena|vakil chahiye|consultation book)\b/i,
];

const CASE_PATTERNS = [
  /\b(case|case\s*status|my\s*case|track|progress|hearing|update|court)\b/i,
  /\b(केस|मुकदमा|केस स्टेटस|तारीख|सुनवाई|ट्रैक|अदालत)\b/i,
  /\b(mera case|case status|mukadma|sunwai|hearing date)\b/i,
];

const PAYMENT_PATTERNS = [
  /\b(pay|payment|fee|cost|charge|billing|invoice|receipt|escrow|refund|price|amount|money)\b/i,
  /\b(फीस|भुगतान|पेमेंट|पैसा|खर्च|एस्क्रो|रिफंड)\b/i,
  /\b(paisa|fees kitni|payment kaise|refund milega|escrow kya hai)\b/i,
];

const DOCUMENT_PATTERNS = [
  /\b(document|upload|file|paperwork|evidence|proof|certificate|affidavit)\b/i,
  /\b(दस्तावेज़|कागज़ात|अपलोड|सबूत|प्रमाण|हलफनामा)\b/i,
  /\b(kagaz|dastavez|saboot|proof|upload kaise)\b/i,
];

const CONSULTATION_PATTERNS = [
  /\b(consultation|upcoming|next|video\s*call|session|meeting|attend|join)\b/i,
  /\b(वीडियो कॉल|परामर्श|मीटिंग|जॉइन|सेशन)\b/i,
  /\b(video call|meeting link|join kaise kare)\b/i,
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
    'consumer', 'product', 'defective', 'refund', 'service', 'forum', 'unfair trade', 'fraud', 'cheating',
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
    id: 'shreya_singhal',
    patterns: [/shreya\s*singhal/i, /section\s*66a/i, /66a\s*it\s*act/i, /social\s*media\s*arrest/i],
    title: 'Shreya Singhal v. Union of India (2015) 5 SCC 1',
    topic: 'Freedom of Speech on Social Media (Sec 66A Voided)',
    en: {
      headline: 'Struck down Section 66A of the IT Act, protecting citizens from arrest for social media posts.',
      ruling: 'The court held that vague terms like "offensive" or "annoying" cast too wide a net and chilled free speech. Peaceful online criticism or commentary cannot be criminalized.',
      howToCite: 'Cite if police illegally threaten to book or arrest you under Section 66A for social media commentary.',
    },
    hi: {
      headline: 'सोशल मीडिया पोस्ट पर गिरफ्तारी कराने वाली आईटी एक्ट की धारा 66A को असंवैधानिक घोषित कर रद्द किया।',
      ruling: 'सुप्रीम कोर्ट ने स्पष्ट किया कि शांतिपूर्ण आलोचना, कार्टून या ऑनलाइन टिप्पणी पर किसी को जेल नहीं भेजा जा सकता।',
      howToCite: 'यदि सोशल मीडिया पोस्ट पर धारा 66A की धमकी मिले, तो श्रेया सिंघल केस का उल्लेख करें।',
    },
    hinglish: {
      headline: 'Social media post par arrest karne wali IT Act Section 66A ko Supreme Court ne strike down kiya.',
      ruling: 'Online peaceful criticism ya opinion share karne par FIR karna unconstitutional hai.',
      howToCite: 'Social media post controversy me Shreya Singhal verdict cite karein.',
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

// ─── Applied Sections & Situational Guide Database ──────────────
const APPLIED_SECTIONS_DB = [
  {
    patterns: [/landlord.*lock/i, /makan\s*malik.*tala/i, /room\s*locked/i, /evict.*without\s*notice/i],
    incident: 'Landlord Forcefully Locking Tenant / Dispossession',
    en: {
      title: 'Landlord Forcefully Locking Flat & Illegal Eviction',
      sections: [
        'Section 126 BNS (Old IPC 341): Wrongful Restraint — Up to 1 month jail or ₹5,000 fine (Cognizable).',
        'Section 329 BNS (Old IPC 441/448): Criminal Trespass — Up to 1 year jail or ₹5,000 fine.',
        'Section 316 BNS (Old IPC 405/406): Criminal Breach of Trust for seizing tenant goods — Up to 5 years jail (Non-Bailable).',
        'Section 108 Transfer of Property Act: Tenant\'s civil right to peaceful possession.',
      ],
      precedent: 'Bishan Das v. State of Punjab (1961): Forcible dispossession without court decree is strictly illegal.',
      action: 'Call 112 immediately, take photos/videos of the padlock, and file complaint under Section 126 BNS.',
    },
    hi: {
      title: 'मकान मालिक द्वारा फ्लैट पर ताला लगाना व अवैध बेदखली',
      sections: [
        'धारा 126 BNS (पुरानी IPC 341): गलत तरीके से रोकना (Wrongful Restraint) — 1 माह जेल या ₹5,000 जुर्माना (संज्ञेय अपराध)।',
        'धारा 329 BNS (पुरानी IPC 448): आपराधिक अनधिकार प्रवेश (Criminal Trespass) — 1 साल तक की जेल।',
        'धारा 316 BNS (पुरानी IPC 406): किरायेदार के सामान पर अमानत में खयानत — 5 साल तक जेल (गैर-जमानती)।',
        'ट्रांसफर ऑफ प्रॉपर्टी एक्ट धारा 108: किरायेदार का शांतिपूर्ण कब्जे का अधिकार।',
      ],
      precedent: 'बिशन दास बनाम पंजाब राज्य (1961): बिना कोर्ट आदेश के ताला लगाना या बेदखल करना कानूनन अपराध है।',
      action: 'तुरंत 112 पर पुलिस बुलाएं, ताले की वीडियो बनाएं और धारा 126 BNS के तहत लिखित तहरीर दें।',
    },
    hinglish: {
      title: 'Landlord ka flat par tala lagana aur illegal eviction',
      sections: [
        'Section 126 BNS (IPC 341): Wrongful Restraint — 1 month jail / ₹5,000 fine (Police FIR mandatory).',
        'Section 329 BNS (IPC 448): Criminal Trespass — 1 year jail.',
        'Section 316 BNS (IPC 406): Criminal Breach of Trust for holding luggage — 5 years jail (Non-Bailable).',
        'Transfer of Property Act Sec 108: Peaceful enjoyment right.',
      ],
      precedent: 'Bishan Das Case (1961): Landlord legally force use nahi kar sakta bina court eviction order ke.',
      action: '112 par call karein, lock ki video banayein aur police station me Section 126 BNS me complaint dein.',
    },
  },
  {
    patterns: [/online\s*(fraud|scam|thagi)/i, /upi\s*(scam|fraud)/i, /otp\s*(fraud|scam)/i, /cyber\s*crime\s*section/i],
    incident: 'Online Financial Fraud, UPI & OTP Scams',
    en: {
      title: 'Online Financial Fraud & Cyber Impersonation',
      sections: [
        'Section 66D IT Act: Cheating by personation using computer/phone — Up to 3 years imprisonment + ₹1,00,000 fine (Non-Bailable).',
        'Section 318(4) BNS (Old IPC 420): Cheating & dishonestly inducing delivery of property — Up to 7 years jail.',
        'Section 66C IT Act: Identity Theft using OTP or password — Up to 3 years jail.',
      ],
      precedent: 'K.S. Puttaswamy (2017) & RBI Zero-Liability Circular: Report within 3 days for full bank refund.',
      action: 'Dial 1930 Cyber Helpline within 2 hours to freeze recipient bank account, and lodge complaint on cybercrime.gov.in.',
    },
    hi: {
      title: 'ऑनलाइन वित्तीय ठगी, यूपीआई व ओटीपी फ्रॉड',
      sections: [
        'आईटी एक्ट धारा 66D: कंप्यूटर/फोन के जरिए पहचान छिपाकर धोखाधड़ी — 3 साल जेल व ₹1,00,000 जुर्माना (गैर-जमानती)।',
        'धारा 318(4) BNS (पुरानी IPC 420): छल व बेईमानी से संपत्ति प्राप्त करना — 7 साल तक की जेल।',
        'आईटी एक्ट धारा 66C: पासवर्ड या ओटीपी की चोरी — 3 साल तक जेल।',
      ],
      precedent: 'आरबीआई सर्कुलर: 3 दिनों के भीतर शिकायत करने पर बैंक को पूरी राशि वापस करनी होती है।',
      action: 'ठगी होते ही 2 घंटे के अंदर 1930 पर कॉल करें और cybercrime.gov.in पर पावती दर्ज करें।',
    },
    hinglish: {
      title: 'Online Financial Fraud & Cyber Scam Sections',
      sections: [
        'Section 66D IT Act: Cheating by personation using digital devices — 3 years jail (Non-Bailable).',
        'Section 318(4) BNS (IPC 420): Cheating — Up to 7 years imprisonment.',
        'Section 66C IT Act: Identity theft & OTP fraud — 3 years jail.',
      ],
      precedent: 'RBI Zero Liability Policy: 3 din me report karne par bank se refund milta hai.',
      action: '1930 helpline par turant call karein aur cybercrime.gov.in par complaint receipt download karein.',
    },
  },
  {
    patterns: [/assault/i, /beat.*me/i, /marpeet/i, /road\s*rage/i, /threat.*kill/i, /jaan\s*se\s*marne/i],
    incident: 'Physical Assault, Road Rage & Threats',
    en: {
      title: 'Physical Assault, Road Rage & Criminal Threats',
      sections: [
        'Section 115 BNS (Old IPC 323): Voluntarily causing hurt — Up to 1 year jail or ₹10,000 fine.',
        'Section 117 BNS (Old IPC 325): Grievous hurt (fracture, tooth loss) — Up to 7 years jail (Non-Bailable).',
        'Section 351 BNS (Old IPC 506): Criminal Intimidation / death threat — Up to 7 years jail.',
        'Section 324 BNS (Old IPC 427): Mischief causing damage to vehicle — Up to 1 year jail.',
      ],
      precedent: 'Lalita Kumari (2014): Immediate FIR registration and government Medico-Legal Case (MLC) examination.',
      action: 'Call 112, take video of vehicle number, and get an MLC test done at a government hospital immediately.',
    },
    hi: {
      title: 'मारपीट, सड़क पर झगड़ा व आपराधिक धमकी',
      sections: [
        'धारा 115 BNS (पुरानी IPC 323): स्वेच्छा से चोट पहुंचाना — 1 साल तक जेल या ₹10,000 जुर्माना।',
        'धारा 117 BNS (पुरानी IPC 325): गंभीर चोट (हड्डी टूटना) — 7 साल तक कठोर कारावास (गैर-जमानती)।',
        'धारा 351 BNS (पुरानी IPC 506): जान से मारने की धमकी देना — 7 साल तक जेल।',
        'धारा 324 BNS (पुरानी IPC 427): गाड़ी या संपत्ति में तोड़फोड़ करना — 1 साल तक जेल।',
      ],
      precedent: 'ललिता कुमारी केस (2014): चोट लगने पर पुलिस को तुरंत FIR दर्ज कर सरकारी अस्पताल में मेडिकल (MLC) कराना होगा।',
      action: '112 पर फोन करें, हमलावर की गाड़ी का नंबर नोट करें और सरकारी अस्पताल से तुरंत MLC रिपोर्ट बनवाएं।',
    },
    hinglish: {
      title: 'Physical Assault, Road Rage & Criminal Intimidation',
      sections: [
        'Section 115 BNS (IPC 323): Simple hurt — 1 year jail / ₹10,000 fine.',
        'Section 117 BNS (IPC 325): Grievous hurt / fracture — 7 years jail (Non-Bailable).',
        'Section 351 BNS (IPC 506): Threatening to kill — Up to 7 years jail.',
        'Section 324 BNS (IPC 427): Vehicle damage — 1 year jail.',
      ],
      precedent: 'Lalita Kumari Ruling: Police ko turant FIR karke government hospital me MLC karana zaroori hai.',
      action: '112 dial karein, attacker ki photo/video lein aur government hospital se MLC certificate banwayein.',
    },
  },
];

// ─── Vernacular FAQ Database ────────────────────────────────────
const VERNACULAR_FAQS = [
  {
    patterns: [
      /how\s+(do|can|to)\s+(i\s+)?(book|schedule)/i,
      /book\s+a?\s*(consultation|appointment)/i,
      /वकील\s*(कैसे|कहाँ)\s*(बुक|ढूंढें|मिलेगा)/i,
      /vakil\s*(kaise|kahan)\s*(book|milega|dhoondhe)/i,
    ],
    answer: {
      en: 'To book a consultation:\n\n1. Go to **Find Advocates** from the sidebar\n2. Browse advocates by practice area or name\n3. Click **Book Consultation**\n4. Select your preferred date & time slot\n5. Confirm and complete payment securely via Escrow!\n\nYou\'ll receive instant confirmation. 📅',
      hi: 'वकील से परामर्श बुक करने का तरीका:\n\n1. साइडबार में **Find Advocates (वकील खोजें)** पर जाएं\n2. अपनी कानूनी समस्या (Property, Criminal, Family आदि) के अनुसार वकील चुनें\n3. वकील की प्रोफ़ाइल पर **Book Consultation** पर क्लिक करें\n4. अपनी सुविधानुसार तारीख और समय (Slot) चुनें\n5. फीस का भुगतान करें (राशि एस्क्रो में सुरक्षित रहेगी)\n\nबुकिंग होते ही आपको पुष्टि संदेश मिल जाएगा! 📅',
      hinglish: 'Advocate book karne ka simple tarika:\n\n1. Sidebar me **Find Advocates** par click karein\n2. Practice area ya location se verified lawyer choose karein\n3. Profile open karke **Book Consultation** select karein\n4. Date aur time slot select karke booking confirm karein\n5. Payment escrow me safe rehti hai aur consultation ke baad hi transfer hoti hai! 📅',
    },
    navKey: 'advocates',
  },
  {
    patterns: [
      /how\s+(do|can|to)\s+(i\s+)?(track|check|see)\s+(my\s+)?case/i,
      /case\s*status/i,
      /केस\s*(स्टेटस|ट्रैक|कहाँ)/i,
      /mera\s*case\s*(status|update|kaise\s*dekhe)/i,
    ],
    answer: {
      en: 'To track your legal case:\n\n1. Click **My Cases** from the sidebar\n2. Select your active case to open the full workspace\n3. Track timeline, next court hearing dates, filed petitions, and advocate notes in real-time! 📋',
      hi: 'अपने केस का स्टेटस ट्रैक करने के लिए:\n\n1. साइडबार से **My Cases (मेरे केस)** पर क्लिक करें\n2. अपने केस पर क्लिक करके केस वर्कस्पेस खोलें\n3. वहाँ अगली सुनवाई की तारीख, कोर्ट की कार्यवाही, अपलोड किए गए दस्तावेज़ और वकील के नोट्स देखें! 📋',
      hinglish: 'Mera Case track karne ke liye:\n\n1. Sidebar se **My Cases** par click karein\n2. Apne case ko select karke workspace open karein\n3. Agli hearing date, case stage aur advocate updates real-time me dekhein! 📋',
    },
    navKey: 'cases',
  },
  {
    patterns: [
      /how\s+(do|can|to)\s+(i\s+)?pay/i,
      /escrow/i,
      /फीस\s*(कैसे|कितनी|एस्क्रो)/i,
      /fees\s*(kaise|kitni|escrow|refund)/i,
    ],
    answer: {
      en: 'LegalConnect uses a **Secure Escrow Payment System**:\n\n1. When booking, your payment is held safely in escrow\n2. Funds are released to the advocate ONLY after the consultation is completed\n3. If an appointment is cancelled beforehand, you receive a full refund!\n\n100% transparent and safe. 💳',
      hi: 'LegalConnect **सुरक्षित एस्क्रो भुगतान (Escrow System)** का उपयोग करता है:\n\n1. जब आप परामर्श बुक करते हैं, तो आपकी फीस सीधे वकील को न जाकर एस्क्रो में सुरक्षित रहती है।\n2. परामर्श (Consultation) सफलतापूर्वक पूरा होने के बाद ही राशि वकील को रिलीज होती है।\n3. यदि सेशन रद्द होता है, तो पूरा रिफंड आपके खाते में वापस आ जाता है।\n\nपूरी तरह सुरक्षित व पारदर्शी! 💳',
      hinglish: 'LegalConnect ka **Secure Escrow System**:\n\n1. Booking ke time aapke paise Escrow account me safe rehte hain.\n2. Consultation successful hone ke baad hi advocate ko payment release hoti hai.\n3. Agar session cancel ho jaye to pura refund milta hai.\n\nAapke paise 100% safe hain! 💳',
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

  // 1. Check Landmark Supreme Court Cases match
  const lowerText = text.toLowerCase();
  
  // A. Check for specific Landmark Case
  for (const c of LANDMARK_CASES_DB) {
    if (c.patterns.some((p) => p.test(text))) {
      intent = INTENTS.LANDMARK_CASES;
      type = 'landmark_case';
      const info = c[lang] || c.en;

      if (lang === 'hi') {
        response = `🏛️ **ऐतिहासिक सुप्रीम कोर्ट वाद — ${c.title}**\n*विषय: ${c.topic}*\n\n` +
          `📌 **मुख्य निष्कर्ष:** ${info.headline}\n\n` +
          `⚖️ **फैसला व कानूनी सिद्धांत:**\n${info.ruling}\n\n` +
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

  // B. General Landmark Cases query ("famous cases", "landmark cases", "aitihasik faisle")
  if (/\b(famous\s*cases?|landmark\s*cases?|supreme\s*court\s*(cases?|judgments?|verdicts?)|aitihasik\s*(case|faisle)|top\s*cases?)\b/i.test(text)) {
    intent = INTENTS.LANDMARK_CASES;
    type = 'landmark_case';

    if (lang === 'hi') {
      response = `🏛️ **भारत के प्रमुख ऐतिहासिक सुप्रीम कोर्ट वाद (Landmark Precedents):**\n\n` +
        `1. **अर्नेश कुमार बनाम बिहार राज्य (2014)**: 7 साल से कम सज़ा वाले मामलों में मनमानी गिरफ्तारी पर रोक (धारा 41A नोटिस अनिवार्य)।\n` +
        `2. **डी.के. बसु बनाम प. बंगाल (1997)**: पुलिस हिरासत में प्रताड़ना रोकने हेतु 11 अनिवार्य नियम।\n` +
        `3. **के.एस. पुट्टास्वामी बनाम भारत संघ (2017)**: निजता का अधिकार (Right to Privacy) एक मौलिक अधिकार है।\n` +
        `4. **विशाखा बनाम राजस्थान राज्य (1997)**: कार्यस्थल पर महिलाओं के यौन उत्पीड़न की रोकथाम (POSH Guidelines)।\n` +
        `5. **केशवानंद भारती बनाम केरल राज्य (1973)**: संविधान का मूल ढांचा सिद्धांत (Basic Structure Doctrine)।\n\n` +
        `*किसी भी केस का नाम लिखकर पूछें, या नीचे दिए गए लिंक से पूरा स्टडी हब खोलें!*`;
      suggestions = ['अर्नेश कुमार केस समझाओ', 'डी.के. बसु के 11 नियम', 'पुट्टास्वामी प्राइवेसी केस'];
    } else if (lang === 'hinglish') {
      response = `🏛️ **India ke Top Landmark Supreme Court Cases:**\n\n` +
        `1. **Arnesh Kumar v. State of Bihar (2014)**: Offences < 7 years me automatic arrest banned; Section 41A notice mandatory.\n` +
        `2. **D.K. Basu v. State of West Bengal (1997)**: 11 golden rules against custodial torture and secret police detention.\n` +
        `3. **K.S. Puttaswamy v. UOI (2017)**: Right to Privacy is a Fundamental Right under Article 21.\n` +
        `4. **Vishaka v. State of Rajasthan (1997)**: Workplace sexual harassment prevention (POSH).\n` +
        `5. **Kesavananda Bharati (1973)**: Parliament cannot destroy Basic Structure of Constitution.\n\n` +
        `*Kisi bhi case ka naam type karein to explain or click the hub link!*`;
      suggestions = ['Explain Arnesh Kumar case', 'D.K. Basu guidelines', 'Puttaswamy privacy ruling'];
    } else {
      response = `🏛️ **Top Landmark Supreme Court Judgments of India:**\n\n` +
        `1. **Arnesh Kumar v. State of Bihar (2014)**: Protection against arbitrary police arrest for offences carrying < 7 years jail.\n` +
        `2. **D.K. Basu v. State of West Bengal (1997)**: 11 golden rules protecting arrestees from custodial torture and secret lockup.\n` +
        `3. **Justice K.S. Puttaswamy v. UOI (2017)**: Right to Privacy affirmed as a Fundamental Right under Article 21.\n` +
        `4. **Vishaka v. State of Rajasthan (1997)**: Established mandatory Internal Complaints Committees (ICC) under POSH.\n` +
        `5. **Kesavananda Bharati (1973)**: Formulated the inviolable Basic Structure Doctrine of the Constitution.\n\n` +
        `*Type any case name to get a detailed brief, or click the hub link below!*`;
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

  // 2. Check Applied Sections by Incident
  for (const s of APPLIED_SECTIONS_DB) {
    if (s.patterns.some((p) => p.test(text))) {
      intent = INTENTS.APPLIED_SECTIONS;
      type = 'applied_sections';
      const info = s[lang] || s.en;

      if (lang === 'hi') {
        response = `📚 **लागू होने वाली विधिक धाराएं (Statutory Sections Study):**\n*घटना: ${info.title}*\n\n` +
          `📌 **लागू धाराएं (BNS 2023 व विशेष कानून):**\n` +
          info.sections.map((sec) => `• ${sec}`).join('\n') + `\n\n` +
          `🏛️ **संबंधित सुप्रीम कोर्ट निर्णय:**\n${info.precedent}\n\n` +
          `✅ **तत्काल कानूनी कदम (Action Plan):**\n${info.action}`;
        suggestions = ['संबंधित वकील से परामर्श करें', 'विधिक नोटिस जनरेटर', 'और धाराएं देखें'];
      } else if (lang === 'hinglish') {
        response = `📚 **Applicable Legal Sections & Dhara Guide:**\n*Scenario: ${info.title}*\n\n` +
          `📌 **Applicable Sections (BNS 2023 & Special Acts):**\n` +
          info.sections.map((sec) => `• ${sec}`).join('\n') + `\n\n` +
          `🏛️ **Connected Landmark Precedent:**\n${info.precedent}\n\n` +
          `✅ **Immediate Action Steps:**\n${info.action}`;
        suggestions = ['Find an advocate for this', 'Generate legal notice', 'View more sections'];
      } else {
        response = `📚 **Applicable Statutory Sections Study Guide:**\n*Scenario: ${info.title}*\n\n` +
          `📌 **Statutory Sections (New BNS 2023 & Special Acts):**\n` +
          info.sections.map((sec) => `• ${sec}`).join('\n') + `\n\n` +
          `🏛️ **Connected Supreme Court Precedent:**\n${info.precedent}\n\n` +
          `✅ **Immediate Citizen Action Plan:**\n${info.action}`;
        suggestions = ['Consult a specialist lawyer', 'Generate statutory notice', 'Legal Study Hub'];
      }

      navLinks = [
        {
          path: '/legal-resources',
          label: lang === 'hi' ? '📚 पूरा विधिक अध्ययन हब' : '📚 Full Legal Study Hub',
          icon: '📚',
          desc: 'View comprehensive section tables, bailable status & punishments',
        },
      ];

      return { response, suggestions, navLinks, quickActions: [], type, intent, lang, timestamp: new Date().toISOString() };
    }
  }

  // 3. Check Nyaya Kosh (Legal Glossary) match
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

  // 2. Greetings
  if (GREETING_PATTERNS.some((p) => p.test(text))) {
    intent = INTENTS.GREETING;
    if (lang === 'hi') {
      response = `नमस्ते ${name}! 🙏 मैं **LexBot** हूँ, आपका LegalConnect कानूनी सहायक।\n\nमैं आपको कानूनी सलाह समझने, भारत के कानूनों (BNS, NI Act, Rent Act) के अनुसार मार्गदर्शन देने, और सत्यापित वकील खोजने में मदद कर सकता हूँ।\n\nआज मैं आपकी क्या सहायता करूँ?`;
      suggestions = ['चेक बाउंस सलाह', 'मकान मालिक विवाद', 'वकील कैसे खोजें?', 'कानूनी शब्दकोश'];
      quickActions = [
        { label: '🔍 वकील खोजें', path: routes.advocates?.path },
        { label: '📋 मेरे केस', path: routes.cases?.path },
        { label: '📅 परामर्श (Slots)', path: routes.consultations?.path },
      ];
    } else if (lang === 'hinglish') {
      response = `Namaste ${name}! 🙏 Main hoon **LexBot**, aapka LegalConnect legal assistant.\n\nAap yahan Indian legal procedures (Cheque bounce, property, cyber fraud, divorce) samajh sakte hain aur verified advocates se direct consult kar sakte hain.\n\nBataiye, aaj kis matter me help chahiye?`;
      suggestions = ['Cheque bounce advice', 'Property dispute', 'Vakil kaise book kare?', 'Nyaya Kosh'];
      quickActions = [
        { label: '🔍 Find Advocates', path: routes.advocates?.path },
        { label: '📋 My Cases', path: routes.cases?.path },
        { label: '📅 Consultations', path: routes.consultations?.path },
      ];
    } else {
      response = `Hello ${name}! 👋 I'm **LexBot**, your multilingual LegalConnect assistant.\n\nI can help you navigate Indian legal procedures, explain statutory rights under Indian Law, and connect you with verified advocates. How can I assist you today?`;
      suggestions = ['Book a consultation', 'Track my case', 'Cheque bounce advice', 'Legal Glossary'];
      quickActions = [
        { label: '🔍 Find Advocates', path: routes.advocates?.path },
        { label: '📋 My Cases', path: routes.cases?.path },
        { label: '📅 Consultations', path: routes.consultations?.path },
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

  // 3. Farewells
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

  // 4. Check FAQs (Booking, Cases, Payment, Escrow)
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

  // 5. Practice Area & Citizen Remedies Matching
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

  // 6. Navigation keywords
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

  // 7. Default Fallback
  if (lang === 'hi') {
    response = `नमस्ते ${name}, मैं आपके सवाल को पूरी तरह समझ नहीं पाया। 🤔\n\nमैं इन विषयों में आपकी सहायता कर सकता हूँ:\n` +
      '• **कानूनी सलाह**: चेक बाउंस (138 NI Act), किरायेदार-मकान मालिक विवाद, तलाक, साइबर ठगी\n' +
      '• **कानूनी शब्दकोश (Nyaya Kosh)**: स्टे ऑर्डर, ज़मानत, कैविएट, एफआईआर का मतलब\n' +
      '• **प्लेटफ़ॉर्म सहायता**: वकील कैसे बुक करें, केस कैसे ट्रैक करें, फीस व एस्क्रो\n\n' +
      'नीचे दिए गए विकल्पों पर क्लिक करें या अपना सवाल स्पष्ट रूप से लिखें!';
    suggestions = ['चेक बाउंस सलाह', 'मकान मालिक विवाद', 'स्टे आर्डर क्या है?', 'वकील खोजें'];
  } else if (lang === 'hinglish') {
    response = `Hello ${name}, main aapka query properly nahi samajh paya. 🤔\n\nAap mujhse ye sab pooch sakte hain:\n` +
      '• **Legal advice**: Cheque bounce, tenant dispute, domestic violence, online fraud\n' +
      '• **Nyaya Kosh**: Meaning of Injunction/Stay order, Bail, Caveat, FIR\n' +
      '• **Platform help**: How to book advocate, case status, fees\n\n' +
      'Niche diye gaye quick links use karein ya dobara poochhein!';
    suggestions = ['Cheque bounce advice', 'Tenant problem', 'Meaning of Stay Order', 'Find advocate'];
  } else {
    response = `I'm not quite sure I understood that, ${name}. 🤔\n\nHere is what I can assist with:\n` +
      '• **Legal topics**: Cheque bounce (Sec 138), Landlord-tenant disputes, Criminal & Bail, Consumer disputes\n' +
      '• **Nyaya Kosh (Glossary)**: Meaning of Injunction, Bail, Caveat, Cognizable offenses\n' +
      '• **Platform guidance**: Book an advocate, check case status, secure escrow payment\n\n' +
      'Try clicking one of the suggestions below!';
    suggestions = ['Cheque bounce advice', 'Tenant dispute', 'Legal Glossary', 'Find an advocate'];
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
    type: 'text',
    intent: INTENTS.UNKNOWN,
    lang,
    timestamp: new Date().toISOString(),
  };
}
