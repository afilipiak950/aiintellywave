
import React from 'react';
import WelcomeSection from '../../components/customer/dashboard/WelcomeSection';
import TileGrid from '../../components/customer/dashboard/TileGrid';
import ProjectsList from '../../components/customer/dashboard/ProjectsList';
import { useTranslation } from '../../hooks/useTranslation';
import StatCard from '../../components/ui/dashboard/StatCard';
import { Users, ChartPieIcon, CheckSquare, UserCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import LeadDatabaseContainer from '../../components/customer/LeadDatabaseContainer';
import { useProjects } from '../../hooks/use-projects';
import { useCustomerDashboard } from '@/hooks/use-customer-dashboard';
import { Button } from '@/components/ui/button';

const CustomerDashboard: React.FC = () => {
  const { t } = useTranslation();
  const { projects } = useProjects();
  const { 
    totalLeads, 
    activeProjects, 
    completedProjects, 
    approvedCandidates,
    loading, 
    error, 
    lastUpdated,
    refresh 
  } = useCustomerDashboard();
  
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

  const handleRefresh = () => {
    refresh();
  };
  
  if (error) {
    return (
      <LeadDatabaseContainer>
        <div className="bg-red-50 border border-red-200 rounded-md p-6 text-center">
          <h2 className="text-xl font-semibold text-red-700 mb-3">Dashboard Error</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <Button 
            onClick={handleRefresh}
            variant="default"
            className="bg-blue-600 hover:bg-blue-700"
          >
            Try Again
          </Button>
        </div>
      </LeadDatabaseContainer>
    );
  }
  
  // Helper function to calculate growth
  const calculateGrowth = (value: number): { value: string, isPositive: boolean } => {
    // Simulate growth data - in a real app this would come from historical data
    const isPositive = Math.random() > 0.3;
    const growthValue = ((Math.random() * 10) + 1).toFixed(1);
    return { 
      value: growthValue, 
      isPositive 
    };
  };
  
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
              value={loading ? "..." : totalLeads.toString()}
              icon={<Users size={20} />}
              change={calculateGrowth(totalLeads)}
              loading={loading}
            />
            <StatCard 
              title="Active Projects"
              value={loading ? "..." : activeProjects.toString()}
              icon={<ChartPieIcon size={20} />}
              change={calculateGrowth(activeProjects)}
              loading={loading}
            />
            <StatCard 
              title="Completed Projects"
              value={loading ? "..." : completedProjects.toString()}
              icon={<CheckSquare size={20} />}
              change={calculateGrowth(completedProjects)}
              loading={loading}
            />
            <StatCard 
              title="Approved Candidates"
              value={loading ? "..." : approvedCandidates.toString()}
              icon={<UserCheck size={20} />}
              change={calculateGrowth(approvedCandidates)}
              loading={loading}
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
