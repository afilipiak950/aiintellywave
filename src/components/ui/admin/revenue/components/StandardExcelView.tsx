
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import ExcelLikeTable from './ExcelLikeTable';

interface StandardExcelViewProps {
  error?: string | null;
}

const StandardExcelView: React.FC<StandardExcelViewProps> = ({ error }) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  return (
    <Card className="border rounded-lg">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Umsatz-Tabelle</CardTitle>
        <CardDescription>
          Bearbeiten Sie die Umsatzdaten für jeden Kunden und Monat wie in einer Excel-Tabelle
        </CardDescription>
      </CardHeader>
      <CardContent className="p-2">
        <ExcelLikeTable 
          initialColumns={months}
          initialRows={5}
        />
      </CardContent>
    </Card>
  );
};

export default StandardExcelView;
