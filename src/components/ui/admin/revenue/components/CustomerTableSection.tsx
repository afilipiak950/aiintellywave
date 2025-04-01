
import React from 'react';
import CustomerTable from '@/components/ui/admin/customers/CustomerTable';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

const CustomerTableSection = () => {
  return (
    <div className="mt-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Kunden Tabelle</CardTitle>
          <CardDescription>
            Hier können Sie Kunden und deren Konditionen verwalten. Die Preise pro Termin und Setup-Gebühren werden automatisch aus den Konditionen erkannt.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <CustomerTable />
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerTableSection;
