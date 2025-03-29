
import { ExcelRow } from '../../../../../../types/project';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Mail, MapPin, Globe, ExternalLink, Users } from 'lucide-react';

interface ContactInformationProps {
  lead: ExcelRow;
}

const ContactInformation = ({ lead }: ContactInformationProps) => {
  // Helper functions to extract common fields
  const getEmail = () => lead.row_data["Email"] || "";
  const getCity = () => lead.row_data["City"] || "";
  const getState = () => lead.row_data["State"] || "";
  const getCountry = () => lead.row_data["Country"] || "";
  const getWebsite = () => lead.row_data["Website"] || "";
  const getEmployees = () => lead.row_data["# Employees"] || "";

  // Handle link opening
  const handleOpenLink = (url: string) => {
    if (!url) return;
    
    // Add https if not present
    let fullUrl = url;
    if (!/^https?:\/\//i.test(url)) {
      fullUrl = 'https://' + url;
    }
    
    window.open(fullUrl, '_blank');
  };

  return (
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
  );
};

export default ContactInformation;
