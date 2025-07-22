import { useEffect, useRef, useState } from 'react';

export const usePerformanceMonitor = (componentName) => {
  const renderCount = useRef(0);
  const startTime = useRef(performance.now());
  const [metrics, setMetrics] = useState({
    renderCount: 0,
    averageRenderTime: 0,
    lastRenderTime: 0
  });

  useEffect(() => {
    renderCount.current += 1;
    const endTime = performance.now();
    const renderTime = endTime - startTime.current;
    
    setMetrics(prev => ({
      renderCount: renderCount.current,
      lastRenderTime: renderTime,
      averageRenderTime: (prev.averageRenderTime * (renderCount.current - 1) + renderTime) / renderCount.current
    }));

    // Log performance in development
    if (process.env.NODE_ENV === 'development' && renderTime > 16) {
      console.warn(`Slow render detected in ${componentName}: ${renderTime.toFixed(2)}ms`);
    }

    startTime.current = performance.now();
  });

  return metrics;
};

export const useMemoryMonitor = () => {
  const [memoryInfo, setMemoryInfo] = useState(null);

  useEffect(() => {
    const updateMemoryInfo = () => {
      if ('memory' in performance) {
        setMemoryInfo({
          usedJSHeapSize: performance.memory.usedJSHeapSize,
          totalJSHeapSize: performance.memory.totalJSHeapSize,
          jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
        });
      }
    };

    updateMemoryInfo();
    const interval = setInterval(updateMemoryInfo, 5000);

    return () => clearInterval(interval);
  }, []);

  return memoryInfo;
};

export const useNetworkMonitor = () => {
  const [networkInfo, setNetworkInfo] = useState(null);

  useEffect(() => {
    const updateNetworkInfo = () => {
      if ('connection' in navigator) {
        setNetworkInfo({
          effectiveType: navigator.connection.effectiveType,
          downlink: navigator.connection.downlink,
          rtt: navigator.connection.rtt,
          saveData: navigator.connection.saveData
        });
      }
    };

    updateNetworkInfo();
    
    if ('connection' in navigator) {
      navigator.connection.addEventListener('change', updateNetworkInfo);
      return () => navigator.connection.removeEventListener('change', updateNetworkInfo);
    }
  }, []);

  return networkInfo;
};