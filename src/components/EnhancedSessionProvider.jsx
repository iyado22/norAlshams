import React, { createContext, useContext, useEffect, useState } from 'react';
import { useEnhancedSessionManager } from '../hooks/useEnhancedSessionManager';
import { LoadingSpinner } from './ui/loading-spinner';
import { Alert, AlertDescription } from './ui/alert';
import { Button } from './ui/button';
import { Shield, AlertTriangle, RefreshCw } from 'lucide-react';

const EnhancedSessionContext = createContext(null);

export const useEnhancedSession = () => {
  const context = useContext(EnhancedSessionContext);
  if (!context) {
    throw new Error('useEnhancedSession must be used within an EnhancedSessionProvider');
  }
  return context;
};

const SessionErrorBoundary = ({ children, onRetry }) => {
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleError = (event) => {
      if (event.detail?.type === 'session_error') {
        setHasError(true);
        setError(event.detail.error);
      }
    };

    window.addEventListener('sessionError', handleError);
    return () => window.removeEventListener('sessionError', handleError);
  }, []);

  if (hasError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="max-w-md w-full p-6">
          <Alert className="border-red-200 bg-red-50 dark:bg-red-900/20">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            <AlertDescription className="text-red-800 dark:text-red-200">
              <div className="space-y-3">
                <div>
                  <strong>Session Error</strong>
                  <p className="text-sm mt-1">
                    {error?.message || 'An error occurred while managing your session.'}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    onClick={() => {
                      setHasError(false);
                      setError(null);
                      onRetry?.();
                    }}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Retry
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => window.location.reload()}
                  >
                    Reload Page
                  </Button>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return children;
};

const EnhancedSessionProvider = ({ children }) => {
  const sessionManager = useEnhancedSessionManager();
  const { isLoading, sessionData, sessionStatus, initializeSession } = sessionManager;
  const [initializationError, setInitializationError] = useState(null);

  // Auto-initialize session for demo purposes
  useEffect(() => {
    const initializeDemo = async () => {
      if (!isLoading && !sessionData.isAuthenticated && !initializationError) {
        try {
          await initializeSession({
            id: 'demo_user_' + Date.now(),
            name: 'Demo Trader',
            email: 'demo@gridtrading.com',
            role: 'trader',
            permissions: ['trade', 'view_reports', 'export_data']
          });
        } catch (error) {
          console.error('Failed to initialize demo session:', error);
          setInitializationError(error);
          
          // Dispatch error event
          window.dispatchEvent(new CustomEvent('sessionError', {
            detail: { type: 'session_error', error }
          }));
        }
      }
    };

    initializeDemo();
  }, [isLoading, sessionData.isAuthenticated, initializeSession, initializationError]);

  // Handle session events
  useEffect(() => {
    const handleSessionWarning = () => {
      console.log('Session warning triggered');
    };

    const handleSessionExpired = () => {
      console.log('Session expired');
      // Could show a notification or redirect to login
    };

    const handleSessionCreated = (event) => {
      console.log('Session created:', event.detail);
    };

    const handleSessionCleared = () => {
      console.log('Session cleared');
      setInitializationError(null);
    };

    window.addEventListener('sessionWarning', handleSessionWarning);
    window.addEventListener('sessionExpired', handleSessionExpired);
    window.addEventListener('sessionCreated', handleSessionCreated);
    window.addEventListener('sessionCleared', handleSessionCleared);

    return () => {
      window.removeEventListener('sessionWarning', handleSessionWarning);
      window.removeEventListener('sessionExpired', handleSessionExpired);
      window.removeEventListener('sessionCreated', handleSessionCreated);
      window.removeEventListener('sessionCleared', handleSessionCleared);
    };
  }, []);

  const handleRetry = () => {
    setInitializationError(null);
    window.location.reload();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center space-y-4">
          <LoadingSpinner size="xl" />
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center justify-center gap-2">
              <Shield className="w-5 h-5" />
              Initializing Secure Session
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Setting up your secure trading environment...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <SessionErrorBoundary onRetry={handleRetry}>
      <EnhancedSessionContext.Provider value={sessionManager}>
        {children}
      </EnhancedSessionContext.Provider>
    </SessionErrorBoundary>
  );
};

export default EnhancedSessionProvider;