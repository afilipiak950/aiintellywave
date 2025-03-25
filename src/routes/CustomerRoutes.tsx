
import { Navigate, Route } from 'react-router-dom';
import { CustomerRoute } from '../components/auth/ProtectedRoutes';
import CustomerLayout from '../components/layout/CustomerLayout';
import CustomerDashboard from '../pages/Customer/Dashboard';
import CustomerProjects from '../pages/Customer/Projects';
import CustomerProjectDetail from '../pages/Customer/ProjectDetail';

export const CustomerRoutes = (
  <Route 
    path="/customer" 
    element={
      <CustomerRoute>
        <CustomerLayout />
      </CustomerRoute>
    }
  >
    <Route path="dashboard" element={<CustomerDashboard />} />
    <Route path="projects" element={<CustomerProjects />} />
    <Route path="projects/:id" element={<CustomerProjectDetail />} />
    <Route index element={<Navigate to="/customer/dashboard" replace />} />
  </Route>
);
