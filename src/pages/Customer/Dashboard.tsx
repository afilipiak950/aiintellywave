
import React from 'react';
import WelcomeSection from '../../components/customer/dashboard/WelcomeSection';
import TileGrid from '../../components/customer/dashboard/TileGrid';
import ProjectsList from '../../components/customer/dashboard/ProjectsList';
import { useTranslation } from '../../hooks/useTranslation';

const CustomerDashboard: React.FC = () => {
  const { t } = useTranslation();
  
  return (
    <div className="space-y-8">
      <WelcomeSection />
      <TileGrid />
      
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <h2 className="text-xl font-semibold mb-4">{t('projects')}</h2>
        <ProjectsList />
      </div>
    </div>
  );
};

export default CustomerDashboard;
