
import { LogOut, PlusCircle, Settings } from 'lucide-react';
import { TranslationDict } from '../../../utils/languageTypes';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/auth';
import { toast } from '@/hooks/use-toast';

interface SidebarFooterProps {
  collapsed: boolean;
  onSignOut?: () => void;
  t: (key: keyof TranslationDict) => string;
}

export const SidebarFooter = ({ collapsed, onSignOut, t }: SidebarFooterProps) => {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  
  const handleCreateCampaign = () => {
    navigate('/customer/mira-ai');
  };
  
  const handleSignOut = async () => {
    try {
      await signOut();
      if (onSignOut) {
        onSignOut();
      }
      toast({
        title: t('loggedOut'),
        description: t('loggedOutSuccess') || "Successfully logged out",
      });
      navigate('/login');
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  return (
    <div className="p-4 border-t border-sidebar-border space-y-2 flex flex-col">
      <button 
        onClick={handleCreateCampaign} 
        className={`sidebar-item hover:bg-sidebar-accent/50 w-full text-primary flex items-center justify-center ${collapsed ? 'justify-center' : 'gap-2'}`}
      >
        <PlusCircle size={20} />
        {!collapsed && <span>Create New Campaign</span>}
      </button>
      
      <div className="flex space-x-2">
        <button 
          onClick={() => navigate('/customer/integrations')}
          className={`sidebar-item hover:bg-sidebar-accent/50 flex-1 ${collapsed ? 'justify-center' : ''}`}
        >
          <Settings size={20} />
          {!collapsed && <span>Integrations</span>}
        </button>
        
        <button 
          onClick={handleSignOut} 
          className={`sidebar-item hover:bg-sidebar-accent/50 flex-1 ${collapsed ? 'justify-center' : ''}`}
        >
          <LogOut size={20} />
          {!collapsed && <span>{t('logout')}</span>}
        </button>
      </div>
    </div>
  );
};
