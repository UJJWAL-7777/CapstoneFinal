import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import DashboardLayout from "../../components/common/DashboardLayout.jsx";
import { casesAPI } from "../../api.js";

const STATUSES = ["pending","active","in_progress","resolved","closed"];
const statusStyle = s => s==="active"?"bg-info-bg text-info":s==="pending"?"bg-warning-bg text-warning":s==="resolved"?"bg-success-bg text-success":"bg-rule text-ink-muted";

export default function AdvocateCaseDetail() {
  const { caseId } = useParams();
  const [cd, setCd] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newStatus, setNewStatus] = useState("");
  const [note, setNote] = useState("");
  const [updating, setUpdating] = useState(false);

  useEffect(() => { casesAPI.getById(caseId).then(d=>{setCd(d);setNewStatus(d.status);}).catch(e=>setError(e.message)).finally(()=>setLoading(false)); }, [caseId]);

  const updateStatus = async () => { setUpdating(true); try{ const u = await casesAPI.updateStatus(caseId,{status:newStatus}); setCd(u); }catch(e){setError(e.message);} finally{setUpdating(false);} };
  const addNote = async () => { if(!note.trim()) return; try{ const u = await casesAPI.addTimeline(caseId,{action:"Note Added",description:note}); setCd(u); setNote(""); }catch(e){setError(e.message);} };

  if(loading) return <DashboardLayout><p className="text-ink-muted font-sans text-sm py-10 text-center">Loading...</p></DashboardLayout>;
  if(error&&!cd) return <DashboardLayout><p className="text-danger font-sans text-sm py-10 text-center">{error}</p></DashboardLayout>;
  if(!cd) return <DashboardLayout><p className="text-ink-muted font-sans py-10 text-center">Case not found</p></DashboardLayout>;

  const inputClass = "px-3 py-2.5 border border-rule rounded-lg bg-cream text-ink font-sans text-sm focus:outline-none focus:border-sepia";

  return (
    <DashboardLayout>
      <div className="flex justify-between items-start border-b-4 border-double border-ink mb-8 pb-4 flex-wrap gap-3">
        <div><h1 className="font-serif text-2xl font-black text-ink">{cd.title}</h1><span className="font-mono text-xs text-ink-muted">{cd.caseNumber}</span></div>
        <span className={`px-3 py-1 rounded-full text-xs font-sans font-bold capitalize ${statusStyle(cd.status)}`}>{cd.status}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Case Info */}
        <div className="bg-parchment border border-rule rounded-lg p-6">
          <h3 className="font-serif text-lg font-bold text-ink mb-4 border-b border-rule pb-2">Case Information</h3>
          <div className="space-y-3">
            {[["Type",cd.caseType],["Client",cd.client?.name||"—"],["Client Email",cd.client?.email||"—"],["Client Phone",cd.client?.phone||"—"],["Created",new Date(cd.createdAt).toLocaleDateString()]].map(([l,v])=>(
              <div key={l} className="flex justify-between py-2 border-b border-rule/50 last:border-b-0">
                <span className="text-xs font-sans text-ink-muted">{l}</span><span className="text-sm font-sans font-semibold text-ink">{v}</span>
              </div>
            ))}
            {cd.description && <div className="pt-2"><span className="text-xs font-sans text-ink-muted block mb-1">Description</span><p className="text-sm font-body text-ink">{cd.description}</p></div>}
          </div>
        </div>

        {/* Status Update */}
        <div className="bg-parchment border border-rule rounded-lg p-6">
          <h3 className="font-serif text-lg font-bold text-ink mb-4 border-b border-rule pb-2">Update Status</h3>
          <div className="flex gap-3 items-center">
            <select value={newStatus} onChange={e=>setNewStatus(e.target.value)} className={`${inputClass} flex-1 capitalize`}>
              {STATUSES.map(s=><option key={s} value={s}>{s.replace("_"," ")}</option>)}
            </select>
            <button onClick={updateStatus} disabled={updating||newStatus===cd.status}
              className="bg-accent hover:bg-accent-dark text-white px-5 py-2.5 rounded-lg font-sans text-sm font-semibold transition-colors disabled:opacity-40">
              {updating?"...":"Update"}
            </button>
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-parchment border border-rule rounded-lg p-6 lg:col-span-2">
          <h3 className="font-serif text-lg font-bold text-ink mb-4 border-b border-rule pb-2">Timeline</h3>
          <div className="relative pl-6">
            <div className="absolute left-[7px] top-0 bottom-0 w-0.5 bg-rule" />
            {cd.timeline?.map((e,i)=>(
              <div key={i} className="relative pb-5">
                <div className="absolute -left-[17px] top-1 w-3 h-3 rounded-full bg-accent border-2 border-cream shadow-sm" />
                <div className="pl-2">
                  <strong className="text-sm font-sans font-semibold text-ink block">{e.action}</strong>
                  <p className="text-xs font-sans text-ink-muted">{e.description}</p>
                  <span className="text-[10px] font-sans text-ink-faint">{e.performedBy?.name||"System"} · {new Date(e.timestamp).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-2 mt-4 pt-4 border-t border-rule">
            <input type="text" placeholder="Add a note to the timeline..." value={note} onChange={e=>setNote(e.target.value)} className={`${inputClass} flex-1`} />
            <button onClick={addNote} className="bg-accent text-white px-4 py-2 rounded-lg font-sans text-xs font-semibold hover:bg-accent-dark transition-colors">Add</button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
