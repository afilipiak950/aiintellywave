
import { useState, useEffect } from "react";
import { useAuth } from "@/context/auth";
import { toast } from "@/hooks/use-toast";
import { useCompanyFeatures } from "./use-company-features";
import { BASE_CUSTOMER_NAV_ITEMS, JOB_PARSING_NAV_ITEM } from "@/components/layout/navigation/customer-nav-items";
import { NavItem } from "@/components/layout/navigation/types";
import { supabase } from "@/integrations/supabase/client";

export const useCustomerNavItems = () => {
  const { user } = useAuth();
  const { features, loading, error } = useCompanyFeatures();
  const [navItems, setNavItems] = useState<NavItem[]>(BASE_CUSTOMER_NAV_ITEMS);
  
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
              // Create a new array to avoid direct state mutation and force re-render
              const currentNavItems = [...BASE_CUSTOMER_NAV_ITEMS];
              
              // Check if Google Jobs is enabled in the payload
              if (payload.new && payload.new.google_jobs_enabled === true) {
                if (!currentNavItems.some(item => item.href === "/customer/job-parsing")) {
                  const index = currentNavItems.findIndex(item => item.href === "/customer/lead-database");
                  if (index !== -1) {
                    currentNavItems.splice(index + 1, 0, JOB_PARSING_NAV_ITEM);
                  } else {
                    currentNavItems.push(JOB_PARSING_NAV_ITEM);
                  }
                }
              }
              
              setNavItems(currentNavItems);
            }, 500);
          }
        )
        .subscribe();
        
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user?.id]);
  
  useEffect(() => {
    if (loading) {
      console.log('Customer nav items: loading features...');
      return;
    }
    
    if (error) {
      console.error('Error loading customer nav items:', error);
      return;
    }
    
    console.log('Updating nav items based on features:', features);
    
    // Create a new array to avoid direct state mutation
    let updatedNavItems = [...BASE_CUSTOMER_NAV_ITEMS]; // Reset to baseline items
    
    // Add Jobangebote if enabled
    if (features?.google_jobs_enabled) {
      console.log('Google Jobs is enabled, adding Jobangebote to nav items');
      
      // Only add if not already present
      if (!updatedNavItems.some(item => item.href === "/customer/job-parsing")) {
        // Insert Jobangebote after Lead Database (more logical placement)
        const index = updatedNavItems.findIndex(item => item.href === "/customer/lead-database");
        
        if (index !== -1) {
          updatedNavItems.splice(index + 1, 0, JOB_PARSING_NAV_ITEM);
        } else {
          updatedNavItems.push(JOB_PARSING_NAV_ITEM);
        }
        
        // Show toast notification when first enabled
        toast({
          title: "Feature Enabled",
          description: "Jobangebote feature is now available in your menu",
          variant: "default"
        });
      }
    } else {
      console.log('Google Jobs is disabled, removing Jobangebote from nav items');
      // Remove if disabled but present
      updatedNavItems = updatedNavItems.filter(item => item.href !== "/customer/job-parsing");
    }
    
    // Update state only if there's a change
    if (JSON.stringify(updatedNavItems) !== JSON.stringify(navItems)) {
      setNavItems(updatedNavItems);
      console.log('Nav items updated:', updatedNavItems.map(item => item.name));
    } else {
      console.log('No change in nav items needed');
    }
  }, [features, loading, error]);
  
  return navItems;
};
