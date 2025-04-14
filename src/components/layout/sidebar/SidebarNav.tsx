
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
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

// Exported function moved to hooks/use-company-features.ts
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
  // Styling constants for better readability
  const navItemBaseClasses = "flex items-center py-2 px-3 rounded-md group transition-colors text-white";
  const navItemActiveClasses = "bg-primary/10 text-white font-medium";
  const navItemInactiveClasses = "text-white font-normal";
  const iconBaseClasses = "flex-shrink-0 w-5 h-5 text-white";

  // Remove duplicates - ensure we only have one Feature Debug entry
  const uniqueLinks = links.filter((link, index, self) => 
    index === self.findIndex((l) => l.href === link.href)
  );

  return (
    <nav className="space-y-0.5 px-3">
      {uniqueLinks.map((link) => (
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
