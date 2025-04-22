import React, { useEffect } from 'react';
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
  useLocation,
} from 'react-router-dom';
import { useAuth } from './context/auth';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import AdminLayout from './components/layout/AdminLayout';
import Dashboard from './pages/Admin/Dashboard';
import Users from './pages/Admin/Customers';
import UserDetails from './pages/Admin/UserDetails';
import Settings from './pages/Admin/Settings';
import ManagerLayout from './components/layout/ManagerLayout';
import ManagerDashboard from './pages/Manager/Dashboard';
import ManagerCustomers from './pages/Manager/Customers';
import ManagerSettings from './pages/Manager/Settings';
import CustomerLayout from './components/layout/CustomerLayout';
import CustomerDashboard from './pages/Customer/Dashboard';
import CustomerSettings from './pages/Customer/Settings';
import PublicPage from './pages/PublicPage';
import { Toast } from '@/components/ui/toast';
import CustomerTablePage from './pages/Admin/CustomerTable';

// Add the new import for CheckDbCount
import CheckDbCount from './pages/Admin/CheckDbCount';

// A wrapper for Routes that uses useLocation
function LocationSensitiveRoutes() {
  const location = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    console.log('Current route:', location.pathname);
    console.log('Current user:', user);
  }, [location, user]);

  return (
    <Routes>
      <Route path="/" element={<PublicPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Admin Routes */}
      {user?.app_metadata?.role === 'admin' && (
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="users" element={<Users />} />
          <Route path="users/:userId" element={<UserDetails />} />
          <Route path="settings" element={<Settings />} />
          <Route path="customer-table" element={<CustomerTablePage />} />
          {/* Add the new route under the Admin layout: */}
          <Route path="customers/check-db-count" element={<CheckDbCount />} />
        </Route>
      )}

      {/* Manager Routes */}
      {user?.app_metadata?.role === 'manager' && (
        <Route path="/manager" element={<ManagerLayout />}>
          <Route index element={<ManagerDashboard />} />
          <Route path="customers" element={<ManagerCustomers />} />
          <Route path="settings" element={<ManagerSettings />} />
        </Route>
      )}

      {/* Customer Routes */}
      {user?.app_metadata?.role === 'customer' && (
        <Route path="/customer" element={<CustomerLayout />}>
          <Route index element={<CustomerDashboard />} />
          <Route path="settings" element={<CustomerSettings />} />
        </Route>
      )}

      {/* Default Route - Navigate based on role or to public if no role */}
      <Route
        path="*"
        element={
          user ? (
            user.app_metadata?.role === 'admin' ? (
              <Navigate to="/admin" replace />
            ) : user.app_metadata?.role === 'manager' ? (
              <Navigate to="/manager" replace />
            ) : user.app_metadata?.role === 'customer' ? (
              <Navigate to="/customer" replace />
            ) : (
              <Navigate to="/" replace />
            )
          ) : (
            <Navigate to="/" replace />
          )
        }
      />
    </Routes>
  );
}

const App: React.FC = () => {
  return (
    <>
      <Router>
        <LocationSensitiveRoutes />
      </Router>
      <Toast />
    </>
  );
};

export default App;
