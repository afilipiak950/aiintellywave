
import { Route } from 'react-router-dom';
import { ProtectedRoute } from '@/components/auth/ProtectedRoutes';
import ManagerLayout from '@/components/layout/ManagerLayout';
import Dashboard from '@/pages/Manager/Dashboard';
import Customers from '@/pages/Manager/Customers';
import CustomerDetail from '@/pages/Admin/CustomerDetail';
import Projects from '@/pages/Manager/Projects';
import ProjectDetail from '@/pages/Manager/ProjectDetail';
import Pipeline from '@/pages/Manager/Pipeline';
import MiraAI from '@/pages/Manager/MiraAI';
import LeadDatabase from '@/pages/Customer/LeadDatabase';  // Fixed import path
import KiPersonas from '@/pages/Manager/KiPersonas';
import OutreachComingSoon from '@/pages/Outreach/OutreachComingSoon';
import ProfilePage from '@/pages/Settings/ProfilePage';
import AppearanceSettings from '@/pages/Settings/AppearanceSettings';
import LanguageSettings from '@/pages/Settings/LanguageSettings';
import NotificationSettings from '@/pages/Settings/NotificationSettings';

export const ManagerRoutes = (
  <Route element={<ProtectedRoute allowedRoles={['manager']} />}>
    <Route path="manager" element={<ManagerLayout />}>
      <Route index element={<Dashboard />} />
      <Route path="dashboard" element={<Dashboard />} />
      <Route path="customers" element={<Customers />} />
      <Route path="customers/:id" element={<CustomerDetail />} />
      <Route path="projects" element={<Projects />} />
      <Route path="projects/:id" element={<ProjectDetail />} />
      <Route path="pipeline" element={<Pipeline />} />
      <Route path="leads" element={<LeadDatabase />} />
      <Route path="ai" element={<MiraAI />} />
      <Route path="ki-personas" element={<KiPersonas />} />
      <Route path="outreach" element={<OutreachComingSoon />} />
      <Route path="settings">
        <Route path="profile" element={<ProfilePage basePath="/manager" />} />
        <Route path="appearance" element={<AppearanceSettings />} />
        <Route path="language" element={<LanguageSettings />} />
        <Route path="notifications" element={<NotificationSettings />} />
      </Route>
    </Route>
  </Route>
);
