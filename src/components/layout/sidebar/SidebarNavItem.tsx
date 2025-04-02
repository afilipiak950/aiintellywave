
import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from "@/lib/utils";
import { NavItem } from '../navigation/types';
import { 
  SidebarMenuItem,
  SidebarMenuButton
} from '@/components/ui/sidebar';

interface SidebarNavItemProps {
  item: NavItem;
  isActive: boolean;
  collapsed: boolean;
}

export const SidebarNavItem = ({ item, isActive, collapsed }: SidebarNavItemProps) => {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild
        isActive={isActive}
        tooltip={collapsed ? item.name : undefined}
      >
        <Link
          to={item.href}
          className={cn(
            "w-full"
          )}
        >
          <div className={cn(
            "flex items-center justify-center bg-indigo-900/50 w-8 h-8 rounded-md",
            isActive ? "bg-indigo-800" : "bg-indigo-900/50"
          )}>
            <item.icon
              className={cn(
                "h-5 w-5",
                isActive ? "text-white" : "text-gray-300"
              )}
            />
          </div>
          <span>{item.name}</span>
          {item.badge && (
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
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
};
