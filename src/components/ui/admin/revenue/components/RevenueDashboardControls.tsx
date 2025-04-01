
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
    <div className="flex flex-col sm:flex-row justify-between items-center gap-2"> {/* Reduziert gap-4 auf gap-2 */}
      <div className="flex items-center space-x-1"> {/* Reduziert space-x-2 auf space-x-1 */}
        <Button
          variant="outline"
          size="xs" // Kleinere Button-Größe verwenden
          onClick={() => setActiveTab('table')}
          className={activeTab === 'table' ? 'bg-primary text-primary-foreground' : ''}
        >
          <Calendar className="h-3 w-3 mr-1" /> {/* Kleinere Icons */}
          Table
        </Button>
        <Button
          variant="outline"
          size="xs" // Kleinere Button-Größe verwenden
          onClick={() => setActiveTab('charts')}
          className={activeTab === 'charts' ? 'bg-primary text-primary-foreground' : ''}
        >
          <PieChart className="h-3 w-3 mr-1" /> {/* Kleinere Icons */}
          Charts
        </Button>
      </div>
      
      <div className="flex items-center space-x-1"> {/* Reduziert space-x-2 auf space-x-1 */}
        <Button size="xs" variant="outline" onClick={() => navigateMonths('prev')}>
          <ChevronLeft className="h-3 w-3" /> {/* Kleinere Icons */}
        </Button>
        
        <span className="text-xs font-medium px-1"> {/* Reduziert text-sm auf text-xs und px-2 auf px-1 */}
          {new Date(currentYear, currentMonth - 1).toLocaleDateString('de-DE', { 
            month: 'long', 
            year: 'numeric' 
          })}
        </span>
        
        <Button size="xs" variant="outline" onClick={() => navigateMonths('next')}>
          <ChevronRight className="h-3 w-3" /> {/* Kleinere Icons */}
        </Button>
      </div>
      
      <div className="flex items-center space-x-1"> {/* Reduziert space-x-2 auf space-x-1 */}
        <Select
          value={monthsToShow.toString()}
          onValueChange={(value) => changeMonthsToShow(parseInt(value))}
        >
          <SelectTrigger className="w-24 h-7 text-xs"> {/* Reduziert w-32 auf w-24 und text-sm auf text-xs */}
            <SelectValue placeholder="Months" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="3">3 Months</SelectItem>
            <SelectItem value="6">6 Months</SelectItem>
            <SelectItem value="12">12 Months</SelectItem>
          </SelectContent>
        </Select>
        
        <Button size="xs" variant="outline" onClick={() => {}}> {/* Kleinere Button-Größe verwenden */}
          <Filter className="h-3 w-3 mr-1" /> {/* Kleinere Icons */}
          Filter
        </Button>
        
        <Button size="xs" variant="default" onClick={exportCsv}> {/* Kleinere Button-Größe verwenden */}
          <Download className="h-3 w-3 mr-1" /> {/* Kleinere Icons */}
          Export
        </Button>
      </div>
    </div>
  );
};

export default RevenueDashboardControls;
