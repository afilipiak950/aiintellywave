
import { Clock, TrendingUp, UserPlus, FolderPlus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useProjects } from '@/hooks/use-projects';
import { useCustomers } from '@/hooks/use-customers';

const DashboardHeader = () => {
  const { fetchProjects } = useProjects();
  const { fetchCustomers } = useCustomers();

  const handleGenerateReport = () => {
    // Refresh data when generating report
    fetchProjects();
    fetchCustomers();
  };

  return (
    <div className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:items-center">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      <div className="flex flex-wrap gap-2">
        <button className="btn-secondary">
          <Clock size={16} className="mr-2" />
          Last 30 Days
        </button>
        <Link to="/admin/customers/new" className="btn-outline inline-flex items-center">
          <UserPlus size={16} className="mr-2" />
          New Customer
        </Link>
        <Link to="/admin/projects/new" className="btn-outline inline-flex items-center">
          <FolderPlus size={16} className="mr-2" />
          New Project
        </Link>
        <button className="btn-primary" onClick={handleGenerateReport}>
          <TrendingUp size={16} className="mr-2" />
          Generate Report
        </button>
      </div>
    </div>
  );
};

export default DashboardHeader;
