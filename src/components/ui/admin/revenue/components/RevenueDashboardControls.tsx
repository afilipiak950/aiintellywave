
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, ChevronLeft, ChevronRight, Filter, Download, PieChart } from 'lucide-react';

interface RevenueDashboardControlsProps {
  activeTab: 'table' | 'charts';
  setActiveTab: (tab: 'table' | 'charts') => void;
  currentMonth: number;
  currentYear: number;
  monthsToShow: number;
  navigateMonths: (direction: 'prev' | 'next') => void;
  changeMonthsToShow: (months: number) => void;
  exportCsv: () => void;
}

const RevenueDashboardControls = ({
  activeTab,
  setActiveTab,
  currentMonth,
  currentYear,
  monthsToShow,
  navigateMonths,
  changeMonthsToShow,
  exportCsv
}: RevenueDashboardControlsProps) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pb-2">
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setActiveTab('table')}
          className={activeTab === 'table' ? 'bg-primary text-primary-foreground' : ''}
        >
          <Calendar className="h-4 w-4 mr-1" /> Table View
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setActiveTab('charts')}
          className={activeTab === 'charts' ? 'bg-primary text-primary-foreground' : ''}
        >
          <PieChart className="h-4 w-4 mr-1" /> Charts
        </Button>
      </div>
      
      <div className="flex items-center space-x-2">
        <Button size="sm" variant="outline" onClick={() => navigateMonths('prev')}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <span className="text-sm font-medium px-2">
          {new Date(currentYear, currentMonth - 1).toLocaleDateString('de-DE', { 
            month: 'long', 
            year: 'numeric' 
          })}
        </span>
        
        <Button size="sm" variant="outline" onClick={() => navigateMonths('next')}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="flex items-center space-x-2">
        <Select
          value={monthsToShow.toString()}
          onValueChange={(value) => changeMonthsToShow(parseInt(value))}
        >
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Months" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="3">3 Months</SelectItem>
            <SelectItem value="6">6 Months</SelectItem>
            <SelectItem value="12">12 Months</SelectItem>
          </SelectContent>
        </Select>
        
        <Button size="sm" variant="outline" onClick={() => {}}>
          <Filter className="h-4 w-4 mr-1" /> Filter
        </Button>
        
        <Button size="sm" variant="default" onClick={exportCsv}>
          <Download className="h-4 w-4 mr-1" /> Export
        </Button>
      </div>
    </div>
  );
};

export default RevenueDashboardControls;
