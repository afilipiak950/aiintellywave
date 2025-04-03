
import React from 'react';
import { Route, Routes } from 'react-router-dom';
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

// Convert to a component that returns Routes
const CustomerRoutes = () => {
  return (
    <Routes>
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/projects" element={<Projects />} />
      <Route path="/projects/:id" element={<ProjectDetail />} />
      <Route path="/pipeline" element={<Pipeline />} />
      <Route path="/lead-database" element={<LeadDatabase />} />
      <Route path="/mira-ai" element={<MiraAI />} />
      <Route path="/ki-personas" element={<KiPersonas />} />
      <Route path="/ki-personas/integrations" element={<EnhancedIntegrations />} />
      <Route path="/train-ai" element={<TrainAI />} />
      <Route path="/train-ai/enhanced" element={<EnhancedTrainAI />} />
      <Route path="/manager-kpi" element={<ManagerKPIDashboard />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/settings/profile" element={<ProfilePage />} />
      <Route path="/settings/notifications" element={<NotificationSettings />} />
      <Route path="/settings/appearance" element={<AppearanceSettings />} />
      <Route path="/settings/security" element={<SecuritySettings />} />
      <Route path="/settings/language" element={<LanguageSettings />} />
      <Route path="/settings/team" element={<TeamSettings />} />
      <Route path="/statistics" element={<StatisticsComingSoon />} />
      <Route path="/outreach" element={<OutreachComingSoon />} />
      <Route path="/integrations" element={<Integrations />} />
      <Route path="/appointments" element={<Appointments />} />
      {/* Default route for customer/* redirects to dashboard */}
      <Route path="/" element={<Dashboard />} />
    </Routes>
  );
};

export default CustomerRoutes;
