import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Download, 
  FileText,
  Table,
  Calendar,
  TrendingUp,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

const ExportReports = ({ 
  tradingData, 
  priceHistory, 
  simulationState,
  tradingConfig,
  selectedSymbol 
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState(null);

  // Generate CSV data for trades
  const generateTradesCSV = () => {
    const allTrades = [...(tradingData.activeTrades || []), ...(tradingData.tradeHistory || [])];
    
    if (allTrades.length === 0) {
      return 'No trades to export';
    }

    const headers = [
      'Trade ID',
      'Symbol',
      'Type',
      'Entry Price',
      'Exit Price',
      'Volume',
      'Entry Time',
      'Exit Time',
      'Profit/Loss',
      'Status'
    ];

    const csvData = allTrades.map(trade => [
      trade.id || 'N/A',
      selectedSymbol,
      trade.type || 'N/A',
      trade.entryPrice?.toFixed(5) || 'N/A',
      trade.exitPrice?.toFixed(5) || 'N/A',
      trade.volume || 'N/A',
      trade.entryTime ? new Date(trade.entryTime).toISOString() : 'N/A',
      trade.exitTime ? new Date(trade.exitTime).toISOString() : 'N/A',
      trade.profit?.toFixed(2) || '0.00',
      trade.status || 'Active'
    ]);

    return [headers, ...csvData].map(row => row.join(',')).join('\\n');
  };

  // Generate CSV data for price history
  const generatePriceHistoryCSV = () => {
    if (priceHistory.length === 0) {
      return 'No price data to export';
    }

    const headers = ['Timestamp', 'Price', 'Open', 'High', 'Low', 'Close', 'Volume'];
    
    const csvData = priceHistory.map(point => [
      new Date(point.timestamp).toISOString(),
      point.price.toFixed(5),
      point.open.toFixed(5),
      point.high.toFixed(5),
      point.low.toFixed(5),
      point.close.toFixed(5),
      point.volume
    ]);

    return [headers, ...csvData].map(row => row.join(',')).join('\\n');
  };

  // Generate performance report text
  const generatePerformanceReport = () => {
    const stats = tradingData.statistics || {};
    const totalTrades = (tradingData.activeTrades?.length || 0) + (tradingData.tradeHistory?.length || 0);
    
    return `
GRID TRADING SYSTEM - PERFORMANCE REPORT
========================================

Generated: ${new Date().toLocaleString()}
Symbol: ${selectedSymbol}
Simulation Duration: ${simulationState.statistics?.totalPriceTicks || 0} price ticks

CONFIGURATION
-------------
Grid Size: ${tradingConfig.gridSize} pips
Max Trades: ${tradingConfig.maxTrades}
Lot Size: ${tradingConfig.lotSize}
Take Profit Target: $${tradingConfig.takeProfitTarget}
Grid Levels: ${tradingConfig.gridLevels}
Starting Price: ${tradingConfig.startingPrice}

PERFORMANCE METRICS
-------------------
Total Trades: ${totalTrades}
Active Trades: ${tradingData.activeTrades?.length || 0}
Closed Trades: ${tradingData.tradeHistory?.length || 0}
Win Rate: ${stats.winRate?.toFixed(2) || 0}%
Winning Trades: ${stats.winningTrades || 0}
Losing Trades: ${stats.losingTrades || 0}

FINANCIAL SUMMARY
-----------------
Total Profit: $${stats.totalProfit?.toFixed(2) || '0.00'}
Floating P&L: $${tradingData.totalFloatingPnL?.toFixed(2) || '0.00'}
Max Drawdown: $${Math.abs(stats.maxDrawdown || 0).toFixed(2)}

RISK MANAGEMENT
---------------
Max Drawdown Limit: $${tradingConfig.riskManagement?.maxDrawdown || 500}
Stop Loss Enabled: ${tradingConfig.riskManagement?.stopLoss ? 'Yes' : 'No'}
Trailing Stop Enabled: ${tradingConfig.riskManagement?.trailingStop ? 'Yes' : 'No'}

SIMULATION STATISTICS
---------------------
Price Ticks Processed: ${simulationState.statistics?.totalPriceTicks || 0}
Trades Per Minute: ${simulationState.statistics?.tradesPerMinute?.toFixed(2) || '0.00'}
Simulation Speed: ${simulationState.speed}x

DISCLAIMER
----------
This is a simulation system for educational purposes only.
Past performance does not guarantee future results.
Trading involves risk and may not be suitable for all investors.
    `.trim();
  };

  // Download file helper
  const downloadFile = (content, filename, contentType) => {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Export handlers
  const handleExportTrades = async () => {
    setIsExporting(true);
    setExportStatus('Generating trades CSV...');
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate processing
      const csvContent = generateTradesCSV();
      const filename = `grid-trading-trades-${selectedSymbol}-${new Date().toISOString().split('T')[0]}.csv`;
      downloadFile(csvContent, filename, 'text/csv');
      setExportStatus('Trades exported successfully!');
    } catch (error) {
      setExportStatus('Error exporting trades');
    } finally {
      setIsExporting(false);
      setTimeout(() => setExportStatus(null), 3000);
    }
  };

  const handleExportPriceHistory = async () => {
    setIsExporting(true);
    setExportStatus('Generating price history CSV...');
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const csvContent = generatePriceHistoryCSV();
      const filename = `grid-trading-prices-${selectedSymbol}-${new Date().toISOString().split('T')[0]}.csv`;
      downloadFile(csvContent, filename, 'text/csv');
      setExportStatus('Price history exported successfully!');
    } catch (error) {
      setExportStatus('Error exporting price history');
    } finally {
      setIsExporting(false);
      setTimeout(() => setExportStatus(null), 3000);
    }
  };

  const handleExportReport = async () => {
    setIsExporting(true);
    setExportStatus('Generating performance report...');
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      const reportContent = generatePerformanceReport();
      const filename = `grid-trading-report-${selectedSymbol}-${new Date().toISOString().split('T')[0]}.txt`;
      downloadFile(reportContent, filename, 'text/plain');
      setExportStatus('Performance report exported successfully!');
    } catch (error) {
      setExportStatus('Error generating report');
    } finally {
      setIsExporting(false);
      setTimeout(() => setExportStatus(null), 3000);
    }
  };

  const exportOptions = [
    {
      title: 'Trading Report',
      description: 'Complete performance analysis and statistics',
      icon: FileText,
      handler: handleExportReport,
      format: 'TXT',
      color: 'bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800',
      iconColor: 'text-blue-600'
    },
    {
      title: 'Trade History',
      description: 'All executed trades with entry/exit details',
      icon: TrendingUp,
      handler: handleExportTrades,
      format: 'CSV',
      color: 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800',
      iconColor: 'text-green-600'
    },
    {
      title: 'Price Data',
      description: 'Historical price movements and OHLCV data',
      icon: Table,
      handler: handleExportPriceHistory,
      format: 'CSV',
      color: 'bg-purple-50 dark:bg-purple-950 border-purple-200 dark:border-purple-800',
      iconColor: 'text-purple-600'
    }
  ];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="w-5 h-5" />
          Export Reports
        </CardTitle>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Download trading data and performance reports for analysis
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Status Message */}
        {exportStatus && (
          <div className={`flex items-center gap-2 p-3 rounded-lg ${
            exportStatus.includes('Error') 
              ? 'bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800' 
              : exportStatus.includes('successfully')
              ? 'bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800'
              : 'bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800'
          }`}>
            {exportStatus.includes('Error') ? (
              <AlertCircle className="w-4 h-4 text-red-600" />
            ) : exportStatus.includes('successfully') ? (
              <CheckCircle className="w-4 h-4 text-green-600" />
            ) : (
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            )}
            <span className={`text-sm font-medium ${
              exportStatus.includes('Error') 
                ? 'text-red-800 dark:text-red-200'
                : exportStatus.includes('successfully')
                ? 'text-green-800 dark:text-green-200'
                : 'text-blue-800 dark:text-blue-200'
            }`}>
              {exportStatus}
            </span>
          </div>
        )}

        {/* Export Options */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {exportOptions.map((option, index) => {
            const Icon = option.icon;
            return (
              <Card key={index} className={`${option.color} hover:shadow-md transition-shadow`}>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Icon className={`w-6 h-6 ${option.iconColor}`} />
                      <Badge variant="secondary" className="text-xs">
                        {option.format}
                      </Badge>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-lg">{option.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {option.description}
                      </p>
                    </div>
                    
                    <Button
                      onClick={option.handler}
                      disabled={isExporting}
                      className="w-full"
                      size="sm"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export {option.format}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Data Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center justify-center gap-1 mb-1">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium">Trades</span>
            </div>
            <div className="text-lg font-bold text-blue-600">
              {(tradingData.activeTrades?.length || 0) + (tradingData.tradeHistory?.length || 0)}
            </div>
          </div>
          
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Table className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium">Price Points</span>
            </div>
            <div className="text-lg font-bold text-green-600">
              {priceHistory.length}
            </div>
          </div>
          
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Calendar className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium">Symbol</span>
            </div>
            <div className="text-lg font-bold text-purple-600">
              {selectedSymbol}
            </div>
          </div>
          
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center justify-center gap-1 mb-1">
              <FileText className="w-4 h-4 text-orange-600" />
              <span className="text-sm font-medium">Status</span>
            </div>
            <div className="text-sm font-bold text-orange-600">
              {simulationState.isActive ? 'Active' : 'Stopped'}
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <h4 className="font-medium mb-2">Export Instructions:</h4>
          <ul className="text-sm space-y-1 text-gray-600 dark:text-gray-400">
            <li>• <strong>Trading Report:</strong> Comprehensive analysis with all performance metrics</li>
            <li>• <strong>Trade History:</strong> Detailed CSV with all trade entries and exits</li>
            <li>• <strong>Price Data:</strong> Historical price movements for further analysis</li>
            <li>• Files are automatically named with symbol and date for easy organization</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExportReports;

