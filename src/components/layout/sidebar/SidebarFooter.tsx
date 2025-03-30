
import { LogOut, PlusCircle, Settings } from 'lucide-react';
import { TranslationDict } from '../../../utils/languageTypes';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/auth';
import { toast } from '@/hooks/use-toast';
import { useTranslation } from '@/hooks/useTranslation';

interface SidebarFooterProps {
  collapsed: boolean;
  onSignOut?: () => void; // Make this optional since we'll use our own
}

export const SidebarFooter = ({ collapsed, onSignOut }: SidebarFooterProps) => {
  const navigate = useNavigate();
  const { signOut } = useAuth(); // Get signOut directly from auth context
  const { t } = useTranslation(); // Import t from useTranslation
  
  const handleCreateCampaign = () => {
    navigate('/customer/mira-ai');
  };
  
  const handleIntegrations = () => {
    navigate('/customer/persona');
  };
  
  const handleSettings = () => {
    navigate('/customer/settings');
  };
  
  const handleSignOut = async () => {
    try {
      await signOut();
      // Use the onSignOut prop if it exists (for backward compatibility)
      if (onSignOut) {
        onSignOut();
      }
      toast({
        title: t('loggedOut'),
        description: t('loggedOutSuccess'),
      });
      navigate('/login');
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: t('error'),
        description: t('logoutFailed') || "Failed to log out. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  return (
    <div className="p-4 border-t border-sidebar-border">
      <div className="flex flex-col space-y-2">
        <button 
          onClick={handleCreateCampaign} 
          className={`sidebar-item hover:bg-sidebar-accent/50 w-full text-primary ${collapsed ? 'justify-center px-0' : ''}`}
        >
          <PlusCircle size={20} />
          {!collapsed && <span>{t('createCampaign')}</span>}
        </button>
        
        <div className="flex space-x-2">
          <button 
            onClick={handleIntegrations} 
            className={`sidebar-item hover:bg-sidebar-accent/50 w-full ${collapsed ? 'justify-center px-0' : ''}`}
          >
            <Settings size={20} />
            {!collapsed && <span>{t('integrations')}</span>}
          </button>
          
          <button 
            onClick={handleSignOut} 
            className={`sidebar-item hover:bg-sidebar-accent/50 w-full ${collapsed ? 'justify-center px-0' : ''}`}
          >
            <LogOut size={20} />
            {!collapsed && <span>{t('logout')}</span>}
          </button>
        </div>
      </div>
    </div>
  );
};
