
import { Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy, memo } from 'react';
import AdminRoutes from './AdminRoutes';
import ManagerRoutes from './ManagerRoutes';
import CustomerRoutes from './CustomerRoutes';
import { PublicRoutes } from './PublicRoutes';
import CustomerLayout from '@/components/layout/CustomerLayout';
import ManagerLayout from '@/components/layout/ManagerLayout';
import AdminLayout from '@/components/layout/AdminLayout';

// Loading fallback component
const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
  </div>
);

// Memoize routes to prevent unnecessary re-renders
const MemoizedCustomerRoutes = memo(CustomerRoutes);
const MemoizedManagerRoutes = memo(ManagerRoutes);
const MemoizedAdminRoutes = memo(AdminRoutes);

export const AppRoutes = () => {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        {/* Public routes */}
        {PublicRoutes}
        
        {/* Protected routes with layouts */}
        <Route path="/admin/*" element={<AdminLayout />}>
          <Route path="*" element={<MemoizedAdminRoutes />} />
        </Route>
        
        <Route path="/manager/*" element={<ManagerLayout />}>
          <Route path="*" element={<MemoizedManagerRoutes />} />
        </Route>
        
        <Route path="/customer/*" element={<CustomerLayout />}>
          <Route path="*" element={<MemoizedCustomerRoutes />} />
        </Route>
        
        {/* Redirect root path to customer dashboard for now */}
        <Route path="/" element={<Navigate to="/customer/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/customer/dashboard" replace />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
