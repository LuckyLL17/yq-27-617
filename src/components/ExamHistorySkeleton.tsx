import { Skeleton, SkeletonCard } from './Skeleton';

export function ExamHistorySkeleton() {
  return (
    <div className="min-h-screen bg-dark-900 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Skeleton className="w-10 h-10 rounded-lg" />
            <div>
              <Skeleton className="w-28 h-7 mb-1" />
              <Skeleton className="w-32 h-4" />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <SkeletonCard key={i} className="rounded-2xl p-5">
                <Skeleton className="w-10 h-10 rounded-xl mb-3" />
                <Skeleton className="w-16 h-7 mb-1" />
                <Skeleton className="w-20 h-4" />
              </SkeletonCard>
            ))}
          </div>

          <div className="flex items-center justify-between mb-4">
            <Skeleton className="w-24 h-5" />
            <div className="flex gap-2">
              <Skeleton className="w-20 h-8 rounded-lg" />
              <Skeleton className="w-20 h-8 rounded-lg" />
            </div>
          </div>

          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <SkeletonCard key={i} className="rounded-2xl p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Skeleton className="w-14 h-14 rounded-xl" />
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Skeleton className="w-4 h-4 rounded-full" />
                        <Skeleton className="w-28 h-4" />
                      </div>
                      <div className="flex items-center gap-2 mb-1">
                        <Skeleton className="w-36 h-5" />
                        <Skeleton className="w-12 h-5 rounded-full" />
                      </div>
                      <div className="flex items-center gap-4">
                        <Skeleton className="w-12 h-3" />
                        <Skeleton className="w-16 h-3" />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3">
                      <Skeleton className="w-12 h-4" />
                      <Skeleton className="w-12 h-4" />
                      <Skeleton className="w-12 h-4" />
                    </div>
                    <Skeleton className="w-8 h-5" />
                  </div>
                </div>
              </SkeletonCard>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
