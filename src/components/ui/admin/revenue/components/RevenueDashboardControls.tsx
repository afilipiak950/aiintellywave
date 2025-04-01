
import { Button } from '@/components/ui/button';
import { 
  ChevronLeft, 
  ChevronRight, 
  Download, 
  LayoutGrid, 
  Table, 
  Filter,
  UserPlus,
} from 'lucide-react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useState } from 'react';
import CustomerCreationForm from './CustomerCreationForm';

interface RevenueDashboardControlsProps {
  activeTab: 'table' | 'charts';
  setActiveTab: (tab: 'table' | 'charts') => void;
  currentMonth: number;
  currentYear: number;
  monthsToShow: number;
  navigateMonths: (direction: 'prev' | 'next') => void;
  changeMonthsToShow: (count: number) => void;
  exportCsv: () => void;
  changeYearFilter?: (year: number) => void;
  yearFilter?: number;
  refreshData?: () => void; // Add this prop to allow refreshing data
}

const RevenueDashboardControls = ({
  activeTab,
  setActiveTab,
  currentMonth,
  currentYear,
  monthsToShow,
  navigateMonths,
  changeMonthsToShow,
  exportCsv,
  changeYearFilter,
  yearFilter = 2025,
  refreshData // Use the new prop
}: RevenueDashboardControlsProps) => {
  const [isCustomerDialogOpen, setCustomerDialogOpen] = useState(false);
  
  const years = Array.from({ length: 10 }, (_, i) => 2020 + i);

  // Handler for when a customer is successfully created
  const handleCustomerCreated = () => {
    setCustomerDialogOpen(false);
    if (refreshData) {
      refreshData(); // Refresh the data to show the new customer
    }
  };
  
  return (
    <div className="flex flex-wrap justify-between gap-1">
      {/* Tabs */}
      <div className="flex items-center space-x-1">
        <Button
          variant={activeTab === 'table' ? 'default' : 'ghost'}
          size="xs"
          onClick={() => setActiveTab('table')}
        >
          <Table className="mr-1 h-3 w-3" />
          <span>Table</span>
        </Button>
        <Button
          variant={activeTab === 'charts' ? 'default' : 'ghost'}
          size="xs"
          onClick={() => setActiveTab('charts')}
        >
          <LayoutGrid className="mr-1 h-3 w-3" />
          <span>Charts</span>
        </Button>
      </div>
      
      {/* Filters and Navigation */}
      <div className="flex items-center gap-1">
        {/* Year Filter */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="xs" className="gap-2">
              <Filter className="h-3 w-3" />
              <span>Year: {yearFilter}</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="p-2 w-auto" align="end">
            <div className="grid gap-2">
              <p className="text-xs font-medium">Select Year</p>
              <div className="grid grid-cols-3 gap-1">
                {years.map((year) => (
                  <Button
                    key={year}
                    size="xs"
                    variant={year === yearFilter ? 'default' : 'outline'}
                    onClick={() => changeYearFilter && changeYearFilter(year)}
                  >
                    {year}
                  </Button>
                ))}
              </div>
            </div>
          </PopoverContent>
        </Popover>
        
        {/* Navigation */}
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="xs"
            onClick={() => navigateMonths('prev')}
          >
            <ChevronLeft className="h-3 w-3" />
            <span>Previous</span>
          </Button>
          <span className="text-xs font-medium">{currentYear}</span>
          <Button
            variant="outline"
            size="xs"
            onClick={() => navigateMonths('next')}
          >
            <span>Next</span>
            <ChevronRight className="h-3 w-3" />
          </Button>
        </div>
        
        {/* Add customer button */}
        <Button 
          size="xs" 
          variant="default"
          onClick={() => setCustomerDialogOpen(true)}
        >
          <UserPlus className="mr-1 h-3 w-3" />
          <span>Add Customer</span>
        </Button>
        
        {/* Export Button */}
        <Button
          variant="outline"
          size="xs"
          onClick={exportCsv}
        >
          <Download className="mr-1 h-3 w-3" />
          <span>Export</span>
        </Button>
      </div>
      
      {/* Customer creation dialog */}
      <Dialog 
        open={isCustomerDialogOpen} 
        onOpenChange={setCustomerDialogOpen}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Customer</DialogTitle>
          </DialogHeader>
          <CustomerCreationForm onSuccess={handleCustomerCreated} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RevenueDashboardControls;
