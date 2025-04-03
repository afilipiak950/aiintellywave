
import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Dashboard from '@/pages/Admin/Dashboard';
import Projects from '@/pages/Admin/Projects';
import ProjectDetail from '@/pages/Admin/ProjectDetail';
import Customers from '@/pages/Admin/Customers';
import CustomerDetail from '@/pages/Admin/CustomerDetail';
import RevenueDashboard from '@/pages/Admin/RevenueDashboard';
import WorkflowsManager from '@/pages/Admin/WorkflowsManager';

const AdminRoutes = () => {
  return (
    <Routes>
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/projects" element={<Projects />} />
      <Route path="/projects/:id" element={<ProjectDetail />} />
      <Route path="/customers" element={<Customers />} />
      <Route path="/customers/:id" element={<CustomerDetail />} />
      <Route path="/revenue" element={<RevenueDashboard />} />
      <Route path="/workflows" element={<WorkflowsManager />} />
      <Route path="/" element={<Dashboard />} />
    </Routes>
  );
};

export default AdminRoutes;
