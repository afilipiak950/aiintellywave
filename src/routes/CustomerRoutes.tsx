
import { Route } from 'react-router-dom';
import { ProtectedRoute } from '@/components/auth/ProtectedRoutes';
import CustomerLayout from '@/components/layout/CustomerLayout';
import Dashboard from '@/pages/Customer/Dashboard';
import Projects from '@/pages/Customer/Projects';
import ProjectDetail from '@/pages/Customer/ProjectDetail';
import Pipeline from '@/pages/Customer/Pipeline';
import Appointments from '@/pages/Customer/Appointments';
import LeadDatabase from '@/pages/Customer/LeadDatabase';
import MiraAI from '@/pages/Customer/MiraAI';
import Statistics from '@/pages/Customer/Statistics';
import OutreachComingSoon from '@/pages/Outreach/OutreachComingSoon';
import ProfilePage from '@/pages/Settings/ProfilePage';
import AppearanceSettings from '@/pages/Settings/AppearanceSettings';
import LanguageSettings from '@/pages/Settings/LanguageSettings';
import NotificationSettings from '@/pages/Settings/NotificationSettings';

export const CustomerRoutes = (
  <Route element={<ProtectedRoute allowedRoles={['customer']} />}>
    <Route path="customer" element={<CustomerLayout />}>
      <Route index element={<Dashboard />} />
      <Route path="projects" element={<Projects />} />
      <Route path="projects/:id" element={<ProjectDetail />} />
      <Route path="pipeline" element={<Pipeline />} />
      <Route path="leads" element={<LeadDatabase />} />
      <Route path="appointments" element={<Appointments />} />
      <Route path="ai" element={<MiraAI />} />
      <Route path="statistics" element={<Statistics />} />
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
