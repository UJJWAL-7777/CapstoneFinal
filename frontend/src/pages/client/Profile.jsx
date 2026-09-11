import { useState } from "react";
import DashboardLayout from "../../components/common/DashboardLayout.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { authAPI } from "../../api.js";

export default function ClientProfile() {
  const { user, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: user?.name||"", phone: user?.phone||"" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSave = async () => { setError(""); try{ const d = await authAPI.updateProfile(form); updateUser(d.user); setMessage("Updated!"); setEditing(false); }catch(e){setError(e.message);} };

  const inputClass = "w-full px-4 py-3 border border-rule rounded-lg bg-cream text-ink font-sans text-sm focus:outline-none focus:border-sepia focus:ring-2 focus:ring-sepia/10";

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center border-b-4 border-double border-ink mb-8 pb-4">
        <h1 className="font-serif text-3xl font-black text-ink">My Profile</h1>
        <button onClick={()=>setEditing(!editing)} className="border border-rule text-ink px-4 py-2 rounded-lg font-sans text-xs font-medium hover:border-sepia transition-colors">{editing?"Cancel":"✏️ Edit"}</button>
      </div>
      {message && <div className="bg-success-bg text-success px-4 py-2.5 rounded-lg text-sm font-sans mb-4">{message}</div>}
      {error && <div className="bg-danger-bg text-danger px-4 py-2.5 rounded-lg text-sm font-sans mb-4">{error}</div>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-parchment border border-rule rounded-lg p-6 text-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-navy to-navy-light text-cream flex items-center justify-center text-3xl font-serif font-black mx-auto mb-4">{user?.name?.charAt(0)?.toUpperCase()}</div>
          {editing ? (
            <div className="space-y-3 text-left">
              <div><label className="block text-xs font-sans font-semibold text-ink mb-1">Name</label><input className={inputClass} value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></div>
              <div><label className="block text-xs font-sans font-semibold text-ink mb-1">Phone</label><input className={inputClass} value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})}/></div>
              <button onClick={handleSave} className="w-full bg-accent hover:bg-accent-dark text-white py-2.5 rounded-lg font-sans text-sm font-semibold transition-colors">Save</button>
            </div>
          ) : (
            <>
              <h2 className="font-serif text-xl font-bold text-ink">{user?.name}</h2>
              <p className="text-ink-muted font-sans text-sm">{user?.email}</p>
              <p className="text-ink-faint font-sans text-xs mt-1">{user?.phone||"No phone"}</p>
              <span className={`inline-block mt-3 px-3 py-1 rounded-full text-xs font-sans font-semibold ${user?.isVerified?"bg-success-bg text-success":"bg-warning-bg text-warning"}`}>{user?.isVerified?"✅ Verified":"⏳ Unverified"}</span>
            </>
          )}
        </div>
        <div className="bg-parchment border border-rule rounded-lg p-6">
          <h3 className="font-serif text-lg font-bold text-ink mb-4 border-b border-rule pb-2">Account Details</h3>
          <div className="space-y-3">
            {[["Role",user?.role],["Member Since",user?.createdAt?new Date(user.createdAt).toLocaleDateString():"—"],["Verified",user?.isVerified?"Yes":"No"]].map(([l,v])=>(
              <div key={l} className="flex justify-between py-2 border-b border-rule/50 last:border-b-0">
                <span className="text-xs font-sans text-ink-muted">{l}</span><span className="text-sm font-sans font-semibold text-ink capitalize">{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
