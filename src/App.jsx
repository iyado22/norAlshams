import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { ToastProvider, useToast } from '@/components/ui/toast';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import SessionProvider from '@/components/SessionProvider';
import { SessionStatus } from '@/components/SessionManager';
import { AnimatedCard } from '@/components/enhanced/AnimatedCard';
import { 
  Moon, 
  Sun, 
  TrendingUp, 
  Activity,
  Settings,
  BarChart3,
  Download,
  Plus,
  List,
  AlertTriangle,
  CheckCircle,
  X,
  Wifi,
  WifiOff
} from 'lucide-react';

// Import components
import PriceFeed from './components/PriceFeed';
import GridTradingEngine from './components/GridTradingEngine';
import TradingConfiguration from './components/TradingConfiguration';
import SimulationControls from './components/SimulationControls';
import ExportReports from './components/ExportReports';
import TradingAlerts from './components/TradingAlerts';
import ManualTradeForm from './components/ManualTradeForm';
import TradeTable from './components/TradeTable';

// Import hooks
import { usePriceFeed } from './hooks/usePriceFeed';
import { useGridTrading } from './hooks/useGridTrading';

// Enhanced App component with performance optimizations
const AppContent = () => {
  const { toast } = useToast();
  
  // Theme state
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('darkMode') === 'true' || 
             window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  // Trading state
  const [selectedSymbol, setSelectedSymbol] = useState('EUR/USD');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [editingTrade, setEditingTrade] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState('connected');

  // Price feed hook
  const { 
    currentPrice, 
    priceHistory, 
    isConnected, 
    lastUpdate,
    switchSymbol,
    startFeed,
    stopFeed 
  } = usePriceFeed(selectedSymbol);

  // Grid trading hook with manual trade support
  const {
    config,
    isActive,
    gridLevels,
    activeTrades,
    tradeHistory,
    statistics,
    totalActiveTrades,
    totalFloatingPnL,
    averageEntryPrice,
    updatePrice,
    startTrading,
    stopTrading,
    resetTrading,
    updateConfig,
    addManualTrade,
    editManualTrade,
    closeManualTrade,
    closeAllTrades
  } = useGridTrading({
    symbol: selectedSymbol,
    startingPrice: currentPrice || 1.2000
  });

  // Update trading engine with new prices
  useEffect(() => {
    if (currentPrice) {
      updatePrice(currentPrice);
    }
  }, [currentPrice, updatePrice]);

  // Apply dark mode
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', isDarkMode.toString());
  }, [isDarkMode]);

  // Initialize app
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Simulate initialization delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        setIsLoading(false);
        toast.success('Trading system initialized successfully');
      } catch (error) {
        console.error('Failed to initialize app:', error);
        toast.error('Failed to initialize trading system');
        setIsLoading(false);
      }
    };

    initializeApp();
  }, [toast]);

  // Monitor connection status
  useEffect(() => {
    const handleOnline = () => {
      setConnectionStatus('connected');
      toast.success('Connection restored');
    };
    
    const handleOffline = () => {
      setConnectionStatus('disconnected');
      toast.warning('Connection lost - working offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [toast]);
  // Currency pairs
  const currencyPairs = [
    { symbol: 'EUR/USD', color: 'bg-green-500' },
    { symbol: 'GBP/USD', color: 'bg-blue-500' },
    { symbol: 'USD/JPY', color: 'bg-orange-500' },
    { symbol: 'AUD/USD', color: 'bg-purple-500' }
  ];

  // Handle symbol change
  const handleSymbolChange = (symbol) => {
    setSelectedSymbol(symbol);
    switchSymbol(symbol);
  };

  // Toggle dark mode
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    toast.info(`Switched to ${!isDarkMode ? 'dark' : 'light'} mode`);
  };

  // Handle manual trade operations
  const handleAddManualTrade = async (tradeData) => {
    try {
      const newTrade = addManualTrade(tradeData);
      toast.success(`Manual ${tradeData.type} trade added at ${tradeData.entryPrice}`);
      return newTrade;
    } catch (error) {
      toast.error(`Failed to add trade: ${error.message}`);
      throw error;
    }
  };

  const handleEditManualTrade = async (tradeData) => {
    try {
      editManualTrade(tradeData);
      toast.success(`Trade ${tradeData.id} updated successfully`);
      setEditingTrade(null);
    } catch (error) {
      toast.error(`Failed to edit trade: ${error.message}`);
      throw error;
    }
  };

  const handleCloseManualTrade = async (trade) => {
    try {
      const closedTrade = closeManualTrade(trade.id);
      const profit = closedTrade.profit >= 0 ? '+' : '';
      toast.success(
        `Trade closed: ${profit}$${closedTrade.profit.toFixed(2)}`,
        closedTrade.profit >= 0 ? 'success' : 'error'
      );
    } catch (error) {
      toast.error(`Failed to close trade: ${error.message}`);
    }
  };

  const handleEditTrade = (trade) => {
    setEditingTrade(trade);
    setActiveTab('manual');
  };

  // Show loading screen
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <LoadingSpinner size="xl" />
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Initializing Trading System
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Setting up your trading environment...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200"
    >
      {/* Header */}
      <motion.header 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 backdrop-blur-sm bg-white/95 dark:bg-gray-800/95"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Title */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <TrendingUp className="w-8 h-8 text-blue-600" />
                </motion.div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                    Grid Trading System
                  </h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Advanced Trading Dashboard with Manual Trade Support
                  </p>
                </div>
              </div>
              
              {/* Connection Status */}
              <div className="flex items-center gap-2">
                {connectionStatus === 'connected' ? (
                  <Wifi className="w-4 h-4 text-green-600" />
                ) : (
                  <WifiOff className="w-4 h-4 text-red-600" />
                )}
                <span className={`text-xs ${
                  connectionStatus === 'connected' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {connectionStatus === 'connected' ? 'Online' : 'Offline'}
              
              {/* Session Status */}
              <SessionStatus className="ml-4" />
                </span>
              </div>
            </div>

            {/* Currency Pairs */}
            <div className="flex items-center space-x-2">
              {currencyPairs.map(pair => (
                <motion.div
                  key={pair.symbol}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant={selectedSymbol === pair.symbol ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleSymbolChange(pair.symbol)}
                    className="relative"
                  >
                    <div className={`w-2 h-2 rounded-full ${pair.color} mr-2`} />
                    {pair.symbol}
                  </Button>
                </motion.div>
              ))}
            </div>

            {/* Dark Mode Toggle */}
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleDarkMode}
                className="ml-4"
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={isDarkMode ? 'sun' : 'moon'}
                    initial={{ rotate: -180, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 180, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                  </motion.div>
                </AnimatePresence>
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <motion.main 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6"
      >
        {/* Price Feed */}
        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mb-6"
        >
          <PriceFeed
            symbol={selectedSymbol}
            currentPrice={currentPrice}
            isConnected={isConnected}
            lastUpdate={lastUpdate}
            priceHistory={priceHistory}
            totalFloatingPnL={totalFloatingPnL}
            activeTrades={totalActiveTrades}
          />
        </motion.div>

        {/* Trading Alerts */}
        <motion.div 
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mb-6"
        >
          <TradingAlerts
            isActive={isActive}
            activeTrades={activeTrades}
            config={config}
            statistics={statistics}
            currentPrice={currentPrice}
          />
        </motion.div>

        {/* Main Trading Interface */}
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Trading Dashboard
            </TabsTrigger>
            <TabsTrigger value="manual" className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Manual Trading
            </TabsTrigger>
            <TabsTrigger value="trades" className="flex items-center gap-2">
              <List className="w-4 h-4" />
              Trade List
            </TabsTrigger>
            <TabsTrigger value="simulation" className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Simulation Controls
            </TabsTrigger>
            <TabsTrigger value="configuration" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Configuration
            </TabsTrigger>
            <TabsTrigger value="export" className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export Reports
            </TabsTrigger>
            </TabsList>

            <AnimatePresence mode="wait">
              {/* Trading Dashboard */}
              <TabsContent value="dashboard" className="space-y-6">
                <motion.div
                  key="dashboard"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <GridTradingEngine
                    currentPrice={currentPrice}
                    symbol={selectedSymbol}
                    onTradeUpdate={(trade) => console.log('Trade update:', trade)}
                  />
                </motion.div>
              </TabsContent>

              {/* Manual Trading */}
              <TabsContent value="manual" className="space-y-6">
                <motion.div
                  key="manual"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="grid grid-cols-1 lg:grid-cols-2 gap-6"
                >
                  {/* Manual Trade Form */}
                  <AnimatedCard delay={0.1}>
                    <ManualTradeForm
                      currentPrice={currentPrice}
                      symbol={selectedSymbol}
                      onAddTrade={handleAddManualTrade}
                      onEditTrade={handleEditManualTrade}
                      editingTrade={editingTrade}
                      isActive={isActive}
                    />
                  </AnimatedCard>

                  {/* Quick Trade Summary */}
                  <AnimatedCard delay={0.2}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    Manual Trading Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {activeTrades.filter(t => t.source === 'manual').length}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Manual Trades
                      </div>
                    </div>
                    
                    <div className="text-center p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        ${activeTrades
                          .filter(t => t.source === 'manual')
                          .reduce((sum, t) => sum + (t.pnl || 0), 0)
                          .toFixed(2)}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Manual P&L
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium">Recent Manual Trades</h4>
                    {activeTrades
                      .filter(t => t.source === 'manual')
                      .slice(-3)
                      .map(trade => (
                        <div key={trade.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                          <div className="flex items-center gap-2">
                            {trade.type === 'buy' ? (
                              <TrendingUp className="w-4 h-4 text-green-600" />
                            ) : (
                              <TrendingUp className="w-4 h-4 text-red-600 rotate-180" />
                            )}
                            <span className="text-sm font-mono">
                              {trade.entryPrice?.toFixed(5)}
                            </span>
                          </div>
                          <div className={`text-sm font-medium ${
                            (trade.pnl || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            ${(trade.pnl || 0).toFixed(2)}
                          </div>
                        </div>
                      ))}
                    
                    {activeTrades.filter(t => t.source === 'manual').length === 0 && (
                      <p className="text-sm text-gray-500 text-center py-4">
                        No manual trades active
                      </p>
                    )}
                  </div>

                  {activeTrades.filter(t => t.source === 'manual').length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const manualTrades = activeTrades.filter(t => t.source === 'manual');
                        manualTrades.forEach(trade => closeManualTrade(trade.id));
                        addNotification(`Closed ${manualTrades.length} manual trades`, 'info');
                      }}
                      className="w-full"
                    >
                      Close All Manual Trades
                    </Button>
                  )}
                </CardContent>
                  </AnimatedCard>
                </motion.div>
              </TabsContent>

              {/* Trade List */}
              <TabsContent value="trades" className="space-y-6">
                <motion.div
                  key="trades"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <TradeTable
                    activeTrades={activeTrades}
                    tradeHistory={tradeHistory}
                    currentPrice={currentPrice}
                    symbol={selectedSymbol}
                    onEditTrade={handleEditTrade}
                    onCloseTrade={handleCloseManualTrade}
                    showClosed={true}
                  />
                </motion.div>
              </TabsContent>

              {/* Simulation Controls */}
              <TabsContent value="simulation" className="space-y-6">
                <motion.div
                  key="simulation"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <SimulationControls
                    isActive={isActive}
                    onStart={startTrading}
                    onStop={stopTrading}
                    onReset={resetTrading}
                    statistics={statistics}
                    activeTrades={activeTrades}
                    priceHistory={priceHistory}
                  />
                </motion.div>
              </TabsContent>

              {/* Configuration */}
              <TabsContent value="configuration" className="space-y-6">
                <motion.div
                  key="configuration"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <TradingConfiguration
                    config={config}
                    onConfigUpdate={updateConfig}
                    currentPrice={currentPrice}
                    symbol={selectedSymbol}
                  />
                </motion.div>
              </TabsContent>

              {/* Export Reports */}
              <TabsContent value="export" className="space-y-6">
                <motion.div
                  key="export"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <ExportReports
                    activeTrades={activeTrades}
                    tradeHistory={tradeHistory}
                    priceHistory={priceHistory}
                    statistics={statistics}
                    config={config}
                    symbol={selectedSymbol}
                  />
                </motion.div>
              </TabsContent>
            </AnimatePresence>
          </Tabs>
        </motion.div>
      </motion.main>

      {/* Footer */}
      <motion.footer 
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-12"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-sm text-gray-500 dark:text-gray-400">
            <p className="mb-2">
              <strong>Grid Trading System</strong> - Advanced Automated Trading Dashboard with Manual Trade Support
            </p>
            <p className="flex items-center justify-center gap-1">
              <AlertTriangle className="w-4 h-4" />
              This is a simulation system for educational purposes only. Not financial advice.
            </p>
          </div>
        </div>
      </motion.footer>
    </motion.div>
  );
};

// Main App component with providers
function App() {
  return (
    <ErrorBoundary>
      <SessionProvider>
        <ToastProvider>
          <AppContent />
        </ToastProvider>
      </SessionProvider>
    </ErrorBoundary>
  );
}

export default App;

