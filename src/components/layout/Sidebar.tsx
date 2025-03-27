import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LogOut, Menu, X } from 'lucide-react';
import { TranslationDict } from '../../utils/languageTypes';
import { createNavItems } from './SidebarNavItems';
import { useTranslation } from '../../hooks/useTranslation';

interface SidebarProps {
  role: 'admin' | 'manager' | 'customer';
}

const Sidebar = ({ role }: SidebarProps) => {
  const { signOut } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const { t } = useTranslation();

  const toggleSidebar = () => setCollapsed(!collapsed);

  // Get navigation items based on role
  const navItems = createNavItems(t)[role];

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
