import { lazy, Suspense } from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import CustomerLayout from '../components/layout/CustomerLayout';

// Fallback component for loading states
const LoadingFallback = () => (
  <div className="flex justify-center items-center p-8 h-64">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
  </div>
);

// Error boundary component
const ErrorBoundary = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

// Lazy-loaded pages with error boundaries
const Dashboard = lazy(() => import('../pages/Customer/Dashboard'));
const Projects = lazy(() => import('../pages/Customer/Projects'));
const ProjectDetail = lazy(() => import('../pages/Customer/ProjectDetail'));
const Pipeline = lazy(() => import('../pages/Customer/Pipeline'));
const LeadDatabase = lazy(() => import('../pages/Customer/LeadDatabase'));
const MiraAI = lazy(() => import('../pages/Customer/MiraAI'));
const Appointments = lazy(() => import('../pages/Customer/Appointments'));
const Statistics = lazy(() => import('../pages/Customer/Statistics'));
const KiPersonas = lazy(() => import('../pages/KiPersonas/KiPersonasPage'));
const EmailAuthCallback = lazy(() => import('../pages/KiPersonas/EmailAuthCallback'));
const Outreach = lazy(() => import('../pages/Customer/Outreach'));
const Profile = lazy(() => import('../pages/Customer/Profile'));
const Settings = lazy(() => import('../pages/Customer/Settings'));
const NotificationSettings = lazy(() => import('../pages/Settings/NotificationSettings'));
const AppearanceSettings = lazy(() => import('../pages/Settings/AppearanceSettings'));
const TrainAI = lazy(() => import('../pages/TrainAI/TrainAIPage'));
const EnhancedIntegrations = lazy(() => import('../pages/KiPersonas/EnhancedIntegrations'));

// Lazy-loaded Manager KPI page
const ManagerKPIDashboard = lazy(() => import('../pages/Customer/ManagerKPIDashboard'));

const CustomerRoutes = () => {
  return (
    <Routes>
      <Route element={<CustomerLayout />}>
        {/* Add root path to redirect to dashboard */}
        <Route index element={
          <Suspense fallback={<LoadingFallback />}>
            <Dashboard />
          </Suspense>
        } />
        <Route path="dashboard" element={
          <Suspense fallback={<LoadingFallback />}>
            <Dashboard />
          </Suspense>
        } />
        <Route path="projects" element={
          <Suspense fallback={<LoadingFallback />}>
            <Projects />
          </Suspense>
        } />
        <Route path="projects/:id" element={
          <Suspense fallback={<LoadingFallback />}>
            <ProjectDetail />
          </Suspense>
        } />
        <Route path="pipeline" element={
          <Suspense fallback={<LoadingFallback />}>
            <Pipeline />
          </Suspense>
        } />
        <Route path="lead-database" element={
          <Suspense fallback={<LoadingFallback />}>
            <LeadDatabase />
          </Suspense>
        } />
        <Route path="leads" element={
          <Suspense fallback={<LoadingFallback />}>
            <LeadDatabase />
          </Suspense>
        } />
        <Route path="candidates" element={
          <Suspense fallback={<LoadingFallback />}>
            <LeadDatabase />
          </Suspense>
        } />
        <Route path="mira-ai" element={
          <Suspense fallback={<LoadingFallback />}>
            <MiraAI />
          </Suspense>
        } />
        <Route path="ai" element={
          <Suspense fallback={<LoadingFallback />}>
            <MiraAI />
          </Suspense>
        } />
        <Route path="appointments" element={
          <Suspense fallback={<LoadingFallback />}>
            <Appointments />
          </Suspense>
        } />
        <Route path="statistics" element={
          <Suspense fallback={<LoadingFallback />}>
            <Statistics />
          </Suspense>
        } />
        <Route path="ki-personas" element={
          <Suspense fallback={<LoadingFallback />}>
            <KiPersonas />
          </Suspense>
        } />
        <Route path="train-ai" element={
          <Suspense fallback={<LoadingFallback />}>
            <TrainAI />
          </Suspense>
        } />
        <Route path="outreach" element={
          <Suspense fallback={<LoadingFallback />}>
            <Outreach />
          </Suspense>
        } />
        <Route path="profile" element={
          <Suspense fallback={<LoadingFallback />}>
            <Profile />
          </Suspense>
        } />
        <Route path="settings/profile" element={
          <Suspense fallback={<LoadingFallback />}>
            <Settings />
          </Suspense>
        } />
        
        {/* Settings routes - now all using the same Settings component */}
        <Route path="settings/notifications" element={
          <Suspense fallback={<LoadingFallback />}>
            <NotificationSettings />
          </Suspense>
        } />
        <Route path="settings/appearance" element={
          <Suspense fallback={<LoadingFallback />}>
            <AppearanceSettings />
          </Suspense>
        } />
        <Route path="settings/language" element={
          <Suspense fallback={<LoadingFallback />}>
            <Settings />
          </Suspense>
        } />
        <Route path="settings/security" element={
          <Suspense fallback={<LoadingFallback />}>
            <Settings />
          </Suspense>
        } />
        <Route path="settings/team" element={
          <Suspense fallback={<LoadingFallback />}>
            <Settings />
          </Suspense>
        } />
        
        {/* Integrations route - proper route in the layout */}
        <Route path="integrations" element={
          <Suspense fallback={<LoadingFallback />}>
            <EnhancedIntegrations />
          </Suspense>
        } />
        
        {/* Add Manager KPI route */}
        <Route path="manager-kpi" element={
          <Suspense fallback={<LoadingFallback />}>
            <ManagerKPIDashboard />
          </Suspense>
        } />
      </Route>
      
      <Route path="email-auth-callback" element={
        <Suspense fallback={<LoadingFallback />}>
          <EmailAuthCallback />
        </Suspense>
      } />
      
      <Route path="*" element={<Navigate to="/customer/dashboard" />} />
    </Routes>
  );
};

export default CustomerRoutes;
