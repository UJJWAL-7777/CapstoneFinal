import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck, FileCheck2, CalendarClock, MessageSquare,
  Video, Scale, Star, ChevronRight, ArrowRight, Sparkles,
} from 'lucide-react';
import Button from '../../components/ui/Button.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import { ROLE_HOME } from '../../utils/constants.js';

const STEPS = [
  { num: '01', title: 'Describe your issue', body: 'Use our AI assistant to categorize your legal issue and get matched to the right practice area.' },
  { num: '02', title: 'Find an advocate', body: 'Search and filter from verified advocates by practice area, location, fee, and availability.' },
  { num: '03', title: 'Book a consultation', body: 'Pick a time slot, choose video, chat, or in-person, and pay securely.' },
  { num: '04', title: 'Manage your case', body: 'After your consultation, your advocate creates a case workspace to track documents, hearings, and tasks.' },
];

const FEATURES = [
  { icon: ShieldCheck, title: 'Verified advocates only', body: 'Every advocate submits Bar Council credentials. Only verified advocates carry our badge.' },
  { icon: Video, title: 'Video consultations', body: 'Private 1-to-1 video calls directly in the browser. No third-party apps needed.' },
  { icon: FileCheck2, title: 'Secure document vault', body: 'Upload and share documents inside each case. Only you and your advocate can access them.' },
  { icon: CalendarClock, title: 'Hearing reminders', body: 'Upcoming hearing dates appear on your dashboard and generate instant notifications.' },
  { icon: MessageSquare, title: 'Real-time case chat', body: 'Message your advocate directly within the case workspace, with full message history.' },
  { icon: Star, title: 'Verified reviews', body: 'Only clients with completed consultations can leave reviews. No fake ratings.' },
];

const PRACTICE_AREAS = [
  'Family Law', 'Property Law', 'Criminal Law', 'Corporate Law',
  'Consumer Protection', 'Tax Law', 'Cyber Law', 'Labour & Employment',
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
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-chamber-900 via-chamber-800 to-chamber-700">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_30%_50%,white_1px,transparent_1px)] bg-[size:24px_24px]" />
        <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:py-28">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm text-chamber-100 mb-6 border border-white/20">
                <Sparkles className="h-3.5 w-3.5 text-brass-400" />
                AI-powered legal matching
              </div>
              <h1 className="text-4xl font-bold leading-[1.1] text-white sm:text-5xl lg:text-6xl">
                Find the right advocate,{' '}
                <span className="text-brass-400">run the whole case</span>{' '}
                in one place.
              </h1>
              <p className="mt-6 max-w-xl text-lg text-chamber-100 leading-relaxed">
                Describe your legal issue, compare verified advocates, book a video consultation,
                and follow your case from first call to resolution.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                {user ? (
                  <Button size="lg" variant="brass" onClick={handleCTA}>
                    Go to Dashboard <ArrowRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <>
                    <Button to="/register" size="lg" variant="brass">
                      Create a free account <ArrowRight className="h-4 w-4" />
                    </Button>
                    <Button to="/login" size="lg" variant="secondary" className="bg-white/10 text-white border-white/20 hover:bg-white/20">
                      Sign in
                    </Button>
                  </>
                )}
              </div>
              <p className="mt-4 text-sm text-chamber-200">
                Advocates: register with your Bar Council details to be verified.
              </p>
            </div>

            {/* Stats panel */}
            <div className="grid grid-cols-2 gap-4">
              {STATS.map((s) => (
                <div key={s.label} className="rounded-2xl bg-white/10 border border-white/20 p-6 backdrop-blur-sm">
                  <p className="text-3xl font-bold text-white">{s.value}</p>
                  <p className="mt-1 text-sm text-chamber-200">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Practice Areas */}
      <section className="bg-paper border-b border-line">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-ink-muted mb-4">Practice Areas</p>
          <div className="flex flex-wrap gap-2">
            {PRACTICE_AREAS.map((area) => (
              <button
                key={area}
                onClick={() => navigate(`/client/advocates?practiceArea=${encodeURIComponent(area)}`)}
                className="rounded-full border border-line bg-white px-4 py-1.5 text-sm text-ink hover:border-chamber-400 hover:text-chamber-700 transition-colors"
              >
                {area}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl">How LegalConnect works</h2>
            <p className="mt-3 text-ink-soft">From issue to resolution in four simple steps</p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step) => (
              <div key={step.num} className="relative">
                <div className="text-4xl font-bold text-chamber-100">{step.num}</div>
                <h3 className="mt-3 text-lg">{step.title}</h3>
                <p className="mt-2 text-sm text-ink-soft leading-relaxed">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-paper border-t border-line">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl">Everything you need in one platform</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map(({ icon: Icon, title, body }) => (
              <div key={title} className="panel p-6 hover:shadow-lg transition-shadow">
                <div className="inline-flex rounded-xl bg-chamber-50 p-3">
                  <Icon className="h-6 w-6 text-chamber-600" aria-hidden />
                </div>
                <h3 className="mt-4 text-lg">{title}</h3>
                <p className="mt-2 text-sm text-ink-soft leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="bg-chamber-900">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 text-center">
          <Scale className="mx-auto h-10 w-10 text-brass-400 mb-4" />
          <h2 className="text-3xl text-white">Ready to resolve your legal matter?</h2>
          <p className="mt-3 text-chamber-200">Join thousands of clients who found the right advocate through LegalConnect.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button to="/register" size="lg" variant="brass">Get started free</Button>
            <Button to="/how-it-works" size="lg" className="bg-white/10 text-white border border-white/20 hover:bg-white/20">Learn more</Button>
          </div>
        </div>
      </section>
    </>
  );
}
