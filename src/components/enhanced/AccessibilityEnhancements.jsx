import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Accessibility, 
  Type, 
  Eye, 
  Contrast,
  Volume2,
  VolumeX
} from 'lucide-react';

const AccessibilityPanel = ({ isOpen, onClose }) => {
  const [fontSize, setFontSize] = useState(100);
  const [highContrast, setHighContrast] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  useEffect(() => {
    // Apply font size
    document.documentElement.style.fontSize = `${fontSize}%`;
  }, [fontSize]);

  useEffect(() => {
    // Apply high contrast
    if (highContrast) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
  }, [highContrast]);

  useEffect(() => {
    // Apply reduced motion
    if (reducedMotion) {
      document.documentElement.classList.add('reduce-motion');
    } else {
      document.documentElement.classList.remove('reduce-motion');
    }
  }, [reducedMotion]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Accessibility className="w-5 h-5" />
              Accessibility Settings
            </h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              ×
            </Button>
          </div>

          {/* Font Size */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium">
              <Type className="w-4 h-4" />
              Font Size: {fontSize}%
            </label>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFontSize(Math.max(75, fontSize - 25))}
                disabled={fontSize <= 75}
              >
                A-
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFontSize(100)}
              >
                Reset
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFontSize(Math.min(150, fontSize + 25))}
                disabled={fontSize >= 150}
              >
                A+
              </Button>
            </div>
          </div>

          {/* High Contrast */}
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm font-medium">
              <Contrast className="w-4 h-4" />
              High Contrast
            </label>
            <Button
              variant={highContrast ? "default" : "outline"}
              size="sm"
              onClick={() => setHighContrast(!highContrast)}
            >
              {highContrast ? 'On' : 'Off'}
            </Button>
          </div>

          {/* Reduced Motion */}
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm font-medium">
              <Eye className="w-4 h-4" />
              Reduce Motion
            </label>
            <Button
              variant={reducedMotion ? "default" : "outline"}
              size="sm"
              onClick={() => setReducedMotion(!reducedMotion)}
            >
              {reducedMotion ? 'On' : 'Off'}
            </Button>
          </div>

          {/* Sound */}
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm font-medium">
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              Sound Effects
            </label>
            <Button
              variant={soundEnabled ? "default" : "outline"}
              size="sm"
              onClick={() => setSoundEnabled(!soundEnabled)}
            >
              {soundEnabled ? 'On' : 'Off'}
            </Button>
          </div>

          {/* Keyboard Navigation Info */}
          <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
            <div className="font-medium">Keyboard Navigation:</div>
            <div>• Tab: Navigate between elements</div>
            <div>• Enter/Space: Activate buttons</div>
            <div>• Escape: Close dialogs</div>
            <div>• Arrow keys: Navigate tabs/menus</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const AccessibilityButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 left-4 z-40"
        aria-label="Open accessibility settings"
      >
        <Accessibility className="w-4 h-4" />
      </Button>
      
      <AccessibilityPanel 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
      />
    </>
  );
};

export { AccessibilityButton, AccessibilityPanel };