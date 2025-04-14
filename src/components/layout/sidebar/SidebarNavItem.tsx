
import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from "@/lib/utils";
import { NavItem } from '../SidebarNavItems';

interface SidebarNavItemProps {
  item: NavItem;
  isActive: boolean;
  collapsed: boolean;
}

export const SidebarNavItem = ({ item, isActive, collapsed }: SidebarNavItemProps) => {
  // Define reusable styling constants
  const linkBaseClasses = "flex items-center px-3 py-2 text-sm font-medium rounded-md uppercase text-white";
  const activeLinkClasses = "bg-sidebar-accent";
  const inactiveLinkClasses = "hover:bg-sidebar-hover";
  const iconClasses = "h-5 w-5 text-white";
  
  return (
    <Link
      key={item.path || `nav-item-${item.name}`}
      to={item.href || '#'}
      className={cn(
        linkBaseClasses,
        isActive ? activeLinkClasses : inactiveLinkClasses,
        collapsed ? "justify-center" : ""
      )}
    >
      <item.icon className={iconClasses} />
      
      {!collapsed && (
        <span className="ml-3 whitespace-nowrap uppercase text-white">
          {item.name}
        </span>
      )}
      
      {!collapsed && item.badge && (
        <span
          className={cn(
            "ml-auto inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium uppercase text-white",
            item.badge.variant === "default"
              ? "bg-blue-500"
              : item.badge.variant === "secondary"
              ? "bg-gray-600"
              : item.badge.variant === "outline"
              ? "bg-transparent text-white border border-white"
              : "bg-red-500"
          )}
        >
          {item.badge.text}
        </span>
      )}
    </Link>
  );
};
