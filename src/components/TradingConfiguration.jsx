import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, 
  Sliders,
  Target,
  DollarSign,
  BarChart3,
  AlertTriangle,
  Info
} from 'lucide-react';

const TradingConfiguration = ({ 
  config, 
  onConfigChange, 
  isActive,
  onApplyConfig 
}) => {
  const [localConfig, setLocalConfig] = useState(config);
  const [activeTab, setActiveTab] = useState('grid');

  const handleConfigChange = (key, value) => {
    const newConfig = { ...localConfig, [key]: value };
    setLocalConfig(newConfig);
  };

  const handleApply = () => {
    onConfigChange(localConfig);
    onApplyConfig();
  };

  const handleReset = () => {
    const defaultConfig = {
      gridSize: 0.001,
      maxTrades: 10,
      lotSize: 0.01,
      takeProfitTarget: 100,
      startingPrice: 1.2000,
      gridLevels: 5,
      riskManagement: {
        maxDrawdown: 500,
        stopLoss: false,
        trailingStop: false
      }
    };
    setLocalConfig(defaultConfig);
  };

  const presets = [
    {
      name: 'Conservative',
      description: 'Low risk, steady gains',
      config: {
        gridSize: 0.0005,
        maxTrades: 5,
        lotSize: 0.01,
        takeProfitTarget: 50,
        gridLevels: 3
      }
    },
    {
      name: 'Aggressive',
      description: 'Higher risk, faster profits',
      config: {
        gridSize: 0.002,
        maxTrades: 20,
        lotSize: 0.02,
        takeProfitTarget: 200,
        gridLevels: 10
      }
    },
    {
      name: 'Balanced',
      description: 'Moderate risk and reward',
      config: {
        gridSize: 0.001,
        maxTrades: 10,
        lotSize: 0.01,
        takeProfitTarget: 100,
        gridLevels: 5
      }
    }
  ];

  const applyPreset = (preset) => {
    setLocalConfig({ ...localConfig, ...preset.config });
  };

  const tabs = [
    { id: 'grid', label: 'Grid Settings', icon: BarChart3 },
    { id: 'risk', label: 'Risk Management', icon: AlertTriangle },
    { id: 'presets', label: 'Strategy Presets', icon: Target }
  ];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Trading Configuration
          {isActive && (
            <Badge variant="destructive" className="ml-2">
              Cannot modify while trading
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Grid Settings Tab */}
        {activeTab === 'grid' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Grid Size (pips)
                </label>
                <input
                  type="number"
                  step="0.0001"
                  value={localConfig.gridSize}
                  onChange={(e) => handleConfigChange('gridSize', parseFloat(e.target.value))}
                  disabled={isActive}
                  className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-600 disabled:opacity-50"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Distance between grid levels
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Max Trades
                </label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={localConfig.maxTrades}
                  onChange={(e) => handleConfigChange('maxTrades', parseInt(e.target.value))}
                  disabled={isActive}
                  className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-600 disabled:opacity-50"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Maximum concurrent trades
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Lot Size
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={localConfig.lotSize}
                  onChange={(e) => handleConfigChange('lotSize', parseFloat(e.target.value))}
                  disabled={isActive}
                  className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-600 disabled:opacity-50"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Trade volume per position
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Take Profit Target ($)
                </label>
                <input
                  type="number"
                  min="10"
                  value={localConfig.takeProfitTarget}
                  onChange={(e) => handleConfigChange('takeProfitTarget', parseFloat(e.target.value))}
                  disabled={isActive}
                  className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-600 disabled:opacity-50"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Close all trades when reached
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Grid Levels
                </label>
                <input
                  type="number"
                  min="3"
                  max="20"
                  value={localConfig.gridLevels}
                  onChange={(e) => handleConfigChange('gridLevels', parseInt(e.target.value))}
                  disabled={isActive}
                  className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-600 disabled:opacity-50"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Number of buy/sell levels
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Starting Price
                </label>
                <input
                  type="number"
                  step="0.00001"
                  value={localConfig.startingPrice}
                  onChange={(e) => handleConfigChange('startingPrice', parseFloat(e.target.value))}
                  disabled={isActive}
                  className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-600 disabled:opacity-50"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Center price for grid calculation
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Risk Management Tab */}
        {activeTab === 'risk' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Max Drawdown ($)
                </label>
                <input
                  type="number"
                  min="50"
                  value={localConfig.riskManagement?.maxDrawdown || 500}
                  onChange={(e) => handleConfigChange('riskManagement', {
                    ...localConfig.riskManagement,
                    maxDrawdown: parseFloat(e.target.value)
                  })}
                  disabled={isActive}
                  className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-600 disabled:opacity-50"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Stop trading if losses exceed this amount
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="stopLoss"
                    checked={localConfig.riskManagement?.stopLoss || false}
                    onChange={(e) => handleConfigChange('riskManagement', {
                      ...localConfig.riskManagement,
                      stopLoss: e.target.checked
                    })}
                    disabled={isActive}
                    className="rounded disabled:opacity-50"
                  />
                  <label htmlFor="stopLoss" className="text-sm font-medium">
                    Enable Stop Loss
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="trailingStop"
                    checked={localConfig.riskManagement?.trailingStop || false}
                    onChange={(e) => handleConfigChange('riskManagement', {
                      ...localConfig.riskManagement,
                      trailingStop: e.target.checked
                    })}
                    disabled={isActive}
                    className="rounded disabled:opacity-50"
                  />
                  <label htmlFor="trailingStop" className="text-sm font-medium">
                    Enable Trailing Stop
                  </label>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <Info className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                <div>
                  <h4 className="font-medium text-yellow-800 dark:text-yellow-200">
                    Risk Management Notice
                  </h4>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                    These settings help protect your capital. Grid trading can be risky, 
                    especially in trending markets. Always use appropriate risk management.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Strategy Presets Tab */}
        {activeTab === 'presets' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {presets.map((preset, index) => (
                <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div>
                        <h3 className="font-semibold text-lg">{preset.name}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {preset.description}
                        </p>
                      </div>
                      
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span>Grid Size:</span>
                          <span>{preset.config.gridSize}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Max Trades:</span>
                          <span>{preset.config.maxTrades}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>TP Target:</span>
                          <span>${preset.config.takeProfitTarget}</span>
                        </div>
                      </div>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => applyPreset(preset)}
                        disabled={isActive}
                        className="w-full"
                      >
                        Apply Preset
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t">
          <Button
            onClick={handleApply}
            disabled={isActive}
            className="flex-1"
          >
            <Sliders className="w-4 h-4 mr-2" />
            Apply Configuration
          </Button>
          
          <Button
            variant="outline"
            onClick={handleReset}
            disabled={isActive}
          >
            Reset to Default
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default TradingConfiguration;

