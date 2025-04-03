
import React from 'react';
import { Route } from 'react-router-dom';
import Dashboard from '@/pages/Admin/Dashboard';
import Projects from '@/pages/Admin/Projects';
import Customers from '@/pages/Admin/Customers';
import RevenueDashboard from '@/pages/Admin/RevenueDashboard';
// Import the new ManagerKPIDashboard
import ManagerKPIDashboard from '@/pages/Admin/ManagerKPIDashboard';

// Change to named export to match the import in AppRoutes.tsx
export const AdminRoutes = (
  <>
    <Route path="/admin/dashboard" element={<Dashboard />} />
    <Route path="/admin/projects" element={<Projects />} />
    <Route path="/admin/customers" element={<Customers />} />
    <Route path="/admin/revenue" element={<RevenueDashboard />} />
    {/* Add route for Manager KPI Dashboard */}
    <Route path="/admin/manager-kpi" element={<ManagerKPIDashboard />} />
  </>
);
