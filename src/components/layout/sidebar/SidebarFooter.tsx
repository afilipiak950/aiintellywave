
import { LogOut, PlusCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/auth';
import { toast } from '@/hooks/use-toast';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/utils';

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
      console.log('Logout initiiert');
      await signOut();
      
      // Zusätzliche optionale Callback-Funktion aufrufen
      if (onSignOut) {
        onSignOut();
      }
      
      // Erfolgsmeldung anzeigen
      toast({
        title: t('loggedOut'),
        description: t('loggedOutSuccess'),
      });
      
      // Zur Login-Seite navigieren
      navigate('/login');
    } catch (error) {
      console.error("Logout-Fehler:", error);
      
      // Fehlermeldung anzeigen
      toast({
        title: t('error'),
        description: t('logoutFailed') || "Abmeldung fehlgeschlagen. Bitte versuchen Sie es erneut.",
        variant: "destructive"
      });
      
      // Trotzdem zur Login-Seite navigieren bei kritischen Fehlern
      navigate('/login');
    }
  };
  
  return (
    <div className="p-4 mt-auto border-t border-sidebar-border">
      <div className="flex flex-col space-y-2">
        <button 
          onClick={handleCreateCampaign} 
          className={cn(
            "sidebar-item flex items-center w-full text-primary uppercase font-medium text-xs",
            collapsed ? 'justify-center px-2' : 'px-3'
          )}
        >
          <PlusCircle size={16} />
          {!collapsed && <span className="ml-3 truncate">{t('createCampaign')}</span>}
        </button>
        
        <button 
          onClick={handleSignOut} 
          className={cn(
            "sidebar-item flex items-center w-full uppercase font-medium text-xs hover:bg-red-50 hover:text-red-600 rounded-md p-2 transition-colors",
            collapsed ? 'justify-center px-2' : 'px-3'
          )}
          aria-label="Abmelden"
        >
          <LogOut size={16} />
          {!collapsed && <span className="ml-3">{t('logout')}</span>}
        </button>
      </div>
    </div>
  );
};
