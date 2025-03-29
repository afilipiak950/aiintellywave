
import { useLeadTestCreation } from './use-lead-test-creation';
import { useDatabaseDebug } from './use-database-debug';

export const useLeadDebug = () => {
  const { createTestLead, loading: testLeadLoading } = useLeadTestCreation();
  const { debugInfo, debugDatabaseAccess, loading: debugLoading } = useDatabaseDebug();

  return {
    debugInfo,
    debugLoading: testLeadLoading || debugLoading,
    setDebugInfo: (info: any) => debugInfo, // Kept for backwards compatibility
    createTestLead,
    debugDatabaseAccess
  };
};

export * from './use-lead-test-creation';
export * from './use-database-debug';
