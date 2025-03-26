
import { Clock, TrendingUp } from 'lucide-react';

const DashboardHeader = () => {
  return (
    <div className="flex justify-between items-center">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      <div className="flex space-x-2">
        <button className="btn-secondary">
          <Clock size={16} className="mr-2" />
          Last 30 Days
        </button>
        <button className="btn-primary">
          <TrendingUp size={16} className="mr-2" />
          Generate Report
        </button>
      </div>
    </div>
  );
};

export default DashboardHeader;
