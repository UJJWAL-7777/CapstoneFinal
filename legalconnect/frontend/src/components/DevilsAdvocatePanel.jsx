import { useState } from 'react';
import {
  Swords,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  FileText,
  Copy,
  CheckCircle2,
  XCircle,
  Flame,
  Scale,
} from 'lucide-react';
import Badge from './ui/Badge.jsx';

export default function DevilsAdvocatePanel({
  category,
  formData,
  lang = 'en',
  onClose,
}) {
  const [copied, setCopied] = useState(false);
  const [advocateLang, setAdvocateLang] = useState(lang); // 'en' | 'hi'

  // Dynamic calculation of Notice Strength
  const calculateStrength = () => {
    let score = 70;
    if (formData.senderName && formData.senderAddress && formData.senderPhone) score += 6;
    if (formData.recipientName && formData.recipientAddress) score += 6;
    if (formData.amount) score += 5;
    if (formData.advocateName && formData.advocateName.length > 5) score += 5;
    if (category.id === 'cheque_bounce' && formData.chequeNumber && formData.memoDate) score += 8;
    if (category.id === 'security_deposit' && formData.handoverDate && formData.agreementDate) score += 8;
    if (category.id === 'unpaid_salary' && formData.designation && formData.unpaidMonths) score += 8;
    if (category.id === 'consumer_refund' && formData.invoiceNumber && formData.defectDetails) score += 8;
    return Math.min(score, 94); // Cap at 94% because opponent always has legal defenses!
  };

  const strengthScore = calculateStrength();

  // ─── Opponent Simulated Legal Rebuttal Replies ───────────────────
  const getSimulatedReply = () => {
    const today = new Date().toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    if (category.id === 'cheque_bounce') {
      if (advocateLang === 'hi') {
        return `रजिस्ट्री डाक द्वारा / स्पीड पोस्ट (पावती सहित)
जवाबी विधिक सूचना (प्रति-उत्तर)
बनाम: धारा 138 पराक्रम्य लिखत अधिनियम के तहत आपकी विधिक सूचना दिनांक ${formData.noticeDate || 'हालिया'}

दिनांक: ${today}

सेवा में,
${formData.senderName || '[शिकायतकर्ता]'}
मार्फत: ${formData.advocateName || 'विद्वान अधिवक्ता'}
पता: ${formData.senderAddress || '[शिकायतकर्ता का पता]'}

महोदय,

मेरे मुवक्किल श्री ${formData.recipientName || '[विपक्षी / आहरक]'} के स्पष्ट निर्देशों के तहत, मैं आपकी कथित विधिक सूचना का बिंदुवार प्रति-उत्तर प्रेषित करता हूँ:

1. यह कि आपकी कथित सूचना पूर्णतः निराधार, भ्रामक, दुर्भावनापूर्ण एवं न्यायिक प्रक्रिया का दुरुपयोग है। मेरे मुवक्किल पर आपका कोई भी वैध अथवा विधिक रूप से प्रवर्तनीय ऋण (Legally Enforceable Debt) बकाया नहीं है।

2. यह कि चेक संख्या ${formData.chequeNumber || 'XXXXXX'}, राशि ₹${formData.amount || '0'}/-, मेरे मुवक्किल द्वारा किसी वर्तमान ऋण के भुगतान हेतु जारी नहीं किया गया था, अपितु इसे व्यापारिक बातचीत के दौरान केवल एक "सुरक्षा गारंटी (Security Cheque)" के रूप में अप्रमाणित रूप से सौंपा गया था।

3. यह कि आपके मुवक्किल ने आपसी हिसाब-किताब का अंतिम निपटारा किए बिना, दुर्भावनापूर्वक एवं विश्वासघात करते हुए उक्त सुरक्षा चेक को बैंक में प्रस्तुत किया है।

4. यह कि आपके द्वारा कथित सूचना बैंक रिटर्न मेमो की प्राप्ति के 30 दिनों की वैधानिक अवधि के पश्चात प्रेषित की गई प्रतीत होती है, जिससे यह परिवाद धारा 138(b) एन.आई. एक्ट के तहत कालबाधित (Time-Barred) है।

चेतावनी:
अतः आपको निर्देशित किया जाता है कि आप अपनी यह दुर्भावनापूर्ण विधिक सूचना अविलंब वापस लें। यदि आप कोई मिथ्या आपराधिक परिवाद दायर करते हैं, तो मेरे मुवक्किल आपके विरुद्ध भारतीय न्याय संहिता (BNS) की धारा 236/211 (झूठा आरोप) तथा मानहानि का दीवानी दावा (क्षतिपूर्ति ₹10,00,000/-) दायर करेंगे।

भवदीय,
आर. के. सिंघानिया, वरिष्ठ अधिवक्ता
उच्च न्यायालय बार एसोसिएशन
(विपक्षी की ओर से)`;
      }

      return `BY REGISTERED POST WITH A.D. & SPEED POST
FORMAL LEGAL REBUTTAL & REPLY NOTICE
IN RESPONSE TO NOTICE UNDER SECTION 138 NEGOTIABLE INSTRUMENTS ACT, 1881

Date: ${today}

TO:
${formData.senderName || '[Complainant Name]'}
Through: ${formData.advocateName || 'Counsel for Complainant'}
Address: ${formData.senderAddress || '[Complainant Address]'}

Sir / Madam,

Under instructions from and on behalf of my client, ${formData.recipientName || 'Respondent'}, residing at ${formData.recipientAddress || 'Respondent Address'}, I hereby serve this comprehensive Rebuttal and Reply to your Legal Demand Notice dated ${formData.noticeDate || 'recent'}:

1. ABSOLUTE DENIAL OF SUBSISTING DEBT:
Each and every allegation and demand raised in your notice is unequivocally denied. My client specifically denies having any subsisting, crystallized, or legally enforceable debt or liability towards your client for ₹${formData.amount || '0'}/-.

2. SECURITY INSTRUMENT DEFENSE (REBUTTAL OF SECTION 139 PRESUMPTION):
Cheque No. ${formData.chequeNumber || 'XXXXXX'} drawn on ${formData.bankName || 'Bank'} was handed over strictly as an undated "Security Guarantee" in good faith towards an incomplete contractual arrangement. Your client had no legal mandate or authority to present this instrument for clearance without prior reconciliation of accounts. The statutory presumption under Section 139 of the Negotiable Instruments Act stands decisively rebutted.

3. STATUTORY LIMITATION BAR UNDER SECTION 138(b):
Your notice fails to demonstrate with documentary dispatch proof that it was issued within the mandatory 30-day statutory limitation window from the date of receipt of the bank return memo dated ${formData.memoDate || 'recent'}. Any complaint filed on the basis of a belated notice is inherently non-maintainable and liable to be dismissed in limine.

4. COUNTER-ALLEGATION OF CRIMINAL BREACH OF TRUST:
By presenting an unliquidated security instrument, your client has committed criminal breach of trust. My client is initiating an inquiry before the competent police authorities.

TAKE NOTICE that you are hereby called upon to immediately withdraw your frivolous notice. Should your client drag my client into frivolous criminal litigation, my client shall defend the same at your client's sole peril and file a counter-suit for malicious prosecution and damages of ₹10,00,000/- (Rupees Ten Lakhs Only).

Yours faithfully,

R. K. Singhania & Associates
Senior Advocates & Legal Consultants
Counsel for the Respondent`;
    }

    if (category.id === 'security_deposit') {
      return `BY REGISTERED A.D. POST
FORMAL REPLY TO LEGAL NOTICE FOR TENANCY SECURITY DEPOSIT
REF: NOTICE DATED ${formData.noticeDate || 'RECENT'}

Date: ${today}

TO:
${formData.senderName || '[Tenant Name]'}
${formData.senderAddress || '[Address]'}

Sir / Madam,

Under instructions from my client, ${formData.recipientName || '[Landlord Name]'}, owner of premises ${formData.tenancyAddress || '[Rented Premises]'}, this reply is issued to your notice claiming ₹${formData.amount || '0'}/-:

1. DENIAL OF HANDOVER IN GOOD CONDITION:
It is denied that you vacated and handed over the premises in clean, prime, or tenantable condition on ${formData.handoverDate || 'recent'}. Upon joint physical inspection, extensive structural and fixture damages were uncovered, including unpainted walls with drilled punctures, broken sanitary fittings, and damaged electrical panels.

2. LEGITIMATE ADJUSTMENT OF SECURITY DEPOSIT:
Under Clause 14 of the Tenancy Agreement dated ${formData.agreementDate || 'recent'}, the security deposit is subject to deduction against repair of damages and unpaid utility dues. An independent contractor has assessed the repair cost at ₹58,000/-, alongside pending society electricity and water maintenance charges of ₹14,200/-.

3. COUNTER-DEMAND FOR EXCESS REPAIR EXPENSES:
After adjusting your security deposit of ₹${formData.amount || '0'}/-, a net shortfall of ₹12,200/- remains payable by you to my client towards restoration of the premises.

You are hereby advised to withdraw your baseless notice and remit the balance damages of ₹12,200/- within 15 days, failing which my client shall proceed with civil recovery before the Competent Civil Court.

Yours truly,

M. S. Aggarwal
Advocate, High Court Bar
Counsel for the Landlord`;
    }

    if (category.id === 'unpaid_salary') {
      return `BY EMAIL & SPEED POST
REPLY TO STATUTORY WAGE DEMAND NOTICE
REF: YOUR NOTICE DATED ${formData.noticeDate || 'RECENT'}

Date: ${today}

TO:
${formData.senderName || '[Former Employee]'}
Designation: ${formData.designation || 'Former Employee'}
${formData.senderAddress || '[Address]'}

Sir,

This reply is issued on behalf of the Management of ${formData.recipientName || 'The Company'}:

1. ABSCONDING AND FAILURE OF NOTICE PERIOD HANDOVER:
Your assertion of wrongful withholding of salary for ${formData.unpaidMonths || 'the disputed period'} is denied. As per your Employment Contract, you were bound to serve a full notice period following your resignation dated ${formData.resignationDate || 'recent'}. You unilaterally ceased reporting to duties without executing an orderly project knowledge transfer, causing severe operational disruptions to our overseas client deliverables.

2. UNRETURNED COMPANY ASSETS & DATA SECURITY AUDIT:
The company's Full & Final (FnF) settlement is strictly conditional upon obtaining formal IT asset clearance. To date, you have failed to return the encrypted security token and company laptop in verified operating condition, prompting a pending internal security audit.

3. SHORTFALL ADJUSTMENT:
The notice period shortfall of 45 days amounts to ₹${formData.amount || '0'}/-, which has been lawfully adjusted in accordance with Clause 8 of your Appointment Terms.

No dues remain payable to you. We advise you to complete asset handover to avoid formal legal proceedings for recovery of commercial damages.

Yours faithfully,

Legal & Compliance Cell
On behalf of Management`;
    }

    // Consumer Refund default
    return `REGISTERED RESPONSE TO CONSUMER DEMAND NOTICE
REF: NOTICE DATED ${formData.noticeDate || 'RECENT'} REGARDING INVOICE NO: ${formData.invoiceNumber || 'INV-001'}

Date: ${today}

TO:
${formData.senderName || '[Consumer Name]'}
${formData.senderAddress || '[Address]'}

Sir / Madam,

On behalf of ${formData.recipientName || 'Retailer / Manufacturer'}, we formally reply to your notice alleging deficiency in service and defective product:

1. COMPLIANCE WITH WARRANTY TERMS:
The product purchased on ${formData.purchaseDate || 'recent'} under Invoice ${formData.invoiceNumber || 'XXXX'} was delivered in pristine, factory-sealed condition. Our authorized technical service inspection confirmed that the reported issue (${formData.defectDetails || 'defects'}) arose from electrical surge / improper handling outside recommended operational specifications, which is expressly excluded under Section 4 of the Limited Warranty Policy.

2. READY OFFER OF REPAIR:
Notwithstanding the out-of-warranty cause, our service team offered to replace defective internal components at subsidized rates as a gesture of goodwill, which you arbitrarily rejected while demanding an unlawful full refund.

3. UNFOUNDED COMPENSATION CLAIMS:
Your demand for ₹${formData.amount || '0'}/- refund and ₹25,000/- for alleged mental agony is exorbitant, speculative, and without legal sanction under Section 35 of the Consumer Protection Act, 2019.

Should you file a complaint before the Consumer Commission (e-Daakhil), we shall produce the authorized technical diagnostic logs and claim exemplary legal costs under Section 38(9).

Yours sincerely,

Grievance Redressal Legal Team
Authorized Signatory`;
  };

  // ─── Vulnerabilities & Loopholes Identified ───────────────────────
  const getVulnerabilities = () => {
    if (category.id === 'cheque_bounce') {
      return [
        {
          id: 'v1',
          severity: 'HIGH',
          title: 'The "Security Cheque" Defense (Rebutting Section 139)',
          opponentArgument:
            'Opponent will argue: "The cheque was handed over as an undated security token during preliminary dealings, not towards any crystallized existing debt."',
          statutoryRisk:
            'Supreme Court in Indus Airways (2014) & Dashrathbhai Trikambhai (2022) held that a cheque issued for unaccrued liability cannot attract Section 138.',
          preemptiveFix:
            'Before filing complaint, ensure you have an invoice, signed ledger account, or promissory note proving the debt was due on or before the cheque date.',
        },
        {
          id: 'v2',
          severity: 'CRITICAL',
          title: 'Strict 30-Day Limitation Bar (Section 138 proviso b)',
          opponentArgument:
            'Opponent will challenge the exact calendar date you received the bank return memo, alleging your notice was sent beyond the 30-day statutory limit.',
          statutoryRisk:
            'A single day delay beyond 30 days destroys criminal jurisdiction under Section 138; magistrate cannot condone pre-notice delay.',
          preemptiveFix:
            'Keep the original stamped bank memo. If delivered via post/app, download the official bank timestamp advice sheet.',
        },
        {
          id: 'v3',
          severity: 'MEDIUM',
          title: 'Proof of Delivery & 15-Day Cure Period Tracking',
          opponentArgument:
            'Opponent will claim: "Notice was never served on me / address is incorrect / case was filed before statutory 15 days expired."',
          statutoryRisk:
            'Under C.C. Alavi Haji (2007), presumption of service under Section 27 General Clauses Act applies only if correct address & Speed Post receipt are proven.',
          preemptiveFix:
            'Always dispatch via Speed Post with A.D. Download the official India Post consignment tracking report showing "Item Delivered" before counting the 15 days.',
        },
      ];
    }

    if (category.id === 'security_deposit') {
      return [
        {
          id: 'v1',
          severity: 'HIGH',
          title: 'Unliquidated Property Damage & Maintenance Counter-Claim',
          opponentArgument:
            'Landlord will allege: "Tenant damaged fixtures, left walls scratched, and owes utility bills exceeding the deposit."',
          statutoryRisk:
            'In civil court, landlords routinely submit repair invoices to prolong recovery proceedings and force compromise.',
          preemptiveFix:
            'Attach signed Move-Out Handover Form, timestamped photos/videos of every room on handover day, and no-dues receipts from the society office.',
        },
        {
          id: 'v2',
          severity: 'MEDIUM',
          title: 'Contractual Notice Period Dispute',
          opponentArgument:
            'Landlord will claim: "Tenant failed to serve mandatory 1 or 2 months written notice under the agreement, so deposit is forfeited as notice pay."',
          statutoryRisk:
            'Rent agreements often contain a forfeiture clause for premature exit without notice.',
          preemptiveFix:
            'Quote the exact date of your initial WhatsApp / Email move-out notification to prove compliance with the contractual notice period.',
        },
      ];
    }

    if (category.id === 'unpaid_salary') {
      return [
        {
          id: 'v1',
          severity: 'HIGH',
          title: 'Asset Clearance & Non-Compete Counter-Threat',
          opponentArgument:
            'Employer will claim: "Employee did not complete knowledge transfer, kept confidential files, or caused financial loss."',
          statutoryRisk:
            'Under Payment of Wages Act, authorized deductions for damages require formal departmental inquiry; however, companies use it to delay FnF.',
          preemptiveFix:
            'Attach your IT asset return receipt, official manager handover sign-off email, and resignation acceptance confirmation.',
        },
        {
          id: 'v2',
          severity: 'MEDIUM',
          title: 'Workman vs Managerial Definition under Labour Laws',
          opponentArgument:
            'Employer will argue you fall under "Managerial / Administrative" capacity, barring access to Labour Conciliation Officer.',
          statutoryRisk:
            'If your basic salary and duties are supervisory, you may need to file a Civil Summary Suit (Order 37 CPC) rather than Labour Court complaint.',
          preemptiveFix:
            'Draft claim under both Payment of Wages Act and Civil Summary Procedure to safeguard recovery avenues.',
        },
      ];
    }

    // Consumer Refund
    return [
      {
        id: 'v1',
        severity: 'HIGH',
        title: 'Warranty Exclusion: "Customer Misuse / Liquid Damage"',
        opponentArgument:
          'Seller/Manufacturer will allege: "Defect was caused by improper voltage surge, physical drop, or unapproved third-party service."',
        statutoryRisk:
          'Under Consumer Protection Act 2019, burden of proving defect initially rests on complainant unless an expert laboratory report is produced.',
        preemptiveFix:
          'Retain the Authorized Service Center job sheet stating "hardware failure" rather than customer-induced fault.',
      },
      {
        id: 'v2',
        severity: 'MEDIUM',
        title: 'Manufacturer vs Retailer Liability Shifting',
        opponentArgument:
          'Retailer will say: "We are only retail distributors; claim must be filed against the brand manufacturer, not us."',
        statutoryRisk:
          'Product Liability under Section 83 CPA 2019 holds manufacturers liable, but retailers are exempt unless they altered the product.',
        preemptiveFix:
          'Issue notice jointly to BOTH the retail platform/store AND the parent manufacturer as Co-Opponents.',
      },
    ];
  };

  const vulnerabilities = getVulnerabilities();
  const simulatedReply = getSimulatedReply();

  const handleCopy = () => {
    navigator.clipboard.writeText(simulatedReply);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* ─── Hero Intelligence Header ───────────────────────────────── */}
      <div className="rounded-2xl bg-gradient-to-br from-[#1C0F0E] via-[#2A1513] to-[#120B0B] border border-rose-900/50 p-6 text-white shadow-xl relative overflow-hidden">
        {/* Ambient red flare */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/20 px-3 py-1 text-xs font-bold text-rose-300 border border-rose-500/30">
                <Swords size={13} className="text-rose-400" /> Adversarial AI • Devil's Advocate Engine
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 px-2.5 py-0.5 text-[11px] font-semibold text-amber-300 border border-amber-500/30">
                <Flame size={12} /> Red-Team Simulation
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-white flex items-center gap-2">
              Opponent Rebuttal Simulator & Vulnerability Audit
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-rose-200/80 max-w-2xl leading-relaxed">
              Before sending your notice, our AI assumes the role of ruthless opposing senior counsel.
              It anticipates defenses, tests legal loopholes, and drafts the exact counter-notice you will face.
            </p>
          </div>

          {/* Strength Score Card */}
          <div className="shrink-0 flex items-center gap-4 bg-black/40 border border-rose-800/40 rounded-xl p-4">
            <div className="text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-300/80 block">
                Notice Strength
              </span>
              <div className="text-3xl font-extrabold font-serif text-white flex items-baseline justify-center gap-0.5 mt-0.5">
                <span className={strengthScore >= 85 ? 'text-emerald-400' : 'text-amber-400'}>
                  {strengthScore}%
                </span>
              </div>
              <span className="text-[10px] text-zinc-400">
                {strengthScore >= 85 ? 'High Court Ready' : 'Moderate Loopholes'}
              </span>
            </div>
            <div className="w-px h-10 bg-rose-800/40" />
            <div className="text-left text-xs space-y-1">
              <div className="flex items-center gap-1.5 text-rose-300">
                <ShieldAlert size={14} />
                <span className="font-semibold">{vulnerabilities.length} Loopholes Flagged</span>
              </div>
              <div className="flex items-center gap-1.5 text-zinc-400">
                <Scale size={14} />
                <span>Statutory Bar Tested</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Loopholes & Strategic Counter-Measures ─────────────────── */}
      <div className="rounded-2xl border border-line dark:border-[#28443E] bg-surface dark:bg-[#13221E] p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-line dark:border-[#28443E]">
          <div>
            <h3 className="font-serif font-bold text-base sm:text-lg text-ink dark:text-white flex items-center gap-2">
              <AlertTriangle size={18} className="text-amber-500" />
              Identified Legal Loopholes & Opponent Attack Points
            </h3>
            <p className="text-xs text-ink-muted dark:text-[#CBDAD5] mt-0.5">
              Judges and magistrates scrutinize these specific areas when deciding interim relief or issuing summons.
            </p>
          </div>
          <Badge variant="amber">Audit Findings</Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {vulnerabilities.map((v, i) => (
            <div
              key={v.id}
              className="rounded-xl border border-line dark:border-[#28443E] bg-paper dark:bg-[#182C27] p-4 flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded tracking-wider ${
                      v.severity === 'CRITICAL'
                        ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                        : 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30'
                    }`}
                  >
                    {v.severity} VULNERABILITY #{i + 1}
                  </span>
                </div>
                <h4 className="font-bold text-sm text-ink dark:text-white leading-snug">{v.title}</h4>

                {/* Opponent's Attack */}
                <div className="mt-2.5 p-2.5 rounded-lg bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200/60 dark:border-rose-900/40 text-xs text-rose-900 dark:text-rose-200 leading-relaxed">
                  <div className="font-semibold text-rose-700 dark:text-rose-400 mb-0.5 flex items-center gap-1">
                    <XCircle size={13} /> Opponent Argument:
                  </div>
                  {v.opponentArgument}
                </div>

                {/* Statutory Precedent */}
                <p className="mt-2 text-[11px] text-ink-muted dark:text-[#A7BFB8] italic leading-relaxed">
                  ⚖️ {v.statutoryRisk}
                </p>
              </div>

              {/* Preemptive Fix */}
              <div className="pt-2.5 border-t border-line/60 dark:border-[#28443E] text-xs">
                <span className="font-semibold text-chamber-700 dark:text-emerald-400 flex items-center gap-1 mb-1">
                  <ShieldCheck size={14} /> Recommended Action:
                </span>
                <p className="text-ink dark:text-[#D1E0DC] text-[11.5px] leading-relaxed">
                  {v.preemptiveFix}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Simulated Opponent Reply Notice (The Counter-Document) ──── */}
      <div className="rounded-2xl border border-line dark:border-[#28443E] bg-surface dark:bg-[#13221E] p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-line dark:border-[#28443E]">
          <div>
            <h3 className="font-serif font-bold text-base sm:text-lg text-ink dark:text-white flex items-center gap-2">
              <FileText size={18} className="text-rose-600 dark:text-rose-400" />
              Simulated Opponent Advocate Legal Reply Notice
            </h3>
            <p className="text-xs text-ink-muted dark:text-[#CBDAD5] mt-0.5">
              This is the exact formal legal reply you will receive by Speed Post from the respondent's counsel.
            </p>
          </div>

          {/* Controls: Language & Copy */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex rounded-lg bg-paper dark:bg-[#182C27] border border-line dark:border-[#28443E] p-0.5 text-xs">
              <button
                onClick={() => setAdvocateLang('en')}
                className={`px-2.5 py-1 rounded font-medium transition-all ${
                  advocateLang === 'en'
                    ? 'bg-rose-700 text-white shadow-sm'
                    : 'text-ink-muted dark:text-zinc-300 hover:text-ink'
                }`}
              >
                English Reply
              </button>
              <button
                onClick={() => setAdvocateLang('hi')}
                className={`px-2.5 py-1 rounded font-medium transition-all ${
                  advocateLang === 'hi'
                    ? 'bg-rose-700 text-white shadow-sm'
                    : 'text-ink-muted dark:text-zinc-300 hover:text-ink'
                }`}
              >
                हिन्दी प्रति-उत्तर
              </button>
            </div>

            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 rounded-lg border border-line dark:border-[#28443E] px-3 py-1.5 text-xs font-semibold text-ink dark:text-[#E2ECE8] hover:bg-paper dark:hover:bg-[#1A2C27] transition-colors"
            >
              {copied ? <CheckCircle2 size={14} className="text-emerald-500" /> : <Copy size={14} />}
              {copied ? 'Copied!' : 'Copy Reply'}
            </button>
          </div>
        </div>

        {/* Counter Document Paper */}
        <div className="rounded-xl border border-rose-300/60 dark:border-rose-900/40 bg-rose-50/20 dark:bg-[#0D1413] p-6 sm:p-8 font-serif text-[13px] leading-relaxed relative select-text shadow-inner">
          <div className="absolute top-4 right-4 bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20 text-[10px] font-sans font-extrabold uppercase px-2.5 py-1 rounded tracking-wider">
            ADVERSARIAL COUNTER-NOTICE
          </div>

          <pre className="whitespace-pre-wrap font-serif text-ink dark:text-[#E2ECE8] leading-6 text-[13px]">
            {simulatedReply}
          </pre>
        </div>
      </div>

      {/* ─── Mandatory Pre-Dispatch Evidence Annexure Checklist ─────── */}
      <div className="rounded-2xl border border-line dark:border-[#28443E] bg-surface dark:bg-[#13221E] p-5 sm:p-6 shadow-sm">
        <h4 className="font-serif font-bold text-sm sm:text-base text-ink dark:text-white flex items-center gap-2 mb-2">
          <ShieldCheck size={18} className="text-emerald-500" />
          Pre-Emptive Evidence Checklist (Attach Before Speed Post Dispatch)
        </h4>
        <p className="text-xs text-ink-muted dark:text-[#CBDAD5] mb-4">
          By physically attaching copies of these documents to your legal demand notice, you neutralize the opponent's
          defenses before they can even assert them.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="flex items-start gap-2 p-3 rounded-lg bg-paper dark:bg-[#182C27] border border-line dark:border-[#28443E]">
            <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-ink dark:text-white block">Speed Post Consignment Receipt & A.D.</span>
              <span className="text-ink-muted dark:text-[#A7BFB8]">
                Mandatory under General Clauses Act Sec 27 to prove delivery upon correct address.
              </span>
            </div>
          </div>

          <div className="flex items-start gap-2 p-3 rounded-lg bg-paper dark:bg-[#182C27] border border-line dark:border-[#28443E]">
            <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-ink dark:text-white block">Documentary Proof of Underlying Debt</span>
              <span className="text-ink-muted dark:text-[#A7BFB8]">
                Invoices, WhatsApp/Email demand trails, or signed agreements disproving the "security token" defense.
              </span>
            </div>
          </div>

          <div className="flex items-start gap-2 p-3 rounded-lg bg-paper dark:bg-[#182C27] border border-line dark:border-[#28443E]">
            <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-ink dark:text-white block">Bank Return Memo (Original)</span>
              <span className="text-ink-muted dark:text-[#A7BFB8]">
                Preserve the physical return slip bearing the bank's clearing seal for filing with the court complaint.
              </span>
            </div>
          </div>

          <div className="flex items-start gap-2 p-3 rounded-lg bg-paper dark:bg-[#182C27] border border-line dark:border-[#28443E]">
            <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-ink dark:text-white block">15-Day Cure Window Audit Log</span>
              <span className="text-ink-muted dark:text-[#A7BFB8]">
                Calculate day 1 strictly from the online postal tracking delivery date, not the dispatch date.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
