import { ShieldCheck } from 'lucide-react';

export default function VerifiedBadge({ size = 'sm', label = 'Verified' }) {
  const sizes = { sm: 'text-xs', md: 'text-sm' };
  const iconSizes = { sm: 'h-3.5 w-3.5', md: 'h-4 w-4' };

  return (
    <span className={`inline-flex items-center gap-1 rounded-full bg-chamber-50 px-2 py-0.5 font-medium text-chamber-700 border border-chamber-200 ${sizes[size]}`}>
      <ShieldCheck className={`${iconSizes[size]} text-chamber-600`} aria-hidden />
      {label}
    </span>
  );
}
