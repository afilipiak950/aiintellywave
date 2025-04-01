
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { DownloadCloud, RefreshCw, TableIcon, BarChart3, ChevronLeft, ChevronRight, RotateCw } from 'lucide-react';

interface RevenueDashboardControlsProps {
  activeTab: 'table' | 'charts';
  setActiveTab: (tab: 'table' | 'charts') => void;
  currentMonth: number;
  currentYear: number;
  monthsToShow: number;
  navigateMonths: (direction: 'prev' | 'next') => void;
  changeMonthsToShow: (count: number) => void;
  exportCsv: () => void;
  changeYearFilter: (year: number) => void;
  yearFilter: number;
  refreshData: () => void;
  syncCustomers: () => Promise<void>;
  syncStatus: 'idle' | 'syncing' | 'error' | 'success';
}

export default function RevenueDashboardControls({
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
  syncCustomers,
  syncStatus
}: RevenueDashboardControlsProps) {
  return (
    <div className="flex flex-col md:flex-row justify-between space-y-2 md:space-y-0">
      <div className="flex space-x-1">
        <Button
          variant={activeTab === 'table' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveTab('table')}
        >
          <TableIcon className="h-4 w-4 mr-1" />
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
      </div>

      <div className="flex space-x-1 items-center">
        <div className="flex space-x-1 mr-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateMonths('prev')}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Select
            value={yearFilter.toString()}
            onValueChange={(value) => changeYearFilter(parseInt(value))}
          >
            <SelectTrigger className="w-[100px]">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              {[2023, 2024, 2025, 2026, 2027].map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateMonths('next')}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <Select
          value={monthsToShow.toString()}
          onValueChange={(value) => changeMonthsToShow(parseInt(value))}
        >
          <SelectTrigger className="w-[80px]">
            <SelectValue placeholder="Show" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="12">Year</SelectItem>
            <SelectItem value="6">6 mo</SelectItem>
            <SelectItem value="3">3 mo</SelectItem>
            <SelectItem value="1">Month</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          size="sm"
          onClick={refreshData}
        >
          <RefreshCw className="h-4 w-4 mr-1" />
          Refresh
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={exportCsv}
        >
          <DownloadCloud className="h-4 w-4 mr-1" />
          Export
        </Button>
        
        <Button
          variant={syncStatus === 'syncing' ? 'secondary' : 'default'}
          size="sm"
          onClick={syncCustomers}
          disabled={syncStatus === 'syncing'}
          className="ml-2"
        >
          <RotateCw className={`h-4 w-4 mr-1 ${syncStatus === 'syncing' ? 'animate-spin' : ''}`} />
          {syncStatus === 'syncing' ? 'Syncing...' : 'Sync Customers'}
        </Button>
      </div>
    </div>
  );
}
