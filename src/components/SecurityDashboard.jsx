import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, 
  Lock, 
  Eye, 
  EyeOff,
  AlertTriangle,
  CheckCircle,
  Clock,
  Key,
  Fingerprint,
  Activity
} from 'lucide-react';
import { useEnhancedSession } from './EnhancedSessionProvider';

const SecurityDashboard = ({ className }) => {
  const { 
    sessionData, 
    getSessionStatus, 
    validateSession,
    extendSession,
    clearSession 
  } = useEnhancedSession();
  
  const [showDetails, setShowDetails] = useState(false);
  const [securityMetrics, setSecurityMetrics] = useState({
    sessionAge: 0,
    activityLevel: 'normal',
    securityScore: 100,
    threats: []
  });

  // Update security metrics
  useEffect(() => {
    if (!sessionData.isAuthenticated) return;

    const updateMetrics = () => {
      const now = Date.now();
      const sessionAge = now - (sessionData.createdAt || now);
      const timeSinceActivity = now - (sessionData.lastActivity || now);
      
      let activityLevel = 'normal';
      if (timeSinceActivity > 10 * 60 * 1000) activityLevel = 'low';
      if (timeSinceActivity > 20 * 60 * 1000) activityLevel = 'very_low';
      if (timeSinceActivity < 2 * 60 * 1000) activityLevel = 'high';

      let securityScore = 100;
      const threats = [];

      // Reduce score for old sessions
      if (sessionAge > 4 * 60 * 60 * 1000) { // 4 hours
        securityScore -= 20;
        threats.push('Long-running session detected');
      }

      // Reduce score for inactive sessions
      if (timeSinceActivity > 15 * 60 * 1000) { // 15 minutes
        securityScore -= 15;
        threats.push('Extended inactivity detected');
      }

      // Check for missing security features
      if (!sessionData.csrfToken) {
        securityScore -= 25;
        threats.push('Missing CSRF protection');
      }

      if (!sessionData.fingerprint) {
        securityScore -= 10;
        threats.push('No browser fingerprint');
      }

      setSecurityMetrics({
        sessionAge,
        activityLevel,
        securityScore: Math.max(0, securityScore),
        threats
      });
    };

    updateMetrics();
    const interval = setInterval(updateMetrics, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [sessionData]);

  const formatDuration = (ms) => {
    const minutes = Math.floor(ms / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    return `${minutes}m`;
  };

  const getSecurityScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getActivityLevelBadge = (level) => {
    const variants = {
      high: { variant: 'default', color: 'bg-green-100 text-green-800' },
      normal: { variant: 'secondary', color: 'bg-blue-100 text-blue-800' },
      low: { variant: 'outline', color: 'bg-yellow-100 text-yellow-800' },
      very_low: { variant: 'destructive', color: 'bg-red-100 text-red-800' }
    };

    const config = variants[level] || variants.normal;
    
    return (
      <Badge variant={config.variant} className={`text-xs ${config.color}`}>
        {level.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  const status = getSessionStatus();

  if (!sessionData.isAuthenticated) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center">
          <Shield className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-500">No active session to monitor</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Security Dashboard
          </CardTitle>
          <div className="flex items-center gap-2">
            <div className={`text-2xl font-bold ${getSecurityScoreColor(securityMetrics.securityScore)}`}>
              {securityMetrics.securityScore}%
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDetails(!showDetails)}
            >
              {showDetails ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Security Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Clock className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium">Session Age</span>
            </div>
            <div className="text-lg font-bold text-blue-600">
              {formatDuration(securityMetrics.sessionAge)}
            </div>
          </div>

          <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Activity className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium">Activity</span>
            </div>
            <div className="flex justify-center">
              {getActivityLevelBadge(securityMetrics.activityLevel)}
            </div>
          </div>

          <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Key className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium">CSRF</span>
            </div>
            <div className="flex justify-center">
              {sessionData.csrfToken ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-red-600" />
              )}
            </div>
          </div>

          <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Fingerprint className="w-4 h-4 text-orange-600" />
              <span className="text-sm font-medium">Fingerprint</span>
            </div>
            <div className="flex justify-center">
              {sessionData.fingerprint ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-red-600" />
              )}
            </div>
          </div>
        </div>

        {/* Security Threats */}
        {securityMetrics.threats.length > 0 && (
          <Alert className="border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20">
            <AlertTriangle className="w-4 h-4 text-yellow-600" />
            <AlertDescription>
              <div className="space-y-2">
                <div className="font-medium text-yellow-800 dark:text-yellow-200">
                  Security Warnings ({securityMetrics.threats.length})
                </div>
                <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                  {securityMetrics.threats.map((threat, index) => (
                    <li key={index}>• {threat}</li>
                  ))}
                </ul>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Session Details */}
        {showDetails && (
          <div className="space-y-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <h4 className="font-medium flex items-center gap-2">
              <Lock className="w-4 h-4" />
              Session Details
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-gray-500 dark:text-gray-400">Session ID:</span>
                <div className="font-mono text-xs break-all">
                  {sessionData.sessionId?.slice(-16) || 'N/A'}
                </div>
              </div>
              
              <div>
                <span className="text-gray-500 dark:text-gray-400">Status:</span>
                <div>
                  <Badge variant={status.isValid ? 'default' : 'destructive'}>
                    {status.status}
                  </Badge>
                </div>
              </div>
              
              <div>
                <span className="text-gray-500 dark:text-gray-400">Last Activity:</span>
                <div className="text-xs">
                  {sessionData.lastActivity 
                    ? new Date(sessionData.lastActivity).toLocaleString()
                    : 'N/A'
                  }
                </div>
              </div>
              
              <div>
                <span className="text-gray-500 dark:text-gray-400">Expires In:</span>
                <div className="text-xs">
                  {Math.floor(status.remainingTime / 60000)} minutes
                </div>
              </div>

              <div>
                <span className="text-gray-500 dark:text-gray-400">Fingerprint:</span>
                <div className="font-mono text-xs">
                  {sessionData.fingerprint?.slice(0, 8) || 'N/A'}...
                </div>
              </div>

              <div>
                <span className="text-gray-500 dark:text-gray-400">CSRF Token:</span>
                <div className="font-mono text-xs">
                  {sessionData.csrfToken ? 'Protected' : 'Missing'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Security Actions */}
        <div className="flex gap-2 pt-2 border-t">
          <Button
            size="sm"
            onClick={extendSession}
            disabled={!status.isValid}
          >
            Extend Session
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            onClick={validateSession}
          >
            Validate Session
          </Button>
          
          <Button
            size="sm"
            variant="destructive"
            onClick={clearSession}
          >
            Clear Session
          </Button>
        </div>

        {/* Security Tips */}
        <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
          <div className="font-medium">Security Tips:</div>
          <div>• Keep your session active by interacting with the application</div>
          <div>• Log out when finished to clear sensitive data</div>
          <div>• Avoid using public computers for trading</div>
          <div>• Report any suspicious activity immediately</div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SecurityDashboard;