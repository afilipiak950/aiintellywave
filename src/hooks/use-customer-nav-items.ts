
import { useState, useEffect } from "react";
import { useAuth } from "@/context/auth";
import { BASE_CUSTOMER_NAV_ITEMS, JOB_PARSING_NAV_ITEM } from "@/components/layout/navigation/customer-nav-items";
import { NavItem } from "@/components/layout/navigation/types";
import { supabase } from "@/integrations/supabase/client";

export const useCustomerNavItems = () => {
  const { user } = useAuth();
  const [navItems, setNavItems] = useState<NavItem[]>([]);
  
  useEffect(() => {
    // Setup direct subscription to company features table for this specific user
    if (user?.id) {
      const channel = supabase
        .channel(`user-features-${user.id}`)
        .on('postgres_changes', 
          { 
            event: '*', 
            schema: 'public', 
            table: 'company_features' 
          }, 
          (payload) => {
            console.log('Company features direct subscription update:', payload);
            // Force re-fetch of features by creating a slight timing difference
            setTimeout(() => {
              console.log('Forcing navItems update due to direct subscription change');
              setNavItems([...navItems]);
            }, 500);
          }
        )
        .subscribe();
        
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user?.id, navItems]);
  
  useEffect(() => {
    console.log('Initializing customer nav items with Jobangebote always included');
    
    // Create a new array by copying the base nav items
    let updatedNavItems = [...BASE_CUSTOMER_NAV_ITEMS];
    
    // Always include Jobangebote after Lead Database
    if (!updatedNavItems.some(item => item.href === "/customer/job-parsing")) {
      const index = updatedNavItems.findIndex(item => item.href === "/customer/lead-database");
      
      if (index !== -1) {
        updatedNavItems.splice(index + 1, 0, JOB_PARSING_NAV_ITEM);
      } else {
        updatedNavItems.push(JOB_PARSING_NAV_ITEM);
      }
    }
    
    setNavItems(updatedNavItems);
  }, []);
  
  return navItems;
};
