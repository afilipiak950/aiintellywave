
import { Loader2 } from "lucide-react";

const LeadListLoading = () => {
  return (
    <div className="flex justify-center items-center py-16">
      <div className="flex flex-col items-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
        <p className="text-muted-foreground">Loading leads...</p>
      </div>
    </div>
  );
};

export default LeadListLoading;
