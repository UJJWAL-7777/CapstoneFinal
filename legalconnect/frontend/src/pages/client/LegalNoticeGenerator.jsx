import { useState } from 'react';
import {
  FileText,
  Printer,
  Copy,
  CheckCircle,
  AlertTriangle,
  Scale,
  Sparkles,
  Download,
  ShieldCheck,
  Building2,
  Clock,
  RotateCcw,
  Languages,
} from 'lucide-react';
import Button from '../../components/ui/Button.jsx';
import Badge from '../../components/ui/Badge.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import { useToast } from '../../context/ToastContext.jsx';

// ─── Clean Form Input Helper (Avoids void element nesting) ────────
function FormField({ label, as: Component = 'input', className = '', ...props }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-ink dark:text-ink-soft">{label}</label>
      <Component
        className={`input text-sm py-1.5 w-full ${className}`}
        {...props}
      />
    </div>
  );
}

// ─── Notice Categories & Statutory Templates ─────────────────────
const NOTICE_CATEGORIES = [
  {
    id: 'cheque_bounce',
    title: 'Cheque Bounce Demand Notice',
    titleHi: 'चेक बाउंस कानूनी मांग सूचना',
    law: 'Section 138, Negotiable Instruments Act, 1881',
    curePeriod: '15 Days Statutory Demand',
    icon: Scale,
    color: 'emerald',
    badge: 'Criminal & Civil Remedy',
    desc: 'Mandatory statutory legal notice to be sent within 30 days of receiving the bank memo.',
    demo: {
      senderName: 'Rahul Mehta',
      senderAddress: 'Flat 402, Green Glen Layout, Bellandur, Bengaluru, Karnataka 560103',
      senderPhone: '+91 98765 43210',
      recipientName: 'Vikramaditya Sharma',
      recipientAddress: 'Plot 12, Sector 18, Gurugram, Haryana 122002',
      amount: '75,000',
      chequeNumber: '482910',
      chequeDate: '2026-09-15',
      bankName: 'HDFC Bank, Indiranagar Branch',
      memoDate: '2026-09-22',
      returnReason: 'Funds Insufficient',
      purpose: 'Outstanding loan repayment towards supply of electronic inventory',
      advocateName: 'Adv. Ananya Roy, High Court of Karnataka (Enrol: KAR/1842/2018)',
    },
  },
  {
    id: 'security_deposit',
    title: 'Tenant Security Deposit Recovery',
    titleHi: 'सिक्योरिटी डिपॉजिट वापसी नोटिस',
    law: 'Transfer of Property Act, 1882 & Rent Control Act',
    curePeriod: '15 Days Demand with 18% p.a. Interest',
    icon: Building2,
    color: 'amber',
    badge: 'Tenancy Rights',
    desc: 'Demand return of withheld security deposit after peaceful handover of rented property.',
    demo: {
      senderName: 'Priya Narayanan',
      senderAddress: 'House No. 89, 4th Cross, Koramangala, Bengaluru 560034',
      senderPhone: '+91 98450 11223',
      recipientName: 'Harish Chandra Gupta (Landlord)',
      recipientAddress: 'Villa 14, Palm Meadows, Whitefield, Bengaluru 560066',
      amount: '90,000',
      tenancyAddress: 'Flat 3B, Sunshine Apartments, BTM 2nd Stage, Bengaluru 560076',
      handoverDate: '2026-08-31',
      agreementDate: '2025-08-01',
      purpose: 'Unjustified withholding of interest-free rental security deposit post peaceful handover',
      advocateName: 'Adv. Devendra Verma, Civil Court Advocate',
    },
  },
  {
    id: 'unpaid_salary',
    title: 'Unpaid Salary & Gratuity Demand',
    titleHi: 'बकाया वेतन व ग्रेच्युटी वसूली नोटिस',
    law: 'Payment of Wages Act, 1936 & Industrial Disputes Act',
    curePeriod: '15 Days Final Demand Notice',
    icon: Clock,
    color: 'blue',
    badge: 'Labour & Employment',
    desc: 'Demand settlement of withheld salary, leave encashment, and full & final settlement.',
    demo: {
      senderName: 'Amitabh Sen',
      senderAddress: 'A-204, Royal Palms, Goregaon East, Mumbai 400065',
      senderPhone: '+91 97690 33445',
      recipientName: 'AcroTech Solutions Pvt. Ltd. (Attn: Director Rajeev Khanna)',
      recipientAddress: 'Cyber One Tower, Sector 30A, Vashi, Navi Mumbai 400703',
      amount: '1,45,000',
      unpaidMonths: 'July 2026 and August 2026',
      designation: 'Senior Software Quality Engineer',
      resignationDate: '2026-08-31',
      purpose: 'Wrongful withholding of earned wages, full & final settlement dues, and experience certificate',
      advocateName: 'Adv. Meenakshi Sunderam, Labour & Employment Counsel',
    },
  },
  {
    id: 'consumer_refund',
    title: 'Defective Product & Consumer Refund',
    titleHi: 'उपभोक्ता संरक्षण व रिफंड मांग नोटिस',
    law: 'Section 35, Consumer Protection Act, 2019',
    curePeriod: '15 Days Notice prior to e-Daakhil filing',
    icon: ShieldCheck,
    color: 'rose',
    badge: 'Consumer Court',
    desc: 'Demand replacement, full refund, and compensation for deficiency in service or defective goods.',
    demo: {
      senderName: 'Sanjay Deshmukh',
      senderAddress: 'Row House 4, Shivaji Nagar, Pune, Maharashtra 411005',
      senderPhone: '+91 98220 55667',
      recipientName: 'Nova Retail Electronics Ltd. (Customer Grievance Officer)',
      recipientAddress: 'Express Zone, Western Express Highway, Malad East, Mumbai 400097',
      amount: '42,999',
      invoiceNumber: 'INV-2026-8812',
      purchaseDate: '2026-07-10',
      defectDetails: 'Repeated motherboard failure within warranty period and refusal of replacement',
      purpose: 'Full refund of purchase value + ₹25,000 compensation for mental agony and harassment',
      advocateName: 'Adv. Rajesh Joshi, District Consumer Forum Advocate',
    },
  },
];

