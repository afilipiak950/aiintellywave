
import React from 'react';
import { Route, Routes } from 'react-router-dom';

import Dashboard from '@/pages/Customer/Dashboard';
import Projects from '@/pages/Customer/Projects';
import ProjectDetail from '@/pages/Customer/ProjectDetail';
import Pipeline from '@/pages/Customer/Pipeline';
import Outreach from '@/pages/Customer/Outreach';
import Statistics from '@/pages/Customer/Statistics';
import Settings from '@/pages/Customer/Settings';
import Profile from '@/pages/Customer/Profile';
import MiraAI from '@/pages/Customer/MiraAI';
import KiPersonas from '@/pages/Customer/KiPersonas';
import LeadDatabase from '@/pages/Customer/LeadDatabase';
import TrainAI from '@/pages/Customer/TrainAI';
import ManagerKPIDashboard from '@/pages/Customer/ManagerKPIDashboard';
import Appointments from '@/pages/Customer/Appointments';
import CustomerWorkflows from '@/pages/Customer/CustomerWorkflows';

const CustomerRoutes = () => {
  return (
    <Routes>
      {/* Dashboard Routes */}
      <Route path="/dashboard" element={<Dashboard />} />

      {/* Project Routes */}
      <Route path="/projects" element={<Projects />} />
      <Route path="/projects/:id" element={<ProjectDetail />} />
      <Route path="/pipeline" element={<Pipeline />} />
      
      {/* Lead Routes */}
      <Route path="/lead-database" element={<LeadDatabase />} />

      {/* AI Tools */}
      <Route path="/mira-ai" element={<MiraAI />} />
      <Route path="/ki-personas" element={<KiPersonas />} />
      <Route path="/train-ai" element={<TrainAI />} />
      <Route path="/manager-kpi" element={<ManagerKPIDashboard />} />
      
      {/* Utilities */}
      <Route path="/workflows" element={<CustomerWorkflows />} /> {/* Route is kept but hidden from navigation */}
      <Route path="/outreach" element={<Outreach />} />
      <Route path="/statistics" element={<Statistics />} />
      <Route path="/appointments" element={<Appointments />} />
      
      {/* Settings */}
      <Route path="/settings/*" element={<Settings />} />
      <Route path="/profile" element={<Profile />} />
      
      {/* Default route */}
      <Route path="/" element={<Dashboard />} />
    </Routes>
  );
};

export default CustomerRoutes;
