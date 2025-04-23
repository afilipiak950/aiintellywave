
import { AlertSection } from './AlertSection';

interface DatabaseStatsProps {
  connected?: boolean;
  responseTime?: number;
  error?: string;
}

export const DatabaseStats = ({ connected, responseTime, error }: DatabaseStatsProps) => {
  return (
    <AlertSection
      title="Database Connection"
      isSuccess={connected}
      hasError={!connected}
    >
      {connected ? (
        <div>
          <p>Database is connected</p>
          {responseTime && (
            <p>Response time: {responseTime}ms</p>
          )}
        </div>
      ) : (
        <p className="text-red-700">
          Database connection issue: {error || 'Unknown error'}
        </p>
      )}
    </AlertSection>
  );
};
