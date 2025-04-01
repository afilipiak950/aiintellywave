
import React, { useState, useEffect } from 'react';
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

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch KPI metrics
        await fetchMetrics(['conversion_rate', 'booking_candidates']);
        
        // Fetch dashboard stats for lead count
        const stats = await fetchDashboardStats();
        setLeadsCount(stats.leadsCount || 0);
        setActiveProjects(stats.activeProjects || 0);
        
      } catch (error: any) {
        console.error('Error loading dashboard data:', error);
        toast({
          title: "Error",
          description: "Failed to load dashboard data",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadDashboardData();
  }, [fetchMetrics]);
  
  // Format KPI values for display
  const formatKpiValue = (metricName: string, defaultValue: string) => {
    const metric = metrics[metricName];
    if (loading) return "...";
    if (!metric) return defaultValue;
    
    if (metricName === 'conversion_rate') {
      return `${metric.value}%`;
    } else if (metricName === 'booking_candidates') {
      return `€${metric.value.toLocaleString()}`;
    }
    return defaultValue;
  };
  
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
        
        {/* Projects section - removed chart section from here */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-1 gap-6">
          <div>
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h2 className="text-xl font-semibold mb-4">{t('projects')}</h2>
              <ProjectsList />
            </div>
          </div>
        </motion.div>
      </motion.div>
    </LeadDatabaseContainer>
  );
};

export default CustomerDashboard;
