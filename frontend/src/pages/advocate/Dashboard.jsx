import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../../components/common/DashboardLayout.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { casesAPI } from "../../api.js";

export default function AdvocateDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => { casesAPI.getStats().then(setStats).catch(()=>{}).finally(()=>setLoading(false)); }, []);

  const provider = user?.advocateProfile;
  const tierPct = { Bronze:10, Silver:35, Gold:65, Platinum:100 };

  return (
    <DashboardLayout>
      {/* Masthead */}
      <div className="border-b-4 border-double border-ink mb-8 pb-4">
        <h1 className="font-serif text-3xl font-black text-ink">Welcome back, {user?.name} 👋</h1>
        <p className="text-ink-muted font-sans text-sm italic mt-1">Your daily legal brief</p>
      </div>

      {/* Stat boxes */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { icon:"📁", val:stats?.active||0, label:"Active Cases", border:"border-l-info" },
          { icon:"📥", val:stats?.pending||0, label:"Pending Requests", border:"border-l-warning" },
          { icon:"✅", val:stats?.resolved||0, label:"Resolved", border:"border-l-success" },
          { icon:"📊", val:stats?.total||0, label:"Total Cases", border:"border-l-ink" },
        ].map((s,i)=>(
          <div key={i} className={`bg-parchment border border-rule ${s.border} border-l-4 rounded-lg p-5 text-center hover:-translate-y-0.5 transition-transform`}>
            <span className="text-2xl block mb-2">{s.icon}</span>
            <div className="text-3xl font-serif font-black text-ink">{s.val}</div>
            <div className="text-xs font-sans text-ink-muted font-medium mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tier + Badges row */}
      {provider && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
          <div className="bg-parchment border border-rule rounded-lg p-6 text-center">
            <h3 className="font-serif text-lg font-bold text-ink mb-4 border-b border-rule pb-2">Tier Progress</h3>
            <span className={`inline-block px-6 py-1.5 rounded-full text-white font-sans font-bold text-sm tier-${(provider.tier||"Bronze").toLowerCase()}`}>
              {provider.tier || "Bronze"}
            </span>
            <div className="h-2.5 bg-rule rounded-full mt-4 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-sepia to-accent rounded-full transition-all duration-700"
                style={{ width: `${tierPct[provider.tier]||10}%` }} />
            </div>
            <p className="text-xs font-sans text-ink-faint mt-3 italic">
              {provider.tier==="Platinum" ? "🎉 Highest tier reached!" : "Complete more cases to advance"}
            </p>
          </div>
          <div className="bg-parchment border border-rule rounded-lg p-6">
            <h3 className="font-serif text-lg font-bold text-ink mb-4 border-b border-rule pb-2">My Badges</h3>
            <div className="flex flex-wrap gap-2">
              {provider.badges?.length > 0 ? provider.badges.map(b=>(
                <span key={b} className="bg-gradient-to-r from-[#c9a24b] to-[#d4b96a] text-navy px-3 py-1 rounded-full text-xs font-sans font-semibold">{b}</span>
              )) : <p className="text-ink-faint text-sm font-sans italic">Complete cases to earn badges!</p>}
            </div>
          </div>
        </div>
      )}

      {/* Recent cases table */}
      <div className="bg-parchment border border-rule rounded-lg p-6">
        <div className="flex justify-between items-center mb-4 border-b border-rule pb-3">
          <h3 className="font-serif text-lg font-bold text-ink">Recent Cases</h3>
          <Link to="/advocate/cases" className="text-accent text-xs font-sans font-semibold hover:underline">View All →</Link>
        </div>
        {loading ? <p className="text-ink-muted text-sm font-sans">Loading...</p>
        : stats?.recentCases?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm font-sans">
              <thead><tr className="border-b-2 border-rule">
                {["Case #","Client","Type","Status","Updated"].map(h=><th key={h} className="text-left py-2.5 px-3 text-ink-muted text-xs font-semibold uppercase tracking-wider">{h}</th>)}
              </tr></thead>
              <tbody>
                {stats.recentCases.map(c=>(
                  <tr key={c._id} className="border-b border-rule/50 hover:bg-cream/50 transition-colors">
                    <td className="py-2.5 px-3"><Link to={`/advocate/cases/${c._id}`} className="text-accent font-medium hover:underline font-mono text-xs">{c.caseNumber}</Link></td>
                    <td className="py-2.5 px-3">{c.client?.name||"—"}</td>
                    <td className="py-2.5 px-3">{c.caseType}</td>
                    <td className="py-2.5 px-3"><span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${c.status==="active"?"bg-info-bg text-info":c.status==="pending"?"bg-warning-bg text-warning":c.status==="resolved"?"bg-success-bg text-success":"bg-rule text-ink-muted"}`}>{c.status}</span></td>
                    <td className="py-2.5 px-3 text-ink-faint text-xs">{new Date(c.updatedAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <p className="text-ink-faint text-sm font-sans italic text-center py-6">No cases yet. Share your profile to get client requests!</p>}
      </div>
    </DashboardLayout>
  );
}
