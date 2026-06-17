import { Skeleton, SkeletonCard } from './Skeleton';

interface CategoryCardSkeletonProps {
  className?: string;
}

export function CategoryCardSkeleton({ className }: CategoryCardSkeletonProps) {
  return (
    <SkeletonCard className={`p-6 ${className || ''}`}>
      <div className="flex items-start gap-4">
        <Skeleton className="w-14 h-14 rounded-xl flex-shrink-0" />
        <div className="flex-1">
          <Skeleton className="w-2/3 h-5 mb-2" />
          <Skeleton className="w-full h-4" />
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Skeleton className="w-10 h-6" />
          <Skeleton className="w-12 h-4" />
        </div>
        <Skeleton className="w-24 h-2 rounded-full" />
      </div>
    </SkeletonCard>
  );
}

interface CategoryListSkeletonProps {
  count?: number;
}

export function CategoryListSkeleton({ count = 5 }: CategoryListSkeletonProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <CategoryCardSkeleton key={i} />
      ))}
    </div>
  );
}
