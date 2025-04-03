
import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Dashboard from '@/pages/Manager/Dashboard';
import Projects from '@/pages/Manager/Projects';
import ProjectDetail from '@/pages/Manager/ProjectDetail';
import Customers from '@/pages/Manager/Customers';
import Pipeline from '@/pages/Manager/Pipeline';
import MiraAI from '@/pages/Manager/MiraAI';
import KiPersonas from '@/pages/Manager/KiPersonas';
import TrainAI from '@/pages/Manager/TrainAI';
import LeadDatabase from '@/pages/Manager/LeadDatabase';
import ManagerKPIDashboard from '@/pages/Manager/ManagerKPIDashboard';

const ManagerRoutes = () => {
  return (
    <Routes>
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/projects" element={<Projects />} />
      <Route path="/projects/:id" element={<ProjectDetail />} />
      <Route path="/customers" element={<Customers />} />
      <Route path="/pipeline" element={<Pipeline />} />
      <Route path="/ki-personas" element={<KiPersonas />} />
      <Route path="/mira-ai" element={<MiraAI />} />
      <Route path="/train-ai" element={<TrainAI />} />
      <Route path="/lead-database" element={<LeadDatabase />} />
      <Route path="/manager-kpi" element={<ManagerKPIDashboard />} />
      {/* Default route for manager/* redirects to dashboard */}
      <Route path="/" element={<Dashboard />} />
    </Routes>
  );
};

export default ManagerRoutes;
