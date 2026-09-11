import { useState } from "react";
import DashboardLayout from "../../components/common/DashboardLayout.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { authAPI } from "../../api.js";

export default function AdvocateSettings() {
  const { user, logout } = useAuth();
  const [pw, setPw] = useState({ currentPassword:"", newPassword:"", confirmPassword:"" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = async (e) => {
    e.preventDefault(); setError(""); setMessage("");
    if(pw.newPassword!==pw.confirmPassword) return setError("Passwords do not match");
    if(pw.newPassword.length<6) return setError("Min 6 characters");
    setLoading(true);
    try{ await authAPI.changePassword({currentPassword:pw.currentPassword,newPassword:pw.newPassword}); setMessage("Password changed!"); setPw({currentPassword:"",newPassword:"",confirmPassword:""}); }
    catch(err){setError(err.message);} finally{setLoading(false);}
  };

  const inputClass = "w-full px-4 py-3 border border-rule rounded-lg bg-cream text-ink font-sans text-sm focus:outline-none focus:border-sepia focus:ring-2 focus:ring-sepia/10";

  return (
    <DashboardLayout>
      <div className="border-b-4 border-double border-ink mb-8 pb-4">
        <h1 className="font-serif text-3xl font-black text-ink">Settings</h1>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-parchment border border-rule rounded-lg p-6">
          <h3 className="font-serif text-lg font-bold text-ink mb-4 border-b border-rule pb-2">Account Information</h3>
          <div className="space-y-3">
            {[["Name",user?.name],["Email",user?.email],["Role",user?.role],["Status",user?.isVerified?"✅ Verified":"⏳ Pending"]].map(([l,v])=>(
              <div key={l} className="flex justify-between py-2 border-b border-rule/50 last:border-b-0">
                <span className="text-xs font-sans text-ink-muted">{l}</span><span className="text-sm font-sans font-semibold text-ink capitalize">{v}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-parchment border border-rule rounded-lg p-6">
          <h3 className="font-serif text-lg font-bold text-ink mb-4 border-b border-rule pb-2">Change Password</h3>
          {message && <div className="bg-success-bg text-success px-4 py-2 rounded-lg text-sm font-sans mb-3">{message}</div>}
          {error && <div className="bg-danger-bg text-danger px-4 py-2 rounded-lg text-sm font-sans mb-3">{error}</div>}
          <form onSubmit={handleChange} className="space-y-3">
            <div><label className="block text-xs font-sans font-semibold text-ink mb-1">Current Password</label><input type="password" className={inputClass} value={pw.currentPassword} onChange={e=>setPw({...pw,currentPassword:e.target.value})} required/></div>
            <div><label className="block text-xs font-sans font-semibold text-ink mb-1">New Password</label><input type="password" className={inputClass} value={pw.newPassword} onChange={e=>setPw({...pw,newPassword:e.target.value})} required/></div>
            <div><label className="block text-xs font-sans font-semibold text-ink mb-1">Confirm New</label><input type="password" className={inputClass} value={pw.confirmPassword} onChange={e=>setPw({...pw,confirmPassword:e.target.value})} required/></div>
            <button type="submit" className="w-full bg-accent hover:bg-accent-dark text-white py-2.5 rounded-lg font-sans text-sm font-semibold transition-colors disabled:opacity-50" disabled={loading}>{loading?"Changing...":"Change Password"}</button>
          </form>
        </div>
        <div className="bg-parchment border border-danger/30 rounded-lg p-6">
          <h3 className="font-serif text-lg font-bold text-danger mb-3">Danger Zone</h3>
          <p className="text-ink-muted font-sans text-sm mb-4">Logging out will clear your session.</p>
          <button onClick={logout} className="bg-danger hover:bg-danger/80 text-white px-5 py-2.5 rounded-lg font-sans text-sm font-semibold transition-colors">🚪 Logout</button>
        </div>
      </div>
    </DashboardLayout>
  );
}
