import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Session Management Hook
 * Handles user sessions, preferences, and application state persistence
 */
export const useSessionManager = () => {
  const [sessionData, setSessionData] = useState({
    user: null,
    preferences: {},
    tradingConfig: {},
    isAuthenticated: false,
    sessionId: null,
    lastActivity: null
  });

  const [isLoading, setIsLoading] = useState(true);
  const sessionTimeoutRef = useRef(null);
  const activityTimeoutRef = useRef(null);

  // Session configuration
  const SESSION_CONFIG = {
    TIMEOUT_DURATION: 30 * 60 * 1000, // 30 minutes
    WARNING_DURATION: 5 * 60 * 1000,  // 5 minutes before timeout
    STORAGE_KEY: 'grid_trading_session',
    PREFERENCES_KEY: 'grid_trading_preferences',
    TEMP_DATA_KEY: 'grid_trading_temp_data'
  };

  // Generate session ID
  const generateSessionId = () => {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  // Encrypt sensitive data (basic implementation)
  const encryptData = (data) => {
    try {
      return btoa(JSON.stringify(data));
    } catch (error) {
      console.error('Encryption failed:', error);
      return null;
    }
  };

  // Decrypt sensitive data
  const decryptData = (encryptedData) => {
    try {
      return JSON.parse(atob(encryptedData));
    } catch (error) {
      console.error('Decryption failed:', error);
      return null;
    }
  };

  // Save session data to storage
  const saveSessionData = useCallback((data) => {
    try {
      const sessionInfo = {
        ...data,
        lastActivity: Date.now(),
        expiresAt: Date.now() + SESSION_CONFIG.TIMEOUT_DURATION
      };

      // Save persistent data to localStorage
      localStorage.setItem(
        SESSION_CONFIG.STORAGE_KEY, 
        encryptData(sessionInfo)
      );

      // Save temporary data to sessionStorage
      sessionStorage.setItem(
        SESSION_CONFIG.TEMP_DATA_KEY,
        JSON.stringify({
          sessionId: sessionInfo.sessionId,
          lastActivity: sessionInfo.lastActivity
        })
      );

      setSessionData(sessionInfo);
    } catch (error) {
      console.error('Failed to save session data:', error);
    }
  }, []);

  // Load session data from storage
  const loadSessionData = useCallback(() => {
    try {
      setIsLoading(true);

      // Load from localStorage
      const storedSession = localStorage.getItem(SESSION_CONFIG.STORAGE_KEY);
      const storedPreferences = localStorage.getItem(SESSION_CONFIG.PREFERENCES_KEY);
      
      // Load from sessionStorage
      const tempData = sessionStorage.getItem(SESSION_CONFIG.TEMP_DATA_KEY);

      let sessionInfo = null;
      let preferences = {};

      if (storedSession) {
        sessionInfo = decryptData(storedSession);
      }

      if (storedPreferences) {
        preferences = JSON.parse(storedPreferences);
      }

      // Validate session
      if (sessionInfo && sessionInfo.expiresAt > Date.now()) {
        // Session is valid
        setSessionData({
          ...sessionInfo,
          preferences,
          lastActivity: Date.now()
        });

        // Update last activity
        saveSessionData({
          ...sessionInfo,
          preferences
        });
      } else {
        // Session expired or doesn't exist
        clearSession();
      }
    } catch (error) {
      console.error('Failed to load session data:', error);
      clearSession();
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initialize session
  const initializeSession = useCallback((userData = null) => {
    const newSessionData = {
      user: userData,
      preferences: sessionData.preferences || {},
      tradingConfig: sessionData.tradingConfig || {},
      isAuthenticated: !!userData,
      sessionId: generateSessionId(),
      lastActivity: Date.now()
    };

    saveSessionData(newSessionData);
    startSessionTimeout();
  }, [sessionData.preferences, sessionData.tradingConfig]);

  // Update session data
  const updateSession = useCallback((updates) => {
    const updatedData = {
      ...sessionData,
      ...updates,
      lastActivity: Date.now()
    };

    saveSessionData(updatedData);
    resetSessionTimeout();
  }, [sessionData]);

  // Update user preferences
  const updatePreferences = useCallback((newPreferences) => {
    const updatedPreferences = {
      ...sessionData.preferences,
      ...newPreferences
    };

    // Save preferences separately for persistence
    localStorage.setItem(
      SESSION_CONFIG.PREFERENCES_KEY,
      JSON.stringify(updatedPreferences)
    );

    updateSession({ preferences: updatedPreferences });
  }, [sessionData.preferences, updateSession]);

  // Update trading configuration
  const updateTradingConfig = useCallback((newConfig) => {
    updateSession({ 
      tradingConfig: {
        ...sessionData.tradingConfig,
        ...newConfig
      }
    });
  }, [sessionData.tradingConfig, updateSession]);

  // Clear session
  const clearSession = useCallback(() => {
    localStorage.removeItem(SESSION_CONFIG.STORAGE_KEY);
    sessionStorage.removeItem(SESSION_CONFIG.TEMP_DATA_KEY);
    
    setSessionData({
      user: null,
      preferences: {},
      tradingConfig: {},
      isAuthenticated: false,
      sessionId: null,
      lastActivity: null
    });

    clearTimeout(sessionTimeoutRef.current);
    clearTimeout(activityTimeoutRef.current);
  }, []);

  // Start session timeout
  const startSessionTimeout = useCallback(() => {
    clearTimeout(sessionTimeoutRef.current);
    clearTimeout(activityTimeoutRef.current);

    // Warning timeout (5 minutes before expiration)
    activityTimeoutRef.current = setTimeout(() => {
      // Dispatch session warning event
      window.dispatchEvent(new CustomEvent('sessionWarning', {
        detail: { remainingTime: SESSION_CONFIG.WARNING_DURATION }
      }));
    }, SESSION_CONFIG.TIMEOUT_DURATION - SESSION_CONFIG.WARNING_DURATION);

    // Session expiration timeout
    sessionTimeoutRef.current = setTimeout(() => {
      clearSession();
      window.dispatchEvent(new CustomEvent('sessionExpired'));
    }, SESSION_CONFIG.TIMEOUT_DURATION);
  }, [clearSession]);

  // Reset session timeout
  const resetSessionTimeout = useCallback(() => {
    if (sessionData.isAuthenticated) {
      startSessionTimeout();
    }
  }, [sessionData.isAuthenticated, startSessionTimeout]);

  // Track user activity
  const trackActivity = useCallback(() => {
    if (sessionData.isAuthenticated) {
      updateSession({ lastActivity: Date.now() });
    }
  }, [sessionData.isAuthenticated, updateSession]);

  // Extend session
  const extendSession = useCallback(() => {
    if (sessionData.isAuthenticated) {
      updateSession({ lastActivity: Date.now() });
      resetSessionTimeout();
    }
  }, [sessionData.isAuthenticated, updateSession, resetSessionTimeout]);

  // Get session status
  const getSessionStatus = useCallback(() => {
    if (!sessionData.isAuthenticated) {
      return { status: 'inactive', remainingTime: 0 };
    }

    const now = Date.now();
    const expiresAt = sessionData.lastActivity + SESSION_CONFIG.TIMEOUT_DURATION;
    const remainingTime = Math.max(0, expiresAt - now);

    return {
      status: remainingTime > 0 ? 'active' : 'expired',
      remainingTime,
      warningThreshold: remainingTime <= SESSION_CONFIG.WARNING_DURATION
    };
  }, [sessionData.isAuthenticated, sessionData.lastActivity]);

  // Initialize session on mount
  useEffect(() => {
    loadSessionData();
  }, [loadSessionData]);

  // Set up activity tracking
  useEffect(() => {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    const handleActivity = () => {
      trackActivity();
    };

    // Throttle activity tracking
    let activityTimer = null;
    const throttledActivity = () => {
      if (!activityTimer) {
        activityTimer = setTimeout(() => {
          handleActivity();
          activityTimer = null;
        }, 30000); // Track activity every 30 seconds max
      }
    };

    events.forEach(event => {
      document.addEventListener(event, throttledActivity, true);
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, throttledActivity, true);
      });
      clearTimeout(activityTimer);
    };
  }, [trackActivity]);

  // Handle page visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && sessionData.isAuthenticated) {
        // Check if session is still valid when page becomes visible
        const status = getSessionStatus();
        if (status.status === 'expired') {
          clearSession();
        } else {
          trackActivity();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [sessionData.isAuthenticated, getSessionStatus, clearSession, trackActivity]);

  // Handle beforeunload
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (sessionData.isAuthenticated) {
        // Save current state before page unload
        saveSessionData(sessionData);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [sessionData, saveSessionData]);

  return {
    // Session data
    sessionData,
    isLoading,
    
    // Session management
    initializeSession,
    updateSession,
    clearSession,
    extendSession,
    
    // Preferences and config
    updatePreferences,
    updateTradingConfig,
    
    // Session status
    getSessionStatus,
    
    // Utilities
    isAuthenticated: sessionData.isAuthenticated,
    user: sessionData.user,
    preferences: sessionData.preferences,
    tradingConfig: sessionData.tradingConfig
  };
};

export default useSessionManager;