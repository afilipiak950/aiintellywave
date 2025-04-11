
import React from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface SidebarNavProps {
  links: {
    href: string;
    label: string;
    icon: LucideIcon;
    active?: boolean;
  }[];
  collapsed?: boolean;
}

const SidebarNav: React.FC<SidebarNavProps> = ({ 
  links,
  collapsed = false
}) => {
  return (
    <nav className="px-2 space-y-1">
      {links.map((link, index) => (
        <NavLink
          key={index}
          to={link.href}
          className={({ isActive }) =>
            cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all",
              {
                "justify-center": collapsed,
                "bg-sidebar-accent text-sidebar-accent-foreground": isActive || link.active,
                "text-sidebar-foreground hover:bg-sidebar-accent/80 hover:text-sidebar-accent-foreground": 
                  !isActive && !link.active,
              }
            )
          }
        >
          {link.icon && <link.icon className="h-5 w-5" />}
          {!collapsed && <span>{link.label}</span>}
        </NavLink>
      ))}
    </nav>
  );
};

export default SidebarNav;
