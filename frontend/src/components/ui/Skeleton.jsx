export function Skeleton({ className = '', height = 'h-4', width = 'w-full' }) {
  return (
    <div
      className={`${height} ${width} rounded-lg animate-pulse ${className}`}
      style={{ background: 'var(--color-bg-hover)' }}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="rounded-xl p-5 space-y-3"
         style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}>
      <Skeleton height="h-4" width="w-1/3" />
      <Skeleton height="h-8" width="w-1/2" />
      <Skeleton height="h-3" width="w-2/3" />
    </div>
  );
}

export function JobCardSkeleton() {
  return (
    <div className="rounded-xl p-4 space-y-3"
         style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}>
      <div className="flex justify-between">
        <Skeleton height="h-4" width="w-2/3" />
        <Skeleton height="h-4" width="w-16" />
      </div>
      <Skeleton height="h-3" width="w-1/2" />
      <Skeleton height="h-3" width="w-3/4" />
      <div className="flex gap-2">
        <Skeleton height="h-5" width="w-16" />
        <Skeleton height="h-5" width="w-20" />
      </div>
    </div>
  );
}

export function TableRowSkeleton() {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl"
         style={{ background: 'var(--color-bg-hover)' }}>
      <div className="w-8 h-8 rounded-full animate-pulse flex-shrink-0"
           style={{ background: 'var(--color-border)' }} />
      <div className="flex-1 space-y-2">
        <Skeleton height="h-3" width="w-1/3" />
        <Skeleton height="h-3" width="w-1/2" />
      </div>
      <Skeleton height="h-5" width="w-20" />
    </div>
  );
}