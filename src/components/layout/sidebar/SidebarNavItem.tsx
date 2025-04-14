
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
  return (
    <Link
      key={item.path || `nav-item-${item.name}`}
      to={item.href || '#'}
      className={cn(
        "flex items-center px-3 py-2 text-sm font-medium rounded-md uppercase text-white", // Explicitly set text to white
        isActive
          ? "bg-sidebar-accent text-white"
          : "text-white hover:bg-sidebar-hover", // Ensure hover state also uses white text
        collapsed ? "justify-center" : ""
      )}
    >
      <item.icon
        className={cn(
          "h-5 w-5 text-white", // Explicitly set icon color to white
          isActive ? "text-white" : "text-white"
        )}
      />
      {!collapsed && (
        <span className="ml-3 whitespace-nowrap uppercase text-white">{item.name}</span>
      )}
      {!collapsed && item.badge && (
        <span
          className={cn(
            "ml-auto inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium uppercase text-white", // Ensure badge text is white
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
