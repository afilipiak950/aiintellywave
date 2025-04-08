
import { Button } from "../../button";
import { TableCell, TableRow } from "../../table";
import { ExcelRow } from "../../../../types/project";
import { Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../tooltip";
import ApproveButton from "./ApproveButton";
import EditableCell from "./EditableCell";
import { motion } from "framer-motion";

interface LeadRowProps {
  row: ExcelRow;
  isApproved: boolean;
  editingCell: { rowId: string, column: string } | null;
  canEdit: boolean;
  columns: string[];
  allColumns?: string[];
  onApprove: (id: string) => void;
  onLeadClick: (lead: ExcelRow) => void;
  onStartEditing: (rowId: string, column: string) => void;
  onSaveEdit: (value: string) => void;
  onCancelEditing: () => void;
  isUpdatingApproval?: boolean;
  index?: number;
}

const LeadRow = ({
  row,
  isApproved,
  editingCell,
  canEdit,
  columns,
  allColumns,
  onApprove,
  onLeadClick,
  onStartEditing,
  onSaveEdit,
  onCancelEditing,
  isUpdatingApproval = false,
  index = 0
}: LeadRowProps) => {
  // Helper function to get a name from row data
  const getNameFromRowData = (rowData: Record<string, any>): string => {
    // Try common name field variations
    for (const field of ['Name', 'name', 'Full Name', 'full_name', 'FullName', 'fullName']) {
      if (rowData[field]) return rowData[field];
    }
    
    // Try to compose name from first and last name
    const firstName = rowData['First Name'] || rowData['first_name'] || rowData['FirstName'] || '';
    const lastName = rowData['Last Name'] || rowData['last_name'] || rowData['LastName'] || '';
    
    if (firstName || lastName) {
      return `${firstName} ${lastName}`.trim();
    }
    
    return 'Unknown';
  };

  const name = getNameFromRowData(row.row_data);
  
  // Animation variants - applied to the row and its cells
  const rowVariants = {
    hidden: { 
      opacity: 0,
      y: 10
    },
    visible: (i: number) => ({ 
      opacity: 1, 
      y: 0,
      transition: {
        delay: i * 0.05,
        duration: 0.3,
        ease: "easeOut"
      }
    }),
    hover: {
      backgroundColor: isApproved ? "rgba(240, 253, 244, 0.8)" : "rgba(249, 250, 251, 0.8)"
    }
  };

  return (
    <motion.tr
      custom={index}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      variants={rowVariants}
      className={`border-b transition-colors ${isApproved ? 'bg-green-50/80 dark:bg-green-950/20' : ''}`}
    >
      {/* Fixed Approve column */}
      <TableCell 
        className="sticky left-0 z-20 w-[80px] p-2 bg-white dark:bg-gray-900"
        style={{
          backgroundColor: isApproved ? 'rgb(240 253 244 / 1)' : '',
          boxShadow: '2px 0 5px -2px rgba(0,0,0,0.1)'
        }}
      >
        <div onClick={(e) => e.stopPropagation()} className="flex justify-center">
          <ApproveButton 
            isApproved={isApproved}
            onApprove={() => onApprove(row.id)}
            isLoading={isUpdatingApproval}
          />
        </div>
      </TableCell>
      
      {/* Fixed Name column */}
      <TableCell 
        className="sticky left-[80px] z-20 w-[180px] whitespace-nowrap py-3 bg-white dark:bg-gray-900"
        onClick={() => onLeadClick(row)}
        style={{
          backgroundColor: isApproved ? 'rgb(240 253 244 / 1)' : '',
          boxShadow: '2px 0 5px -2px rgba(0,0,0,0.1)'
        }}
      >
        <div className="px-2 font-medium">
          {name}
        </div>
      </TableCell>
      
      {/* Scrollable data columns - limited to showing only the first few columns */}
      {columns.map(column => (
        <TableCell 
          key={`${row.id}-${column}`}
          className="whitespace-nowrap py-3 min-w-[180px] max-w-[180px]"
          onClick={() => onLeadClick(row)}
        >
          <div
            onClick={(e) => {
              if (canEdit) {
                e.stopPropagation();
                onStartEditing(row.id, column);
              }
            }}
            className="px-2"
          >
            <EditableCell 
              value={row.row_data[column]}
              isEditing={editingCell?.rowId === row.id && editingCell?.column === column}
              canEdit={canEdit}
              onStartEditing={() => onStartEditing(row.id, column)}
              onSave={onSaveEdit}
              onCancel={onCancelEditing}
            />
          </div>
        </TableCell>
      ))}
      
      {/* Fixed action column on the right */}
      <TableCell 
        className="sticky right-0 z-20 w-[100px] text-center bg-white dark:bg-gray-900"
        style={{
          backgroundColor: isApproved ? 'rgb(240 253 244 / 1)' : '',
          boxShadow: '-2px 0 5px -2px rgba(0,0,0,0.1)'
        }}
      >
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="p-0 h-8 w-8 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
                onClick={() => onLeadClick(row)}
              >
                <Info className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>View all details</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </TableCell>
    </motion.tr>
  );
};

export default LeadRow;
