
import { TableCell, TableRow } from "@/components/ui/table";
import { Lead } from "@/types/lead";
import { Building, Linkedin } from "lucide-react";
import LeadStatusBadge from "../LeadStatusBadge";
import { Button } from "@/components/ui/button";
import { getLinkedInUrlFromLead } from "../detail/LeadDetailUtils";

interface LeadListRowProps {
  lead: Lead;
  onRowClick: (lead: Lead) => void;
}

const LeadListRow = ({ lead, onRowClick }: LeadListRowProps) => {
  const linkedInUrl = getLinkedInUrlFromLead(lead);
  
  // Combine first name and last name, fallback to original name if not available
  const fullName = lead.first_name && lead.last_name 
    ? `${lead.first_name} ${lead.last_name}`
    : lead.first_name 
      ? lead.first_name 
      : lead.last_name 
        ? lead.last_name 
        : lead.name || '';
  
  return (
    <TableRow 
      key={lead.id}
      className="hover:bg-muted/50 cursor-pointer"
      onClick={(e) => {
        // Don't trigger row click when clicking the LinkedIn button
        if (!(e.target as HTMLElement).closest('.linkedin-button')) {
          onRowClick(lead);
        }
      }}
    >
      <TableCell className="font-medium">{fullName}</TableCell>
      <TableCell>{lead.company || '—'}</TableCell>
      <TableCell>{lead.position || '—'}</TableCell>
      <TableCell>
        <LeadStatusBadge status={lead.status} />
      </TableCell>
      <TableCell>
        {lead.project_name && (
          <div className="flex items-center text-xs text-gray-500">
            <Building className="h-3 w-3 mr-1" />
            <span className="truncate max-w-[150px]">{lead.project_name}</span>
          </div>
        )}
      </TableCell>
      <TableCell className="text-right">
        {linkedInUrl ? (
          <a 
            href={linkedInUrl.startsWith('http') ? linkedInUrl : `https://${linkedInUrl}`} 
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="linkedin-button inline-block"
          >
            <Button 
              size="sm" 
              variant="outline"
              className="hover:bg-[#0A66C2]/10 text-[#0A66C2] border-[#0A66C2]/30"
            >
              <Linkedin className="h-4 w-4" />
            </Button>
          </a>
        ) : (
          <span className="text-gray-400 text-sm">No profile</span>
        )}
      </TableCell>
    </TableRow>
  );
};

export default LeadListRow;
