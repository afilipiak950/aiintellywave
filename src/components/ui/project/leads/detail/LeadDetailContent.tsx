
import { ExcelRow } from '../../../../../types/project';

interface LeadDetailContentProps {
  lead: ExcelRow;
  selectedColumn?: string;
}

const LeadDetailContent = ({ lead, selectedColumn }: LeadDetailContentProps) => {
  // If a column is selected, only show that column's data
  const entries = selectedColumn 
    ? [[selectedColumn, lead.row_data[selectedColumn]]]
    : Object.entries(lead.row_data);

  return (
    <div className="p-6 space-y-6">
      {entries.map(([key, value]) => (
        <div key={key} className="space-y-2">
          <h3 className="text-sm font-semibold text-muted-foreground">{key}</h3>
          <p className="text-lg">{value?.toString() || 'N/A'}</p>
          <div className="border-t border-border pt-2"></div>
        </div>
      ))}
    </div>
  );
};

export default LeadDetailContent;
