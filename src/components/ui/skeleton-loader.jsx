import React from 'react';
import { cn } from '@/lib/utils';

const SkeletonLoader = ({ className, ...props }) => {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-gray-200 dark:bg-gray-700",
        className
      )}
      {...props}
    />
  );
};

const CardSkeleton = ({ className }) => (
  <div className={cn("p-6 space-y-4", className)}>
    <SkeletonLoader className="h-4 w-3/4" />
    <SkeletonLoader className="h-4 w-1/2" />
    <SkeletonLoader className="h-8 w-full" />
    <div className="flex gap-2">
      <SkeletonLoader className="h-6 w-16" />
      <SkeletonLoader className="h-6 w-20" />
    </div>
  </div>
);

const TableSkeleton = ({ rows = 5, columns = 4 }) => (
  <div className="space-y-3">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex gap-4">
        {Array.from({ length: columns }).map((_, j) => (
          <SkeletonLoader key={j} className="h-4 flex-1" />
        ))}
      </div>
    ))}
  </div>
);

const ChartSkeleton = ({ className }) => (
  <div className={cn("space-y-4", className)}>
    <SkeletonLoader className="h-6 w-1/3" />
    <SkeletonLoader className="h-64 w-full" />
    <div className="flex justify-between">
      <SkeletonLoader className="h-4 w-16" />
      <SkeletonLoader className="h-4 w-16" />
    </div>
  </div>
);

export { SkeletonLoader, CardSkeleton, TableSkeleton, ChartSkeleton };