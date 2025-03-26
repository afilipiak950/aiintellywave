
import React from 'react';
import LineChart from '../dashboard/LineChart';
import { Users } from 'lucide-react';

interface ProjectDataPoint {
  name: string;
  count: number;
}

interface ManagerDashboardChartsProps {
  projectData: ProjectDataPoint[];
}

const ManagerDashboardCharts = ({ projectData }: ManagerDashboardChartsProps) => {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <h2 className="text-lg font-medium mb-4">Project Activity</h2>
        <div className="h-80">
          <LineChart 
            data={projectData}
            dataKeys={['count']} 
            title="Project Activity"
            subtitle="Monthly project count"
          />
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <h2 className="text-lg font-medium mb-4">Recent Activity</h2>
        <div className="divide-y">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="py-3 flex items-start">
              <span className="bg-blue-100 text-blue-800 p-2 rounded-full mr-3">
                <Users size={16} />
              </span>
              <div>
                <p className="font-medium">New customer added</p>
                <p className="text-sm text-gray-500">2 hours ago</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboardCharts;
