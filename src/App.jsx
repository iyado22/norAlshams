import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  X
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

function App() {
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
  const [notifications, setNotifications] = useState([]);

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
  };

  // Add notification
  const addNotification = (message, type = 'info') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type, timestamp: new Date() }]);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  };

  // Remove notification
  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // Handle manual trade operations
  const handleAddManualTrade = async (tradeData) => {
    try {
      const newTrade = addManualTrade(tradeData);
      addNotification(`Manual ${tradeData.type} trade added at ${tradeData.entryPrice}`, 'success');
      return newTrade;
    } catch (error) {
      addNotification(`Failed to add trade: ${error.message}`, 'error');
      throw error;
    }
  };

  const handleEditManualTrade = async (tradeData) => {
    try {
      editManualTrade(tradeData);
      addNotification(`Trade ${tradeData.id} updated successfully`, 'success');
      setEditingTrade(null);
    } catch (error) {
      addNotification(`Failed to edit trade: ${error.message}`, 'error');
      throw error;
    }
  };

  const handleCloseManualTrade = async (trade) => {
    try {
      const closedTrade = closeManualTrade(trade.id);
      const profit = closedTrade.profit >= 0 ? '+' : '';
      addNotification(
        `Trade closed: ${profit}$${closedTrade.profit.toFixed(2)}`, 
        closedTrade.profit >= 0 ? 'success' : 'error'
      );
    } catch (error) {
      addNotification(`Failed to close trade: ${error.message}`, 'error');
    }
  };

  const handleEditTrade = (trade) => {
    setEditingTrade(trade);
    setActiveTab('manual');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Title */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-8 h-8 text-blue-600" />
                <div>
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                    Grid Trading System
                  </h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Advanced Trading Dashboard with Manual Trade Support
                  </p>
                </div>
              </div>
            </div>

            {/* Currency Pairs */}
            <div className="flex items-center space-x-2">
              {currencyPairs.map(pair => (
                <Button
                  key={pair.symbol}
                  variant={selectedSymbol === pair.symbol ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleSymbolChange(pair.symbol)}
                  className="relative"
                >
                  <div className={`w-2 h-2 rounded-full ${pair.color} mr-2`} />
                  {pair.symbol}
                </Button>
              ))}
            </div>

            {/* Dark Mode Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleDarkMode}
              className="ml-4"
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </header>

      {/* Notifications */}
      {notifications.length > 0 && (
        <div className="fixed top-20 right-4 z-50 space-y-2">
          {notifications.map(notification => (
            <div
              key={notification.id}
              className={`flex items-center gap-2 p-3 rounded-lg shadow-lg border max-w-sm ${
                notification.type === 'success' 
                  ? 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900 dark:border-green-700 dark:text-green-200'
                  : notification.type === 'error'
                  ? 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900 dark:border-red-700 dark:text-red-200'
                  : 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900 dark:border-blue-700 dark:text-blue-200'
              }`}
            >
              {notification.type === 'success' && <CheckCircle className="w-4 h-4" />}
              {notification.type === 'error' && <AlertTriangle className="w-4 h-4" />}
              <span className="text-sm flex-1">{notification.message}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeNotification(notification.id)}
                className="h-6 w-6 p-0"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Price Feed */}
        <div className="mb-6">
          <PriceFeed
            symbol={selectedSymbol}
            currentPrice={currentPrice}
            isConnected={isConnected}
            lastUpdate={lastUpdate}
            priceHistory={priceHistory}
            totalFloatingPnL={totalFloatingPnL}
            activeTrades={totalActiveTrades}
          />
        </div>

        {/* Trading Alerts */}
        <div className="mb-6">
          <TradingAlerts
            isActive={isActive}
            activeTrades={activeTrades}
            config={config}
            statistics={statistics}
            currentPrice={currentPrice}
          />
        </div>

        {/* Main Trading Interface */}
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

          {/* Trading Dashboard */}
          <TabsContent value="dashboard" className="space-y-6">
            <GridTradingEngine
              currentPrice={currentPrice}
              symbol={selectedSymbol}
              onTradeUpdate={(trade) => console.log('Trade update:', trade)}
            />
          </TabsContent>

          {/* Manual Trading */}
          <TabsContent value="manual" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Manual Trade Form */}
              <ManualTradeForm
                currentPrice={currentPrice}
                symbol={selectedSymbol}
                onAddTrade={handleAddManualTrade}
                onEditTrade={handleEditManualTrade}
                editingTrade={editingTrade}
                isActive={isActive}
              />

              {/* Quick Trade Summary */}
              <Card>
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
              </Card>
            </div>
          </TabsContent>

          {/* Trade List */}
          <TabsContent value="trades" className="space-y-6">
            <TradeTable
              activeTrades={activeTrades}
              tradeHistory={tradeHistory}
              currentPrice={currentPrice}
              symbol={selectedSymbol}
              onEditTrade={handleEditTrade}
              onCloseTrade={handleCloseManualTrade}
              showClosed={true}
            />
          </TabsContent>

          {/* Simulation Controls */}
          <TabsContent value="simulation" className="space-y-6">
            <SimulationControls
              isActive={isActive}
              onStart={startTrading}
              onStop={stopTrading}
              onReset={resetTrading}
              statistics={statistics}
              activeTrades={activeTrades}
              priceHistory={priceHistory}
            />
          </TabsContent>

          {/* Configuration */}
          <TabsContent value="configuration" className="space-y-6">
            <TradingConfiguration
              config={config}
              onConfigUpdate={updateConfig}
              currentPrice={currentPrice}
              symbol={selectedSymbol}
            />
          </TabsContent>

          {/* Export Reports */}
          <TabsContent value="export" className="space-y-6">
            <ExportReports
              activeTrades={activeTrades}
              tradeHistory={tradeHistory}
              priceHistory={priceHistory}
              statistics={statistics}
              config={config}
              symbol={selectedSymbol}
            />
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-12">
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
      </footer>
    </div>
  );
}

export default App;

