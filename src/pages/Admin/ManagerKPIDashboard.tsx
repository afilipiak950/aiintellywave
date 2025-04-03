
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const dummyKPIData = [
  { name: 'Jan', performance: 65 },
  { name: 'Feb', performance: 59 },
  { name: 'Mar', performance: 80 },
  { name: 'Apr', performance: 81 },
  { name: 'May', performance: 56 },
  { name: 'Jun', performance: 55 },
];

const ManagerKPIDashboard: React.FC = () => {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Manager KPI Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Performance Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dummyKPIData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="performance" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Key Metrics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span>Total Projects</span>
              <strong>47</strong>
            </div>
            <div className="flex justify-between">
              <span>Completed Projects</span>
              <strong>35</strong>
            </div>
            <div className="flex justify-between">
              <span>Active Projects</span>
              <strong>12</strong>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenue Projection</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">$452,000</p>
              <p className="text-sm text-muted-foreground">Projected Annual Revenue</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ManagerKPIDashboard;

