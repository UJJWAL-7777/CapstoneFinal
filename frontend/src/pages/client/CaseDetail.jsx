import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import DashboardLayout from "../../components/common/DashboardLayout.jsx";
import { casesAPI } from "../../api.js";

const statusStyle = s => s==="active"?"bg-info-bg text-info":s==="pending"?"bg-warning-bg text-warning":s==="resolved"?"bg-success-bg text-success":"bg-rule text-ink-muted";

export default function ClientCaseDetail() {
  const { caseId } = useParams();
  const [cd, setCd] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(()=>{casesAPI.getById(caseId).then(setCd).catch(e=>setError(e.message)).finally(()=>setLoading(false));}, [caseId]);

  if(loading) return <DashboardLayout><p className="text-ink-muted font-sans text-center py-10">Loading...</p></DashboardLayout>;
  if(error) return <DashboardLayout><p className="text-danger font-sans text-center py-10">{error}</p></DashboardLayout>;
  if(!cd) return <DashboardLayout><p className="text-ink-muted font-sans text-center py-10">Not found</p></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="flex justify-between items-start border-b-4 border-double border-ink mb-8 pb-4 flex-wrap gap-3">
        <div><h1 className="font-serif text-2xl font-black text-ink">{cd.title}</h1><span className="font-mono text-xs text-ink-muted">{cd.caseNumber}</span></div>
        <span className={`px-3 py-1 rounded-full text-xs font-sans font-bold capitalize ${statusStyle(cd.status)}`}>{cd.status}</span>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-parchment border border-rule rounded-lg p-6">
          <h3 className="font-serif text-lg font-bold text-ink mb-4 border-b border-rule pb-2">Case Information</h3>
          <div className="space-y-3">
            {[["Type",cd.caseType],["Advocate",cd.advocate?.name||"Unassigned"],["Advocate Email",cd.advocate?.email||"—"],["Created",new Date(cd.createdAt).toLocaleDateString()],["Outcome",cd.outcome||"—"]].filter(([,v])=>v).map(([l,v])=>(
              <div key={l} className="flex justify-between py-2 border-b border-rule/50 last:border-b-0"><span className="text-xs font-sans text-ink-muted">{l}</span><span className="text-sm font-sans font-semibold text-ink">{v}</span></div>
            ))}
            {cd.description && <div className="pt-2"><span className="text-xs font-sans text-ink-muted block mb-1">Description</span><p className="text-sm font-body text-ink">{cd.description}</p></div>}
          </div>
        </div>
        <div className="bg-parchment border border-rule rounded-lg p-6">
          <h3 className="font-serif text-lg font-bold text-ink mb-4 border-b border-rule pb-2">Timeline</h3>
          <div className="relative pl-6">
            <div className="absolute left-[7px] top-0 bottom-0 w-0.5 bg-rule"/>
            {cd.timeline?.map((e,i)=>(
              <div key={i} className="relative pb-5">
                <div className="absolute -left-[17px] top-1 w-3 h-3 rounded-full bg-accent border-2 border-parchment shadow-sm"/>
                <div className="pl-2">
                  <strong className="text-sm font-sans font-semibold text-ink block">{e.action}</strong>
                  <p className="text-xs font-sans text-ink-muted">{e.description}</p>
                  <span className="text-[10px] font-sans text-ink-faint">{e.performedBy?.name||"System"} · {new Date(e.timestamp).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
