
import { Route } from 'react-router-dom';
import ManagerLayout from '../components/layout/ManagerLayout';
import Dashboard from '../pages/Manager/Dashboard';
import Customers from '../pages/Manager/Customers';
import Projects from '../pages/Manager/Projects';
import ProjectDetail from '../pages/Manager/ProjectDetail';
import SettingsLayout from '../components/settings/SettingsLayout';
import AppearanceSettings from '../pages/Settings/AppearanceSettings';
import NotificationSettings from '../pages/Settings/NotificationSettings';
import LanguageSettings from '../pages/Settings/LanguageSettings';
import SecuritySettings from '../pages/Settings/SecuritySettings';
import TeamSettings from '../pages/Settings/TeamSettings';
import ProfilePage from '../pages/Settings/ProfilePage';
import MiraAI from '../pages/Manager/MiraAI';
import OutreachComingSoon from '../pages/Outreach/OutreachComingSoon';
import Pipeline from '../pages/Manager/Pipeline';

export const ManagerRoutes = (
  <Route element={<ManagerLayout />}>
    <Route path="/manager/dashboard" element={<Dashboard />} />
    <Route path="/manager/customers" element={<Customers />} />
    <Route path="/manager/projects" element={<Projects />} />
    <Route path="/manager/projects/:id" element={<ProjectDetail />} />
    <Route path="/manager/pipeline" element={<Pipeline />} />
    <Route path="/manager/mira-ai" element={<MiraAI />} />
    <Route path="/manager/outreach" element={<OutreachComingSoon />} />
    
    {/* Settings Routes */}
    <Route path="/manager/profile" element={<ProfilePage />} />
    
    <Route path="/manager/settings" element={<SettingsLayout basePath="/manager" />}>
      <Route index element={<AppearanceSettings />} />
      <Route path="appearance" element={<AppearanceSettings />} />
      <Route path="notifications" element={<NotificationSettings />} />
      <Route path="language" element={<LanguageSettings />} />
      <Route path="security" element={<SecuritySettings />} />
      <Route path="team" element={<TeamSettings />} />
    </Route>
  </Route>
);
