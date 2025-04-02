
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const CustomerLayout = () => {
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
