
import { LogOut, PlusCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/auth';
import { toast } from '@/hooks/use-toast';
import { useTranslation } from '@/hooks/useTranslation';

interface SidebarFooterProps {
  collapsed: boolean;
  onSignOut?: () => void;
}

export const SidebarFooter = ({ collapsed, onSignOut }: SidebarFooterProps) => {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { t } = useTranslation();
  
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
          className={`sidebar-item hover:bg-sidebar-accent/50 w-full text-primary uppercase font-medium text-xs ${collapsed ? 'justify-center px-0' : ''}`}
        >
          <PlusCircle size={16} />
          {!collapsed && <span className="truncate">{t('createCampaign')}</span>}
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
  );
};
