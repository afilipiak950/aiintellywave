
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

export const AdminRoutes = (
  <Route element={<AdminLayout />}>
    <Route path="/admin/dashboard" element={<Dashboard />} />
    <Route path="/admin/customers" element={<Customers />} />
    <Route path="/admin/customers/:id" element={<CustomerDetail />} />
    <Route path="/admin/projects" element={<Projects />} />
    <Route path="/admin/projects/:id" element={<ProjectDetail />} />
    
    {/* Settings Routes */}
    <Route path="/admin/profile" element={<ProfilePage />} />
    <Route path="/admin/settings/appearance" element={<AppearanceSettings />} />
    <Route path="/admin/settings/notifications" element={<NotificationSettings />} />
    <Route path="/admin/settings/language" element={<LanguageSettings />} />
    <Route path="/admin/settings/security" element={<SecuritySettings />} />
    <Route path="/admin/settings/team" element={<TeamSettings />} />
  </Route>
);
