
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface PageSizeSelectorProps {
  pageSize: number;
  onPageSizeChange: (size: number) => void;
}

const PageSizeSelector = ({ pageSize, onPageSizeChange }: PageSizeSelectorProps) => {
  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm text-muted-foreground">Rows per page:</span>
      <Select 
        value={String(pageSize)} 
        onValueChange={(value) => onPageSizeChange(Number(value))}
      >
        <SelectTrigger className="w-20">
          <SelectValue placeholder={pageSize} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="25">25</SelectItem>
          <SelectItem value="50">50</SelectItem>
          <SelectItem value="1000">1000</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default PageSizeSelector;
