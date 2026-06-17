import { Skeleton, SkeletonCard } from './Skeleton';
import { cn } from '@/lib/utils';

interface QuestionCardSkeletonProps {
  viewMode?: 'grid' | 'list';
}

export function QuestionCardSkeleton({ viewMode = 'grid' }: QuestionCardSkeletonProps) {
  if (viewMode === 'list') {
    return (
      <SkeletonCard className="p-5">
        <div className="flex items-start gap-3">
          <Skeleton className="w-8 h-8 rounded-lg flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <Skeleton className="w-12 h-5 rounded-full" />
              <Skeleton className="w-10 h-5 rounded-full" />
            </div>
            <Skeleton className="w-3/4 h-5 mb-2" />
            <Skeleton className="w-full h-4 mb-1" />
            <Skeleton className="w-2/3 h-4" />
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-dark-700 flex items-center gap-4">
          <Skeleton className="w-16 h-4" />
          <Skeleton className="w-16 h-4" />
        </div>
      </SkeletonCard>
    );
  }

  return (
    <SkeletonCard className="p-5">
      <div className="flex items-start gap-3">
        <Skeleton className="w-8 h-8 rounded-lg flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <Skeleton className="w-12 h-5 rounded-full" />
            <Skeleton className="w-10 h-5 rounded-full" />
          </div>
          <Skeleton className="w-full h-5 mb-2" />
          <Skeleton className="w-5/6 h-4 mb-1" />
          <Skeleton className="w-2/3 h-4" />
        </div>
      </div>
      <div className="mt-3 pt-3 border-t border-dark-700 flex items-center gap-4">
        <Skeleton className="w-14 h-4" />
        <Skeleton className="w-14 h-4" />
      </div>
    </SkeletonCard>
  );
}

interface QuestionListSkeletonProps {
  count?: number;
  viewMode?: 'grid' | 'list';
}

export function QuestionListSkeleton({ count = 6, viewMode = 'grid' }: QuestionListSkeletonProps) {
  return (
    <div
      className={cn(
        'grid gap-4',
        viewMode === 'grid'
          ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
          : 'grid-cols-1'
      )}
    >
      {Array.from({ length: count }).map((_, i) => (
        <QuestionCardSkeleton key={i} viewMode={viewMode} />
      ))}
    </div>
  );
}
