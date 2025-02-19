'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCustomers, getPlants } from '@/lib/firestore';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ArrowLeft, Plus, Trash2, Save, Send } from 'lucide-react';
import Link from 'next/link';
import { Plant, Customer } from '@/types';
import { addDays, format } from 'date-fns';

type InvoiceItem = {
  id: string;
  plantId: string;
  description: string;
  quantity: number;
  unitPrice: number;
};

export default function CreateInvoice() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [plants, setPlants] = useState<Plant[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  
  // Invoice data
  const [customerId, setCustomerId] = useState('');
  const [dueDate, setDueDate] = useState(format(addDays(new Date(), 30), 'yyyy-MM-dd'));
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<InvoiceItem[]>([]);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [customersData, plantsData] = await Promise.all([
          getCustomers(),
          getPlants()
        ]);
        
        setCustomers(customersData);
        setPlants(plantsData);
        
        // Default to first wholesale customer if available
        const wholesaleCustomer = customersData.find(c => c.customerType === 'wholesale');
        if (wholesaleCustomer) {
          setCustomerId(wholesaleCustomer.id);
        } else if (customersData.length > 0) {
          setCustomerId(customersData[0].id);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load customers or plants. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const addItem = () => {
    if (plants.length === 0) return;
    
    const firstPlant = plants[0];
    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      plantId: firstPlant.id,
      description: firstPlant.commonName,
      quantity: 1,
      unitPrice: firstPlant.price
    };
    
    setItems([...items, newItem]);
  };

  const updateItem = (id: string, field: keyof InvoiceItem, value: any) => {
    setItems(items.map(item => {
      if (item.id === id) {
        if (field === 'plantId' && value !== item.plantId) {
          // When plant changes, update description and price
          const selectedPlant = plants.find(p => p.id === value);
          if (selectedPlant) {
            return {
              ...item,
              [field]: value,
              description: selectedPlant.commonName,
              unitPrice: selectedPlant.price
            };
          }
        }
        
        return { ...item, [field]: value };
      }
      return item;
    }));
  };

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  };

  const handleSubmit = async (e: React.FormEvent, saveAsDraft = false) => {
    e.preventDefault();
    if (items.length === 0) {
      setError('Please add at least one item to the invoice');
      return;
    }
    
    setSubmitting(true);
    setError('');
    
    try {
      // Generate invoice number (format: INV-YYYYMMDD-XXX)
      const today = new Date();
      const dateStr = format(today, 'yyyyMMdd');
      const countQuery = await addDoc(collection(db, 'counters'), {
        timestamp: serverTimestamp()
      });
      const counterNumber = countQuery.id.substring(0, 3);
      const invoiceNumber = `INV-${dateStr}-${counterNumber}`;
      
      // Create invoice
      const invoiceData = {
        invoiceNumber,
        customerId,
        date: today,
        dueDate: new Date(dueDate),
        amount: calculateTotal(),
        status: saveAsDraft ? 'draft' : 'sent',
        notes,
        items: items.map(item => ({
          plantId: item.plantId,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          total: item.quantity * item.unitPrice
        })),
        createdAt: serverTimestamp()
      };
      
      const docRef = await addDoc(collection(db, 'invoices'), invoiceData);
      router.push(`/invoices/${docRef.id}`);
    } catch (error) {
      console.error('Error creating invoice:', error);
      setError('Failed to create invoice. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Link href="/invoices" className="p-2 rounded-full hover:bg-gray-200">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-bold">Create New Invoice</h1>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      
      <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-8">
        <div className="bg-white shadow rounded-lg p-6 space-y-6">
          <h2 className="text-lg font-semibold">Invoice Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="customerId" className="block text-sm font-medium text-gray-700">
                Customer
              </label>
              <select
                id="customerId"
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm"
                required
              >
                <option value="">Select Customer</option>
                {customers.map(customer => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name} ({customer.customerType})
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700">
                Due Date
              </label>
              <input
                type="date"
                id="dueDate"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm"
                required
              />
            </div>
            
            <div className="md:col-span-2">
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                Notes
              </label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm"
              />
            </div>
          </div>
        </div>
        
        <div className="bg-white shadow rounded-lg p-6 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Invoice Items</h2>
            <button
              type="button"
              onClick={addItem}
              className="flex items-center gap-2 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
            >
              <Plus className="h-4 w-4" />
              Add Item
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Plant
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Unit Price
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-4 text-center text-gray-500">
                      No items added yet. Click "Add Item" to add plants to this invoice.
                    </td>
                  </tr>
                ) : (
                  items.map((item) => (
                    <tr key={item.id}>
                      <td className="px-4 py-3">
                        <select
                          value={item.plantId}
                          onChange={(e) => updateItem(item.id, 'plantId', e.target.value)}
                          className="block w-full rounded-md border-gray-300 shadow-sm"
                        >
                          {plants.map(plant => (
                            <option key={plant.id} value={plant.id}>
                              {plant.commonName}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                          className="block w-full rounded-md border-gray-300 shadow-sm"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value) || 0)}
                          className="block w-40 rounded-md border-gray-300 shadow-sm"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.unitPrice}
                          onChange={(e) => updateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                          className="block w-40 rounded-md border-gray-300 shadow-sm"
                        />
                      </td>
                      <td className="px-4 py-3 font-medium">
                        ${(item.quantity * item.unitPrice).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={4} className="px-4 py-4 text-right font-semibold">
                    Total:
                  </td>
                  <td className="px-4 py-4 font-bold text-lg">
                    ${calculateTotal().toFixed(2)}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
        
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={(e) => handleSubmit(e, true)}
            disabled={submitting}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50"
          >
            Save as Draft
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
          >
            {submitting ? 'Creating...' : (
              <>
                <Send className="h-5 w-5" />
                Create & Send
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
