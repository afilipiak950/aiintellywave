
import React from 'react';
import { Route } from 'react-router-dom';
import Dashboard from '@/pages/Manager/Dashboard';
import Projects from '@/pages/Manager/Projects';
import ProjectDetail from '@/pages/Manager/ProjectDetail';
import Customers from '@/pages/Manager/Customers';
import Pipeline from '@/pages/Manager/Pipeline';
import MiraAI from '@/pages/Manager/MiraAI';
import KiPersonas from '@/pages/Manager/KiPersonas';
import TrainAI from '@/pages/Manager/TrainAI';
import LeadDatabase from '@/pages/Manager/LeadDatabase';
import ManagerKPIDashboard from '@/pages/Admin/ManagerKPIDashboard'; // Reuse Admin component

export const ManagerRoutes = (
  <>
    <Route path="/manager/dashboard" element={<Dashboard />} />
    <Route path="/manager/projects" element={<Projects />} />
    <Route path="/manager/projects/:id" element={<ProjectDetail />} />
    <Route path="/manager/customers" element={<Customers />} />
    <Route path="/manager/pipeline" element={<Pipeline />} />
    <Route path="/manager/ki-personas" element={<KiPersonas />} />
    <Route path="/manager/mira-ai" element={<MiraAI />} />
    <Route path="/manager/train-ai" element={<TrainAI />} />
    <Route path="/manager/lead-database" element={<LeadDatabase />} />
    <Route path="/manager/manager-kpi" element={<ManagerKPIDashboard />} />
  </>
);

export default ManagerRoutes;
