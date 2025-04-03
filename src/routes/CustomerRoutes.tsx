
import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import Dashboard from '@/pages/Customer/Dashboard';
import Projects from '@/pages/Customer/Projects';
import ProjectDetail from '@/pages/Customer/ProjectDetail';
import Pipeline from '@/pages/Customer/Pipeline';
import MiraAI from '@/pages/Customer/MiraAI';
import KiPersonas from '@/pages/Customer/KiPersonas';
import TrainAI from '@/pages/Customer/TrainAI';
import LeadDatabase from '@/pages/Customer/LeadDatabase';
import ManagerKPIDashboard from '@/pages/Customer/ManagerKPIDashboard';
import Integrations from '@/pages/Customer/Integrations';
import Statistics from '@/pages/Customer/Statistics';
import Outreach from '@/pages/Customer/Outreach';
import Appointments from '@/pages/Customer/Appointments';
import CustomerProfile from '@/pages/Customer/Profile';
import CustomerSettings from '@/pages/Customer/Settings';

const CustomerRoutes = () => {
  return (
    <Routes>
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/projects" element={<Projects />} />
      <Route path="/projects/:id" element={<ProjectDetail />} />
      <Route path="/pipeline" element={<Pipeline />} />
      <Route path="/lead-database" element={<LeadDatabase />} />
      <Route path="/mira-ai" element={<MiraAI />} />
      <Route path="/ki-personas" element={<KiPersonas />} />
      <Route path="/train-ai" element={<TrainAI />} />
      <Route path="/integrations" element={<Integrations />} />
      <Route path="/statistics" element={<Statistics />} />
      <Route path="/outreach" element={<Outreach />} />
      <Route path="/appointments" element={<Appointments />} />
      
      {/* Settings routes */}
      <Route path="/settings" element={<Navigate to="/customer/settings/profile" replace />} />
      <Route path="/settings/profile" element={<CustomerProfile />} />
      <Route path="/settings/account" element={<CustomerSettings />} />
      <Route path="/settings/security" element={<CustomerSettings />} />
      <Route path="/settings/notifications" element={<CustomerSettings />} />
      <Route path="/settings/billing" element={<CustomerSettings />} />
      
      {/* Default route for customer/* redirects to dashboard */}
      <Route path="/" element={<Dashboard />} />
    </Routes>
  );
};

export default CustomerRoutes;
