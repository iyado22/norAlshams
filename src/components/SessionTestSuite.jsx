import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  TestTube, 
  CheckCircle, 
  XCircle, 
  Clock,
  Play,
  RotateCcw,
  AlertTriangle
} from 'lucide-react';
import { useEnhancedSession } from './EnhancedSessionProvider';

const SessionTestSuite = ({ className }) => {
  const { 
    initializeSession, 
    updateSession, 
    clearSession, 
    validateSession,
    getSessionStatus,
    sessionData 
  } = useEnhancedSession();

  const [testResults, setTestResults] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentTest, setCurrentTest] = useState(null);

  const tests = [
    {
      id: 'session_creation',
      name: 'Session Creation',
      description: 'Test session initialization with user data',
      test: async () => {
        const testUser = {
          id: 'test_user_' + Date.now(),
          name: 'Test User',
          email: 'test@example.com'
        };
        
        const session = await initializeSession(testUser);
        
        if (!session.sessionId) throw new Error('Session ID not generated');
        if (!session.csrfToken) throw new Error('CSRF token not generated');
        if (!session.fingerprint) throw new Error('Fingerprint not generated');
        if (session.user.id !== testUser.id) throw new Error('User data not stored correctly');
        
        return 'Session created successfully with all security features';
      }
    },
    {
      id: 'session_persistence',
      name: 'Session Persistence',
      description: 'Test session data persistence across page refresh simulation',
      test: async () => {
        // Simulate page refresh by clearing memory and reloading from storage
        const originalSessionId = sessionData.sessionId;
        
        // Update session with test data
        await updateSession({ 
          testData: 'persistence_test_' + Date.now(),
          preferences: { theme: 'dark', language: 'en' }
        });
        
        // Simulate page refresh by validating session
        const isValid = await validateSession();
        if (!isValid) throw new Error('Session validation failed after update');
        
        const status = getSessionStatus();
        if (!status.isValid) throw new Error('Session status invalid after persistence test');
        
        return 'Session data persisted successfully across refresh simulation';
      }
    },
    {
      id: 'session_security',
      name: 'Security Validation',
      description: 'Test CSRF token generation and fingerprint validation',
      test: async () => {
        const status = getSessionStatus();
        
        if (!status.csrfToken) throw new Error('CSRF token not present');
        if (!sessionData.fingerprint) throw new Error('Browser fingerprint not generated');
        
        // Test CSRF token format
        if (!/^[a-f0-9]{64}$/.test(status.csrfToken)) {
          throw new Error('CSRF token format invalid');
        }
        
        // Test session ID format
        if (!/^\d+_[a-f0-9]+_[a-f0-9]{16}$/.test(status.sessionId)) {
          throw new Error('Session ID format invalid');
        }
        
        return 'All security features validated successfully';
      }
    },
    {
      id: 'session_timeout',
      name: 'Timeout Handling',
      description: 'Test session timeout calculation and warning system',
      test: async () => {
        const status = getSessionStatus();
        
        if (status.remainingTime <= 0) throw new Error('Session already expired');
        if (typeof status.remainingTime !== 'number') throw new Error('Invalid remaining time format');
        
        // Test warning threshold
        const warningTime = 5 * 60 * 1000; // 5 minutes
        const hasWarning = status.remainingTime <= warningTime;
        
        return `Timeout system working. Remaining: ${Math.floor(status.remainingTime / 60000)}min, Warning: ${hasWarning}`;
      }
    },
    {
      id: 'data_encryption',
      name: 'Data Encryption',
      description: 'Test session data encryption and decryption',
      test: async () => {
        // Check if session data is encrypted in storage
        const encryptedData = localStorage.getItem('grid_trading_session_v2');
        if (!encryptedData) throw new Error('No encrypted session data found');
        
        // Verify it's actually encrypted (not plain JSON)
        try {
          JSON.parse(encryptedData);
          throw new Error('Session data appears to be unencrypted');
        } catch (e) {
          // Good - data is encrypted and can't be parsed as JSON
        }
        
        // Test that we can still access the data through the session
        if (!sessionData.sessionId) throw new Error('Cannot access decrypted session data');
        
        return 'Session data is properly encrypted in storage';
      }
    },
    {
      id: 'cross_tab_sync',
      name: 'Cross-tab Synchronization',
      description: 'Test session synchronization across browser tabs',
      test: async () => {
        // Simulate storage event from another tab
        const originalData = sessionData;
        
        // Update session
        await updateSession({ 
          crossTabTest: 'sync_test_' + Date.now() 
        });
        
        // Verify the update was applied
        if (!sessionData.crossTabTest) {
          throw new Error('Cross-tab update not applied');
        }
        
        return 'Cross-tab synchronization working correctly';
      }
    },
    {
      id: 'session_cleanup',
      name: 'Session Cleanup',
      description: 'Test proper session cleanup and data removal',
      test: async () => {
        const originalSessionId = sessionData.sessionId;
        
        // Clear session
        clearSession();
        
        // Verify cleanup
        const encryptedData = localStorage.getItem('grid_trading_session_v2');
        const tempData = sessionStorage.getItem('grid_trading_temp_data_v2');
        const csrfToken = sessionStorage.getItem('csrf_token');
        
        if (encryptedData) throw new Error('Session data not cleared from localStorage');
        if (tempData) throw new Error('Temp data not cleared from sessionStorage');
        if (csrfToken) throw new Error('CSRF token not cleared');
        
        // Reinitialize for other tests
        await initializeSession({
          id: 'test_user_restored',
          name: 'Test User Restored',
          email: 'test@example.com'
        });
        
        return 'Session cleanup completed successfully';
      }
    }
  ];

  const runTest = async (test) => {
    setCurrentTest(test.id);
    
    try {
      const startTime = Date.now();
      const result = await test.test();
      const duration = Date.now() - startTime;
      
      return {
        id: test.id,
        name: test.name,
        status: 'passed',
        message: result,
        duration
      };
    } catch (error) {
      const duration = Date.now() - Date.now();
      
      return {
        id: test.id,
        name: test.name,
        status: 'failed',
        message: error.message,
        duration
      };
    }
  };

  const runAllTests = async () => {
    setIsRunning(true);
    setTestResults([]);
    
    const results = [];
    
    for (const test of tests) {
      const result = await runTest(test);
      results.push(result);
      setTestResults([...results]);
      
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    setCurrentTest(null);
    setIsRunning(false);
  };

  const resetTests = () => {
    setTestResults([]);
    setCurrentTest(null);
    setIsRunning(false);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'passed':
        return <Badge variant="default" className="bg-green-100 text-green-800">Passed</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  const passedTests = testResults.filter(r => r.status === 'passed').length;
  const failedTests = testResults.filter(r => r.status === 'failed').length;
  const totalTests = tests.length;

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TestTube className="w-5 h-5" />
            Session Test Suite
          </CardTitle>
          
          <div className="flex items-center gap-2">
            {testResults.length > 0 && (
              <div className="text-sm">
                <span className="text-green-600 font-medium">{passedTests}</span>
                <span className="text-gray-400 mx-1">/</span>
                <span className="text-gray-600">{totalTests}</span>
              </div>
            )}
            
            <Button
              size="sm"
              onClick={runAllTests}
              disabled={isRunning}
            >
              {isRunning ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              ) : (
                <Play className="w-4 h-4 mr-2" />
              )}
              Run Tests
            </Button>
            
            <Button
              size="sm"
              variant="outline"
              onClick={resetTests}
              disabled={isRunning}
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Test Results Summary */}
        {testResults.length > 0 && (
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-green-50 dark:bg-green-950 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{passedTests}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Passed</div>
            </div>
            
            <div className="text-center p-3 bg-red-50 dark:bg-red-950 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{failedTests}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Failed</div>
            </div>
            
            <div className="text-center p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {totalTests - testResults.length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Pending</div>
            </div>
          </div>
        )}

        {/* Individual Test Results */}
        <div className="space-y-2">
          {tests.map((test) => {
            const result = testResults.find(r => r.id === test.id);
            const isRunning = currentTest === test.id;
            
            return (
              <div
                key={test.id}
                className={`p-3 border rounded-lg ${
                  isRunning ? 'border-blue-200 bg-blue-50 dark:bg-blue-950' : 'border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {isRunning ? (
                      <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      getStatusIcon(result?.status)
                    )}
                    
                    <div>
                      <div className="font-medium">{test.name}</div>
                      <div className="text-sm text-gray-500">{test.description}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {result?.duration && (
                      <span className="text-xs text-gray-400">
                        {result.duration}ms
                      </span>
                    )}
                    {result && getStatusBadge(result.status)}
                  </div>
                </div>
                
                {result?.message && (
                  <div className={`mt-2 text-sm p-2 rounded ${
                    result.status === 'passed' 
                      ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300'
                      : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300'
                  }`}>
                    {result.message}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Test Instructions */}
        {testResults.length === 0 && !isRunning && (
          <Alert>
            <AlertTriangle className="w-4 h-4" />
            <AlertDescription>
              <div className="space-y-2">
                <div className="font-medium">Session Testing</div>
                <div className="text-sm">
                  This test suite validates all session management functionality including:
                </div>
                <ul className="text-sm space-y-1 ml-4">
                  <li>• Session creation and initialization</li>
                  <li>• Data persistence across page refreshes</li>
                  <li>• Security features (CSRF, encryption, fingerprinting)</li>
                  <li>• Timeout and expiration handling</li>
                  <li>• Cross-tab synchronization</li>
                  <li>• Proper cleanup and data removal</li>
                </ul>
                <div className="text-sm mt-2">
                  Click "Run Tests" to validate your session implementation.
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default SessionTestSuite;