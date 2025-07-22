import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Enhanced Grid Trading Hook
 * Implements automated grid trading strategy with manual trade support
 */
export const useGridTrading = (initialConfig = {}) => {
  // Default configuration
  const defaultConfig = {
    symbol: 'EUR/USD',
    startingPrice: 1.2000,
    gridSize: 0.0010, // 10 pips
    gridLevels: 10,
    lotSize: 0.01,
    maxTrades: 20,
    takeProfitTarget: 100, // Total profit target in USD
    stopLossPercent: 5, // Stop loss as percentage of account
    accountBalance: 10000,
    ...initialConfig
  };

  // State management
  const [config, setConfig] = useState(defaultConfig);
  const [isActive, setIsActive] = useState(false);
  const [currentPrice, setCurrentPrice] = useState(config.startingPrice);
  const [gridLevels, setGridLevels] = useState([]);
  const [activeTrades, setActiveTrades] = useState([]);
  const [tradeHistory, setTradeHistory] = useState([]);
  const [statistics, setStatistics] = useState({
    totalTrades: 0,
    winningTrades: 0,
    losingTrades: 0,
    totalProfit: 0,
    averageEntryPrice: 0,
    floatingPnL: 0,
    maxDrawdown: 0,
    winRate: 0
  });

  const tradeIdCounter = useRef(1);
  const priceHistory = useRef([]);
  const maxProfitRef = useRef(0);

  // Calculate grid levels based on configuration
  const calculateGridLevels = useCallback((centerPrice, gridSize, levels) => {
    const grids = [];
    const halfLevels = Math.floor(levels / 2);
    
    for (let i = -halfLevels; i <= halfLevels; i++) {
      if (i === 0) continue; // Skip center price
      
      const price = centerPrice + (i * gridSize);
      const type = i < 0 ? 'buy' : 'sell'; // Buy below, sell above
      
      grids.push({
        id: `grid_${i}`,
        level: i,
        price: parseFloat(price.toFixed(5)),
        type,
        isActive: true,
        hasOrder: false
      });
    }
    
    return grids.sort((a, b) => a.price - b.price);
  }, []);

  // Initialize grid levels
  useEffect(() => {
    const levels = calculateGridLevels(
      config.startingPrice, 
      config.gridSize, 
      config.gridLevels
    );
    setGridLevels(levels);
  }, [config.startingPrice, config.gridSize, config.gridLevels, calculateGridLevels]);

  // Calculate profit/loss for a trade
  const calculateTradePnL = useCallback((trade, currentPrice) => {
    const priceDiff = trade.type === 'buy' 
      ? currentPrice - trade.entryPrice 
      : trade.entryPrice - currentPrice;
    
    // Convert to USD (simplified calculation)
    const pipValue = config.symbol.includes('JPY') ? 0.01 : 0.0001;
    const pips = priceDiff / pipValue;
    const dollarPerPip = trade.lotSize * 10; // Simplified calculation
    
    return pips * dollarPerPip;
  }, [config.symbol]);

  // Calculate average entry price
  const calculateAverageEntry = useCallback((trades) => {
    if (trades.length === 0) return 0;
    
    const totalVolume = trades.reduce((sum, trade) => sum + trade.lotSize, 0);
    const weightedSum = trades.reduce((sum, trade) => 
      sum + (trade.entryPrice * trade.lotSize), 0);
    
    return totalVolume > 0 ? weightedSum / totalVolume : 0;
  }, []);

  // Check if price hits a grid level
  const checkGridHits = useCallback((newPrice) => {
    if (!isActive) return;

    gridLevels.forEach(grid => {
      if (grid.hasOrder || !grid.isActive) return;

      const priceHit = grid.type === 'buy' 
        ? newPrice <= grid.price 
        : newPrice >= grid.price;

      if (priceHit && activeTrades.length < config.maxTrades) {
        // Create new trade
        const newTrade = {
          id: `trade_${tradeIdCounter.current++}`,
          gridId: grid.id,
          type: grid.type,
          entryPrice: grid.price,
          currentPrice: newPrice,
          lotSize: config.lotSize,
          entryTime: new Date().toISOString(),
          status: 'active',
          source: 'grid',
          symbol: config.symbol,
          pnl: 0
        };

        setActiveTrades(prev => [...prev, newTrade]);
        
        // Mark grid level as having an order
        setGridLevels(prev => prev.map(g => 
          g.id === grid.id ? { ...g, hasOrder: true } : g
        ));

        console.log(`Grid hit: ${grid.type} at ${grid.price} (current: ${newPrice})`);
      }
    });
  }, [isActive, gridLevels, activeTrades.length, config.maxTrades, config.lotSize, config.symbol]);

  // Update trades with current price
  const updateTrades = useCallback((newPrice) => {
    setActiveTrades(prev => prev.map(trade => ({
      ...trade,
      currentPrice: newPrice,
      pnl: calculateTradePnL(trade, newPrice)
    })));
  }, [calculateTradePnL]);

  // Check individual trade stop loss and take profit
  const checkIndividualTradeExits = useCallback((newPrice) => {
    const tradesToClose = [];
    
    activeTrades.forEach(trade => {
      let shouldClose = false;
      let exitReason = '';

      // Check stop loss
      if (trade.stopLoss) {
        const stopLossHit = trade.type === 'buy' 
          ? newPrice <= trade.stopLoss 
          : newPrice >= trade.stopLoss;
        
        if (stopLossHit) {
          shouldClose = true;
          exitReason = 'stop_loss';
        }
      }

      // Check take profit
      if (trade.takeProfit && !shouldClose) {
        const takeProfitHit = trade.type === 'buy' 
          ? newPrice >= trade.takeProfit 
          : newPrice <= trade.takeProfit;
        
        if (takeProfitHit) {
          shouldClose = true;
          exitReason = 'take_profit';
        }
      }

      if (shouldClose) {
        const finalPnL = calculateTradePnL(trade, newPrice);
        tradesToClose.push({
          ...trade,
          status: 'closed',
          exitPrice: newPrice,
          exitTime: new Date().toISOString(),
          exitReason,
          profit: finalPnL
        });
      }
    });

    if (tradesToClose.length > 0) {
      // Move closed trades to history
      setTradeHistory(prev => [...prev, ...tradesToClose]);
      
      // Remove closed trades from active trades
      const closedTradeIds = tradesToClose.map(t => t.id);
      setActiveTrades(prev => prev.filter(t => !closedTradeIds.includes(t.id)));
      
      // Reset grid levels for closed grid trades
      tradesToClose.forEach(trade => {
        if (trade.gridId) {
          setGridLevels(prev => prev.map(g => 
            g.id === trade.gridId ? { ...g, hasOrder: false } : g
          ));
        }
      });

      console.log(`Closed ${tradesToClose.length} trades due to SL/TP`);
    }
  }, [activeTrades, calculateTradePnL]);

  // Check take profit conditions
  const checkTakeProfit = useCallback(() => {
    const totalFloatingPnL = activeTrades.reduce((sum, trade) => sum + trade.pnl, 0);
    
    if (totalFloatingPnL >= config.takeProfitTarget) {
      // Close all trades
      const closedTrades = activeTrades.map(trade => ({
        ...trade,
        status: 'closed',
        exitPrice: trade.currentPrice,
        exitTime: new Date().toISOString(),
        exitReason: 'global_take_profit',
        profit: trade.pnl
      }));

      setTradeHistory(prev => [...prev, ...closedTrades]);
      setActiveTrades([]);
      
      // Reset grid levels
      setGridLevels(prev => prev.map(g => ({ ...g, hasOrder: false })));
      
      console.log(`Take profit hit: $${totalFloatingPnL.toFixed(2)}`);
      return true;
    }
    
    return false;
  }, [activeTrades, config.takeProfitTarget]);

  // Check stop loss conditions
  const checkStopLoss = useCallback(() => {
    const totalFloatingPnL = activeTrades.reduce((sum, trade) => sum + trade.pnl, 0);
    const stopLossAmount = -(config.accountBalance * config.stopLossPercent / 100);
    
    if (totalFloatingPnL <= stopLossAmount) {
      // Close all trades
      const closedTrades = activeTrades.map(trade => ({
        ...trade,
        status: 'closed',
        exitPrice: trade.currentPrice,
        exitTime: new Date().toISOString(),
        exitReason: 'global_stop_loss',
        profit: trade.pnl
      }));

      setTradeHistory(prev => [...prev, ...closedTrades]);
      setActiveTrades([]);
      
      // Reset grid levels
      setGridLevels(prev => prev.map(g => ({ ...g, hasOrder: false })));
      
      console.log(`Stop loss hit: $${totalFloatingPnL.toFixed(2)}`);
      return true;
    }
    
    return false;
  }, [activeTrades, config.accountBalance, config.stopLossPercent]);

  // Update statistics
  const updateStatistics = useCallback(() => {
    const allTrades = [...activeTrades, ...tradeHistory];
    const closedTrades = tradeHistory;
    
    const totalTrades = allTrades.length;
    const winningTrades = closedTrades.filter(t => (t.profit || 0) > 0).length;
    const losingTrades = closedTrades.filter(t => (t.profit || 0) < 0).length;
    const totalProfit = closedTrades.reduce((sum, t) => sum + (t.profit || 0), 0);
    const floatingPnL = activeTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);
    const winRate = closedTrades.length > 0 ? (winningTrades / closedTrades.length) * 100 : 0;
    const averageEntryPrice = calculateAverageEntry(activeTrades);

    // Calculate max drawdown
    const currentEquity = totalProfit + floatingPnL;
    if (currentEquity > maxProfitRef.current) {
      maxProfitRef.current = currentEquity;
    }
    const maxDrawdown = maxProfitRef.current - currentEquity;

    setStatistics({
      totalTrades,
      winningTrades,
      losingTrades,
      totalProfit,
      averageEntryPrice,
      floatingPnL,
      maxDrawdown,
      winRate
    });
  }, [activeTrades, tradeHistory, calculateAverageEntry]);

  // Update statistics when trades change
  useEffect(() => {
    updateStatistics();
  }, [activeTrades, tradeHistory, updateStatistics]);

  // Main price update function
  const updatePrice = useCallback((newPrice) => {
    setCurrentPrice(newPrice);
    priceHistory.current.push({ price: newPrice, timestamp: Date.now() });
    
    // Keep only last 1000 price points
    if (priceHistory.current.length > 1000) {
      priceHistory.current = priceHistory.current.slice(-1000);
    }

    if (isActive) {
      // Check for individual trade exits first
      checkIndividualTradeExits(newPrice);
      
      // Update all trades with new price
      updateTrades(newPrice);
      
      // Check grid hits for new trades
      checkGridHits(newPrice);
      
      // Check global take profit and stop loss
      checkTakeProfit();
      checkStopLoss();
    }
  }, [isActive, checkIndividualTradeExits, updateTrades, checkGridHits, checkTakeProfit, checkStopLoss]);

  // Manual trade management functions
  const addManualTrade = useCallback((tradeData) => {
    if (!isActive) {
      throw new Error('Trading is not active');
    }

    const newTrade = {
      ...tradeData,
      id: tradeData.id || `manual_${Date.now()}`,
      currentPrice: currentPrice,
      pnl: calculateTradePnL(tradeData, currentPrice),
      source: 'manual',
      entryTime: tradeData.entryTime || new Date().toISOString()
    };

    setActiveTrades(prev => [...prev, newTrade]);
    console.log('Manual trade added:', newTrade);
    
    return newTrade;
  }, [isActive, currentPrice, calculateTradePnL]);

  const editManualTrade = useCallback((tradeData) => {
    setActiveTrades(prev => prev.map(trade => 
      trade.id === tradeData.id ? {
        ...trade,
        ...tradeData,
        pnl: calculateTradePnL(tradeData, currentPrice)
      } : trade
    ));
    
    console.log('Manual trade edited:', tradeData);
  }, [currentPrice, calculateTradePnL]);

  const closeManualTrade = useCallback((tradeId) => {
    const tradeToClose = activeTrades.find(t => t.id === tradeId);
    
    if (!tradeToClose) {
      throw new Error('Trade not found');
    }

    const closedTrade = {
      ...tradeToClose,
      status: 'closed',
      exitPrice: currentPrice,
      exitTime: new Date().toISOString(),
      exitReason: 'manual_close',
      profit: tradeToClose.pnl
    };

    setTradeHistory(prev => [...prev, closedTrade]);
    setActiveTrades(prev => prev.filter(t => t.id !== tradeId));
    
    console.log('Trade manually closed:', closedTrade);
    
    return closedTrade;
  }, [activeTrades, currentPrice]);

  const closeAllTrades = useCallback(() => {
    if (activeTrades.length === 0) return;

    const closedTrades = activeTrades.map(trade => ({
      ...trade,
      status: 'closed',
      exitPrice: currentPrice,
      exitTime: new Date().toISOString(),
      exitReason: 'manual_close_all',
      profit: trade.pnl
    }));

    setTradeHistory(prev => [...prev, ...closedTrades]);
    setActiveTrades([]);
    
    // Reset grid levels
    setGridLevels(prev => prev.map(g => ({ ...g, hasOrder: false })));
    
    console.log(`Manually closed ${closedTrades.length} trades`);
    
    return closedTrades;
  }, [activeTrades, currentPrice]);

  // Trading control functions
  const startTrading = useCallback(() => {
    setIsActive(true);
    console.log('Grid trading started');
  }, []);

  const stopTrading = useCallback(() => {
    setIsActive(false);
    console.log('Grid trading stopped');
  }, []);

  const resetTrading = useCallback(() => {
    setIsActive(false);
    setActiveTrades([]);
    setTradeHistory([]);
    setGridLevels(prev => prev.map(g => ({ ...g, hasOrder: false })));
    maxProfitRef.current = 0;
    priceHistory.current = [];
    tradeIdCounter.current = 1;
    console.log('Grid trading reset');
  }, []);

  const updateConfig = useCallback((newConfig) => {
    setConfig(prev => ({ ...prev, ...newConfig }));
  }, []);

  // Calculated values
  const totalActiveTrades = activeTrades.length;
  const totalFloatingPnL = activeTrades.reduce((sum, trade) => sum + (trade.pnl || 0), 0);
  const averageEntryPrice = calculateAverageEntry(activeTrades);

  return {
    // State
    config,
    isActive,
    currentPrice,
    gridLevels,
    activeTrades,
    tradeHistory,
    statistics,
    
    // Calculated values
    totalActiveTrades,
    totalFloatingPnL,
    averageEntryPrice,
    
    // Functions
    updatePrice,
    startTrading,
    stopTrading,
    resetTrading,
    updateConfig,
    
    // Manual trade functions
    addManualTrade,
    editManualTrade,
    closeManualTrade,
    closeAllTrades,
    
    // Utility functions
    calculateTradePnL
  };
};

