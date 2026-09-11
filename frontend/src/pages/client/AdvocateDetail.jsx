import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/common/DashboardLayout.jsx";
import { fetchProvider, casesAPI, reviewsAPI } from "../../api.js";

const CASE_TYPES = ["Criminal","Civil","Family","Property","Corporate","Labour","Tax","Consumer","Constitutional","Other"];

export default function ClientAdvocateDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [provider, setProvider] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showBooking, setShowBooking] = useState(false);
  const [bf, setBf] = useState({ title:"", description:"", caseType:"Civil" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(()=>{ Promise.all([fetchProvider(id),reviewsAPI.getForAdvocate(id).catch(()=>({reviews:[]}))]).then(([p,r])=>{setProvider(p);setReviews(r.reviews||[]);}).catch(e=>setError(e.message)).finally(()=>setLoading(false)); },[id]);

  const handleBooking = async (e) => { e.preventDefault(); setSubmitting(true); try{ await casesAPI.create({...bf,advocateId:provider._userId||id}); alert("Request sent!"); navigate("/client/cases"); }catch(err){setError(err.message);} finally{setSubmitting(false);} };

  const tierColors = {Bronze:"bg-[#a9744f]",Silver:"bg-[#8a94a6]",Gold:"bg-gradient-to-r from-[#c9a24b] to-[#d4b96a]",Platinum:"bg-gradient-to-r from-[#5b6b8c] to-[#7b8ba8]"};
  const inputClass = "w-full px-4 py-3 border border-rule rounded-lg bg-cream text-ink font-sans text-sm focus:outline-none focus:border-sepia focus:ring-2 focus:ring-sepia/10";

  if(loading) return <DashboardLayout><p className="text-ink-muted font-sans text-center py-10">Loading...</p></DashboardLayout>;
  if(error&&!provider) return <DashboardLayout><p className="text-danger font-sans text-center py-10">{error}</p></DashboardLayout>;
  if(!provider) return <DashboardLayout><p className="text-ink-muted font-sans text-center py-10">Not found</p></DashboardLayout>;

  return (
    <DashboardLayout>
      {/* Hero */}
      <div className="bg-parchment border border-rule rounded-lg p-6 flex justify-between items-center flex-wrap gap-4 mb-5">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-navy to-navy-mid text-cream flex items-center justify-center text-2xl font-serif font-black shrink-0">{provider.name?.charAt(0)?.toUpperCase()}</div>
          <div>
            <h1 className="font-serif text-2xl font-black text-ink">{provider.name}</h1>
            <p className="text-ink-muted font-sans text-sm capitalize">{provider.providerType?.replace("_"," ")}</p>
            <div className="flex gap-2 items-center mt-1">
              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-sans font-bold text-white ${tierColors[provider.tier]||"bg-ink-faint"}`}>{provider.tier}</span>
              {provider.verified && <span className="text-success text-xs font-sans font-semibold">✅ Verified</span>}
            </div>
          </div>
        </div>
        <button onClick={()=>setShowBooking(!showBooking)} className="bg-accent hover:bg-accent-dark text-white px-6 py-3 rounded-lg font-sans font-semibold text-sm transition-colors">
          {showBooking?"Cancel":"📩 Request Consultation"}
        </button>
      </div>

      {showBooking && (
        <div className="bg-cream border border-accent/30 rounded-lg p-6 mb-5">
          <h3 className="font-serif text-lg font-bold text-ink mb-4">Request a Consultation</h3>
          {error && <div className="bg-danger-bg text-danger px-4 py-2 rounded-lg text-sm font-sans mb-3">{error}</div>}
          <form onSubmit={handleBooking} className="space-y-3">
            <div><label className="block text-xs font-sans font-semibold text-ink mb-1">Case Title *</label><input type="text" placeholder="Brief title" className={inputClass} value={bf.title} onChange={e=>setBf({...bf,title:e.target.value})} required/></div>
            <div><label className="block text-xs font-sans font-semibold text-ink mb-1">Case Type *</label><select className={inputClass} value={bf.caseType} onChange={e=>setBf({...bf,caseType:e.target.value})}>{CASE_TYPES.map(t=><option key={t} value={t}>{t}</option>)}</select></div>
            <div><label className="block text-xs font-sans font-semibold text-ink mb-1">Description</label><textarea rows={4} placeholder="Describe your legal issue..." className={inputClass+" resize-y"} value={bf.description} onChange={e=>setBf({...bf,description:e.target.value})}/></div>
            <button type="submit" className="bg-accent hover:bg-accent-dark text-white px-6 py-2.5 rounded-lg font-sans text-sm font-semibold disabled:opacity-50" disabled={submitting}>{submitting?"Sending...":"Send Request"}</button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-parchment border border-rule rounded-lg p-6">
          <h3 className="font-serif text-lg font-bold text-ink mb-4 border-b border-rule pb-2">Professional Details</h3>
          <div className="space-y-3">
            {[["Specializations",provider.specialization?.join(", ")||"—"],["Location",`${provider.location?.district}, ${provider.location?.state}`],["Languages",provider.languages?.join(", ")||"—"],["Enrollment #",provider.enrollmentNumber||"—"]].map(([l,v])=>(
              <div key={l} className="flex justify-between py-2 border-b border-rule/50 last:border-b-0"><span className="text-xs font-sans text-ink-muted">{l}</span><span className="text-sm font-sans font-semibold text-ink">{v}</span></div>
            ))}
          </div>
        </div>
        <div className="bg-parchment border border-rule rounded-lg p-6">
          <h3 className="font-serif text-lg font-bold text-ink mb-4 border-b border-rule pb-2">Performance</h3>
          <div className="grid grid-cols-2 gap-4 mt-2">
            {[{v:`⭐ ${provider.rating?.toFixed(1)||"0.0"}`,l:"Rating"},{v:provider.engagementsCount||0,l:"Cases Done"},{v:`${provider.responseTimeHours||"—"}h`,l:"Avg Response"},{v:provider.referralCount||0,l:"Referrals"}].map(s=>(
              <div key={s.l} className="text-center"><div className="text-xl font-serif font-black text-ink">{s.v}</div><div className="text-[10px] font-sans text-ink-faint">{s.l}</div></div>
            ))}
          </div>
        </div>
        {provider.badges?.length > 0 && (
          <div className="bg-parchment border border-rule rounded-lg p-6">
            <h3 className="font-serif text-lg font-bold text-ink mb-4 border-b border-rule pb-2">Badges</h3>
            <div className="flex flex-wrap gap-2">{provider.badges.map(b=>(<div key={b} className="flex items-center gap-2 px-3 py-2 bg-cream rounded-lg border border-rule"><span className="text-lg">🏅</span><span className="font-sans font-semibold text-sm">{b}</span></div>))}</div>
          </div>
        )}
        <div className="bg-parchment border border-rule rounded-lg p-6">
          <h3 className="font-serif text-lg font-bold text-ink mb-4 border-b border-rule pb-2">Reviews ({reviews.length})</h3>
          {reviews.length > 0 ? (
            <div className="space-y-4">{reviews.map(r=>(
              <div key={r._id} className="pb-4 border-b border-rule/50 last:border-b-0">
                <div className="flex justify-between items-center mb-1"><strong className="font-sans text-sm">{r.client?.name||"Client"}</strong><span className="text-sm">{"⭐".repeat(r.rating)}</span></div>
                {r.comment && <p className="text-sm font-body text-ink">{r.comment}</p>}
                <span className="text-[10px] font-sans text-ink-faint">{new Date(r.createdAt).toLocaleDateString()}</span>
              </div>
            ))}</div>
          ) : <p className="text-ink-faint text-sm font-sans italic">No reviews yet.</p>}
        </div>
      </div>
    </DashboardLayout>
  );
}
