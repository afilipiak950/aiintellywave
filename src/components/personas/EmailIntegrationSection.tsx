
import { EmailAccountsCard } from './EmailAccountsCard';
import { EmailContactsCard } from './EmailContactsCard';
import { EmailMessagesCard } from './EmailMessagesCard';

export function EmailIntegrationSection() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight">Email & Platform Integrations</h2>
      <p className="text-muted-foreground">
        Connect your email accounts, import contacts, and analyze email content for your personas.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <EmailAccountsCard />
        <EmailContactsCard />
      </div>
      
      <div className="mt-8">
        <EmailMessagesCard />
      </div>
    </div>
  );
}
