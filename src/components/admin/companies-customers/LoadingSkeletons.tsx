
import { Skeleton } from "@/components/ui/skeleton";

export const CompaniesLoadingSkeleton = () => (
  <div className="space-y-4">
    {[1, 2, 3].map(i => (
      <div key={i} className="border rounded-md overflow-hidden">
        <div className="p-4 space-y-3">
          <Skeleton className="h-6 w-48" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <div className="flex gap-2 mt-3">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-20" />
            </div>
          </div>
        </div>
      </div>
    ))}
  </div>
);

export const CustomersLoadingSkeleton = () => (
  <div className="border rounded-md overflow-hidden">
    <div className="bg-slate-50 p-3 border-b">
      <Skeleton className="h-6 w-48" />
    </div>
    <div className="p-4">
      <div className="space-y-3">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="flex items-center gap-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-4 w-32 ml-auto" />
            <Skeleton className="h-4 w-24" />
          </div>
        ))}
      </div>
    </div>
  </div>
);
