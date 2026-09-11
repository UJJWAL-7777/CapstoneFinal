import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchTierStats } from "../../api.js";

export default function Home() {
  const [stats, setStats] = useState([]);
  useEffect(() => { fetchTierStats().then(setStats).catch(() => {}); }, []);

  return (
    <div>
      {/* ── Hero / Front Page ────────────────────────── */}
      <section className="text-center py-20 px-5 max-w-3xl mx-auto">
        <div className="border-t-4 border-double border-ink mb-8" />
        <span className="inline-block px-4 py-1.5 bg-parchment text-sepia rounded-full text-xs font-sans font-semibold tracking-widest uppercase mb-6 border border-rule">
          India&apos;s Legal Gazette
        </span>
        <h1 className="font-serif text-5xl md:text-6xl font-black text-ink leading-[1.1] tracking-tight mb-6">
          Find Trusted Legal Help,<br />
          <span className="italic text-accent">Powered by Merit</span>
        </h1>
        <div className="w-24 h-[2px] bg-sepia mx-auto mb-6" />
        <p className="text-lg font-body text-ink-muted leading-relaxed max-w-xl mx-auto mb-10">
          An incentive-based marketplace connecting clients with verified advocates,
          arbitrators, mediators, notaries, and document writers across India.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link to="/register/client" className="bg-accent hover:bg-accent-dark text-white px-7 py-3.5 rounded font-sans font-semibold text-sm transition-colors shadow-md hover:shadow-lg">
            Find an Advocate →
          </Link>
          <Link to="/register/advocate" className="border-2 border-ink text-ink hover:bg-ink hover:text-cream px-7 py-3.5 rounded font-sans font-semibold text-sm transition-all">
            Join as Advocate
          </Link>
        </div>
        <div className="border-b-4 border-double border-ink mt-12" />
      </section>

      {/* ── How It Works — Newspaper Columns ─────────── */}
      <section className="py-16 px-5 max-w-5xl mx-auto">
        <h2 className="font-serif text-3xl font-bold text-center mb-2 text-ink">How It Works</h2>
        <p className="text-center text-ink-faint font-sans text-sm mb-10 italic">A guide to navigating the LegalConnect marketplace</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0 border border-rule">
          {[
            { icon: "🔍", title: "Search & Discover", desc: "Find the right legal professional by specialization, location, tier, and rating." },
            { icon: "📩", title: "Request Consultation", desc: "Send a case request directly to an advocate and get connected instantly." },
            { icon: "📋", title: "Track Your Case", desc: "Monitor case progress with real-time timeline updates and status changes." },
            { icon: "🏆", title: "Tier & Badges", desc: "Advocates earn tiers and badges based on performance, building trust." },
          ].map((f, i) => (
            <div key={i} className={`p-8 text-center ${i < 3 ? "lg:border-r border-rule" : ""} ${i < 2 ? "md:border-b lg:border-b-0 border-rule" : ""} ${i === 2 ? "md:border-b lg:border-b-0 border-rule" : ""}`}>
              <span className="text-4xl mb-4 block">{f.icon}</span>
              <h3 className="font-serif text-lg font-bold text-ink mb-2">{f.title}</h3>
              <p className="text-sm font-body text-ink-muted leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Stats ────────────────────────────────────── */}
      {stats.length > 0 && (
        <section className="py-16 px-5 max-w-4xl mx-auto text-center">
          <div className="border-t border-rule mb-8" />
          <h2 className="font-serif text-3xl font-bold mb-8 text-ink">Platform Overview</h2>
          <div className="flex gap-4 flex-wrap justify-center">
            {stats.map((s) => (
              <div key={s._id} className="bg-parchment border border-rule rounded-lg px-10 py-6 text-center min-w-[130px] hover:-translate-y-1 transition-transform">
                <div className="text-4xl font-serif font-black text-ink">{s.count}</div>
                <div className="text-sm font-sans text-ink-muted font-medium mt-1">{s._id} Tier</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── CTA ──────────────────────────────────────── */}
      <section className="text-center py-20 px-5 bg-navy text-cream mt-10">
        <h2 className="font-serif text-3xl font-bold mb-3">Ready to Get Started?</h2>
        <p className="text-cream/60 mb-10 font-body text-lg">Join thousands of legal professionals and clients on LegalConnect.</p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link to="/register/client" className="bg-accent hover:bg-accent-dark text-white px-7 py-3.5 rounded font-sans font-semibold text-sm transition-colors">
            Get Started Free
          </Link>
          <Link to="/discover" className="border border-cream/30 text-cream hover:bg-cream/10 px-7 py-3.5 rounded font-sans font-semibold text-sm transition-all">
            Browse Advocates
          </Link>
        </div>
      </section>
    </div>
  );
}
