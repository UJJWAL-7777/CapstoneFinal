import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import TierBadge from "../components/TierBadge.jsx";
import { fetchProvider } from "../api.js";

export default function ProviderDetail() {
  const { id } = useParams();
  const [provider, setProvider] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => { fetchProvider(id).then(setProvider).catch((e) => setError(e.message)); }, [id]);

  if (error) return <p className="text-danger p-10 text-center font-sans">{error}</p>;
  if (!provider) return <p className="text-ink-muted p-10 text-center font-sans">Loading...</p>;

  return (
    <div className="max-w-3xl mx-auto px-5 py-10">
      <div className="border-t-4 border-double border-ink mb-6" />
      <div className="flex items-center gap-4 mb-2">
        <h1 className="font-serif text-3xl font-black text-ink">{provider.name}</h1>
        <TierBadge tier={provider.tier} />
      </div>
      <p className="text-ink-muted capitalize font-sans text-sm">{provider.providerType.replace("_", " ")}</p>
      <p className="font-body text-ink mt-2">{(provider.specialization || []).join(", ")}</p>
      <p className="text-ink-faint font-sans text-sm mt-1">📍 {provider.location?.district}, {provider.location?.state}</p>

      <div className="border-t border-rule my-6" />

      <ul className="space-y-2 font-sans text-sm text-ink">
        <li>⭐ Rating: <strong>{provider.rating?.toFixed(1)}</strong> / 5</li>
        <li>📊 Engagements completed: <strong>{provider.engagementsCount}</strong></li>
        <li>⏱️ Avg response time: <strong>{provider.responseTimeHours} hrs</strong></li>
        <li>🤝 Referrals made: <strong>{provider.referralCount}</strong></li>
        {provider.nextMilestone && (
          <li>🎯 Next milestone at <strong>{provider.nextMilestone}</strong> ({provider.nextMilestone - provider.engagementsCount} to go)</li>
        )}
      </ul>

      {provider.badges?.length > 0 && (
        <>
          <div className="border-t border-rule my-6" />
          <div className="flex gap-2 flex-wrap">
            {provider.badges.map((b) => (
              <span key={b} className="bg-gradient-to-r from-[#c9a24b] to-[#d4b96a] text-navy px-3 py-1 rounded-full text-xs font-sans font-semibold">
                {b}
              </span>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
