import { cn } from '@/lib/utils';

interface SkeletonCardProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * 骨架屏卡片容器组件
 * 用于包裹骨架屏内容，提供卡片样式背景
 */
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
