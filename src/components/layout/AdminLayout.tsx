
import { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { supabase } from '../../integrations/supabase/client';
import { useAuth } from '../../context/AuthContext';
import Sidebar from './Sidebar';
import Header from './Header';
import { toast } from '../../components/ui/use-toast';

const AdminLayout = () => {
  const { user, isAdmin, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const [isPageLoading, setIsPageLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Make sure we have a valid session
        const { data: { session } } = await supabase.auth.getSession();
        
        // If not authenticated or not admin, redirect to login
        if (!session || !isAuthenticated || !isAdmin) {
          console.log('User not authenticated or not admin, redirecting to login');
          navigate('/login');
          return;
        }

        setIsPageLoading(false);
      } catch (error) {
        console.error('Error checking auth:', error);
        toast({
          title: "Authentication Error",
          description: "Please login again",
          variant: "destructive",
        });
        navigate('/login');
      }
    };

    if (!isLoading) {
      checkAuth();
    }
  }, [isAuthenticated, isAdmin, isLoading, navigate]);

  if (isLoading || isPageLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Loading...</h2>
          <p className="text-gray-500">Please wait while we set up your dashboard</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar role="admin" />
      
      <div className="flex-1 flex flex-col ml-64">
        <Header />
        
        <main className="flex-1 overflow-auto p-6 transition-all duration-300 ease-in-out">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
