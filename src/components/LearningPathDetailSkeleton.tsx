import { Skeleton, SkeletonCard } from './Skeleton';

export function LearningPathDetailSkeleton() {
  return (
    <div className="min-h-screen bg-dark-900">
      <div className="sticky top-16 z-40 bg-dark-900/80 backdrop-blur-md border-b border-dark-700">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-4">
            <Skeleton className="w-9 h-9 rounded-lg" />
            <div className="flex items-center gap-3">
              <Skeleton className="w-10 h-10 rounded-xl" />
              <div>
                <Skeleton className="w-24 h-5 mb-1" />
                <Skeleton className="w-20 h-3" />
              </div>
            </div>
            <div className="ml-auto flex items-center gap-6">
              <div className="text-right">
                <Skeleton className="w-12 h-7 mb-1 ml-auto" />
                <Skeleton className="w-16 h-3 ml-auto" />
              </div>
              <Skeleton className="w-32 h-3 rounded-full" />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <SkeletonCard className="rounded-2xl overflow-hidden mb-8">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-5">
                <Skeleton className="w-14 h-14 rounded-xl" />
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Skeleton className="w-16 h-5 rounded-full" />
                    <Skeleton className="w-20 h-4" />
                  </div>
                  <Skeleton className="w-48 h-6 mb-1" />
                  <Skeleton className="w-32 h-4" />
                  <div className="flex items-center gap-4 mt-3">
                    <Skeleton className="w-20 h-4" />
                    <Skeleton className="w-24 h-4" />
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Skeleton className="w-32 h-11 rounded-xl" />
                <Skeleton className="w-11 h-11 rounded-xl" />
              </div>
            </div>
          </div>
        </SkeletonCard>

        <div className="space-y-6">
          {[1, 2, 3].map((phaseIndex) => (
            <SkeletonCard key={phaseIndex} className="rounded-2xl overflow-hidden">
              <div className="p-6 border-b border-dark-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Skeleton className="w-12 h-12 rounded-xl" />
                    <div>
                      <Skeleton className="w-28 h-5 mb-1" />
                      <Skeleton className="w-36 h-4" />
                    </div>
                  </div>
                  <div className="text-right">
                    <Skeleton className="w-12 h-7 mb-1 ml-auto" />
                    <Skeleton className="w-20 h-3 ml-auto" />
                  </div>
                </div>
                <Skeleton className="w-full h-2 rounded-full mt-4" />
              </div>

              <div className="p-2 space-y-1">
                {[1, 2, 3].map((stepIndex) => (
                  <div
                    key={stepIndex}
                    className="w-full flex items-center gap-4 p-4 rounded-xl"
                  >
                    <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <Skeleton className="w-16 h-5 rounded-md mb-1" />
                      <Skeleton className="w-3/4 h-5 mb-1" />
                      <Skeleton className="w-1/2 h-4" />
                    </div>
                    <div className="flex items-center gap-3">
                      <Skeleton className="w-16 h-4" />
                      <Skeleton className="w-20 h-8 rounded-lg" />
                    </div>
                  </div>
                ))}
              </div>
            </SkeletonCard>
          ))}
        </div>
      </div>
    </div>
  );
}
