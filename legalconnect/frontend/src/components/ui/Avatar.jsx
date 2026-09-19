export default function Avatar({ src, name, size = 'md', className = '' }) {
  const sizeClasses = {
    xs: 'h-7 w-7 text-xs',
    sm: 'h-9 w-9 text-sm',
    md: 'h-11 w-11 text-base',
    lg: 'h-14 w-14 text-lg',
    xl: 'h-20 w-20 text-2xl',
  };

  const initials = name
    ? name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  if (src) {
    return (
      <img
        src={src}
        alt={name || 'Avatar'}
        className={`${sizeClasses[size]} rounded-full object-cover ring-2 ring-white ${className}`}
      />
    );
  }

  // Generate a deterministic color from the name
  const colors = [
    'bg-chamber-600 text-white',
    'bg-brass-500 text-white',
    'bg-sky-600 text-white',
    'bg-purple-600 text-white',
    'bg-emerald-600 text-white',
    'bg-rose-600 text-white',
  ];
  const colorIndex = name ? name.charCodeAt(0) % colors.length : 0;

  return (
    <div className={`${sizeClasses[size]} ${colors[colorIndex]} rounded-full flex items-center justify-center font-semibold ring-2 ring-white shrink-0 ${className}`}>
      {initials}
    </div>
  );
}
