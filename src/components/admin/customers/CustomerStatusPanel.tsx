
import { Button } from "@/components/ui/button";
import { UserCircle, AlertTriangle, RefreshCw, Loader2, Shield } from "lucide-react";

interface CustomerStatusPanelProps {
  loading: boolean;
  errorMsg: string | null;
  customerCount: number;
  companyUsersCount?: number;
  onRepairAdmin?: () => void;
  isRepairing?: boolean;
}

const CustomerStatusPanel = ({
  loading,
  errorMsg,
  customerCount,
  companyUsersCount,
  onRepairAdmin,
  isRepairing = false
}: CustomerStatusPanelProps) => {
  if (loading) {
    return (
      <div className="rounded-lg border p-4 flex items-center space-x-2 bg-muted/50">
        <Loader2 className="h-5 w-5 text-muted-foreground animate-spin" />
        <span className="text-muted-foreground">Lade Benutzerdaten...</span>
      </div>
    );
  }

  // Special handling for "User not allowed" error
  if (errorMsg && errorMsg.includes("not allowed")) {
    return (
      <div className="rounded-lg border border-amber-300 p-4 bg-amber-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-amber-500" />
            <span className="font-medium text-amber-800">
              Berechtigungsfehler: {errorMsg}
            </span>
          </div>
          {onRepairAdmin && (
            <Button 
              variant="secondary"
              size="sm"
              onClick={onRepairAdmin}
              disabled={isRepairing}
            >
              {isRepairing ? 
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Repariere...
                </> : 
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Probleme beheben
                </>
              }
            </Button>
          )}
        </div>
        <div className="mt-2 text-sm text-amber-700">
          <p>Mögliche Ursachen:</p>
          <ul className="list-disc pl-5 mt-1">
            <li>Fehlende Admin-Berechtigung</li>
            <li>RLS-Policy verhindert Zugriff auf auth.users/profiles</li>
            <li>Keine Zuordnung zu einer Firma (für Nicht-Admins)</li>
          </ul>
        </div>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="rounded-lg border border-destructive p-4 flex items-center justify-between bg-destructive/10">
        <div className="flex items-center space-x-2">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          <span className="text-destructive font-medium">Fehler: {errorMsg}</span>
        </div>
        {onRepairAdmin && (
          <Button 
            variant="secondary"
            size="sm"
            onClick={onRepairAdmin}
            disabled={isRepairing}
          >
            {isRepairing ? 
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Repariere...
              </> : 
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Probleme beheben
              </>
            }
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-lg border p-4 bg-card">
      <div className="flex flex-wrap gap-4">
        <div className="flex items-center space-x-2">
          <UserCircle className="h-5 w-5 text-primary" />
          <span className="font-medium">Customer Records: {customerCount}</span>
        </div>
        {customerCount === 0 && (
          <div className="text-sm text-muted-foreground mt-2 w-full">
            <p>Keine Benutzer gefunden. Mögliche Ursachen:</p>
            <ul className="list-disc pl-5 mt-1">
              <li>Keine Benutzer in der Datenbank</li>
              <li>RLS-Policy verhindert Zugriff</li>
              <li>Fehlende Admin-Berechtigung</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerStatusPanel;
