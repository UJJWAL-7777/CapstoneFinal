import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../../components/common/DashboardLayout.jsx";
import { fetchProviders } from "../../api.js";

const TYPES = ["advocate","arbitrator","mediator","notary","document_writer"];
const TIERS = ["Bronze","Silver","Gold","Platinum"];

export default function ClientSearch() {
  const [filters, setFilters] = useState({});
  const [providers, setProviders] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const update = k => e => setFilters({...filters, [k]: e.target.value});

  useEffect(()=>{setLoading(true);const t=setTimeout(()=>{fetchProviders(filters).then(d=>{setProviders(d.providers);setTotal(d.total);}).catch(()=>{}).finally(()=>setLoading(false));},300);return()=>clearTimeout(t);}, [filters]);

  const tierColors = {Bronze:"bg-[#a9744f]",Silver:"bg-[#8a94a6]",Gold:"bg-gradient-to-r from-[#c9a24b] to-[#d4b96a]",Platinum:"bg-gradient-to-r from-[#5b6b8c] to-[#7b8ba8]"};
  const inputClass = "px-3 py-2.5 border border-rule rounded-lg bg-cream text-ink font-sans text-sm focus:outline-none focus:border-sepia";

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center border-b-4 border-double border-ink mb-6 pb-4">
        <h1 className="font-serif text-3xl font-black text-ink">Find an Advocate</h1>
        <span className="bg-parchment text-accent px-3 py-1 rounded-full text-xs font-sans font-semibold border border-rule">{total} found</span>
      </div>

      <div className="bg-parchment border border-rule rounded-lg px-5 py-3 flex gap-3 flex-wrap items-center mb-6">
        <input type="text" placeholder="Search by name or specialization..." value={filters.q||""} onChange={update("q")} className={`${inputClass} flex-1 min-w-[200px]`}/>
        <select value={filters.type||""} onChange={update("type")} className={inputClass}><option value="">All Types</option>{TYPES.map(t=><option key={t} value={t}>{t.replace("_"," ")}</option>)}</select>
        <input type="text" placeholder="District" value={filters.district||""} onChange={update("district")} className={inputClass}/>
        <select value={filters.tier||""} onChange={update("tier")} className={inputClass}><option value="">Any Tier</option>{TIERS.map(t=><option key={t} value={t}>{t}</option>)}</select>
      </div>

      {loading ? <p className="text-ink-muted text-sm font-sans text-center py-6">Searching...</p>
      : providers.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {providers.map(p=>(
            <Link key={p._id} to={`/client/advocates/${p._id}`} className="bg-parchment border border-rule rounded-lg p-5 hover:shadow-lg hover:-translate-y-1 hover:border-sepia transition-all block group">
              <div className="flex justify-between items-start mb-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-navy to-navy-mid text-cream flex items-center justify-center text-lg font-serif font-bold shrink-0">{p.name?.charAt(0)?.toUpperCase()}</div>
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-sans font-bold text-white ${tierColors[p.tier]||"bg-ink-faint"}`}>{p.tier}</span>
              </div>
              <h3 className="font-serif font-bold text-ink group-hover:text-accent transition-colors">{p.name}</h3>
              <p className="text-xs font-sans text-ink-muted capitalize">{p.providerType?.replace("_"," ")}</p>
              <p className="text-xs font-body text-ink mt-1">{p.specialization?.join(", ")||"General"}</p>
              <p className="text-[11px] font-sans text-ink-faint mt-1">📍 {p.location?.district}, {p.location?.state}</p>
              <div className="flex justify-between mt-3 pt-3 border-t border-rule text-xs font-sans font-semibold text-ink">
                <span>⭐ {p.rating?.toFixed(1)||"0.0"}</span><span>{p.engagementsCount||0} cases</span>
              </div>
            </Link>
          ))}
        </div>
      ) : <div className="bg-parchment border border-rule rounded-lg p-8"><p className="text-ink-faint text-sm font-sans italic text-center">No advocates found. Try adjusting your filters.</p></div>}
    </DashboardLayout>
  );
}
