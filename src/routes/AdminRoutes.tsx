
import { Route } from 'react-router-dom';
import AdminLayout from '../components/layout/AdminLayout';
import Dashboard from '../pages/Admin/Dashboard';
import Customers from '../pages/Admin/Customers';
import CustomerDetail from '../pages/Admin/CustomerDetail';
import Projects from '../pages/Admin/Projects';
import ProjectDetail from '../pages/Admin/ProjectDetail';
import ProfilePage from '../pages/Settings/ProfilePage';
import AppearanceSettings from '../pages/Settings/AppearanceSettings';
import NotificationSettings from '../pages/Settings/NotificationSettings';
import LanguageSettings from '../pages/Settings/LanguageSettings';
import SecuritySettings from '../pages/Settings/SecuritySettings';
import TeamSettings from '../pages/Settings/TeamSettings';
import SettingsLayout from '../components/settings/SettingsLayout';

export const AdminRoutes = (
  <Route element={<AdminLayout />}>
    <Route path="/admin/dashboard" element={<Dashboard />} />
    <Route path="/admin/customers" element={<Customers />} />
    <Route path="/admin/customers/:id" element={<CustomerDetail />} />
    <Route path="/admin/projects" element={<Projects />} />
    <Route path="/admin/projects/:id" element={<ProjectDetail />} />
    
    {/* Settings Routes */}
    <Route path="/admin/profile" element={<ProfilePage />} />
    
    {/* Add a parent settings route that renders the SettingsLayout */}
    <Route path="/admin/settings" element={<SettingsLayout basePath="/admin" />}>
      <Route index element={<AppearanceSettings />} />
      <Route path="appearance" element={<AppearanceSettings />} />
      <Route path="notifications" element={<NotificationSettings />} />
      <Route path="language" element={<LanguageSettings />} />
      <Route path="security" element={<SecuritySettings />} />
      <Route path="team" element={<TeamSettings />} />
    </Route>
  </Route>
);
