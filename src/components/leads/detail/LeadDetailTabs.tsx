
import { Lead } from '@/types/lead';
import { TabsList, TabsTrigger } from "@/components/ui/tabs";

interface LeadDetailTabsProps {
  activeTab: string;
  setActiveTab: (value: string) => void;
}

const LeadDetailTabs = ({ activeTab, setActiveTab }: LeadDetailTabsProps) => {
  return (
    <div className="border-b">
      <TabsList className="w-full rounded-none border-b-0 bg-transparent p-0 h-12">
        <TabsTrigger 
          value="overview" 
          className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none flex-1 h-full"
        >
          Overview
        </TabsTrigger>
        <TabsTrigger 
          value="details" 
          className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none flex-1 h-full"
        >
          All Details
        </TabsTrigger>
        <TabsTrigger 
          value="notes" 
          className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none flex-1 h-full"
        >
          Notes
        </TabsTrigger>
      </TabsList>
    </div>
  );
};

export default LeadDetailTabs;
