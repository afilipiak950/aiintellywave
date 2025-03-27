
import { ReactNode, useEffect, useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { User, Bell, Globe, Shield, Users } from 'lucide-react';
import { useAuth } from '../../context/auth';
import { 
  getCurrentLanguage, 
  getTranslation 
} from '../../utils/languageUtils';
import { Language, TranslationDict } from '../../utils/languageTypes';

interface SettingsLayoutProps {
  children?: ReactNode;
  basePath: string;
}

const SettingsLayout = ({ children, basePath }: SettingsLayoutProps) => {
  const location = useLocation();
  const { isAdmin, isManager } = useAuth();
  const [language, setLanguage] = useState<Language>(getCurrentLanguage());
  
  // Function to translate UI elements
  const t = (key: keyof TranslationDict): string => getTranslation(language, key);
  
  // Listen for language changes
  useEffect(() => {
    const handleLanguageChange = (event: CustomEvent) => {
      setLanguage(event.detail.language);
    };
    
    // Initial language from localStorage or default
    const storedLang = localStorage.getItem('APP_LANGUAGE');
    if (storedLang && ['en', 'de', 'fr', 'es'].includes(storedLang)) {
      setLanguage(storedLang as Language);
    }
    
    // Listen for language change events
    window.addEventListener('app-language-change', handleLanguageChange as EventListener);
    
    return () => {
      window.removeEventListener('app-language-change', handleLanguageChange as EventListener);
    };
  }, []);
  
  const isActive = (path: string) => location.pathname === path;
  
  const navItems = [
    { name: t('profile'), path: `${basePath}/profile`, icon: User },
    { name: t('notifications'), path: `${basePath}/settings/notifications`, icon: Bell },
    { name: t('language'), path: `${basePath}/settings/language`, icon: Globe },
    { name: t('security'), path: `${basePath}/settings/security`, icon: Shield },
  ];
  
  // Add team management for admin and manager roles
  if (isAdmin || isManager) {
    navItems.push({ 
      name: 'Team Management', 
      path: `${basePath}/settings/team`, 
      icon: Users 
    });
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex flex-col sm:flex-row gap-8">
        <aside className="w-full sm:w-64 shrink-0">
          <div className="sticky top-20">
            <h2 className="text-lg font-semibold mb-4">{t('settings')}</h2>
            <nav className="space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                    isActive(item.path)
                      ? "bg-primary text-primary-foreground"
                      : "text-gray-600 hover:bg-gray-100"
                  )}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
        </aside>
        <div className="flex-1 min-w-0">
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            {children || <Outlet />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsLayout;
