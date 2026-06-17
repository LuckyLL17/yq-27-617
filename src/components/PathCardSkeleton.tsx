import { Skeleton, SkeletonCard } from './Skeleton';

export function PathCardSkeleton() {
  return (
    <SkeletonCard className="rounded-3xl overflow-hidden">
      <div className="h-1 bg-gradient-to-r from-primary-500 to-cyan-500" />
      <div className="p-7">
        <div className="flex items-start gap-5 mb-5">
          <Skeleton className="w-16 h-16 rounded-2xl flex-shrink-0" />
          <div className="flex-1">
            <Skeleton className="w-16 h-5 rounded-full mb-2" />
            <Skeleton className="w-3/4 h-6 mb-1" />
            <Skeleton className="w-1/2 h-4" />
          </div>
        </div>

        <Skeleton className="w-full h-4 mb-2" />
        <Skeleton className="w-5/6 h-4 mb-6" />

        <div className="grid grid-cols-3 gap-3 mb-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-3 bg-dark-900/50 rounded-xl">
              <Skeleton className="w-full h-4 mb-1 mx-auto" />
              <Skeleton className="w-1/2 h-6 mx-auto" />
            </div>
          ))}
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <Skeleton className="w-16 h-4" />
            <Skeleton className="w-10 h-4" />
          </div>
          <Skeleton className="w-full h-2.5 rounded-full" />
        </div>

        <div className="flex items-center gap-3">
          <Skeleton className="flex-1 h-12 rounded-xl" />
          <Skeleton className="w-12 h-12 rounded-xl" />
          <Skeleton className="w-12 h-12 rounded-xl" />
        </div>
      </div>
    </SkeletonCard>
  );
}

interface PathListSkeletonProps {
  count?: number;
}

export function PathListSkeleton({ count = 3 }: PathListSkeletonProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <PathCardSkeleton key={i} />
      ))}
    </div>
  );
}
