import { Scale, Users, Shield, Target } from 'lucide-react';
import Button from '../../components/ui/Button.jsx';

export default function About() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <div className="text-center mb-12">
        <Scale className="mx-auto h-12 w-12 text-chamber-600 mb-4" />
        <h1 className="text-4xl">About LegalConnect</h1>
        <p className="mt-4 text-lg text-ink-soft max-w-2xl mx-auto">
          Making quality legal representation accessible, transparent, and efficient for everyone.
        </p>
      </div>

      <div className="panel p-8 mb-8">
        <h2 className="text-2xl mb-4">Our Mission</h2>
        <p className="text-ink-soft leading-relaxed">
          LegalConnect bridges the gap between clients seeking legal help and qualified advocates ready to assist.
          We believe everyone deserves access to quality legal counsel, and we've built the tools to make the
          entire process — from finding an advocate to resolving a case — seamless and transparent.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3 mb-8">
        {[
          { icon: Shield, title: 'Trust & Verification', body: 'Every advocate is verified through their Bar Council registration before being listed on our platform.' },
          { icon: Users, title: 'Client First', body: 'Our platform is built around client needs — transparency, clear communication, and case visibility at every step.' },
          { icon: Target, title: 'Technology-Driven', body: 'Modern tools including video consultations, real-time chat, AI assistance, and digital case management.' },
        ].map(({ icon: Icon, title, body }) => (
          <div key={title} className="panel p-6 text-center">
            <Icon className="mx-auto h-8 w-8 text-chamber-600 mb-3" />
            <h3 className="text-lg mb-2">{title}</h3>
            <p className="text-sm text-ink-soft">{body}</p>
          </div>
        ))}
      </div>

      <div className="text-center">
        <Button to="/register" size="lg" variant="primary">Get Started</Button>
      </div>
    </div>
  );
}
