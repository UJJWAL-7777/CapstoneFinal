import { useEffect, useState } from "react";
import DashboardLayout from "../../components/common/DashboardLayout.jsx";
import { requestsAPI } from "../../api.js";

export default function AdvocateRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const load = () => { setLoading(true); requestsAPI.getAll().then(setRequests).catch(()=>{}).finally(()=>setLoading(false)); };
  useEffect(load, []);

  const handleAccept = async (id) => { try{ await requestsAPI.accept(id); load(); }catch(e){alert(e.message);} };
  const handleReject = async (id) => { const reason = prompt("Reason for declining (optional):"); try{ await requestsAPI.reject(id, reason||""); load(); }catch(e){alert(e.message);} };

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center border-b-4 border-double border-ink mb-6 pb-4">
        <h1 className="font-serif text-3xl font-black text-ink">Client Requests</h1>
        <span className="bg-parchment text-accent px-3 py-1 rounded-full text-xs font-sans font-semibold border border-rule">{requests.length} pending</span>
      </div>
      {loading ? <p className="text-ink-muted text-sm font-sans text-center py-6">Loading...</p>
      : requests.length > 0 ? (
        <div className="space-y-4">
          {requests.map(r=>(
            <div key={r._id} className="bg-parchment border border-rule rounded-lg p-5 flex justify-between items-start gap-5 flex-wrap">
              <div className="flex-1 min-w-[200px]">
                <h3 className="font-serif text-lg font-bold text-ink mb-2">{r.title}</h3>
                <div className="flex gap-4 flex-wrap text-xs font-sans text-ink-muted">
                  <span>👤 {r.client?.name}</span><span>📧 {r.client?.email}</span><span>📋 {r.caseType}</span><span>🕐 {new Date(r.createdAt).toLocaleDateString()}</span>
                </div>
                {r.description && <p className="text-sm font-body text-ink mt-3">{r.description}</p>}
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={()=>handleAccept(r._id)} className="bg-success hover:bg-success/80 text-white px-4 py-2 rounded-lg font-sans text-xs font-semibold transition-colors">✓ Accept</button>
                <button onClick={()=>handleReject(r._id)} className="bg-danger hover:bg-danger/80 text-white px-4 py-2 rounded-lg font-sans text-xs font-semibold transition-colors">✕ Decline</button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-parchment border border-rule rounded-lg p-8"><p className="text-ink-faint text-sm font-sans italic text-center">No pending requests. New client requests will appear here.</p></div>
      )}
    </DashboardLayout>
  );
}
