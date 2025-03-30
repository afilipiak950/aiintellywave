
import React, { useEffect } from 'react';
import WelcomeSection from '../../components/customer/dashboard/WelcomeSection';
import TileGrid from '../../components/customer/dashboard/TileGrid';
import ProjectsList from '../../components/customer/dashboard/ProjectsList';
import { useTranslation } from '../../hooks/useTranslation';
import LineChart from '../../components/ui/dashboard/LineChart';
import StatCard from '../../components/ui/dashboard/StatCard';
import { Users, ChartPieIcon, Activity, Wallet } from 'lucide-react';
import { motion } from 'framer-motion';
import LeadDatabaseContainer from '../../components/customer/LeadDatabaseContainer';

// Sample data for the charts
const activityData = [
  { name: 'Jan', leads: 12, conversions: 5 },
  { name: 'Feb', leads: 19, conversions: 8 },
  { name: 'Mar', leads: 15, conversions: 6 },
  { name: 'Apr', leads: 25, conversions: 12 },
  { name: 'May', leads: 32, conversions: 15 },
  { name: 'Jun', leads: 28, conversions: 14 },
  { name: 'Jul', leads: 35, conversions: 18 },
];

const CustomerDashboard: React.FC = () => {
  const { t } = useTranslation();
  
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
              value="245"
              icon={<Users size={20} />}
              trend={{ value: "+12.5%", positive: true }}
            />
            <StatCard 
              title="Active Projects"
              value="8"
              icon={<ChartPieIcon size={20} />}
              trend={{ value: "+3.2%", positive: true }}
            />
            <StatCard 
              title="Conversion Rate"
              value="32%"
              icon={<Activity size={20} />}
              trend={{ value: "+5.1%", positive: true }}
            />
            <StatCard 
              title="Avg. Lead Value"
              value="€4,250"
              icon={<Wallet size={20} />}
              trend={{ value: "-1.8%", positive: false }}
            />
          </div>
        </motion.div>
        
        {/* Main grid section */}
        <motion.div variants={itemVariants}>
          <TileGrid />
        </motion.div>
        
        {/* Projects and Charts section */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h2 className="text-xl font-semibold mb-4">{t('projects')}</h2>
              <ProjectsList />
            </div>
          </div>
          
          <div className="lg:col-span-2">
            <LineChart 
              data={activityData}
              dataKeys={['leads', 'conversions']}
              title="Lead Generation & Conversion"
              subtitle="Last 6 months performance"
            />
          </div>
        </motion.div>
      </motion.div>
    </LeadDatabaseContainer>
  );
};

export default CustomerDashboard;

