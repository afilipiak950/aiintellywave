
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw, Info, Shield, Database } from "lucide-react";

interface CustomerDebugInfoProps {
  debugInfo: {
    totalUsersCount: number;
    filteredUsersCount: number;
    source: string;
    companyUsersCount: number;
    companyUsersDiagnostics: {
      status: string;
      totalCount: number;
      data?: any[];
    };
    companyUsersRepair: {
      status: string;
      message: string;
    };
  };
  onRepairCompanyUsers?: () => void;
  isRepairingCompanyUsers?: boolean;
}

const CustomerDebugInfo = ({ 
  debugInfo, 
  onRepairCompanyUsers,
  isRepairingCompanyUsers = false
}: CustomerDebugInfoProps) => {
  const showRepairButton = 
    debugInfo.companyUsersRepair?.status === 'warning' ||
    debugInfo.companyUsersRepair?.status === 'error';
  
  return (
    <div className="my-6 p-4 rounded-lg border border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/30 text-xs">
      <div className="flex items-center gap-2 mb-2 text-blue-800 dark:text-blue-300">
        <Info className="h-4 w-4" />
        <h4 className="font-semibold">Diagnostic Information</h4>
      </div>
      <div className="grid gap-1 text-blue-700 dark:text-blue-400">
        <p>Data Source: <span className="font-mono">{debugInfo.source}</span></p>
        <p>Total Users: {debugInfo.totalUsersCount}</p>
        <p>Filtered Users: {debugInfo.filteredUsersCount}</p>
        
        <div className="mt-1 pt-1 border-t border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-500">
          <p>System Information: {debugInfo.companyUsersRepair.message}</p>
          
          {debugInfo.totalUsersCount === 0 && (
            <div className="mt-2 p-2 bg-blue-100 dark:bg-blue-900/50 rounded border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-2 mb-1">
                <Database className="h-4 w-4" />
                <span className="font-semibold">Troubleshooting Tips</span>
              </div>
              <ul className="list-disc pl-5 text-xs space-y-1">
                <li>Überprüfe die RLS-Policies für auth.users und profiles</li>
                <li>Stelle sicher, dass Admin-Benutzer Zugriff auf alle Datensätze haben</li>
                <li>Prüfe die company_users-Tabelle auf korrekte Zuordnungen</li>
                <li>Versuche einen direkten Zugriff über das Supabase Dashboard</li>
              </ul>
            </div>
          )}
          
          {showRepairButton && onRepairCompanyUsers && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRepairCompanyUsers}
              disabled={isRepairingCompanyUsers}
              className="mt-2 h-7 text-xs bg-white hover:bg-blue-50 dark:bg-blue-900 dark:hover:bg-blue-800"
            >
              {isRepairingCompanyUsers ? (
                <>
                  <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                  Repairing...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-3 w-3" />
                  Repair User-Company Associations
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerDebugInfo;
