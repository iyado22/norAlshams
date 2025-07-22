import React, { useMemo } from 'react';
import { FixedSizeList as List } from 'react-window';
import { cn } from '@/lib/utils';

const VirtualizedTable = ({
  data = [],
  columns = [],
  height = 400,
  itemHeight = 50,
  className,
  onRowClick,
  ...props
}) => {
  const memoizedData = useMemo(() => data, [data]);

  const Row = ({ index, style }) => {
    const item = memoizedData[index];
    const isEven = index % 2 === 0;

    return (
      <div
        style={style}
        className={cn(
          "flex items-center px-4 border-b border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors",
          isEven ? "bg-white dark:bg-gray-900" : "bg-gray-50 dark:bg-gray-800"
        )}
        onClick={() => onRowClick?.(item, index)}
      >
        {columns.map((column, colIndex) => (
          <div
            key={colIndex}
            className={cn(
              "flex-1 text-sm truncate",
              column.className
            )}
            style={{ minWidth: column.width || 'auto' }}
          >
            {column.render ? column.render(item[column.key], item, index) : item[column.key]}
          </div>
        ))}
      </div>
    );
  };

  const Header = () => (
    <div className="flex items-center px-4 py-3 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 font-medium text-sm">
      {columns.map((column, index) => (
        <div
          key={index}
          className={cn("flex-1 truncate", column.headerClassName)}
          style={{ minWidth: column.width || 'auto' }}
        >
          {column.title}
        </div>
      ))}
    </div>
  );

  if (memoizedData.length === 0) {
    return (
      <div className={cn("border rounded-lg", className)}>
        <Header />
        <div className="flex items-center justify-center py-12 text-gray-500">
          No data available
        </div>
      </div>
    );
  }

  return (
    <div className={cn("border rounded-lg overflow-hidden", className)} {...props}>
      <Header />
      <List
        height={height}
        itemCount={memoizedData.length}
        itemSize={itemHeight}
        overscanCount={5}
      >
        {Row}
      </List>
    </div>
  );
};

export { VirtualizedTable };