
import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  FolderKanban, 
  Calendar, 
  MessageSquare, 
  Settings, 
  Menu, 
  X,
  LogOut,
  Bot,
  Megaphone
} from 'lucide-react';
import { getCurrentLanguage, getTranslation, type TranslationDict, type Language } from '../../pages/Settings/LanguageSettings';

interface SidebarProps {
  role: 'admin' | 'manager' | 'customer';
}

const Sidebar = ({ role }: SidebarProps) => {
  const { signOut } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [language, setLanguage] = useState<Language>(getCurrentLanguage());

  // Function to translate based on current language
  const t = (key: keyof TranslationDict): string => getTranslation(language, key);

  // Listen for language changes
  useEffect(() => {
    const handleLanguageChange = (event: CustomEvent) => {
      setLanguage(event.detail.language);
    };
    
    // Initial language from localStorage or default
    const storedLang = localStorage.getItem('APP_LANGUAGE') as Language;
    if (storedLang && ['en', 'de', 'fr', 'es'].includes(storedLang)) {
      setLanguage(storedLang);
    }
    
    // Listen for language change events
    window.addEventListener('app-language-change', handleLanguageChange as EventListener);
    
    return () => {
      window.removeEventListener('app-language-change', handleLanguageChange as EventListener);
    };
  }, []);

  const toggleSidebar = () => setCollapsed(!collapsed);

  const adminNavItems = [
    { name: t('dashboard'), path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Customers', path: '/admin/customers', icon: Users },
    { name: t('projects'), path: '/admin/projects', icon: FolderKanban },
    { name: t('miraAI'), path: '/admin/mira-ai', icon: Bot },
    { name: t('outreach'), path: '/admin/outreach', icon: Megaphone },
    { name: t('settings'), path: '/admin/settings', icon: Settings },
  ];

  const managerNavItems = [
    { name: t('dashboard'), path: '/manager/dashboard', icon: LayoutDashboard },
    { name: 'Customers', path: '/manager/customers', icon: Users },
    { name: t('projects'), path: '/manager/projects', icon: FolderKanban },
    { name: t('miraAI'), path: '/manager/mira-ai', icon: Bot },
    { name: t('outreach'), path: '/manager/outreach', icon: Megaphone },
    { name: t('settings'), path: '/manager/settings', icon: Settings },
  ];

  const customerNavItems = [
    { name: t('dashboard'), path: '/customer/dashboard', icon: LayoutDashboard },
    { name: t('projects'), path: '/customer/projects', icon: FolderKanban },
    { name: t('appointments'), path: '/customer/appointments', icon: Calendar },
    { name: t('messages'), path: '/customer/messages', icon: MessageSquare },
    { name: t('miraAI'), path: '/customer/mira-ai', icon: Bot },
    { name: t('outreach'), path: '/customer/outreach', icon: Megaphone },
    { name: t('settings'), path: '/customer/settings', icon: Settings },
  ];
  
  const navItems = 
    role === 'admin' ? adminNavItems : 
    role === 'manager' ? managerNavItems : 
    customerNavItems;

  return (
    <aside 
      className={`bg-sidebar h-screen fixed left-0 top-0 flex flex-col transition-all duration-300 ease-in-out z-20 ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
        <div className={`flex items-center ${collapsed ? 'justify-center w-full' : ''}`}>
          {!collapsed && (
            <span className="text-xl font-bold text-white ml-2">
              {role === 'admin' ? 'Admin Portal' : 
               role === 'manager' ? 'Manager Portal' : 
               'Customer Portal'}
            </span>
          )}
          {collapsed && (
            <span className="text-xl font-bold text-white">
              {role === 'admin' ? 'A' : 
               role === 'manager' ? 'M' : 
               'C'}
            </span>
          )}
        </div>
        <button 
          onClick={toggleSidebar} 
          className="text-sidebar-foreground hover:text-white transition-colors p-1"
        >
          {collapsed ? <Menu size={20} /> : <X size={20} />}
        </button>
      </div>
      
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-2">
          {navItems.map((item) => (
            <li key={item.name}>
              <NavLink
                to={item.path}
                className={({ isActive }) => 
                  `sidebar-item ${isActive ? 'active' : ''} ${collapsed ? 'justify-center' : ''}`
                }
              >
                <item.icon size={20} />
                {!collapsed && <span>{item.name}</span>}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="p-4 border-t border-sidebar-border">
        <button 
          onClick={() => signOut()} 
          className={`sidebar-item hover:bg-sidebar-accent/50 w-full ${collapsed ? 'justify-center' : ''}`}
        >
          <LogOut size={20} />
          {!collapsed && <span>{t('logout')}</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;

