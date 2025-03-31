
import { Route } from 'react-router-dom';
import { ProtectedRoute } from '@/components/auth/ProtectedRoutes';
import AdminLayout from '@/components/layout/AdminLayout';
import Dashboard from '@/pages/Admin/Dashboard';
import Customers from '@/pages/Admin/Customers';
import CustomerDetail from '@/pages/Admin/CustomerDetail';
import Projects from '@/pages/Admin/Projects';
import ProjectDetail from '@/pages/Admin/ProjectDetail';
import CompaniesCustomers from '@/pages/Admin/CompaniesCustomers';
import ProfilePage from '@/pages/Settings/ProfilePage';
import AppearanceSettings from '@/pages/Settings/AppearanceSettings';
import LanguageSettings from '@/pages/Settings/LanguageSettings';
import NotificationSettings from '@/pages/Settings/NotificationSettings';
import SecuritySettings from '@/pages/Settings/SecuritySettings';

export const AdminRoutes = (
  <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
    <Route path="admin" element={<AdminLayout />}>
      <Route index element={<Dashboard />} />
      <Route path="dashboard" element={<Dashboard />} />
      <Route path="customers" element={<Customers />} />
      <Route path="customers/:id" element={<CustomerDetail />} />
      <Route path="companies-customers" element={<CompaniesCustomers />} />
      <Route path="projects" element={<Projects />} />
      <Route path="projects/:id" element={<ProjectDetail />} />
      <Route path="settings">
        <Route path="profile" element={<ProfilePage basePath="/admin" />} />
        <Route path="appearance" element={<AppearanceSettings />} />
        <Route path="language" element={<LanguageSettings />} />
        <Route path="notifications" element={<NotificationSettings />} />
        <Route path="security" element={<SecuritySettings />} />
      </Route>
    </Route>
  </Route>
);
