
import { EmailAccountsCard } from './EmailAccountsCard';
import { EmailContactsCard } from './EmailContactsCard';

export function EmailIntegrationSection() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight">Email & Platform Integrations</h2>
      <p className="text-muted-foreground">
        Connect your email accounts to use your personas for outreach, or import your contacts.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <EmailAccountsCard />
        <EmailContactsCard />
      </div>
    </div>
  );
}
