
import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Dashboard from '@/pages/Customer/Dashboard';
import Projects from '@/pages/Customer/Projects';
import ProjectDetail from '@/pages/Customer/ProjectDetail';
import LeadDatabase from '@/pages/Customer/LeadDatabase';
import Profile from '@/pages/Customer/Profile';
import Settings from '@/pages/Customer/Settings';
import TrainAI from '@/pages/Customer/TrainAI';
import MiraAI from '@/pages/Customer/MiraAI';
import KiPersonas from '@/pages/Customer/KiPersonas';
import Statistics from '@/pages/Customer/Statistics';
import Outreach from '@/pages/Customer/Outreach';
import Appointments from '@/pages/Customer/Appointments';
import Integrations from '@/pages/Customer/Integrations';
import ManagerKPIDashboard from '@/pages/Customer/ManagerKPIDashboard';
import CustomerWorkflows from '@/pages/Customer/CustomerWorkflows';

const CustomerRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/projects" element={<Projects />} />
      <Route path="/projects/:id" element={<ProjectDetail />} />
      <Route path="/leads" element={<LeadDatabase />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/settings/*" element={<Settings />} />
      <Route path="/train-ai" element={<TrainAI />} />
      <Route path="/mira" element={<MiraAI />} />
      <Route path="/personas" element={<KiPersonas />} />
      <Route path="/statistics" element={<Statistics />} />
      <Route path="/outreach" element={<Outreach />} />
      <Route path="/appointments" element={<Appointments />} />
      <Route path="/integrations" element={<Integrations />} />
      <Route path="/kpi" element={<ManagerKPIDashboard />} />
      <Route path="/workflows" element={<CustomerWorkflows />} />
    </Routes>
  );
};

export default CustomerRoutes;
