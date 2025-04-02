
import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from "@/lib/utils";
import { NavItem } from '../navigation/types';

interface SidebarNavItemProps {
  item: NavItem;
  isActive: boolean;
  collapsed: boolean;
}

export const SidebarNavItem = ({ item, isActive, collapsed }: SidebarNavItemProps) => {
  return (
    <Link
      key={item.path || `nav-item-${item.name}`}
      to={item.href}
      className={cn(
        "flex items-center px-3 py-2 text-sm font-medium rounded-md",
        isActive
          ? "bg-indigo-900/50 text-white"
          : "text-gray-300 hover:bg-indigo-900/30 hover:text-white",
        collapsed ? "justify-center" : ""
      )}
    >
      <div className="flex items-center justify-center bg-indigo-900/50 w-8 h-8 rounded-md">
        <item.icon
          className={cn(
            "h-5 w-5",
            isActive ? "text-white" : "text-gray-300"
          )}
        />
      </div>
      {!collapsed && (
        <span className="ml-3 whitespace-nowrap">{item.name}</span>
      )}
      {!collapsed && item.badge && (
        <span
          className={cn(
            "ml-auto inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
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
};
