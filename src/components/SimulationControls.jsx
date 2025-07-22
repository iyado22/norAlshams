import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Play, 
  Pause, 
  Square,
  SkipForward,
  RotateCcw,
  Gauge,
  Clock,
  Zap,
  Settings
} from 'lucide-react';

const SimulationControls = ({ 
  isActive,
  isPaused,
  simulationSpeed,
  onStart,
  onPause,
  onStop,
  onStep,
  onReset,
  onSpeedChange,
  statistics
}) => {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [startTime, setStartTime] = useState(null);

  useEffect(() => {
    let interval;
    if (isActive && !isPaused && startTime) {
      interval = setInterval(() => {
        setElapsedTime(Date.now() - startTime);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, isPaused, startTime]);

  const handleStart = () => {
    if (!startTime) {
      setStartTime(Date.now());
    }
    onStart();
  };

  const handleStop = () => {
    setElapsedTime(0);
    setStartTime(null);
    onStop();
  };

  const handleReset = () => {
    setElapsedTime(0);
    setStartTime(null);
    onReset();
  };

  const formatTime = (ms) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}:${(minutes % 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
    }
    return `${minutes}:${(seconds % 60).toString().padStart(2, '0')}`;
  };

  const speedOptions = [
    { value: 0.5, label: '0.5x', description: 'Slow' },
    { value: 1, label: '1x', description: 'Normal' },
    { value: 2, label: '2x', description: 'Fast' },
    { value: 5, label: '5x', description: 'Very Fast' },
    { value: 10, label: '10x', description: 'Ultra Fast' }
  ];

  const getStatusColor = () => {
    if (!isActive) return 'bg-gray-500';
    if (isPaused) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStatusText = () => {
    if (!isActive) return 'Stopped';
    if (isPaused) return 'Paused';
    return 'Running';
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Simulation Controls
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${getStatusColor()}`}></div>
            <Badge variant={isActive ? (isPaused ? 'secondary' : 'default') : 'outline'}>
              {getStatusText()}
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Main Controls */}
        <div className="flex items-center justify-center gap-3">
          {!isActive ? (
            <Button
              onClick={handleStart}
              size="lg"
              className="flex items-center gap-2 px-6"
            >
              <Play className="w-5 h-5" />
              Start Simulation
            </Button>
          ) : (
            <>
              {isPaused ? (
                <Button
                  onClick={onStart}
                  size="lg"
                  className="flex items-center gap-2"
                >
                  <Play className="w-5 h-5" />
                  Resume
                </Button>
              ) : (
                <Button
                  onClick={onPause}
                  size="lg"
                  variant="secondary"
                  className="flex items-center gap-2"
                >
                  <Pause className="w-5 h-5" />
                  Pause
                </Button>
              )}
              
              <Button
                onClick={onStep}
                size="lg"
                variant="outline"
                disabled={!isPaused}
                className="flex items-center gap-2"
              >
                <SkipForward className="w-5 h-5" />
                Step
              </Button>
              
              <Button
                onClick={handleStop}
                size="lg"
                variant="destructive"
                className="flex items-center gap-2"
              >
                <Square className="w-5 h-5" />
                Stop
              </Button>
            </>
          )}
          
          <Button
            onClick={handleReset}
            size="lg"
            variant="outline"
            className="flex items-center gap-2"
          >
            <RotateCcw className="w-5 h-5" />
            Reset
          </Button>
        </div>

        {/* Speed Control */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Gauge className="w-4 h-4" />
            <span className="text-sm font-medium">Simulation Speed</span>
          </div>
          <div className="flex gap-2 flex-wrap">
            {speedOptions.map(option => (
              <Button
                key={option.value}
                variant={simulationSpeed === option.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => onSpeedChange(option.value)}
                disabled={!isActive}
                className="flex flex-col items-center gap-1 h-auto py-2"
              >
                <span className="font-bold">{option.label}</span>
                <span className="text-xs opacity-75">{option.description}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Clock className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium">Runtime</span>
            </div>
            <div className="text-lg font-bold text-blue-600">
              {formatTime(elapsedTime)}
            </div>
          </div>
          
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Zap className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium">Trades/Min</span>
            </div>
            <div className="text-lg font-bold text-green-600">
              {statistics?.tradesPerMinute?.toFixed(1) || '0.0'}
            </div>
          </div>
          
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center justify-center gap-1 mb-1">
              <SkipForward className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium">Price Ticks</span>
            </div>
            <div className="text-lg font-bold text-purple-600">
              {statistics?.totalPriceTicks || 0}
            </div>
          </div>
          
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Gauge className="w-4 h-4 text-orange-600" />
              <span className="text-sm font-medium">Speed</span>
            </div>
            <div className="text-lg font-bold text-orange-600">
              {simulationSpeed}x
            </div>
          </div>
        </div>

        {/* Progress Information */}
        {isActive && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                Simulation Active
              </span>
            </div>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              The grid trading engine is {isPaused ? 'paused' : 'actively monitoring'} price movements 
              and will execute trades when price hits grid levels.
            </p>
          </div>
        )}

        {/* Instructions */}
        {!isActive && (
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <h4 className="font-medium mb-2">How to use:</h4>
            <ul className="text-sm space-y-1 text-gray-600 dark:text-gray-400">
              <li>• <strong>Start:</strong> Begin the grid trading simulation</li>
              <li>• <strong>Pause/Resume:</strong> Temporarily halt or continue trading</li>
              <li>• <strong>Step:</strong> Execute one price tick while paused</li>
              <li>• <strong>Stop:</strong> End the simulation and close all trades</li>
              <li>• <strong>Reset:</strong> Clear all data and return to initial state</li>
              <li>• <strong>Speed:</strong> Adjust how fast the simulation runs</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SimulationControls;

