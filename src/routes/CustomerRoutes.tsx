
import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Dashboard from '@/pages/Customer/Dashboard';
import Projects from '@/pages/Customer/Projects';
import ProjectDetail from '@/pages/Customer/ProjectDetail';
import Profile from '@/pages/Customer/Profile';
import Settings from '@/pages/Customer/Settings';
import SearchStrings from '@/pages/Customer/SearchStrings';
import TrainAI from '@/pages/Customer/TrainAI';
import KiPersonas from '@/pages/Customer/KiPersonas';
import MiraAI from '@/pages/Customer/MiraAI';
import Pipeline from '@/pages/Customer/Pipeline';
import LeadDatabase from '@/pages/Customer/LeadDatabase';
import Outreach from '@/pages/Customer/Outreach';
import ManagerKPIDashboard from '@/pages/Customer/ManagerKPIDashboard';
import StatisticsComingSoon from '@/pages/Statistics/StatisticsComingSoon';
import Integrations from '@/pages/Customer/Integrations';

const CustomerRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/projects" element={<Projects />} />
      <Route path="/projects/:id" element={<ProjectDetail />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/settings/*" element={<Settings />} />
      <Route path="/search-strings" element={<SearchStrings />} />
      <Route path="/train-ai" element={<TrainAI />} />
      <Route path="/ki-personas" element={<KiPersonas />} />
      <Route path="/mira-ai" element={<MiraAI />} />
      <Route path="/pipeline" element={<Pipeline />} />
      <Route path="/lead-database" element={<LeadDatabase />} />
      <Route path="/outreach" element={<Outreach />} />
      <Route path="/manager-kpi" element={<ManagerKPIDashboard />} />
      <Route path="/statistics" element={<StatisticsComingSoon />} />
      <Route path="/integrations" element={<Integrations />} />
      <Route path="*" element={<Navigate to="/customer" replace />} />
    </Routes>
  );
};

export default CustomerRoutes;
