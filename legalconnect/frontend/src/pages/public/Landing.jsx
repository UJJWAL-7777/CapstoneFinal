import { useNavigate, Link } from 'react-router-dom';
import {
  ShieldCheck, FileCheck2, CalendarClock, MessageSquare,
  Video, Scale, Star, ArrowRight, Sparkles, PhoneCall,
  ScrollText, Bot, Swords, CreditCard, Landmark,
} from 'lucide-react';
import Button from '../../components/ui/Button.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import { ROLE_HOME } from '../../utils/constants.js';

const STEPS = [
  { num: '01', title: 'Consult AI or Search', body: 'Use LexBot or search verified advocates by practice area, experience, court jurisdiction, and fee.' },
  { num: '02', title: 'Book Video Consultation', body: 'Pick an instant time slot, choose in-browser WebRTC video, chat, or in-person consultation.' },
  { num: '03', title: 'Protected Escrow Payment', body: 'Pay securely via Razorpay or UPI into an RBI-compliant escrow ledger released upon completion.' },
  { num: '04', title: 'Case Workspace & Notices', body: 'Track case milestones, court hearing dates, encrypted document vault, and generate legal notices.' },
];

const FEATURES = [
  {
    icon: ShieldCheck,
    title: 'Verified Advocates Only',
    body: 'Every advocate submits State Bar Council enrollment credentials. Only verified practitioners receive the verification badge.',
    badge: 'Bar Council Verified',
  },
  {
    icon: Video,
    title: 'WebRTC Video Consultations',
    body: 'Private 1-on-1 encrypted video calls directly in the browser with screen sharing. Zero third-party downloads required.',
    badge: 'In-Browser HD',
  },
  {
    icon: Bot,
    title: 'LexBot & BNS 2023 AI',
    body: 'Trilingual (English, हिन्दी, Hinglish) legal AI mapping new Bharatiya Nyaya Sanhita 2023 sections, punishments, and doctrines.',
    badge: 'Trilingual Speech',
  },
  {
    icon: ScrollText,
    title: 'Statutory Notice Generator',
    body: 'Court-ready bilingual legal notice templates for Cheque Bounce (Sec 138 NI Act), Tenancy, Eviction, and Consumer claims.',
    badge: 'PDF Export Ready',
  },
  {
    icon: Swords,
    title: "Devil's Advocate Engine",
    body: 'Clause-by-clause contract vulnerability analysis predicting counter-arguments, loophole severity, and judicial precedents.',
    badge: 'Risk Analysis',
  },
  {
    icon: PhoneCall,
    title: '24x7 Emergency SOS Directory',
    body: 'Toll-free quick-dial lines for Women (1091/112), Cyber Crime (1930), Senior Citizens (14567), and Childline (1098).',
    badge: 'Toll-Free Pan-India',
  },
  {
    icon: FileCheck2,
    title: 'Encrypted Document Vault',
    body: 'Store vakalatnamas, evidence files, case orders, and affidavits in an encrypted, permissioned case vault.',
    badge: 'Secure Storage',
  },
  {
    icon: CalendarClock,
    title: 'Hearing Dates & Reminders',
    body: 'Upcoming court dates, cause list updates, and limitation deadlines appear on your dashboard with instant notifications.',
    badge: 'Automated Alerts',
  },
  {
    icon: CreditCard,
    title: 'Dual-Mode Escrow Payments',
    body: 'Transparent fee structures with Razorpay HMAC-SHA256 live billing and academic mock mode for evaluation.',
    badge: 'Escrow Protection',
  },
];

const PRACTICE_AREAS = [
  'Criminal Law (BNS 2023)', 'Family & Matrimonial Law', 'Property & Real Estate',
  'Corporate & Commercial', 'Cheque Bounce (Sec 138)', 'Cyber Crime & IT Act',
  'Consumer Protection', 'Labour & Industrial Law', 'Constitutional & Writs',
];

const STATS = [
  { value: '2,400+', label: 'Verified advocates' },
  { value: '18,000+', label: 'Cases resolved' },
  { value: '4.8/5', label: 'Average rating' },
  { value: '98%', label: 'Satisfaction rate' },
];

