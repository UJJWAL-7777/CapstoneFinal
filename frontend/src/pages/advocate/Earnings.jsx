import DashboardLayout from "../../components/common/DashboardLayout.jsx";
import { useAuth } from "../../context/AuthContext.jsx";

export default function AdvocateEarnings() {
  const { user } = useAuth();
  const p = user?.advocateProfile;
  const e = {
    total: p?.engagementsCount ? p.engagementsCount * 2500 : 0,
    month: p?.engagementsCount ? Math.floor(p.engagementsCount * 0.2) * 2500 : 0,
    referral: (p?.referralCount||0) * 500,
    milestone: p?.engagementsCount>=100 ? 10000 : p?.engagementsCount>=25 ? 5000 : p?.engagementsCount>=5 ? 1000 : 0,
  };

  return (
    <DashboardLayout>
      <div className="border-b-4 border-double border-ink mb-8 pb-4">
        <h1 className="font-serif text-3xl font-black text-ink">Earnings & Analytics</h1>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          {icon:"💰",val:`₹${e.total.toLocaleString()}`,label:"Total Earnings",border:"border-l-info"},
          {icon:"📅",val:`₹${e.month.toLocaleString()}`,label:"This Month",border:"border-l-warning"},
          {icon:"🤝",val:`₹${e.referral.toLocaleString()}`,label:"Referral Bonus",border:"border-l-success"},
          {icon:"🏆",val:`₹${e.milestone.toLocaleString()}`,label:"Milestone Bonus",border:"border-l-ink"},
        ].map((s,i)=>(
          <div key={i} className={`bg-parchment border border-rule ${s.border} border-l-4 rounded-lg p-5 text-center hover:-translate-y-0.5 transition-transform`}>
            <span className="text-2xl block mb-2">{s.icon}</span>
            <div className="text-2xl font-serif font-black text-ink">{s.val}</div>
            <div className="text-xs font-sans text-ink-muted font-medium mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-parchment border border-rule rounded-lg p-6">
          <h3 className="font-serif text-lg font-bold text-ink mb-4 border-b border-rule pb-2">Incentive Breakdown</h3>
          <div className="space-y-3">
            {[["Engagements completed",p?.engagementsCount||0],["Avg per engagement","₹2,500"],["Referral bonus (per referral)","₹500"],["Sign-up bonus",p?.signUpBonusCredited?"✅ Credited":"⏳ Pending"]].map(([l,v])=>(
              <div key={l} className="flex justify-between py-2 border-b border-rule/50 last:border-b-0">
                <span className="text-xs font-sans text-ink-muted">{l}</span><span className="text-sm font-sans font-semibold text-ink">{v}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-parchment border border-rule rounded-lg p-6">
          <h3 className="font-serif text-lg font-bold text-ink mb-4 border-b border-rule pb-2">Milestone Bonuses</h3>
          <div className="space-y-3">
            {[{at:5,bonus:"₹1,000",label:"5 Engagements"},{at:25,bonus:"₹5,000",label:"25 Engagements"},{at:100,bonus:"₹10,000",label:"100 Engagements"}].map(m=>(
              <div key={m.at} className={`flex items-center gap-3 px-4 py-3 rounded-lg border ${(p?.engagementsCount||0)>=m.at ? "bg-success-bg border-success" : "bg-cream border-rule"}`}>
                <span className="text-lg">{(p?.engagementsCount||0)>=m.at?"✅":"⬜"}</span>
                <span className="flex-1 font-sans text-sm font-medium text-ink">{m.label}</span>
                <span className="font-sans text-sm font-bold text-ink">{m.bonus}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
