// src/lib/hooks/useFocus.ts
// 'use client';
import { useState, useEffect, useCallback } from 'react';
import { focusSessionsDB, FocusSession } from '@/lib/db/focus-sessions';

interface UseFocusReturn {
  isTracking: boolean;
  currentSession: FocusSession | null;
  metrics: {
    dailyAverage: number;
    weeklyAverage: number;
    monthlyAverage: number;
    flowStates: number;
    interruptions: number;
  };
  startSession: () => void;
  endSession: () => void;
  getSessionHistory: (days: number) => Promise<FocusSession[]>;
}

export const useFocus = (): UseFocusReturn => {
  const [isTracking, setIsTracking] = useState(false);
  const [currentSession, setCurrentSession] = useState<FocusSession | null>(null);
  const [metrics, setMetrics] = useState({
    dailyAverage: 0,
    weeklyAverage: 0,
    monthlyAverage: 0,
    flowStates: 0,
    interruptions: 0,
  });

  // Load initial metrics
  useEffect(() => {
    const loadMetrics = async () => {
      try {
        const [dailyStats, weeklyStats, monthlyStats] = await Promise.all([
          focusSessionsDB.getAverages(1),
          focusSessionsDB.getAverages(7),
          focusSessionsDB.getAverages(30),
        ]);

        setMetrics({
          dailyAverage: dailyStats.averageFocusScore,
          weeklyAverage: weeklyStats.averageFocusScore,
          monthlyAverage: monthlyStats.averageFocusScore,
          flowStates: dailyStats.averageFlowStates,
          interruptions: dailyStats.averageInterruptions,
        });
      } catch (error) {
        console.error('Error loading metrics:', error);
      }
    };

    loadMetrics();
  }, []);

  // Start a new focus session
  const startSession = useCallback(() => {
    const newSession: FocusSession = {
      startTime: Date.now(),
      focusScore: 0,
      interruptions: 0,
      flowStates: 0,
      applicationData: [],
    };

    setCurrentSession(newSession);
    setIsTracking(true);
  }, []);

  // End the current session
  const endSession = useCallback(async () => {
    if (!currentSession) return;

    const endTime = Date.now();
    const completedSession: FocusSession = {
      ...currentSession,
      endTime,
    };

    try {
      await focusSessionsDB.saveSession(completedSession);
      
      // Update metrics
      const newMetrics = await focusSessionsDB.getAverages(1);
      setMetrics(prev => ({
        ...prev,
        dailyAverage: newMetrics.averageFocusScore,
        flowStates: newMetrics.averageFlowStates,
        interruptions: newMetrics.averageInterruptions,
      }));
    } catch (error) {
      console.error('Error saving session:', error);
    }

    setCurrentSession(null);
    setIsTracking(false);
  }, [currentSession]);

  // Get session history
  const getSessionHistory = useCallback(async (days: number) => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    try {
      return await focusSessionsDB.getSessions(startDate, endDate);
    } catch (error) {
      console.error('Error fetching session history:', error);
      return [];
    }
  }, []);

  return {
    isTracking,
    currentSession,
    metrics,
    startSession,
    endSession,
    getSessionHistory,
  };
};

// src/lib/hooks/useFlowState.ts
export const useFlowState = () => {
  const [isInFlowState, setIsInFlowState] = useState(false);
  const [flowStateDuration, setFlowStateDuration] = useState(0);
  const [flowStateStart, setFlowStateStart] = useState<number | null>(null);

  const FLOW_STATE_THRESHOLD = 85; // Focus score threshold
  const MIN_FLOW_DURATION = 900000; // 15 minutes in milliseconds

  const checkFlowState = useCallback((focusScore: number) => {
    if (focusScore >= FLOW_STATE_THRESHOLD && !isInFlowState) {
      setIsInFlowState(true);
      setFlowStateStart(Date.now());
    } else if (focusScore < FLOW_STATE_THRESHOLD && isInFlowState) {
      setIsInFlowState(false);
      if (flowStateStart) {
        const duration = Date.now() - flowStateStart;
        if (duration >= MIN_FLOW_DURATION) {
          setFlowStateDuration(prev => prev + duration);
        }
      }
      setFlowStateStart(null);
    }
  }, [isInFlowState, flowStateStart]);

  return {
    isInFlowState,
    flowStateDuration,
    checkFlowState,
  };
};

// src/lib/hooks/useActivityTracking.ts
export const useActivityTracking = (onInterruption: () => void) => {
  const [lastActivity, setLastActivity] = useState<number>(Date.now());
  const [isActive, setIsActive] = useState(true);

  const INACTIVITY_THRESHOLD = 300000; // 5 minutes in milliseconds

  const handleActivity = useCallback(() => {
    const now = Date.now();
    const timeSinceLastActivity = now - lastActivity;

    if (timeSinceLastActivity > INACTIVITY_THRESHOLD && !isActive) {
      onInterruption();
    }

    setLastActivity(now);
    setIsActive(true);
  }, [lastActivity, isActive, onInterruption]);

  useEffect(() => {
    const events = ['mousemove', 'keydown', 'mousedown', 'touchstart'];
    
    events.forEach(event => {
      window.addEventListener(event, handleActivity);
    });

    const checkInactivity = setInterval(() => {
      const timeSinceLastActivity = Date.now() - lastActivity;
      if (timeSinceLastActivity > INACTIVITY_THRESHOLD && isActive) {
        setIsActive(false);
        onInterruption();
      }
    }, 60000); // Check every minute

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
      clearInterval(checkInactivity);
    };
  }, [handleActivity, lastActivity, isActive, onInterruption]);

  return {
    isActive,
    lastActivity,
  };
};