
import { Route } from 'react-router-dom';
import CustomerLayout from '../components/layout/CustomerLayout';
import Dashboard from '../pages/Customer/Dashboard';
import Projects from '../pages/Customer/Projects';
import ProjectDetail from '../pages/Customer/ProjectDetail';
import ProfilePage from '../pages/Settings/ProfilePage';
import AppearanceSettings from '../pages/Settings/AppearanceSettings';
import NotificationSettings from '../pages/Settings/NotificationSettings';
import LanguageSettings from '../pages/Settings/LanguageSettings';
import SecuritySettings from '../pages/Settings/SecuritySettings';

export const CustomerRoutes = (
  <Route element={<CustomerLayout />}>
    <Route path="/customer/dashboard" element={<Dashboard />} />
    <Route path="/customer/projects" element={<Projects />} />
    <Route path="/customer/projects/:id" element={<ProjectDetail />} />
    
    {/* Settings Routes */}
    <Route path="/customer/profile" element={<ProfilePage />} />
    <Route path="/customer/settings/appearance" element={<AppearanceSettings />} />
    <Route path="/customer/settings/notifications" element={<NotificationSettings />} />
    <Route path="/customer/settings/language" element={<LanguageSettings />} />
    <Route path="/customer/settings/security" element={<SecuritySettings />} />
  </Route>
);
