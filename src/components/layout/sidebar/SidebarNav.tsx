
import { NavLink } from 'react-router-dom';
import { LucideIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface NavItem {
  name: string;
  path: string;
  icon: LucideIcon;
  badge?: {
    text: string;
    variant: "default" | "secondary" | "destructive" | "outline";
  };
}

interface SidebarNavProps {
  navItems: NavItem[];
  collapsed: boolean;
}

export const SidebarNav = ({ navItems, collapsed }: SidebarNavProps) => {
  return (
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
              {!collapsed && (
                <div className="flex items-center justify-between w-full">
                  <span>{item.name}</span>
                  {item.badge && (
                    <Badge variant={item.badge.variant} className="ml-2 text-xs py-0">
                      {item.badge.text}
                    </Badge>
                  )}
                </div>
              )}
              {collapsed && item.badge && (
                <div className="absolute -right-1 -top-1">
                  <Badge variant={item.badge.variant} className="h-4 w-4 p-0 flex items-center justify-center rounded-full">
                    <Clock className="h-3 w-3" />
                  </Badge>
                </div>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
};
