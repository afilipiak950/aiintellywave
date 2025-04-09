
import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Dashboard from '@/pages/Customer/Dashboard';
import CustomerWorkflows from '@/pages/Customer/CustomerWorkflows';
import LeadDatabase from '@/pages/Customer/LeadDatabase';
import Appointments from '@/pages/Customer/Appointments';
import MiraAI from '@/pages/Customer/MiraAI';
import TrainAI from '@/pages/Customer/TrainAI';
import Integrations from '@/pages/Customer/Integrations';
import { lazy } from 'react';

// Import Pipeline component for deal pipeline route
import Pipeline from '@/pages/Customer/Pipeline';

// Import Manager KPI Dashboard component
import ManagerKPIDashboard from '@/pages/Customer/ManagerKPIDashboard';

// Import other components
import Profile from '@/pages/Customer/Profile';
import Outreach from '@/pages/Customer/Outreach';
import KiPersonas from '@/pages/Customer/KiPersonas';

const CustomerRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/lead-database" element={<LeadDatabase />} />
      <Route path="/deal-pipeline" element={<Pipeline />} />
      <Route path="/appointments" element={<Appointments />} />
      <Route path="/manager-kpi" element={<ManagerKPIDashboard />} />
      <Route path="/mira-ai" element={<MiraAI />} />
      <Route path="/train-ai" element={<TrainAI />} />
      <Route path="/email-campaigns" element={<CustomerWorkflows />} />
      <Route path="/outreach" element={<Outreach />} />
      <Route path="/integrations" element={<Integrations />} />
      <Route path="/personas" element={<KiPersonas />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="*" element={<Navigate to="/customer" replace />} />
    </Routes>
  );
};

export default CustomerRoutes;
