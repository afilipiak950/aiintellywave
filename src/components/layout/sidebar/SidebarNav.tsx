
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth";
import { supabase } from "@/integrations/supabase/client";

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
    // Get company ID first
    const { data: userData, error: userError } = await supabase
      .from('company_users')
      .select('company_id')
      .eq('user_id', userId)
      .single();
      
    if (userError || !userData?.company_id) {
      console.log('Error or no company ID found for user:', userError || 'No company ID');
      return false;
    }
    
    // Check if Google Jobs feature is enabled
    const { data, error } = await supabase
      .from('company_features')
      .select('google_jobs_enabled')
      .eq('company_id', userData.company_id)
      .single();
      
    console.log('Google Jobs feature check result:', { data, error });
      
    if (error && error.code !== 'PGRST116') {
      console.error('Error checking job parsing feature:', error);
      return false;
    }
    
    return data?.google_jobs_enabled || false;
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
      
      console.log('Checking job parsing access for user:', user.id);
      const enabled = await isJobParsingEnabled(user.id);
      console.log('Job parsing is enabled:', enabled);
      setShowJobParsing(enabled);
    };
    
    checkJobParsingAccess();
  }, [user]);
  
  // Filter links when job parsing status or links change
  useEffect(() => {
    console.log('Filtering links. showJobParsing:', showJobParsing);
    
    // Make sure jobbangebote is included when feature is enabled
    const updatedLinks = links.filter(link => {
      if (link.href === '/customer/job-parsing') {
        return showJobParsing;
      }
      return true;
    });
    
    console.log('Filtered links:', updatedLinks.map(l => l.label));
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
