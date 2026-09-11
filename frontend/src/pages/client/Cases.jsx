import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../../components/common/DashboardLayout.jsx";
import { casesAPI } from "../../api.js";

const TABS = ["all","pending","active","in_progress","resolved","closed"];
const statusStyle = s => s==="active"?"bg-info-bg text-info":s==="pending"?"bg-warning-bg text-warning":s==="resolved"?"bg-success-bg text-success":s==="in_progress"?"bg-[#f0f0ff] text-[#6d28d9]":"bg-rule text-ink-muted";

export default function ClientCases() {
  const [cases, setCases] = useState([]);
  const [total, setTotal] = useState(0);
  const [tab, setTab] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(()=>{setLoading(true);casesAPI.getAll(tab!=="all"?{status:tab}:{}).then(d=>{setCases(d.cases);setTotal(d.total);}).catch(()=>{}).finally(()=>setLoading(false));}, [tab]);

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center border-b-4 border-double border-ink mb-6 pb-4">
        <h1 className="font-serif text-3xl font-black text-ink">My Cases</h1>
        <span className="bg-parchment text-accent px-3 py-1 rounded-full text-xs font-sans font-semibold border border-rule">{total} total</span>
      </div>
      <div className="flex gap-1 border-b-2 border-rule mb-5 overflow-x-auto">
        {TABS.map(t=><button key={t} onClick={()=>setTab(t)} className={`px-4 py-2.5 text-sm font-sans font-medium capitalize whitespace-nowrap border-b-2 -mb-[2px] transition-colors ${tab===t?"text-accent border-accent font-semibold":"text-ink-muted border-transparent hover:text-ink"}`}>{t.replace("_"," ")}</button>)}
      </div>
      <div className="bg-parchment border border-rule rounded-lg p-5">
        {loading ? <p className="text-ink-muted text-sm font-sans text-center py-6">Loading...</p>
        : cases.length > 0 ? (
          <div className="overflow-x-auto"><table className="w-full text-sm font-sans">
            <thead><tr className="border-b-2 border-rule">{["Case #","Title","Advocate","Type","Status","Created",""].map(h=><th key={h} className="text-left py-2.5 px-3 text-ink-muted text-xs font-semibold uppercase tracking-wider">{h}</th>)}</tr></thead>
            <tbody>{cases.map(c=>(
              <tr key={c._id} className="border-b border-rule/50 hover:bg-cream/50 transition-colors">
                <td className="py-2.5 px-3 font-mono text-xs text-ink-muted">{c.caseNumber}</td>
                <td className="py-2.5 px-3 font-medium">{c.title}</td>
                <td className="py-2.5 px-3">{c.advocate?.name||"Unassigned"}</td>
                <td className="py-2.5 px-3">{c.caseType}</td>
                <td className="py-2.5 px-3"><span className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${statusStyle(c.status)}`}>{c.status}</span></td>
                <td className="py-2.5 px-3 text-ink-faint text-xs">{new Date(c.createdAt).toLocaleDateString()}</td>
                <td className="py-2.5 px-3"><Link to={`/client/cases/${c._id}`} className="text-accent text-xs font-semibold hover:underline">View</Link></td>
              </tr>
            ))}</tbody>
          </table></div>
        ) : <p className="text-ink-faint text-sm font-sans italic text-center py-6">No cases found.</p>}
      </div>
    </DashboardLayout>
  );
}
