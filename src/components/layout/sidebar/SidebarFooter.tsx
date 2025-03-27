
import { LogOut, PlusCircle } from 'lucide-react';
import { TranslationDict } from '../../../utils/languageTypes';
import { useNavigate } from 'react-router-dom';

interface SidebarFooterProps {
  collapsed: boolean;
  onSignOut: () => void;
  t: (key: keyof TranslationDict) => string;
}

export const SidebarFooter = ({ collapsed, onSignOut, t }: SidebarFooterProps) => {
  const navigate = useNavigate();
  
  const handleCreateCampaign = () => {
    navigate('/customer/mira-ai');
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
        onClick={onSignOut} 
        className={`sidebar-item hover:bg-sidebar-accent/50 w-full ${collapsed ? 'justify-center' : ''}`}
      >
        <LogOut size={20} />
        {!collapsed && <span>{t('logout')}</span>}
      </button>
    </div>
  );
};
