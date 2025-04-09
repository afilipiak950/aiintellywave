
import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Dashboard from '@/pages/Customer/Dashboard';
import CustomerWorkflows from '@/pages/Customer/CustomerWorkflows';
import LeadDatabase from '@/pages/Customer/LeadDatabase';
import DealPipeline from '@/pages/Customer/DealPipeline';
import Appointments from '@/pages/Customer/Appointments';
import ManagerKPI from '@/pages/Customer/ManagerKPI';
import MiraAI from '@/pages/Customer/MiraAI';
import TrainAI from '@/pages/Customer/TrainAI';
import UserProfile from '@/pages/Customer/UserProfile';
import Integrations from '@/pages/Customer/Integrations';
import OutreachPage from '@/pages/Customer/OutreachPage';
import PersonasPage from '@/pages/Customer/PersonasPage';

const CustomerRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/lead-database" element={<LeadDatabase />} />
      <Route path="/deal-pipeline" element={<DealPipeline />} />
      <Route path="/appointments" element={<Appointments />} />
      <Route path="/manager-kpi" element={<ManagerKPI />} />
      <Route path="/mira-ai" element={<MiraAI />} />
      <Route path="/train-ai" element={<TrainAI />} />
      <Route path="/email-campaigns" element={<CustomerWorkflows />} />
      <Route path="/outreach" element={<OutreachPage />} />
      <Route path="/integrations" element={<Integrations />} />
      <Route path="/personas" element={<PersonasPage />} />
      <Route path="/profile" element={<UserProfile />} />
      <Route path="*" element={<Navigate to="/customer" replace />} />
    </Routes>
  );
};

export default CustomerRoutes;
