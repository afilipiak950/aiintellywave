
import { Navigate, Route } from 'react-router-dom';
import { ManagerRoute } from '../components/auth/ProtectedRoutes';
import ManagerLayout from '../components/layout/ManagerLayout';
import ManagerDashboard from '../pages/Manager/Dashboard';
import ManagerCustomers from '../pages/Manager/Customers';
import ManagerProjects from '../pages/Manager/Projects';

export const ManagerRoutes = (
  <Route 
    path="/manager" 
    element={
      <ManagerRoute>
        <ManagerLayout />
      </ManagerRoute>
    }
  >
    <Route path="dashboard" element={<ManagerDashboard />} />
    <Route path="customers" element={<ManagerCustomers />} />
    <Route path="projects" element={<ManagerProjects />} />
    <Route index element={<Navigate to="/manager/dashboard" replace />} />
  </Route>
);
