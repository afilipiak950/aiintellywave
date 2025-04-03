
import React from 'react';
import { lazy } from 'react';

// Import the Admin version of the Manager KPI Dashboard
const AdminManagerKPIDashboard = lazy(() => import('../Admin/ManagerKPIDashboard'));

// This is a wrapper component that uses the Admin version
const CustomerManagerKPIDashboard = () => {
  return <AdminManagerKPIDashboard />;
};

export default CustomerManagerKPIDashboard;
