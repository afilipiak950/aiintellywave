
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";

import AdminLayout from "./components/layout/AdminLayout";
import CustomerLayout from "./components/layout/CustomerLayout";
import ManagerLayout from "./components/layout/ManagerLayout";

import Index from "./pages/Index";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import NotFound from "./pages/NotFound";

// Admin pages
import AdminDashboard from "./pages/Admin/Dashboard";
import AdminCustomers from "./pages/Admin/Customers";
import AdminProjects from "./pages/Admin/Projects";

// Manager pages
import ManagerDashboard from "./pages/Manager/Dashboard";
import ManagerCustomers from "./pages/Manager/Customers";
import ManagerProjects from "./pages/Manager/Projects";

// Customer pages
import CustomerDashboard from "./pages/Customer/Dashboard";
import CustomerProjects from "./pages/Customer/Projects";

const queryClient = new QueryClient();

// Handles redirecting the user based on their role
const AuthRedirect = () => {
  const { isAuthenticated, isAdmin, isManager, isCustomer, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      // Only redirect if we're not already on the login or register page
      if (location.pathname !== '/login' && location.pathname !== '/register') {
        navigate('/login');
      }
      return;
    }

    // Redirect based on role if we're at root, login, or register pages
    const publicPaths = ['/', '/login', '/register'];
    if (publicPaths.includes(location.pathname)) {
      if (isAdmin) {
        navigate('/admin/dashboard');
      } else if (isManager) {
        navigate('/manager/dashboard');
      } else if (isCustomer) {
        navigate('/customer/dashboard');
      }
    }
  }, [isAuthenticated, isAdmin, isManager, isCustomer, isLoading, navigate, location.pathname]);

  return null;
};

// Protected route component for admin routes
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (isLoading) return;
    
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    if (!isAdmin) {
      navigate('/');
      return;
    }
  }, [isAuthenticated, isAdmin, isLoading, navigate]);
  
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  
  if (!isAuthenticated || !isAdmin) {
    return null;
  }
  
  return <>{children}</>;
};

// Protected route component for manager routes
const ManagerRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isManager, isLoading } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (isLoading) return;
    
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    if (!isManager) {
      navigate('/');
      return;
    }
  }, [isAuthenticated, isManager, isLoading, navigate]);
  
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  
  if (!isAuthenticated || !isManager) {
    return null;
  }
  
  return <>{children}</>;
};

// Protected route component for customer routes
const CustomerRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isCustomer, isLoading } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (isLoading) return;
    
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    if (!isCustomer) {
      navigate('/');
      return;
    }
  }, [isAuthenticated, isCustomer, isLoading, navigate]);
  
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  
  if (!isAuthenticated || !isCustomer) {
    return null;
  }
  
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <AuthRedirect />
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Admin routes */}
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
            
            {/* Manager routes */}
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
            
            {/* Customer routes */}
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
              <Route index element={<Navigate to="/customer/dashboard" replace />} />
            </Route>
            
            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </TooltipProvider>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
