
import { ExcelRow } from '../../../../../../types/project';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface AdditionalInformationProps {
  lead: ExcelRow;
}

const AdditionalInformation = ({ lead }: AdditionalInformationProps) => {
  const [showMoreDetails, setShowMoreDetails] = useState(false);
  
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

  return (
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
  );
};

export default AdditionalInformation;
