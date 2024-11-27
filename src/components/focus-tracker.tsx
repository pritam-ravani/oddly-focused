// src/components/focus/focus-tracker.tsx
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Timer, Pause, Play, AlertCircle } from 'lucide-react';

interface FocusSession {
  startTime: number;
  endTime?: number;
  focusScore: number;
  interruptions: number;
  flowStates: number;
  applicationData: Array<{
    name: string;
    timeSpent: number;
    category: 'productive' | 'neutral' | 'distracting';
  }>;
}

interface FocusMetrics {
  currentFocusScore: number;
  interruptions: number;
  flowStateCount: number;
  activeApplication: string;
}

export const FocusTracker: React.FC = () => {
  const [isTracking, setIsTracking] = useState(false);
  const [currentSession, setCurrentSession] = useState<FocusSession | null>(null);
  const [metrics, setMetrics] = useState<FocusMetrics>({
    currentFocusScore: 0,
    interruptions: 0,
    flowStateCount: 0,
    activeApplication: '',
  });

  // Refs for tracking
  const activityTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());
  const flowStateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize IndexedDB
  useEffect(() => {
    const initDB = async () => {
      const request = indexedDB.open('OddlyFocusDB', 1);
      
      request.onerror = (event) => {
        console.error('Database error:', event);
      };

      request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        if (!db.objectStoreNames.contains('sessions')) {
          db.createObjectStore('sessions', { keyPath: 'startTime' });
        }
      };
    };

    initDB();
  }, []);

  // Activity monitoring
  const detectUserActivity = useCallback(() => {
    if (!isTracking) return;

    const now = Date.now();
    const timeSinceLastActivity = now - lastActivityRef.current;

    // Update focus score based on activity patterns
    setMetrics(prev => {
      let newFocusScore = prev.currentFocusScore;
      
      if (timeSinceLastActivity < 5000) {
        // Continuous activity increases focus score
        newFocusScore = Math.min(100, newFocusScore + 1);
      } else if (timeSinceLastActivity > 30000) {
        // Long periods of inactivity decrease focus score
        newFocusScore = Math.max(0, newFocusScore - 5);
      }

      return { ...prev, currentFocusScore: newFocusScore };
    });

    lastActivityRef.current = now;

    // Reset activity timeout
    if (activityTimeoutRef.current) {
      clearTimeout(activityTimeoutRef.current);
    }
    
    activityTimeoutRef.current = setTimeout(() => {
      detectInactivity();
    }, 30000); // 30 seconds of inactivity threshold
  }, [isTracking]);

  // Inactivity detection
  const detectInactivity = useCallback(() => {
    if (!isTracking) return;

    setMetrics(prev => ({
      ...prev,
      interruptions: prev.interruptions + 1,
      currentFocusScore: Math.max(0, prev.currentFocusScore - 10),
    }));
  }, [isTracking]);

  // Flow state detection
  const checkFlowState = useCallback(() => {
    if (!isTracking) return;

    const FLOW_STATE_THRESHOLD = 85; // Focus score threshold for flow state
    const FLOW_STATE_DURATION = 900000; // 15 minutes

    if (metrics.currentFocusScore >= FLOW_STATE_THRESHOLD) {
      flowStateTimeoutRef.current = setTimeout(() => {
        setMetrics(prev => ({
          ...prev,
          flowStateCount: prev.flowStateCount + 1,
        }));
      }, FLOW_STATE_DURATION);
    } else if (flowStateTimeoutRef.current) {
      clearTimeout(flowStateTimeoutRef.current);
    }
  }, [isTracking, metrics.currentFocusScore]);

  // Application tracking
  const trackActiveApplication = useCallback(async () => {
    if (!isTracking) return;

    // In a real implementation, this would use system APIs or browser APIs
    // to detect the active application/tab
    try {
      // Example of getting browser tab visibility
      const isVisible = !document.hidden;
      
      if (!isVisible) {
        setMetrics(prev => ({
          ...prev,
          interruptions: prev.interruptions + 1,
        }));
      }

      // Track active browser tab
      if ('getActiveTab' in window) {
        // @ts-ignore - This is a hypothetical API
        const activeTab = await window.getActiveTab();
        setMetrics(prev => ({
          ...prev,
          activeApplication: activeTab.title,
        }));
      }
    } catch (error) {
      console.error('Error tracking active application:', error);
    }
  }, [isTracking]);

  // Start session
  const startSession = useCallback(() => {
    setIsTracking(true);
    setCurrentSession({
      startTime: Date.now(),
      focusScore: 0,
      interruptions: 0,
      flowStates: 0,
      applicationData: [],
    });
    
    // Start all tracking mechanisms
    detectUserActivity();
    trackActiveApplication();
    
    // Set up periodic checks
    const intervalId = setInterval(() => {
      detectUserActivity();
      trackActiveApplication();
      checkFlowState();
    }, 1000);

    return () => {
      clearInterval(intervalId);
      if (activityTimeoutRef.current) clearTimeout(activityTimeoutRef.current);
      if (flowStateTimeoutRef.current) clearTimeout(flowStateTimeoutRef.current);
    };
  }, [detectUserActivity, trackActiveApplication, checkFlowState]);

  // End session
  const endSession = useCallback(async () => {
    if (!currentSession) return;

    const sessionData: FocusSession = {
      ...currentSession,
      endTime: Date.now(),
      focusScore: metrics.currentFocusScore,
      interruptions: metrics.interruptions,
      flowStates: metrics.flowStateCount,
      applicationData: [], // Would be populated with actual application data
    };

    // Save to IndexedDB
    try {
      const request = indexedDB.open('OddlyFocusDB', 1);
      
      request.onsuccess = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        const transaction = db.transaction(['sessions'], 'readwrite');
        const store = transaction.objectStore('sessions');
        
        store.add(sessionData);
      };

      // Optional: Sync with cloud if enabled
      if (process.env.NEXT_PUBLIC_ENABLE_CLOUD_SYNC === 'true') {
        await syncWithCloud(sessionData);
      }
    } catch (error) {
      console.error('Error saving session:', error);
    }

    setIsTracking(false);
    setCurrentSession(null);
    setMetrics({
      currentFocusScore: 0,
      interruptions: 0,
      flowStateCount: 0,
      activeApplication: '',
    });
  }, [currentSession, metrics]);

  // Cloud sync function
  const syncWithCloud = async (sessionData: FocusSession) => {
    try {
      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sessionData),
      });

      if (!response.ok) {
        throw new Error('Failed to sync with cloud');
      }
    } catch (error) {
      console.error('Error syncing with cloud:', error);
      // Store failed sync attempts for retry
      localStorage.setItem('failedSync', JSON.stringify(sessionData));
    }
  };

  // Event listeners
  useEffect(() => {
    window.addEventListener('mousemove', detectUserActivity);
    window.addEventListener('keydown', detectUserActivity);
    window.addEventListener('visibilitychange', trackActiveApplication);

    return () => {
      window.removeEventListener('mousemove', detectUserActivity);
      window.removeEventListener('keydown', detectUserActivity);
      window.removeEventListener('visibilitychange', trackActiveApplication);
    };
  }, [detectUserActivity, trackActiveApplication]);

  return (
    <Card className="w-full max-w-md bg-gray-900">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-white">Focus Session</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="text-3xl font-bold text-white">
              {metrics.currentFocusScore.toFixed(0)}
            </div>
            <Timer className="h-6 w-6 text-purple-500" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="text-sm text-gray-400">
              Interruptions
              <div className="text-lg font-semibold text-white">
                {metrics.interruptions}
              </div>
            </div>
            <div className="text-sm text-gray-400">
              Flow States
              <div className="text-lg font-semibold text-white">
                {metrics.flowStateCount}
              </div>
            </div>
          </div>

          {metrics.activeApplication && (
            <div className="text-sm text-gray-400">
              Current Activity
              <div className="text-lg font-semibold text-white">
                {metrics.activeApplication}
              </div>
            </div>
          )}

          <Button
            className={`w-full ${
              isTracking 
                ? 'bg-red-500 hover:bg-red-600' 
                : 'bg-purple-500 hover:bg-purple-600'
            }`}
            onClick={isTracking ? endSession : startSession}
          >
            {isTracking ? (
              <>
                <Pause className="h-4 w-4 mr-2" />
                End Session
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Start Session
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};