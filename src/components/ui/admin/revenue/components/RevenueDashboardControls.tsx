
import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  ChevronLeft, 
  ChevronRight, 
  Table, 
  BarChart3, 
  FileDown,
  RefreshCw,
  UsersRound
} from 'lucide-react';

interface RevenueDashboardControlsProps {
  activeTab: 'table' | 'charts';
  setActiveTab: (tab: 'table' | 'charts') => void;
  currentMonth: number;
  currentYear: number;
  monthsToShow: number;
  navigateMonths: (direction: 'prev' | 'next') => void;
  changeMonthsToShow: (months: number) => void;
  exportCsv: () => void;
  changeYearFilter: (year: number | null) => void;
  yearFilter: number | null;
  refreshData: () => void;
  syncCustomers: () => void; // New prop for syncing customers
}

const RevenueDashboardControls: React.FC<RevenueDashboardControlsProps> = ({
  activeTab,
  setActiveTab,
  currentMonth,
  currentYear,
  monthsToShow,
  navigateMonths,
  changeMonthsToShow,
  exportCsv,
  changeYearFilter,
  yearFilter,
  refreshData,
  syncCustomers // New prop for syncing customers
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-2 justify-between pb-2">
      <div className="flex items-center space-x-2">
        <Button 
          variant={activeTab === 'table' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveTab('table')}
        >
          <Table className="h-4 w-4 mr-1" />
          Table
        </Button>
        <Button 
          variant={activeTab === 'charts' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveTab('charts')}
        >
          <BarChart3 className="h-4 w-4 mr-1" />
          Charts
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={refreshData}
          className="ml-2"
        >
          <RefreshCw className="h-4 w-4 mr-1" />
          Refresh
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={syncCustomers}
          className="ml-2"
        >
          <UsersRound className="h-4 w-4 mr-1" />
          Sync Customers
        </Button>
      </div>
      
      <div className="flex items-center space-x-2">
        <div className="flex items-center rounded-md border">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigateMonths('prev')}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="px-3 py-1 text-sm">
            {currentMonth}/{currentYear}
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigateMonths('next')}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        
        <select 
          className="text-sm border rounded-md p-1"
          value={monthsToShow}
          onChange={(e) => changeMonthsToShow(Number(e.target.value))}
        >
          <option value={3}>3 months</option>
          <option value={6}>6 months</option>
          <option value={12}>12 months</option>
          <option value={24}>24 months</option>
        </select>
        
        <Button 
          variant="outline" 
          size="sm"
          onClick={exportCsv}
        >
          <FileDown className="h-4 w-4 mr-1" />
          Export
        </Button>
      </div>
    </div>
  );
};

export default RevenueDashboardControls;
