
import React from 'react';
import CustomerTable from '@/components/ui/admin/customers/CustomerTable';

const CustomerTablePage: React.FC = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Kunden Tabelle</h1>
      <p className="text-gray-500">
        Hier können Sie Kunden und deren Konditionen verwalten. Die Preise pro Termin und Setup-Gebühren werden automatisch aus den Konditionen erkannt.
      </p>
      
      <CustomerTable />
    </div>
  );
};

export default CustomerTablePage;
