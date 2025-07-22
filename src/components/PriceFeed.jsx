import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw, Wifi, WifiOff } from 'lucide-react';
import { usePriceFeed } from '../hooks/usePriceFeed';

const PriceFeed = ({ 
  symbol = 'EUR/USD', 
  initialPrice = 1.2000, 
  onPriceUpdate,
  className = '' 
}) => {
  const {
    currentPrice,
    priceHistory,
    isConnected,
    lastUpdate,
    startFeed,
    stopFeed,
    resetFeed
  } = usePriceFeed(symbol, initialPrice);

  // Notify parent component of price updates
  React.useEffect(() => {
    if (onPriceUpdate && currentPrice) {
      onPriceUpdate({
        symbol,
        price: currentPrice,
        timestamp: lastUpdate,
        history: priceHistory
      });
    }
  }, [currentPrice, lastUpdate, onPriceUpdate, symbol, priceHistory]);

  // Calculate price change
  const getPriceChange = () => {
    if (priceHistory.length < 2) return { change: 0, percentage: 0 };
    
    const previous = priceHistory[priceHistory.length - 2]?.price || initialPrice;
    const change = currentPrice - previous;
    const percentage = (change / previous) * 100;
    
    return { change, percentage };
  };

  const { change, percentage } = getPriceChange();
  const isPositive = change >= 0;

  // Format price based on symbol
  const formatPrice = (price) => {
    if (symbol.includes('JPY')) {
      return price.toFixed(3);
    }
    return price.toFixed(5);
  };

  // Format timestamp
  const formatTime = (timestamp) => {
    if (!timestamp) return '--:--:--';
    return timestamp.toLocaleTimeString();
  };

  return (
    <Card className={`${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">{symbol}</CardTitle>
          <div className="flex items-center gap-2">
            <Badge 
              variant={isConnected ? "default" : "secondary"}
              className="flex items-center gap-1"
            >
              {isConnected ? (
                <>
                  <Wifi className="w-3 h-3" />
                  Live
                </>
              ) : (
                <>
                  <WifiOff className="w-3 h-3" />
                  Disconnected
                </>
              )}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Current Price Display */}
        <div className="text-center">
          <div className="text-3xl font-bold font-mono">
            {formatPrice(currentPrice)}
          </div>
          
          {change !== 0 && (
            <div className={`text-sm font-medium ${
              isPositive ? 'text-green-600' : 'text-red-600'
            }`}>
              {isPositive ? '+' : ''}{formatPrice(change)} ({percentage.toFixed(2)}%)
            </div>
          )}
          
          <div className="text-xs text-muted-foreground mt-1">
            Last update: {formatTime(lastUpdate)}
          </div>
        </div>

        {/* Price Statistics */}
        {priceHistory.length > 0 && (
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-muted-foreground">High (24h)</div>
              <div className="font-mono">
                {formatPrice(Math.max(...priceHistory.map(p => p.price)))}
              </div>
            </div>
            <div>
              <div className="text-muted-foreground">Low (24h)</div>
              <div className="font-mono">
                {formatPrice(Math.min(...priceHistory.map(p => p.price)))}
              </div>
            </div>
          </div>
        )}

        {/* Control Buttons */}
        <div className="flex gap-2">
          <Button
            variant={isConnected ? "secondary" : "default"}
            size="sm"
            onClick={isConnected ? stopFeed : startFeed}
            className="flex-1"
          >
            {isConnected ? (
              <>
                <Pause className="w-4 h-4 mr-1" />
                Pause
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-1" />
                Start
              </>
            )}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={resetFeed}
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>

        {/* Data Points Counter */}
        <div className="text-xs text-muted-foreground text-center">
          {priceHistory.length} data points collected
        </div>
      </CardContent>
    </Card>
  );
};

export default PriceFeed;

