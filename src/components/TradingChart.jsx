import React, { useState, useEffect, useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Scatter,
  ComposedChart,
  Area,
  AreaChart
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  Activity,
  Maximize2,
  Minimize2
} from 'lucide-react';

const TradingChart = ({ 
  priceData = [], 
  gridLevels = [], 
  activeTrades = [], 
  tradeHistory = [],
  currentPrice,
  symbol = 'EUR/USD',
  className = '' 
}) => {
  const [chartType, setChartType] = useState('line'); // 'line', 'area', 'candlestick'
  const [timeframe, setTimeframe] = useState('1m');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const [showTrades, setShowTrades] = useState(true);

  // Process price data for chart
  const chartData = useMemo(() => {
    if (!priceData || priceData.length === 0) return [];
    
    return priceData.map((point, index) => ({
      timestamp: point.timestamp || new Date(Date.now() - (priceData.length - index) * 1000),
      price: point.price || point.close || point,
      open: point.open || point.price || point,
      high: point.high || point.price || point,
      low: point.low || point.price || point,
      close: point.close || point.price || point,
      volume: point.volume || 0,
      index
    }));
  }, [priceData]);

  // Format price for display
  const formatPrice = (price) => {
    if (!price) return '0.00000';
    if (symbol.includes('JPY')) {
      return price.toFixed(3);
    }
    return price.toFixed(5);
  };

  // Format timestamp for tooltip
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  };

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="text-sm font-medium">{formatTime(label)}</p>
          <div className="space-y-1">
            {chartType === 'candlestick' ? (
              <>
                <p className="text-sm">Open: <span className="font-mono">{formatPrice(data.open)}</span></p>
                <p className="text-sm">High: <span className="font-mono">{formatPrice(data.high)}</span></p>
                <p className="text-sm">Low: <span className="font-mono">{formatPrice(data.low)}</span></p>
                <p className="text-sm">Close: <span className="font-mono">{formatPrice(data.close)}</span></p>
              </>
            ) : (
              <p className="text-sm">Price: <span className="font-mono">{formatPrice(data.price)}</span></p>
            )}
            {data.volume > 0 && (
              <p className="text-sm">Volume: {data.volume}</p>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  // Get trade markers for the chart
  const getTradeMarkers = () => {
    const markers = [];
    
    // Add active trades
    activeTrades.forEach(trade => {
      const dataPoint = chartData.find(d => 
        Math.abs(d.price - trade.entryPrice) < 0.0001
      );
      
      if (dataPoint) {
        markers.push({
          ...dataPoint,
          tradeType: trade.type,
          tradeId: trade.id,
          isActive: true,
          pnl: trade.pnl
        });
      }
    });

    // Add closed trades
    tradeHistory.forEach(trade => {
      const entryPoint = chartData.find(d => 
        Math.abs(d.price - trade.entryPrice) < 0.0001
      );
      const exitPoint = chartData.find(d => 
        Math.abs(d.price - trade.exitPrice) < 0.0001
      );
      
      if (entryPoint) {
        markers.push({
          ...entryPoint,
          tradeType: trade.type,
          tradeId: trade.id,
          isActive: false,
          isEntry: true,
          pnl: trade.finalPnL
        });
      }
      
      if (exitPoint) {
        markers.push({
          ...exitPoint,
          tradeType: trade.type,
          tradeId: trade.id,
          isActive: false,
          isEntry: false,
          pnl: trade.finalPnL
        });
      }
    });

    return markers;
  };

  const tradeMarkers = showTrades ? getTradeMarkers() : [];

  // Calculate price range for better chart scaling
  const priceRange = useMemo(() => {
    if (chartData.length === 0) return { min: 0, max: 1 };
    
    const prices = chartData.flatMap(d => [d.high || d.price, d.low || d.price]);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const padding = (max - min) * 0.1;
    
    return {
      min: min - padding,
      max: max + padding
    };
  }, [chartData]);

  // Render chart based on type
  const renderChart = () => {
    const commonProps = {
      data: chartData,
      margin: { top: 5, right: 30, left: 20, bottom: 5 }
    };

    switch (chartType) {
      case 'area':
        return (
          <AreaChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="timestamp"
              tickFormatter={formatTime}
              stroke="#666"
            />
            <YAxis 
              domain={[priceRange.min, priceRange.max]}
              tickFormatter={formatPrice}
              stroke="#666"
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="price"
              stroke="#3b82f6"
              fill="#3b82f6"
              fillOpacity={0.1}
              strokeWidth={2}
            />
            
            {/* Grid levels */}
            {showGrid && gridLevels.map(grid => (
              <ReferenceLine
                key={grid.id}
                y={grid.price}
                stroke={grid.type === 'buy' ? '#22c55e' : '#ef4444'}
                strokeDasharray="5 5"
                strokeOpacity={0.6}
              />
            ))}
          </AreaChart>
        );

      case 'candlestick':
        // Simplified candlestick using composed chart
        return (
          <ComposedChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="timestamp"
              tickFormatter={formatTime}
              stroke="#666"
            />
            <YAxis 
              domain={[priceRange.min, priceRange.max]}
              tickFormatter={formatPrice}
              stroke="#666"
            />
            <Tooltip content={<CustomTooltip />} />
            
            {/* High-Low lines */}
            <Line
              type="monotone"
              dataKey="high"
              stroke="#666"
              strokeWidth={1}
              dot={false}
              connectNulls={false}
            />
            <Line
              type="monotone"
              dataKey="low"
              stroke="#666"
              strokeWidth={1}
              dot={false}
              connectNulls={false}
            />
            
            {/* Close price line */}
            <Line
              type="monotone"
              dataKey="close"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={false}
            />
            
            {/* Grid levels */}
            {showGrid && gridLevels.map(grid => (
              <ReferenceLine
                key={grid.id}
                y={grid.price}
                stroke={grid.type === 'buy' ? '#22c55e' : '#ef4444'}
                strokeDasharray="5 5"
                strokeOpacity={0.6}
              />
            ))}
          </ComposedChart>
        );

      default: // line chart
        return (
          <ComposedChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="timestamp"
              tickFormatter={formatTime}
              stroke="#666"
            />
            <YAxis 
              domain={[priceRange.min, priceRange.max]}
              tickFormatter={formatPrice}
              stroke="#666"
            />
            <Tooltip content={<CustomTooltip />} />
            
            {/* Price line */}
            <Line
              type="monotone"
              dataKey="price"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={false}
            />
            
            {/* Grid levels */}
            {showGrid && gridLevels.map(grid => (
              <ReferenceLine
                key={grid.id}
                y={grid.price}
                stroke={grid.type === 'buy' ? '#22c55e' : '#ef4444'}
                strokeDasharray="5 5"
                strokeOpacity={0.6}
                label={{ value: `${grid.type.toUpperCase()} ${formatPrice(grid.price)}`, position: 'right' }}
              />
            ))}
            
            {/* Trade markers */}
            {tradeMarkers.length > 0 && (
              <Scatter
                dataKey="price"
                data={tradeMarkers}
                fill={(entry) => {
                  if (entry.isActive) return '#3b82f6';
                  return entry.pnl >= 0 ? '#22c55e' : '#ef4444';
                }}
              />
            )}
            
            {/* Current price line */}
            {currentPrice && (
              <ReferenceLine
                y={currentPrice}
                stroke="#f59e0b"
                strokeWidth={2}
                label={{ value: `Current: ${formatPrice(currentPrice)}`, position: 'right' }}
              />
            )}
          </ComposedChart>
        );
    }
  };

  return (
    <Card className={`${className} ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            {symbol} Price Chart
          </CardTitle>
          
          <div className="flex items-center gap-2">
            {/* Chart type selector */}
            <div className="flex gap-1">
              <Button
                variant={chartType === 'line' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setChartType('line')}
              >
                Line
              </Button>
              <Button
                variant={chartType === 'area' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setChartType('area')}
              >
                Area
              </Button>
              <Button
                variant={chartType === 'candlestick' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setChartType('candlestick')}
              >
                OHLC
              </Button>
            </div>
            
            {/* Toggle buttons */}
            <Button
              variant={showGrid ? 'default' : 'outline'}
              size="sm"
              onClick={() => setShowGrid(!showGrid)}
            >
              Grid
            </Button>
            <Button
              variant={showTrades ? 'default' : 'outline'}
              size="sm"
              onClick={() => setShowTrades(!showTrades)}
            >
              Trades
            </Button>
            
            {/* Fullscreen toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsFullscreen(!isFullscreen)}
            >
              {isFullscreen ? (
                <Minimize2 className="w-4 h-4" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
        
        {/* Chart info */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            {chartData.length} data points
          </div>
          {currentPrice && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              Current: {formatPrice(currentPrice)}
            </div>
          )}
          {showGrid && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              {gridLevels.filter(g => g.type === 'buy').length} Buy levels
              <div className="w-3 h-3 rounded-full bg-red-500 ml-2" />
              {gridLevels.filter(g => g.type === 'sell').length} Sell levels
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        <div className={`${isFullscreen ? 'h-screen' : 'h-96'}`}>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              {renderChart()}
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <div className="text-center">
                <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No price data available</p>
                <p className="text-sm">Start the price feed to see live data</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TradingChart;

