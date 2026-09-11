import { useState } from "react";
import { Link } from "react-router-dom";
import { authAPI } from "../../api.js";

export default function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const inputClass = "w-full px-4 py-3 border border-rule rounded-lg bg-cream text-ink font-sans text-sm focus:outline-none focus:border-sepia focus:ring-2 focus:ring-sepia/10";

  const handleSendOTP = async (e) => { e.preventDefault(); setError(""); setLoading(true); try { await authAPI.forgotPassword({email}); setSuccess("OTP sent!"); setStep(2); } catch(err){ setError(err.message); } finally{ setLoading(false); } };
  const handleReset = async (e) => { e.preventDefault(); setError(""); if(newPassword.length<6) return setError("Min 6 chars"); setLoading(true); try { await authAPI.resetPassword({email,otp,newPassword}); setSuccess("Password reset!"); setStep(3); } catch(err){ setError(err.message); } finally{ setLoading(false); } };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-5 py-10 bg-gradient-to-b from-cream to-parchment">
      <div className="bg-cream border border-rule rounded-xl p-10 w-full max-w-md shadow-lg">
        <div className="text-center mb-6">
          <h1 className="font-serif text-2xl font-black text-ink mb-1">Reset Password</h1>
          <p className="text-ink-muted font-sans text-sm italic">{step===1?"Enter your email":step===2?"Enter OTP & new password":"All done!"}</p>
        </div>
        {error && <div className="bg-danger-bg text-danger px-4 py-2.5 rounded-lg text-sm font-sans mb-4">{error}</div>}
        {success && <div className="bg-success-bg text-success px-4 py-2.5 rounded-lg text-sm font-sans mb-4">{success}</div>}
        {step===1 && <form onSubmit={handleSendOTP} className="flex flex-col gap-4"><div><label className="block text-xs font-sans font-semibold text-ink mb-1.5">Email</label><input type="email" className={inputClass} value={email} onChange={e=>setEmail(e.target.value)} required/></div><button type="submit" className="w-full bg-accent hover:bg-accent-dark text-white py-3 rounded-lg font-sans font-semibold text-sm disabled:opacity-50" disabled={loading}>{loading?"Sending...":"Send Reset OTP"}</button></form>}
        {step===2 && <form onSubmit={handleReset} className="flex flex-col gap-4"><div><label className="block text-xs font-sans font-semibold text-ink mb-1.5">OTP</label><input type="text" className={inputClass} value={otp} onChange={e=>setOtp(e.target.value)} maxLength={6} required/></div><div><label className="block text-xs font-sans font-semibold text-ink mb-1.5">New Password</label><input type="password" className={inputClass} value={newPassword} onChange={e=>setNewPassword(e.target.value)} required/></div><button type="submit" className="w-full bg-accent hover:bg-accent-dark text-white py-3 rounded-lg font-sans font-semibold text-sm disabled:opacity-50" disabled={loading}>{loading?"Resetting...":"Reset Password"}</button></form>}
        {step===3 && <Link to="/login" className="block w-full bg-accent text-white py-3 rounded-lg font-sans font-semibold text-sm text-center">Go to Login</Link>}
        <div className="text-center mt-6"><Link to="/login" className="text-sepia font-sans text-sm hover:text-accent">← Back to Login</Link></div>
      </div>
    </div>
  );
}
