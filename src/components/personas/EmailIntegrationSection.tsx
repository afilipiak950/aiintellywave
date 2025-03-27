
import { EmailAccountsCard } from './EmailAccountsCard';
import { EmailMessagesCard } from './EmailMessagesCard';

export function EmailIntegrationSection() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">Email & Platform Integrations</h2>
        <p className="text-muted-foreground">
          Connect your email accounts and analyze email content for your personas.
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="transition-all duration-300 hover:translate-y-[-4px] hover:shadow-lg">
          <EmailAccountsCard />
        </div>
        
        <div className="transition-all duration-300 hover:translate-y-[-4px] hover:shadow-lg">
          <EmailMessagesCard />
        </div>
      </div>
    </div>
  );
}
