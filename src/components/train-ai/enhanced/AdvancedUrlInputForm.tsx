
import React from 'react';
import { UrlInputForm } from '../UrlInputForm';

interface AdvancedUrlInputFormProps {
  onSubmit: (url: string) => void;
  isLoading: boolean;
  initialUrl?: string;
  onUrlChange?: (url: string) => void;
  onCancel?: () => void;
}

export const AdvancedUrlInputForm: React.FC<AdvancedUrlInputFormProps> = ({
  onSubmit,
  isLoading,
  initialUrl,
  onUrlChange,
  onCancel
}) => {
  return (
    <UrlInputForm
      onSubmit={onSubmit}
      isLoading={isLoading}
      initialUrl={initialUrl}
      onUrlChange={onUrlChange}
      onCancel={onCancel}
    />
  );
};
