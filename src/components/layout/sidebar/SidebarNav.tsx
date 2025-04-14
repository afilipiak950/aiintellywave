import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

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
}

// Extracted to a separate function for better readability
export const isJobParsingEnabled = async (userId: string): Promise<boolean> => {
  try {
    console.log('Checking job parsing access for user:', userId);
    
    if (!userId) {
      console.log('No user ID provided for feature check');
      return false;
    }
    
    // Get company ID first
    const { data: userData, error: userError } = await supabase
      .from('company_users')
      .select('company_id')
      .eq('user_id', userId)
      .single();
      
    if (userError) {
      console.error('Error fetching company ID for user:', userError);
      return false;
    }
    
    if (!userData?.company_id) {
      console.log('No company ID found for user:', userId);
      return false;
    }
    
    console.log('Found company ID:', userData.company_id);
    
    // Check if Google Jobs feature is enabled
    const { data, error } = await supabase
      .from('company_features')
      .select('google_jobs_enabled')
      .eq('company_id', userData.company_id)
      .single();
      
    console.log('Google Jobs feature check result in SidebarNav:', { data, error });
      
    if (error) {
      if (error.code === 'PGRST116') {
        console.log('No feature record found for company, creating default record with Google Jobs disabled');
        
        try {
          await supabase
            .from('company_features')
            .insert({ 
              company_id: userData.company_id, 
              google_jobs_enabled: false,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });
        } catch (insertError) {
          console.error('Error creating default feature record:', insertError);
        }
        
        return false;
      }
      
      console.error('Error checking job parsing feature:', error);
      return false;
    }
    
    const isEnabled = data?.google_jobs_enabled === true;
    console.log('Google Jobs feature is enabled:', isEnabled);
    return isEnabled;
  } catch (err) {
    console.error('Error checking job parsing access:', err);
    return false;
  }
};

const SidebarNav = ({ links, collapsed }: SidebarNavProps) => {
  const { user } = useAuth();
  const [showJobParsing, setShowJobParsing] = useState(false);
  const [filteredLinks, setFilteredLinks] = useState(links);
  
  // Check job parsing access when user changes
  useEffect(() => {
    const checkJobParsingAccess = async () => {
      if (!user) return;
      
      console.log('Checking job parsing access for sidebar nav - user:', user.id);
      const enabled = await isJobParsingEnabled(user.id);
      console.log('Job parsing is enabled in SidebarNav:', enabled);
      setShowJobParsing(enabled);
      
      if (enabled) {
        toast({
          title: "Feature Enabled",
          description: "Jobangebote feature is now available in your menu",
          variant: "default"
        });
      }
    };
    
    checkJobParsingAccess();

    // Set up a subscription to monitor changes to the company_features table
    if (user) {
      const channel = supabase
        .channel('sidebar-nav-features')
        .on('postgres_changes', {
          event: '*',
          schema: 'public', 
          table: 'company_features'
        }, (payload) => {
          console.log('Detected change in company_features table for SidebarNav:', payload);
          checkJobParsingAccess();
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);
  
  // Filter links when job parsing status or links change
  useEffect(() => {
    console.log('Filtering sidebar nav links. showJobParsing:', showJobParsing);
    
    // Make sure Jobangebote is included when feature is enabled
    const updatedLinks = links.filter(link => {
      // Remove duplicate Feature Debug entries - keep only one
      if (link.href === '/customer/feature-debug') {
        // Check if we've already included a Feature Debug link
        return !filteredLinks.some(existingLink => 
          existingLink.href === '/customer/feature-debug' &&
          existingLink !== link
        );
      }
      
      // Handle Job Parsing link based on feature flag
      if (link.href === '/customer/job-parsing') {
        return showJobParsing;
      }
      
      return true;
    });
    
    console.log('Filtered sidebar nav links:', updatedLinks.map(l => l.label));
    setFilteredLinks(updatedLinks);
  }, [links, showJobParsing]);

  // Styling constants for better readability
  const navItemBaseClasses = "flex items-center py-2 px-3 rounded-md group transition-colors text-white";
  const navItemActiveClasses = "bg-primary/10 text-white font-medium";
  const navItemInactiveClasses = "text-white font-normal";
  const iconBaseClasses = "flex-shrink-0 w-5 h-5 text-white";

  return (
    <nav className="space-y-0.5 px-3">
      {filteredLinks.map((link) => (
        <NavLink
          key={link.href}
          to={link.href}
          end={link.href.endsWith('/')}
          className={({ isActive }) =>
            cn(
              navItemBaseClasses,
              isActive ? navItemActiveClasses : navItemInactiveClasses,
              collapsed ? "justify-center" : "justify-start",
            )
          }
        >
          <link.icon
            className={cn(
              iconBaseClasses,
              collapsed ? "mx-auto" : "mr-2"
            )}
          />
          
          {!collapsed && (
            <span className="truncate text-white">{link.label}</span>
          )}
          
          {!collapsed && link.badge && (
            <Badge
              variant={link.badge.variant}
              className="ml-auto px-1.5 h-5 text-xs text-white"
            >
              {link.badge.text}
            </Badge>
          )}
        </NavLink>
      ))}
    </nav>
  );
};

export default SidebarNav;
