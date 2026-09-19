import { Sparkles, Search, Calendar, Scale, CheckCircle } from 'lucide-react';
import Button from '../../components/ui/Button.jsx';

const STEPS = [
  { icon: Sparkles, step: 'Step 1', title: 'Describe Your Legal Issue', body: 'Use our AI Legal Assistant to describe your problem in plain language. The AI identifies the practice area, suggests relevant documents, and provides general legal information.', color: 'bg-brass-100 text-brass-600' },
  { icon: Search, step: 'Step 2', title: 'Find and Compare Advocates', body: 'Browse verified advocates filtered by practice area, location, experience, fee, rating, and availability. View profiles, badges, and verified reviews.', color: 'bg-chamber-50 text-chamber-600' },
  { icon: Calendar, step: 'Step 3', title: 'Book a Consultation', body: 'Select a time slot, choose your preferred consultation type (video, chat, or in-person), describe your legal issue, and complete the mock payment.', color: 'bg-sky-50 text-sky-600' },
  { icon: Scale, step: 'Step 4', title: 'Manage Your Case', body: 'After your consultation, your advocate opens a case workspace with document management, task tracking, timeline, hearings, and real-time chat.', color: 'bg-emerald-50 text-emerald-600' },
  { icon: CheckCircle, step: 'Step 5', title: 'Review & Resolve', body: 'Once your case is resolved, leave a verified review for your advocate. Your review helps other clients make informed decisions.', color: 'bg-purple-50 text-purple-600' },
];

export default function HowItWorks() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <div className="text-center mb-12">
        <h1 className="text-4xl">How LegalConnect Works</h1>
        <p className="mt-4 text-lg text-ink-soft">From legal issue to resolution — five simple steps</p>
      </div>

      <div className="space-y-6">
        {STEPS.map(({ icon: Icon, step, title, body, color }, i) => (
          <div key={step} className="panel p-6 flex gap-5">
            <div className={`rounded-xl p-3 h-fit ${color}`}>
              <Icon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-ink-muted mb-1">{step}</p>
              <h2 className="text-xl mb-2">{title}</h2>
              <p className="text-ink-soft leading-relaxed">{body}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 text-center panel p-8 bg-chamber-50">
        <h2 className="text-2xl text-chamber-800">Ready to get started?</h2>
        <p className="mt-2 text-ink-soft">Create a free account and find your advocate today.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button to="/register" size="lg" variant="primary">Create Account</Button>
          <Button to="/login" size="lg" variant="secondary">Sign In</Button>
        </div>
      </div>
    </div>
  );
}
