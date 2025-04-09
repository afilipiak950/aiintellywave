
import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Dashboard from '@/pages/Customer/Dashboard';
import Projects from '@/pages/Customer/Projects';
import ProjectDetail from '@/pages/Customer/ProjectDetail';
import LeadDatabase from '@/pages/Customer/LeadDatabase'; // Fixed import using existing LeadDatabase
import Appointments from '@/pages/Customer/Appointments';
import Integrations from '@/pages/Customer/Integrations';
import CustomerWorkflows from '@/pages/Customer/CustomerWorkflows';

const CustomerRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/projects" element={<Projects />} />
      <Route path="/projects/:id" element={<ProjectDetail />} />
      <Route path="/leads" element={<LeadDatabase />} /> {/* Using LeadDatabase component */}
      <Route path="/appointments" element={<Appointments />} />
      <Route path="/integrations" element={<Integrations />} />
      <Route path="/workflows" element={<CustomerWorkflows />} />
      <Route path="*" element={<Navigate to="/customer" replace />} />
    </Routes>
  );
};

export default CustomerRoutes;
