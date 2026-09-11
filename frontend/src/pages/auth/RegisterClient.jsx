import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authAPI } from "../../api.js";

export default function RegisterClient() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name:"",email:"",password:"",confirmPassword:"",phone:"" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const update = (key) => (e) => setForm({...form, [key]: e.target.value});

  const handleSubmit = async (e) => {
    e.preventDefault(); setError("");
    if (form.password!==form.confirmPassword) return setError("Passwords do not match");
    if (form.password.length<6) return setError("Min 6 characters");
    setLoading(true);
    try {
      const data = await authAPI.registerClient(form);
      localStorage.setItem("lc_token", data.token);
      navigate("/verify-otp", {state:{email: form.email}});
    } catch(err){ setError(err.message); } finally{ setLoading(false); }
  };

  const inputClass = "w-full px-4 py-3 border border-rule rounded-lg bg-cream text-ink font-sans text-sm focus:outline-none focus:border-sepia focus:ring-2 focus:ring-sepia/10";

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-5 py-10 bg-gradient-to-b from-cream to-parchment">
      <div className="bg-cream border border-rule rounded-xl p-10 w-full max-w-md shadow-lg">
        <div className="text-center mb-8">
          <div className="border-t-4 border-double border-ink mb-4" />
          <h1 className="font-serif text-2xl font-black text-ink mb-1">Register as Client</h1>
          <p className="text-ink-muted font-sans text-sm italic">Find the right legal help on LegalConnect</p>
        </div>
        {error && <div className="bg-danger-bg text-danger px-4 py-2.5 rounded-lg text-sm font-sans font-medium mb-4">{error}</div>}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div><label className="block text-xs font-sans font-semibold text-ink mb-1.5">Full Name *</label><input type="text" placeholder="Rahul Singh" className={inputClass} value={form.name} onChange={update("name")} required/></div>
          <div><label className="block text-xs font-sans font-semibold text-ink mb-1.5">Email *</label><input type="email" placeholder="rahul@example.com" className={inputClass} value={form.email} onChange={update("email")} required/></div>
          <div><label className="block text-xs font-sans font-semibold text-ink mb-1.5">Phone</label><input type="tel" placeholder="+91 98765 43210" className={inputClass} value={form.phone} onChange={update("phone")}/></div>
          <div><label className="block text-xs font-sans font-semibold text-ink mb-1.5">Password *</label><input type="password" placeholder="Min 6 characters" className={inputClass} value={form.password} onChange={update("password")} required/></div>
          <div><label className="block text-xs font-sans font-semibold text-ink mb-1.5">Confirm Password *</label><input type="password" placeholder="Re-enter" className={inputClass} value={form.confirmPassword} onChange={update("confirmPassword")} required/></div>
          <button type="submit" className="w-full bg-accent hover:bg-accent-dark text-white py-3 rounded-lg font-sans font-semibold text-sm transition-colors disabled:opacity-50 mt-2" disabled={loading}>{loading?"Creating...":"Create Account"}</button>
        </form>
        <div className="text-center mt-6 text-ink-muted font-sans text-sm">
          Already have an account? <Link to="/login" className="text-accent font-semibold">Sign In</Link><br/>
          Are you an advocate? <Link to="/register/advocate" className="text-accent font-semibold">Register here</Link>
        </div>
      </div>
    </div>
  );
}
