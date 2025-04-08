import { TableHead, TableHeader as ShadcnTableHeader, TableRow } from "../../table";

interface TableHeaderProps {
  columns: string[];
}

const TableHeader = ({ columns }: TableHeaderProps) => {
  // Limited visible columns (keeping the same logic as in ListView)
  const visibleColumns = columns;
  
  return (
    <ShadcnTableHeader className="sticky top-0 z-10 bg-background">
      <TableRow className="bg-muted/50 hover:bg-muted/50">
        {/* Fixed columns */}
        <TableHead 
          className="sticky left-0 z-20 w-[80px] font-semibold bg-muted/50 whitespace-nowrap"
          style={{ boxShadow: '2px 0 5px -2px rgba(0,0,0,0.1)' }}
        >
          Approve
        </TableHead>
        <TableHead 
          className="sticky left-[80px] z-20 w-[180px] font-semibold whitespace-nowrap px-4 py-3 text-left bg-muted/50"
          style={{ boxShadow: '2px 0 5px -2px rgba(0,0,0,0.1)' }}
        >
          Name
        </TableHead>
        
        {/* Scrollable columns */}
        {visibleColumns.map(column => (
          <TableHead 
            key={column} 
            className="font-semibold whitespace-nowrap px-4 py-3 text-left min-w-[180px]"
          >
            {column}
          </TableHead>
        ))}
        
        {/* Fixed action column on the right */}
        <TableHead 
          className="sticky right-0 z-20 w-[100px] text-center font-semibold bg-muted/50"
          style={{ boxShadow: '-2px 0 5px -2px rgba(0,0,0,0.1)' }}
        >
          Actions
        </TableHead>
      </TableRow>
    </ShadcnTableHeader>
  );
};

export default TableHeader;
