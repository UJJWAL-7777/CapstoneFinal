import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authAPI } from "../../api.js";

const SPECIALIZATIONS = ["Criminal","Civil","Family","Property","Corporate","Labour","Tax","Consumer","Constitutional","Human Rights","Intellectual Property","Banking","Environmental","Cyber"];
const PROVIDER_TYPES = [{value:"advocate",label:"Advocate"},{value:"arbitrator",label:"Arbitrator"},{value:"mediator",label:"Mediator"},{value:"notary",label:"Notary"},{value:"document_writer",label:"Document Writer"}];

export default function RegisterAdvocate() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name:"",email:"",password:"",confirmPassword:"",phone:"",providerType:"advocate",enrollmentNumber:"",dateOfEnrollment:"",specialization:[],state:"",district:"",languages:"" });

  const update = (key) => (e) => setForm({...form, [key]: e.target.value});
  const toggleSpec = (spec) => setForm(prev => ({...prev, specialization: prev.specialization.includes(spec) ? prev.specialization.filter(s=>s!==spec) : [...prev.specialization, spec]}));

  const nextStep = () => {
    setError("");
    if (step===1) {
      if (!form.name||!form.email||!form.password) return setError("Fill in all required fields");
      if (form.password!==form.confirmPassword) return setError("Passwords do not match");
      if (form.password.length<6) return setError("Password must be at least 6 characters");
    }
    if (step===2 && !form.enrollmentNumber) return setError("Enrollment number is required");
    setStep(step+1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(""); setLoading(true);
    try {
      const data = await authAPI.registerAdvocate({...form, languages: form.languages.split(",").map(l=>l.trim()).filter(Boolean)});
      localStorage.setItem("lc_token", data.token);
      navigate("/verify-otp", {state:{email: form.email}});
    } catch(err){ setError(err.message); }
    finally{ setLoading(false); }
  };

  const inputClass = "w-full px-4 py-3 border border-rule rounded-lg bg-cream text-ink font-sans text-sm focus:outline-none focus:border-sepia focus:ring-2 focus:ring-sepia/10";

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-5 py-10 bg-gradient-to-b from-cream to-parchment">
      <div className="bg-cream border border-rule rounded-xl p-10 w-full max-w-xl shadow-lg">
        <div className="text-center mb-6">
          <div className="border-t-4 border-double border-ink mb-4" />
          <h1 className="font-serif text-2xl font-black text-ink mb-1">Register as Advocate</h1>
          <p className="text-ink-muted font-sans text-sm italic">Create your professional account on LegalConnect</p>
        </div>

        {/* Steps */}
        <div className="flex justify-center gap-8 mb-6">
          {[{n:1,l:"Personal"},{n:2,l:"Professional"},{n:3,l:"Expertise"}].map(s=>(
            <div key={s.n} className={`flex items-center gap-2 text-xs font-sans font-medium ${step>=s.n?"text-accent":"text-ink-faint"}`}>
              <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${step>=s.n?"bg-accent text-white":"bg-rule text-ink-faint"}`}>{s.n}</span>
              <span className="max-sm:hidden">{s.l}</span>
            </div>
          ))}
        </div>

        {error && <div className="bg-danger-bg text-danger px-4 py-2.5 rounded-lg text-sm font-sans font-medium mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {step===1 && <>
            <div><label className="block text-xs font-sans font-semibold text-ink mb-1.5">Full Name *</label><input type="text" placeholder="Adv. Priya Sharma" className={inputClass} value={form.name} onChange={update("name")} required/></div>
            <div className="grid grid-cols-2 gap-3 max-sm:grid-cols-1">
              <div><label className="block text-xs font-sans font-semibold text-ink mb-1.5">Email *</label><input type="email" placeholder="priya@example.com" className={inputClass} value={form.email} onChange={update("email")} required/></div>
              <div><label className="block text-xs font-sans font-semibold text-ink mb-1.5">Phone</label><input type="tel" placeholder="+91 98765 43210" className={inputClass} value={form.phone} onChange={update("phone")}/></div>
            </div>
            <div className="grid grid-cols-2 gap-3 max-sm:grid-cols-1">
              <div><label className="block text-xs font-sans font-semibold text-ink mb-1.5">Password *</label><input type="password" placeholder="Min 6 chars" className={inputClass} value={form.password} onChange={update("password")} required/></div>
              <div><label className="block text-xs font-sans font-semibold text-ink mb-1.5">Confirm Password *</label><input type="password" placeholder="Re-enter" className={inputClass} value={form.confirmPassword} onChange={update("confirmPassword")} required/></div>
            </div>
          </>}
          {step===2 && <>
            <div><label className="block text-xs font-sans font-semibold text-ink mb-1.5">Provider Type *</label><select className={inputClass} value={form.providerType} onChange={update("providerType")}>{PROVIDER_TYPES.map(t=><option key={t.value} value={t.value}>{t.label}</option>)}</select></div>
            <div className="grid grid-cols-2 gap-3 max-sm:grid-cols-1">
              <div><label className="block text-xs font-sans font-semibold text-ink mb-1.5">Enrollment # *</label><input type="text" placeholder="BAR/2020/12345" className={inputClass} value={form.enrollmentNumber} onChange={update("enrollmentNumber")} required/></div>
              <div><label className="block text-xs font-sans font-semibold text-ink mb-1.5">Date of Enrollment</label><input type="date" className={inputClass} value={form.dateOfEnrollment} onChange={update("dateOfEnrollment")}/></div>
            </div>
            <div className="grid grid-cols-2 gap-3 max-sm:grid-cols-1">
              <div><label className="block text-xs font-sans font-semibold text-ink mb-1.5">State</label><input type="text" placeholder="Maharashtra" className={inputClass} value={form.state} onChange={update("state")}/></div>
              <div><label className="block text-xs font-sans font-semibold text-ink mb-1.5">District</label><input type="text" placeholder="Mumbai" className={inputClass} value={form.district} onChange={update("district")}/></div>
            </div>
            <div><label className="block text-xs font-sans font-semibold text-ink mb-1.5">Languages (comma-separated)</label><input type="text" placeholder="Hindi, English, Marathi" className={inputClass} value={form.languages} onChange={update("languages")}/></div>
          </>}
          {step===3 && <div>
            <label className="block text-xs font-sans font-semibold text-ink mb-3">Select your specializations</label>
            <div className="flex flex-wrap gap-2">
              {SPECIALIZATIONS.map(spec=>(
                <button key={spec} type="button" onClick={()=>toggleSpec(spec)}
                  className={`px-4 py-2 rounded-full text-xs font-sans font-medium border transition-all ${form.specialization.includes(spec)?"bg-accent text-white border-accent":"border-rule text-ink hover:border-sepia"}`}>
                  {spec}
                </button>
              ))}
            </div>
          </div>}

          <div className="flex justify-between gap-3 mt-2">
            {step>1 && <button type="button" onClick={()=>setStep(step-1)} className="flex-1 border border-rule text-ink py-3 rounded-lg font-sans text-sm font-medium hover:border-sepia transition-colors">← Back</button>}
            {step<3 ? <button type="button" onClick={nextStep} className="flex-1 bg-accent hover:bg-accent-dark text-white py-3 rounded-lg font-sans text-sm font-semibold transition-colors">Next →</button>
            : <button type="submit" className="flex-1 bg-accent hover:bg-accent-dark text-white py-3 rounded-lg font-sans text-sm font-semibold transition-colors disabled:opacity-50" disabled={loading}>{loading?"Creating...":"Create Account"}</button>}
          </div>
        </form>

        <div className="text-center mt-6 text-ink-muted font-sans text-sm">
          Already have an account? <Link to="/login" className="text-accent font-semibold">Sign In</Link>
        </div>
      </div>
    </div>
  );
}
