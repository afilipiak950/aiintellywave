
import { Route } from 'react-router-dom';
import Index from '../pages/Index';
import Login from '../pages/Auth/Login';
import Register from '../pages/Auth/Register';
import NotFound from '../pages/NotFound';

export const PublicRoutes = (
  <>
    <Route key="login" path="/login" element={<Login />} />
    <Route key="register" path="/register" element={<Register />} />
    <Route key="not-found" path="*" element={<NotFound />} />
  </>
);
