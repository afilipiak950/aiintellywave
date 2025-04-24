
import React from 'react';
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface SidebarNavItemProps {
  href: string;
  label: string;
  icon: React.ElementType;
  collapsed: boolean;
  active?: boolean;
  badge?: {
    text: string;
    variant: "default" | "secondary" | "destructive" | "outline";
  };
}

const SidebarNavItem = ({ 
  href, 
  label, 
  icon: Icon, 
  collapsed,
  active,
  badge 
}: SidebarNavItemProps) => {
  return (
    <NavLink
      to={href}
      end={href.endsWith('/')}
      className={({ isActive }) =>
        cn(
          "group flex items-center gap-x-3 rounded-md px-3 py-2 text-sm font-medium transition-all",
          "hover:bg-accent hover:text-accent-foreground",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          isActive ? "bg-accent/50 text-accent-foreground" : "text-muted-foreground",
          collapsed && "justify-center px-2"
        )
      }
    >
      <Icon
        className={cn(
          "h-4 w-4 shrink-0",
          "group-hover:animate-pulse transition-transform duration-200",
          collapsed ? "mx-auto" : "mr-2"
        )}
      />
      
      {!collapsed && (
        <span className="truncate">{label}</span>
      )}
      
      {!collapsed && badge && (
        <Badge
          variant={badge.variant}
          className="ml-auto px-1.5 h-5 text-xs"
        >
          {badge.text}
        </Badge>
      )}
    </NavLink>
  );
};

export default SidebarNavItem;
