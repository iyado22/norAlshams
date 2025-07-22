import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Plus,
  X,
  RotateCcw,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  DollarSign,
  Target,
  Shield
} from 'lucide-react';

const ManualTradeForm = ({ 
  currentPrice = 1.2000,
  symbol = 'EUR/USD',
  onAddTrade,
  onEditTrade,
  editingTrade = null,
  isActive = false,
  className = ''
}) => {
  // Form state
  const [formData, setFormData] = useState({
    type: 'buy',
    entryPrice: '',
    volume: '0.01',
    stopLoss: '',
    takeProfit: '',
    status: 'active'
  });

  // UI state
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Preset lot sizes for quick selection
  const lotSizePresets = [0.01, 0.05, 0.1, 0.2, 0.5, 1.0];

  // Risk calculation templates
  const riskTemplates = [
    { name: 'Conservative', riskPercent: 1, description: '1% account risk' },
    { name: 'Moderate', riskPercent: 2, description: '2% account risk' },
    { name: 'Aggressive', riskPercent: 5, description: '5% account risk' }
  ];

  // Initialize form with current price when component mounts
  useEffect(() => {
    if (currentPrice && !formData.entryPrice) {
      setFormData(prev => ({
        ...prev,
        entryPrice: currentPrice.toFixed(5)
      }));
    }
  }, [currentPrice]);

  // Populate form when editing a trade
  useEffect(() => {
    if (editingTrade) {
      setFormData({
        type: editingTrade.type,
        entryPrice: editingTrade.entryPrice.toString(),
        volume: editingTrade.lotSize.toString(),
        stopLoss: editingTrade.stopLoss?.toString() || '',
        takeProfit: editingTrade.takeProfit?.toString() || '',
        status: editingTrade.status || 'active'
      });
      setIsCollapsed(false);
    }
  }, [editingTrade]);

  // Handle input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  // Validate form data
  const validateForm = () => {
    const newErrors = {};

    // Entry price validation
    const entryPrice = parseFloat(formData.entryPrice);
    if (!formData.entryPrice || isNaN(entryPrice) || entryPrice <= 0) {
      newErrors.entryPrice = 'Valid entry price is required';
    } else if (Math.abs(entryPrice - currentPrice) / currentPrice > 0.1) {
      newErrors.entryPrice = 'Entry price seems too far from current price';
    }

    // Volume validation
    const volume = parseFloat(formData.volume);
    if (!formData.volume || isNaN(volume) || volume <= 0) {
      newErrors.volume = 'Valid volume is required';
    } else if (volume > 10) {
      newErrors.volume = 'Volume seems too large for simulation';
    }

    // Stop loss validation (optional)
    if (formData.stopLoss) {
      const stopLoss = parseFloat(formData.stopLoss);
      if (isNaN(stopLoss) || stopLoss <= 0) {
        newErrors.stopLoss = 'Stop loss must be a valid positive number';
      } else {
        // Check if stop loss makes sense for trade direction
        if (formData.type === 'buy' && stopLoss >= entryPrice) {
          newErrors.stopLoss = 'Stop loss should be below entry price for buy trades';
        } else if (formData.type === 'sell' && stopLoss <= entryPrice) {
          newErrors.stopLoss = 'Stop loss should be above entry price for sell trades';
        }
      }
    }

    // Take profit validation (optional)
    if (formData.takeProfit) {
      const takeProfit = parseFloat(formData.takeProfit);
      if (isNaN(takeProfit) || takeProfit <= 0) {
        newErrors.takeProfit = 'Take profit must be a valid positive number';
      } else {
        // Check if take profit makes sense for trade direction
        if (formData.type === 'buy' && takeProfit <= entryPrice) {
          newErrors.takeProfit = 'Take profit should be above entry price for buy trades';
        } else if (formData.type === 'sell' && takeProfit >= entryPrice) {
          newErrors.takeProfit = 'Take profit should be below entry price for sell trades';
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Calculate potential profit/loss
  const calculatePotentialPnL = () => {
    const entryPrice = parseFloat(formData.entryPrice);
    const volume = parseFloat(formData.volume);
    
    if (!entryPrice || !volume || !currentPrice) return null;

    const priceDiff = formData.type === 'buy' 
      ? currentPrice - entryPrice 
      : entryPrice - currentPrice;
    
    // Simplified P&L calculation
    const pipValue = symbol.includes('JPY') ? 0.01 : 0.0001;
    const pips = priceDiff / pipValue;
    const dollarPerPip = volume * 10;
    const unrealizedPnL = pips * dollarPerPip;

    return {
      pips: pips.toFixed(1),
      unrealizedPnL: unrealizedPnL.toFixed(2),
      isProfit: unrealizedPnL >= 0
    };
  };

  // Calculate risk-based lot size
  const calculateRiskBasedLotSize = (riskPercent) => {
    const entryPrice = parseFloat(formData.entryPrice);
    const stopLoss = parseFloat(formData.stopLoss);
    
    if (!entryPrice || !stopLoss) return null;

    const accountBalance = 10000; // Simulated account balance
    const riskAmount = accountBalance * (riskPercent / 100);
    const stopLossPips = Math.abs(entryPrice - stopLoss) / (symbol.includes('JPY') ? 0.01 : 0.0001);
    
    if (stopLossPips === 0) return null;

    const dollarPerPip = 10; // Simplified
    const lotSize = riskAmount / (stopLossPips * dollarPerPip);
    
    return Math.max(0.01, Math.min(1.0, parseFloat(lotSize.toFixed(2))));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const tradeData = {
        id: editingTrade?.id || `manual_${Date.now()}`,
        type: formData.type,
        entryPrice: parseFloat(formData.entryPrice),
        lotSize: parseFloat(formData.volume),
        stopLoss: formData.stopLoss ? parseFloat(formData.stopLoss) : null,
        takeProfit: formData.takeProfit ? parseFloat(formData.takeProfit) : null,
        status: formData.status,
        entryTime: editingTrade?.entryTime || new Date().toISOString(),
        source: 'manual',
        symbol: symbol
      };

      // Call the appropriate handler
      if (editingTrade && onEditTrade) {
        await onEditTrade(tradeData);
      } else if (onAddTrade) {
        await onAddTrade(tradeData);
      }

      // Show success message
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);

      // Reset form if not editing
      if (!editingTrade) {
        handleReset();
      }

    } catch (error) {
      console.error('Error submitting trade:', error);
      setErrors({ submit: 'Failed to submit trade. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form
  const handleReset = () => {
    setFormData({
      type: 'buy',
      entryPrice: currentPrice?.toFixed(5) || '',
      volume: '0.01',
      stopLoss: '',
      takeProfit: '',
      status: 'active'
    });
    setErrors({});
    setShowSuccess(false);
  };

  // Apply risk template
  const applyRiskTemplate = (template) => {
    const lotSize = calculateRiskBasedLotSize(template.riskPercent);
    if (lotSize) {
      handleInputChange('volume', lotSize.toString());
    }
  };

  const potentialPnL = calculatePotentialPnL();

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            {editingTrade ? 'Edit Manual Trade' : 'Add Manual Trade'}
          </CardTitle>
          <div className="flex items-center gap-2">
            {showSuccess && (
              <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                <CheckCircle className="w-3 h-3 mr-1" />
                {editingTrade ? 'Updated!' : 'Added!'}
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="h-8 w-8 p-0"
            >
              {isCollapsed ? <Plus className="w-4 h-4" /> : <X className="w-4 h-4" />}
            </Button>
          </div>
        </div>
        {!isCollapsed && (
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {editingTrade ? 'Modify trade parameters' : 'Create a new manual trade position'}
          </p>
        )}
      </CardHeader>

      {!isCollapsed && (
        <CardContent className="space-y-6">
          {/* Current Market Info */}
          <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="outline">{symbol}</Badge>
                <span className="font-mono text-lg font-bold text-blue-600">
                  {currentPrice?.toFixed(5)}
                </span>
              </div>
              {!isActive && (
                <Badge variant="secondary" className="text-xs">
                  Simulation Stopped
                </Badge>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Trade Type */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Trade Type</label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={formData.type === 'buy' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleInputChange('type', 'buy')}
                  className="flex-1"
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Buy
                </Button>
                <Button
                  type="button"
                  variant={formData.type === 'sell' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleInputChange('type', 'sell')}
                  className="flex-1"
                >
                  <TrendingDown className="w-4 h-4 mr-2" />
                  Sell
                </Button>
              </div>
            </div>

            {/* Entry Price */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Entry Price</label>
              <div className="relative">
                <input
                  type="number"
                  step="0.00001"
                  value={formData.entryPrice}
                  onChange={(e) => handleInputChange('entryPrice', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md bg-background ${
                    errors.entryPrice ? 'border-red-500' : 'border-input'
                  }`}
                  placeholder="1.20000"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleInputChange('entryPrice', currentPrice?.toFixed(5) || '')}
                  className="absolute right-1 top-1 h-6 px-2 text-xs"
                >
                  Current
                </Button>
              </div>
              {errors.entryPrice && (
                <p className="text-xs text-red-600 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  {errors.entryPrice}
                </p>
              )}
            </div>

            {/* Volume */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Volume (Lot Size)</label>
              <div className="space-y-2">
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  max="10"
                  value={formData.volume}
                  onChange={(e) => handleInputChange('volume', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md bg-background ${
                    errors.volume ? 'border-red-500' : 'border-input'
                  }`}
                  placeholder="0.01"
                />
                
                {/* Lot Size Presets */}
                <div className="flex gap-1 flex-wrap">
                  {lotSizePresets.map(size => (
                    <Button
                      key={size}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleInputChange('volume', size.toString())}
                      className="h-6 px-2 text-xs"
                    >
                      {size}
                    </Button>
                  ))}
                </div>
              </div>
              {errors.volume && (
                <p className="text-xs text-red-600 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  {errors.volume}
                </p>
              )}
            </div>

            {/* Risk Templates */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Risk-Based Sizing
              </label>
              <div className="grid grid-cols-3 gap-2">
                {riskTemplates.map(template => (
                  <Button
                    key={template.name}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => applyRiskTemplate(template)}
                    className="h-auto p-2 flex flex-col items-center"
                    disabled={!formData.stopLoss}
                  >
                    <span className="text-xs font-medium">{template.name}</span>
                    <span className="text-xs text-gray-500">{template.riskPercent}%</span>
                  </Button>
                ))}
              </div>
              {!formData.stopLoss && (
                <p className="text-xs text-gray-500">Set stop loss to enable risk-based sizing</p>
              )}
            </div>

            {/* Stop Loss */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Stop Loss (Optional)</label>
              <input
                type="number"
                step="0.00001"
                value={formData.stopLoss}
                onChange={(e) => handleInputChange('stopLoss', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md bg-background ${
                  errors.stopLoss ? 'border-red-500' : 'border-input'
                }`}
                placeholder="1.19500"
              />
              {errors.stopLoss && (
                <p className="text-xs text-red-600 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  {errors.stopLoss}
                </p>
              )}
            </div>

            {/* Take Profit */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Take Profit (Optional)</label>
              <input
                type="number"
                step="0.00001"
                value={formData.takeProfit}
                onChange={(e) => handleInputChange('takeProfit', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md bg-background ${
                  errors.takeProfit ? 'border-red-500' : 'border-input'
                }`}
                placeholder="1.20500"
              />
              {errors.takeProfit && (
                <p className="text-xs text-red-600 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  {errors.takeProfit}
                </p>
              )}
            </div>

            {/* Potential P&L Display */}
            {potentialPnL && (
              <div className={`p-3 rounded-lg border ${
                potentialPnL.isProfit 
                  ? 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800' 
                  : 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Potential P&L:</span>
                  <div className="flex items-center gap-2">
                    <span className={`font-mono ${
                      potentialPnL.isProfit ? 'text-green-600' : 'text-red-600'
                    }`}>
                      ${potentialPnL.unrealizedPnL}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {potentialPnL.pips} pips
                    </Badge>
                  </div>
                </div>
              </div>
            )}

            {/* Error Display */}
            {errors.submit && (
              <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-3">
                <p className="text-sm text-red-600 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  {errors.submit}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <Button
                type="submit"
                disabled={isSubmitting || !isActive}
                className="flex-1"
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                ) : editingTrade ? (
                  <CheckCircle className="w-4 h-4 mr-2" />
                ) : (
                  <Plus className="w-4 h-4 mr-2" />
                )}
                {editingTrade ? 'Update Trade' : 'Add Trade'}
              </Button>
              
              <Button
                type="button"
                variant="outline"
                onClick={handleReset}
                disabled={isSubmitting}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                {editingTrade ? 'Cancel' : 'Reset'}
              </Button>
            </div>

            {!isActive && (
              <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                <p className="text-sm text-yellow-800 dark:text-yellow-200 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Start the simulation to enable manual trade entry
                </p>
              </div>
            )}
          </form>
        </CardContent>
      )}
    </Card>
  );
};

export default ManualTradeForm;

