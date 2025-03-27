
import { lazy } from 'react';
import { Route, Routes } from 'react-router-dom';
import CustomerLayout from '../components/layout/CustomerLayout';

// Lazy-loaded pages with error boundaries
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
const Outreach = lazy(() => import('../pages/Customer/Outreach'));
const Profile = lazy(() => import('../pages/Settings/ProfilePage')); // Add Profile import

const CustomerRoutes = () => {
  return (
    <Routes>
      <Route element={<CustomerLayout />}>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="projects" element={<Projects />} />
        <Route path="projects/:id" element={<ProjectDetail />} />
        <Route path="pipeline" element={<Pipeline />} />
        <Route path="lead-database" element={<LeadDatabase />} />
        <Route path="leads" element={<LeadDatabase />} /> {/* Added route alias for /leads */}
        <Route path="mira-ai" element={<MiraAI />} />
        <Route path="ai" element={<MiraAI />} /> {/* Added route alias for /ai */}
        <Route path="appointments" element={<Appointments />} />
        <Route path="statistics" element={<Statistics />} />
        <Route path="ki-personas" element={<KiPersonas />} />
        <Route path="outreach" element={<Outreach />} />
        <Route path="profile" element={<Profile />} /> {/* Add Profile route */}
      </Route>
      <Route path="email-auth-callback" element={<EmailAuthCallback />} />
    </Routes>
  );
};

export default CustomerRoutes;
