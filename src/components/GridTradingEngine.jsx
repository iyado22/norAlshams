import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  TrendingUp, 
  TrendingDown, 
  Target,
  AlertTriangle,
  Activity,
  DollarSign
} from 'lucide-react';
import { useGridTrading } from '../hooks/useGridTrading';

const GridTradingEngine = ({ 
  currentPrice, 
  symbol = 'EUR/USD',
  onTradeUpdate,
  className = '' 
}) => {
  const {
    config,
    isActive,
    gridLevels,
    activeTrades,
    tradeHistory,
    statistics,
    updatePrice,
    startTrading,
    stopTrading,
    resetTrading,
    updateConfig,
    totalActiveTrades,
    totalFloatingPnL,
    averageEntryPrice
  } = useGridTrading({
    symbol,
    startingPrice: currentPrice || 1.2000
  });

  // Update price when prop changes
  useEffect(() => {
    if (currentPrice) {
      updatePrice(currentPrice);
    }
  }, [currentPrice, updatePrice]);

  // Notify parent of trade updates
  useEffect(() => {
    if (onTradeUpdate) {
      onTradeUpdate({
        activeTrades,
        tradeHistory,
        statistics,
        totalFloatingPnL
      });
    }
  }, [activeTrades, tradeHistory, statistics, totalFloatingPnL, onTradeUpdate]);

  // Format price for display
  const formatPrice = (price) => {
    if (symbol.includes('JPY')) {
      return price.toFixed(3);
    }
    return price.toFixed(5);
  };

  // Format currency
  const formatCurrency = (amount) => {
    return `$${amount.toFixed(2)}`;
  };

  // Get grid level status color
  const getGridLevelColor = (grid) => {
    if (grid.hasOrder) return 'bg-blue-500';
    if (grid.type === 'buy') return 'bg-green-500';
    return 'bg-red-500';
  };

  // Calculate progress towards take profit
  const takeProfitProgress = Math.max(0, Math.min(100, 
    (totalFloatingPnL / config.takeProfitTarget) * 100
  ));

  // Calculate stop loss progress
  const stopLossAmount = -(config.accountBalance * config.stopLossPercent / 100);
  const stopLossProgress = Math.max(0, Math.min(100,
    Math.abs(totalFloatingPnL / stopLossAmount) * 100
  ));

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Control Panel */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Grid Trading Engine - {symbol}
            </CardTitle>
            <Badge variant={isActive ? "default" : "secondary"}>
              {isActive ? "Active" : "Inactive"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Current Status */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold font-mono">
                {formatPrice(currentPrice || config.startingPrice)}
              </div>
              <div className="text-sm text-muted-foreground">Current Price</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {totalActiveTrades}
              </div>
              <div className="text-sm text-muted-foreground">Active Trades</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${
                totalFloatingPnL >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {formatCurrency(totalFloatingPnL)}
              </div>
              <div className="text-sm text-muted-foreground">Floating P&L</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {formatPrice(averageEntryPrice)}
              </div>
              <div className="text-sm text-muted-foreground">Avg Entry</div>
            </div>
          </div>

          {/* Progress Bars */}
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Take Profit Progress</span>
                <span>{formatCurrency(config.takeProfitTarget)}</span>
              </div>
              <Progress 
                value={takeProfitProgress} 
                className="h-2"
                style={{ 
                  '--progress-background': totalFloatingPnL >= 0 ? '#22c55e' : '#ef4444' 
                }}
              />
            </div>
            
            {totalFloatingPnL < 0 && (
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-red-600">Stop Loss Risk</span>
                  <span className="text-red-600">{formatCurrency(stopLossAmount)}</span>
                </div>
                <Progress 
                  value={stopLossProgress} 
                  className="h-2 bg-red-100"
                  style={{ '--progress-background': '#ef4444' }}
                />
              </div>
            )}
          </div>

          {/* Control Buttons */}
          <div className="flex gap-2">
            <Button
              variant={isActive ? "secondary" : "default"}
              onClick={isActive ? stopTrading : startTrading}
              className="flex-1"
            >
              {isActive ? (
                <>
                  <Pause className="w-4 h-4 mr-2" />
                  Stop Trading
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Start Trading
                </>
              )}
            </Button>
            
            <Button
              variant="outline"
              onClick={resetTrading}
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Grid Levels Display */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Grid Levels
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {gridLevels.map((grid) => (
              <div
                key={grid.id}
                className={`flex items-center justify-between p-2 rounded-lg border ${
                  grid.hasOrder ? 'bg-blue-50 border-blue-200' : 'bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${getGridLevelColor(grid)}`} />
                  <div className="flex items-center gap-2">
                    {grid.type === 'buy' ? (
                      <TrendingUp className="w-4 h-4 text-green-600" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-600" />
                    )}
                    <span className="font-mono text-sm">
                      {formatPrice(grid.price)}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge variant={grid.type === 'buy' ? 'default' : 'secondary'} size="sm">
                    {grid.type.toUpperCase()}
                  </Badge>
                  {grid.hasOrder && (
                    <Badge variant="outline" size="sm">
                      Active
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Active Trades */}
      {activeTrades.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Active Trades ({activeTrades.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {activeTrades.map((trade) => (
                <div
                  key={trade.id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-white"
                >
                  <div className="flex items-center gap-3">
                    {trade.type === 'buy' ? (
                      <TrendingUp className="w-4 h-4 text-green-600" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-600" />
                    )}
                    <div>
                      <div className="font-mono text-sm">
                        {formatPrice(trade.entryPrice)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {trade.lotSize} lots
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className={`font-bold ${
                      trade.pnl >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {formatCurrency(trade.pnl)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {trade.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Trading Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-xl font-bold">{statistics.totalTrades}</div>
              <div className="text-sm text-muted-foreground">Total Trades</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-green-600">
                {statistics.winRate.toFixed(1)}%
              </div>
              <div className="text-sm text-muted-foreground">Win Rate</div>
            </div>
            <div className="text-center">
              <div className={`text-xl font-bold ${
                statistics.totalProfit >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {formatCurrency(statistics.totalProfit)}
              </div>
              <div className="text-sm text-muted-foreground">Total Profit</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-red-600">
                {formatCurrency(statistics.maxDrawdown)}
              </div>
              <div className="text-sm text-muted-foreground">Max Drawdown</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Warnings */}
      {(totalActiveTrades >= config.maxTrades * 0.8 || totalFloatingPnL < stopLossAmount * 0.5) && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-yellow-800">
              <AlertTriangle className="w-5 h-5" />
              <div>
                {totalActiveTrades >= config.maxTrades * 0.8 && (
                  <div>Warning: Approaching maximum trade limit ({totalActiveTrades}/{config.maxTrades})</div>
                )}
                {totalFloatingPnL < stopLossAmount * 0.5 && (
                  <div>Warning: Approaching stop loss level</div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default GridTradingEngine;

