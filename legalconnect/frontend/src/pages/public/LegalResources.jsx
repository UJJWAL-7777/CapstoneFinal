import { useState, useMemo } from 'react';
import {
  BookOpen,
  ExternalLink,
  Search,
  Scale,
  Shield,
  Users,
  Landmark,
  FileText,
  Check,
  Copy,
  ArrowRight,
  Sparkles,
  Gavel,
  AlertCircle,
  Building2,
  Smartphone,
  Car,
  ShieldAlert,
  PhoneCall,
  CheckCircle2,
} from 'lucide-react';
import Badge from '../../components/ui/Badge.jsx';
import Button from '../../components/ui/Button.jsx';
import {
  CASE_CATEGORIES,
  LANDMARK_CASES,
  INCIDENT_STUDY_GUIDES,
} from '../../data/landmarkCasesData.js';

const STATUTORY_PORTALS = [
  {
    category: 'Free Legal Aid & Court Services',
    items: [
      {
        title: 'National Legal Services Authority (NALSA)',
        url: 'https://nalsa.gov.in/',
        desc: 'Free legal aid, legal advice, and Lok Adalat settlements for eligible citizens and marginalized sections under the Legal Services Authorities Act, 1987.',
        tag: 'Free Legal Aid',
      },
      {
        title: 'eCourts Services India',
        url: 'https://ecourts.gov.in/',
        desc: 'Official judicial portal to track case status, court orders, daily cause lists, and hearing dates across District & High Courts of India.',
        tag: 'Case Tracking',
      },
      {
        title: 'Supreme Court of India Official Portal',
        url: 'https://main.sci.gov.in/',
        desc: 'Access Supreme Court cause lists, judgment archives, case status, and constitutional bench reports.',
        tag: 'Apex Court',
      },
      {
        title: 'Bar Council of India',
        url: 'https://www.barcouncilofindia.org/',
        desc: 'Statutory body regulating legal practice in India; verify advocate registration and professional credentials.',
        tag: 'Advocate Verification',
      },
    ],
  },
  {
    category: 'Consumer, Cyber & Citizen Grievance Portals',
    items: [
      {
        title: 'e-Daakhil (National Consumer Disputes Portal)',
        url: 'https://edaakhil.nic.in/',
        desc: 'Online e-filing portal to register consumer complaints before District, State, and National Consumer Commissions without physical presence.',
        tag: 'Consumer Filing',
      },
      {
        title: 'National Cyber Crime Reporting Portal',
        url: 'https://cybercrime.gov.in/',
        desc: 'Official Ministry of Home Affairs portal to report financial cyber scams, online fraud, cyber stalking, and freeze siphoned funds (Helpline: 1930).',
        tag: 'Cyber Fraud (1930)',
      },
      {
        title: 'National Consumer Helpline (NCH)',
        url: 'https://consumerhelpline.gov.in/',
        desc: 'Lodge pre-litigation grievances against companies, e-commerce retailers, airlines, and banks (Toll-Free: 1915).',
        tag: 'Helpline 1915',
      },
      {
        title: 'Ministry of Labour & Employment Portal',
        url: 'https://labour.gov.in/',
        desc: 'Central labour portal for industrial disputes, minimum wages, and Payment of Gratuity Act provisions.',
        tag: 'Labour & Wages',
      },
    ],
  },
];

