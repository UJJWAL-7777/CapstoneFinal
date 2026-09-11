import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const user = await login(form.email, form.password);
      navigate(`/${user.role}/dashboard`);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const inputClass = "w-full px-4 py-3 border border-rule rounded-lg bg-cream text-ink font-sans text-sm focus:outline-none focus:border-sepia focus:ring-2 focus:ring-sepia/10";

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-5 py-10 bg-gradient-to-b from-cream to-parchment">
      <div className="bg-cream border border-rule rounded-xl p-10 w-full max-w-md shadow-lg">
        <div className="text-center mb-8">
          <div className="border-t-4 border-double border-ink mb-4" />
          <h1 className="font-serif text-2xl font-black text-ink mb-1">Welcome Back</h1>
          <p className="text-ink-muted font-sans text-sm italic">Sign in to your LegalConnect account</p>
        </div>

        {error && <div className="bg-danger-bg text-danger px-4 py-2.5 rounded-lg text-sm font-sans font-medium mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-sans font-semibold text-ink mb-1.5">Email Address</label>
            <input id="email" type="email" placeholder="you@example.com" className={inputClass} value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} required />
          </div>
          <div>
            <label className="block text-xs font-sans font-semibold text-ink mb-1.5">Password</label>
            <input id="password" type="password" placeholder="••••••••" className={inputClass} value={form.password} onChange={(e) => setForm({...form, password: e.target.value})} required />
          </div>
          <Link to="/forgot-password" className="text-right text-xs font-sans font-medium text-sepia hover:text-accent -mt-2">
            Forgot password?
          </Link>
          <button type="submit" className="w-full bg-accent hover:bg-accent-dark text-white py-3 rounded-lg font-sans font-semibold text-sm transition-colors disabled:opacity-50" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="text-center mt-8 border-t border-rule pt-6">
          <p className="text-ink-muted font-sans text-sm mb-4">Don&apos;t have an account?</p>
          <div className="flex gap-3 justify-center">
            <Link to="/register/advocate" className="border border-rule text-ink px-4 py-2 rounded-lg font-sans text-xs font-medium hover:border-sepia transition-colors">
              Register as Advocate
            </Link>
            <Link to="/register/client" className="border border-rule text-ink px-4 py-2 rounded-lg font-sans text-xs font-medium hover:border-sepia transition-colors">
              Register as Client
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
