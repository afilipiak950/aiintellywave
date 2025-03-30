
import { lazy } from 'react';
import { Route, Routes } from 'react-router-dom';
import CustomerLayout from '../components/layout/CustomerLayout';

const CustomerDashboard = lazy(() => import('../pages/Customer/Dashboard'));
const CustomerPipeline = lazy(() => import('../pages/Customer/Pipeline'));
const CustomerLeadDatabase = lazy(() => import('../pages/Customer/LeadDatabase'));
const CustomerMiraAI = lazy(() => import('../pages/Customer/MiraAI'));
const CustomerProjects = lazy(() => import('../pages/Customer/Projects'));
const CustomerProjectDetail = lazy(() => import('../pages/Customer/ProjectDetail'));
const CustomerProfile = lazy(() => import('../pages/Customer/Profile'));
const CustomerOutreach = lazy(() => import('../pages/Customer/Outreach'));
const CustomerAppointments = lazy(() => import('../pages/Customer/Appointments'));
const CustomerStatistics = lazy(() => import('../pages/Customer/Statistics'));
const CustomerSettings = lazy(() => import('../pages/Customer/Settings'));
const CustomerIntegrations = lazy(() => import('../pages/Customer/Integrations'));

// Settings Pages
const ProfileSettings = lazy(() => import('../pages/Settings/ProfilePage'));
const NotificationSettings = lazy(() => import('../pages/Settings/NotificationSettings'));
const LanguageSettings = lazy(() => import('../pages/Settings/LanguageSettings'));
const SecuritySettings = lazy(() => import('../pages/Settings/SecuritySettings'));
const TeamSettings = lazy(() => import('../pages/Settings/TeamSettings'));
const AppearanceSettings = lazy(() => import('../pages/Settings/AppearanceSettings'));

const CustomerRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<CustomerLayout />}>
        <Route index element={<CustomerDashboard />} />
        <Route path="dashboard" element={<CustomerDashboard />} />
        <Route path="pipeline" element={<CustomerPipeline />} />
        <Route path="lead-database" element={<CustomerLeadDatabase />} />
        <Route path="mira-ai" element={<CustomerMiraAI />} />
        <Route path="projects" element={<CustomerProjects />} />
        <Route path="projects/:id" element={<CustomerProjectDetail />} />
        <Route path="profile" element={<CustomerProfile />} />
        <Route path="outreach" element={<CustomerOutreach />} />
        <Route path="appointments" element={<CustomerAppointments />} />
        <Route path="statistics" element={<CustomerStatistics />} />
        <Route path="integrations" element={<CustomerIntegrations />} />
        
        <Route path="settings" element={<CustomerSettings />}>
          <Route index element={<ProfileSettings basePath="/customer" />} />
          <Route path="profile" element={<ProfileSettings basePath="/customer" />} />
          <Route path="notifications" element={<NotificationSettings />} />
          <Route path="language" element={<LanguageSettings />} />
          <Route path="security" element={<SecuritySettings />} />
          <Route path="team" element={<TeamSettings />} />
          <Route path="appearance" element={<AppearanceSettings />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default CustomerRoutes;
