export default function About() {
  return (
    <div>
      <section className="text-center py-16 px-5 bg-navy text-cream">
        <h1 className="font-serif text-4xl font-black mb-3">About LegalConnect</h1>
        <p className="text-cream/60 font-body text-lg">Bridging the gap between clients and legal professionals across India.</p>
      </section>

      <section className="py-16 px-5 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border border-rule">
          {[
            { icon: "🎯", title: "Our Mission", desc: "To democratize access to legal services by creating a transparent, incentive-driven marketplace that connects individuals with verified legal professionals." },
            { icon: "🏛️", title: "The Problem", desc: "Millions of Indians struggle to find affordable, trustworthy legal help. Information asymmetry and geographic barriers make effective connections difficult." },
            { icon: "💡", title: "Our Solution", desc: "LegalConnect uses a gamification-based incentive engine to reward quality service, creating a self-improving ecosystem with transparent ratings." },
            { icon: "📊", title: "Tier System", desc: "Our four-tier system (Bronze → Platinum) rewards advocates based on engagements, ratings, response time, and dispute rates." },
          ].map((item, i) => (
            <div key={i} className={`p-8 ${i % 2 === 0 ? "md:border-r border-rule" : ""} ${i < 2 ? "border-b border-rule" : ""}`}>
              <span className="text-3xl mb-4 block">{item.icon}</span>
              <h3 className="font-serif text-xl font-bold text-ink mb-3">{item.title}</h3>
              <p className="font-body text-ink-muted leading-relaxed text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="text-center py-12 px-5">
        <h2 className="font-serif text-2xl font-bold text-ink mb-6">Built With</h2>
        <div className="flex gap-3 justify-center flex-wrap">
          {["React", "Node.js", "Express", "MongoDB", "JWT Auth", "Tailwind v4"].map((t) => (
            <span key={t} className="px-5 py-2 bg-navy text-cream rounded-full text-sm font-sans font-semibold">{t}</span>
          ))}
        </div>
      </section>
    </div>
  );
}
