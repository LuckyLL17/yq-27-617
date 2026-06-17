import { Skeleton, SkeletonCard } from './Skeleton';

export function ExamConfigSkeleton() {
  return (
    <div className="min-h-screen bg-dark-900 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <Skeleton className="w-28 h-7 rounded-full mx-auto mb-6" />
            <Skeleton className="w-64 h-9 mx-auto mb-4" />
            <Skeleton className="w-72 h-5 mx-auto" />
          </div>

          <div className="space-y-8">
            <SkeletonCard className="rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-10 h-10 rounded-xl" />
                  <div>
                    <Skeleton className="w-24 h-5 mb-1" />
                    <Skeleton className="w-40 h-4" />
                  </div>
                </div>
                <Skeleton className="w-12 h-4" />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-xl border-2 border-dark-700 bg-dark-900/50"
                  >
                    <Skeleton className="w-10 h-10 rounded-lg mx-auto mb-2" />
                    <Skeleton className="w-16 h-4 mx-auto mb-1" />
                    <Skeleton className="w-12 h-3 mx-auto" />
                  </div>
                ))}
              </div>
            </SkeletonCard>

            <SkeletonCard className="rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <Skeleton className="w-10 h-10 rounded-xl" />
                <div>
                  <Skeleton className="w-24 h-5 mb-1" />
                  <Skeleton className="w-36 h-4" />
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-xl border-2 border-dark-700 bg-dark-900/50"
                  >
                    <Skeleton className="w-14 h-4 mb-1" />
                    <Skeleton className="w-24 h-3" />
                  </div>
                ))}
              </div>
            </SkeletonCard>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SkeletonCard className="rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Skeleton className="w-10 h-10 rounded-xl" />
                  <div>
                    <Skeleton className="w-24 h-5 mb-1" />
                    <Skeleton className="w-28 h-4" />
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="w-16 h-9 rounded-lg" />
                  ))}
                </div>
              </SkeletonCard>

              <SkeletonCard className="rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Skeleton className="w-10 h-10 rounded-xl" />
                  <div>
                    <Skeleton className="w-24 h-5 mb-1" />
                    <Skeleton className="w-28 h-4" />
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="w-20 h-9 rounded-lg" />
                  ))}
                </div>
              </SkeletonCard>
            </div>

            <SkeletonCard className="rounded-2xl p-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                  <Skeleton className="w-32 h-5 mb-2" />
                  <div className="flex flex-wrap gap-4">
                    <Skeleton className="w-24 h-4" />
                    <Skeleton className="w-20 h-4" />
                    <Skeleton className="w-20 h-4" />
                    <Skeleton className="w-24 h-4" />
                  </div>
                </div>
                <Skeleton className="w-32 h-12 rounded-xl" />
              </div>
            </SkeletonCard>
          </div>
        </div>
      </div>
    </div>
  );
}
