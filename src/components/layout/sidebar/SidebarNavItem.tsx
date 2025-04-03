
import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from "@/lib/utils";
import { NavItem } from '../navigation/types';
import { Badge } from "@/components/ui/badge";

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
        "flex items-center px-3 py-2 text-sm font-medium rounded-md uppercase",
        isActive
          ? "bg-sidebar-active text-white"
          : "text-gray-300 hover:bg-sidebar-hover hover:text-white",
        collapsed ? "justify-center" : ""
      )}
    >
      <item.icon
        className={cn(
          "h-5 w-5",
          isActive ? "text-white" : "text-gray-400 group-hover:text-gray-300"
        )}
      />
      {!collapsed && (
        <span className="ml-3 whitespace-nowrap uppercase">{item.name}</span>
      )}
      {!collapsed && item.badge && (
        <NavItemBadge badge={item.badge} />
      )}
    </Link>
  );
};

interface NavItemBadgeProps {
  badge: NavItem['badge'];
}

const NavItemBadge: React.FC<NavItemBadgeProps> = ({ badge }) => {
  if (!badge) return null;
  
  return (
    <Badge
      variant={badge.variant || 'default'}
      className={cn(
        "ml-auto text-xs font-medium uppercase",
        badge.color && `bg-${badge.color}`,
        badge.className
      )}
    >
      {badge.text}
    </Badge>
  );
};
