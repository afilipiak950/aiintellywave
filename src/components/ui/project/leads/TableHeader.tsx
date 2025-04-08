
import { TableHead, TableHeader as ShadcnTableHeader, TableRow } from "../../table";
import { motion } from "framer-motion";

interface TableHeaderProps {
  columns: string[];
  allColumns?: string[];
}

const TableHeader = ({ columns, allColumns }: TableHeaderProps) => {
  return (
    <ShadcnTableHeader className="sticky top-0 z-10 bg-background">
      <motion.tr
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 hover:bg-muted/50"
      >
        {/* Fixed columns */}
        <TableHead 
          className="sticky left-0 z-20 w-[80px] font-semibold bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 whitespace-nowrap"
          style={{ boxShadow: '2px 0 5px -2px rgba(0,0,0,0.1)' }}
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.3 }}
          >
            Approve
          </motion.div>
        </TableHead>
        <TableHead 
          className="sticky left-[80px] z-20 w-[180px] font-semibold whitespace-nowrap px-4 py-3 text-left bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900"
          style={{ boxShadow: '2px 0 5px -2px rgba(0,0,0,0.1)' }}
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15, duration: 0.3 }}
          >
            Name
          </motion.div>
        </TableHead>
        
        {/* Scrollable columns - limited to 3 */}
        {columns.map((column, index) => (
          <TableHead 
            key={column} 
            className="font-semibold whitespace-nowrap px-4 py-3 text-left min-w-[180px] max-w-[180px]"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 + (index * 0.05), duration: 0.3 }}
            >
              {column}
            </motion.div>
          </TableHead>
        ))}
        
        {/* Fixed action column on the right */}
        <TableHead 
          className="sticky right-0 z-20 w-[100px] text-center font-semibold bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900"
          style={{ boxShadow: '-2px 0 5px -2px rgba(0,0,0,0.1)' }}
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.3 }}
          >
            Actions
          </motion.div>
        </TableHead>
      </motion.tr>
    </ShadcnTableHeader>
  );
};

export default TableHeader;
