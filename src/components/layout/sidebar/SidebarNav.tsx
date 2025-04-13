
import React from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface SidebarNavProps {
  links: {
    href: string;
    label: string;
    icon: LucideIcon;
    active?: boolean;
    badge?: {
      text: string;
      variant: "default" | "secondary" | "destructive" | "outline";
    };
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
          {!collapsed && (
            <>
              <span className="flex-1">{link.label}</span>
              {link.badge && (
                <Badge variant={link.badge.variant} className="ml-auto text-xs">
                  {link.badge.text}
                </Badge>
              )}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
};

export default SidebarNav;
