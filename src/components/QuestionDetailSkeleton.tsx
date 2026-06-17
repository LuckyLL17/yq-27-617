import { Skeleton, SkeletonCard } from './Skeleton';

export function QuestionDetailSkeleton() {
  return (
    <div className="min-h-screen bg-dark-900">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-2 mb-6">
          <Skeleton className="w-16 h-4" />
          <Skeleton className="w-3 h-4" />
          <Skeleton className="w-24 h-4" />
          <Skeleton className="w-3 h-4" />
          <Skeleton className="w-32 h-4" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 space-y-6">
            <SkeletonCard className="p-6 rounded-2xl">
              <div className="flex items-center gap-3 flex-wrap mb-4">
                <Skeleton className="w-20 h-6 rounded-full" />
                <Skeleton className="w-14 h-6 rounded-full" />
                <Skeleton className="w-16 h-6 rounded-full" />
              </div>
              <Skeleton className="w-3/4 h-8 mb-4" />
              <div className="space-y-2">
                <Skeleton className="w-full h-5" />
                <Skeleton className="w-5/6 h-5" />
                <Skeleton className="w-2/3 h-5" />
              </div>
            </SkeletonCard>

            <SkeletonCard className="rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between p-6">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-10 h-10 rounded-xl" />
                  <div>
                    <Skeleton className="w-24 h-5 mb-1" />
                    <Skeleton className="w-32 h-4" />
                  </div>
                </div>
                <Skeleton className="w-5 h-5" />
              </div>
              <div className="px-6 pb-6 border-t border-dark-700 pt-6 space-y-3">
                <Skeleton className="w-full h-4" />
                <Skeleton className="w-5/6 h-4" />
                <Skeleton className="w-full h-4" />
                <Skeleton className="w-4/5 h-4" />
                <Skeleton className="w-3/4 h-4" />
              </div>
            </SkeletonCard>

            <SkeletonCard className="p-6 rounded-2xl">
              <div className="flex items-center gap-3 mb-4">
                <Skeleton className="w-10 h-10 rounded-xl" />
                <div>
                  <Skeleton className="w-20 h-5 mb-1" />
                  <Skeleton className="w-28 h-4" />
                </div>
              </div>
              <Skeleton className="w-full h-40 rounded-xl" />
            </SkeletonCard>

            <SkeletonCard className="p-6 rounded-2xl">
              <div className="flex items-center gap-3 mb-4">
                <Skeleton className="w-10 h-10 rounded-xl" />
                <div>
                  <Skeleton className="w-24 h-5 mb-1" />
                  <Skeleton className="w-40 h-4" />
                </div>
              </div>
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <SkeletonCard key={i} className="p-4 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <Skeleton className="w-12 h-5 rounded-full" />
                      <Skeleton className="w-16 h-5" />
                    </div>
                    <div className="space-y-1.5">
                      <Skeleton className="w-full h-3" />
                      <Skeleton className="w-5/6 h-3" />
                      <Skeleton className="w-2/3 h-3" />
                    </div>
                  </SkeletonCard>
                ))}
              </div>
            </SkeletonCard>
          </div>

          <div className="space-y-6">
            <SkeletonCard className="p-5 rounded-2xl">
              <Skeleton className="w-20 h-5 mb-4" />
              <div className="space-y-3">
                <Skeleton className="w-full h-10 rounded-lg" />
                <Skeleton className="w-full h-10 rounded-lg" />
              </div>
            </SkeletonCard>

            <SkeletonCard className="p-5 rounded-2xl">
              <Skeleton className="w-24 h-5 mb-4" />
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="w-8 h-8 rounded-lg" />
                    <div className="flex-1">
                      <Skeleton className="w-3/4 h-4 mb-1" />
                      <Skeleton className="w-1/2 h-3" />
                    </div>
                  </div>
                ))}
              </div>
            </SkeletonCard>
          </div>
        </div>
      </div>
    </div>
  );
}
