import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp,
  TrendingDown,
  Edit,
  X,
  Target,
  Shield,
  Clock,
  DollarSign,
  Filter,
  ArrowUpDown,
  MoreHorizontal
} from 'lucide-react';

const TradeTable = ({ 
  activeTrades = [],
  tradeHistory = [],
  currentPrice,
  symbol = 'EUR/USD',
  onEditTrade,
  onCloseTrade,
  showClosed = false,
  className = ''
}) => {
  const [sortField, setSortField] = useState('entryTime');
  const [sortDirection, setSortDirection] = useState('desc');
  const [filterType, setFilterType] = useState('all'); // all, buy, sell, manual, grid
  const [selectedTrade, setSelectedTrade] = useState(null);

  // Combine and process all trades
  const allTrades = useMemo(() => {
    const active = activeTrades.map(trade => ({ ...trade, status: 'active' }));
    const closed = showClosed ? tradeHistory.map(trade => ({ ...trade, status: 'closed' })) : [];
    return [...active, ...closed];
  }, [activeTrades, tradeHistory, showClosed]);

  // Calculate P&L for active trades
  const calculatePnL = (trade) => {
    if (trade.status === 'closed') {
      return trade.profit || 0;
    }

    if (!currentPrice) return 0;

    const priceDiff = trade.type === 'buy' 
      ? currentPrice - trade.entryPrice 
      : trade.entryPrice - currentPrice;
    
    // Simplified P&L calculation
    const pipValue = symbol.includes('JPY') ? 0.01 : 0.0001;
    const pips = priceDiff / pipValue;
    const dollarPerPip = trade.lotSize * 10;
    
    return pips * dollarPerPip;
  };

  // Filter trades
  const filteredTrades = useMemo(() => {
    return allTrades.filter(trade => {
      if (filterType === 'all') return true;
      if (filterType === 'buy') return trade.type === 'buy';
      if (filterType === 'sell') return trade.type === 'sell';
      if (filterType === 'manual') return trade.source === 'manual';
      if (filterType === 'grid') return trade.source !== 'manual';
      return true;
    });
  }, [allTrades, filterType]);

  // Sort trades
  const sortedTrades = useMemo(() => {
    return [...filteredTrades].sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      // Handle special cases
      if (sortField === 'pnl') {
        aValue = calculatePnL(a);
        bValue = calculatePnL(b);
      } else if (sortField === 'entryTime') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }

      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  }, [filteredTrades, sortField, sortDirection]);

  // Handle sort
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return `$${amount.toFixed(2)}`;
  };

  // Format time
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  // Get trade status badge
  const getStatusBadge = (trade) => {
    const pnl = calculatePnL(trade);
    
    if (trade.status === 'closed') {
      return (
        <Badge variant={pnl >= 0 ? 'default' : 'destructive'} className="text-xs">
          {pnl >= 0 ? 'Profit' : 'Loss'}
        </Badge>
      );
    }

    return (
      <Badge variant="secondary" className="text-xs">
        Active
      </Badge>
    );
  };

  // Get trade source badge
  const getSourceBadge = (trade) => {
    if (trade.source === 'manual') {
      return (
        <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
          Manual
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
        Grid
      </Badge>
    );
  };

  // Filter options
  const filterOptions = [
    { value: 'all', label: 'All Trades', count: allTrades.length },
    { value: 'buy', label: 'Buy Orders', count: allTrades.filter(t => t.type === 'buy').length },
    { value: 'sell', label: 'Sell Orders', count: allTrades.filter(t => t.type === 'sell').length },
    { value: 'manual', label: 'Manual', count: allTrades.filter(t => t.source === 'manual').length },
    { value: 'grid', label: 'Grid', count: allTrades.filter(t => t.source !== 'manual').length }
  ];

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Trade List
            <Badge variant="secondary" className="ml-2">
              {filteredTrades.length}
            </Badge>
          </CardTitle>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowClosed(!showClosed)}
            >
              <Clock className="w-4 h-4 mr-2" />
              {showClosed ? 'Hide Closed' : 'Show Closed'}
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 flex-wrap">
          {filterOptions.map(option => (
            <Button
              key={option.value}
              variant={filterType === option.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterType(option.value)}
              className="h-7 text-xs"
            >
              {option.label}
              <Badge variant="secondary" className="ml-1 text-xs">
                {option.count}
              </Badge>
            </Button>
          ))}
        </div>
      </CardHeader>

      <CardContent>
        {sortedTrades.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <DollarSign className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">No trades found</p>
            <p className="text-sm">
              {filterType === 'all' 
                ? 'Start trading or add manual trades to see them here'
                : `No ${filterType} trades found`
              }
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort('type')}
                      className="h-6 px-1 font-medium"
                    >
                      Type
                      <ArrowUpDown className="w-3 h-3 ml-1" />
                    </Button>
                  </th>
                  <th className="text-left p-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort('entryPrice')}
                      className="h-6 px-1 font-medium"
                    >
                      Entry Price
                      <ArrowUpDown className="w-3 h-3 ml-1" />
                    </Button>
                  </th>
                  <th className="text-left p-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort('lotSize')}
                      className="h-6 px-1 font-medium"
                    >
                      Volume
                      <ArrowUpDown className="w-3 h-3 ml-1" />
                    </Button>
                  </th>
                  <th className="text-left p-2">SL/TP</th>
                  <th className="text-left p-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort('pnl')}
                      className="h-6 px-1 font-medium"
                    >
                      P&L
                      <ArrowUpDown className="w-3 h-3 ml-1" />
                    </Button>
                  </th>
                  <th className="text-left p-2">Status</th>
                  <th className="text-left p-2">Source</th>
                  <th className="text-left p-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort('entryTime')}
                      className="h-6 px-1 font-medium"
                    >
                      Time
                      <ArrowUpDown className="w-3 h-3 ml-1" />
                    </Button>
                  </th>
                  <th className="text-right p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedTrades.map((trade, index) => {
                  const pnl = calculatePnL(trade);
                  const isProfitable = pnl >= 0;
                  
                  return (
                    <tr 
                      key={trade.id || index} 
                      className="border-b hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      {/* Trade Type */}
                      <td className="p-2">
                        <div className="flex items-center gap-2">
                          {trade.type === 'buy' ? (
                            <TrendingUp className="w-4 h-4 text-green-600" />
                          ) : (
                            <TrendingDown className="w-4 h-4 text-red-600" />
                          )}
                          <span className={`font-medium ${
                            trade.type === 'buy' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {trade.type.toUpperCase()}
                          </span>
                        </div>
                      </td>

                      {/* Entry Price */}
                      <td className="p-2">
                        <span className="font-mono">
                          {trade.entryPrice?.toFixed(5)}
                        </span>
                      </td>

                      {/* Volume */}
                      <td className="p-2">
                        <span className="font-mono">
                          {trade.lotSize}
                        </span>
                      </td>

                      {/* SL/TP */}
                      <td className="p-2">
                        <div className="space-y-1">
                          {trade.stopLoss && (
                            <div className="flex items-center gap-1">
                              <Shield className="w-3 h-3 text-red-500" />
                              <span className="text-xs font-mono">
                                {trade.stopLoss.toFixed(5)}
                              </span>
                            </div>
                          )}
                          {trade.takeProfit && (
                            <div className="flex items-center gap-1">
                              <Target className="w-3 h-3 text-green-500" />
                              <span className="text-xs font-mono">
                                {trade.takeProfit.toFixed(5)}
                              </span>
                            </div>
                          )}
                          {!trade.stopLoss && !trade.takeProfit && (
                            <span className="text-xs text-gray-400">-</span>
                          )}
                        </div>
                      </td>

                      {/* P&L */}
                      <td className="p-2">
                        <span className={`font-mono font-medium ${
                          isProfitable ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {formatCurrency(pnl)}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="p-2">
                        {getStatusBadge(trade)}
                      </td>

                      {/* Source */}
                      <td className="p-2">
                        {getSourceBadge(trade)}
                      </td>

                      {/* Time */}
                      <td className="p-2">
                        <span className="text-xs text-gray-500">
                          {formatTime(trade.entryTime)}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="p-2 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {trade.status === 'active' && trade.source === 'manual' && onEditTrade && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onEditTrade(trade)}
                              className="h-6 w-6 p-0"
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                          )}
                          
                          {trade.status === 'active' && onCloseTrade && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onCloseTrade(trade)}
                              className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          )}
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedTrade(selectedTrade === trade.id ? null : trade.id)}
                            className="h-6 w-6 p-0"
                          >
                            <MoreHorizontal className="w-3 h-3" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Summary */}
        {sortedTrades.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <div className="font-medium text-gray-600 dark:text-gray-400">Total Trades</div>
                <div className="text-lg font-bold">{sortedTrades.length}</div>
              </div>
              
              <div className="text-center">
                <div className="font-medium text-gray-600 dark:text-gray-400">Active</div>
                <div className="text-lg font-bold text-blue-600">
                  {sortedTrades.filter(t => t.status === 'active').length}
                </div>
              </div>
              
              <div className="text-center">
                <div className="font-medium text-gray-600 dark:text-gray-400">Profitable</div>
                <div className="text-lg font-bold text-green-600">
                  {sortedTrades.filter(t => calculatePnL(t) >= 0).length}
                </div>
              </div>
              
              <div className="text-center">
                <div className="font-medium text-gray-600 dark:text-gray-400">Total P&L</div>
                <div className={`text-lg font-bold ${
                  sortedTrades.reduce((sum, t) => sum + calculatePnL(t), 0) >= 0 
                    ? 'text-green-600' 
                    : 'text-red-600'
                }`}>
                  {formatCurrency(sortedTrades.reduce((sum, t) => sum + calculatePnL(t), 0))}
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TradeTable;

