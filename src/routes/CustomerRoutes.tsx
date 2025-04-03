
import React from 'react';
import { Route } from 'react-router-dom';
import Dashboard from '@/pages/Customer/Dashboard';
import Projects from '@/pages/Customer/Projects';
import ProjectDetail from '@/pages/Customer/ProjectDetail';
import Pipeline from '@/pages/Customer/Pipeline';
import LeadDatabase from '@/pages/Customer/LeadDatabase';
import MiraAI from '@/pages/Customer/MiraAI';
import KiPersonas from '@/pages/KiPersonas/KiPersonasPage';
import TrainAI from '@/pages/TrainAI/TrainAIPage';
import Settings from '@/pages/Customer/Settings';
import ProfilePage from '@/pages/Settings/ProfilePage';
import NotificationSettings from '@/pages/Settings/NotificationSettings';
import AppearanceSettings from '@/pages/Settings/AppearanceSettings';
import SecuritySettings from '@/pages/Settings/SecuritySettings';
import LanguageSettings from '@/pages/Settings/LanguageSettings';
import TeamSettings from '@/pages/Settings/TeamSettings';
import Appointments from '@/pages/Customer/Appointments';
import Integrations from '@/pages/NotFound';
import StatisticsComingSoon from '@/pages/Statistics/StatisticsComingSoon';
import OutreachComingSoon from '@/pages/Outreach/OutreachComingSoon';
import EnhancedIntegrations from '@/pages/KiPersonas/EnhancedIntegrations';
import EnhancedTrainAI from '@/pages/TrainAI/EnhancedTrainAIPage';
import ManagerKPIDashboard from '@/pages/Customer/ManagerKPIDashboard';

export const CustomerRoutes = (
  <>
    <Route path="/customer/dashboard" element={<Dashboard />} />
    <Route path="/customer/projects" element={<Projects />} />
    <Route path="/customer/projects/:id" element={<ProjectDetail />} />
    <Route path="/customer/pipeline" element={<Pipeline />} />
    <Route path="/customer/lead-database" element={<LeadDatabase />} />
    <Route path="/customer/mira-ai" element={<MiraAI />} />
    <Route path="/customer/ki-personas" element={<KiPersonas />} />
    <Route path="/customer/ki-personas/integrations" element={<EnhancedIntegrations />} />
    <Route path="/customer/train-ai" element={<TrainAI />} />
    <Route path="/customer/train-ai/enhanced" element={<EnhancedTrainAI />} />
    <Route path="/customer/manager-kpi" element={<ManagerKPIDashboard />} />
    <Route path="/customer/settings" element={<Settings />} />
    <Route path="/customer/settings/profile" element={<ProfilePage />} />
    <Route path="/customer/settings/notifications" element={<NotificationSettings />} />
    <Route path="/customer/settings/appearance" element={<AppearanceSettings />} />
    <Route path="/customer/settings/security" element={<SecuritySettings />} />
    <Route path="/customer/settings/language" element={<LanguageSettings />} />
    <Route path="/customer/settings/team" element={<TeamSettings />} />
    <Route path="/customer/statistics" element={<StatisticsComingSoon />} />
    <Route path="/customer/outreach" element={<OutreachComingSoon />} />
    <Route path="/customer/integrations" element={<Integrations />} />
    <Route path="/customer/appointments" element={<Appointments />} />
  </>
);

export default CustomerRoutes;
