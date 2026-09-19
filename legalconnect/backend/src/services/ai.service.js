// Local keyword-based AI legal assistant
// No external API required — uses practice area classification and legal topic mapping

const PRACTICE_AREA_KEYWORDS = {
  'Family Law': ['divorce', 'marriage', 'custody', 'alimony', 'maintenance', 'adoption', 'domestic violence', 'dowry', 'matrimonial', 'child support', 'guardian', 'separation'],
  'Property Law': ['property', 'land', 'real estate', 'builder', 'possession', 'title', 'registry', 'encroachment', 'rent', 'tenancy', 'eviction', 'lease', 'house', 'flat', 'sale deed'],
  'Criminal Law': ['fir', 'police', 'arrest', 'bail', 'crime', 'theft', 'fraud', 'assault', 'murder', 'cheating', 'complaint', 'criminal', 'accused', 'victim', 'chargesheet'],
  'Corporate Law': ['company', 'startup', 'incorporation', 'shareholder', 'director', 'mou', 'partnership', 'llp', 'pvt ltd', 'merger', 'acquisition', 'contract', 'board'],
  'Civil Litigation': ['civil', 'suit', 'court', 'dispute', 'injunction', 'damages', 'compensation', 'plaintiff', 'defendant', 'appeal', 'decree', 'execution'],
  'Labour & Employment': ['employment', 'job', 'salary', 'termination', 'wrongful', 'labour', 'worker', 'employer', 'pf', 'gratuity', 'esi', 'retrenchment', 'union', 'workplace'],
  'Consumer Protection': ['consumer', 'product', 'defective', 'refund', 'service', 'complaint', 'forum', 'redressal', 'unfair trade', 'misleading'],
  'Tax Law': ['income tax', 'gst', 'tax', 'itr', 'assessment', 'penalty', 'appeal', 'notice', 'tds', 'exemption', 'refund'],
  'Intellectual Property': ['patent', 'trademark', 'copyright', 'ip', 'design', 'brand', 'infringement', 'plagiarism', 'license'],
  'Cyber Law': ['cyber', 'online', 'hacking', 'data', 'privacy', 'social media', 'it act', 'digital', 'internet', 'email fraud', 'cybercrime'],
  'Banking & Finance': ['bank', 'loan', 'emi', 'nbfc', 'cheque', 'bounce', 'debt', 'recovery', 'credit', 'mortgage', 'insolvency', 'bankruptcy'],
  'Immigration': ['visa', 'passport', 'immigration', 'citizenship', 'oci', 'foreign', 'work permit', 'deportation'],
};

const DOCUMENT_SUGGESTIONS = {
  'Family Law': ['Marriage Certificate', 'Aadhaar Card', 'Birth Certificate of Children', 'Income Proof', 'Address Proof'],
  'Property Law': ['Sale Deed', 'Title Documents', 'Property Tax Receipts', 'Encumbrance Certificate', 'Aadhaar Card'],
  'Criminal Law': ['FIR Copy', 'ID Proof', 'Medical Reports (if applicable)', 'Witness Details', 'Evidence Documents'],
  'Corporate Law': ['Certificate of Incorporation', 'MOA/AOA', 'Shareholder Agreement', 'Board Resolutions', 'Financial Statements'],
  'Civil Litigation': ['Court Notices/Orders', 'Agreement/Contract', 'Correspondence', 'ID Proof', 'Evidence'],
  'Labour & Employment': ['Employment Contract', 'Termination Letter', 'Salary Slips', 'Offer Letter', 'HR Correspondence'],
  'Consumer Protection': ['Purchase Invoice/Receipt', 'Warranty Card', 'Complaint Emails', 'Product Photos', 'Bank Statement'],
  'Tax Law': ['ITR Filings', 'Tax Notices', 'Bank Statements', 'Form 26AS', 'PAN Card'],
  'Intellectual Property': ['Trademark Registration', 'Copyright Certificate', 'Evidence of Use', 'Infringement Proof'],
  'Cyber Law': ['Screenshots/Evidence', 'FIR Copy', 'Email Records', 'Social Media Posts', 'Bank Statements (if fraud)'],
  'Banking & Finance': ['Loan Agreement', 'Cheque Copies', 'Bank Statements', 'Demand Notices', 'EMI Records'],
  'Immigration': ['Passport', 'Visa Documents', 'Employment Proof', 'Sponsorship Letter', 'Financial Proof'],
};

