
import React from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/auth";
import SidebarNavItem from "./SidebarNavItem";
import { SidebarNavLoading } from "./SidebarNavLoading";

interface SidebarNavProps {
  links: {
    href: string;
    label: string;
    icon: React.ElementType;
    active?: boolean;
    badge?: {
      text: string;
      variant: "default" | "secondary" | "destructive" | "outline";
    };
  }[];
  collapsed: boolean;
  isLoading?: boolean;
}

const SidebarNav = ({ links, collapsed, isLoading = false }: SidebarNavProps) => {
  // Remove duplicates - ensure we only have one of each href entry
  const uniqueLinks = links.filter((link, index, self) => 
    index === self.findIndex((l) => l.href === link.href)
  );
  
  if (isLoading) {
    return <SidebarNavLoading />;
  }

  return (
    <nav className="space-y-0.5 px-3">
      {uniqueLinks.map((link) => (
        <SidebarNavItem
          key={link.href}
          href={link.href}
          label={link.label}
          icon={link.icon}
          collapsed={collapsed}
          active={link.active}
          badge={link.badge}
        />
      ))}
    </nav>
  );
};

export default SidebarNav;
