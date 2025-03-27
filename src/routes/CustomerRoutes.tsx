
import { Route } from 'react-router-dom';
import CustomerLayout from '../components/layout/CustomerLayout';
import Dashboard from '../pages/Customer/Dashboard';
import Projects from '../pages/Customer/Projects';
import ProjectDetail from '../pages/Customer/ProjectDetail';
import SettingsLayout from '../components/settings/SettingsLayout';
import AppearanceSettings from '../pages/Settings/AppearanceSettings';
import NotificationSettings from '../pages/Settings/NotificationSettings';
import LanguageSettings from '../pages/Settings/LanguageSettings';
import SecuritySettings from '../pages/Settings/SecuritySettings';
import ProfilePage from '../pages/Settings/ProfilePage';
import MiraAI from '../pages/Customer/MiraAI';

export const CustomerRoutes = (
  <Route element={<CustomerLayout />}>
    <Route path="/customer/dashboard" element={<Dashboard />} />
    <Route path="/customer/projects" element={<Projects />} />
    <Route path="/customer/projects/:id" element={<ProjectDetail />} />
    <Route path="/customer/mira-ai" element={<MiraAI />} />
    
    {/* Settings Routes */}
    <Route path="/customer/profile" element={<ProfilePage />} />
    
    <Route path="/customer/settings" element={<SettingsLayout basePath="/customer" />}>
      <Route index element={<AppearanceSettings />} />
      <Route path="appearance" element={<AppearanceSettings />} />
      <Route path="notifications" element={<NotificationSettings />} />
      <Route path="language" element={<LanguageSettings />} />
      <Route path="security" element={<SecuritySettings />} />
    </Route>
  </Route>
);
