'use client';
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Timer, Play, Pause, AlertCircle } from 'lucide-react';
import { useFocus } from '@/lib/hooks/useFocus';

export const FocusTracker = () => {
  const {
    isTracking,
    metrics,
    startSession,
    endSession,
  } = useFocus();

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Main Focus Card */}
      <Card className="bg-gray-900 w-full">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-white">Focus Session</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Focus Score Circle */}
            <div className="relative flex justify-center">
              <div className="w-48 h-48 rounded-full border-4 border-purple-500 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl font-bold text-white">
                    {metrics.dailyAverage.toFixed(0)}
                  </div>
                  <div className="text-sm text-gray-400">Focus Score</div>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-800 p-4 rounded-lg">
                <div className="text-sm text-gray-400">Interruptions</div>
                <div className="text-2xl font-bold text-white">{metrics.interruptions}</div>
              </div>
              <div className="bg-gray-800 p-4 rounded-lg">
                <div className="text-sm text-gray-400">Flow States</div>
                <div className="text-2xl font-bold text-white">{metrics.flowStates}</div>
              </div>
            </div>

            {/* Timer Controls */}
            <div className="flex justify-center">
              <Button
                className={`w-full max-w-xs ${
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
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="bg-gray-900">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-400">Daily Average</div>
                <div className="text-2xl font-bold text-white">
                  {metrics.dailyAverage.toFixed(1)}
                </div>
              </div>
              <Timer className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-400">Weekly Progress</div>
                <div className="text-2xl font-bold text-white">
                  {metrics.weeklyAverage.toFixed(1)}
                </div>
              </div>
              <AlertCircle className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tips or Feedback */}
      {isTracking && (
        <Card className="bg-gray-900 mt-4">
          <CardContent className="p-4">
            <div className="text-sm text-gray-400">
              Current Activity
              <div className="text-white mt-1 font-medium">
                Stay focused! Take a break every 25 minutes.
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FocusTracker;