
import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Dashboard from '@/pages/Admin/Dashboard';
import Projects from '@/pages/Admin/Projects';
import Customers from '@/pages/Admin/Customers';
import RevenueDashboard from '@/pages/Admin/RevenueDashboard';
// Import the new ManagerKPIDashboard
import ManagerKPIDashboard from '@/pages/Admin/ManagerKPIDashboard';

const AdminRoutes = () => {
  return (
    <Routes>
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/projects" element={<Projects />} />
      <Route path="/customers" element={<Customers />} />
      <Route path="/revenue" element={<RevenueDashboard />} />
      {/* Add route for Manager KPI Dashboard */}
      <Route path="/manager-kpi" element={<ManagerKPIDashboard />} />
      {/* Default route for admin/* redirects to dashboard */}
      <Route path="/" element={<Dashboard />} />
    </Routes>
  );
};

export default AdminRoutes;
