import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { authAPI } from "../../api.js";

export default function VerifyOTP() {
  const navigate = useNavigate();
  const email = useLocation().state?.email || "";
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleVerify = async (e) => {
    e.preventDefault(); setError(""); setLoading(true);
    try { await authAPI.verifyOTP({email, otp}); setSuccess("Verified! Redirecting..."); setTimeout(()=>navigate("/login"),1500); }
    catch(err){ setError(err.message); } finally{ setLoading(false); }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-5 py-10 bg-gradient-to-b from-cream to-parchment">
      <div className="bg-cream border border-rule rounded-xl p-10 w-full max-w-md shadow-lg text-center">
        <span className="text-5xl block mb-4">📧</span>
        <h1 className="font-serif text-2xl font-black text-ink mb-1">Verify Your Email</h1>
        <p className="text-ink-muted font-sans text-sm italic mb-6">We sent a 6-digit OTP to <strong>{email}</strong></p>
        {error && <div className="bg-danger-bg text-danger px-4 py-2.5 rounded-lg text-sm font-sans mb-4">{error}</div>}
        {success && <div className="bg-success-bg text-success px-4 py-2.5 rounded-lg text-sm font-sans mb-4">{success}</div>}
        <form onSubmit={handleVerify} className="flex flex-col gap-4">
          <input type="text" placeholder="123456" value={otp} onChange={(e)=>setOtp(e.target.value)} maxLength={6} required
            className="text-center text-4xl font-serif font-bold tracking-[12px] px-4 py-4 border border-rule rounded-lg bg-cream text-ink focus:outline-none focus:border-sepia" />
          <button type="submit" className="w-full bg-accent hover:bg-accent-dark text-white py-3 rounded-lg font-sans font-semibold text-sm disabled:opacity-50" disabled={loading}>{loading?"Verifying...":"Verify OTP"}</button>
        </form>
        <p className="text-ink-faint font-sans text-xs mt-6 italic">Check API response for OTP (dev mode)</p>
      </div>
    </div>
  );
}
