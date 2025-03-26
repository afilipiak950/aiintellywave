
import { Route } from 'react-router-dom';
import ManagerLayout from '../components/layout/ManagerLayout';
import Dashboard from '../pages/Manager/Dashboard';
import Customers from '../pages/Manager/Customers';
import Projects from '../pages/Manager/Projects';
import ProjectDetail from '../pages/Manager/ProjectDetail';
import ProfilePage from '../pages/Settings/ProfilePage';
import AppearanceSettings from '../pages/Settings/AppearanceSettings';
import NotificationSettings from '../pages/Settings/NotificationSettings';
import LanguageSettings from '../pages/Settings/LanguageSettings';
import SecuritySettings from '../pages/Settings/SecuritySettings';
import TeamSettings from '../pages/Settings/TeamSettings';

export const ManagerRoutes = (
  <Route element={<ManagerLayout />}>
    <Route path="/manager/dashboard" element={<Dashboard />} />
    <Route path="/manager/customers" element={<Customers />} />
    <Route path="/manager/projects" element={<Projects />} />
    <Route path="/manager/projects/:id" element={<ProjectDetail />} />
    
    {/* Settings Routes */}
    <Route path="/manager/profile" element={<ProfilePage />} />
    <Route path="/manager/settings/appearance" element={<AppearanceSettings />} />
    <Route path="/manager/settings/notifications" element={<NotificationSettings />} />
    <Route path="/manager/settings/language" element={<LanguageSettings />} />
    <Route path="/manager/settings/security" element={<SecuritySettings />} />
    <Route path="/manager/settings/team" element={<TeamSettings />} />
  </Route>
);
