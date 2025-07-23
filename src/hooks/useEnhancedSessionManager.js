import { useState, useEffect, useCallback, useRef } from 'react';
import { sessionSecurity } from '../lib/sessionSecurity';

/**
 * Enhanced Session Manager Hook
 * Production-ready session management with security features
 */
export const useEnhancedSessionManager = () => {
  const [sessionData, setSessionData] = useState({
    user: null,
    preferences: {},
    tradingConfig: {},
    isAuthenticated: false,
    sessionId: null,
    lastActivity: null,
    csrfToken: null,
    fingerprint: null
  });

  const [isLoading, setIsLoading] = useState(true);
  const [sessionStatus, setSessionStatus] = useState('inactive');
  const sessionTimeoutRef = useRef(null);
  const warningTimeoutRef = useRef(null);
  const heartbeatRef = useRef(null);

  // Enhanced session configuration
  const SESSION_CONFIG = {
    TIMEOUT_DURATION: 30 * 60 * 1000, // 30 minutes
    WARNING_DURATION: 5 * 60 * 1000,  // 5 minutes before timeout
    HEARTBEAT_INTERVAL: 60 * 1000,    // 1 minute heartbeat
    MAX_INACTIVE_TIME: 15 * 60 * 1000, // 15 minutes max inactivity
    STORAGE_KEY: 'grid_trading_session_v2',
    PREFERENCES_KEY: 'grid_trading_preferences_v2',
    TEMP_DATA_KEY: 'grid_trading_temp_data_v2',
    CSRF_STORAGE_KEY: 'csrf_token'
  };

  // Initialize session with enhanced security
  const initializeSession = useCallback(async (userData = null) => {
    try {
      const sessionId = sessionSecurity.generateSessionId();
      const csrfToken = sessionSecurity.generateCSRFToken();
      const fingerprint = sessionSecurity.generateFingerprint();
      
      const newSessionData = {
        user: userData,
        preferences: sessionData.preferences || {},
        tradingConfig: sessionData.tradingConfig || {},
        isAuthenticated: !!userData,
        sessionId,
        csrfToken,
        fingerprint,
        lastActivity: Date.now(),
        createdAt: Date.now(),
        expiresAt: Date.now() + SESSION_CONFIG.TIMEOUT_DURATION
      };

      // Encrypt and save session data
      const encryptedSession = sessionSecurity.encryptData(newSessionData);
      if (encryptedSession) {
        localStorage.setItem(SESSION_CONFIG.STORAGE_KEY, encryptedSession);
        sessionStorage.setItem(SESSION_CONFIG.CSRF_STORAGE_KEY, csrfToken);
      }

      setSessionData(newSessionData);
      setSessionStatus('active');
      startSessionMonitoring();
      
      // Dispatch session created event
      window.dispatchEvent(new CustomEvent('sessionCreated', {
        detail: { sessionId, userId: userData?.id }
      }));

      return newSessionData;
    } catch (error) {
      console.error('Failed to initialize session:', error);
      throw new Error('Session initialization failed');
    }
  }, [sessionData.preferences, sessionData.tradingConfig]);

  // Load and validate session
  const loadSession = useCallback(async () => {
    try {
      setIsLoading(true);
      
      const encryptedSession = localStorage.getItem(SESSION_CONFIG.STORAGE_KEY);
      const storedPreferences = localStorage.getItem(SESSION_CONFIG.PREFERENCES_KEY);
      
      if (!encryptedSession) {
        setSessionStatus('inactive');
        return;
      }

      // Decrypt session data
      const sessionInfo = sessionSecurity.decryptData(encryptedSession);
      if (!sessionInfo || !sessionSecurity.validateSessionData(sessionInfo)) {
        clearSession();
        return;
      }

      // Validate fingerprint for additional security
      const currentFingerprint = sessionSecurity.generateFingerprint();
      if (sessionInfo.fingerprint !== currentFingerprint) {
        console.warn('Session fingerprint mismatch - potential security issue');
        clearSession();
        return;
      }

      // Load preferences
      let preferences = {};
      if (storedPreferences) {
        try {
          preferences = JSON.parse(storedPreferences);
        } catch (error) {
          console.error('Failed to parse preferences:', error);
        }
      }

      // Update session with current activity
      const updatedSession = {
        ...sessionInfo,
        preferences,
        lastActivity: Date.now()
      };

      setSessionData(updatedSession);
      setSessionStatus('active');
      startSessionMonitoring();
      
      // Save updated session
      const encryptedUpdated = sessionSecurity.encryptData(updatedSession);
      if (encryptedUpdated) {
        localStorage.setItem(SESSION_CONFIG.STORAGE_KEY, encryptedUpdated);
      }

    } catch (error) {
      console.error('Failed to load session:', error);
      clearSession();
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Update session data securely
  const updateSession = useCallback(async (updates) => {
    try {
      const updatedData = {
        ...sessionData,
        ...updates,
        lastActivity: Date.now()
      };

      // Validate updates
      if (updates.preferences) {
        localStorage.setItem(
          SESSION_CONFIG.PREFERENCES_KEY,
          JSON.stringify(updates.preferences)
        );
      }

      // Encrypt and save
      const encryptedSession = sessionSecurity.encryptData(updatedData);
      if (encryptedSession) {
        localStorage.setItem(SESSION_CONFIG.STORAGE_KEY, encryptedSession);
      }

      setSessionData(updatedData);
      resetSessionTimeout();

      return updatedData;
    } catch (error) {
      console.error('Failed to update session:', error);
      throw new Error('Session update failed');
    }
  }, [sessionData]);

  // Clear session securely
  const clearSession = useCallback(() => {
    try {
      // Clear all storage
      localStorage.removeItem(SESSION_CONFIG.STORAGE_KEY);
      localStorage.removeItem(SESSION_CONFIG.PREFERENCES_KEY);
      sessionStorage.removeItem(SESSION_CONFIG.TEMP_DATA_KEY);
      sessionStorage.removeItem(SESSION_CONFIG.CSRF_STORAGE_KEY);
      
      // Clear timeouts
      clearTimeout(sessionTimeoutRef.current);
      clearTimeout(warningTimeoutRef.current);
      clearInterval(heartbeatRef.current);

      // Reset state
      setSessionData({
        user: null,
        preferences: {},
        tradingConfig: {},
        isAuthenticated: false,
        sessionId: null,
        lastActivity: null,
        csrfToken: null,
        fingerprint: null
      });
      
      setSessionStatus('inactive');

      // Dispatch session cleared event
      window.dispatchEvent(new CustomEvent('sessionCleared'));
      
    } catch (error) {
      console.error('Failed to clear session:', error);
    }
  }, []);

  // Start session monitoring
  const startSessionMonitoring = useCallback(() => {
    // Clear existing timers
    clearTimeout(sessionTimeoutRef.current);
    clearTimeout(warningTimeoutRef.current);
    clearInterval(heartbeatRef.current);

    // Warning timeout
    warningTimeoutRef.current = setTimeout(() => {
      setSessionStatus('warning');
      window.dispatchEvent(new CustomEvent('sessionWarning', {
        detail: { remainingTime: SESSION_CONFIG.WARNING_DURATION }
      }));
    }, SESSION_CONFIG.TIMEOUT_DURATION - SESSION_CONFIG.WARNING_DURATION);

    // Session expiration timeout
    sessionTimeoutRef.current = setTimeout(() => {
      setSessionStatus('expired');
      clearSession();
      window.dispatchEvent(new CustomEvent('sessionExpired'));
    }, SESSION_CONFIG.TIMEOUT_DURATION);

    // Heartbeat for session validation
    heartbeatRef.current = setInterval(() => {
      if (sessionData.isAuthenticated) {
        validateSession();
      }
    }, SESSION_CONFIG.HEARTBEAT_INTERVAL);
  }, [sessionData.isAuthenticated]);

  // Reset session timeout
  const resetSessionTimeout = useCallback(() => {
    if (sessionData.isAuthenticated && sessionStatus === 'active') {
      startSessionMonitoring();
    }
  }, [sessionData.isAuthenticated, sessionStatus, startSessionMonitoring]);

  // Validate current session
  const validateSession = useCallback(async () => {
    try {
      const encryptedSession = localStorage.getItem(SESSION_CONFIG.STORAGE_KEY);
      if (!encryptedSession) {
        clearSession();
        return false;
      }

      const sessionInfo = sessionSecurity.decryptData(encryptedSession);
      if (!sessionInfo || !sessionSecurity.validateSessionData(sessionInfo)) {
        clearSession();
        return false;
      }

      // Check for suspicious activity
      const timeSinceLastActivity = Date.now() - sessionInfo.lastActivity;
      if (timeSinceLastActivity > SESSION_CONFIG.MAX_INACTIVE_TIME) {
        console.warn('Session inactive for too long');
        clearSession();
        return false;
      }

      return true;
    } catch (error) {
      console.error('Session validation failed:', error);
      clearSession();
      return false;
    }
  }, []);

  // Extend session
  const extendSession = useCallback(async () => {
    try {
      if (!sessionData.isAuthenticated) return false;

      const updatedSession = {
        ...sessionData,
        lastActivity: Date.now(),
        expiresAt: Date.now() + SESSION_CONFIG.TIMEOUT_DURATION
      };

      await updateSession(updatedSession);
      setSessionStatus('active');
      startSessionMonitoring();

      window.dispatchEvent(new CustomEvent('sessionExtended'));
      return true;
    } catch (error) {
      console.error('Failed to extend session:', error);
      return false;
    }
  }, [sessionData, updateSession, startSessionMonitoring]);

  // Get session status with detailed information
  const getSessionStatus = useCallback(() => {
    if (!sessionData.isAuthenticated) {
      return { 
        status: 'inactive', 
        remainingTime: 0,
        isValid: false,
        csrfToken: null
      };
    }

    const now = Date.now();
    const expiresAt = sessionData.lastActivity + SESSION_CONFIG.TIMEOUT_DURATION;
    const remainingTime = Math.max(0, expiresAt - now);
    const warningThreshold = remainingTime <= SESSION_CONFIG.WARNING_DURATION;

    return {
      status: remainingTime > 0 ? sessionStatus : 'expired',
      remainingTime,
      warningThreshold,
      isValid: remainingTime > 0,
      csrfToken: sessionData.csrfToken,
      sessionId: sessionData.sessionId
    };
  }, [sessionData, sessionStatus]);

  // Track user activity with throttling
  const trackActivity = useCallback(() => {
    if (!sessionData.isAuthenticated) return;

    const now = Date.now();
    const timeSinceLastUpdate = now - (sessionData.lastActivity || 0);
    
    // Throttle activity updates to every 30 seconds
    if (timeSinceLastUpdate > 30000) {
      updateSession({ lastActivity: now });
    }
  }, [sessionData.isAuthenticated, sessionData.lastActivity, updateSession]);

  // Initialize session on mount
  useEffect(() => {
    loadSession();
  }, [loadSession]);

  // Set up activity tracking
  useEffect(() => {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    let activityTimer = null;
    const throttledActivity = () => {
      if (!activityTimer) {
        activityTimer = setTimeout(() => {
          trackActivity();
          activityTimer = null;
        }, 30000);
      }
    };

    events.forEach(event => {
      document.addEventListener(event, throttledActivity, { passive: true });
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, throttledActivity);
      });
      clearTimeout(activityTimer);
    };
  }, [trackActivity]);

  // Handle page visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && sessionData.isAuthenticated) {
        validateSession().then(isValid => {
          if (!isValid) {
            clearSession();
          } else {
            trackActivity();
          }
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [sessionData.isAuthenticated, validateSession, trackActivity]);

  // Handle storage events (cross-tab synchronization)
  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key === SESSION_CONFIG.STORAGE_KEY) {
        if (!event.newValue) {
          // Session was cleared in another tab
          clearSession();
        } else {
          // Session was updated in another tab
          loadSession();
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [loadSession]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimeout(sessionTimeoutRef.current);
      clearTimeout(warningTimeoutRef.current);
      clearInterval(heartbeatRef.current);
    };
  }, []);

  return {
    // Session data
    sessionData,
    isLoading,
    sessionStatus,
    
    // Session management
    initializeSession,
    updateSession,
    clearSession,
    extendSession,
    validateSession,
    
    // Session status
    getSessionStatus,
    trackActivity,
    
    // Security
    csrfToken: sessionData.csrfToken,
    
    // Utilities
    isAuthenticated: sessionData.isAuthenticated,
    user: sessionData.user,
    preferences: sessionData.preferences,
    tradingConfig: sessionData.tradingConfig
  };
};

export default useEnhancedSessionManager;