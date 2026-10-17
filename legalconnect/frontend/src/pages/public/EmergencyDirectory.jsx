import { useState, useMemo } from 'react';
import {
  PhoneCall,
  ShieldAlert,
  Copy,
  Check,
  ExternalLink,
  AlertTriangle,
  ArrowRight,
  Shield,
  LifeBuoy,
  Search,
  Printer,
  FileCheck,
  ChevronDown,
  ChevronUp,
  HeartHandshake,
  Lock,
  MessageSquare,
  Scale,
  Sparkles,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  PRIMARY_SOS_HOTLINES,
  ALL_EMERGENCY_HOTLINES,
  EMERGENCY_CATEGORIES,
  GOLDEN_HOUR_PROTOCOLS,
} from '../../data/emergencyHotlinesData.js';
import { useToast } from '../../context/ToastContext.jsx';
import Button from '../../components/ui/Button.jsx';
import Badge from '../../components/ui/Badge.jsx';

export default function EmergencyDirectory() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [copiedId, setCopiedId] = useState(null);
  const [expandedId, setExpandedId] = useState('women-safety');

  const handleCopy = (number, title, id) => {
    navigator.clipboard.writeText(number);
    setCopiedId(id);
    toast({
      type: 'success',
      title: 'Number Copied',
      message: `${number} (${title}) copied to clipboard.`,
      duration: 3000,
    });
    setTimeout(() => setCopiedId(null), 2500);
  };

  const filteredHotlines = useMemo(() => {
    return ALL_EMERGENCY_HOTLINES.filter((item) => {
      const matchesCategory =
        selectedCategory === 'all' || item.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.title.toLowerCase().includes(q) ||
        item.titleHi?.toLowerCase().includes(q) ||
        item.number.includes(q) ||
        item.authority.toLowerCase().includes(q) ||
        item.tagline.toLowerCase().includes(q) ||
        item.scope.some((s) => s.toLowerCase().includes(q));

      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-paper dark:bg-[#070D0B] text-ink dark:text-[#E2ECE8] py-8 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="mx-auto max-w-6xl space-y-8">
        {/* Panic / Quick Action Banner */}
        <div className="relative overflow-hidden rounded-2xl border border-rose-500/30 bg-gradient-to-r from-rose-950/40 via-amber-950/20 to-paper dark:to-[#0D1614] p-6 sm:p-8 shadow-xl">
          <div className="absolute -top-12 -right-12 h-44 w-44 rounded-full bg-rose-500/10 blur-3xl" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-rose-500/30 bg-rose-500/10 px-3 py-1 text-xs font-bold text-rose-600 dark:text-rose-400">
                <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping" />
                24x7 Pan-India Government Emergency Directory
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-ink dark:text-white">
                Emergency SOS & Legal Crisis Hotlines
              </h1>
              <p className="text-sm text-ink-muted dark:text-[#9FB7B0] leading-relaxed">
                Direct toll-free national emergency lines authorized by the Ministry of Home Affairs,
                Ministry of Women & Child Development, and NALSA. Instant one-touch dialing with
                Golden Hour legal guidance.
              </p>
            </div>

            <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
              <a
                href="tel:112"
                className="flex items-center gap-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black px-5 py-3 text-sm shadow-lg shadow-rose-600/30 transition-all hover:scale-105 active:scale-95"
              >
                <PhoneCall className="h-4 w-4 animate-bounce" />
                <span>Call 112 (National Emergency)</span>
              </a>
              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 rounded-xl border border-line dark:border-[#223833] bg-white dark:bg-[#12201C] hover:bg-paper dark:hover:bg-[#1A2E28] px-4 py-3 text-xs font-semibold text-ink dark:text-white transition-all shadow-sm"
                title="Print or Save Offline PDF"
              >
                <Printer className="h-4 w-4 text-ink-muted dark:text-[#9FB7B0]" />
                <span className="hidden sm:inline">Print / Save Offline</span>
              </button>
            </div>
          </div>
        </div>

        {/* ─── 4 PRIMARY QUICK-DIAL CARDS (Requested Core) ───────── */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-ink dark:text-white flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-rose-600 dark:text-rose-400" />
                Priority Citizen Protection Hotlines
              </h2>
              <p className="text-xs text-ink-muted dark:text-[#8EABA3]">
                Immediate quick-dial cards with statutory mandate under Indian law
              </p>
            </div>
            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
              100% Toll-Free
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {PRIMARY_SOS_HOTLINES.map((hotline) => {
              const isCopied = copiedId === hotline.id;
              const isExpanded = expandedId === hotline.id;

              return (
                <div
                  key={hotline.id}
                  className="flex flex-col justify-between rounded-2xl border-2 border-rose-500/30 dark:border-rose-500/20 bg-white dark:bg-[#0E1715] p-5 shadow-md hover:shadow-xl hover:border-rose-500/60 transition-all group"
                >
                  <div>
                    {/* Top Tag & Number */}
                    <div className="flex items-center justify-between gap-1 mb-2">
                      <span className="inline-block rounded-md bg-rose-500/10 dark:bg-rose-500/20 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                        {hotline.badge}
                      </span>
                      <span className="text-[11px] font-mono text-ink-muted dark:text-[#7A968F]">
                        Alt: {hotline.altNumber}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-ink dark:text-white leading-tight mb-1 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                      {hotline.title}
                    </h3>
                    <p className="text-[11px] font-hindi text-ink-muted dark:text-[#8AA79F] mb-2">
                      {hotline.titleHi}
                    </p>

                    <div className="my-3 flex items-baseline justify-between border-y border-line/60 dark:border-[#1E302B] py-2">
                      <div>
                        <span className="text-3xl font-black tracking-tight text-rose-600 dark:text-rose-400 font-mono">
                          {hotline.number}
                        </span>
                        <span className="block text-[10px] text-ink-muted dark:text-[#7A968F]">
                          Pan-India Dialing
                        </span>
                      </div>
                      <button
                        onClick={() => handleCopy(hotline.number, hotline.title, hotline.id)}
                        className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold border border-line dark:border-[#223530] bg-paper dark:bg-[#142320] text-ink-soft dark:text-[#C5D5D1] hover:text-ink dark:hover:text-white transition-all shadow-sm"
                        title="Copy Helpline Number"
                      >
                        {isCopied ? (
                          <>
                            <Check className="h-3.5 w-3.5 text-emerald-500" />
                            <span className="text-emerald-500 text-[11px]">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3.5 w-3.5" />
                            <span className="text-[11px]">Copy</span>
                          </>
                        )}
                      </button>
                    </div>

                    <p className="text-xs text-ink-muted dark:text-[#9FB7B0] line-clamp-2 mb-3">
                      {hotline.tagline}
                    </p>

                    {/* Golden Rule Callout */}
                    <div className="rounded-lg bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/20 p-2.5 text-[11px] text-amber-900 dark:text-amber-200 mb-4">
                      <span className="font-bold block mb-0.5">⚡ Golden Rule:</span>
                      {hotline.goldenRule}
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-line/60 dark:border-[#1E302B]">
                    <a
                      href={`tel:${hotline.number}`}
                      className="flex items-center justify-center gap-2 w-full rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white py-2.5 text-xs font-bold shadow-md shadow-rose-600/25 transition-all"
                    >
                      <PhoneCall className="h-3.5 w-3.5" />
                      <span>{hotline.dialPrompt}</span>
                    </a>

                    <button
                      onClick={() => setExpandedId(isExpanded ? null : hotline.id)}
                      className="flex items-center justify-center gap-1 w-full text-[11px] font-semibold text-ink-muted hover:text-ink dark:text-[#8CA9A2] dark:hover:text-white py-1 transition-colors"
                    >
                      <span>{isExpanded ? 'Hide Checklist' : 'View Checklist & Laws'}</span>
                      {isExpanded ? (
                        <ChevronUp className="h-3.5 w-3.5" />
                      ) : (
                        <ChevronDown className="h-3.5 w-3.5" />
                      )}
                    </button>

                    {/* Expanded Checklist & Statutory Sections */}
                    {isExpanded && (
                      <div className="mt-2 space-y-2.5 text-[11px] border-t border-line/60 dark:border-[#1E302B] pt-2.5 animate-in fade-in duration-150">
                        <div>
                          <p className="font-bold text-ink dark:text-white mb-1">
                            📋 What to Have Ready:
                          </p>
                          <ul className="list-disc pl-4 space-y-1 text-ink-muted dark:text-[#9FB7B0]">
                            {hotline.checklist.map((item, idx) => (
                              <li key={idx}>{item}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <p className="font-bold text-ink dark:text-white mb-1">
                            ⚖️ Statutory Coverage:
                          </p>
                          <ul className="list-disc pl-4 space-y-1 text-ink-muted dark:text-[#9FB7B0]">
                            {hotline.scope.map((item, idx) => (
                              <li key={idx}>{item}</li>
                            ))}
                          </ul>
                        </div>
                        {hotline.onlinePortal && (
                          <a
                            href={hotline.onlinePortal}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-chamber-700 hover:text-chamber-800 dark:text-emerald-400 dark:hover:text-emerald-300 pt-1"
                          >
                            <span>Official Grievance Portal</span>
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ─── SEARCH & CATEGORY FILTERS ────────────────────────── */}
        <div className="rounded-2xl border border-line dark:border-[#1E302B] bg-white dark:bg-[#0D1513] p-5 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-muted dark:text-[#7A968F]" />
              <input
                type="text"
                placeholder="Search emergency helplines, statutes, 1930, 1091, domestic violence, cyber fraud..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-line dark:border-[#223833] bg-paper dark:bg-[#121F1B] pl-10 pr-4 py-2.5 text-xs text-ink dark:text-white placeholder:text-ink-muted/60 dark:placeholder-[#6C8881] focus:border-chamber-500 dark:focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-chamber-500/20"
              />
            </div>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="rounded-xl border border-line dark:border-[#223833] px-3 py-2 text-xs font-semibold text-ink-muted hover:text-ink dark:text-[#8EABA3] dark:hover:text-white"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-1.5">
            {EMERGENCY_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-chamber-700 text-white dark:bg-emerald-500 dark:text-black shadow-sm'
                    : 'bg-paper dark:bg-[#14231F] text-ink-soft dark:text-[#A7BFB9] hover:bg-line dark:hover:bg-[#1E342F]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* ─── COMPLETE HELPLINE DIRECTORY LIST ─────────────────── */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-ink dark:text-white flex items-center justify-between">
            <span>All Pan-India Statutory Helplines ({filteredHotlines.length})</span>
            {selectedCategory !== 'all' && (
              <span className="text-xs font-normal text-ink-muted dark:text-[#8EABA3]">
                Filtered by category
              </span>
            )}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredHotlines.map((hotline) => {
              const isCopied = copiedId === hotline.id;
              return (
                <div
                  key={hotline.id}
                  className="rounded-2xl border border-line dark:border-[#1E302B] bg-white dark:bg-[#0E1715] p-5 shadow-sm hover:border-chamber-400 dark:hover:border-emerald-500/40 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <span className="inline-block rounded-md bg-paper dark:bg-[#162521] px-2 py-0.5 text-[10px] font-bold text-ink-soft dark:text-[#A7BFB9] uppercase mb-1">
                          {hotline.badge}
                        </span>
                        <h3 className="text-base font-bold text-ink dark:text-white">
                          {hotline.title}
                        </h3>
                        <p className="text-[11px] font-hindi text-ink-muted dark:text-[#8AA79F]">
                          {hotline.titleHi}
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="text-2xl font-black font-mono text-chamber-700 dark:text-emerald-400">
                          {hotline.number}
                        </span>
                        <span className="block text-[10px] text-ink-muted dark:text-[#7A968F]">
                          Alt: {hotline.altNumber}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-ink-muted dark:text-[#9FB7B0] mb-3">
                      {hotline.tagline}
                    </p>

                    <div className="text-[11px] text-ink-soft dark:text-[#8AA79F] mb-4 bg-paper dark:bg-[#121E1B] p-2.5 rounded-lg border border-line/60 dark:border-[#1D302B]">
                      <strong className="text-ink dark:text-white">Governing Body:</strong>{' '}
                      {hotline.authority}
                    </div>

                    <div className="space-y-1 mb-4">
                      <p className="text-[11px] font-bold text-ink dark:text-white">
                        Statutory Scope:
                      </p>
                      <ul className="text-xs space-y-1 text-ink-muted dark:text-[#9FB7B0]">
                        {hotline.scope.slice(0, 3).map((item, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <span className="text-chamber-600 dark:text-emerald-400 font-bold">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-3 border-t border-line/60 dark:border-[#1E302B]">
                    <a
                      href={`tel:${hotline.number}`}
                      className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-chamber-700 hover:bg-chamber-800 dark:bg-emerald-500 dark:hover:bg-emerald-400 dark:text-black text-white py-2 text-xs font-bold transition-all shadow-sm"
                    >
                      <PhoneCall className="h-3.5 w-3.5" />
                      <span>{hotline.dialPrompt}</span>
                    </a>
                    <button
                      onClick={() => handleCopy(hotline.number, hotline.title, hotline.id)}
                      className="rounded-xl border border-line dark:border-[#223833] bg-paper dark:bg-[#142320] px-3 py-2 text-xs font-semibold text-ink-soft dark:text-[#B6C8C3] hover:text-ink dark:hover:text-white transition-colors"
                      title="Copy Number"
                    >
                      {isCopied ? (
                        <Check className="h-4 w-4 text-emerald-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </button>
                    {hotline.onlinePortal && (
                      <a
                        href={hotline.onlinePortal}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-xl border border-line dark:border-[#223833] bg-paper dark:bg-[#142320] p-2 text-xs font-semibold text-ink-soft dark:text-[#B6C8C3] hover:text-ink dark:hover:text-white transition-colors"
                        title="Visit Official Portal"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ─── GOLDEN HOUR LEGAL PROTOCOLS ───────────────────────── */}
        <div className="rounded-2xl border border-line dark:border-[#1E302B] bg-white dark:bg-[#0E1715] p-6 shadow-sm space-y-4">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-ink dark:text-white flex items-center gap-2">
              <Scale className="h-5 w-5 text-chamber-700 dark:text-emerald-400" />
              Emergency Legal "Golden Hour" Protocols
            </h2>
            <p className="text-xs text-ink-muted dark:text-[#8EABA3]">
              Immediate actions required under Indian criminal law (BNS 2023, IT Act, POCSO) to safeguard evidence and victim rights
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {GOLDEN_HOUR_PROTOCOLS.map((proto, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-line/80 dark:border-[#1F332E] bg-paper dark:bg-[#121E1B] p-4 space-y-2.5"
              >
                <h3 className="text-sm font-bold text-ink dark:text-white flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-chamber-600/10 dark:bg-emerald-500/20 text-chamber-700 dark:text-emerald-400 text-xs">
                    {idx + 1}
                  </span>
                  {proto.title}
                </h3>
                <ul className="space-y-1.5 pl-6 text-xs text-ink-muted dark:text-[#9FB7B0] list-disc">
                  {proto.steps.map((step, sIdx) => (
                    <li key={sIdx}>{step}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* ─── NEXT STEP: CONSULT AN ADVOCATE OR LEXBOT ─────────── */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-chamber-600/20 bg-chamber-600/5 dark:bg-emerald-500/10 p-6">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-ink dark:text-white flex items-center gap-2">
              <HeartHandshake className="h-5 w-5 text-chamber-700 dark:text-emerald-400" />
              Need Legal Counsel Following an Emergency?
            </h3>
            <p className="text-xs text-ink-muted dark:text-[#9FB7B0]">
              Connect with verified criminal, family, or cyber law advocates on LegalConnect, or
              consult LexBot for immediate BNS 2023 section guidance.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              to="/legal-resources"
              className="rounded-xl border border-line dark:border-[#2A3E38] bg-white dark:bg-[#12201C] px-4 py-2.5 text-xs font-bold text-ink dark:text-white hover:bg-paper dark:hover:bg-[#1A2E28] transition-colors"
            >
              Legal Resources
            </Link>
            <Link
              to="/client/advocates"
              className="rounded-xl bg-chamber-700 hover:bg-chamber-800 dark:bg-emerald-500 dark:hover:bg-emerald-400 dark:text-black text-white px-4 py-2.5 text-xs font-bold transition-all shadow-sm"
            >
              Find an Advocate
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
