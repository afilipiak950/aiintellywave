
import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Dashboard from '@/pages/Customer/Dashboard';
import Projects from '@/pages/Customer/Projects';
import ProjectDetail from '@/pages/Customer/ProjectDetail';
import LeadDatabase from '@/pages/Customer/LeadDatabase';
import Appointments from '@/pages/Customer/Appointments';
import Integrations from '@/pages/Customer/Integrations';
import CustomerWorkflows from '@/pages/Customer/CustomerWorkflows';
import Profile from '@/pages/Customer/Profile';
import Settings from '@/pages/Customer/Settings';
import Pipeline from '@/pages/Customer/Pipeline';
import CustomerOutreach from '@/pages/Customer/Outreach';
import MiraAI from '@/pages/Customer/MiraAI';
import KiPersonas from '@/pages/Customer/KiPersonas';
import TrainAI from '@/pages/Customer/TrainAI';
import Statistics from '@/pages/Customer/Statistics';

const CustomerRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/projects" element={<Projects />} />
      <Route path="/projects/:id" element={<ProjectDetail />} />
      <Route path="/lead-database" element={<LeadDatabase />} />
      <Route path="/appointments" element={<Appointments />} />
      <Route path="/integrations" element={<Integrations />} />
      <Route path="/workflows" element={<CustomerWorkflows />} />
      <Route path="/pipeline" element={<Pipeline />} />
      <Route path="/outreach" element={<CustomerOutreach />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/settings/*" element={<Settings />} />
      <Route path="/mira-ai" element={<MiraAI />} />
      <Route path="/ki-personas" element={<KiPersonas />} />
      <Route path="/train-ai" element={<TrainAI />} />
      <Route path="/statistics" element={<Statistics />} />
      <Route path="*" element={<Navigate to="/customer" replace />} />
    </Routes>
  );
};

export default CustomerRoutes;
