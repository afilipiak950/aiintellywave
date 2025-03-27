
import { lazy } from 'react';
import { Route, Routes } from 'react-router-dom';
import CustomerLayout from '../components/layout/CustomerLayout';

// Lazy-loaded pages
const Dashboard = lazy(() => import('../pages/Customer/Dashboard'));
const Projects = lazy(() => import('../pages/Customer/Projects'));
const ProjectDetail = lazy(() => import('../pages/Customer/ProjectDetail'));
const Pipeline = lazy(() => import('../pages/Customer/Pipeline'));
const LeadDatabase = lazy(() => import('../pages/Customer/LeadDatabase'));
const MiraAI = lazy(() => import('../pages/Customer/MiraAI'));
const Appointments = lazy(() => import('../pages/Customer/Appointments'));
const Statistics = lazy(() => import('../pages/Customer/Statistics'));
const KiPersonas = lazy(() => import('../pages/Manager/KiPersonas'));
const EmailAuthCallback = lazy(() => import('../pages/KiPersonas/EmailAuthCallback'));

const CustomerRoutes = () => {
  return (
    <Routes>
      <Route element={<CustomerLayout />}>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="projects" element={<Projects />} />
        <Route path="projects/:id" element={<ProjectDetail />} />
        <Route path="pipeline" element={<Pipeline />} />
        <Route path="lead-database" element={<LeadDatabase />} />
        <Route path="mira-ai" element={<MiraAI />} />
        <Route path="appointments" element={<Appointments />} />
        <Route path="statistics" element={<Statistics />} />
        <Route path="ki-personas" element={<KiPersonas />} />
      </Route>
      <Route path="email-auth-callback" element={<EmailAuthCallback />} />
    </Routes>
  );
};

export default CustomerRoutes;
