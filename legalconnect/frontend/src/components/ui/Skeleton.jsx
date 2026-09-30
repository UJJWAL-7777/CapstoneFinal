export function Skeleton({ className = '', height = 'h-4', rounded = 'rounded-md' }) {
  return <div className={`skeleton ${height} ${rounded} ${className}`} />;
}

export function SkeletonStatCard() {
  return (
    <div className="panel p-5 flex items-start justify-between">
      <div className="flex-1 space-y-2">
        <Skeleton className="w-24 h-3" height="h-3" />
        <Skeleton className="w-28 h-8" height="h-8" />
        <Skeleton className="w-36 h-3" height="h-3" />
      </div>
      <Skeleton className="h-11 w-11 rounded-xl shrink-0" height="" />
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="panel p-5 space-y-4">
      <div className="flex items-center gap-3">
        <Skeleton className="h-12 w-12 rounded-full shrink-0" height="" />
        <div className="flex-1 space-y-2">
          <Skeleton className="w-1/3 h-4" height="h-4" />
          <Skeleton className="w-1/2 h-3" height="h-3" />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton className="w-full h-3" height="h-3" />
        <Skeleton className="w-4/5 h-3" height="h-3" />
        <Skeleton className="w-2/3 h-3" height="h-3" />
      </div>
      <div className="flex items-center justify-between pt-2 border-t border-line dark:border-[#233833]">
        <Skeleton className="w-20 h-6 rounded-full" height="h-6" />
        <Skeleton className="w-24 h-8 rounded-lg" height="h-8" />
      </div>
    </div>
  );
}

export function SkeletonTable({ rows = 5, cols = 4 }) {
  return (
    <div className="panel overflow-hidden">
      <div className="border-b border-line dark:border-[#233833] bg-paper dark:bg-[#0E1715] px-4 py-3 flex items-center justify-between">
        <Skeleton className="w-36 h-4" height="h-4" />
        <Skeleton className="w-20 h-7 rounded-lg" height="h-7" />
      </div>
      <div className="divide-y divide-line dark:divide-[#233833]">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-3.5">
            <Skeleton className="h-9 w-9 rounded-full shrink-0" height="" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="w-1/4 h-3.5" height="h-3.5" />
              <Skeleton className="w-1/3 h-3" height="h-3" />
            </div>
            <Skeleton className="w-24 h-3.5 hidden sm:block" height="h-3.5" />
            <Skeleton className="w-20 h-6 rounded-full hidden md:block" height="h-6" />
            <Skeleton className="w-16 h-8 rounded-lg" height="h-8" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function SkeletonGrid({ count = 6, type = 'card' }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

export function SkeletonProfile() {
  return (
    <div className="space-y-6">
      <div className="panel p-6 sm:p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <Skeleton className="h-24 w-24 rounded-full shrink-0" height="" />
        <div className="flex-1 text-center sm:text-left space-y-3 w-full">
          <Skeleton className="w-48 h-6 mx-auto sm:mx-0" height="h-6" />
          <Skeleton className="w-32 h-4 mx-auto sm:mx-0" height="h-4" />
          <div className="flex flex-wrap gap-2 justify-center sm:justify-start pt-1">
            <Skeleton className="w-20 h-6 rounded-full" height="h-6" />
            <Skeleton className="w-24 h-6 rounded-full" height="h-6" />
          </div>
        </div>
        <Skeleton className="w-28 h-9 rounded-lg shrink-0" height="h-9" />
      </div>
      <div className="panel p-6 space-y-4">
        <Skeleton className="w-40 h-5" height="h-5" />
        <div className="space-y-2">
          <Skeleton className="w-full h-3.5" height="h-3.5" />
          <Skeleton className="w-5/6 h-3.5" height="h-3.5" />
          <Skeleton className="w-4/6 h-3.5" height="h-3.5" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonChat() {
  return (
    <div className="panel flex flex-col h-[550px] overflow-hidden">
      <div className="p-4 border-b border-line dark:border-[#233833] flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-full" height="" />
        <div className="space-y-1.5 flex-1">
          <Skeleton className="w-32 h-4" height="h-4" />
          <Skeleton className="w-20 h-3" height="h-3" />
        </div>
      </div>
      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        <div className="flex gap-2.5 max-w-[75%]">
          <Skeleton className="h-8 w-8 rounded-full shrink-0" height="" />
          <Skeleton className="w-48 h-14 rounded-2xl" height="h-14" />
        </div>
        <div className="flex gap-2.5 max-w-[75%] ml-auto justify-end">
          <Skeleton className="w-56 h-16 rounded-2xl" height="h-16" />
        </div>
        <div className="flex gap-2.5 max-w-[75%]">
          <Skeleton className="h-8 w-8 rounded-full shrink-0" height="" />
          <Skeleton className="w-64 h-20 rounded-2xl" height="h-20" />
        </div>
      </div>
      <div className="p-3 border-t border-line dark:border-[#233833] flex gap-2">
        <Skeleton className="flex-1 h-10 rounded-lg" height="h-10" />
        <Skeleton className="w-12 h-10 rounded-lg shrink-0" height="h-10" />
      </div>
    </div>
  );
}

export default Skeleton;
