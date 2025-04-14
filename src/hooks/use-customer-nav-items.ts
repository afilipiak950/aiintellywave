
import { useState, useEffect } from "react";
import { useAuth } from "@/context/auth";
import { toast } from "@/hooks/use-toast";
import { useCompanyFeatures } from "./use-company-features";
import { BASE_CUSTOMER_NAV_ITEMS, JOB_PARSING_NAV_ITEM } from "@/components/layout/navigation/customer-nav-items";
import { NavItem } from "@/components/layout/navigation/types";

export const useCustomerNavItems = () => {
  const { user } = useAuth();
  const { features, loading, error } = useCompanyFeatures();
  const [navItems, setNavItems] = useState<NavItem[]>(BASE_CUSTOMER_NAV_ITEMS);
  
  useEffect(() => {
    if (loading) return;
    
    console.log('Updating nav items based on features:', features);
    
    // Create a new array to avoid direct state mutation
    let updatedNavItems = [...BASE_CUSTOMER_NAV_ITEMS]; // Reset to baseline items
    
    // Add Jobangebote if enabled
    if (features?.google_jobs_enabled) {
      console.log('Google Jobs is enabled, adding Jobangebote to nav items');
      
      // Only add if not already present
      if (!updatedNavItems.some(item => item.href === "/customer/job-parsing")) {
        const index = updatedNavItems.findIndex(item => item.href === "/customer/lead-database");
        
        if (index !== -1) {
          updatedNavItems.splice(index + 1, 0, JOB_PARSING_NAV_ITEM);
        } else {
          updatedNavItems.push(JOB_PARSING_NAV_ITEM);
        }
        
        // Show toast notification only when first enabled
        toast({
          title: "Feature Enabled",
          description: "Jobangebote feature is now available in your menu",
          variant: "default"
        });
      }
    } else {
      // Remove if disabled but present
      updatedNavItems = updatedNavItems.filter(item => item.href !== "/customer/job-parsing");
    }
    
    // Update state only if there's a change
    if (JSON.stringify(updatedNavItems) !== JSON.stringify(navItems)) {
      setNavItems(updatedNavItems);
    }
  }, [features, loading, error]);
  
  return navItems;
};
