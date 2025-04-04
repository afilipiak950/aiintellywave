
import React, { useState, useEffect, useCallback, useRef } from 'react';
import WelcomeSection from '../../components/customer/dashboard/WelcomeSection';
import TileGrid from '../../components/customer/dashboard/TileGrid';
import ProjectsList from '../../components/customer/dashboard/ProjectsList';
import { useTranslation } from '../../hooks/useTranslation';
import StatCard from '../../components/ui/dashboard/StatCard';
import { Users, CheckCircle, Activity, FileCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import LeadDatabaseContainer from '../../components/customer/LeadDatabaseContainer';
import { useKpiMetrics } from '../../hooks/use-kpi-metrics';
import { toast } from '../../hooks/use-toast';
import { useProjects } from '../../hooks/use-projects';
import { useLeads } from '../../hooks/leads/use-leads';
import { supabase } from '../../integrations/supabase/client';
import { useAuth } from '../../context/auth';

const CustomerDashboard: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [leadsCount, setLeadsCount] = useState(0);
  const [approvedLeadsCount, setApprovedLeadsCount] = useState(0);
  const [activeProjects, setActiveProjects] = useState(0);
  const [completedProjects, setCompletedProjects] = useState(0);
  const { metrics, fetchMetrics, calculateGrowth } = useKpiMetrics();
  const { projects, loading: projectsLoading } = useProjects();
  const { allLeads } = useLeads();
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [companyId, setCompanyId] = useState<string | null>(null);
  
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
    const fetchCompanyId = async () => {
      if (!user?.id) return;
      
      try {
        const { data, error } = await supabase
          .from('company_users')
          .select('company_id')
          .eq('user_id', user.id)
          .single();
        
        if (error) {
          console.error('Error fetching company ID:', error);
          return;
        }
        
        if (data) {
          setCompanyId(data.company_id);
        }
      } catch (error) {
        console.error('Error in fetchCompanyId:', error);
      }
    };
    
    fetchCompanyId();
  }, [user]);

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!companyId) {
        console.log('No company ID available yet');
        return;
      }

      console.log('Loading dashboard data for company:', companyId);
      
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('id')
        .eq('company_id', companyId);
      
      if (projectsError) {
        throw projectsError;
      }
      
      const projectIds = projectsData?.map(p => p.id) || [];
      
      if (projectIds.length > 0) {
        const { count: leadsCountResult, error: leadsError } = await supabase
          .from('leads')
          .select('id', { count: 'exact', head: true })
          .in('project_id', projectIds);
        
        if (leadsError) {
          throw leadsError;
        }
        
        setLeadsCount(leadsCountResult || 0);
        
        // For approved leads, we'll use the approval_status field from project_excel_data
        const { count: approvedLeadsCountResult, error: approvedLeadsError } = await supabase
          .from('project_excel_data')
          .select('id', { count: 'exact', head: true })
          .in('project_id', projectIds)
          .eq('approval_status', 'approved');
        
        if (approvedLeadsError) {
          throw approvedLeadsError;
        }
        
        setApprovedLeadsCount(approvedLeadsCountResult || 0);
      } else {
        setLeadsCount(0);
        setApprovedLeadsCount(0);
      }
      
      const { count: activeProjectsCount, error: activeProjectsError } = await supabase
        .from('projects')
        .select('id', { count: 'exact', head: true })
        .eq('company_id', companyId)
        .eq('status', 'in_progress');
      
      if (activeProjectsError) {
        throw activeProjectsError;
      }
      
      setActiveProjects(activeProjectsCount || 0);
      
      const { count: completedProjectsCount, error: completedProjectsError } = await supabase
        .from('projects')
        .select('id', { count: 'exact', head: true })
        .eq('company_id', companyId)
        .eq('status', 'completed');
      
      if (completedProjectsError) {
        throw completedProjectsError;
      }
      
      setCompletedProjects(completedProjectsCount || 0);
      
      setLastUpdated(new Date());
      
    } catch (error: any) {
      console.error('Error loading dashboard data:', error);
      setError('Failed to load dashboard data. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [companyId]);
  
  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);
  
  const handleRefresh = () => {
    loadDashboardData();
  };
  
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
              value={loading ? "..." : leadsCount.toString()}
              icon={<Users size={20} />}
              change={{ value: "0", isPositive: true }}
              loading={loading}
            />
            <StatCard 
              title="Active Projects"
              value={loading ? "..." : activeProjects.toString()}
              icon={<Activity size={20} />}
              change={{ value: "0", isPositive: true }}
              loading={loading}
            />
            <StatCard 
              title="Completed Projects"
              value={loading ? "..." : completedProjects.toString()}
              icon={<CheckCircle size={20} />}
              change={{ value: "0", isPositive: true }}
              loading={loading}
            />
            <StatCard 
              title="Approved Candidates"
              value={loading ? "..." : approvedLeadsCount.toString()}
              icon={<FileCheck size={20} />}
              change={{ value: "0", isPositive: true }}
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
