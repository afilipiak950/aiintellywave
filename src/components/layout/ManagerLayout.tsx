
import { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { supabase } from '../../integrations/supabase/client';
import { useAuth } from '../../context/AuthContext';
import Sidebar from './Sidebar';
import Header from './Header';
import { toast } from '../../components/ui/use-toast';

const ManagerLayout = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [isManager, setIsManager] = useState(false);

  useEffect(() => {
    const checkManagerStatus = async () => {
      try {
        // Make sure we have a valid session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session || !isAuthenticated) {
          console.log('User not authenticated, redirecting to login');
          navigate('/login');
          return;
        }

        // Check if user is a manager of any company
        const { data, error } = await supabase
          .from('company_users')
          .select('*')
          .eq('user_id', user?.id)
          .eq('is_admin', true);
        
        if (error) throw error;
        
        if (!data || data.length === 0) {
          console.log('User is not a manager, redirecting to customer dashboard');
          navigate('/customer/dashboard');
          return;
        }
        
        setIsManager(true);
        setIsPageLoading(false);
      } catch (error) {
        console.error('Error checking manager status:', error);
        toast({
          title: "Authentication Error",
          description: "Please login again",
          variant: "destructive",
        });
        navigate('/login');
      }
    };

    if (!isLoading) {
      checkManagerStatus();
    }
  }, [isAuthenticated, isLoading, navigate, user]);

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
      <Sidebar role="manager" />
      
      <div className="flex-1 flex flex-col ml-64">
        <Header />
        
        <main className="flex-1 overflow-auto p-6 transition-all duration-300 ease-in-out">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default ManagerLayout;
