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
  LucideIcon,
  MessageSquare,
  Bug
} from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/auth';
import { toast } from '@/hooks/use-toast';

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
        console.log('Checking features for customer nav items - user:', user.id);
        
        // Get company ID first
        const { data: userData, error: userError } = await supabase
          .from('company_users')
          .select('company_id')
          .eq('user_id', user.id)
          .single();
          
        if (userError) {
          console.error('Error fetching user company:', userError);
          
          // Check if it's a "no rows returned" error
          if (userError.code === 'PGRST116') {
            console.log('No company association found for user, redirecting to debug page');
            ensureDebugItemPresent();
          }
          
          return;
        }
        
        if (!userData.company_id) {
          console.log('No company ID found for user');
          ensureDebugItemPresent();
          return;
        }
        
        console.log('Found company ID:', userData.company_id);
        
        // Check if Google Jobs feature is enabled
        const { data, error } = await supabase
          .from('company_features')
          .select('google_jobs_enabled')
          .eq('company_id', userData.company_id)
          .single();
          
        console.log('Google Jobs feature check result:', { data, error });
          
        if (error) {
          if (error.code === 'PGRST116') {
            console.log('No feature record found for company, creating default record with Google Jobs disabled');
            
            try {
              const { error: insertError } = await supabase
                .from('company_features')
                .insert({
                  company_id: userData.company_id,
                  google_jobs_enabled: false,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                });
                
              if (insertError) {
                console.error('Error creating default features record:', insertError);
              }
            } catch (insertErr) {
              console.error('Exception creating default features record:', insertErr);
            }
          } else {
            console.error('Error fetching company features:', error);
          }
          
          // Add debug item since we had an error
          ensureDebugItemPresent();
          return;
        }
        
        // If Google Jobs is enabled, add the nav item
        const googleJobsEnabled = data?.google_jobs_enabled === true;
        console.log('Google Jobs is enabled:', googleJobsEnabled);
        
        updateNavItems(googleJobsEnabled);
        
      } catch (err) {
        console.error('Error checking company features for nav items:', err);
        ensureDebugItemPresent();
      }
    };
    
    const updateNavItems = (googleJobsEnabled: boolean) => {
      // Create a new array to avoid direct state mutation
      let updatedNavItems = [...BASE_CUSTOMER_NAV_ITEMS]; // Reset to baseline items
      
      // Always ensure debug item is present
      if (!updatedNavItems.some(item => item.href === "/customer/feature-debug")) {
        updatedNavItems.push(DEBUG_NAV_ITEM);
      }
      
      // Add Jobangebote if enabled
      if (googleJobsEnabled) {
        console.log('Adding Jobangebote to nav items');
        
        // Only add if not already present
        if (!updatedNavItems.some(item => item.href === "/customer/job-parsing")) {
          const index = updatedNavItems.findIndex(item => item.href === "/customer/lead-database");
          
          if (index !== -1) {
            updatedNavItems.splice(index + 1, 0, JOB_PARSING_NAV_ITEM);
          } else {
            updatedNavItems.push(JOB_PARSING_NAV_ITEM);
          }
        }
      }
      
      // Update state only if there's a change
      if (JSON.stringify(updatedNavItems) !== JSON.stringify(navItems)) {
        setNavItems(updatedNavItems);
      }
    };
    
    const ensureDebugItemPresent = () => {
      if (!navItems.some(item => item.href === "/customer/feature-debug")) {
        setNavItems(prev => [...prev, DEBUG_NAV_ITEM]);
      }
    };
    
    checkFeatures();
    
    // Set up a real-time subscription to company_features
    const channel = supabase
      .channel('customer-nav-features')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'company_features' 
        }, 
        (payload) => {
          console.log('Feature changes detected in SidebarNavItems:', payload);
          checkFeatures();
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);
  
  return navItems;
};

const JOB_PARSING_NAV_ITEM: NavItem = {
  name: "Jobangebote",
  href: "/customer/job-parsing",
  icon: BriefcaseBusiness,
};

const DEBUG_NAV_ITEM: NavItem = {
  name: "Feature Debug",
  href: "/customer/feature-debug",
  icon: Bug,
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
    name: "Outreach",
    href: "/customer/outreach",
    icon: MessageSquare,
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
