
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";

import AdminLayout from "./components/layout/AdminLayout";
import CustomerLayout from "./components/layout/CustomerLayout";

import Index from "./pages/Index";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import NotFound from "./pages/NotFound";

// Admin pages
import AdminDashboard from "./pages/Admin/Dashboard";
import AdminCustomers from "./pages/Admin/Customers";
import AdminProjects from "./pages/Admin/Projects";

// Customer pages
import CustomerDashboard from "./pages/Customer/Dashboard";
import CustomerProjects from "./pages/Customer/Projects";

const queryClient = new QueryClient();

// Protected route component for admin routes
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  
  if (!isAuthenticated || !isAdmin) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

// Protected route component for customer routes
const CustomerRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isCustomer, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  
  if (!isAuthenticated || !isCustomer) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
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
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
