import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse bg-dark-700/50 rounded-md',
        className
      )}
    />
  );
}

interface SkeletonCardProps {
  children: React.ReactNode;
  className?: string;
}

export function SkeletonCard({ children, className }: SkeletonCardProps) {
  return (
    <div
      className={cn(
        'bg-dark-800/50 border border-dark-700 rounded-xl',
        className
      )}
    >
      {children}
    </div>
  );
}
