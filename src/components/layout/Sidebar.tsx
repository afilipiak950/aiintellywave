
import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  FolderKanban, 
  BarChart, 
  Calendar, 
  MessageSquare, 
  Settings, 
  Menu, 
  X,
  LogOut,
  UserRound
} from 'lucide-react';

interface SidebarProps {
  role: 'admin' | 'customer' | 'manager';
}

const Sidebar = ({ role }: SidebarProps) => {
  const { logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const toggleSidebar = () => setCollapsed(!collapsed);

  const adminNavItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Customers', path: '/admin/customers', icon: Users },
    { name: 'Projects', path: '/admin/projects', icon: FolderKanban },
    { name: 'Campaigns', path: '/admin/campaigns', icon: BarChart },
    { name: 'Settings', path: '/admin/settings', icon: Settings },
  ];

  const customerNavItems = [
    { name: 'Dashboard', path: '/customer/dashboard', icon: LayoutDashboard },
    { name: 'Projects', path: '/customer/projects', icon: FolderKanban },
    { name: 'Appointments', path: '/customer/appointments', icon: Calendar },
    { name: 'Messages', path: '/customer/messages', icon: MessageSquare },
    { name: 'Settings', path: '/customer/settings', icon: Settings },
  ];
  
  const managerNavItems = [
    { name: 'Dashboard', path: '/manager/dashboard', icon: LayoutDashboard },
    { name: 'Employees', path: '/manager/employees', icon: UserRound },
    { name: 'Projects', path: '/manager/projects', icon: FolderKanban },
    { name: 'Campaigns', path: '/manager/campaigns', icon: BarChart },
    { name: 'Settings', path: '/manager/settings', icon: Settings },
  ];
  
  let navItems;
  let portalName;
  
  switch (role) {
    case 'admin':
      navItems = adminNavItems;
      portalName = 'Admin Portal';
      break;
    case 'manager':
      navItems = managerNavItems;
      portalName = 'Manager Portal';
      break;
    case 'customer':
    default:
      navItems = customerNavItems;
      portalName = 'Customer Portal';
      break;
  }

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
              {portalName}
            </span>
          )}
          {collapsed && (
            <span className="text-xl font-bold text-white">
              {role === 'admin' ? 'A' : role === 'manager' ? 'M' : 'C'}
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
          onClick={() => logout()} 
          className={`sidebar-item hover:bg-sidebar-accent/50 w-full ${collapsed ? 'justify-center' : ''}`}
        >
          <LogOut size={20} />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
