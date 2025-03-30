
import { useState } from 'react';
import { Card } from "../../card";
import { Button } from "../../button";
import { ExcelRow } from '../../../../types/project';
import { MoreHorizontal } from 'lucide-react';
import { motion } from 'framer-motion';
import ApproveButton from './ApproveButton';
import { Avatar, AvatarFallback, AvatarImage } from "../../avatar";

interface TileViewProps {
  data: ExcelRow[];
  approvedLeads: Set<string>;
  onApprove: (id: string) => void;
  onLeadClick: (lead: ExcelRow) => void;
  isUpdatingApproval?: boolean;
}

const TileView = ({ data, approvedLeads, onApprove, onLeadClick, isUpdatingApproval = false }: TileViewProps) => {
  const getCardBackground = (index: number) => {
    const backgrounds = [
      'bg-gradient-to-tr from-blue-50 to-indigo-50',
      'bg-gradient-to-tr from-purple-50 to-pink-50',
      'bg-gradient-to-tr from-emerald-50 to-teal-50',
      'bg-gradient-to-tr from-amber-50 to-yellow-50'
    ];
    
    return backgrounds[index % backgrounds.length];
  };

  const getImportantFields = (row: ExcelRow) => {
    const priorityFields = ['Name', 'Company', 'Title', 'Email', 'Phone', 'City', 'State'];
    const displayFields: Record<string, any> = {};
    
    // First add priority fields if they exist
    priorityFields.forEach(field => {
      const matchedField = Object.keys(row.row_data).find(
        key => key.toLowerCase() === field.toLowerCase()
      );
      
      if (matchedField && row.row_data[matchedField]) {
        displayFields[matchedField] = row.row_data[matchedField];
      }
    });
    
    // Add any other fields if we don't have enough
    if (Object.keys(displayFields).length < 5) {
      Object.entries(row.row_data).forEach(([key, value]) => {
        if (!Object.keys(displayFields).includes(key) && value && Object.keys(displayFields).length < 5) {
          displayFields[key] = value;
        }
      });
    }
    
    return displayFields;
  };

  // Get profile photo URL from various possible fields
  const getProfilePhotoUrl = (row: ExcelRow) => {
    const photoFields = [
      "LinkedIn Photo", "linkedin_photo", "profile_photo", "photo_url", 
      "avatar_url", "photo", "image_url", "headshot_url", "picture"
    ];
    
    for (const field of photoFields) {
      if (row.row_data[field]) {
        const url = row.row_data[field] as string;
        if (url && (url.startsWith('http') || url.startsWith('https') || url.startsWith('www.'))) {
          return url;
        }
      }
    }
    
    return null;
  };

  // Get initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .slice(0, 2)
      .map(part => part[0]?.toUpperCase() || '')
      .join('');
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-4 pb-4">
      {data.length === 0 && (
        <div className="col-span-full text-center py-8 border rounded-md bg-muted/10">
          No leads found matching your search criteria.
        </div>
      )}
      
      {data.map((row, index) => {
        const isApproved = approvedLeads.has(row.id);
        const importantFields = getImportantFields(row);
        const fieldKeys = Object.keys(importantFields);
        const hasMoreFields = Object.keys(row.row_data).length > fieldKeys.length;
        const photoUrl = getProfilePhotoUrl(row);
        const name = row.row_data["Name"] as string || "Unknown";
        
        return (
          <motion.div
            key={row.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            whileHover={{ y: -4, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
            className="h-full"
          >
            <Card 
              className={`cursor-pointer transition-all duration-300 h-full border overflow-hidden ${getCardBackground(index)} ${isApproved ? 'ring-2 ring-green-500 ring-offset-2' : ''}`}
            >
              <div className="absolute top-3 right-3 z-10">
                <ApproveButton 
                  isApproved={isApproved}
                  onApprove={(e) => {
                    e.stopPropagation();
                    onApprove(row.id);
                  }}
                  isLoading={isUpdatingApproval}
                />
              </div>
              
              <div 
                className="p-4 h-full flex flex-col"
                onClick={() => onLeadClick(row)}
              >
                <div className="flex items-center gap-3 mb-3">
                  <Avatar className="h-12 w-12 rounded-full border-2 border-white shadow-sm">
                    {photoUrl ? (
                      <AvatarImage src={photoUrl} alt={`${name}'s photo`} className="object-cover" />
                    ) : null}
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {getInitials(name)}
                    </AvatarFallback>
                  </Avatar>
                  
                  {fieldKeys.length > 0 && (
                    <div>
                      <div className="font-medium text-lg truncate">
                        {importantFields[fieldKeys[0]]}
                      </div>
                      {fieldKeys.length > 1 && (
                        <div className="text-sm text-muted-foreground truncate">
                          {importantFields[fieldKeys[1]]}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="space-y-2 text-sm flex-1">
                  {fieldKeys.slice(2).map((key, i) => (
                    <div key={i} className="flex flex-col">
                      <span className="text-xs text-muted-foreground capitalize">{key}</span>
                      <span className="truncate">{importantFields[key]}</span>
                    </div>
                  ))}
                </div>
                
                {hasMoreFields && (
                  <div className="mt-4 pt-2 border-t border-border/50">
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="w-full text-xs text-primary flex items-center justify-center gap-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        onLeadClick(row);
                      }}
                    >
                      <MoreHorizontal size={14} />
                      {Object.keys(row.row_data).length - fieldKeys.length} more fields
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
};

export default TileView;
