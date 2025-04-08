
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
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
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-lg">Basis Kundendaten</CardTitle>
          <CardDescription>Bearbeiten Sie die Kundengrundlagen für die Umsatzberechnung</CardDescription>
        </div>
        <Button variant="outline" size="sm" className="gap-1">
          <PlusCircle className="h-4 w-4" />
          <span>Neuer Kunde</span>
        </Button>
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