const GENERAL_INFO = {
  'Family Law': 'Family law matters in India are governed by personal laws (Hindu Marriage Act, Muslim Personal Law, etc.) and special laws like the Special Marriage Act. The Family Court Act provides for specialized courts to handle such disputes.',
  'Property Law': 'Property disputes in India can be civil or criminal in nature. Matters like title disputes, possession, and encroachment are handled under the Transfer of Property Act and other relevant state laws.',
  'Criminal Law': 'Criminal matters in India are governed by the Indian Penal Code (IPC) / BNS 2023. Filing an FIR with the police is usually the first step. You have the right to bail in most cases.',
  'Corporate Law': 'Business and corporate matters are governed by the Companies Act 2013. Contracts, disputes, and regulatory compliance fall under this domain.',
  'Civil Litigation': 'Civil disputes are resolved through the Civil Procedure Code. The process involves filing a plaint, serving summons, and attending hearings in the appropriate civil court.',
  'Labour & Employment': 'Employment disputes are governed by the Industrial Disputes Act, Payment of Wages Act, and other labour laws. Labour courts and industrial tribunals handle these disputes.',
  'Consumer Protection': 'Consumer disputes are resolved under the Consumer Protection Act 2019. You can file a complaint with the District Consumer Disputes Redressal Commission.',
  'Tax Law': 'Tax matters are governed by the Income Tax Act, GST Act, and other fiscal legislation. Tax notices require prompt response within the specified timeframe.',
  'Intellectual Property': 'IP rights in India are protected under the Patents Act, Trade Marks Act, and Copyright Act. Registration provides stronger legal protection.',
  'Cyber Law': 'Cybercrime is addressed under the Information Technology Act 2000 and its amendments. Report cybercrime at cybercrime.gov.in.',
  'Banking & Finance': 'Banking disputes can be addressed through the Banking Ombudsman, Debt Recovery Tribunals (DRT), or civil courts depending on the nature of the dispute.',
  'Immigration': 'Immigration matters are governed by the Foreigners Act and Passports Act. For visa/OCI issues, contact the relevant embassy or Foreigners Regional Registration Office (FRRO).',
};

export function analyzeIssue(issueText) {
  const text = issueText.toLowerCase();

  // Score each practice area
  const scores = {};
  for (const [area, keywords] of Object.entries(PRACTICE_AREA_KEYWORDS)) {
    scores[area] = keywords.filter((kw) => text.includes(kw)).length;
  }

  // Sort by score
  const sorted = Object.entries(scores)
    .filter(([, score]) => score > 0)
    .sort(([, a], [, b]) => b - a);

  const primaryArea = sorted[0]?.[0] || null;
  const relatedAreas = sorted.slice(1, 3).map(([area]) => area);

  const urgencyKeywords = ['urgent', 'immediate', 'emergency', 'deadline', 'tomorrow', 'arrest', 'bail', 'eviction'];
  const isUrgent = urgencyKeywords.some((kw) => text.includes(kw));

  return {
    practiceArea: primaryArea,
    relatedAreas,
    confidence: primaryArea ? Math.min(100, (scores[primaryArea] / 3) * 100) : 0,
    suggestedDocuments: primaryArea ? DOCUMENT_SUGGESTIONS[primaryArea] || [] : [],
    generalInfo: primaryArea ? GENERAL_INFO[primaryArea] || '' : '',
    isUrgent,
    disclaimer:
      'This AI assistant provides general legal information only and does not constitute legal advice. For advice specific to your situation, please consult a qualified advocate.',
  };
}
