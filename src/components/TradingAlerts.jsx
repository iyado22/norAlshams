import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  AlertTriangle, 
  AlertCircle,
  Info,
  CheckCircle,
  X,
  TrendingDown,
  DollarSign,
  Zap,
  Shield
} from 'lucide-react';

const TradingAlerts = ({ 
  isActive = false,
  activeTrades = [],
  config = {},
  statistics = {},
  currentPrice = 0,
  onDismissAlert 
}) => {
  const [alerts, setAlerts] = useState([]);
  const [dismissedAlerts, setDismissedAlerts] = useState(new Set());

  // Check for various alert conditions
  useEffect(() => {
    const newAlerts = [];
    const totalFloatingPnL = activeTrades.reduce((sum, trade) => sum + (trade.pnl || 0), 0);

    // Max trades warning
    if (activeTrades.length >= (config.maxTrades || 20) * 0.8) {
      newAlerts.push({
        id: 'max-trades-warning',
        type: activeTrades.length >= (config.maxTrades || 20) ? 'error' : 'warning',
        title: activeTrades.length >= (config.maxTrades || 20) ? 'Maximum Trades Reached' : 'Approaching Max Trades',
        message: `${activeTrades.length}/${config.maxTrades || 20} trades active. ${
          activeTrades.length >= (config.maxTrades || 20)
            ? 'No new trades will be opened.' 
            : 'Consider monitoring closely.'
        }`,
        icon: Zap,
        priority: 'high'
      });
    }

    // Drawdown warning
    const maxDrawdown = statistics.maxDrawdown || 0;
    const drawdownLimit = (config.accountBalance || 10000) * 0.1; // 10% drawdown warning
    
    if (maxDrawdown > drawdownLimit) {
      newAlerts.push({
        id: 'drawdown-warning',
        type: maxDrawdown > drawdownLimit * 1.5 ? 'error' : 'warning',
        title: 'High Drawdown Alert',
        message: `Current drawdown: $${maxDrawdown.toFixed(2)}. Consider reducing risk or stopping trading.`,
        icon: TrendingDown,
        priority: 'high'
      });
    }

    // Floating P&L warning
    if (totalFloatingPnL < -(config.accountBalance || 10000) * 0.05) {
      newAlerts.push({
        id: 'floating-pnl-warning',
        type: 'warning',
        title: 'Negative Floating P&L',
        message: `Current floating loss: $${Math.abs(totalFloatingPnL).toFixed(2)}. Monitor positions closely.`,
        icon: DollarSign,
        priority: 'medium'
      });
    }

    // Risk management disabled warning
    if (!config.stopLoss && !config.trailingStop) {
      newAlerts.push({
        id: 'risk-management-disabled',
        type: 'info',
        title: 'Risk Management Disabled',
        message: 'No stop loss or trailing stop is enabled. Consider enabling risk management features for better capital protection.',
        icon: Shield,
        priority: 'low'
      });
    }

    // Trading inactive warning
    if (!isActive && activeTrades.length > 0) {
      newAlerts.push({
        id: 'trading-inactive',
        type: 'info',
        title: 'Trading Paused',
        message: `${activeTrades.length} active trades but trading is paused. Positions will not be managed automatically.`,
        icon: Info,
        priority: 'medium'
      });
    }

    // Filter out dismissed alerts
    const filteredAlerts = newAlerts.filter(alert => !dismissedAlerts.has(alert.id));
    setAlerts(filteredAlerts);

  }, [activeTrades, config, statistics, isActive, dismissedAlerts]);

  // Dismiss alert
  const dismissAlert = (alertId) => {
    setDismissedAlerts(prev => new Set([...prev, alertId]));
    if (onDismissAlert) {
      onDismissAlert(alertId);
    }
  };

  // Get alert style classes
  const getAlertClasses = (type) => {
    switch (type) {
      case 'error':
        return 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200';
      case 'warning':
        return 'bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200';
      case 'info':
        return 'bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200';
      case 'success':
        return 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200';
      default:
        return 'bg-gray-50 dark:bg-gray-950 border-gray-200 dark:border-gray-800 text-gray-800 dark:text-gray-200';
    }
  };

  // Get priority badge
  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'high':
        return <Badge variant="destructive" className="text-xs">High</Badge>;
      case 'medium':
        return <Badge variant="secondary" className="text-xs">Medium</Badge>;
      case 'low':
        return <Badge variant="outline" className="text-xs">Low</Badge>;
      default:
        return null;
    }
  };

  if (alerts.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      {alerts.map(alert => {
        const IconComponent = alert.icon;
        
        return (
          <Card key={alert.id} className={`border ${getAlertClasses(alert.type)}`}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <IconComponent className="w-5 h-5 mt-0.5 flex-shrink-0" />
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-sm">{alert.title}</h4>
                    {getPriorityBadge(alert.priority)}
                  </div>
                  <p className="text-sm opacity-90">{alert.message}</p>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => dismissAlert(alert.id)}
                  className="h-6 w-6 p-0 opacity-70 hover:opacity-100"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default TradingAlerts;

