
import { ReactNode, useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/auth';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children?: ReactNode;
  allowedRoles: string[];
}

export const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading, user, isAdmin, isManager, isCustomer } = useAuth();
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(true);
  
  useEffect(() => {
    if (isLoading) {
      console.log("Protected route: Auth is still loading");
      return;
    }
    
    setIsChecking(false);
    
    if (!isAuthenticated) {
      console.log("Protected route: User is not authenticated, redirecting to login");
      navigate('/login');
      return;
    }
    
    // Special case for admin@intellywave.de
    if (user?.email === 'admin@intellywave.de') {
      console.log("Protected route: Admin email detected, allowing access");
      return;
    }
    
    // Check if user has any of the allowed roles
    const hasAllowedRole = allowedRoles.some(role => {
      if (role === 'admin') return isAdmin;
      if (role === 'manager') return isManager;
      if (role === 'customer') return isCustomer;
      return false;
    });
    
    if (!hasAllowedRole) {
      console.log(`Protected route: User doesn't have the required roles (${allowedRoles.join(', ')}), redirecting to index`);
      
      // Redirect to appropriate dashboard based on role
      if (isAdmin) navigate('/admin/dashboard');
      else if (isManager) navigate('/manager/dashboard');
      else if (isCustomer) navigate('/customer/dashboard');
      else navigate('/');
      
      return;
    }
    
    console.log("Protected route: User is authorized");
  }, [isAuthenticated, isLoading, navigate, user, allowedRoles, isAdmin, isManager, isCustomer]);
  
  if (isLoading || isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }
  
  // Special case for admin@intellywave.de - always allow access
  if (user?.email === 'admin@intellywave.de') {
    return <Outlet />;
  }
  
  if (!isAuthenticated) {
    return null;
  }
  
  // Check if user has any of the allowed roles
  const hasAllowedRole = allowedRoles.some(role => {
    if (role === 'admin') return isAdmin;
    if (role === 'manager') return isManager;
    if (role === 'customer') return isCustomer;
    return false;
  });
  
  if (!hasAllowedRole) {
    return null;
  }
  
  return <Outlet />;
};

export const AdminRoute = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, isAdmin, isLoading, user } = useAuth();
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(true);
  
  useEffect(() => {
    if (isLoading) {
      console.log("Admin route: Auth is still loading");
      return;
    }
    
    setIsChecking(false);
    
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
  
  if (isLoading || isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
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

export const ManagerRoute = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, isManager, isLoading } = useAuth();
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(true);
  
  useEffect(() => {
    if (isLoading) {
      console.log("Manager route: Auth is still loading");
      return;
    }
    
    setIsChecking(false);
    
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
  
  if (isLoading || isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }
  
  if (!isAuthenticated || !isManager) {
    return null;
  }
  
  return <>{children}</>;
};

export const CustomerRoute = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, isCustomer, isLoading } = useAuth();
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(true);
  
  useEffect(() => {
    if (isLoading) {
      console.log("Customer route: Auth is still loading");
      return;
    }
    
    setIsChecking(false);
    
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
  
  if (isLoading || isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }
  
  if (!isAuthenticated || !isCustomer) {
    return null;
  }
  
  return <>{children}</>;
};
