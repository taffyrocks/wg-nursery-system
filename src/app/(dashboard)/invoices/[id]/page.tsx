'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { doc, getDoc, updateDoc, arrayUnion, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Link from 'next/link';
import { ArrowLeft, Download, Send, FileText, DollarSign, Clock, Calendar } from 'lucide-react';
import { format } from 'date-fns';

interface InvoiceItem {
  plantId: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export default function InvoiceDetailPage({ params }: { params: { id: string } }) {
  const [invoice, setInvoice] = useState<any>(null);
  const [customer, setCustomer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const invoiceRef = doc(db, 'invoices', params.id);
        const invoiceSnap = await getDoc(invoiceRef);
        
        if (invoiceSnap.exists()) {
          const invoiceData = invoiceSnap.data();
          
          // Fetch customer
          if (invoiceData.customerId) {
            const customerRef = doc(db, 'customers', invoiceData.customerId);
            const customerSnap = await getDoc(customerRef);
            
            if (customerSnap.exists()) {
              setCustomer(customerSnap.data());
            }
          }
          
          setInvoice({
            id: invoiceSnap.id,
            ...invoiceData,
            date: invoiceData.date?.toDate() || new Date(),
            dueDate: invoiceData.dueDate?.toDate() || new Date(),
            createdAt: invoiceData.createdAt?.toDate() || new Date()
          });
        } else {
          setError('Invoice not found');
        }
      } catch (error) {
        console.error('Error fetching invoice:', error);
        setError('Failed to load invoice');
      } finally {
        setLoading(false);
      }
    };

    fetchInvoice();
  }, [params.id]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'sent':
        return 'bg-blue-100 text-blue-800';
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const markAsPaid = async () => {
    if (!invoice || updating) return;
    
    setUpdating(true);
    try {
      const invoiceRef = doc(db, 'invoices', invoice.id);
      await updateDoc(invoiceRef, {
        status: 'paid',
        paymentDate: Timestamp.now(),
        paymentHistory: arrayUnion({
          amount: invoice.amount,
          date: Timestamp.now(),
          method: 'manual'
        })
      });
      
      // Update local state
      setInvoice({
        ...invoice,
        status: 'paid',
        paymentDate: new Date(),
        paymentHistory: [
          ...(invoice.paymentHistory || []),
          {
            amount: invoice.amount,
            date: new Date(),
            method: 'manual'
          }
        ]
      });
    } catch (error) {
      console.error('Error updating invoice:', error);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {error || 'Invoice not found'}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/invoices" className="p-2 rounded-full hover:bg-gray-200">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl font-bold">Invoice {invoice.invoiceNumber}</h1>
        </div>
        
        <div className="flex gap-2">
          {invoice.status === 'sent' && (
            <button
              onClick={markAsPaid}
              disabled={updating}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              <DollarSign className="h-5 w-5" />
              Mark as Paid
            </button>
          )}
          
          <Link
            href={`/invoices/${invoice.id}/download`}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <Download className="h-5 w-5" />
            Download
          </Link>
          
          {invoice.status === 'draft' && (
            <button
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              <Send className="h-5 w-5" />
              Send
            </button>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white shadow rounded-lg p-6 space-y-6">
          <div className="flex justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Invoice {invoice.invoiceNumber}</h2>
              <div className="mt-1">
                <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(invoice.status)}`}>
                  {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center text-gray-500 mb-1">
                <Calendar className="h-4 w-4 mr-1" />
                <span className="text-sm">Created: {format(invoice.date, 'MMM d, yyyy')}</span>
              </div>
              <div className="flex items-center text-gray-500">
                <Clock className="h-4 w-4 mr-1" />
                <span className="text-sm">Due: {format(invoice.dueDate, 'MMM d, yyyy')}</span>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4 border-t border-b">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">From</h3>
              <p className="font-semibold">WG Nursery</p>
              <p>123 Garden Way</p>
              <p>Plantville, FL 32801</p>
              <p>contact@wgnursery.com</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">To</h3>
              {customer ? (
                <>
                  <p className="font-semibold">{customer.name}</p>
                  {customer.address && <p>{customer.address}</p>}
                  {customer.email && <p>{customer.email}</p>}
                  {customer.phone && <p>{customer.phone}</p>}
                </>
              ) : (
                <p className="text-gray-500">Customer information not available</p>
              )}
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold mb-3">Invoice Items</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
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
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {invoice.items?.map((item: InvoiceItem, index: number) => (
                    <tr key={index}>
                      <td className="px-4 py-3 whitespace-nowrap">{item.description}</td>
                      <td className="px-4 py-3 whitespace-nowrap">{item.quantity}</td>
                      <td className="px-4 py-3 whitespace-nowrap">${item.unitPrice.toFixed(2)}</td>
                      <td className="px-4 py-3 whitespace-nowrap">${item.total.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={3} className="px-4 py-3 text-right font-semibold">Total:</td>
                    <td className="px-4 py-3 font-bold">${invoice.amount.toFixed(2)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
          
          {invoice.notes && (
            <div>
              <h3 className="font-semibold mb-2">Notes</h3>
              <p className="text-gray-700">{invoice.notes}</p>
            </div>
          )}
        </div>
        
        <div className="bg-white shadow rounded-lg p-6 space-y-6">
          <h2 className="font-semibold text-lg">Payment Details</h2>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-500">Status:</span>
              <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(invoice.status)}`}>
                {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-500">Amount:</span>
              <span className="font-semibold">${invoice.amount.toFixed(2)}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-500">Due Date:</span>
              <span>{format(invoice.dueDate, 'MMM d, yyyy')}</span>
            </div>
            
            {invoice.paymentDate && (
              <div className="flex justify-between">
                <span className="text-gray-500">Payment Date:</span>
                <span>{format(invoice.paymentDate, 'MMM d, yyyy')}</span>
              </div>
            )}
          </div>
          
          <div className="border-t pt-4 mt-4">
            <h3 className="font-semibold mb-2 text-gray-700">Payment Methods</h3>
            <div className="space-y-2">
              <div className="flex items-center p-3 border rounded-md">
                <DollarSign className="h-5 w-5 text-gray-400 mr-2" />
                <div>
                  <p className="font-medium">Bank Transfer</p>
                  <p className="text-sm text-gray-500">
                    Account: 12345678<br />
                    Sort Code: 01-02-03<br />
                    Reference: {invoice.invoiceNumber}
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {invoice.paymentHistory?.length > 0 && (
            <div className="border-t pt-4 mt-4">
              <h3 className="font-semibold mb-2 text-gray-700">Payment History</h3>
              <div className="space-y-2">
                {invoice.paymentHistory.map((payment: any, index: number) => (
                  <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <div>
                      <p className="font-medium">${payment.amount.toFixed(2)}</p>
                      <p className="text-xs text-gray-500">
                        {format(payment.date.toDate ? payment.date.toDate() : payment.date, 'MMM d, yyyy')}
                      </p>
                    </div>
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                      {payment.method}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
