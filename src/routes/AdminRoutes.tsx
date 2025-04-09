
import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Dashboard from '@/pages/Admin/Dashboard';
import Customers from '@/pages/Admin/Customers';
import CustomerDetail from '@/pages/Admin/CustomerDetail';
import Projects from '@/pages/Admin/Projects';
import ProjectDetail from '@/pages/Admin/ProjectDetail';
import WorkflowsManager from '@/pages/Admin/WorkflowsManager';

const AdminRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/customers" element={<Customers />} />
      <Route path="/customers/:id" element={<CustomerDetail />} />
      <Route path="/projects" element={<Projects />} />
      <Route path="/projects/:id" element={<ProjectDetail />} />
      <Route path="/workflows" element={<WorkflowsManager />} />
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
};

export default AdminRoutes;
