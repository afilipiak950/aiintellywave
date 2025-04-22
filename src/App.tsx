
import React, { useEffect } from 'react';
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
  useLocation,
} from 'react-router-dom';
import { useAuth } from './context/auth';
import { AuthProvider } from './context/auth/AuthProvider';
import AdminLayout from './components/layout/AdminLayout';
import Dashboard from './pages/Admin/Dashboard';
import Users from './pages/Admin/Customers';
import ManagerLayout from './components/layout/ManagerLayout';
import ManagerDashboard from './pages/Manager/Dashboard';
import ManagerCustomers from './pages/Manager/Customers';
import ManagerSettings from './pages/Manager/Settings';
import CustomerLayout from './components/layout/CustomerLayout';
import CustomerDashboard from './pages/Customer/Dashboard';
import CustomerSettings from './pages/Customer/Settings';
import { Toaster } from '@/components/ui/toaster';
import CustomerTablePage from './pages/Admin/CustomerTable';
import CheckDbCount from './pages/Admin/CheckDbCount';
import ErrorBoundary from './components/ErrorBoundary';

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
      {/* Public Routes */}
      <Route path="/" element={<div>Home Page</div>} />
      <Route path="/login" element={<div>Login Page</div>} />
      <Route path="/register" element={<div>Register Page</div>} />
      <Route path="/forgot-password" element={<div>Forgot Password Page</div>} />
      <Route path="/reset-password" element={<div>Reset Password Page</div>} />

      {/* Admin Routes */}
      {user?.role === 'admin' && (
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="users" element={<Users />} />
          <Route path="users/:userId" element={<div>User Details</div>} />
          <Route path="settings" element={<div>Settings</div>} />
          <Route path="customer-table" element={<CustomerTablePage />} />
          <Route path="customers/check-db-count" element={<CheckDbCount />} />
        </Route>
      )}

      {/* Manager Routes */}
      {user?.role === 'manager' && (
        <Route path="/manager" element={<ManagerLayout />}>
          <Route index element={<ManagerDashboard />} />
          <Route path="customers" element={<ManagerCustomers />} />
          <Route path="settings" element={<ManagerSettings />} />
        </Route>
      )}

      {/* Customer Routes */}
      {user?.role === 'customer' && (
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
            user.role === 'admin' ? (
              <Navigate to="/admin" replace />
            ) : user.role === 'manager' ? (
              <Navigate to="/manager" replace />
            ) : user.role === 'customer' ? (
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
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <LocationSensitiveRoutes />
        </Router>
        <Toaster />
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;