export default function LegalNoticeGenerator() {
  const { user } = useAuth();
  const toast = useToast();

  const [selectedCatId, setSelectedCatId] = useState(NOTICE_CATEGORIES[0].id);
  const [lang, setLang] = useState('en'); // 'en' | 'hi'
  const [copied, setCopied] = useState(false);

  // Form State
  const activeCategory = NOTICE_CATEGORIES.find((c) => c.id === selectedCatId) || NOTICE_CATEGORIES[0];
  const [formData, setFormData] = useState({
    ...activeCategory.demo,
    senderName: user?.name || activeCategory.demo.senderName,
    senderPhone: user?.phone || activeCategory.demo.senderPhone,
    noticeDate: new Date().toISOString().split('T')[0],
  });

  const handleSelectCategory = (catId) => {
    setSelectedCatId(catId);
    const cat = NOTICE_CATEGORIES.find((c) => c.id === catId);
    if (cat) {
      setFormData({
        ...cat.demo,
        senderName: user?.name || cat.demo.senderName,
        senderPhone: user?.phone || cat.demo.senderPhone,
        noticeDate: new Date().toISOString().split('T')[0],
      });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFillDemo = () => {
    setFormData({
      ...activeCategory.demo,
      noticeDate: new Date().toISOString().split('T')[0],
    });
    toast.success('Filled with sample court-ready demonstration data!');
  };

  // ─── Document Generators ───────────────────────────────────────
  const generateNoticeText = () => {
    const today = formData.noticeDate
      ? new Date(formData.noticeDate).toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })
      : new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

    if (activeCategory.id === 'cheque_bounce') {
      if (lang === 'hi') {
        return `रजिस्ट्री डाक / स्पीड पोस्ट (पावती सहित) / कानूनी मांग सूचना

दिनांक: ${today}

सेवा में,
${formData.recipientName}
${formData.recipientAddress}

विषय: धारा 138, पराक्रम्य लिखत अधिनियम 1881 (Negotiable Instruments Act) के तहत चेक बाउंस होने पर ₹${formData.amount}/- की मांग हेतु विधिक सूचना।

महोदय / महोदया,

मेरे मुवक्किल श्री/श्रीमती ${formData.senderName}, निवासी ${formData.senderAddress} के स्पष्ट निर्देशों के तहत, मैं आपको यह विधिक सूचना प्रेषित करता हूँ:

1. यह कि आपने अपने वैध दायित्व एवं बकाया राशि के भुगतान हेतु मेरे मुवक्किल के पक्ष में एक चेक संख्या ${formData.chequeNumber}, दिनांक ${formData.chequeDate}, राशि ₹${formData.amount}/-, आहरित बैंक ${formData.bankName} जारी किया था।
2. यह कि मेरे मुवक्किल ने उक्त चेक को अपने बैंक खाते में भुगतान हेतु प्रस्तुत किया। किंतु उक्त चेक बैंक द्वारा दिनांक ${formData.memoDate} को "चेक रिटर्न मेमो" के साथ इस टिप्पणी के साथ अनादृत (बाउंस) कर दिया गया कि: "${formData.returnReason}"।
3. यह कि आपके खाते में पर्याप्त धनराशि न होने के बावजूद दुर्भावनापूर्वक चेक जारी करना धारा 138 एन.आई. एक्ट के तहत एक गंभीर दाण्डिक अपराध है।

अतः, इस कानूनी सूचना के माध्यम से आपको निर्देशित किया जाता है कि आप सूचना प्राप्ति के 15 (पंद्रह) दिनों के भीतर ₹${formData.amount}/- (अक्षरे पचहत्तर हजार रुपये) का भुगतान मेरे मुवक्किल को करें।

यदि आप उक्त 15 दिनों के भीतर देय राशि का भुगतान करने में विफल रहते हैं, तो मेरे मुवक्किल आपके विरुद्ध सक्षम न्यायालय में धारा 138 पराक्रम्य लिखत अधिनियम के तहत आपराधिक परिवाद दायर करने हेतु बाध्य होंगे, जिसमें 2 वर्ष का कारावास एवं चेक राशि का दोगुना अर्थदंड का प्रावधान है।

भवदीय,
${formData.advocateName || 'विधिक प्रकोष्ठ, LegalConnect'}
(हस्ताक्षर व मुहर)

मुवक्किल के हस्ताक्षर: ___________________
(${formData.senderName})
फोन: ${formData.senderPhone}`;
      }

      return `BY REGISTERED A.D. / SPEED POST WITH ACKNOWLEDGEMENT DUE
LEGAL DEMAND NOTICE UNDER SECTION 138 OF THE NEGOTIABLE INSTRUMENTS ACT, 1881

Date: ${today}

TO:
${formData.recipientName}
${formData.recipientAddress}

FROM:
${formData.advocateName || 'LegalConnect Legal Cell, On behalf of Client'}
Counsel for: ${formData.senderName}
Address: ${formData.senderAddress}
Contact: ${formData.senderPhone}

SUBJECT: STATUTORY LEGAL NOTICE UNDER SECTION 138 OF THE NEGOTIABLE INSTRUMENTS ACT, 1881 READ WITH SECTION 420 OF INDIAN PENAL CODE / BHARATIYA NYAYA SANHITA FOR DISHONOUR OF CHEQUE BEARING NO. ${formData.chequeNumber} FOR AN AMOUNT OF ₹${formData.amount}/-.

Sir / Madam,

Under instructions from and on behalf of my client, ${formData.senderName}, residing at ${formData.senderAddress}, I hereby serve upon you this Statutory Legal Demand Notice:

1. That towards the discharge of your legally enforceable liability arising out of ${formData.purpose}, you had drawn and issued in favor of my client Cheque bearing No. ${formData.chequeNumber} dated ${formData.chequeDate} for an amount of ₹${formData.amount}/- (Rupees Seventy Five Thousand Only), drawn on ${formData.bankName}.

2. That relying upon your solemn representation and assurance that the said instrument would be honored upon presentation, my client presented the said cheque for clearance through their bankers.

3. That to the shock and dismay of my client, the aforesaid cheque was returned dishonored and unpaid by your bank vide Return Memo dated ${formData.memoDate} with the remarks "${formData.returnReason}".

4. That by issuing a cheque without maintaining sufficient funds, you have committed an offence punishable under Section 138 of the Negotiable Instruments Act, 1881, as well as criminal breach of trust.

NOW THEREFORE, I hereby call upon you to make the payment of the said amount of ₹${formData.amount}/- (Rupees Seventy Five Thousand Only) to my client within a period of 15 (FIFTEEN) DAYS from the date of receipt of this notice.

PLEASE TAKE NOTE that in the event of your failure to discharge the said liability within the statutory period of 15 days, my client has given me peremptory instructions to initiate appropriate criminal proceedings against you before the Competent Judicial Magistrate under Section 138 & 142 of the Negotiable Instruments Act, 1881, wherein you shall be liable to be prosecuted and punished with imprisonment for a term extending up to 2 (two) years, or with a fine which may extend to twice the amount of the cheque, or with both, alongside all costs of litigation.

A copy of this notice is retained in my chamber records for necessary future judicial reference.

Yours faithfully,

${formData.advocateName || 'Advocate for the Complainant'}
[Seal & Signature of Advocate]

Client Counter-Signature: ______________________
(${formData.senderName})`;
    }

    if (activeCategory.id === 'security_deposit') {
      return `BY REGISTERED POST WITH A.D.
LEGAL NOTICE FOR REFUND OF TENANCY SECURITY DEPOSIT

Date: ${today}

TO:
${formData.recipientName}
${formData.recipientAddress}

FROM:
${formData.senderName}
${formData.senderAddress}
Contact: ${formData.senderPhone}

SUBJECT: FINAL DEMAND FOR IMMEDIATE REFUND OF INTEREST-FREE RENTAL SECURITY DEPOSIT OF ₹${formData.amount}/- WITH 18% P.A. INTEREST.

Sir / Madam,

I am constrained to address this Legal Notice on account of your illegal, wrongful, and arbitrary withholding of my security deposit:

1. That I was a lawful tenant in respect of premises situated at ${formData.tenancyAddress} under the Tenancy Agreement dated ${formData.agreementDate}.
2. That at the inception of the tenancy, I deposited an interest-free refundable security deposit of ₹${formData.amount}/- with you.
3. That on ${formData.handoverDate}, I peacefully vacated and handed over the vacant, clean, and physical possession of the demised premises to you along with all keys, in prime condition.
4. That despite repeated requests, reminders, and phone communications, you have willfully failed and neglected to refund the said security deposit of ₹${formData.amount}/-.

THEREFORE, you are hereby called upon to refund the entire amount of ₹${formData.amount}/- along with interest @ 18% per annum from ${formData.handoverDate} till realization within 15 (FIFTEEN) DAYS of receipt of this notice.

Failure to comply shall compel me to initiate civil proceedings for recovery of money with costs, as well as appropriate complaints before the Rent Authority and Consumer Protection Forum.

Yours truly,

${formData.senderName}
Tenant`;
    }

    if (activeCategory.id === 'unpaid_salary') {
      return `BY REGISTERED POST & EMAIL
LEGAL DEMAND NOTICE FOR UNPAID SALARY AND STATUTORY TERMINATION BENEFITS

Date: ${today}

TO:
${formData.recipientName}
${formData.recipientAddress}

FROM:
${formData.senderName}
${formData.senderAddress}
Designation: ${formData.designation}

SUBJECT: STATUTORY DEMAND FOR IMMEDIATE DISBURSEMENT OF ARREARS OF SALARY AND FULL & FINAL DUES OF ₹${formData.amount}/- UNDER THE PAYMENT OF WAGES ACT, 1936.

Sir / Madam,

1. That I served as ${formData.designation} in your esteemed organization up until my resignation on ${formData.resignationDate}.
2. That I dutifully served my notice period and completed all handover formalities as acknowledged by management.
3. That the management has wrongfully withheld my earned salary for ${formData.unpaidMonths}, amounting to ₹${formData.amount}/-, alongside my Experience Letter.
4. That withholding earned wages is a gross violation of Section 5 & 15 of the Payment of Wages Act, 1936 and constitutes unfair labour practice.

I hereby call upon you to credit the sum of ₹${formData.amount}/- into my bank account within 15 (FIFTEEN) DAYS of this notice, failing which I shall be constrained to approach the Labour Commissioner and initiate recovery proceedings with penal interest.

Yours faithfully,

${formData.senderName}`;
    }

    // Consumer Refund default
    return `REGISTERED NOTICE UNDER CONSUMER PROTECTION ACT, 2019

Date: ${today}

TO:
${formData.recipientName}
${formData.recipientAddress}

FROM:
${formData.senderName}
${formData.senderAddress}
Contact: ${formData.senderPhone}

SUBJECT: NOTICE UNDER SECTION 35 OF THE CONSUMER PROTECTION ACT, 2019 FOR DEFICIENCY IN SERVICE AND DEFECTIVE PRODUCT (INVOICE NO: ${formData.invoiceNumber}).

Sir / Madam,

1. That on ${formData.purchaseDate}, I purchased goods/services for consideration of ₹${formData.amount}/- vide Invoice No. ${formData.invoiceNumber}.
2. That the said product suffers from inherent defects, specifically: ${formData.defectDetails}.
3. That despite lodging formal complaints, your service center has failed to redress my grievance.

I hereby demand that you either replace the product or issue a full refund of ₹${formData.amount}/- along with ₹25,000/- towards compensation for mental agony within 15 DAYS, failing which I shall file a complaint before the District Consumer Disputes Redressal Commission via e-Daakhil.

Yours sincerely,

${formData.senderName}`;
  };

  const noticeText = generateNoticeText();

  const handleCopy = () => {
    navigator.clipboard.writeText(noticeText);
    setCopied(true);
    toast.success('Complete legal notice copied to clipboard!');
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16 print:p-0 print:max-w-none">
      {/* ─── Header Banner (Hidden during print) ───────────────────── */}
      <div className="print:hidden rounded-2xl bg-gradient-to-r from-chamber-900 via-chamber-800 to-chamber-700 p-6 sm:p-8 text-white shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-gold-400/20 px-3 py-1 text-xs font-semibold text-gold-300">
                <Sparkles size={13} /> NyayaDraft • Legal Notice Engine
              </span>
              <Badge variant="emerald">Court-Ready PDF</Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-serif">1-Click Legal Notice Generator</h1>
            <p className="mt-1 text-sm text-chamber-100 max-w-2xl">
              Generate officially formatted, statutory legal demand notices (Section 138 NI Act, Tenancy Eviction,
              Security Deposit, Unpaid Salary) in English & हिन्दी. Ready to print, sign, and dispatch via Speed Post.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleFillDemo}
              className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 hover:bg-white/20 px-3.5 py-2 text-xs font-medium text-white transition-colors"
            >
              <RotateCcw size={14} /> Fill Demo Data
            </button>
            <div className="flex rounded-lg bg-black/20 p-1">
              <button
                onClick={() => setLang('en')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                  lang === 'en' ? 'bg-white text-chamber-900 shadow' : 'text-white/80 hover:text-white'
                }`}
              >
                English
              </button>
              <button
                onClick={() => setLang('hi')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                  lang === 'hi' ? 'bg-white text-chamber-900 shadow' : 'text-white/80 hover:text-white'
                }`}
              >
                हिन्दी
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Category Selection Cards (Hidden during print) ───────── */}
      <div className="print:hidden grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {NOTICE_CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isSelected = cat.id === selectedCatId;
          return (
            <button
              key={cat.id}
              onClick={() => handleSelectCategory(cat.id)}
              className={`text-left p-4 rounded-xl border transition-all ${
                isSelected
                  ? 'border-chamber-600 bg-chamber-50/50 shadow-md ring-2 ring-chamber-600/20'
                  : 'border-line bg-surface hover:border-chamber-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div
                  className={`p-2 rounded-lg ${
                    isSelected ? 'bg-chamber-700 text-white' : 'bg-chamber-100 text-chamber-700'
                  }`}
                >
                  <Icon size={18} />
                </div>
                <span className="text-[10px] font-semibold tracking-wider uppercase text-ink-muted">
                  {cat.badge}
                </span>
              </div>
              <h3 className="font-semibold text-sm text-ink">{lang === 'hi' ? cat.titleHi : cat.title}</h3>
              <p className="text-xs text-ink-muted mt-1 line-clamp-2">{cat.desc}</p>
              <div className="mt-3 pt-2 border-t border-line/60 flex items-center justify-between text-[11px] font-medium text-chamber-700">
                <span>{cat.curePeriod}</span>
                {isSelected && <CheckCircle size={14} className="text-chamber-700" />}
              </div>
            </button>
          );
        })}
      </div>

      {/* ─── Main Workspace: Form (Left) & Document Preview (Right) ─ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Form Details (Hidden during print) */}
        <div className="print:hidden lg:col-span-5 space-y-4 rounded-2xl border border-line bg-surface p-5 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-line">
            <h2 className="font-serif font-bold text-lg text-ink flex items-center gap-2">
              <FileText size={18} className="text-chamber-700" />
              Notice Parameters
            </h2>
            <Badge variant="blue">{activeCategory.law.split(',')[0]}</Badge>
          </div>

          <div className="space-y-3.5 text-sm">
            {/* Sender */}
            <div className="p-3 rounded-xl bg-paper/60 border border-line space-y-2.5">
              <span className="text-xs font-semibold text-chamber-800 uppercase tracking-wider block">
                1. Sender (Your Details)
              </span>
              <FormField
                label="Your Full Name"
                type="text"
                name="senderName"
                value={formData.senderName || ''}
                onChange={handleChange}
              />
              <FormField
                label="Your Complete Address"
                as="textarea"
                rows={2}
                name="senderAddress"
                value={formData.senderAddress || ''}
                onChange={handleChange}
              />
              <FormField
                label="Phone / Mobile Number"
                type="text"
                name="senderPhone"
                value={formData.senderPhone || ''}
                onChange={handleChange}
              />
            </div>

            {/* Recipient */}
            <div className="p-3 rounded-xl bg-paper/60 border border-line space-y-2.5">
              <span className="text-xs font-semibold text-rose-700 uppercase tracking-wider block">
                2. Opposite Party (Defaulter)
              </span>
              <FormField
                label="Recipient / Defaulter Name"
                type="text"
                name="recipientName"
                value={formData.recipientName || ''}
                onChange={handleChange}
              />
              <FormField
                label="Recipient Complete Address"
                as="textarea"
                rows={2}
                name="recipientAddress"
                value={formData.recipientAddress || ''}
                onChange={handleChange}
              />
            </div>

            {/* Claim / Dispute Details */}
            <div className="p-3 rounded-xl bg-paper/60 border border-line space-y-2.5">
              <span className="text-xs font-semibold text-ink-muted uppercase tracking-wider block">
                3. Dispute Facts & Amounts
              </span>
              <div className="grid grid-cols-2 gap-2">
                <FormField
                  label="Claim Amount (₹)"
                  type="text"
                  name="amount"
                  value={formData.amount || ''}
                  onChange={handleChange}
                  className="font-semibold text-chamber-800"
                />
                <FormField
                  label="Notice Issue Date"
                  type="date"
                  name="noticeDate"
                  value={formData.noticeDate || ''}
                  onChange={handleChange}
                />
              </div>

              {selectedCatId === 'cheque_bounce' && (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    <FormField
                      label="Cheque Number"
                      type="text"
                      name="chequeNumber"
                      value={formData.chequeNumber || ''}
                      onChange={handleChange}
                    />
                    <FormField
                      label="Cheque Date"
                      type="date"
                      name="chequeDate"
                      value={formData.chequeDate || ''}
                      onChange={handleChange}
                    />
                  </div>
                  <FormField
                    label="Drawn Bank & Branch"
                    type="text"
                    name="bankName"
                    value={formData.bankName || ''}
                    onChange={handleChange}
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <FormField
                      label="Return Memo Date"
                      type="date"
                      name="memoDate"
                      value={formData.memoDate || ''}
                      onChange={handleChange}
                    />
                    <FormField
                      label="Bank Reason"
                      type="text"
                      name="returnReason"
                      value={formData.returnReason || ''}
                      onChange={handleChange}
                    />
                  </div>
                </>
              )}

              {selectedCatId === 'security_deposit' && (
                <>
                  <FormField
                    label="Tenancy Property Address"
                    type="text"
                    name="tenancyAddress"
                    value={formData.tenancyAddress || ''}
                    onChange={handleChange}
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <FormField
                      label="Handover Date"
                      type="date"
                      name="handoverDate"
                      value={formData.handoverDate || ''}
                      onChange={handleChange}
                    />
                    <FormField
                      label="Agreement Date"
                      type="date"
                      name="agreementDate"
                      value={formData.agreementDate || ''}
                      onChange={handleChange}
                    />
                  </div>
                </>
              )}

              {selectedCatId === 'unpaid_salary' && (
                <div className="grid grid-cols-2 gap-2">
                  <FormField
                    label="Your Designation"
                    type="text"
                    name="designation"
                    value={formData.designation || ''}
                    onChange={handleChange}
                  />
                  <FormField
                    label="Unpaid Months"
                    type="text"
                    name="unpaidMonths"
                    value={formData.unpaidMonths || ''}
                    onChange={handleChange}
                  />
                </div>
              )}

              {selectedCatId === 'consumer_refund' && (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    <FormField
                      label="Invoice Number"
                      type="text"
                      name="invoiceNumber"
                      value={formData.invoiceNumber || ''}
                      onChange={handleChange}
                    />
                    <FormField
                      label="Purchase Date"
                      type="date"
                      name="purchaseDate"
                      value={formData.purchaseDate || ''}
                      onChange={handleChange}
                    />
                  </div>
                  <FormField
                    label="Defect / Problem Description"
                    type="text"
                    name="defectDetails"
                    value={formData.defectDetails || ''}
                    onChange={handleChange}
                  />
                </>
              )}

              <FormField
                label="Advocate / Authorized Representative"
                type="text"
                name="advocateName"
                value={formData.advocateName || ''}
                onChange={handleChange}
                className="text-ink-muted"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Court Paper Document Live Preview */}
        <div className="lg:col-span-7 space-y-4">
          {/* Action Toolbar (Hidden during print) */}
          <div className="print:hidden flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl border border-line bg-surface shadow-sm">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-ink-muted">Document Output:</span>
              <Badge variant="emerald">{lang === 'hi' ? 'विधिक हिन्दी' : 'High Court Legal English'}</Badge>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-xs font-medium text-ink hover:bg-paper transition-colors"
              >
                {copied ? <CheckCircle size={14} className="text-emerald-600" /> : <Copy size={14} />}
                {copied ? 'Copied!' : 'Copy Text'}
              </button>
              <button
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 rounded-lg bg-chamber-700 hover:bg-chamber-800 text-white px-3.5 py-1.5 text-xs font-semibold shadow transition-colors"
              >
                <Printer size={14} /> Print / Save PDF
              </button>
            </div>
          </div>

          {/* Actual Legal Document (Simulated A4 Court Paper) */}
          <div
            id="legal-notice-document"
            className="relative bg-white text-black p-8 sm:p-12 rounded-xl border border-stone-300 shadow-xl font-serif text-[13px] leading-relaxed select-text print:border-none print:shadow-none print:p-0 print:m-0"
            style={{ minHeight: '800px' }}
          >
            {/* Watermark Ribbon */}
            <div className="absolute top-4 right-4 text-[10px] font-sans font-semibold tracking-widest text-stone-400 uppercase border border-stone-300 px-2.5 py-1 rounded">
              FORMAL STATUTORY NOTICE
            </div>

            {/* Document Content */}
            <pre className="whitespace-pre-wrap font-serif text-stone-900 leading-6 text-[13.5px]">
              {noticeText}
            </pre>

            {/* Speed Post Instructions Box (Hidden during print) */}
            <div className="print:hidden mt-8 pt-6 border-t-2 border-dashed border-stone-300 font-sans text-xs text-stone-600 bg-stone-50 p-4 rounded-lg">
              <h4 className="font-bold text-stone-800 flex items-center gap-1.5 mb-1.5">
                <AlertTriangle size={15} className="text-amber-600" />
                Dispatch & Evidence Instructions (For Court Admissibility)
              </h4>
              <ul className="list-disc list-inside space-y-1 text-stone-600">
                <li>Print 2 copies: Sign both. Send one copy to the recipient via <strong>Speed Post with A.D.</strong></li>
                <li>Keep the post office postal dispatch receipt and consignment tracking sheet safely.</li>
                <li>The statutory 15-day countdown begins from the date the delivery report marks <em>"Item Delivered"</em>.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
