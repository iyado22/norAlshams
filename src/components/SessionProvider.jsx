import React, { createContext, useContext, useEffect } from 'react';
import { useSessionManager } from '../hooks/useSessionManager';
import { LoadingSpinner } from './ui/loading-spinner';

const SessionContext = createContext(null);

export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
};

const SessionProvider = ({ children }) => {
  const sessionManager = useSessionManager();
  const { isLoading, sessionData } = sessionManager;

  // Auto-initialize session for demo purposes
  useEffect(() => {
    if (!isLoading && !sessionData.isAuthenticated) {
      // Initialize a demo session
      sessionManager.initializeSession({
        id: 'demo_user',
        name: 'Demo Trader',
        email: 'demo@gridtrading.com',
        role: 'trader'
      });
    }
  }, [isLoading, sessionData.isAuthenticated, sessionManager]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="xl" text="Loading session..." />
      </div>
    );
  }

  return (
    <SessionContext.Provider value={sessionManager}>
      {children}
    </SessionContext.Provider>
  );
};

export default SessionProvider;