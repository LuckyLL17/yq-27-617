import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
}

/**
 * 骨架屏加载组件
 * 用于在内容加载时显示占位动画
 */
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
