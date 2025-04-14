
import { Outlet } from 'react-router-dom';
import Header from '../Header';

interface MainContentProps {
  featuresUpdated: number;
}

const MainContent = ({ featuresUpdated }: MainContentProps) => {
  return (
    <div className="flex-1 flex flex-col ml-64">
      <Header />
      
      <main className="flex-1 overflow-auto p-6 transition-all duration-300 ease-in-out">
        <Outlet />
      </main>
    </div>
  );
};

export default MainContent;
