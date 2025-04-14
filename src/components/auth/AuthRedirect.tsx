
import { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/auth";
import { toast } from "../../hooks/use-toast";

export const AuthRedirect = () => {
  const { isAuthenticated, isAdmin, isManager, isCustomer, isLoading, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [redirectAttempts, setRedirectAttempts] = useState(0);
  const [lastPathRedirected, setLastPathRedirected] = useState<string | null>(null);
  const [initialAuthCheckComplete, setInitialAuthCheckComplete] = useState(false);
  const hasRedirectedRef = useRef(false);

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
      toast({
        title: "Navigation Error",
        description: "There was a problem with page navigation. Please refresh the page.",
        variant: "destructive"
      });
      return;
    }

    // Safety check to prevent redirecting to the same path repeatedly
    if (lastPathRedirected === location.pathname || hasRedirectedRef.current) {
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
        hasRedirectedRef.current = true;
        navigate('/login');
      }
      return;
    }

    // Special handling for admin@intellywave.de - force admin route
    if (user?.email === 'admin@intellywave.de') {
      console.log("Admin email detected, ensuring admin route");
      
      // If not on admin path, redirect to admin dashboard immediately
      if (!location.pathname.startsWith('/admin')) {
        console.log("Admin user not on admin path, redirecting to admin dashboard");
        setLastPathRedirected('/admin/dashboard');
        setRedirectAttempts(prev => prev + 1);
        hasRedirectedRef.current = true;
        navigate('/admin/dashboard');
        return;
      }
    }

    // Immediate redirect based on role if authenticated (including public paths)
    if (isAuthenticated) {
      // Special handling for root, login, and register pages
      const publicPaths = ['/', '/login', '/register'];
      if (publicPaths.includes(location.pathname)) {
        if (isAdmin) {
          console.log("Admin user on public path, redirecting to admin dashboard");
          setLastPathRedirected('/admin/dashboard');
          setRedirectAttempts(prev => prev + 1);
          hasRedirectedRef.current = true;
          navigate('/admin/dashboard');
        } else if (isManager) {
          console.log("Manager user on public path, redirecting to manager dashboard");
          setLastPathRedirected('/manager/dashboard');
          setRedirectAttempts(prev => prev + 1);
          hasRedirectedRef.current = true;
          navigate('/manager/dashboard');
        } else if (isCustomer) {
          console.log("Customer user on public path, redirecting to customer dashboard");
          setLastPathRedirected('/customer/dashboard');
          setRedirectAttempts(prev => prev + 1);
          hasRedirectedRef.current = true;
          navigate('/customer/dashboard');
        } else {
          console.log("User has no specific role on public path, setting default to customer");
          setLastPathRedirected('/customer/dashboard');
          setRedirectAttempts(prev => prev + 1);
          hasRedirectedRef.current = true;
          navigate('/customer/dashboard');
        }
        return;
      }
      
      // Fix for customer users accidentally redirected to admin/manager paths
      if (isCustomer && !location.pathname.startsWith('/customer')) {
        // Only redirect if they're on an admin or manager path
        if (location.pathname.startsWith('/admin') || location.pathname.startsWith('/manager')) {
          console.log("Customer user on admin/manager path, redirecting to customer dashboard");
          setLastPathRedirected('/customer/dashboard');
          setRedirectAttempts(prev => prev + 1);
          hasRedirectedRef.current = true;
          navigate('/customer/dashboard');
          return;
        }
      }
      
      // Fix for manager users accidentally redirected to admin/customer paths
      if (isManager && !location.pathname.startsWith('/manager')) {
        // Only redirect if they're on an admin or customer path
        if (location.pathname.startsWith('/admin') || location.pathname.startsWith('/customer')) {
          console.log("Manager user on admin/customer path, redirecting to manager dashboard");
          setLastPathRedirected('/manager/dashboard');
          setRedirectAttempts(prev => prev + 1);
          hasRedirectedRef.current = true;
          navigate('/manager/dashboard');
          return;
        }
      }
      
      // Fix for admin users accidentally redirected to manager/customer paths
      if (isAdmin && !location.pathname.startsWith('/admin')) {
        // Only redirect if they're on a manager or customer path
        if (location.pathname.startsWith('/manager') || location.pathname.startsWith('/customer')) {
          console.log("Admin user on manager/customer path, redirecting to admin dashboard");
          setLastPathRedirected('/admin/dashboard');
          setRedirectAttempts(prev => prev + 1);
          hasRedirectedRef.current = true;
          navigate('/admin/dashboard');
          return;
        }
      }
    }
  }, [isAuthenticated, isAdmin, isManager, isCustomer, isLoading, navigate, location.pathname, redirectAttempts, lastPathRedirected, user, initialAuthCheckComplete]);

  // Reset redirect flag when location changes
  useEffect(() => {
    hasRedirectedRef.current = false;
  }, [location.pathname]);

  return null;
};

export default AuthRedirect;
