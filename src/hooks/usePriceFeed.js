import { useState, useEffect, useRef } from 'react';
import { useSession } from '../components/SessionProvider';

// Price feed hook for generating dummy data and real-time price updates
export const usePriceFeed = (symbol = 'EUR/USD', initialPrice = 1.2000, useRealData = false) => {
  const { updatePreferences, preferences } = useSession();
  const [currentPrice, setCurrentPrice] = useState(initialPrice);
  const [priceHistory, setPriceHistory] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const intervalRef = useRef(null);

  // Load saved price feed preferences
  useEffect(() => {
    if (preferences.priceFeed) {
      setCurrentPrice(preferences.priceFeed.lastPrice || initialPrice);
    }
  }, [preferences.priceFeed, initialPrice]);

  // Generate realistic price movement
  const generatePriceMovement = (currentPrice) => {
    // Random walk with slight trend and volatility
    const volatility = 0.0001; // 1 pip for EUR/USD
    const trend = (Math.random() - 0.5) * 0.00005; // Small trend component
    const randomChange = (Math.random() - 0.5) * volatility * 2;
    
    const newPrice = currentPrice + trend + randomChange;
    
    // Ensure price stays within reasonable bounds
    const minPrice = initialPrice * 0.95;
    const maxPrice = initialPrice * 1.05;
    
    return Math.max(minPrice, Math.min(maxPrice, newPrice));
  };

  // Start price feed
  const startFeed = () => {
    if (intervalRef.current) return;
    
    setIsConnected(true);
    
    intervalRef.current = setInterval(() => {
      const timestamp = new Date();
      
      if (useRealData) {
        // TODO: Implement real data fetching from yfinance or other API
        // For now, use dummy data
        const newPrice = generatePriceMovement(currentPrice);
        setCurrentPrice(newPrice);
        
        setPriceHistory(prev => {
          const newHistory = [...prev, { 
            timestamp, 
            price: newPrice,
            open: prev.length > 0 ? prev[prev.length - 1].price : newPrice,
            high: newPrice,
            low: newPrice,
            close: newPrice,
            volume: Math.floor(Math.random() * 1000) + 100
          }];
          
          // Keep only last 1000 data points
          return newHistory.slice(-1000);
        });
      } else {
        // Generate dummy data
        const newPrice = generatePriceMovement(currentPrice);
        setCurrentPrice(newPrice);
        
        setPriceHistory(prev => {
          const newHistory = [...prev, { 
            timestamp, 
            price: newPrice,
            open: prev.length > 0 ? prev[prev.length - 1].price : newPrice,
            high: newPrice,
            low: newPrice,
            close: newPrice,
            volume: Math.floor(Math.random() * 1000) + 100
          }];
          
          // Keep only last 1000 data points
          return newHistory.slice(-1000);
        });
      }
      
      setLastUpdate(timestamp);
      
      // Save current price to preferences
      updatePreferences({
        priceFeed: {
          lastPrice: newPrice,
          symbol,
          lastUpdate: timestamp.toISOString()
        }
      });
    }, 1000); // Update every second
  };

  // Stop price feed
  const stopFeed = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      setIsConnected(false);
    }
  };

  // Reset price feed
  const resetFeed = () => {
    stopFeed();
    setCurrentPrice(initialPrice);
    setPriceHistory([]);
    setLastUpdate(null);
    
    // Clear saved price data
    updatePreferences({
      priceFeed: null
    });
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Auto-start feed on mount
  useEffect(() => {
    startFeed();
    return () => stopFeed();
  }, []);

  const switchSymbol = (newSymbol) => {
    updatePreferences({
      priceFeed: {
        ...preferences.priceFeed,
        symbol: newSymbol
      }
    });
  };

  return {
    currentPrice,
    priceHistory,
    isConnected,
    lastUpdate,
    switchSymbol,
    startFeed,
    stopFeed,
    resetFeed,
    symbol
  };
};

// Hook for multiple currency pairs
export const useMultiplePriceFeeds = (pairs = [
  { symbol: 'EUR/USD', initialPrice: 1.2000 },
  { symbol: 'GBP/USD', initialPrice: 1.3000 },
  { symbol: 'USD/JPY', initialPrice: 110.00 },
  { symbol: 'AUD/USD', initialPrice: 0.7500 }
]) => {
  const [feeds, setFeeds] = useState({});
  const [activePair, setActivePair] = useState(pairs[0]?.symbol || 'EUR/USD');

  useEffect(() => {
    const newFeeds = {};
    pairs.forEach(pair => {
      newFeeds[pair.symbol] = {
        currentPrice: pair.initialPrice,
        priceHistory: [],
        isConnected: false,
        lastUpdate: null
      };
    });
    setFeeds(newFeeds);
  }, []);

  const updateFeed = (symbol, data) => {
    setFeeds(prev => ({
      ...prev,
      [symbol]: {
        ...prev[symbol],
        ...data
      }
    }));
  };

  return {
    feeds,
    activePair,
    setActivePair,
    updateFeed,
    availablePairs: pairs.map(p => p.symbol)
  };
};

