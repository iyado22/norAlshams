import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Save, 
  RotateCcw, 
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { useFormPersistence } from '../hooks/useFormPersistence';
import { useSession } from './SessionProvider';

const PersistentTradingForm = ({ onConfigChange, initialConfig = {} }) => {
  const { isAuthenticated } = useSession();
  const {
    formData,
    updateField,
    saveFormData,
    clearFormData,
    resetForm,
    isDirty,
    hasUnsavedChanges
  } = useFormPersistence('trading_config', initialConfig);

  // Auto-save form data periodically
  useEffect(() => {
    if (!isDirty) return;

    const autoSaveTimer = setTimeout(() => {
      saveFormData(formData, true); // Save persistently
    }, 2000); // Auto-save after 2 seconds of inactivity

    return () => clearTimeout(autoSaveTimer);
  }, [formData, isDirty, saveFormData]);

  // Notify parent of config changes
  useEffect(() => {
    if (onConfigChange) {
      onConfigChange(formData);
    }
  }, [formData, onConfigChange]);

  // Handle form submission
  const handleSave = () => {
    saveFormData(formData, true);
  };

  // Handle field changes
  const handleFieldChange = (field, value) => {
    updateField(field, value, false); // Don't persist immediately
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            Trading Configuration
            {isDirty && (
              <Badge variant="outline" className="text-xs">
                <Clock className="w-3 h-3 mr-1" />
                Unsaved
              </Badge>
            )}
          </CardTitle>
          
          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <Badge variant="default" className="text-xs">
                <CheckCircle className="w-3 h-3 mr-1" />
                Auto-saving
              </Badge>
            ) : (
              <Badge variant="secondary" className="text-xs">
                <AlertTriangle className="w-3 h-3 mr-1" />
                Temporary
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {!isAuthenticated && (
          <Alert>
            <AlertTriangle className="w-4 h-4" />
            <AlertDescription>
              Your settings will only be saved for this session. 
              Enable session management for persistent storage.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Grid Size
            </label>
            <input
              type="number"
              step="0.0001"
              value={formData.gridSize || ''}
              onChange={(e) => handleFieldChange('gridSize', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-600"
              placeholder="0.0010"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Max Trades
            </label>
            <input
              type="number"
              min="1"
              max="50"
              value={formData.maxTrades || ''}
              onChange={(e) => handleFieldChange('maxTrades', parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-600"
              placeholder="10"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Lot Size
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={formData.lotSize || ''}
              onChange={(e) => handleFieldChange('lotSize', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-600"
              placeholder="0.01"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Take Profit Target ($)
            </label>
            <input
              type="number"
              min="10"
              value={formData.takeProfitTarget || ''}
              onChange={(e) => handleFieldChange('takeProfitTarget', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-600"
              placeholder="100"
            />
          </div>
        </div>

        <div className="flex gap-2 pt-4 border-t">
          <Button 
            onClick={handleSave}
            disabled={!hasUnsavedChanges()}
            className="flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save Configuration
          </Button>
          
          <Button 
            variant="outline" 
            onClick={resetForm}
            disabled={!isDirty}
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
          
          <Button 
            variant="destructive" 
            onClick={clearFormData}
            disabled={!isDirty}
          >
            Clear All
          </Button>
        </div>

        {hasUnsavedChanges() && (
          <Alert>
            <AlertTriangle className="w-4 h-4" />
            <AlertDescription>
              You have unsaved changes. They will be automatically saved in a few seconds.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default PersistentTradingForm;