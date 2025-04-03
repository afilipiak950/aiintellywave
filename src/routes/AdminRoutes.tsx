
import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Dashboard from '@/pages/Admin/Dashboard';
import Projects from '@/pages/Admin/Projects';
import Customers from '@/pages/Admin/Customers';
import CustomerDetail from '@/pages/Admin/CustomerDetail';
import RevenueDashboard from '@/pages/Admin/RevenueDashboard';
import ManagerKPIDashboard from '@/pages/Admin/ManagerKPIDashboard';

const AdminRoutes = () => {
  return (
    <Routes>
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/projects" element={<Projects />} />
      <Route path="/customers" element={<Customers />} />
      <Route path="/customers/:id" element={<CustomerDetail />} />
      <Route path="/revenue" element={<RevenueDashboard />} />
      <Route path="/manager-kpi" element={<ManagerKPIDashboard />} />
      <Route path="/" element={<Dashboard />} />
    </Routes>
  );
};

export default AdminRoutes;
