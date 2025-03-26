
import { Navigate, Route } from 'react-router-dom';
import { AdminRoute } from '../components/auth/ProtectedRoutes';
import AdminLayout from '../components/layout/AdminLayout';
import AdminDashboard from '../pages/Admin/Dashboard';
import AdminCustomers from '../pages/Admin/Customers';
import AdminProjects from '../pages/Admin/Projects';
import AdminProjectDetail from '../pages/Admin/ProjectDetail';
import CustomerDetail from '../pages/Admin/CustomerDetail';

export const AdminRoutes = (
  <Route 
    path="/admin" 
    element={
      <AdminRoute>
        <AdminLayout />
      </AdminRoute>
    }
  >
    <Route path="dashboard" element={<AdminDashboard />} />
    <Route path="customers" element={<AdminCustomers />} />
    <Route path="customers/:customerId" element={<CustomerDetail />} />
    <Route path="projects" element={<AdminProjects />} />
    <Route path="projects/:id" element={<AdminProjectDetail />} />
    <Route index element={<Navigate to="/admin/dashboard" replace />} />
  </Route>
);
