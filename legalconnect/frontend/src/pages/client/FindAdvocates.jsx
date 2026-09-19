import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X, MapPin, Star, IndianRupee } from 'lucide-react';
import { advocateService } from '../../services/advocateService.js';
import Avatar from '../../components/ui/Avatar.jsx';
import Badge from '../../components/ui/Badge.jsx';
import VerifiedBadge from '../../components/ui/VerifiedBadge.jsx';
import RatingStars from '../../components/ui/RatingStars.jsx';
import Button from '../../components/ui/Button.jsx';
import { SkeletonCard } from '../../components/ui/Skeleton.jsx';
import { PRACTICE_AREAS } from '../../utils/constants.js';

const LANGUAGES = ['English', 'Hindi', 'Tamil', 'Telugu', 'Marathi', 'Bengali', 'Gujarati'];
const MODES = ['video', 'chat', 'in-person'];
const SORTS = [
  { value: 'rating', label: 'Highest Rated' },
  { value: 'experience', label: 'Most Experienced' },
  { value: 'fee_asc', label: 'Fee: Low to High' },
  { value: 'fee_desc', label: 'Fee: High to Low' },
];

export default function FindAdvocates() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [advocates, setAdvocates] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    practiceArea: searchParams.get('practiceArea') || '',
    city: '',
    minExp: '',
    maxFee: '',
    language: '',
    mode: '',
    minRating: '',
    sort: 'rating',
  });

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 12, ...Object.fromEntries(Object.entries(filters).filter(([, v]) => v)) };
      const data = await advocateService.search(params);
      setAdvocates(data.advocates || []);
      setTotal(data.total || 0);
      setPages(data.pages || 1);
    } catch { setAdvocates([]); }
    finally { setLoading(false); }
  }, [filters, page]);

  useEffect(() => { fetch(); }, [fetch]);

  const updateFilter = (key, val) => {
    setFilters((prev) => ({ ...prev, [key]: val }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({ search: '', practiceArea: '', city: '', minExp: '', maxFee: '', language: '', mode: '', minRating: '', sort: 'rating' });
    setPage(1);
  };

  const activeFilterCount = Object.entries(filters).filter(([k, v]) => v && k !== 'sort').length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl">Find Advocates</h1>
        <p className="text-ink-soft mt-1">Search from {total} verified legal professionals</p>
      </div>

      {/* Search bar */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-muted" />
          <input
            id="advocate-search"
            type="text"
            placeholder="Search by name or practice area..."
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            className="input-base pl-10"
          />
        </div>
        <Button
          variant={showFilters ? 'primary' : 'secondary'}
          onClick={() => setShowFilters((v) => !v)}
          className="gap-2"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
          {activeFilterCount > 0 && (
            <span className="rounded-full bg-white/20 px-1.5 text-xs">{activeFilterCount}</span>
          )}
        </Button>
        <select
          value={filters.sort}
          onChange={(e) => updateFilter('sort', e.target.value)}
          className="input-base w-44"
        >
          {SORTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="panel p-5 animate-slide-up">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            <div>
              <label className="block text-xs font-medium text-ink-muted mb-1">Practice Area</label>
              <select value={filters.practiceArea} onChange={(e) => updateFilter('practiceArea', e.target.value)} className="input-base">
                <option value="">All areas</option>
                {PRACTICE_AREAS.map((a) => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-ink-muted mb-1">City</label>
              <input type="text" placeholder="e.g. Mumbai" value={filters.city} onChange={(e) => updateFilter('city', e.target.value)} className="input-base" />
            </div>
            <div>
              <label className="block text-xs font-medium text-ink-muted mb-1">Min Experience (yrs)</label>
              <input type="number" min="0" value={filters.minExp} onChange={(e) => updateFilter('minExp', e.target.value)} className="input-base" />
            </div>
            <div>
              <label className="block text-xs font-medium text-ink-muted mb-1">Max Fee (₹)</label>
              <input type="number" min="0" value={filters.maxFee} onChange={(e) => updateFilter('maxFee', e.target.value)} className="input-base" />
            </div>
            <div>
              <label className="block text-xs font-medium text-ink-muted mb-1">Language</label>
              <select value={filters.language} onChange={(e) => updateFilter('language', e.target.value)} className="input-base">
                <option value="">All languages</option>
                {LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-ink-muted mb-1">Mode</label>
              <select value={filters.mode} onChange={(e) => updateFilter('mode', e.target.value)} className="input-base">
                <option value="">All modes</option>
                {MODES.map((m) => <option key={m} value={m} className="capitalize">{m}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-ink-muted mb-1">Min Rating</label>
              <select value={filters.minRating} onChange={(e) => updateFilter('minRating', e.target.value)} className="input-base">
                <option value="">Any rating</option>
                {[4.5, 4, 3.5, 3].map((r) => <option key={r} value={r}>{r}+ stars</option>)}
              </select>
            </div>
          </div>
          {activeFilterCount > 0 && (
            <button onClick={clearFilters} className="mt-4 flex items-center gap-1 text-sm text-danger-500 hover:underline">
              <X className="h-3.5 w-3.5" /> Clear all filters
            </button>
          )}
        </div>
      )}

      {/* Results */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : advocates.length === 0 ? (
        <div className="panel p-12 text-center">
          <Search className="mx-auto h-12 w-12 text-ink-muted mb-4" />
          <p className="text-lg font-medium">No advocates found</p>
          <p className="text-ink-muted text-sm mt-1">Try adjusting your filters</p>
          <button onClick={clearFilters} className="mt-4 text-sm text-chamber-600 hover:underline">Clear filters</button>
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {advocates.map((adv) => (
              <AdvocateCard key={adv._id} advocate={adv} />
            ))}
          </div>

          {/* Pagination */}
          {pages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <button disabled={page === 1} onClick={() => setPage((p) => p - 1)} className="rounded-lg border border-line px-3 py-1.5 text-sm disabled:opacity-40 hover:bg-paper transition-colors">Previous</button>
              <span className="text-sm text-ink-muted">Page {page} of {pages}</span>
              <button disabled={page === pages} onClick={() => setPage((p) => p + 1)} className="rounded-lg border border-line px-3 py-1.5 text-sm disabled:opacity-40 hover:bg-paper transition-colors">Next</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function AdvocateCard({ advocate }) {
  return (
    <div className="panel p-5 hover:shadow-lg hover:border-chamber-200 transition-all cursor-pointer group">
      <div className="flex items-start gap-3">
        <Avatar name={advocate.user?.name} src={advocate.user?.avatar?.url} size="lg" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-ink truncate">{advocate.user?.name}</h3>
            {advocate.verificationStatus === 'Verified' && <VerifiedBadge />}
          </div>
          <p className="text-xs text-ink-muted mt-0.5">{advocate.experienceYears}+ yrs exp</p>
          {advocate.location?.city && (
            <p className="flex items-center gap-1 text-xs text-ink-muted mt-0.5">
              <MapPin className="h-3 w-3" /> {advocate.location.city}
            </p>
          )}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {advocate.practiceAreas?.slice(0, 2).map((area) => (
          <Badge key={area} variant="primary" size="xs">{area}</Badge>
        ))}
        {advocate.practiceAreas?.length > 2 && (
          <Badge variant="default" size="xs">+{advocate.practiceAreas.length - 2}</Badge>
        )}
      </div>

      {advocate.badges?.length > 0 && (
        <div className="mt-2 flex gap-1">
          {advocate.badges.slice(0, 3).map((b) => (
            <span key={b.type} title={b.name} className="text-base">{b.icon}</span>
          ))}
        </div>
      )}

      <div className="mt-3 flex items-center justify-between text-sm">
        <div className="flex items-center gap-1">
          <RatingStars rating={advocate.avgRating} size="sm" />
          <span className="text-xs text-ink-muted">({advocate.reviewCount})</span>
        </div>
        <div className="flex items-center gap-1 text-ink font-medium">
          <IndianRupee className="h-3.5 w-3.5" />
          {advocate.consultationFee?.toLocaleString()}
        </div>
      </div>

      <Button to={`/client/advocates/${advocate.user?._id}`} variant="outline" size="sm" className="mt-4 w-full">
        View Profile
      </Button>
    </div>
  );
}
