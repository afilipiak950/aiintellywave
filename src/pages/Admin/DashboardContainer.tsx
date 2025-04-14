
import React from 'react';
import DashboardHeader from '@/components/ui/admin/DashboardHeader';
import DashboardStats from '@/components/ui/admin/DashboardStats';
import DashboardCharts from '@/components/ui/admin/DashboardCharts';
import { useAuth } from '@/context/auth';

const DashboardContainer = () => {
  const { user } = useAuth();

  return (
    <div className="container mx-auto py-8 space-y-6">
      <DashboardHeader />
      
      <div className="grid grid-cols-1 gap-6">
        {user && (
          <DashboardStats 
            userCount={1} // Placeholder, replace with actual user count logic
          />
        )}
        
        <DashboardCharts />
      </div>
    </div>
  );
};

export default DashboardContainer;
