
import { NavItem } from '../SidebarNavItems';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface SidebarNavProps {
  navItems: NavItem[];
  collapsed: boolean;
}

export const SidebarNav = ({ navItems, collapsed }: SidebarNavProps) => {
  const location = useLocation();
  
  // Helper function to check if a nav item is active
  const isActive = (navPath: string) => {
    // Fix for dashboard path - make it active when at the root of the role
    if (navPath.endsWith('/dashboard')) {
      const basePath = navPath.split('/dashboard')[0];
      if (location.pathname === basePath || location.pathname === `${basePath}/` || 
          location.pathname === navPath || location.pathname === `${navPath}/`) {
        return true;
      }
    }
    
    return location.pathname === navPath || location.pathname.startsWith(`${navPath}/`);
  };
  
  return (
    <div className="flex-1 overflow-y-auto py-6">
      <nav className="px-2 space-y-1">
        {navItems.map((item) => {
          const active = isActive(item.path);

          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center px-3 py-2 text-sm font-medium rounded-md uppercase",
                active
                  ? "bg-sidebar-active text-white"
                  : "text-gray-300 hover:bg-sidebar-hover hover:text-white",
                collapsed ? "justify-center" : ""
              )}
            >
              <item.icon
                className={cn(
                  "h-5 w-5",
                  active ? "text-white" : "text-gray-400 group-hover:text-gray-300"
                )}
              />
              {!collapsed && (
                <span className="ml-3 whitespace-nowrap uppercase">{item.name}</span>
              )}
              {!collapsed && item.badge && (
                <span
                  className={cn(
                    "ml-auto inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium uppercase",
                    item.badge.variant === "default"
                      ? "bg-blue-100 text-blue-800"
                      : item.badge.variant === "secondary"
                      ? "bg-gray-100 text-gray-800"
                      : item.badge.variant === "outline"
                      ? "bg-transparent text-gray-400 border border-gray-200"
                      : "bg-red-100 text-red-800"
                  )}
                >
                  {item.badge.text}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
};
