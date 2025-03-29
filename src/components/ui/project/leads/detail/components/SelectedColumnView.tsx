
import { ExcelRow } from '../../../../../../types/project';

interface SelectedColumnViewProps {
  lead: ExcelRow;
  selectedColumn: string;
}

const SelectedColumnView = ({ lead, selectedColumn }: SelectedColumnViewProps) => {
  return (
    <div className="p-6 space-y-2">
      <h3 className="text-sm font-semibold text-muted-foreground">{selectedColumn}</h3>
      <p className="text-lg">{lead.row_data[selectedColumn]?.toString() || 'N/A'}</p>
    </div>
  );
};

export default SelectedColumnView;
