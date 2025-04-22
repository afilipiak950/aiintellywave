
import { Routes, Route } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import AdminRoutes from './AdminRoutes';
import ManagerRoutes from './ManagerRoutes';
import CustomerRoutes from './CustomerRoutes';
import { PublicRoutes } from './PublicRoutes';
import CustomerLayout from '@/components/layout/CustomerLayout';
import ManagerLayout from '@/components/layout/ManagerLayout';
import AdminLayout from '@/components/layout/AdminLayout';
import NotFound from '@/pages/NotFound';
import Index from '@/pages/Index';

// Loading fallback component
const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="flex flex-col items-center gap-2">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      <p className="ml-3 text-primary">Lade Anwendung...</p>
    </div>
  </div>
);

export const AppRoutes = () => {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        {/* Home route */}
        <Route path="/" element={<Index />} />
        
        {/* Public routes */}
        {PublicRoutes}
        
        {/* Protected routes with layouts */}
        <Route path="/admin/*" element={<AdminLayout />}>
          {AdminRoutes}
        </Route>
        
        <Route path="/manager/*" element={<ManagerLayout />}>
          {ManagerRoutes}
        </Route>
        
        <Route path="/customer/*" element={<CustomerLayout />}>
          {CustomerRoutes}
        </Route>
        
        {/* 404 route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
