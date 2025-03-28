
import { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/auth";
import { toast } from "../../hooks/use-toast";

export const AuthRedirect = () => {
  const { isAuthenticated, isAdmin, isManager, isCustomer, isLoading, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [redirectAttempts, setRedirectAttempts] = useState(0);
  const lastPathRedirectedRef = useRef<string | null>(null);
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
      toast({
        title: "Navigation error",
        description: "There was a problem with page navigation. Please refresh the page.",
        variant: "destructive"
      });
      return;
    }

    // Safety check to prevent redirecting to the same path repeatedly
    if (lastPathRedirectedRef.current === location.pathname) {
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
      // Only redirect if we're not already on the login or register page or the home page
      const publicPaths = ['/login', '/register', '/'];
      if (!publicPaths.includes(location.pathname)) {
        console.log("User is not authenticated, redirecting to login");
        lastPathRedirectedRef.current = '/login';
        setRedirectAttempts(prev => prev + 1);
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
        lastPathRedirectedRef.current = '/admin/dashboard';
        setRedirectAttempts(prev => prev + 1);
        navigate('/admin/dashboard');
        return;
      }
    }

    // Immediate redirect based on role if authenticated (for public paths)
    if (isAuthenticated) {
      // Special handling for root, login, and register pages
      const publicPaths = ['/', '/login', '/register'];
      if (publicPaths.includes(location.pathname)) {
        if (isAdmin) {
          console.log("Admin user on public path, redirecting to admin dashboard");
          lastPathRedirectedRef.current = '/admin/dashboard';
          setRedirectAttempts(prev => prev + 1);
          navigate('/admin/dashboard');
        } else if (isManager) {
          console.log("Manager user on public path, redirecting to manager dashboard");
          lastPathRedirectedRef.current = '/manager/dashboard';
          setRedirectAttempts(prev => prev + 1);
          navigate('/manager/dashboard');
        } else if (isCustomer) {
          console.log("Customer user on public path, redirecting to customer dashboard");
          lastPathRedirectedRef.current = '/customer/dashboard';
          setRedirectAttempts(prev => prev + 1);
          navigate('/customer/dashboard');
        } else {
          console.log("User has no specific role on public path, setting default to customer");
          lastPathRedirectedRef.current = '/customer/dashboard';
          setRedirectAttempts(prev => prev + 1);
          navigate('/customer/dashboard');
        }
        return;
      }
      
      // Redirect users to appropriate role paths if they try to access other role paths
      
      // Customer users shouldn't access admin/manager paths
      if (isCustomer && !location.pathname.startsWith('/customer')) {
        if (location.pathname.startsWith('/admin') || location.pathname.startsWith('/manager')) {
          console.log("Customer user on admin/manager path, redirecting to customer dashboard");
          lastPathRedirectedRef.current = '/customer/dashboard';
          setRedirectAttempts(prev => prev + 1);
          navigate('/customer/dashboard');
          return;
        }
      }
      
      // Manager users shouldn't access admin/customer paths
      if (isManager && !location.pathname.startsWith('/manager')) {
        if (location.pathname.startsWith('/admin') || location.pathname.startsWith('/customer')) {
          console.log("Manager user on admin/customer path, redirecting to manager dashboard");
          lastPathRedirectedRef.current = '/manager/dashboard';
          setRedirectAttempts(prev => prev + 1);
          navigate('/manager/dashboard');
          return;
        }
      }
      
      // Admin users shouldn't access manager/customer paths
      if (isAdmin && !location.pathname.startsWith('/admin')) {
        if (location.pathname.startsWith('/manager') || location.pathname.startsWith('/customer')) {
          console.log("Admin user on manager/customer path, redirecting to admin dashboard");
          lastPathRedirectedRef.current = '/admin/dashboard';
          setRedirectAttempts(prev => prev + 1);
          navigate('/admin/dashboard');
          return;
        }
      }
    }
  }, [isAuthenticated, isAdmin, isManager, isCustomer, isLoading, navigate, location.pathname, redirectAttempts, user, initialAuthCheckComplete]);

  return null;
};

export default AuthRedirect;
