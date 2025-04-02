
import { Outlet } from 'react-router-dom';
import { SidebarProvider } from '@/components/ui/sidebar';
import Header from './Header';
import Sidebar from './Sidebar';

const CustomerLayout = () => {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-background text-foreground">
        <Sidebar role="customer" />
        
        <div className="flex-1 flex flex-col">
          <Header />
          
          <main className="flex-1 overflow-auto p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default CustomerLayout;
