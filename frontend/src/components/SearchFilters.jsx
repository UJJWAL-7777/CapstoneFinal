const TYPES = ["advocate", "arbitrator", "mediator", "notary", "document_writer"];
const TIERS = ["Bronze", "Silver", "Gold", "Platinum"];

export default function SearchFilters({ filters, onChange }) {
  const update = (key) => (e) => onChange({ ...filters, [key]: e.target.value });

  const inputClass = "px-3 py-2.5 border border-rule rounded-lg bg-cream text-ink font-sans text-sm focus:outline-none focus:border-sepia focus:ring-2 focus:ring-sepia/10 transition-all";

  return (
    <div className="flex gap-3 flex-wrap mb-6">
      <input
        type="text"
        placeholder="Search by name or specialization..."
        value={filters.q || ""}
        onChange={update("q")}
        className={`${inputClass} flex-1 min-w-[200px]`}
      />
      <select value={filters.type || ""} onChange={update("type")} className={inputClass}>
        <option value="">All provider types</option>
        {TYPES.map((t) => (
          <option key={t} value={t}>{t.replace("_", " ")}</option>
        ))}
      </select>
      <input
        type="text"
        placeholder="District"
        value={filters.district || ""}
        onChange={update("district")}
        className={inputClass}
      />
      <select value={filters.tier || ""} onChange={update("tier")} className={inputClass}>
        <option value="">Any tier</option>
        {TIERS.map((t) => (
          <option key={t} value={t}>{t}</option>
        ))}
      </select>
    </div>
  );
}
