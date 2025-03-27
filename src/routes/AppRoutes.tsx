
import { Routes, Route } from 'react-router-dom';
import { AdminRoutes } from './AdminRoutes';
import { ManagerRoutes } from './ManagerRoutes';
import CustomerRoutes from './CustomerRoutes';
import { PublicRoutes } from './PublicRoutes';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public routes */}
      {PublicRoutes}
      
      {/* Protected routes */}
      {AdminRoutes}
      {ManagerRoutes}
      <Route path="/customer/*" element={<CustomerRoutes />} />
    </Routes>
  );
};
