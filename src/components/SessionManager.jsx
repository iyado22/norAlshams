import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Clock, 
  Shield, 
  AlertTriangle, 
  CheckCircle,
  LogOut,
  RefreshCw
} from 'lucide-react';
import { useSessionManager } from '../hooks/useSessionManager';

const SessionWarningDialog = ({ isOpen, onExtend, onLogout, remainingTime }) => {
  const [timeLeft, setTimeLeft] = useState(remainingTime);

  useEffect(() => {
    if (!isOpen) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        const newTime = prev - 1000;
        if (newTime <= 0) {
          onLogout();
          return 0;
        }
        return newTime;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, onLogout]);

  const formatTime = (ms) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-600">
            <AlertTriangle className="w-5 h-5" />
            Session Expiring Soon
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600 mb-2">
              {formatTime(timeLeft)}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Your session will expire automatically to protect your data.
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button onClick={onExtend} className="flex-1">
              <RefreshCw className="w-4 h-4 mr-2" />
              Extend Session
            </Button>
            <Button variant="outline" onClick={onLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const SessionStatus = ({ className }) => {
  const { 
    sessionData, 
    getSessionStatus, 
    extendSession, 
    clearSession,
    isAuthenticated 
  } = useSessionManager();
  
  const [status, setStatus] = useState({ status: 'inactive', remainingTime: 0 });
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;

    const updateStatus = () => {
      const currentStatus = getSessionStatus();
      setStatus(currentStatus);
      
      if (currentStatus.warningThreshold && currentStatus.status === 'active') {
        setShowWarning(true);
      }
    };

    updateStatus();
    const interval = setInterval(updateStatus, 1000);

    return () => clearInterval(interval);
  }, [isAuthenticated, getSessionStatus]);

  // Listen for session events
  useEffect(() => {
    const handleSessionWarning = (event) => {
      setShowWarning(true);
    };

    const handleSessionExpired = () => {
      setShowWarning(false);
      // Could show a different notification here
    };

    window.addEventListener('sessionWarning', handleSessionWarning);
    window.addEventListener('sessionExpired', handleSessionExpired);

    return () => {
      window.removeEventListener('sessionWarning', handleSessionWarning);
      window.removeEventListener('sessionExpired', handleSessionExpired);
    };
  }, []);

  const handleExtendSession = () => {
    extendSession();
    setShowWarning(false);
  };

  const handleLogout = () => {
    clearSession();
    setShowWarning(false);
  };

  const formatTime = (ms) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="flex items-center gap-2">
          {status.status === 'active' ? (
            <CheckCircle className="w-4 h-4 text-green-600" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-red-600" />
          )}
          
          <Badge 
            variant={status.status === 'active' ? 'default' : 'destructive'}
            className="text-xs"
          >
            {status.status === 'active' ? 'Active' : 'Expired'}
          </Badge>
        </div>

        {status.status === 'active' && (
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Clock className="w-3 h-3" />
            {formatTime(status.remainingTime)}
          </div>
        )}
      </div>

      <SessionWarningDialog
        isOpen={showWarning}
        onExtend={handleExtendSession}
        onLogout={handleLogout}
        remainingTime={status.remainingTime}
      />
    </>
  );
};

const SessionInfo = () => {
  const { sessionData, getSessionStatus, isAuthenticated } = useSessionManager();
  const [status, setStatus] = useState({ status: 'inactive', remainingTime: 0 });

  useEffect(() => {
    if (!isAuthenticated) return;

    const updateStatus = () => {
      setStatus(getSessionStatus());
    };

    updateStatus();
    const interval = setInterval(updateStatus, 5000);

    return () => clearInterval(interval);
  }, [isAuthenticated, getSessionStatus]);

  if (!isAuthenticated) {
    return (
      <Alert>
        <Shield className="w-4 h-4" />
        <AlertDescription>
          No active session. Your data will not be persisted across page refreshes.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <Shield className="w-4 h-4" />
          Session Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-gray-500 dark:text-gray-400">Session ID</div>
            <div className="font-mono text-xs">
              {sessionData.sessionId?.slice(-8) || 'N/A'}
            </div>
          </div>
          
          <div>
            <div className="text-gray-500 dark:text-gray-400">Status</div>
            <Badge variant={status.status === 'active' ? 'default' : 'destructive'}>
              {status.status}
            </Badge>
          </div>
          
          <div>
            <div className="text-gray-500 dark:text-gray-400">Last Activity</div>
            <div className="text-xs">
              {sessionData.lastActivity 
                ? new Date(sessionData.lastActivity).toLocaleTimeString()
                : 'N/A'
              }
            </div>
          </div>
          
          <div>
            <div className="text-gray-500 dark:text-gray-400">Time Remaining</div>
            <div className="text-xs">
              {Math.floor(status.remainingTime / 60000)} minutes
            </div>
          </div>
        </div>

        {sessionData.preferences && Object.keys(sessionData.preferences).length > 0 && (
          <div>
            <div className="text-gray-500 dark:text-gray-400 mb-1">Saved Preferences</div>
            <div className="text-xs bg-gray-50 dark:bg-gray-800 p-2 rounded">
              {Object.keys(sessionData.preferences).length} preferences saved
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export { SessionStatus, SessionInfo, SessionWarningDialog };
export default SessionStatus;