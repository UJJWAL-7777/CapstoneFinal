import { useState } from "react";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const handleSubmit = (e) => { e.preventDefault(); setSubmitted(true); };

  const inputClass = "w-full px-4 py-3 border border-rule rounded-lg bg-cream text-ink font-sans text-sm focus:outline-none focus:border-sepia focus:ring-2 focus:ring-sepia/10 transition-all";

  return (
    <div>
      <section className="text-center py-16 px-5 bg-navy text-cream">
        <h1 className="font-serif text-4xl font-black mb-3">Contact Us</h1>
        <p className="text-cream/60 font-body text-lg">Have questions? We&apos;d love to hear from you.</p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_1.5fr] gap-10 max-w-4xl mx-auto py-12 px-5">
        <div className="flex flex-col gap-6 pt-4">
          {[
            { icon: "📧", title: "Email", info: "support@legalconnect.in" },
            { icon: "📞", title: "Phone", info: "+91 98765 43210" },
            { icon: "📍", title: "Address", info: "New Delhi, India" },
          ].map((c) => (
            <div key={c.title} className="flex gap-4 items-start">
              <span className="text-2xl">{c.icon}</span>
              <div>
                <h3 className="font-serif font-bold text-ink">{c.title}</h3>
                <p className="text-ink-muted font-sans text-sm">{c.info}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-parchment border border-rule rounded-lg p-8">
          {submitted ? (
            <div className="text-center py-10">
              <span className="text-5xl block mb-4">✅</span>
              <h3 className="font-serif text-xl font-bold text-ink mb-2">Message Sent!</h3>
              <p className="text-ink-muted font-sans text-sm mb-6">We&apos;ll get back to you within 24 hours.</p>
              <button onClick={() => { setSubmitted(false); setForm({ name: "", email: "", subject: "", message: "" }); }}
                className="border border-rule text-ink px-5 py-2 rounded font-sans text-sm font-medium hover:border-sepia transition-colors">
                Send Another
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div><label className="block text-xs font-sans font-semibold text-ink mb-1.5">Your Name</label><input type="text" className={inputClass} value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} required /></div>
              <div><label className="block text-xs font-sans font-semibold text-ink mb-1.5">Email</label><input type="email" className={inputClass} value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} required /></div>
              <div><label className="block text-xs font-sans font-semibold text-ink mb-1.5">Subject</label><input type="text" className={inputClass} value={form.subject} onChange={(e) => setForm({...form, subject: e.target.value})} required /></div>
              <div><label className="block text-xs font-sans font-semibold text-ink mb-1.5">Message</label><textarea rows={5} className={inputClass + " resize-y"} value={form.message} onChange={(e) => setForm({...form, message: e.target.value})} required /></div>
              <button type="submit" className="w-full bg-accent hover:bg-accent-dark text-white py-3 rounded font-sans font-semibold text-sm transition-colors">
                Send Message
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
