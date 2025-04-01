
import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, Save, X, RefreshCw } from 'lucide-react';
import { CustomerTableRow } from '@/services/customer-table-service';
import { useCustomerTable } from '@/hooks/use-customer-table';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

const CustomerTable: React.FC = () => {
  const { 
    customers, 
    loading, 
    totalRevenue, 
    totalAppointments, 
    addCustomer, 
    updateCustomer, 
    deleteCustomer,
    refreshData
  } = useCustomerTable();

  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerConditions, setNewCustomerConditions] = useState('');
  const [newAppointments, setNewAppointments] = useState<number>(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [editModes, setEditModes] = useState<Record<string, boolean>>({});
  const [editData, setEditData] = useState<Record<string, CustomerTableRow>>({});

  const handleAddCustomer = async () => {
    if (!newCustomerName.trim()) return;
    
    await addCustomer({
      name: newCustomerName,
      conditions: newCustomerConditions,
      appointments_per_month: newAppointments
    });
    
    // Clear form
    setNewCustomerName('');
    setNewCustomerConditions('');
    setNewAppointments(0);
    setIsDialogOpen(false);
  };

  const toggleEditMode = (customer: CustomerTableRow) => {
    const customerId = customer.id as string;
    
    setEditModes(prev => ({
      ...prev,
      [customerId]: !prev[customerId]
    }));
    
    if (!editModes[customerId]) {
      // Enter edit mode - store current data
      setEditData(prev => ({
        ...prev,
        [customerId]: { ...customer }
      }));
    }
  };

  const handleSave = async (customerId: string) => {
    await updateCustomer(editData[customerId]);
    toggleEditMode({ id: customerId } as CustomerTableRow);
  };

  const handleCancel = (customerId: string) => {
    setEditData(prev => {
      const newData = { ...prev };
      delete newData[customerId];
      return newData;
    });
    
    setEditModes(prev => ({
      ...prev,
      [customerId]: false
    }));
  };

  const handleInputChange = (customerId: string, field: string, value: string | number) => {
    setEditData(prev => ({
      ...prev,
      [customerId]: {
        ...prev[customerId],
        [field]: value
      }
    }));
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
    }).format(value);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex justify-center items-center h-40">
            <p className="text-center text-gray-500">Lade Kundendaten...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Kunden & Konditionen</h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={refreshData}
            className="flex items-center"
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Aktualisieren
          </Button>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Neuer Kunde
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Neuen Kunden hinzufügen</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={newCustomerName}
                    onChange={(e) => setNewCustomerName(e.target.value)}
                    placeholder="z.B. Musterkunde GmbH"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="conditions">
                    Konditionen
                    <span className="text-xs text-gray-500 ml-2">
                      (z.B. "100€ pro Termin + 500€ Setup")
                    </span>
                  </Label>
                  <Textarea
                    id="conditions"
                    value={newCustomerConditions}
                    onChange={(e) => setNewCustomerConditions(e.target.value)}
                    placeholder="Beschreiben Sie hier die Konditionen..."
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="appointments">Termine pro Monat</Label>
                  <Input
                    id="appointments"
                    type="number"
                    min={0}
                    value={newAppointments}
                    onChange={(e) => setNewAppointments(parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <DialogClose asChild>
                  <Button variant="outline">Abbrechen</Button>
                </DialogClose>
                <Button onClick={handleAddCustomer}>Hinzufügen</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardContent className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kundenname</TableHead>
                  <TableHead>Konditionen</TableHead>
                  <TableHead className="text-right">Termine/Monat</TableHead>
                  <TableHead className="text-right">Preis pro Termin</TableHead>
                  <TableHead className="text-right">Setup-Gebühr</TableHead>
                  <TableHead className="text-right">Monatlicher Umsatz</TableHead>
                  <TableHead className="text-right">Aktionen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      Keine Kunden vorhanden. Fügen Sie neue Kunden hinzu.
                    </TableCell>
                  </TableRow>
                ) : (
                  customers.map((customer) => {
                    const isEditing = !!editModes[customer.id as string];
                    const editingData = editData[customer.id as string] || customer;

                    return (
                      <TableRow key={customer.id}>
                        <TableCell>
                          {isEditing ? (
                            <Input
                              value={editingData.name}
                              onChange={(e) => handleInputChange(customer.id as string, 'name', e.target.value)}
                            />
                          ) : (
                            customer.name
                          )}
                        </TableCell>
                        <TableCell className="max-w-md">
                          {isEditing ? (
                            <Textarea
                              value={editingData.conditions}
                              onChange={(e) => handleInputChange(customer.id as string, 'conditions', e.target.value)}
                              rows={2}
                            />
                          ) : (
                            customer.conditions
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {isEditing ? (
                            <Input
                              type="number"
                              min={0}
                              value={editingData.appointments_per_month}
                              onChange={(e) => handleInputChange(customer.id as string, 'appointments_per_month', parseInt(e.target.value) || 0)}
                              className="max-w-[100px] ml-auto"
                            />
                          ) : (
                            customer.appointments_per_month
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(customer.price_per_appointment)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(customer.setup_fee)}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(customer.monthly_revenue || 0)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            {isEditing ? (
                              <>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleSave(customer.id as string)}
                                >
                                  <Save className="h-4 w-4 text-green-600" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleCancel(customer.id as string)}
                                >
                                  <X className="h-4 w-4 text-red-600" />
                                </Button>
                              </>
                            ) : (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => toggleEditMode(customer)}
                                >
                                  Bearbeiten
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => deleteCustomer(customer.id as string)}
                                >
                                  <Trash2 className="h-4 w-4 text-red-600" />
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        <CardFooter className="bg-muted/50">
          <div className="w-full flex justify-between py-2">
            <div className="font-medium">Gesamt:</div>
            <div className="flex gap-8">
              <div>
                <span className="font-medium">{totalAppointments}</span> Termine/Monat
              </div>
              <div className="font-bold">
                {formatCurrency(totalRevenue)}
              </div>
            </div>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default CustomerTable;
