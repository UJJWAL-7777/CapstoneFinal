import { useEffect, useState } from "react";
import SearchFilters from "../components/SearchFilters.jsx";
import ProviderCard from "../components/ProviderCard.jsx";
import { fetchProviders } from "../api.js";

export default function Discovery() {
  const [filters, setFilters] = useState({});
  const [providers, setProviders] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    const timeout = setTimeout(() => {
      fetchProviders(filters)
        .then((data) => { setProviders(data.providers); setTotal(data.total); setError(null); })
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(timeout);
  }, [filters]);

  return (
    <div className="max-w-5xl mx-auto px-5 py-10">
      <div className="border-t-4 border-double border-ink mb-6" />
      <h1 className="font-serif text-3xl font-black text-ink mb-2">The Legal Directory</h1>
      <p className="text-ink-muted font-sans text-sm mb-6 italic">Find a legal service provider across India</p>
      <SearchFilters filters={filters} onChange={setFilters} />
      {loading && <p className="text-ink-muted font-sans text-sm">Loading providers...</p>}
      {error && <p className="text-danger font-sans text-sm">{error}</p>}
      {!loading && !error && (
        <>
          <p className="text-ink-faint font-sans text-sm mb-4">{total} providers found</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {providers.map((p) => <ProviderCard key={p._id} provider={p} />)}
          </div>
        </>
      )}
    </div>
  );
}
