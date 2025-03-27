
import { LogOut } from 'lucide-react';
import { TranslationDict } from '../../../utils/languageTypes';

interface SidebarFooterProps {
  collapsed: boolean;
  onSignOut: () => void;
  t: (key: keyof TranslationDict) => string;
}

export const SidebarFooter = ({ collapsed, onSignOut, t }: SidebarFooterProps) => {
  return (
    <div className="p-4 border-t border-sidebar-border">
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
