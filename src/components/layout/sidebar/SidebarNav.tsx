
import { LucideIcon } from "lucide-react";
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
    icon: LucideIcon;
    active?: boolean;
    badge?: {
      text: string;
      variant: "default" | "secondary" | "destructive" | "outline";
    };
  }[];
  collapsed: boolean;
}

export const isJobParsingEnabled = async (userId: string): Promise<boolean> => {
  try {
    // Get company ID first
    const { data: userData, error: userError } = await supabase
      .from('company_users')
      .select('company_id')
      .eq('user_id', userId)
      .single();
      
    if (userError || !userData?.company_id) {
      return false;
    }
    
    // Check if Google Jobs feature is enabled
    const { data, error } = await supabase
      .from('company_features')
      .select('google_jobs_enabled')
      .eq('company_id', userData.company_id)
      .single();
      
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
  
  useEffect(() => {
    const checkJobParsingAccess = async () => {
      if (!user) return;
      
      const enabled = await isJobParsingEnabled(user.id);
      setShowJobParsing(enabled);
    };
    
    checkJobParsingAccess();
  }, [user]);
  
  useEffect(() => {
    // Filter out job parsing link if not enabled
    setFilteredLinks(links.filter(link => {
      if (link.href === '/customer/job-parsing') {
        return showJobParsing;
      }
      return true;
    }));
  }, [links, showJobParsing]);

  return (
    <nav className="space-y-0.5 px-3">
      {filteredLinks.map((link) => (
        <NavLink
          key={link.href}
          to={link.href}
          end={link.href.endsWith('/')}
          className={({ isActive }) =>
            cn(
              "flex items-center py-2 px-3 rounded-md group hover:bg-primary/10 transition-colors",
              isActive
                ? "bg-primary/10 text-primary font-medium"
                : "text-foreground/80 font-normal",
              collapsed ? "justify-center" : "justify-start",
            )
          }
        >
          <link.icon
            className={cn(
              "flex-shrink-0 w-5 h-5",
              collapsed ? "mx-auto" : "mr-2"
            )}
          />
          {!collapsed && (
            <span className="truncate">{link.label}</span>
          )}
          {!collapsed && link.badge && (
            <Badge
              variant={link.badge.variant}
              className="ml-auto px-1.5 h-5 text-xs"
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