export default function LegalResources() {
  const [activeTab, setActiveTab] = useState('cases'); // 'cases' | 'sections' | 'portals'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedCaseId, setExpandedCaseId] = useState(LANDMARK_CASES[0]?.id || null);
  const [selectedIncidentId, setSelectedIncidentId] = useState(INCIDENT_STUDY_GUIDES[0]?.id || null);
  const [copiedCaseId, setCopiedCaseId] = useState(null);

  // Copy Citation Helper
  const handleCopyCitation = (citation, id) => {
    navigator.clipboard.writeText(citation);
    setCopiedCaseId(id);
    setTimeout(() => setCopiedCaseId(null), 2500);
  };

  // Filtered Landmark Cases
  const filteredCases = useMemo(() => {
    return LANDMARK_CASES.filter((c) => {
      const matchesCategory = selectedCategory === 'all' || c.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      if (!q) return matchesCategory;
      const matchesSearch =
        c.title.toLowerCase().includes(q) ||
        c.citation.toLowerCase().includes(q) ||
        c.headline.toLowerCase().includes(q) ||
        c.tags.some((t) => t.toLowerCase().includes(q)) ||
        c.statutesApplied.some((s) => s.toLowerCase().includes(q));
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  // Selected Incident Guide
  const activeIncident = useMemo(() => {
    return INCIDENT_STUDY_GUIDES.find((i) => i.id === selectedIncidentId) || INCIDENT_STUDY_GUIDES[0];
  }, [selectedIncidentId]);

  return (
    <div className="min-h-screen bg-paper dark:bg-[#0B1311] text-ink dark:text-[#E2ECE8] transition-colors py-10 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {/* ─── Hero Header ────────────────────────────────────────── */}
        <div className="mb-8 border-b border-line dark:border-[#1E332D] pb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-chamber-200 dark:border-emerald-800/60 bg-chamber-50 dark:bg-emerald-950/40 px-3 py-1 text-xs font-semibold text-chamber-700 dark:text-emerald-400 mb-3">
            <Landmark className="h-3.5 w-3.5" />
            Bharat Legal Study & Precedents Hub (विधिक अध्ययन केंद्र)
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-ink dark:text-white">
            Landmark Cases & Statutory Section Explorer
          </h1>
          <p className="mt-2 text-base text-ink-soft dark:text-[#9FB7B0] max-w-3xl">
            Explore India’s most historic Supreme Court precedents, study which sections of the new{' '}
            <strong className="text-chamber-700 dark:text-emerald-400">Bharatiya Nyaya Sanhita (BNS 2023)</strong> and statutory laws apply to real-world incidents, and access verified judicial portals.
          </p>

          {/* ─── Main 3-Tab Navigation ────────────────────────────── */}
          <div className="mt-6 flex flex-wrap gap-2">
            <button
              onClick={() => setActiveTab('cases')}
              className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all ${
                activeTab === 'cases'
                  ? 'bg-chamber-700 text-white shadow-md dark:bg-emerald-500 dark:text-gray-950'
                  : 'bg-white dark:bg-[#12201C] text-ink-soft dark:text-[#CBDAD5] border border-line dark:border-[#233833] hover:border-chamber-300'
              }`}
            >
              <Gavel className="h-4 w-4" />
              <span>1. Famous Landmark Cases ({LANDMARK_CASES.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('sections')}
              className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all ${
                activeTab === 'sections'
                  ? 'bg-chamber-700 text-white shadow-md dark:bg-emerald-500 dark:text-gray-950'
                  : 'bg-white dark:bg-[#12201C] text-ink-soft dark:text-[#CBDAD5] border border-line dark:border-[#233833] hover:border-chamber-300'
              }`}
            >
              <BookOpen className="h-4 w-4" />
              <span>2. Applied Sections & Study Guides ({INCIDENT_STUDY_GUIDES.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('portals')}
              className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all ${
                activeTab === 'portals'
                  ? 'bg-chamber-700 text-white shadow-md dark:bg-emerald-500 dark:text-gray-950'
                  : 'bg-white dark:bg-[#12201C] text-ink-soft dark:text-[#CBDAD5] border border-line dark:border-[#233833] hover:border-chamber-300'
              }`}
            >
              <ExternalLink className="h-4 w-4" />
              <span>3. Statutory Portals & Free Legal Aid</span>
            </button>
          </div>
        </div>

        {/* ─── TAB 1: LANDMARK CASES EXPLORER ─────────────────────── */}
        {activeTab === 'cases' && (
          <div className="space-y-6">
            {/* Search & Filter Bar */}
            <div className="rounded-xl border border-line dark:border-[#1E332D] bg-white dark:bg-[#101D19] p-4 shadow-sm">
              <div className="relative mb-4">
                <Search className="absolute left-3.5 top-3 h-4 w-4 text-ink-muted dark:text-[#6C857F]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by case name, citation, or topic (e.g. Arnesh Kumar, Puttaswamy, arrest, privacy, cheque bounce, 138, POSH)..."
                  className="w-full rounded-lg border border-line dark:border-[#2A443E] bg-paper dark:bg-[#0A1210] py-2.5 pl-10 pr-4 text-sm text-ink dark:text-white placeholder:text-ink-muted/60 dark:placeholder-[#6C857F] focus:border-chamber-500 focus:outline-none focus:ring-2 focus:ring-chamber-500/20"
                />
              </div>

              {/* Category Pills */}
              <div className="flex flex-wrap gap-1.5 items-center">
                <span className="text-xs font-semibold text-ink-muted dark:text-[#88A69E] mr-1">Categories:</span>
                {CASE_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-all ${
                      selectedCategory === cat.id
                        ? 'bg-chamber-100 text-chamber-800 dark:bg-emerald-900/60 dark:text-emerald-300 font-semibold border border-chamber-300 dark:border-emerald-700'
                        : 'bg-paper dark:bg-[#162723] text-ink-soft dark:text-[#B2C5BF] border border-transparent hover:border-line'
                    }`}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Cases List */}
            <div className="space-y-4">
              {filteredCases.length === 0 ? (
                <div className="rounded-xl border border-dashed border-line dark:border-[#233833] bg-white dark:bg-[#101D19] p-10 text-center">
                  <AlertCircle className="mx-auto h-8 w-8 text-amber-500 mb-2" />
                  <p className="text-sm font-semibold text-ink dark:text-white">No landmark cases match your search query.</p>
                  <p className="text-xs text-ink-muted mt-1">Try searching for keywords like "arrest", "privacy", "cheque", "notice", or "bail".</p>
                  <Button variant="outline" size="sm" className="mt-4" onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}>
                    Reset Search
                  </Button>
                </div>
              ) : (
                filteredCases.map((caseItem) => {
                  const isExpanded = expandedCaseId === caseItem.id;
                  const isCopied = copiedCaseId === caseItem.id;

                  return (
                    <div
                      key={caseItem.id}
                      className={`rounded-xl border transition-all ${
                        isExpanded
                          ? 'border-chamber-400 dark:border-emerald-600 bg-white dark:bg-[#101E1A] shadow-md ring-1 ring-chamber-400/20'
                          : 'border-line dark:border-[#1E332D] bg-white dark:bg-[#0E1A17] hover:border-chamber-300 dark:hover:border-emerald-700/60'
                      }`}
                    >
                      {/* Case Card Header */}
                      <div
                        onClick={() => setExpandedCaseId(isExpanded ? null : caseItem.id)}
                        className="cursor-pointer p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                      >
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-lg font-bold text-ink dark:text-white group-hover:text-chamber-700">
                              {caseItem.title}
                            </h3>
                            <Badge variant="outline" className="text-xs bg-chamber-50 dark:bg-emerald-950/40 text-chamber-700 dark:text-emerald-400 border-chamber-200 dark:border-emerald-800">
                              {caseItem.badge}
                            </Badge>
                            <span className="text-xs text-ink-muted dark:text-[#88A69E]">({caseItem.year})</span>
                          </div>
                          <p className="text-xs font-mono font-medium text-chamber-600 dark:text-emerald-400">
                            {caseItem.citation} • {caseItem.court}
                          </p>
                          <p className="text-sm text-ink-soft dark:text-[#B2C5BF] line-clamp-2 mt-1">
                            {caseItem.headline}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopyCitation(`${caseItem.title}, ${caseItem.citation}`, caseItem.id);
                            }}
                            title="Copy legal citation"
                            className="inline-flex items-center gap-1.5 rounded-lg border border-line dark:border-[#2A443E] bg-paper dark:bg-[#142320] px-2.5 py-1.5 text-xs font-medium text-ink-soft dark:text-[#CBDAD5] hover:border-chamber-400 transition-colors"
                          >
                            {isCopied ? (
                              <>
                                <Check className="h-3.5 w-3.5 text-emerald-500" />
                                <span className="text-emerald-600 dark:text-emerald-400">Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="h-3.5 w-3.5" />
                                <span>Copy Citation</span>
                              </>
                            )}
                          </button>
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-md transition-colors ${
                            isExpanded
                              ? 'bg-chamber-700 text-white dark:bg-emerald-500 dark:text-gray-950'
                              : 'bg-paper dark:bg-[#162723] text-ink-soft dark:text-[#CBDAD5]'
                          }`}>
                            {isExpanded ? 'Hide Brief ▲' : 'View Study Brief ▼'}
                          </span>
                        </div>
                      </div>

                      {/* Expanded Study Brief */}
                      {isExpanded && (
                        <div className="border-t border-line dark:border-[#1E332D] bg-chamber-50/20 dark:bg-[#0A1412] p-5 space-y-5 rounded-b-xl text-sm">
                          {/* Bench & Applied Statutes */}
                          <div className="grid gap-3 sm:grid-cols-2 text-xs">
                            <div className="rounded-lg border border-line dark:border-[#223B34] bg-white dark:bg-[#101E1A] p-3">
                              <span className="font-semibold text-ink-muted dark:text-[#88A69E] block mb-1">🏛️ Bench Details:</span>
                              <p className="text-ink dark:text-[#E2ECE8]">{caseItem.bench}</p>
                            </div>
                            <div className="rounded-lg border border-line dark:border-[#223B34] bg-white dark:bg-[#101E1A] p-3">
                              <span className="font-semibold text-ink-muted dark:text-[#88A69E] block mb-1">📜 Statutes & Sections Interpreted:</span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {caseItem.statutesApplied.map((st, i) => (
                                  <span key={i} className="rounded bg-paper dark:bg-[#1A2E28] px-2 py-0.5 text-[11px] font-mono text-chamber-700 dark:text-emerald-300">
                                    {st}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* 1. Background & Controversy */}
                          <div>
                            <h4 className="font-bold text-ink dark:text-white flex items-center gap-1.5 mb-1 text-sm">
                              <span>📖</span> Background & Controversy
                            </h4>
                            <p className="text-ink-soft dark:text-[#B2C5BF] leading-relaxed">
                              {caseItem.summary}
                            </p>
                          </div>

                          {/* 2. Legal Question */}
                          <div className="rounded-lg border-l-4 border-amber-500 bg-amber-50/50 dark:bg-amber-950/20 p-3.5">
                            <h4 className="font-bold text-amber-900 dark:text-amber-300 text-xs uppercase tracking-wider mb-1">
                              ⚖️ Core Question of Law Before Supreme Court
                            </h4>
                            <p className="text-xs font-semibold text-amber-950 dark:text-amber-100">
                              "{caseItem.legalQuestion}"
                            </p>
                          </div>

                          {/* 3. Historic Verdict & Ratio Decidendi */}
                          <div className="space-y-2">
                            <h4 className="font-bold text-ink dark:text-white flex items-center gap-1.5 text-sm">
                              <span>🏛️</span> Historic Verdict & Legal Principle (Ratio Decidendi)
                            </h4>
                            <div className="rounded-lg border border-chamber-200 dark:border-emerald-800/80 bg-white dark:bg-[#10201B] p-4 text-ink dark:text-[#E2ECE8] leading-relaxed">
                              <p className="font-medium text-chamber-900 dark:text-emerald-200 mb-2">
                                {caseItem.verdict}
                              </p>
                              <div className="border-t border-line dark:border-[#223B34] pt-2 text-xs italic text-ink-muted dark:text-[#88A69E]">
                                <strong>Ratio Decidendi:</strong> "{caseItem.ratioDecidendi}"
                              </div>
                            </div>
                          </div>

                          {/* 4. Real-world Impact & How You Can Cite */}
                          <div className="rounded-lg border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/40 dark:bg-emerald-950/30 p-3.5">
                            <h4 className="font-bold text-emerald-800 dark:text-emerald-300 text-xs uppercase tracking-wider mb-1 flex items-center gap-1">
                              <Sparkles className="h-3.5 w-3.5" />
                              How You Can Use & Cite This Today:
                            </h4>
                            <p className="text-xs text-emerald-950 dark:text-emerald-100 font-medium leading-relaxed">
                              {caseItem.howToCite}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* ─── TAB 2: APPLIED SECTIONS & INCIDENT STUDY GUIDES ───── */}
        {activeTab === 'sections' && (
          <div className="space-y-6">
            {/* Scenario Selector Ribbon */}
            <div className="rounded-xl border border-line dark:border-[#1E332D] bg-white dark:bg-[#101D19] p-4 shadow-sm">
              <label className="block text-xs font-semibold text-ink-muted dark:text-[#88A69E] mb-2 uppercase tracking-wider">
                Select a Real-World Scenario to Study Applicable Sections:
              </label>
              <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-6">
                {INCIDENT_STUDY_GUIDES.map((inc) => (
                  <button
                    key={inc.id}
                    onClick={() => setSelectedIncidentId(inc.id)}
                    className={`rounded-lg p-3 text-left transition-all border ${
                      selectedIncidentId === inc.id
                        ? 'border-chamber-500 dark:border-emerald-500 bg-chamber-50 dark:bg-emerald-950/50 shadow-sm ring-1 ring-chamber-500 dark:ring-emerald-500'
                        : 'border-line dark:border-[#233833] bg-paper dark:bg-[#0D1815] hover:border-chamber-300'
                    }`}
                  >
                    <span className="text-xl block mb-1">{inc.icon}</span>
                    <h4 className="text-xs font-bold text-ink dark:text-white line-clamp-2">{inc.title}</h4>
                  </button>
                ))}
              </div>
            </div>

            {/* Active Incident Study Article */}
            <div className="rounded-xl border border-line dark:border-[#1E332D] bg-white dark:bg-[#101D19] p-6 shadow-sm space-y-6">
              {/* Header */}
              <div className="border-b border-line dark:border-[#1E332D] pb-4">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="text-2xl">{activeIncident.icon}</span>
                  <h2 className="text-2xl font-bold text-ink dark:text-white">{activeIncident.title}</h2>
                  <Badge variant="outline" className="text-xs bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800">
                    {activeIncident.badge}
                  </Badge>
                </div>
                <p className="text-sm text-ink-soft dark:text-[#B2C5BF]">{activeIncident.description}</p>

                {/* Practical Scenario Card */}
                <div className="mt-4 rounded-lg border-l-4 border-chamber-600 dark:border-emerald-400 bg-paper dark:bg-[#0C1613] p-4 text-xs">
                  <strong className="text-chamber-800 dark:text-emerald-300 uppercase tracking-wider block mb-1">
                    📌 Example Scenario:
                  </strong>
                  <p className="text-ink dark:text-[#E2ECE8] italic font-medium leading-relaxed">
                    "{activeIncident.scenario}"
                  </p>
                </div>
              </div>

              {/* Statutory Sections Table */}
              <div>
                <h3 className="text-base font-bold text-ink dark:text-white mb-3 flex items-center gap-2">
                  <Scale className="h-4 w-4 text-chamber-600 dark:text-emerald-400" />
                  All Applicable Statutory Sections (New BNS 2023 & Special Acts)
                </h3>

                <div className="overflow-x-auto rounded-lg border border-line dark:border-[#233833]">
                  <table className="min-w-full divide-y divide-line dark:divide-[#233833] text-left text-xs">
                    <thead className="bg-chamber-50/80 dark:bg-[#152722] font-semibold text-ink dark:text-white">
                      <tr>
                        <th className="px-3.5 py-3">Section & Law</th>
                        <th className="px-3.5 py-3">Offense / Title</th>
                        <th className="px-3.5 py-3">Bailable?</th>
                        <th className="px-3.5 py-3">Cognizable?</th>
                        <th className="px-3.5 py-3">Punishment</th>
                        <th className="px-3.5 py-3">Trial Court</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line dark:divide-[#1C302B] bg-white dark:bg-[#0E1A17] text-ink dark:text-[#CBDAD5]">
                      {activeIncident.applicableSections.map((sec, idx) => (
                        <tr key={idx} className="hover:bg-paper/50 dark:hover:bg-[#142320]">
                          <td className="px-3.5 py-3 font-mono font-bold text-chamber-700 dark:text-emerald-300">
                            {sec.section}
                            <span className="block font-sans text-[10px] text-ink-muted dark:text-[#88A69E] mt-0.5">
                              {sec.bnsEquivalent}
                            </span>
                          </td>
                          <td className="px-3.5 py-3 font-medium text-ink dark:text-white">
                            {sec.title}
                            <ul className="mt-1 list-disc list-inside text-[11px] text-ink-muted dark:text-[#88A69E]">
                              {sec.ingredients.slice(0, 2).map((ing, i) => (
                                <li key={i}>{ing}</li>
                              ))}
                            </ul>
                          </td>
                          <td className="px-3.5 py-3 whitespace-nowrap">
                            <span className={`inline-block rounded px-2 py-0.5 font-semibold text-[11px] ${
                              sec.bailable.includes('Non-Bailable')
                                ? 'bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800'
                                : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                            }`}>
                              {sec.bailable}
                            </span>
                          </td>
                          <td className="px-3.5 py-3 whitespace-nowrap">
                            <span className="rounded bg-paper dark:bg-[#192C27] px-2 py-0.5 text-[11px] font-medium">
                              {sec.cognizable}
                            </span>
                          </td>
                          <td className="px-3.5 py-3 font-semibold text-rose-700 dark:text-rose-300">
                            {sec.punishment}
                          </td>
                          <td className="px-3.5 py-3 text-ink-soft dark:text-[#A7BFB9]">
                            {sec.court}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Connected Landmark Case Card */}
              <div className="rounded-lg border border-chamber-200 dark:border-emerald-800/60 bg-chamber-50/40 dark:bg-emerald-950/30 p-4">
                <h4 className="font-bold text-chamber-900 dark:text-emerald-200 text-xs uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Gavel className="h-4 w-4 text-chamber-600 dark:text-emerald-400" />
                  Connected Landmark Supreme Court Precedent:
                </h4>
                <p className="text-sm font-semibold text-ink dark:text-white mt-1">
                  {activeIncident.landmarkCase.caseName}
                </p>
                <p className="text-xs text-ink-soft dark:text-[#B2C5BF] mt-1 leading-relaxed">
                  <strong>Core Ruling:</strong> {activeIncident.landmarkCase.rule}
                </p>
              </div>

              {/* Step-by-Step Citizen Action Plan */}
              <div>
                <h4 className="text-sm font-bold text-ink dark:text-white mb-2 flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  Step-by-Step Legal Action Plan for the Victim:
                </h4>
                <div className="grid gap-2 sm:grid-cols-2">
                  {activeIncident.actionPlan.map((step, idx) => (
                    <div
                      key={idx}
                      className="rounded-lg border border-line dark:border-[#233833] bg-paper dark:bg-[#0D1815] p-3 text-xs flex items-start gap-2.5"
                    >
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-chamber-600 text-white dark:bg-emerald-500 dark:text-gray-950 font-bold text-[10px]">
                        {idx + 1}
                      </span>
                      <p className="text-ink dark:text-[#CBDAD5] font-medium leading-relaxed">{step}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── TAB 3: STATUTORY PORTALS & FREE LEGAL AID ───────────── */}
        {activeTab === 'portals' && (
          <div className="space-y-8">
            {STATUTORY_PORTALS.map(({ category, items }) => (
              <div key={category} className="space-y-3">
                <h2 className="text-lg font-bold text-ink dark:text-white pb-2 border-b border-line dark:border-[#233833]">
                  {category}
                </h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  {items.map((item) => (
                    <a
                      key={item.title}
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-xl border border-line dark:border-[#1E332D] bg-white dark:bg-[#0E1A17] p-5 hover:border-chamber-400 dark:hover:border-emerald-600 hover:shadow-md transition-all group flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="text-sm font-bold text-chamber-700 dark:text-emerald-400 group-hover:underline">
                            {item.title}
                          </h3>
                          <ExternalLink className="h-4 w-4 text-ink-muted shrink-0 group-hover:text-chamber-600 dark:group-hover:text-emerald-400 transition-colors" />
                        </div>
                        <p className="mt-2 text-xs text-ink-soft dark:text-[#9FB7B0] leading-relaxed">
                          {item.desc}
                        </p>
                      </div>
                      <div className="mt-4 pt-2 border-t border-line/60 dark:border-[#1B2F2A]">
                        <span className="inline-block rounded bg-paper dark:bg-[#152622] px-2 py-0.5 text-[11px] font-semibold text-ink-muted dark:text-[#88A69E]">
                          {item.tag}
                        </span>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
