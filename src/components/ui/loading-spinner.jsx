import React from 'react';
import { cn } from '@/lib/utils';

const LoadingSpinner = ({ 
  size = 'default', 
  className,
  text,
  ...props 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    default: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  return (
    <div className={cn("flex items-center justify-center gap-2", className)} {...props}>
      <div 
        className={cn(
          "animate-spin rounded-full border-2 border-gray-300 border-t-blue-600",
          sizeClasses[size]
        )}
      />
      {text && (
        <span className="text-sm text-gray-600 dark:text-gray-400 animate-pulse">
          {text}
        </span>
      )}
    </div>
  );
};

export { LoadingSpinner };