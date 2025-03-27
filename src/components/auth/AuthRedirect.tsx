
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/auth";

export const AuthRedirect = () => {
  const { isAuthenticated, isAdmin, isManager, isCustomer, isLoading, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [redirectAttempts, setRedirectAttempts] = useState(0);
  const [lastPathRedirected, setLastPathRedirected] = useState<string | null>(null);
  const [initialAuthCheckComplete, setInitialAuthCheckComplete] = useState(false);

  useEffect(() => {
    // Skip redirection logic while authentication is being checked
    if (isLoading) {
      console.log("Authentication is still loading, skipping redirection");
      return;
    }

    // Mark initial auth check as complete
    if (!initialAuthCheckComplete) {
      setInitialAuthCheckComplete(true);
    }

    // Safety check to prevent infinite loops
    if (redirectAttempts > 5) {
      console.error("Too many redirect attempts detected, stopping redirection loop");
      return;
    }

    // Safety check to prevent redirecting to the same path repeatedly
    if (lastPathRedirected === location.pathname) {
      console.warn("Already redirected to this path, skipping to prevent loop:", location.pathname);
      return;
    }

    console.log("AuthRedirect running with:", {
      isAuthenticated,
      isAdmin,
      isManager,
      isCustomer,
      userEmail: user?.email,
      userRole: user?.role,
      path: location.pathname,
      redirectAttempts,
      initialAuthCheckComplete
    });

    // Handle unauthenticated users
    if (!isAuthenticated) {
      // Only redirect if we're not already on the login or register page
      const publicPaths = ['/login', '/register', '/'];
      if (!publicPaths.includes(location.pathname)) {
        console.log("User is not authenticated, redirecting to login");
        setLastPathRedirected('/login');
        setRedirectAttempts(prev => prev + 1);
        navigate('/login');
      }
      return;
    }

    // Special handling for admin@intellywave.de - force admin route
    if (user?.email === 'admin@intellywave.de') {
      console.log("Admin email detected, ensuring admin route");
      
      // If not on admin path, redirect to admin dashboard
      if (!location.pathname.startsWith('/admin')) {
        console.log("Admin user not on admin path, redirecting to admin dashboard");
        setLastPathRedirected('/admin/dashboard');
        setRedirectAttempts(prev => prev + 1);
        navigate('/admin/dashboard');
        return;
      }
    }

    // Redirect based on role if we're at root, login, or register pages
    const publicPaths = ['/', '/login', '/register'];
    if (publicPaths.includes(location.pathname)) {
      if (isAdmin) {
        console.log("Admin user detected, redirecting to admin dashboard");
        setLastPathRedirected('/admin/dashboard');
        setRedirectAttempts(prev => prev + 1);
        navigate('/admin/dashboard');
      } else if (isManager) {
        console.log("Manager user detected, redirecting to manager dashboard");
        setLastPathRedirected('/manager/dashboard');
        setRedirectAttempts(prev => prev + 1);
        navigate('/manager/dashboard');
      } else if (isCustomer) {
        console.log("Customer user detected, redirecting to customer dashboard");
        setLastPathRedirected('/customer/dashboard');
        setRedirectAttempts(prev => prev + 1);
        navigate('/customer/dashboard');
      } else {
        console.log("User has no specific role, setting default to customer");
        setLastPathRedirected('/customer/dashboard');
        setRedirectAttempts(prev => prev + 1);
        navigate('/customer/dashboard');
      }
      return;
    }
    
    // Ensure users are in the correct section based on their role
    if (isAuthenticated) {
      // Admin should be in /admin paths
      if (isAdmin && !location.pathname.startsWith('/admin') && !publicPaths.includes(location.pathname)) {
        console.log("Admin user not in admin section, redirecting");
        setLastPathRedirected('/admin/dashboard');
        setRedirectAttempts(prev => prev + 1);
        navigate('/admin/dashboard');
      }
      
      // Manager should be in /manager paths
      else if (isManager && !location.pathname.startsWith('/manager') && !publicPaths.includes(location.pathname)) {
        console.log("Manager user not in manager section, redirecting");
        setLastPathRedirected('/manager/dashboard');
        setRedirectAttempts(prev => prev + 1);
        navigate('/manager/dashboard');
      }
      
      // Customer should be in /customer paths
      else if (isCustomer && !location.pathname.startsWith('/customer') && !publicPaths.includes(location.pathname)) {
        console.log("Customer user not in customer section, redirecting");
        setLastPathRedirected('/customer/dashboard');
        setRedirectAttempts(prev => prev + 1);
        navigate('/customer/dashboard');
      }
    }
  }, [isAuthenticated, isAdmin, isManager, isCustomer, isLoading, navigate, location.pathname, redirectAttempts, lastPathRedirected, user, initialAuthCheckComplete]);

  return null;
};

export default AuthRedirect;
