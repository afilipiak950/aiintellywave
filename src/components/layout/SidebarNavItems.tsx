import {
  LayoutDashboard,
  Settings,
  User2,
  FolderKanban,
  TrendingUp,
  Mailbox,
  Building2,
  Users,
  Wallet,
  Activity,
  CreditCard,
  HelpCircle,
  Contact2,
  Search,
  Link,
  BriefcaseBusiness,
  LucideIcon
} from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/auth';

export type NavItem = {
  name: string;
  href: string;
  icon: LucideIcon;
  disabled?: boolean;
  badge?: {
    text: string;
    variant: "default" | "secondary" | "destructive" | "outline";
  };
  path?: string;
  active?: boolean;
};

export const ADMIN_NAV_ITEMS: NavItem[] = [
  {
    name: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Customers",
    href: "/admin/customers",
    icon: Users,
  },
  {
    name: "Projects",
    href: "/admin/projects",
    icon: FolderKanban,
  },
  {
    name: "Workflows",
    href: "/admin/workflows",
    icon: Activity,
  },
  {
    name: "Search Strings",
    href: "/admin/search-strings",
    icon: Search,
  },
  {
    name: "Instantly",
    href: "/admin/instantly",
    icon: Mailbox,
  },
  {
    name: "Revenue",
    href: "/admin/revenue",
    icon: TrendingUp,
  },
  {
    name: "Settings",
    href: "/admin/settings/profile",
    icon: Settings,
  },
];

export const MANAGER_NAV_ITEMS: NavItem[] = [
  {
    name: "Dashboard",
    href: "/manager/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Customers",
    href: "/manager/customers",
    icon: Users,
  },
  {
    name: "Projects",
    href: "/manager/projects",
    icon: FolderKanban,
  },
  {
    name: "Workflows",
    href: "/manager/workflows",
    icon: Activity,
  },
  {
    name: "Revenue",
    href: "/manager/revenue",
    icon: TrendingUp,
  },
  {
    name: "Settings",
    href: "/manager/settings/profile",
    icon: Settings,
  },
];

export const useCustomerNavItems = () => {
  const { user } = useAuth();
  const [navItems, setNavItems] = useState<NavItem[]>(BASE_CUSTOMER_NAV_ITEMS);
  
  useEffect(() => {
    const checkFeatures = async () => {
      if (!user) return;

      try {
        // Get company ID first
        const { data: userData, error: userError } = await supabase
          .from('company_users')
          .select('company_id')
          .eq('user_id', user.id)
          .single();
          
        if (userError) {
          console.error('Error fetching user company:', userError);
          return;
        }
        
        if (!userData.company_id) return;
        
        // Check if Google Jobs feature is enabled
        const { data, error } = await supabase
          .from('company_features')
          .select('google_jobs_enabled')
          .eq('company_id', userData.company_id)
          .single();
          
        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching company features:', error);
          return;
        }
        
        // If Google Jobs is enabled, add the nav item
        if (data?.google_jobs_enabled) {
          setNavItems(prev => {
            // Find the index where to insert the new item - after Lead Database
            const index = prev.findIndex(item => item.href === "/customer/lead-database");
            
            if (index === -1) return [...prev, JOB_PARSING_NAV_ITEM];
            
            const newItems = [...prev];
            newItems.splice(index + 1, 0, JOB_PARSING_NAV_ITEM);
            return newItems;
          });
        }
      } catch (err) {
        console.error('Error checking company features:', err);
      }
    };
    
    checkFeatures();
  }, [user]);
  
  return navItems;
};

const JOB_PARSING_NAV_ITEM: NavItem = {
  name: "Jobangebote",
  href: "/customer/job-parsing",
  icon: BriefcaseBusiness,
};

const BASE_CUSTOMER_NAV_ITEMS: NavItem[] = [
  {
    name: "Dashboard",
    href: "/customer/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Projects",
    href: "/customer/projects",
    icon: FolderKanban,
  },
  {
    name: "Search Strings",
    href: "/customer/search-strings",
    icon: Search,
  },
  {
    name: "Pipeline",
    href: "/customer/pipeline",
    icon: Activity,
  },
  {
    name: "Lead Database",
    href: "/customer/lead-database",
    icon: Building2,
  },
  // MIRA AI item removed as requested
  {
    name: "KI Personas",
    href: "/customer/ki-personas",
    icon: User2,
  },
  {
    name: "Train AI",
    href: "/customer/train-ai",
    icon: Activity,
  },
  {
    name: "Integrations",
    href: "/customer/integrations",
    icon: Link,
  },
  {
    name: "Statistics",
    href: "/customer/statistics",
    icon: TrendingUp,
    badge: {
      text: "Soon",
      variant: "default"
    }
  },
  {
    name: "Settings",
    href: "/customer/settings/profile",
    icon: Settings,
  },
];

export const CUSTOMER_NAV_ITEMS = BASE_CUSTOMER_NAV_ITEMS;