export default function Landing() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleCTA = () => {
    if (user) navigate(ROLE_HOME[user.role]);
  };

  return (
    <div className="bg-paper dark:bg-[#070D0B] text-ink dark:text-[#E2ECE8] transition-colors duration-200">
      {/* ─── Emergency SOS Top Alert Strip ───────────────────────── */}
      <div className="bg-rose-600/10 dark:bg-rose-500/15 border-b border-rose-500/20 py-2.5 px-4 text-center">
        <div className="mx-auto max-w-6xl flex flex-wrap items-center justify-center gap-2 text-xs font-semibold text-rose-700 dark:text-rose-300">
          <span className="flex h-2 w-2 rounded-full bg-rose-500 animate-ping" />
          <span>Need Immediate Crisis Intervention?</span>
          <span className="hidden sm:inline">•</span>
          <span>Women (1091) | Cyber Crime (1930) | Senior Citizens (14567) | Childline (1098) | Emergency 112</span>
          <Link
            to="/emergency"
            className="ml-2 inline-flex items-center gap-1 rounded-full bg-rose-600 px-2.5 py-0.5 text-[11px] font-bold text-white hover:bg-rose-700 transition-colors shadow-sm"
          >
            <span>Dial SOS Directory</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>

      {/* ─── Hero Section ────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-chamber-950 via-chamber-900 to-chamber-800 dark:from-[#050B09] dark:via-[#091512] dark:to-[#0F221D] border-b border-line dark:border-[#1A2D27]">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_30%_50%,white_1px,transparent_1px)] bg-[size:24px_24px]" />
        <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-24">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 dark:bg-emerald-500/10 px-4 py-1.5 text-xs font-semibold text-chamber-100 dark:text-emerald-300 mb-6 border border-white/20 dark:border-emerald-500/20 shadow-sm">
                <Sparkles className="h-3.5 w-3.5 text-brass-400 dark:text-emerald-400" />
                Next-Gen Indian Legal Services & BNS 2023 Architecture
              </div>

              <h1 className="text-4xl font-extrabold leading-[1.1] text-white sm:text-5xl lg:text-6xl tracking-tight">
                Find the right advocate,{' '}
                <span className="text-brass-400 dark:text-emerald-400">run the whole case</span>{' '}
                in one place.
              </h1>

              <p className="mt-6 max-w-xl text-base sm:text-lg text-chamber-100 dark:text-[#CBDAD5] leading-relaxed">
                Connect with Bar Council verified advocates, book encrypted WebRTC video consultations,
                generate court-ready legal notices, and receive instant AI statutory counsel under the new
                Bharatiya Nyaya Sanhita (BNS 2023).
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                {user ? (
                  <Button size="lg" variant="brass" onClick={handleCTA}>
                    Go to Dashboard <ArrowRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <>
                    <Button to="/register" size="lg" variant="brass">
                      Get Started Free <ArrowRight className="h-4 w-4" />
                    </Button>
                    <Button
                      to="/login"
                      size="lg"
                      variant="secondary"
                      className="bg-white/10 text-white border-white/20 hover:bg-white/20"
                    >
                      Sign In
                    </Button>
                  </>
                )}
                <Link
                  to="/legal-resources"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 px-4 py-3 text-sm font-semibold text-white transition-all backdrop-blur-sm"
                >
                  <Landmark className="h-4 w-4 text-brass-400 dark:text-emerald-400" />
                  <span>Bharat Legal Hub</span>
                </Link>
              </div>

              <p className="mt-4 text-xs text-chamber-200 dark:text-[#9FB7B0]">
                Are you an advocate? Register with your Bar Council enrollment credentials to get verified.
              </p>
            </div>

            {/* Stats Panel */}
            <div className="grid grid-cols-2 gap-4">
              {STATS.map((s) => (
                <div
                  key={s.label}
                  className="rounded-2xl bg-white/10 dark:bg-[#11231E]/80 border border-white/15 dark:border-[#203D34] p-6 backdrop-blur-sm shadow-lg hover:border-brass-400/40 transition-all"
                >
                  <p className="text-3xl font-extrabold text-white font-mono tracking-tight">{s.value}</p>
                  <p className="mt-1 text-xs text-chamber-200 dark:text-[#A8C2BB] font-medium">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Practice Areas Pills ─────────────────────────────────── */}
      <section className="bg-paper dark:bg-[#0A1210] border-b border-line dark:border-[#1E302B]">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          <p className="text-xs font-bold uppercase tracking-widest text-ink-muted dark:text-[#7A9992] mb-3">
            Explore Court Practice Areas & Specializations
          </p>
          <div className="flex flex-wrap gap-2">
            {PRACTICE_AREAS.map((area) => (
              <button
                key={area}
                onClick={() => navigate(`/client/advocates?practiceArea=${encodeURIComponent(area)}`)}
                className="rounded-full border border-line dark:border-[#223833] bg-white dark:bg-[#111E1A] px-4 py-2 text-xs font-semibold text-ink dark:text-[#D7E6E2] hover:border-chamber-500 dark:hover:border-emerald-400 hover:text-chamber-700 dark:hover:text-emerald-300 transition-all shadow-sm"
              >
                {area}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ─── How It Works ─────────────────────────────────────────── */}
      <section className="bg-white dark:bg-[#0B1412] py-16 sm:py-20 border-b border-line dark:border-[#1E302B]">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center mb-12 space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-chamber-700 dark:text-emerald-400">
              Frictionless Legal Journey
            </span>
            <h2 className="text-3xl font-extrabold tracking-tight text-ink dark:text-white">
              How LegalConnect Works
            </h2>
            <p className="text-sm text-ink-soft dark:text-[#9FB7B0]">
              From first consultation to court resolution in four transparent steps
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step) => (
              <div
                key={step.num}
                className="relative rounded-2xl border border-line dark:border-[#1F332E] bg-paper dark:bg-[#0E1A17] p-6 shadow-sm hover:shadow-md transition-all"
              >
                <div className="text-3xl font-extrabold text-chamber-300 dark:text-emerald-700 font-mono">
                  {step.num}
                </div>
                <h3 className="mt-3 text-base font-bold text-ink dark:text-white">{step.title}</h3>
                <p className="mt-2 text-xs text-ink-soft dark:text-[#9FB7B0] leading-relaxed">
                  {step.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Features Grid ────────────────────────────────────────── */}
      <section className="bg-paper dark:bg-[#080E0C] py-16 sm:py-20 border-b border-line dark:border-[#1E302B]">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center mb-12 space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-chamber-700 dark:text-emerald-400">
              End-to-End Legal Ecosystem
            </span>
            <h2 className="text-3xl font-extrabold tracking-tight text-ink dark:text-white">
              State-of-the-Art LegalTech Architecture
            </h2>
            <p className="text-sm text-ink-soft dark:text-[#9FB7B0]">
              Built for modern litigants, advocates, and judicial transparency
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map(({ icon: Icon, title, body, badge }) => (
              <div
                key={title}
                className="rounded-2xl border border-line dark:border-[#1E322D] bg-white dark:bg-[#0F1C18] p-6 shadow-sm hover:shadow-lg hover:border-chamber-400 dark:hover:border-emerald-500/40 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <div className="inline-flex rounded-xl bg-chamber-50 dark:bg-emerald-950/60 p-3 text-chamber-700 dark:text-emerald-400 border border-chamber-200/50 dark:border-emerald-800/40">
                      <Icon className="h-5 w-5" aria-hidden />
                    </div>
                    {badge && (
                      <span className="rounded-full bg-paper dark:bg-[#162723] px-2.5 py-1 text-[10px] font-bold text-ink-muted dark:text-[#8EABA3] uppercase">
                        {badge}
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-bold text-ink dark:text-white">{title}</h3>
                  <p className="mt-2 text-xs text-ink-soft dark:text-[#9FB7B0] leading-relaxed">
                    {body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Final CTA Banner ─────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-chamber-950 via-chamber-900 to-chamber-800 dark:from-[#060D0B] dark:via-[#0A1814] dark:to-[#112721] py-16 sm:py-20 text-center">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <Scale className="mx-auto h-12 w-12 text-brass-400 dark:text-emerald-400 mb-4 animate-pulse" />
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Ready to resolve your legal matter with confidence?
          </h2>
          <p className="mt-3 text-base text-chamber-200 dark:text-[#A8C2BB] max-w-xl mx-auto">
            Experience verified advocate matching, BNS 2023 jurisprudence, and instant statutory notices.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button to="/register" size="lg" variant="brass">
              Create Free Account <ArrowRight className="h-4 w-4" />
            </Button>
            <Button
              to="/emergency"
              size="lg"
              className="bg-rose-600/20 text-rose-300 border border-rose-500/30 hover:bg-rose-600 hover:text-white"
            >
              🚨 Emergency SOS Directory
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
