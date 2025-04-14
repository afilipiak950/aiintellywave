
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
  // Styling constants for better readability
  const navItemBaseClasses = "flex items-center py-2 px-3 rounded-md group transition-colors text-white";
  const navItemActiveClasses = "bg-primary/10 text-white font-medium";
  const navItemInactiveClasses = "text-white font-normal";
  const iconBaseClasses = "flex-shrink-0 w-5 h-5 text-white";

  return (
    <NavLink
      to={href}
      end={href.endsWith('/')}
      className={({ isActive }) =>
        cn(
          navItemBaseClasses,
          isActive ? navItemActiveClasses : navItemInactiveClasses,
          collapsed ? "justify-center" : "justify-start",
        )
      }
    >
      <Icon
        className={cn(
          iconBaseClasses,
          collapsed ? "mx-auto" : "mr-2"
        )}
      />
      
      {!collapsed && (
        <span className="truncate text-white">{label}</span>
      )}
      
      {!collapsed && badge && (
        <Badge
          variant={badge.variant}
          className="ml-auto px-1.5 h-5 text-xs text-white"
        >
          {badge.text}
        </Badge>
      )}
    </NavLink>
  );
};

export default SidebarNavItem;
