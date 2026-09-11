import { useEffect, useState } from "react";
import DashboardLayout from "../../components/common/DashboardLayout.jsx";
import { casesAPI } from "../../api.js";

const TYPES = ["","Criminal","Civil","Family","Property","Corporate","Labour","Tax","Consumer","Constitutional","Other"];

export default function AdvocateHistory() {
  const [cases, setCases] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ caseType:"", fromDate:"", toDate:"" });

  useEffect(() => { setLoading(true); casesAPI.getHistory(filters).then(d=>{setCases(d.cases);setTotal(d.total);}).catch(()=>{}).finally(()=>setLoading(false)); }, [filters]);

  const inputClass = "px-3 py-2.5 border border-rule rounded-lg bg-cream text-ink font-sans text-sm focus:outline-none focus:border-sepia";

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center border-b-4 border-double border-ink mb-6 pb-4">
        <h1 className="font-serif text-3xl font-black text-ink">Case History</h1>
        <span className="bg-parchment text-accent px-3 py-1 rounded-full text-xs font-sans font-semibold border border-rule">{total} cases</span>
      </div>
      <div className="bg-parchment border border-rule rounded-lg px-5 py-3 flex gap-3 flex-wrap items-center mb-5">
        <select value={filters.caseType} onChange={e=>setFilters({...filters,caseType:e.target.value})} className={inputClass}>
          <option value="">All Types</option>{TYPES.filter(Boolean).map(t=><option key={t} value={t}>{t}</option>)}
        </select>
        <input type="date" value={filters.fromDate} onChange={e=>setFilters({...filters,fromDate:e.target.value})} className={inputClass}/>
        <input type="date" value={filters.toDate} onChange={e=>setFilters({...filters,toDate:e.target.value})} className={inputClass}/>
      </div>
      <div className="bg-parchment border border-rule rounded-lg p-5">
        {loading ? <p className="text-ink-muted text-sm font-sans text-center py-6">Loading...</p>
        : cases.length > 0 ? (
          <div className="overflow-x-auto"><table className="w-full text-sm font-sans">
            <thead><tr className="border-b-2 border-rule">{["Case #","Title","Client","Type","Outcome","Closed"].map(h=><th key={h} className="text-left py-2.5 px-3 text-ink-muted text-xs font-semibold uppercase tracking-wider">{h}</th>)}</tr></thead>
            <tbody>{cases.map(c=>(
              <tr key={c._id} className="border-b border-rule/50 hover:bg-cream/50"><td className="py-2.5 px-3 font-mono text-xs text-ink-muted">{c.caseNumber}</td><td className="py-2.5 px-3">{c.title}</td><td className="py-2.5 px-3">{c.client?.name||"—"}</td><td className="py-2.5 px-3">{c.caseType}</td><td className="py-2.5 px-3">{c.outcome||"—"}</td><td className="py-2.5 px-3 text-ink-faint text-xs">{new Date(c.updatedAt).toLocaleDateString()}</td></tr>
            ))}</tbody>
          </table></div>
        ) : <p className="text-ink-faint text-sm font-sans italic text-center py-6">No resolved or closed cases found.</p>}
      </div>
    </DashboardLayout>
  );
}
