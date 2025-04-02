
import { Route, Routes } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import CustomerLayout from '@/components/layout/CustomerLayout';
import { CustomerRoute } from '@/components/auth/ProtectedRoutes';
import ErrorBoundary from '@/components/ErrorBoundary';

// Lazy-loaded components for better performance
const Dashboard = lazy(() => import('@/pages/Customer/Dashboard'));
const Projects = lazy(() => import('@/pages/Customer/Projects'));
const ProjectDetail = lazy(() => import('@/pages/Customer/ProjectDetail'));
const LeadDatabase = lazy(() => import('@/pages/Customer/LeadDatabase'));
const Pipeline = lazy(() => import('@/pages/Customer/Pipeline'));
const Appointments = lazy(() => import('@/pages/Customer/Appointments'));
const MiraAI = lazy(() => import('@/pages/Customer/MiraAI'));
const TrainAI = lazy(() => import('@/pages/Customer/TrainAI'));
const KiPersonas = lazy(() => import('@/pages/Customer/KiPersonas'));
const Statistics = lazy(() => import('@/pages/Customer/Statistics'));
const OutreachPage = lazy(() => import('@/pages/Customer/OutreachPage'));
const ManagerKPI = lazy(() => import('@/pages/Customer/ManagerKPI'));
const ProfilePage = lazy(() => import('@/pages/Settings/ProfilePage'));
const AppearanceSettings = lazy(() => import('@/pages/Settings/AppearanceSettings'));
const LanguageSettings = lazy(() => import('@/pages/Settings/LanguageSettings'));
const NotificationSettings = lazy(() => import('@/pages/Settings/NotificationSettings'));

// Loading state for lazy-loaded components
const LoadingFallback = () => (
  <div className="flex items-center justify-center h-full">
    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
  </div>
);

const CustomerRoutes = () => {
  return (
    <CustomerRoute>
      <ErrorBoundary>
        <Routes>
          <Route element={<CustomerLayout />}>
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
            <Route path="lead-database" element={
              <Suspense fallback={<LoadingFallback />}>
                <LeadDatabase />
              </Suspense>
            } />
            <Route path="pipeline" element={
              <Suspense fallback={<LoadingFallback />}>
                <Pipeline />
              </Suspense>
            } />
            <Route path="appointments" element={
              <Suspense fallback={<LoadingFallback />}>
                <Appointments />
              </Suspense>
            } />
            <Route path="mira-ai" element={
              <Suspense fallback={<LoadingFallback />}>
                <MiraAI />
              </Suspense>
            } />
            <Route path="train-ai" element={
              <Suspense fallback={<LoadingFallback />}>
                <TrainAI />
              </Suspense>
            } />
            <Route path="ki-personas" element={
              <Suspense fallback={<LoadingFallback />}>
                <KiPersonas />
              </Suspense>
            } />
            <Route path="statistics" element={
              <Suspense fallback={<LoadingFallback />}>
                <Statistics />
              </Suspense>
            } />
            <Route path="outreach" element={
              <Suspense fallback={<LoadingFallback />}>
                <OutreachPage />
              </Suspense>
            } />
            {/* Add Manager KPI Dashboard route */}
            <Route path="manager-kpi" element={
              <Suspense fallback={<LoadingFallback />}>
                <ManagerKPI />
              </Suspense>
            } />
            <Route path="settings/profile" element={
              <Suspense fallback={<LoadingFallback />}>
                <ProfilePage basePath="/customer" />
              </Suspense>
            } />
            <Route path="settings/appearance" element={
              <Suspense fallback={<LoadingFallback />}>
                <AppearanceSettings />
              </Suspense>
            } />
            <Route path="settings/language" element={
              <Suspense fallback={<LoadingFallback />}>
                <LanguageSettings />
              </Suspense>
            } />
            <Route path="settings/notifications" element={
              <Suspense fallback={<LoadingFallback />}>
                <NotificationSettings />
              </Suspense>
            } />
          </Route>
        </Routes>
      </ErrorBoundary>
    </CustomerRoute>
  );
};

export default CustomerRoutes;
