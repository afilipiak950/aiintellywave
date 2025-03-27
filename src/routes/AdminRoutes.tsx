
import { Route } from 'react-router-dom';
import { ProtectedRoute } from '@/components/auth/ProtectedRoutes';
import AdminLayout from '@/components/layout/AdminLayout';
import Dashboard from '@/pages/Admin/Dashboard';
import Customers from '@/pages/Admin/Customers';
import CustomerDetail from '@/pages/Admin/CustomerDetail';
import Projects from '@/pages/Admin/Projects';
import ProjectDetail from '@/pages/Admin/ProjectDetail';
import Pipeline from '@/pages/Admin/Pipeline';
import MiraAI from '@/pages/Admin/MiraAI';
import LeadDatabase from '@/pages/Customer/LeadDatabase';  // Fixed import path
import KiPersonas from '@/pages/Admin/KiPersonas';
import OutreachComingSoon from '@/pages/Outreach/OutreachComingSoon';
import ProfilePage from '@/pages/Settings/ProfilePage';
import AppearanceSettings from '@/pages/Settings/AppearanceSettings';
import LanguageSettings from '@/pages/Settings/LanguageSettings';
import NotificationSettings from '@/pages/Settings/NotificationSettings';

export const AdminRoutes = (
  <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
    <Route path="admin" element={<AdminLayout />}>
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
        <Route path="profile" element={<ProfilePage />} />
        <Route path="appearance" element={<AppearanceSettings />} />
        <Route path="language" element={<LanguageSettings />} />
        <Route path="notifications" element={<NotificationSettings />} />
      </Route>
    </Route>
  </Route>
);
