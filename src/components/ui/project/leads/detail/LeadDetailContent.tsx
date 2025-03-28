
import { ExcelRow } from "@/types/project";
import { ScrollArea } from "@/components/ui/scroll-area";

interface LeadDetailContentProps {
  lead: ExcelRow;
  activeField: string | null;
}

const LeadDetailContent = ({ lead, activeField }: LeadDetailContentProps) => {
  // Function to format field values for display
  const formatValue = (key: string, value: any): string => {
    if (value === null || value === undefined) {
      return "Not provided";
    }
    
    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }
    
    if (Array.isArray(value)) {
      return value.join(', ');
    }
    
    if (typeof value === 'object') {
      return JSON.stringify(value, null, 2);
    }
    
    return String(value);
  };

  return (
    <ScrollArea className="flex-1 p-6">
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-1">
            {lead.row_data?.name || lead.row_data?.company || 'Lead Details'}
          </h2>
          {lead.row_data?.position && (
            <p className="text-muted-foreground">
              {lead.row_data.position}
              {lead.row_data?.company && ` at ${lead.row_data.company}`}
            </p>
          )}
        </div>
        
        {activeField ? (
          <div className="space-y-2">
            <h3 className="text-lg font-medium">
              {activeField.charAt(0).toUpperCase() + activeField.slice(1)}
            </h3>
            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-md">
              <p className="whitespace-pre-wrap break-words">{formatValue(activeField, lead.row_data[activeField])}</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Lead Overview</h3>
            <div className="grid grid-cols-1 gap-4">
              {Object.entries(lead.row_data || {})
                .filter(([key]) => key !== 'id')
                .slice(0, 5)
                .map(([key, value]) => (
                  <div key={key} className="bg-gray-50 dark:bg-gray-900 p-3 rounded-md">
                    <div className="text-sm font-medium mb-1">
                      {key.charAt(0).toUpperCase() + key.slice(1)}
                    </div>
                    <div className="text-sm text-muted-foreground break-words">
                      {formatValue(key, value)}
                    </div>
                  </div>
                ))}
            </div>
            <p className="text-sm text-muted-foreground italic">
              Select a field from the sidebar to view more details.
            </p>
          </div>
        )}
      </div>
    </ScrollArea>
  );
};

export default LeadDetailContent;
