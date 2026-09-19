import { Link } from 'react-router-dom';

export default function Logo({ to = '/', light = false }) {
  return (
    <Link to={to} className="inline-flex items-center gap-2.5" aria-label="LegalConnect home">
      <svg width="28" height="28" viewBox="0 0 28 28" aria-hidden>
        <rect width="28" height="28" rx="6" className={light ? 'fill-white' : 'fill-chamber-700'} />
        <path d="M9 8v12h9" fill="none" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className={light ? 'stroke-chamber-800' : 'stroke-white'} />
        <circle cx="19" cy="10" r="2.3" className="fill-brass-400" />
      </svg>
      <span className={`font-serif text-xl font-semibold ${light ? 'text-white' : 'text-ink'}`}>LegalConnect</span>
    </Link>
  );
}
