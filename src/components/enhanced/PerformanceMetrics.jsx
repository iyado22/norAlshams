import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Activity, 
  Zap, 
  Database, 
  Wifi, 
  Eye, 
  EyeOff,
  RefreshCw
} from 'lucide-react';
import { usePerformanceMonitor, useMemoryMonitor, useNetworkMonitor } from '@/hooks/usePerformanceMonitor';

const PerformanceMetrics = ({ className }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [fps, setFps] = useState(0);
  const memoryInfo = useMemoryMonitor();
  const networkInfo = useNetworkMonitor();
  const performanceMetrics = usePerformanceMonitor('PerformanceMetrics');

  // FPS monitoring
  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    
    const measureFPS = () => {
      frameCount++;
      const currentTime = performance.now();
      
      if (currentTime - lastTime >= 1000) {
        setFps(Math.round((frameCount * 1000) / (currentTime - lastTime)));
        frameCount = 0;
        lastTime = currentTime;
      }
      
      requestAnimationFrame(measureFPS);
    };
    
    const animationId = requestAnimationFrame(measureFPS);
    return () => cancelAnimationFrame(animationId);
  }, []);

  const formatBytes = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getPerformanceColor = (value, thresholds) => {
    if (value >= thresholds.good) return 'text-green-600';
    if (value >= thresholds.warning) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsVisible(true)}
          className="bg-white/90 backdrop-blur-sm"
        >
          <Activity className="w-4 h-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80">
      <Card className="bg-white/95 backdrop-blur-sm border shadow-lg">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">Performance Monitor</CardTitle>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.location.reload()}
                className="h-6 w-6 p-0"
              >
                <RefreshCw className="w-3 h-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsVisible(false)}
                className="h-6 w-6 p-0"
              >
                <EyeOff className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 text-xs">
          {/* FPS */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-3 h-3" />
              <span>FPS</span>
            </div>
            <Badge 
              variant="outline" 
              className={getPerformanceColor(fps, { good: 55, warning: 30 })}
            >
              {fps}
            </Badge>
          </div>

          {/* Render Performance */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-3 h-3" />
              <span>Renders</span>
            </div>
            <Badge variant="outline">
              {performanceMetrics.renderCount}
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3" />
              <span>Avg Time</span>
            </div>
            <Badge 
              variant="outline"
              className={getPerformanceColor(
                16 - performanceMetrics.averageRenderTime, 
                { good: 10, warning: 5 }
              )}
            >
              {performanceMetrics.averageRenderTime.toFixed(1)}ms
            </Badge>
          </div>

          {/* Memory Usage */}
          {memoryInfo && (
            <>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Database className="w-3 h-3" />
                  <span>Memory</span>
                </div>
                <Badge variant="outline">
                  {formatBytes(memoryInfo.usedJSHeapSize)}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3" />
                  <span>Limit</span>
                </div>
                <Badge variant="outline">
                  {formatBytes(memoryInfo.jsHeapSizeLimit)}
                </Badge>
              </div>
            </>
          )}

          {/* Network Info */}
          {networkInfo && (
            <>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wifi className="w-3 h-3" />
                  <span>Connection</span>
                </div>
                <Badge variant="outline">
                  {networkInfo.effectiveType}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3" />
                  <span>Downlink</span>
                </div>
                <Badge variant="outline">
                  {networkInfo.downlink} Mbps
                </Badge>
              </div>
            </>
          )}

          {/* Performance Tips */}
          {(fps < 30 || performanceMetrics.averageRenderTime > 16) && (
            <div className="mt-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded text-yellow-800 dark:text-yellow-200">
              <div className="font-medium text-xs">Performance Warning</div>
              <div className="text-xs mt-1">
                Consider reducing visual effects or closing other tabs
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export { PerformanceMetrics };