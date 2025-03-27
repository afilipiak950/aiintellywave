
import { useState, useTransition } from 'react';
import { ProviderFormValues } from '@/components/personas/email/EmailProviderDialog';
import { usePersonas } from '@/hooks/use-personas';

export function useProviderDialog() {
  const [isProviderDialogOpen, setIsProviderDialogOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { createEmailIntegration } = usePersonas();

  const onProviderSubmit = (values: ProviderFormValues) => {
    startTransition(() => {
      createEmailIntegration({
        provider: values.provider,
        email: values.email,
      });
      setIsProviderDialogOpen(false);
    });
  };

  return {
    isProviderDialogOpen,
    setIsProviderDialogOpen,
    isPending,
    onProviderSubmit,
  };
}
