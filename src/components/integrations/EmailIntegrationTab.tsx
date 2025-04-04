
import React from 'react';
import { Card } from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import { RefreshCw } from 'lucide-react';
import { useEmailIntegration } from './email/useEmailIntegration';
import { EmailHeaderSection } from './email/EmailHeaderSection';
import { EmailFormFields } from './email/EmailFormFields';
import { EmailFormActions } from './email/EmailFormActions';
import { LoadingState } from './email/LoadingState';

const EmailIntegrationTab = () => {
  const {
    form,
    isSubmitting,
    isTesting,
    isEncrypting,
    isLoading,
    existingIntegration,
    onSubmit,
    handleTest
  } = useEmailIntegration();

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <Card className="p-6">
      <EmailHeaderSection />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <EmailFormFields 
            form={form}
            isEncrypting={isEncrypting} 
          />
          
          <EmailFormActions 
            onTestClick={handleTest}
            isTesting={isTesting}
            isSubmitting={isSubmitting}
            existingIntegration={!!existingIntegration}
          />
        </form>
      </Form>
    </Card>
  );
};

export default EmailIntegrationTab;
