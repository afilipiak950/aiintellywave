
import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Dashboard from '@/pages/Admin/Dashboard';
import Customers from '@/pages/Admin/Customers';
import CustomerDetail from '@/pages/Admin/CustomerDetail';
import Projects from '@/pages/Admin/Projects';
import ProjectCreate from '@/pages/Admin/ProjectCreate';
import ProjectDetail from '@/pages/Admin/ProjectDetail';
import Settings from '@/pages/Admin/Settings';
import Statistics from '@/pages/Admin/Statistics';
import TeamManagement from '@/pages/Admin/TeamManagement';
import WorkflowsManager from '@/pages/Admin/WorkflowsManager';
import Profile from '@/pages/Profile';

const AdminRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/customers" element={<Customers />} />
      <Route path="/customers/:id" element={<CustomerDetail />} />
      <Route path="/projects" element={<Projects />} />
      <Route path="/projects/new" element={<ProjectCreate />} />
      <Route path="/projects/:id" element={<ProjectDetail />} />
      <Route path="/settings/*" element={<Settings />} />
      <Route path="/statistics" element={<Statistics />} />
      <Route path="/team-management" element={<TeamManagement />} />
      <Route path="/workflows" element={<WorkflowsManager />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
};

export default AdminRoutes;
