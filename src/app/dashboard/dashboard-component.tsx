'use client'
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts';
import { Home, Activity, Settings, BarChart2, Download } from 'lucide-react';

// Sample data - replace with real data in production
const sessionData = [
  { date: '13', value: 1500 },
  { date: '14', value: 1800 },
  { date: '15', value: 2100 },
  { date: '16', value: 1900 },
  { date: '17', value: 2300 },
  { date: '18', value: 2000 },
  { date: '19', value: 2400 },
  { date: '20', value: 2100 },
  { date: '21', value: 2500 },
  { date: '22', value: 2300 },
  { date: '23', value: 2600 },
  { date: '24', value: 2400 },
  { date: '25', value: 2800 },
];

const DashboardComponent = () => {
  return (
    <div className="min-h-screen bg-black p-6">
      <div className="grid grid-cols-12 gap-6">
        {/* Sidebar */}
        <div className="col-span-1 flex flex-col gap-6">
          <div className="flex flex-col items-center gap-6 rounded-xl bg-gray-900 p-4">
            <Home className="h-6 w-6 text-gray-400 hover:text-purple-500 cursor-pointer" />
            <Activity className="h-6 w-6 text-gray-400 hover:text-purple-500 cursor-pointer" />
            <BarChart2 className="h-6 w-6 text-gray-400 hover:text-purple-500 cursor-pointer" />
            <Settings className="h-6 w-6 text-gray-400 hover:text-purple-500 cursor-pointer" />
          </div>
        </div>

        {/* Main Content */}
        <div className="col-span-11 space-y-6">
          {/* Top Stats */}
          <div className="grid grid-cols-4 gap-6">
            <MetricCard title="Total Sessions" value={2100} change={-3} />
            <MetricCard title="Focus Score" value={1228} change={1} />
            <MetricCard title="Flow States" value={6.92} change={21} />
            <MetricCard title="Interruptions" value={2.3} change={15} />
          </div>

          {/* Main Chart */}
          <Card className="bg-gray-900 p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-white">Sessions overview</h3>
              <button className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg">
                <Download className="h-4 w-4" />
                Download CSV
              </button>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sessionData}>
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Tooltip
                    contentStyle={{
                      background: '#1f2937',
                      border: 'none',
                      borderRadius: '8px',
                      color: 'white',
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Bottom Stats */}
          <div className="grid grid-cols-4 gap-6">
            <BrowserCard title="Windows" value={1883} icon="windows" />
            <BrowserCard title="Stack Overflow" value={420} icon="stack" />
            <BrowserCard title="Chrome" value={2010} icon="chrome" />
            <BrowserCard title="Other" value={326} icon="other" />
          </div>
        </div>
      </div>
    </div>
  );
};

const MetricCard = ({ title, value, change }: { title: string, value: number, change: number }) => {
  const isPositive = change > 0;
  return (
    <Card className="bg-gray-900">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-gray-400">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-white">{value}</div>
        <div className={`text-sm ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
          {isPositive ? '+' : ''}{change}%
        </div>
      </CardContent>
    </Card>
  );
};

const BrowserCard = ({ title, value, icon }: { title: string, value: number, icon: string }) => {
  return (
    <Card className="bg-gray-900">
      <CardContent className="flex items-center justify-between p-6">
        <div>
          <h3 className="text-lg font-semibold text-white">{value}</h3>
          <p className="text-sm text-gray-400">{title}</p>
        </div>
        <div className="h-12 w-12 rounded-full bg-gray-800 flex items-center justify-center">
          {/* Replace with actual icons based on the icon prop */}
          <Activity className="h-6 w-6 text-purple-500" />
        </div>
      </CardContent>
    </Card>
  );
};

export default DashboardComponent;