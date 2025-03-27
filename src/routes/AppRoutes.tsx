
import { Routes, Route } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { AdminRoutes } from './AdminRoutes';
import { ManagerRoutes } from './ManagerRoutes';
import CustomerRoutes from './CustomerRoutes';
import { PublicRoutes } from './PublicRoutes';

// Loading fallback component
const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
  </div>
);

export const AppRoutes = () => {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        {/* Public routes */}
        {PublicRoutes}
        
        {/* Protected routes */}
        {AdminRoutes}
        {ManagerRoutes}
        <Route path="/customer/*" element={<CustomerRoutes />} />
      </Routes>
    </Suspense>
  );
};
