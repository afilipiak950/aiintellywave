
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import EditableCustomerTable from './EditableCustomerTable';

interface CustomerTableSectionProps {
  onCustomerChange?: () => void;
  onCustomerDataUpdate?: (customerData: any[]) => void;
}

const CustomerTableSection: React.FC<CustomerTableSectionProps> = ({ 
  onCustomerChange,
  onCustomerDataUpdate
}) => {
  return (
    <Card className="border rounded-lg">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Basis Kundendaten</CardTitle>
        <CardDescription>Bearbeiten Sie die Kundengrundlagen für die Umsatzberechnung</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <EditableCustomerTable 
          onDataChange={onCustomerChange} 
          onCustomerDataUpdate={onCustomerDataUpdate}
        />
      </CardContent>
    </Card>
  );
};

export default CustomerTableSection;
