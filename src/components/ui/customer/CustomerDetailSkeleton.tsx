
import { Skeleton } from "@/components/ui/skeleton";

const CustomerDetailSkeleton = () => {
  return (
    <div className="animate-pulse space-y-4">
      <div className="flex items-start gap-4">
        <Skeleton className="h-24 w-24 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <div className="flex gap-2">
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
        <div>
          <Skeleton className="h-8 w-40 mb-4" />
          <div className="space-y-4">
            <div className="flex">
              <Skeleton className="h-5 w-5 mr-3" />
              <div className="w-full">
                <Skeleton className="h-4 w-20 mb-1" />
                <Skeleton className="h-4 w-40" />
              </div>
            </div>
            <div className="flex">
              <Skeleton className="h-5 w-5 mr-3" />
              <div className="w-full">
                <Skeleton className="h-4 w-20 mb-1" />
                <Skeleton className="h-4 w-36" />
              </div>
            </div>
            <div className="flex">
              <Skeleton className="h-5 w-5 mr-3" />
              <div className="w-full">
                <Skeleton className="h-4 w-20 mb-1" />
                <Skeleton className="h-4 w-48" />
              </div>
            </div>
          </div>
        </div>
        
        <div>
          <Skeleton className="h-8 w-48 mb-4" />
          <div className="space-y-4">
            <div className="flex">
              <Skeleton className="h-5 w-5 mr-3" />
              <div className="w-full">
                <Skeleton className="h-4 w-20 mb-1" />
                <Skeleton className="h-4 w-44" />
              </div>
            </div>
            <div className="flex">
              <Skeleton className="h-5 w-5 mr-3" />
              <div className="w-full">
                <Skeleton className="h-4 w-20 mb-1" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDetailSkeleton;
