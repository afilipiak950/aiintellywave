
import { useState, useEffect, useCallback } from 'react';
import { CustomerTableRow, fetchCustomers, addCustomer, updateCustomer, deleteCustomer } from '@/services/customer-table-service';

export function useCustomerTable() {
  const [customers, setCustomers] = useState<CustomerTableRow[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [totalRevenue, setTotalRevenue] = useState<number>(0);
  const [totalAppointments, setTotalAppointments] = useState<number>(0);

  const loadCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchCustomers();
      setCustomers(data);
      
      // Calculate totals
      const revenue = data.reduce((sum, customer) => sum + (customer.monthly_revenue || 0), 0);
      const appointments = data.reduce((sum, customer) => sum + (customer.appointments_per_month || 0), 0);
      
      setTotalRevenue(revenue);
      setTotalAppointments(appointments);
    } catch (error) {
      console.error('Error in useCustomerTable:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  const addNewCustomer = async (customerData: { name: string; conditions: string; appointments_per_month?: number }) => {
    const newCustomer = await addCustomer(customerData);
    if (newCustomer) {
      await loadCustomers(); // Reload to get all calculated fields
    }
    return !!newCustomer;
  };

  const updateCustomerData = async (customer: CustomerTableRow) => {
    const success = await updateCustomer(customer);
    if (success) {
      await loadCustomers(); // Reload to get all calculated fields
    }
    return success;
  };

  const removeCustomer = async (customerId: string) => {
    const success = await deleteCustomer(customerId);
    if (success) {
      await loadCustomers();
    }
    return success;
  };

  return {
    customers,
    loading,
    totalRevenue,
    totalAppointments,
    addCustomer: addNewCustomer,
    updateCustomer: updateCustomerData,
    deleteCustomer: removeCustomer,
    refreshData: loadCustomers
  };
}
