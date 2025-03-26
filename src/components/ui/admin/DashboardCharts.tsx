
import CompanyUsersChart from '../dashboard/CompanyUsersChart';
import ProjectDistributionChart from '../dashboard/ProjectDistributionChart';
import AdminOverview from '../dashboard/AdminOverview';

const DashboardCharts = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Company Users Distribution Chart */}
      <CompanyUsersChart />
      
      {/* Project Distribution */}
      <ProjectDistributionChart />
      
      {/* Dashboard Overview section with gradient background */}
      <AdminOverview />
    </div>
  );
};

export default DashboardCharts;
