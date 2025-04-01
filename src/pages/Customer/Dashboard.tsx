
import React, { useState, useEffect, useCallback, useRef } from 'react';
import WelcomeSection from '../../components/customer/dashboard/WelcomeSection';
import TileGrid from '../../components/customer/dashboard/TileGrid';
import ProjectsList from '../../components/customer/dashboard/ProjectsList';
import { useTranslation } from '../../hooks/useTranslation';
import StatCard from '../../components/ui/dashboard/StatCard';
import { Users, ChartPieIcon, Activity, Wallet } from 'lucide-react';
import { motion } from 'framer-motion';
import LeadDatabaseContainer from '../../components/customer/LeadDatabaseContainer';
import { fetchDashboardStats } from '../../services/kpi-service';
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
  
  // Container animation variants
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

  // Memoize the loadDashboardData function to prevent recreation on each render
  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch KPI metrics - use Promise.allSettled to handle partial failures
      const promises = [
        fetchMetrics(['conversion_rate', 'booking_candidates']),
        fetchDashboardStats()
      ];
      
      const [metricsResult, statsResult] = await Promise.allSettled(promises);
      
      // Handle metrics result
      if (metricsResult.status === 'fulfilled') {
        // Already handled in the hook
      } else {
        console.warn('Failed to load KPI metrics:', metricsResult.reason);
        // Continue execution - don't throw
      }
      
      // Handle stats result  
      if (statsResult.status === 'fulfilled') {
        const stats = statsResult.value;
        // Fix: Ensure we're setting numeric values only
        setLeadsCount(typeof stats.leadsCount === 'number' ? stats.leadsCount : 0);
        setActiveProjects(typeof stats.activeProjects === 'number' ? stats.activeProjects : 0);
        setLastUpdated(new Date());
      } else {
        console.warn('Failed to load dashboard stats:', statsResult.reason);
        // Use fallback data
        setLeadsCount(0);
        setActiveProjects(0);
      }
      
    } catch (error: any) {
      console.error('Error loading dashboard data:', error);
      setError('Failed to load dashboard data. Please try again later.');
      // Don't show toast on every render cycle, as it can cause flickering
    } finally {
      setLoading(false);
    }
  }, [fetchMetrics]);
  
  // Load data once when component mounts
  useEffect(() => {
    loadDashboardData();
    // The empty dependency array ensures this runs only once on mount
  }, [loadDashboardData]);
  
  // Handle refresh action
  const handleRefresh = () => {
    loadDashboardData();
  };
  
  // Format KPI values for display - memoized to prevent recalculations
  const formatKpiValue = useCallback((metricName: string, defaultValue: string) => {
    const metric = metrics[metricName];
    if (loading) return "...";
    if (!metric) return defaultValue;
    
    if (metricName === 'conversion_rate') {
      return `${metric.value}%`;
    } else if (metricName === 'booking_candidates') {
      return `€${metric.value.toLocaleString()}`;
    }
    return defaultValue;
  }, [metrics, loading]);
  
  // Display error state if we have errors
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
        {/* Welcome section with animation */}
        <motion.div variants={itemVariants}>
          <WelcomeSection className="mb-8" />
        </motion.div>
        
        {/* Stats Section */}
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
              value={loading ? "..." : leadsCount.toString()}
              icon={<Users size={20} />}
              change={calculateGrowth(leadsCount, leadsCount * 0.9)}
            />
            <StatCard 
              title="Active Projects"
              value={loading ? "..." : activeProjects.toString()}
              icon={<ChartPieIcon size={20} />}
              change={calculateGrowth(activeProjects, activeProjects * 0.95)}
            />
            <StatCard 
              title="Conversion Rate"
              value={formatKpiValue('conversion_rate', "32%")}
              icon={<Activity size={20} />}
              change={
                metrics['conversion_rate'] 
                  ? calculateGrowth(
                      metrics['conversion_rate'].value, 
                      metrics['conversion_rate'].previous_value
                    ) 
                  : { value: "5.1", isPositive: true }
              }
            />
            <StatCard 
              title="Booking w. Candidates"
              value={formatKpiValue('booking_candidates', "€4,250")}
              icon={<Wallet size={20} />}
              change={
                metrics['booking_candidates'] 
                  ? calculateGrowth(
                      metrics['booking_candidates'].value, 
                      metrics['booking_candidates'].previous_value
                    ) 
                  : { value: "1.8", isPositive: false }
              }
            />
          </div>
        </motion.div>
        
        {/* Main grid section */}
        <motion.div variants={itemVariants}>
          <TileGrid />
        </motion.div>
        
        {/* Projects section */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-1 gap-6">
          <div>
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h2 className="text-xl font-semibold mb-4">{t('projects')}</h2>
              <ProjectsList />
            </div>
          </div>
        </motion.div>

        {/* Last updated timestamp */}
        <motion.div variants={itemVariants} className="text-sm text-gray-500 text-right">
          Last updated: {lastUpdated.toLocaleTimeString()}
        </motion.div>
      </motion.div>
    </LeadDatabaseContainer>
  );
};

export default CustomerDashboard;
