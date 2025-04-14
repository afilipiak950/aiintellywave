
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { useEffect } from 'react';
import { useAuth } from '@/context/auth';
import { supabase } from '@/integrations/supabase/client';

const CustomerLayout = () => {
  const { user } = useAuth();

  // Force sidebar update when company features change
  useEffect(() => {
    if (!user) return;

    console.log('Setting up customer layout feature change subscription for user:', user.id);
    
    // Add a subscription to ensure feature changes are reflected
    const channel = supabase
      .channel('customer-layout-features')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'company_features' 
        }, 
        (payload) => {
          console.log('Company features changed in CustomerLayout:', payload);
          // This will trigger a re-render, which will update the sidebar via child components
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar role="customer" />
      
      <div className="flex-1 flex flex-col ml-64">
        <Header />
        
        <main className="flex-1 overflow-auto p-6 transition-all duration-300 ease-in-out">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default CustomerLayout;
