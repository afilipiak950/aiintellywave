
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ExcelRow } from '@/types/project';
import { Building, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

interface LeadDetailHeaderProps {
  lead: ExcelRow;
}

const LeadDetailHeader = ({ lead }: LeadDetailHeaderProps) => {
  const getName = () => lead.row_data["Name"] || 
    (lead.row_data["First Name"] && lead.row_data["Last Name"] ? 
      `${lead.row_data["First Name"]} ${lead.row_data["Last Name"]}` : 
      "Unknown");
  const getTitle = () => lead.row_data["Title"] || "";
  const getCompany = () => lead.row_data["Company"] || "";
  const getIndustry = () => lead.row_data["Industry"] || "";
  
  const getInitials = () => {
    const name = getName();
    return name.split(' ').map(part => part[0]).join('').toUpperCase().substring(0, 2);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }} 
      animate={{ opacity: 1, y: 0 }}
      className="flex gap-4 items-start p-6"
    >
      <Avatar className="h-16 w-16 border-2 border-primary/20">
        <AvatarFallback className="text-lg bg-primary text-primary-foreground">
          {getInitials()}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1">
        <h2 className="text-xl font-bold">{getName()}</h2>
        {getCompany() && (
          <div className="flex items-center mt-1">
            <Building className="h-4 w-4 mr-1 text-muted-foreground" />
            <span>{getCompany()}</span>
          </div>
        )}
        
        {getTitle() && (
          <p className="text-muted-foreground">{getTitle()}</p>
        )}
        
        {getIndustry() && (
          <Badge variant="outline" className="mt-2">
            {getIndustry()}
          </Badge>
        )}
      </div>
    </motion.div>
  );
};

export default LeadDetailHeader;
