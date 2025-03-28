
import { LogOut, PlusCircle } from 'lucide-react';
import { TranslationDict } from '../../../utils/languageTypes';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/auth';
import { toast } from '@/hooks/use-toast';

interface SidebarFooterProps {
  collapsed: boolean;
  onSignOut?: () => void; // Make this optional since we'll use our own
  t: (key: keyof TranslationDict) => string;
}

export const SidebarFooter = ({ collapsed, onSignOut, t }: SidebarFooterProps) => {
  const navigate = useNavigate();
  const { signOut } = useAuth(); // Get signOut directly from auth context
  
  const handleCreateCampaign = () => {
    navigate('/customer/mira-ai');
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
    <div className="p-4 border-t border-sidebar-border space-y-2">
      <button 
        onClick={handleCreateCampaign} 
        className={`sidebar-item hover:bg-sidebar-accent/50 w-full text-primary ${collapsed ? 'justify-center' : ''}`}
      >
        <PlusCircle size={20} />
        {!collapsed && <span>Create New Campaign</span>}
      </button>
      
      <button 
        onClick={handleSignOut} 
        className={`sidebar-item hover:bg-sidebar-accent/50 w-full ${collapsed ? 'justify-center' : ''}`}
      >
        <LogOut size={20} />
        {!collapsed && <span>{t('logout')}</span>}
      </button>
    </div>
  );
};
