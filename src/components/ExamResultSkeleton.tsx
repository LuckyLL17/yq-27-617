import { Skeleton, SkeletonCard } from './Skeleton';

export function ExamResultSkeleton() {
  return (
    <div className="min-h-screen bg-dark-900 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <SkeletonCard className="rounded-2xl p-8 mb-8 text-center">
            <Skeleton className="w-20 h-20 rounded-full mx-auto mb-4" />
            <Skeleton className="w-32 h-8 mx-auto mb-2" />
            <Skeleton className="w-64 h-5 mx-auto mb-6" />
            
            <Skeleton className="w-28 h-16 mx-auto mb-2" />
            <Skeleton className="w-16 h-6 mx-auto mb-8" />

            <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-dark-800/50 rounded-xl p-4">
                  <Skeleton className="w-16 h-7 mx-auto mb-1" />
                  <Skeleton className="w-8 h-3 mx-auto" />
                </div>
              ))}
            </div>

            <div className="flex items-center justify-center gap-6 mt-6">
              <Skeleton className="w-24 h-4" />
              <Skeleton className="w-20 h-4" />
            </div>
          </SkeletonCard>

          <div className="flex flex-wrap items-center gap-3 mb-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="w-24 h-9 rounded-lg" />
            ))}
          </div>

          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <SkeletonCard key={i} className="rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Skeleton className="w-10 h-10 rounded-lg" />
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Skeleton className="w-12 h-4 rounded-full" />
                        <Skeleton className="w-16 h-4 rounded-full" />
                      </div>
                      <Skeleton className="w-48 h-5" />
                    </div>
                  </div>
                  <Skeleton className="w-20 h-6 rounded-full" />
                </div>
              </SkeletonCard>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
