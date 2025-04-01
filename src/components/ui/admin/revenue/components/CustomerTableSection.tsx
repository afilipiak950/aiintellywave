import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PlusCircle, Calendar, Trash2, Check, X, AlertCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { DatePicker } from '@/components/ui/date-picker';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Customer {
  id: string;
  name: string;
  monthly_flat_fee: number | null;
  appointments_per_month: number | null;
  price_per_appointment: number | null;
  setup_fee: number | null;
  start_date: string | null;
  end_date: string | null;
  conditions: string | null;
  created_at: string;
}

interface CustomerTableSectionProps {
  onCustomerChange?: () => void;
  onCustomerDataUpdate?: (customers: Customer[]) => void;
}

const CustomerTableSection = ({ onCustomerChange, onCustomerDataUpdate }: CustomerTableSectionProps) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    monthly_flat_fee: 0,
    appointments_per_month: 0,
    price_per_appointment: 0,
    setup_fee: 0,
    conditions: '',
    start_date: format(new Date(), 'yyyy-MM-dd') as string,
  });
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [startDate, setStartDate] = useState<Date | undefined>(new Date());
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);

  useEffect(() => {
    fetchCustomers();
    
    const customerChanges = supabase
      .channel('customer-table-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'customers' },
        (payload) => {
          console.log('Customer table changed:', payload);
          fetchCustomers();
          if (onCustomerChange) {
            onCustomerChange();
          }
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(customerChanges);
    };
  }, [onCustomerChange]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching customers from Supabase...');
      
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('name', { ascending: true });

      if (error) {
        console.error('Error fetching customers:', error);
        throw error;
      }
      
      console.log(`Successfully fetched ${data?.length || 0} customers`);
      
      const processedCustomers = (data || []).map(customer => ({
        ...customer,
        monthly_flat_fee: Number(customer.monthly_flat_fee || 0),
        appointments_per_month: Number(customer.appointments_per_month || 0),
        price_per_appointment: Number(customer.price_per_appointment || 0),
        setup_fee: Number(customer.setup_fee || 0)
      }));
      
      setCustomers(processedCustomers);
      
      if (onCustomerDataUpdate) {
        onCustomerDataUpdate(processedCustomers);
      }
    } catch (error: any) {
      console.error('Error fetching customers:', error);
      setError(error.message || 'Fehler beim Laden der Kunden');
      toast({
        title: 'Fehler',
        description: 'Fehler beim Laden der Kunden',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddCustomer = async () => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .insert([
          {
            name: newCustomer.name,
            monthly_flat_fee: newCustomer.monthly_flat_fee,
            appointments_per_month: newCustomer.appointments_per_month,
            price_per_appointment: newCustomer.price_per_appointment,
            setup_fee: newCustomer.setup_fee,
            conditions: newCustomer.conditions,
            start_date: startDate ? format(startDate, 'yyyy-MM-dd') : null,
            end_date: endDate ? format(endDate, 'yyyy-MM-dd') : null,
          },
        ])
        .select();

      if (error) throw error;

      setNewCustomer({
        name: '',
        monthly_flat_fee: 0,
        appointments_per_month: 0,
        price_per_appointment: 0,
        setup_fee: 0,
        conditions: '',
        start_date: format(new Date(), 'yyyy-MM-dd'),
      });
      setStartDate(new Date());
      setEndDate(undefined);
      setShowAddForm(false);
      
      toast({
        title: 'Erfolg',
        description: 'Kunde wurde erfolgreich hinzugefügt',
      });
      
      await fetchCustomers();
      
      if (onCustomerChange) {
        setTimeout(() => {
          onCustomerChange();
        }, 500);
      }
      
    } catch (error) {
      console.error('Error adding customer:', error);
      toast({
        title: 'Fehler',
        description: 'Fehler beim Hinzufügen des Kunden',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateCustomer = async () => {
    if (!editingCustomer) return;
    
    try {
      const { error } = await supabase
        .from('customers')
        .update({
          name: editingCustomer.name,
          monthly_flat_fee: editingCustomer.monthly_flat_fee,
          appointments_per_month: editingCustomer.appointments_per_month,
          price_per_appointment: editingCustomer.price_per_appointment,
          setup_fee: editingCustomer.setup_fee,
          conditions: editingCustomer.conditions,
          start_date: startDate ? format(startDate, 'yyyy-MM-dd') : null,
          end_date: endDate ? format(endDate, 'yyyy-MM-dd') : null,
        })
        .eq('id', editingCustomer.id);

      if (error) throw error;

      setEditingCustomer(null);
      
      toast({
        title: 'Erfolg',
        description: 'Kunde wurde erfolgreich aktualisiert',
      });
      
      await fetchCustomers();
      
      if (onCustomerChange) {
        setTimeout(() => {
          onCustomerChange();
        }, 500);
      }
      
    } catch (error) {
      console.error('Error updating customer:', error);
      toast({
        title: 'Fehler',
        description: 'Fehler beim Aktualisieren des Kunden',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteCustomer = async (id: string) => {
    if (!confirm('Möchten Sie diesen Kunden wirklich löschen?')) return;
    
    try {
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: 'Erfolg',
        description: 'Kunde wurde erfolgreich gelöscht',
      });
      
      await fetchCustomers();
      
      if (onCustomerChange) {
        setTimeout(() => {
          onCustomerChange();
        }, 500);
      }
      
    } catch (error) {
      console.error('Error deleting customer:', error);
      toast({
        title: 'Fehler',
        description: 'Fehler beim Löschen des Kunden',
        variant: 'destructive',
      });
    }
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <div className="flex justify-between">
          <CardTitle>Kundentabelle & Konditionen</CardTitle>
          <div className="flex gap-2">
            {error && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={fetchCustomers}
              >
                <AlertCircle className="h-4 w-4 mr-2 text-red-500" />
                Neu laden
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAddForm(!showAddForm)}
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              {showAddForm ? 'Abbrechen' : 'Neuer Kunde'}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error}
              <Button variant="link" className="p-0 h-auto ml-2" onClick={fetchCustomers}>
                Erneut versuchen
              </Button>
            </AlertDescription>
          </Alert>
        )}
        
        {showAddForm && (
          <div className="bg-gray-50 p-4 rounded-md mb-6 border">
            <h3 className="text-sm font-medium mb-4">Neuen Kunden hinzufügen</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="text-xs text-gray-500">Name</label>
                <Input
                  value={newCustomer.name}
                  onChange={(e) =>
                    setNewCustomer({ ...newCustomer, name: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-xs text-gray-500">Monatliche Gebühr</label>
                <Input
                  type="number"
                  value={newCustomer.monthly_flat_fee || 0}
                  onChange={(e) =>
                    setNewCustomer({
                      ...newCustomer,
                      monthly_flat_fee: parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </div>
              <div>
                <label className="text-xs text-gray-500">Termine pro Monat</label>
                <Input
                  type="number"
                  value={newCustomer.appointments_per_month || 0}
                  onChange={(e) =>
                    setNewCustomer({
                      ...newCustomer,
                      appointments_per_month: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>
              <div>
                <label className="text-xs text-gray-500">Preis pro Termin</label>
                <Input
                  type="number"
                  value={newCustomer.price_per_appointment || 0}
                  onChange={(e) =>
                    setNewCustomer({
                      ...newCustomer,
                      price_per_appointment: parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </div>
              <div>
                <label className="text-xs text-gray-500">Setup-Gebühr</label>
                <Input
                  type="number"
                  value={newCustomer.setup_fee || 0}
                  onChange={(e) =>
                    setNewCustomer({
                      ...newCustomer,
                      setup_fee: parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </div>
              <div>
                <label className="text-xs text-gray-500">Konditionen</label>
                <Input
                  value={newCustomer.conditions || ''}
                  onChange={(e) =>
                    setNewCustomer({
                      ...newCustomer,
                      conditions: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <label className="text-xs text-gray-500">Startdatum</label>
                <DatePicker
                  date={startDate}
                  setDate={(date) => setStartDate(date)}
                />
              </div>
              <div>
                <label className="text-xs text-gray-500">Enddatum</label>
                <DatePicker
                  date={endDate}
                  setDate={(date) => setEndDate(date)}
                />
              </div>
            </div>
            <Button onClick={handleAddCustomer} className="mt-4">
              Kunde hinzufügen
            </Button>
          </div>
        )}

        <div className="overflow-x-auto">
          <Table className="border-collapse">
            <TableHeader className="bg-gray-50">
              <TableRow>
                <TableHead className="w-[200px]">Name</TableHead>
                <TableHead className="text-right">Monatliche Gebühr</TableHead>
                <TableHead className="text-right">Termine pro Monat</TableHead>
                <TableHead className="text-right">Preis pro Termin</TableHead>
                <TableHead className="text-right">Setup-Gebühr</TableHead>
                <TableHead>Konditionen</TableHead>
                <TableHead>Zeitraum</TableHead>
                <TableHead className="text-center">Aktionen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-4">
                    Lade Kundendaten...
                  </TableCell>
                </TableRow>
              ) : customers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-4">
                    {error ? 'Fehler beim Laden der Kunden' : 'Keine Kunden gefunden'}
                  </TableCell>
                </TableRow>
              ) : (
                customers.map((customer) => (
                  <TableRow key={customer.id}>
                    {editingCustomer?.id === customer.id ? (
                      <>
                        <TableCell>
                          <Input
                            value={editingCustomer.name}
                            onChange={(e) =>
                              setEditingCustomer({
                                ...editingCustomer,
                                name: e.target.value,
                              })
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={editingCustomer.monthly_flat_fee || 0}
                            onChange={(e) =>
                              setEditingCustomer({
                                ...editingCustomer,
                                monthly_flat_fee: parseFloat(e.target.value) || 0,
                              })
                            }
                            className="text-right"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={editingCustomer.appointments_per_month || 0}
                            onChange={(e) =>
                              setEditingCustomer({
                                ...editingCustomer,
                                appointments_per_month: parseInt(e.target.value) || 0,
                              })
                            }
                            className="text-right"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={editingCustomer.price_per_appointment || 0}
                            onChange={(e) =>
                              setEditingCustomer({
                                ...editingCustomer,
                                price_per_appointment: parseFloat(e.target.value) || 0,
                              })
                            }
                            className="text-right"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={editingCustomer.setup_fee || 0}
                            onChange={(e) =>
                              setEditingCustomer({
                                ...editingCustomer,
                                setup_fee: parseFloat(e.target.value) || 0,
                              })
                            }
                            className="text-right"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            value={editingCustomer.conditions || ''}
                            onChange={(e) =>
                              setEditingCustomer({
                                ...editingCustomer,
                                conditions: e.target.value,
                              })
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-2">
                            <DatePicker
                              date={startDate}
                              setDate={(date) => setStartDate(date)}
                              className="w-full"
                            />
                            <DatePicker
                              date={endDate}
                              setDate={(date) => setEndDate(date)}
                              className="w-full"
                            />
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex justify-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={handleUpdateCustomer}
                            >
                              <Check className="h-4 w-4 text-green-500" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setEditingCustomer(null)}
                            >
                              <X className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </TableCell>
                      </>
                    ) : (
                      <>
                        <TableCell className="font-medium">
                          {customer.name}
                        </TableCell>
                        <TableCell className="text-right">
                          {customer.monthly_flat_fee
                            ? new Intl.NumberFormat('de-DE', {
                                style: 'currency',
                                currency: 'EUR',
                              }).format(customer.monthly_flat_fee)
                            : '€0,00'}
                        </TableCell>
                        <TableCell className="text-right">
                          {customer.appointments_per_month || 0}
                        </TableCell>
                        <TableCell className="text-right">
                          {customer.price_per_appointment
                            ? new Intl.NumberFormat('de-DE', {
                                style: 'currency',
                                currency: 'EUR',
                              }).format(customer.price_per_appointment)
                            : '€0,00'}
                        </TableCell>
                        <TableCell className="text-right">
                          {customer.setup_fee
                            ? new Intl.NumberFormat('de-DE', {
                                style: 'currency',
                                currency: 'EUR',
                              }).format(customer.setup_fee)
                            : '€0,00'}
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate">
                          {customer.conditions || '-'}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          <div className="text-sm flex flex-col gap-1">
                            <div className="flex items-center">
                              <Calendar className="w-3 h-3 mr-1 text-green-600" />
                              {customer.start_date
                                ? new Date(customer.start_date).toLocaleDateString(
                                    'de-DE'
                                  )
                                : '-'}
                            </div>
                            {customer.end_date && (
                              <div className="flex items-center">
                                <Calendar className="w-3 h-3 mr-1 text-red-600" />
                                {new Date(customer.end_date).toLocaleDateString(
                                  'de-DE'
                                )}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex justify-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setEditingCustomer(customer);
                                setStartDate(
                                  customer.start_date
                                    ? new Date(customer.start_date)
                                    : undefined
                                );
                                setEndDate(
                                  customer.end_date
                                    ? new Date(customer.end_date)
                                    : undefined
                                );
                              }}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                              </svg>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteCustomer(customer.id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </TableCell>
                      </>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default CustomerTableSection;
