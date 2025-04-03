import React, { useState, useEffect, useCallback, useRef } from 'react';
import WelcomeSection from '../../components/customer/dashboard/WelcomeSection';
import TileGrid from '../../components/customer/dashboard/TileGrid';
import ProjectsList from '../../components/customer/dashboard/ProjectsList';
import { useTranslation } from '../../hooks/useTranslation';
import StatCard from '../../components/ui/dashboard/StatCard';
import { Users, ChartPieIcon, Activity, Wallet } from 'lucide-react';
import { motion } from 'framer-motion';
import LeadDatabaseContainer from '../../components/customer/LeadDatabaseContainer';
import { useKpiMetrics } from '../../hooks/use-kpi-metrics';
import { toast } from '../../hooks/use-toast';
import { useProjects } from '../../hooks/use-projects';

const CustomerDashboard: React.FC = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [leadsCount, setLeadsCount] = useState(0);
  const [activeProjects, setActiveProjects] = useState(0);
  const { metrics, fetchMetrics, calculateGrowth } = useKpiMetrics();
  const { projects } = useProjects();
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  
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

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      await fetchMetrics(['conversion_rate', 'booking_candidates']);
      
      setLeadsCount(0);
      setActiveProjects(0);
      setLastUpdated(new Date());
      
    } catch (error: any) {
      console.error('Error loading dashboard data:', error);
      setError('Failed to load dashboard data. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [fetchMetrics]);
  
  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);
  
  const handleRefresh = () => {
    loadDashboardData();
  };
  
  const formatKpiValue = useCallback((metricName: string, defaultValue: string) => {
    if (loading) return "...";
    return "0";
  }, [loading]);
  
  if (error) {
    return (
      <LeadDatabaseContainer>
        <div className="bg-red-50 border border-red-200 rounded-md p-6 text-center">
          <h2 className="text-xl font-semibold text-red-700 mb-3">Dashboard Error</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={handleRefresh}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </LeadDatabaseContainer>
    );
  }
  
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
        
        <motion.div variants={itemVariants}>
          <div className="flex justify-between mb-3 items-center">
            <h2 className="text-xl font-semibold">{t('statistics')}</h2>
            <button 
              onClick={handleRefresh}
              disabled={loading}
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
            >
              {loading ? 'Refreshing...' : 'Refresh Data'}
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard 
              title="Total Leads"
              value="0"
              icon={<Users size={20} />}
              change={{ value: "0", isPositive: true }}
            />
            <StatCard 
              title="Active Projects"
              value="0"
              icon={<ChartPieIcon size={20} />}
              change={{ value: "0", isPositive: true }}
            />
            <StatCard 
              title="Conversion Rate"
              value="0%"
              icon={<Activity size={20} />}
              change={{ value: "0", isPositive: true }}
            />
            <StatCard 
              title="Appointments with Candidates"
              value="0"
              icon={<Wallet size={20} />}
              change={{ value: "0", isPositive: true }}
            />
          </div>
        </motion.div>
        
        <motion.div variants={itemVariants}>
          <TileGrid />
        </motion.div>
        
        <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-1 gap-6">
          <div>
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h2 className="text-xl font-semibold mb-4">{t('projects')}</h2>
              <ProjectsList />
            </div>
          </div>
        </motion.div>
        
        <motion.div variants={itemVariants} className="text-sm text-gray-500 text-right">
          Last updated: {lastUpdated.toLocaleTimeString()}
        </motion.div>
      </motion.div>
    </LeadDatabaseContainer>
  );
};

export default CustomerDashboard;
