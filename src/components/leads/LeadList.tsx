
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Lead } from "@/types/lead";
import { formatDistanceToNow } from "date-fns";
import { Building, Mail, Phone } from "lucide-react";
import LeadStatusBadge from "./LeadStatusBadge";
import { motion } from 'framer-motion';
import { Loader2 } from "lucide-react";

interface LeadListProps {
  leads: Lead[];
  onUpdateLead: (id: string, updates: Partial<Lead>) => Promise<Lead | null>;
  loading?: boolean;
}

const LeadList = ({ leads, onUpdateLead, loading = false }: LeadListProps) => {
  const getRelativeTime = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (e) {
      return 'Invalid date';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-16">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
          <p className="text-muted-foreground">Loading leads...</p>
        </div>
      </div>
    );
  }
  
  if (leads.length === 0) {
    return (
      <motion.div 
        className="text-center py-16 px-4 bg-gradient-to-tr from-slate-50 to-gray-50 rounded-xl border border-slate-100 shadow-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <h3 className="text-xl font-medium text-gray-900 mb-2">
          No leads found
        </h3>
        <p className="text-gray-500 max-w-md mx-auto">
          Try adjusting your search or filter criteria, or create a new lead using the "Add New Lead" button.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="w-full rounded-md overflow-hidden border"
    >
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="font-medium">Name</TableHead>
            <TableHead className="font-medium">Company</TableHead>
            <TableHead className="font-medium">Contact</TableHead>
            <TableHead className="font-medium">Position</TableHead>
            <TableHead className="font-medium">Status</TableHead>
            <TableHead className="font-medium">Created</TableHead>
            <TableHead className="font-medium">Project</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leads.map((lead, index) => (
            <TableRow 
              key={lead.id}
              className="hover:bg-muted/50 cursor-pointer"
            >
              <TableCell className="font-medium">{lead.name}</TableCell>
              <TableCell>{lead.company || '—'}</TableCell>
              <TableCell>
                <div className="flex flex-col space-y-1">
                  {lead.email && (
                    <div className="flex items-center text-xs text-gray-500">
                      <Mail className="h-3 w-3 mr-1 text-blue-400" />
                      <span className="truncate max-w-[150px]">{lead.email}</span>
                    </div>
                  )}
                  {lead.phone && (
                    <div className="flex items-center text-xs text-gray-500">
                      <Phone className="h-3 w-3 mr-1 text-green-400" />
                      <span>{lead.phone}</span>
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell>{lead.position || '—'}</TableCell>
              <TableCell>
                <LeadStatusBadge status={lead.status} />
              </TableCell>
              <TableCell>
                <div className="text-sm text-gray-500">{getRelativeTime(lead.created_at)}</div>
              </TableCell>
              <TableCell>
                {lead.project_name && (
                  <div className="flex items-center text-xs text-gray-500">
                    <Building className="h-3 w-3 mr-1" />
                    <span className="truncate max-w-[150px]">{lead.project_name}</span>
                  </div>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </motion.div>
  );
};

export default LeadList;
