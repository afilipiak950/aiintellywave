
import React from 'react';
import WelcomeSection from '../../components/customer/dashboard/WelcomeSection';
import TileGrid from '../../components/customer/dashboard/TileGrid';
import ProjectsList from '../../components/customer/dashboard/ProjectsList';
import CustomerDashboardCharts from '../../components/ui/customer/DashboardCharts';

const CustomerDashboard: React.FC = () => {
  return (
    <div className="space-y-8">
      <WelcomeSection />
      <TileGrid />
      
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Ihre Projekte</h2>
        <ProjectsList />
      </div>

      {/* Add Customer-specific Dashboard Charts */}
      <CustomerDashboardCharts />
    </div>
  );
};

export default CustomerDashboard;
