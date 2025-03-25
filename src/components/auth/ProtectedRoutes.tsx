
import { ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/auth';

interface ProtectedRouteProps {
  children: ReactNode;
}

export const AdminRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, isAdmin, isLoading, user } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (isLoading) {
      console.log("Admin route: Auth is still loading");
      return;
    }
    
    if (!isAuthenticated) {
      console.log("Admin route: User is not authenticated, redirecting to login");
      navigate('/login');
      return;
    }
    
    // Special case for admin@intellywave.de
    if (user?.email === 'admin@intellywave.de') {
      console.log("Admin route: Admin email detected, allowing access");
      return;
    }
    
    if (!isAdmin) {
      console.log("Admin route: User is not an admin, redirecting to index");
      navigate('/');
      return;
    }
    
    console.log("Admin route: User is authorized");
  }, [isAuthenticated, isAdmin, isLoading, navigate, user]);
  
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  
  // Special case for admin@intellywave.de - always allow access
  if (user?.email === 'admin@intellywave.de') {
    return <>{children}</>;
  }
  
  if (!isAuthenticated || !isAdmin) {
    return null;
  }
  
  return <>{children}</>;
};

export const ManagerRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, isManager, isLoading } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (isLoading) {
      console.log("Manager route: Auth is still loading");
      return;
    }
    
    if (!isAuthenticated) {
      console.log("Manager route: User is not authenticated, redirecting to login");
      navigate('/login');
      return;
    }
    
    if (!isManager) {
      console.log("Manager route: User is not a manager, redirecting to index");
      navigate('/');
      return;
    }
    
    console.log("Manager route: User is authorized");
  }, [isAuthenticated, isManager, isLoading, navigate]);
  
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  
  if (!isAuthenticated || !isManager) {
    return null;
  }
  
  return <>{children}</>;
};

export const CustomerRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, isCustomer, isLoading } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (isLoading) {
      console.log("Customer route: Auth is still loading");
      return;
    }
    
    if (!isAuthenticated) {
      console.log("Customer route: User is not authenticated, redirecting to login");
      navigate('/login');
      return;
    }
    
    if (!isCustomer) {
      console.log("Customer route: User is not a customer, redirecting to index");
      navigate('/');
      return;
    }
    
    console.log("Customer route: User is authorized");
  }, [isAuthenticated, isCustomer, isLoading, navigate]);
  
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  
  if (!isAuthenticated || !isCustomer) {
    return null;
  }
  
  return <>{children}</>;
};
