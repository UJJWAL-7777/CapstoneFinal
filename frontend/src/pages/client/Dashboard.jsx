import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../../components/common/DashboardLayout.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { casesAPI, fetchProviders } from "../../api.js";

const statusStyle = s => s==="active"?"bg-info-bg text-info":s==="pending"?"bg-warning-bg text-warning":s==="resolved"?"bg-success-bg text-success":"bg-rule text-ink-muted";

export default function ClientDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recommended, setRecommended] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([casesAPI.getStats(), fetchProviders({limit:4})])
      .then(([s,p])=>{setStats(s);setRecommended(p.providers||[]);})
      .catch(()=>{}).finally(()=>setLoading(false));
  }, []);

  return (
    <DashboardLayout>
      <div className="border-b-4 border-double border-ink mb-8 pb-4">
        <h1 className="font-serif text-3xl font-black text-ink">Welcome back, {user?.name} 👋</h1>
        <p className="text-ink-muted font-sans text-sm italic mt-1">Your legal dashboard</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          {icon:"📁",val:stats?.active||0,label:"Active",border:"border-l-info"},
          {icon:"⏳",val:stats?.pending||0,label:"Pending",border:"border-l-warning"},
          {icon:"✅",val:stats?.resolved||0,label:"Resolved",border:"border-l-success"},
          {icon:"📊",val:stats?.total||0,label:"Total",border:"border-l-ink"},
        ].map((s,i)=>(
          <div key={i} className={`bg-parchment border border-rule ${s.border} border-l-4 rounded-lg p-5 text-center hover:-translate-y-0.5 transition-transform`}>
            <span className="text-2xl block mb-2">{s.icon}</span>
            <div className="text-3xl font-serif font-black text-ink">{s.val}</div>
            <div className="text-xs font-sans text-ink-muted font-medium mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-parchment border border-rule rounded-lg p-6">
          <div className="flex justify-between items-center mb-4 border-b border-rule pb-3">
            <h3 className="font-serif text-lg font-bold text-ink">Recent Cases</h3>
            <Link to="/client/cases" className="text-accent text-xs font-sans font-semibold hover:underline">View All →</Link>
          </div>
          {loading ? <p className="text-ink-muted text-sm font-sans">Loading...</p>
          : stats?.recentCases?.length > 0 ? (
            <div className="overflow-x-auto"><table className="w-full text-sm font-sans">
              <thead><tr className="border-b-2 border-rule">{["Case #","Advocate","Status"].map(h=><th key={h} className="text-left py-2 px-2 text-ink-muted text-[10px] font-semibold uppercase tracking-wider">{h}</th>)}</tr></thead>
              <tbody>{stats.recentCases.map(c=>(
                <tr key={c._id} className="border-b border-rule/50 hover:bg-cream/50">
                  <td className="py-2 px-2"><Link to={`/client/cases/${c._id}`} className="text-accent text-xs font-medium hover:underline font-mono">{c.caseNumber}</Link></td>
                  <td className="py-2 px-2 text-xs">{c.advocate?.name||"Unassigned"}</td>
                  <td className="py-2 px-2"><span className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${statusStyle(c.status)}`}>{c.status}</span></td>
                </tr>
              ))}</tbody>
            </table></div>
          ) : <p className="text-ink-faint text-sm font-sans italic text-center py-4">No cases yet. <Link to="/client/search" className="text-accent font-semibold">Find an advocate</Link> to get started!</p>}
        </div>

        <div className="bg-parchment border border-rule rounded-lg p-6">
          <div className="flex justify-between items-center mb-4 border-b border-rule pb-3">
            <h3 className="font-serif text-lg font-bold text-ink">Recommended Advocates</h3>
            <Link to="/client/search" className="text-accent text-xs font-sans font-semibold hover:underline">Browse All →</Link>
          </div>
          {recommended.length > 0 ? (
            <div className="space-y-2">
              {recommended.map(p=>(
                <Link key={p._id} to={`/client/advocates/${p._id}`} className="flex items-center gap-3 p-3 rounded-lg border border-rule hover:border-sepia hover:bg-cream/50 transition-all">
                  <div className="w-9 h-9 rounded-full bg-navy text-cream flex items-center justify-center font-serif font-bold text-sm shrink-0">{p.name?.charAt(0)?.toUpperCase()}</div>
                  <div className="flex-1 min-w-0"><strong className="text-sm font-sans block truncate">{p.name}</strong><span className="text-[10px] font-sans text-ink-muted">{p.specialization?.join(", ")||p.providerType}</span></div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-sans font-bold text-white tier-${p.tier?.toLowerCase()}`}>{p.tier}</span>
                </Link>
              ))}
            </div>
          ) : <p className="text-ink-faint text-sm font-sans italic text-center py-4">No advocates available.</p>}
        </div>
      </div>
    </DashboardLayout>
  );
}
