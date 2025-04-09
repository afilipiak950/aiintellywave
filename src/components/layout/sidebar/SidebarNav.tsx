
import React from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';
import { ArrowRightLeft, BarChart3, Building, Calendar, FileBox, Home, MailIcon, Users, Workflow } from 'lucide-react';

interface SidebarNavProps {
  links: {
    href: string;
    label: string;
    icon: LucideIcon;
    active?: boolean;
  }[];
  collapsed?: boolean;
}

export const getLinks = (role: string) => {
  const adminLinks = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: Home },
    { href: '/admin/customers', label: 'Customers', icon: Building },
    { href: '/admin/projects', label: 'Projects', icon: FileBox },
    { href: '/admin/workflows', label: 'Workflows', icon: Workflow },
    { href: '/admin/instantly', label: 'Instantly', icon: MailIcon },
  ];

  const managerLinks = [
    { href: '/manager/dashboard', label: 'Dashboard', icon: Home },
    { href: '/manager/customers', label: 'Customers', icon: Building },
    { href: '/manager/projects', label: 'Projects', icon: FileBox },
    { href: '/manager/kpi-dashboard', label: 'KPI Dashboard', icon: BarChart3 },
  ];

  const customerLinks = [
    { href: '/customer/dashboard', label: 'Dashboard', icon: Home },
    { href: '/customer/projects', label: 'Projects', icon: FileBox },
    { href: '/customer/leads', label: 'Leads', icon: Users },
    { href: '/customer/workflows', label: 'Workflows', icon: Workflow },
    { href: '/customer/appointments', label: 'Appointments', icon: Calendar },
  ];

  switch (role) {
    case 'admin':
      return adminLinks;
    case 'manager':
      return managerLinks;
    case 'customer':
      return customerLinks;
    default:
      return customerLinks;
  }
};

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
