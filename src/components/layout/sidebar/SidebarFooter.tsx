
import { LogOut, PlusCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { useTranslation } from '@/hooks/useTranslation';

interface SidebarFooterProps {
  collapsed: boolean;
  onSignOut?: () => Promise<void> | void;
}

export const SidebarFooter = ({ collapsed, onSignOut }: SidebarFooterProps) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const handleCreateCampaign = () => {
    navigate('/customer/mira-ai');
  };
  
  const handleSignOut = async () => {
    try {
      if (onSignOut) {
        await onSignOut();
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
    <div className="p-4 mt-auto bg-indigo-950">
      <div className="flex flex-col space-y-2">
        <button 
          onClick={handleCreateCampaign} 
          className={`flex items-center px-3 py-2 text-sm font-medium text-white rounded-md hover:bg-indigo-900/30 ${collapsed ? 'justify-center' : ''}`}
        >
          <div className="flex items-center justify-center bg-indigo-900/50 w-8 h-8 rounded-md">
            <PlusCircle size={16} className="text-white" />
          </div>
          {!collapsed && <span className="ml-3">{t('createCampaign')}</span>}
        </button>
        
        <button 
          onClick={handleSignOut} 
          className={`flex items-center px-3 py-2 text-sm font-medium text-white rounded-md hover:bg-indigo-900/30 ${collapsed ? 'justify-center' : ''}`}
        >
          <div className="flex items-center justify-center bg-indigo-900/50 w-8 h-8 rounded-md">
            <LogOut size={16} className="text-white" />
          </div>
          {!collapsed && <span className="ml-3">{t('logout')}</span>}
        </button>
      </div>
    </div>
  );
};
