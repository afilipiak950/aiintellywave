
import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Dashboard from '@/pages/Admin/Dashboard';
import Customers from '@/pages/Admin/Customers';
import CustomerDetail from '@/pages/Admin/CustomerDetail';
import Projects from '@/pages/Admin/Projects';
import ProjectDetail from '@/pages/Admin/ProjectDetail';
import WorkflowsPage from '@/pages/Admin/WorkflowsPage';
import InstantlyDashboard from '@/pages/Admin/InstantlyDashboard';
import RevenueDashboard from '@/pages/Admin/RevenueDashboard';
import SearchStrings from '@/pages/Admin/SearchStrings';
import MiraAI from '@/pages/Admin/MiraAI';

const AdminRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/customers" element={<Customers />} />
      <Route path="/customers/:id" element={<CustomerDetail />} />
      <Route path="/projects" element={<Projects />} />
      <Route path="/projects/:id" element={<ProjectDetail />} />
      <Route path="/workflows" element={<WorkflowsPage />} />
      <Route path="/search-strings" element={<SearchStrings />} />
      <Route path="/instantly" element={<InstantlyDashboard />} />
      <Route path="/revenue" element={<RevenueDashboard />} />
      <Route path="/mira-ai" element={<MiraAI />} />
      <Route path="/users" element={<Customers />} />
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
};

export default AdminRoutes;
