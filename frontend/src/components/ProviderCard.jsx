import { Link } from "react-router-dom";
import TierBadge from "./TierBadge.jsx";

export default function ProviderCard({ provider }) {
  return (
    <Link
      to={`/providers/${provider._id}`}
      className="block bg-cream border border-rule rounded-lg p-5 hover:shadow-lg hover:-translate-y-1 hover:border-sepia transition-all group"
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-serif font-bold text-ink group-hover:text-accent transition-colors">{provider.name}</h3>
        <TierBadge tier={provider.tier} />
      </div>
      <p className="text-xs font-sans text-ink-muted capitalize">{provider.providerType.replace("_", " ")}</p>
      <p className="text-sm text-ink-muted mt-1 font-body">{(provider.specialization || []).join(", ")}</p>
      <p className="text-xs text-ink-faint mt-1 font-sans">
        📍 {provider.location?.district}, {provider.location?.state}
      </p>
      <div className="flex justify-between mt-3 pt-3 border-t border-rule text-sm font-sans font-semibold text-ink">
        <span>⭐ {provider.rating?.toFixed(1) ?? "—"}</span>
        <span>{provider.engagementsCount} cases</span>
      </div>
    </Link>
  );
}
