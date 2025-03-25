
import { Navigate, Route } from 'react-router-dom';
import { AdminRoute } from '../components/auth/ProtectedRoutes';
import AdminLayout from '../components/layout/AdminLayout';
import AdminDashboard from '../pages/Admin/Dashboard';
import AdminCustomers from '../pages/Admin/Customers';
import AdminProjects from '../pages/Admin/Projects';

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
    <Route path="projects" element={<AdminProjects />} />
    <Route index element={<Navigate to="/admin/dashboard" replace />} />
  </Route>
);
