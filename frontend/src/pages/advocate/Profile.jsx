import { useState } from "react";
import DashboardLayout from "../../components/common/DashboardLayout.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { authAPI } from "../../api.js";

export default function AdvocateProfile() {
  const { user, updateUser } = useAuth();
  const provider = user?.advocateProfile;
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: user?.name||"", phone: user?.phone||"" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSave = async () => { setError(""); try { const data = await authAPI.updateProfile(form); updateUser(data.user); setMessage("Profile updated!"); setEditing(false); } catch(err){ setError(err.message); } };

  const tierColors = { Bronze:"bg-[#a9744f]", Silver:"bg-[#8a94a6]", Gold:"bg-gradient-to-r from-[#c9a24b] to-[#d4b96a]", Platinum:"bg-gradient-to-r from-[#5b6b8c] to-[#7b8ba8]" };
  const inputClass = "w-full px-4 py-3 border border-rule rounded-lg bg-cream text-ink font-sans text-sm focus:outline-none focus:border-sepia focus:ring-2 focus:ring-sepia/10";

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center border-b-4 border-double border-ink mb-8 pb-4">
        <h1 className="font-serif text-3xl font-black text-ink">My Profile</h1>
        <button onClick={()=>setEditing(!editing)} className="border border-rule text-ink px-4 py-2 rounded-lg font-sans text-xs font-medium hover:border-sepia transition-colors">
          {editing ? "Cancel" : "✏️ Edit Profile"}
        </button>
      </div>
      {message && <div className="bg-success-bg text-success px-4 py-2.5 rounded-lg text-sm font-sans mb-4">{message}</div>}
      {error && <div className="bg-danger-bg text-danger px-4 py-2.5 rounded-lg text-sm font-sans mb-4">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Main profile card */}
        <div className="bg-parchment border border-rule rounded-lg p-6 text-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-navy to-navy-light text-cream flex items-center justify-center text-3xl font-serif font-black mx-auto mb-4">
            {user?.name?.charAt(0)?.toUpperCase()}
          </div>
          {editing ? (
            <div className="space-y-3 text-left">
              <div><label className="block text-xs font-sans font-semibold text-ink mb-1">Name</label><input className={inputClass} value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></div>
              <div><label className="block text-xs font-sans font-semibold text-ink mb-1">Phone</label><input className={inputClass} value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})}/></div>
              <button onClick={handleSave} className="w-full bg-accent hover:bg-accent-dark text-white py-2.5 rounded-lg font-sans text-sm font-semibold transition-colors">Save Changes</button>
            </div>
          ) : (
            <>
              <h2 className="font-serif text-xl font-bold text-ink">{user?.name}</h2>
              <p className="text-ink-muted font-sans text-sm">{user?.email}</p>
              <p className="text-ink-faint font-sans text-xs mt-1">{user?.phone || "No phone added"}</p>
              <span className={`inline-block mt-3 px-3 py-1 rounded-full text-xs font-sans font-semibold ${user?.isVerified ? "bg-success-bg text-success" : "bg-warning-bg text-warning"}`}>
                {user?.isVerified ? "✅ Verified" : "⏳ Unverified"}
              </span>
            </>
          )}
        </div>

        {/* Tier & Stats */}
        <div className="bg-parchment border border-rule rounded-lg p-6">
          <h3 className="font-serif text-lg font-bold text-ink mb-4 border-b border-rule pb-2">Tier & Rating</h3>
          <div className="text-center mb-4">
            <span className={`inline-block px-8 py-2 rounded-full text-white font-sans font-bold ${tierColors[provider?.tier]||"bg-[#a9744f]"}`}>{provider?.tier||"Bronze"}</span>
          </div>
          <div className="flex justify-around mt-4 pt-4 border-t border-rule">
            {[
              {v:`⭐ ${provider?.rating?.toFixed(1)||"0.0"}`, l:"Rating"},
              {v:provider?.engagementsCount||0, l:"Engagements"},
              {v:provider?.referralCount||0, l:"Referrals"},
            ].map(s=>(
              <div key={s.l} className="text-center">
                <div className="font-serif font-bold text-lg text-ink">{s.v}</div>
                <div className="text-[10px] font-sans text-ink-faint">{s.l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Professional details */}
        <div className="bg-parchment border border-rule rounded-lg p-6">
          <h3 className="font-serif text-lg font-bold text-ink mb-4 border-b border-rule pb-2">Professional Details</h3>
          <div className="space-y-3">
            {[
              ["Type", provider?.providerType?.replace("_"," ")||"—"],
              ["Enrollment #", provider?.enrollmentNumber||"—"],
              ["Location", `${provider?.location?.district||""}, ${provider?.location?.state||""}`],
              ["Specializations", provider?.specialization?.join(", ")||"—"],
              ["Languages", provider?.languages?.join(", ")||"—"],
            ].map(([label, val])=>(
              <div key={label} className="flex justify-between items-center py-2 border-b border-rule/50 last:border-b-0">
                <span className="text-xs font-sans text-ink-muted font-medium">{label}</span>
                <span className="text-sm font-sans font-semibold text-ink capitalize">{val}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Badges */}
        <div className="bg-parchment border border-rule rounded-lg p-6">
          <h3 className="font-serif text-lg font-bold text-ink mb-4 border-b border-rule pb-2">Badges Earned</h3>
          <div className="flex flex-wrap gap-3">
            {provider?.badges?.length > 0 ? provider.badges.map(b=>(
              <div key={b} className="flex items-center gap-2 px-3 py-2 bg-cream rounded-lg border border-rule">
                <span className="text-xl">🏅</span><span className="font-sans font-semibold text-sm text-ink">{b}</span>
              </div>
            )) : <p className="text-ink-faint text-sm font-sans italic">Complete more cases to earn badges!</p>}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
