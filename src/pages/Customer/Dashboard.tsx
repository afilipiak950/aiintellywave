
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from '../../hooks/useTranslation';
import { useDashboardData } from '../../hooks/use-dashboard-data';
import LeadDatabaseContainer from '../../components/customer/LeadDatabaseContainer';
import WelcomeSection from '../../components/customer/dashboard/WelcomeSection';
import TileGrid from '../../components/customer/dashboard/TileGrid';
import ProjectsList from '../../components/customer/dashboard/ProjectsList';
import DashboardError from '../../components/customer/dashboard/DashboardError';
import CustomerDashboardCharts from '@/components/ui/customer/DashboardCharts';
import { toast } from '@/hooks/use-toast';

const CustomerDashboard: React.FC = () => {
  const { t } = useTranslation();
  const { dashboardData, handleRefresh, refreshTrigger } = useDashboardData();
  const [errorOccurred, setErrorOccurred] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  
  useEffect(() => {
    try {
      // Seiten-Scroll nach oben zurücksetzen, wenn Komponente gemounted wird
      window.scrollTo(0, 0);
      
      // Dashboard Status Logging
      console.log('Dashboard initialized, error state:', dashboardData.error);
      
      // Fehler-State setzen
      if (dashboardData.error) {
        setErrorOccurred(true);
        setErrorMessage(dashboardData.error);
      } else {
        setErrorOccurred(false);
        setErrorMessage('');
      }
    } catch (error) {
      console.error('Error in dashboard useEffect:', error);
      setErrorOccurred(true);
      setErrorMessage('Unerwarteter Fehler beim Initialisieren des Dashboards');
    }
  }, [dashboardData.error]);
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 }
    }
  };
  
  const handleRetryClick = () => {
    console.log('Manually refreshing dashboard...');
    toast({
      title: "Dashboard wird aktualisiert",
      description: "Daten werden neu geladen...",
    });
    handleRefresh();
  };
  
  // Selbst wenn es einen Dashboard-Daten-Fehler gibt, zeigen wir trotzdem die
  // Projekte an, da sie aus einem separaten Hook geladen werden
  return (
    <LeadDatabaseContainer>
      <motion.div 
        className="space-y-8"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.div variants={itemVariants}>
          <WelcomeSection className="mb-8" />
        </motion.div>
        
        {errorOccurred && (
          <motion.div variants={itemVariants}>
            <DashboardError 
              error={errorMessage} 
              onRetry={handleRetryClick} 
            />
          </motion.div>
        )}
        
        <motion.div variants={itemVariants} className="mb-6">
          <CustomerDashboardCharts />
        </motion.div>
        
        <motion.div variants={itemVariants}>
          <TileGrid />
        </motion.div>
        
        <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-1 gap-6">
          <div>
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">{t('projects')}</h2>
                <button 
                  onClick={handleRetryClick}
                  className="text-xs text-blue-600 hover:text-blue-800 flex items-center"
                >
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Aktualisieren
                </button>
              </div>
              <ProjectsList />
            </div>
          </div>
        </motion.div>
        
        <motion.div variants={itemVariants} className="text-sm text-gray-500 text-right">
          Last updated: {dashboardData.lastUpdated.toLocaleTimeString()}
        </motion.div>
      </motion.div>
    </LeadDatabaseContainer>
  );
};

export default CustomerDashboard;
