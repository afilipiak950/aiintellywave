
import { ExcelRow } from '../../../../../types/project';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Mail, Phone, MapPin, Building, Globe, ExternalLink, Linkedin, Twitter, Facebook, Users, Hash } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useState } from 'react';

interface LeadDetailContentProps {
  lead: ExcelRow;
  selectedColumn?: string;
}

const LeadDetailContent = ({ lead, selectedColumn }: LeadDetailContentProps) => {
  const [showMoreDetails, setShowMoreDetails] = useState(false);
  
  // If a column is selected, only show that column's data
  if (selectedColumn) {
    return (
      <div className="p-6 space-y-2">
        <h3 className="text-sm font-semibold text-muted-foreground">{selectedColumn}</h3>
        <p className="text-lg">{lead.row_data[selectedColumn]?.toString() || 'N/A'}</p>
      </div>
    );
  }
  
  // Helper functions to extract common fields
  const getName = () => lead.row_data["Name"] || lead.row_data["First Name"] + " " + lead.row_data["Last Name"] || "Unknown";
  const getEmail = () => lead.row_data["Email"] || "";
  const getTitle = () => lead.row_data["Title"] || "";
  const getCompany = () => lead.row_data["Company"] || "";
  const getCountry = () => lead.row_data["Country"] || "";
  const getCity = () => lead.row_data["City"] || "";
  const getState = () => lead.row_data["State"] || "";
  const getWebsite = () => lead.row_data["Website"] || "";
  const getIndustry = () => lead.row_data["Industry"] || "";
  const getFacebookUrl = () => lead.row_data["Facebook Url"] || "";
  const getTwitterUrl = () => lead.row_data["Twitter Url"] || "";
  const getLinkedinUrl = () => lead.row_data["Linkedin Url"] || lead.row_data["LinkedIn Url"] || "";
  const getEmployees = () => lead.row_data["# Employees"] || "";
  const getKeywords = () => lead.row_data["Keywords"] || "";
  
  // Get profile photo URL from various possible fields
  const getProfilePhotoUrl = () => {
    const photoFields = [
      "LinkedIn Photo", "linkedin_photo", "profile_photo", "photo_url", 
      "avatar_url", "photo", "image_url", "headshot_url", "picture"
    ];
    
    for (const field of photoFields) {
      if (lead.row_data[field]) {
        const url = lead.row_data[field] as string;
        if (url && (url.startsWith('http') || url.startsWith('https') || url.startsWith('www.'))) {
          return url;
        }
      }
    }
    
    return null;
  };
  
  // Get initials for avatar
  const getInitials = () => {
    const name = getName();
    return name
      .split(' ')
      .slice(0, 2)
      .map(part => part[0]?.toUpperCase() || '')
      .join('');
  };
  
  const handleOpenLink = (url: string) => {
    if (!url) return;
    
    // Add https if not present
    let fullUrl = url;
    if (!/^https?:\/\//i.test(url)) {
      fullUrl = 'https://' + url;
    }
    
    window.open(fullUrl, '_blank');
  };
  
  // Group fields for better organization
  const primaryFields = ["Name", "First Name", "Last Name", "Email", "Phone", "Title", "Company"];
  const locationFields = ["Country", "State", "City", "Address"];
  const socialFields = ["Website", "LinkedIn Url", "Linkedin Url", "Twitter Url", "Facebook Url"];
  
  // Skip photo fields for display in the general fields list
  const photoFields = ["LinkedIn Photo", "linkedin_photo", "profile_photo", "photo_url", 
    "avatar_url", "photo", "image_url", "headshot_url", "picture"];
  
  const secondaryFields = Object.entries(lead.row_data)
    .filter(([key]) => 
      !primaryFields.includes(key) && 
      !locationFields.includes(key) && 
      !socialFields.includes(key) &&
      !photoFields.includes(key)
    )
    .slice(0, showMoreDetails ? undefined : 6);
  
  const hasMoreFields = Object.keys(lead.row_data).length - primaryFields.length - 
    locationFields.length - socialFields.length - photoFields.length > 6;

  const photoUrl = getProfilePhotoUrl();

  return (
    <div className="p-6 space-y-6">
      {/* Profile section with photo if available */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex items-center gap-4 mb-4"
      >
        <Avatar className="h-16 w-16 rounded-full border-2 border-primary/20 shadow-md">
          {photoUrl ? (
            <AvatarImage src={photoUrl} alt={`${getName()}'s photo`} className="object-cover" />
          ) : null}
          <AvatarFallback className="bg-primary text-primary-foreground text-lg">
            {getInitials()}
          </AvatarFallback>
        </Avatar>
        
        <div>
          <h2 className="text-xl font-semibold">{getName()}</h2>
          {getTitle() && <p className="text-muted-foreground">{getTitle()}</p>}
        </div>
      </motion.div>

      {/* Contact information */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardContent className="p-4">
            <h3 className="text-sm font-semibold text-muted-foreground mb-3">Contact Information</h3>
            
            <div className="space-y-3">
              {getEmail() && (
                <div className="flex items-center">
                  <Mail className="h-4 w-4 text-primary mr-2" />
                  <a 
                    href={`mailto:${getEmail()}`} 
                    className="text-primary hover:underline"
                  >
                    {getEmail()}
                  </a>
                </div>
              )}
              
              {(getCity() || getState() || getCountry()) && (
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 text-muted-foreground mr-2" />
                  <span>
                    {[getCity(), getState(), getCountry()].filter(Boolean).join(", ")}
                  </span>
                </div>
              )}
              
              {getWebsite() && (
                <div className="flex items-center">
                  <Globe className="h-4 w-4 text-muted-foreground mr-2" />
                  <button 
                    onClick={() => handleOpenLink(getWebsite())}
                    className="text-primary hover:underline flex items-center"
                  >
                    {getWebsite()}
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </button>
                </div>
              )}
              
              {getEmployees() && (
                <div className="flex items-center">
                  <Users className="h-4 w-4 text-muted-foreground mr-2" />
                  <span>Employees: {getEmployees()}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
      
      {/* Social links */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex gap-2 flex-wrap">
          {getLinkedinUrl() && (
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-2"
              onClick={() => handleOpenLink(getLinkedinUrl())}
            >
              <Linkedin className="h-4 w-4" />
              LinkedIn
            </Button>
          )}
          
          {getTwitterUrl() && (
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-2"
              onClick={() => handleOpenLink(getTwitterUrl())}
            >
              <Twitter className="h-4 w-4" />
              Twitter
            </Button>
          )}
          
          {getFacebookUrl() && (
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-2"
              onClick={() => handleOpenLink(getFacebookUrl())}
            >
              <Facebook className="h-4 w-4" />
              Facebook
            </Button>
          )}
        </div>
      </motion.div>
      
      {/* Additional information */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <Card>
          <CardContent className="p-4">
            <h3 className="text-sm font-semibold text-muted-foreground mb-3">Additional Information</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {secondaryFields.map(([key, value]) => (
                <div key={key} className="space-y-1">
                  <p className="text-xs text-muted-foreground">{key}</p>
                  <p className="font-medium">{value?.toString() || 'N/A'}</p>
                </div>
              ))}
            </div>
            
            {hasMoreFields && (
              <Collapsible open={showMoreDetails} onOpenChange={setShowMoreDetails}>
                <CollapsibleTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="mt-3 w-full justify-center"
                  >
                    {showMoreDetails ? "Show Less" : "Show More"}
                  </Button>
                </CollapsibleTrigger>
                
                <CollapsibleContent className="pt-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t pt-3">
                    {Object.entries(lead.row_data)
                      .filter(([key]) => 
                        !primaryFields.includes(key) && 
                        !locationFields.includes(key) && 
                        !socialFields.includes(key) &&
                        !photoFields.includes(key)
                      )
                      .slice(6)
                      .map(([key, value]) => (
                        <div key={key} className="space-y-1">
                          <p className="text-xs text-muted-foreground">{key}</p>
                          <p className="font-medium">{value?.toString() || 'N/A'}</p>
                        </div>
                      ))
                    }
                  </div>
                </CollapsibleContent>
              </Collapsible>
            )}
          </CardContent>
        </Card>
      </motion.div>
      
      {/* Keywords tags */}
      {getKeywords() && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-center gap-2 flex-wrap">
            <Hash className="h-4 w-4 text-muted-foreground" />
            <div className="flex flex-wrap gap-1">
              {getKeywords().split(',').map((keyword, index) => (
                <Badge key={index} variant="secondary" className="whitespace-nowrap">
                  {keyword.trim()}
                </Badge>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default LeadDetailContent;
