
import { Button } from "@/components/ui/button";
import { AlertCircle, Users } from "lucide-react";
import { CustomerDebugInfo as DebugInfoType } from "@/hooks/customers/types";

interface CustomerDebugInfoProps {
  debugInfo: DebugInfoType | undefined;
  onRepairCompanyUsers: () => Promise<void>;
  isRepairingCompanyUsers: boolean;
}

const CustomerDebugInfo = ({ 
  debugInfo, 
  onRepairCompanyUsers,
  isRepairingCompanyUsers 
}: CustomerDebugInfoProps) => {
  if (!debugInfo) return null;
  
  return (
    <div className="mt-8 p-4 border rounded bg-slate-50">
      <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
        <AlertCircle className="h-4 w-4" />
        Debug Information
      </h2>
      <div className="text-sm mb-4">
        <p><strong>User ID:</strong> {debugInfo.userId || 'Not available'}</p>
        <p><strong>Email:</strong> {debugInfo.userEmail || 'Not available'}</p>
        <p><strong>Admin Status:</strong> {debugInfo.isAdmin ? 'Yes' : 'No'}</p>
        <p><strong>Special Admin:</strong> {debugInfo.isSpecialAdmin ? 'Yes' : 'No'}</p>
        <p><strong>Companies Count:</strong> {debugInfo.companiesCount || 0}</p>
        <p><strong>Company Users Count:</strong> {debugInfo.companyUsersCount || 0}</p>
        
        {/* Company Users diagnostics */}
        {debugInfo.companyUsersDiagnostics && (
          <div className="mt-2 p-2 bg-blue-50 border border-blue-100 rounded">
            <h3 className="font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              Company Users Diagnostics
            </h3>
            <p><strong>Status:</strong> {debugInfo.companyUsersDiagnostics.status}</p>
            {debugInfo.companyUsersDiagnostics.totalCount !== undefined && (
              <p><strong>Total Count:</strong> {debugInfo.companyUsersDiagnostics.totalCount}</p>
            )}
            {debugInfo.companyUsersDiagnostics.error && (
              <p className="text-red-600"><strong>Error:</strong> {debugInfo.companyUsersDiagnostics.error}</p>
            )}
            
            {debugInfo.companyUsersDiagnostics.data && debugInfo.companyUsersDiagnostics.data.length > 0 && (
              <div className="mt-2">
                <p><strong>Company Associations:</strong></p>
                <ul className="list-disc pl-5">
                  {debugInfo.companyUsersDiagnostics.data.map((assoc: any, index: number) => (
                    <li key={index} className="text-xs">
                      {assoc.companies?.name || 'Unknown'} ({assoc.company_id})
                      {assoc.role && ` - Role: ${assoc.role}`}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* Button to repair company users */}
            <div className="mt-2">
              <Button
                onClick={onRepairCompanyUsers}
                disabled={isRepairingCompanyUsers}
                variant="outline"
                size="sm"
              >
                {isRepairingCompanyUsers ? 'Repairing...' : 'Repair Company Users'}
              </Button>
            </div>
          </div>
        )}
        
        {/* Company Users repair result */}
        {debugInfo.companyUsersRepair && (
          <div className="mt-2 p-2 bg-green-50 border border-green-100 rounded">
            <h3 className="font-medium">Company Users Repair Result</h3>
            <p><strong>Status:</strong> {debugInfo.companyUsersRepair.status}</p>
            {debugInfo.companyUsersRepair.message && (
              <p><strong>Message:</strong> {debugInfo.companyUsersRepair.message}</p>
            )}
            {debugInfo.companyUsersRepair.error && (
              <p className="text-red-600"><strong>Error:</strong> {debugInfo.companyUsersRepair.error}</p>
            )}
            
            {debugInfo.companyUsersRepair.associatedCompanies && (
              <div className="mt-2">
                <p><strong>Associated Companies:</strong></p>
                <ul className="list-disc pl-5">
                  {debugInfo.companyUsersRepair.associatedCompanies.map((assoc: any, index: number) => (
                    <li key={index} className="text-xs">
                      {assoc.company_name || 'Unknown'} ({assoc.company_id})
                      {assoc.role && ` - Role: ${assoc.role}`}
                      {assoc.is_primary && ' (Primary)'}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
      <div className="text-xs overflow-auto max-h-96 border p-2 bg-slate-100 rounded">
        <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
      </div>
    </div>
  );
};

export default CustomerDebugInfo;
