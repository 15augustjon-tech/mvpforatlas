export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
  );
}

export function OpportunityCardSkeleton() {
  return (
    <div className="bg-white rounded-card p-4 mb-3 border border-gray-100">
      <div className="flex items-start gap-3">
        {/* Company Logo */}
        <Skeleton className="w-12 h-12 rounded-lg flex-shrink-0" />

        <div className="flex-1 min-w-0">
          {/* Title */}
          <Skeleton className="h-5 w-3/4 mb-2" />

          {/* Company */}
          <Skeleton className="h-4 w-1/2 mb-2" />

          {/* Location & Salary */}
          <div className="flex gap-2 mb-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-20" />
          </div>

          {/* Tags */}
          <div className="flex gap-2">
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-14 rounded-full" />
          </div>
        </div>

        {/* Match Score */}
        <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />
      </div>
    </div>
  );
}

export function FeedSkeleton() {
  return (
    <div className="px-4">
      <OpportunityCardSkeleton />
      <OpportunityCardSkeleton />
      <OpportunityCardSkeleton />
      <OpportunityCardSkeleton />
      <OpportunityCardSkeleton />
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="px-4 py-4 space-y-4">
      {/* Header */}
      <div className="bg-white rounded-card p-4">
        <div className="flex items-center gap-4">
          <Skeleton className="w-16 h-16 rounded-full" />
          <div className="flex-1">
            <Skeleton className="h-6 w-40 mb-2" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
      </div>

      {/* Education */}
      <div className="bg-white rounded-card p-4">
        <Skeleton className="h-5 w-24 mb-3" />
        <Skeleton className="h-4 w-48 mb-2" />
        <Skeleton className="h-4 w-32" />
      </div>

      {/* Skills */}
      <div className="bg-white rounded-card p-4">
        <Skeleton className="h-5 w-16 mb-3" />
        <div className="flex gap-2 flex-wrap">
          <Skeleton className="h-8 w-20 rounded-full" />
          <Skeleton className="h-8 w-24 rounded-full" />
          <Skeleton className="h-8 w-16 rounded-full" />
          <Skeleton className="h-8 w-28 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function ApplicationsSkeleton() {
  return (
    <div className="px-4 space-y-3">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-white rounded-card p-4 border border-gray-100">
          <div className="flex items-center gap-3">
            <Skeleton className="w-10 h-10 rounded-lg" />
            <div className="flex-1">
              <Skeleton className="h-5 w-40 mb-2" />
              <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}
