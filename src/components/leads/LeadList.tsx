
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Lead } from "@/types/lead";
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';
import { LeadStatusBadge } from "./LeadStatusBadge";

interface LeadListProps {
  leads: Lead[];
  onLeadClick: (lead: Lead) => void;
}

export const LeadList = ({ leads, onLeadClick }: LeadListProps) => {
  // Helper function to get the proper display name
  const getLeadDisplayName = (lead: Lead): string => {
    if (lead.first_name && lead.last_name) {
      return `${lead.first_name} ${lead.last_name}`;
    } else if (lead.extra_data?.["First Name"] && lead.extra_data?.["Last Name"]) {
      return `${lead.extra_data["First Name"]} ${lead.extra_data["Last Name"]}`;
    } else {
      return lead.name || 'Unbekannt';
    }
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Unternehmen</TableHead>
            <TableHead>Position</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Zuletzt aktualisiert</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leads.map((lead) => (
            <TableRow 
              key={lead.id}
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => onLeadClick(lead)}
            >
              <TableCell className="font-medium">{getLeadDisplayName(lead)}</TableCell>
              <TableCell>{lead.company || '-'}</TableCell>
              <TableCell>{lead.position || '-'}</TableCell>
              <TableCell>
                <LeadStatusBadge status={lead.status} />
              </TableCell>
              <TableCell className="text-muted-foreground">
                {formatDistanceToNow(new Date(lead.updated_at), { 
                  addSuffix: true,
                  locale: de 
                })}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
