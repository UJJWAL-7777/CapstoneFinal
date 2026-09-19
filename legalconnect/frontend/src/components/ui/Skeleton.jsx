export function Skeleton({ className = '', height = 'h-4' }) {
  return <div className={`skeleton ${height} ${className}`} />;
}

export function SkeletonCard() {
  return (
    <div className="panel p-5 space-y-4">
      <div className="flex items-center gap-3">
        <Skeleton className="h-12 w-12 rounded-full" height="" />
        <div className="flex-1 space-y-2">
          <Skeleton className="w-1/3" />
          <Skeleton className="w-1/2 h-3" height="h-3" />
        </div>
      </div>
      <Skeleton className="w-full" />
      <Skeleton className="w-4/5" />
      <Skeleton className="w-2/3 h-3" height="h-3" />
    </div>
  );
}

export function SkeletonTable({ rows = 5 }) {
  return (
    <div className="panel overflow-hidden">
      <div className="border-b border-line bg-paper px-4 py-3">
        <Skeleton className="w-48" height="h-3" />
      </div>
      <div className="divide-y divide-line">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-3.5">
            <Skeleton className="h-9 w-9 rounded-full" height="" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="w-1/4" />
              <Skeleton className="w-1/3 h-3" height="h-3" />
            </div>
            <Skeleton className="w-20" />
            <Skeleton className="w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}
