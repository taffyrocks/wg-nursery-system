'use client';

import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { format } from 'date-fns';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { useRouter } from 'next/navigation';

export default function DownloadInvoicePage({ params }: { params: { id: string } }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const generatePDF = async () => {
      try {
        // Fetch invoice data
        const invoiceRef = doc(db, 'invoices', params.id);
        const invoiceSnap = await getDoc(invoiceRef);
        
        if (!invoiceSnap.exists()) {
          setError('Invoice not found');
          setLoading(false);
          return;
        }
        
        const invoiceData = invoiceSnap.data();
        const invoiceDate = invoiceData.date.toDate();
        const invoiceDueDate = invoiceData.dueDate.toDate();
        
        // Fetch customer data if available
        let customerData = null;
        if (invoiceData.customerId) {
          const customerRef = doc(db, 'customers', invoiceData.customerId);
          const customerSnap = await getDoc(customerRef);
          if (customerSnap.exists()) {
            customerData = customerSnap.data();
          }
        }
        
        // Generate PDF
        const pdf = new jsPDF();
        
        // Add logo and header
        pdf.setFontSize(20);
        pdf.setTextColor(39, 168, 68); // Green color
        pdf.text('WG Nursery', 20, 20);
        
        pdf.setFontSize(10);
        pdf.setTextColor(100);
        pdf.text('123 Garden Way', 20, 27);
        pdf.text('Plantville, FL 32801', 20, 32);
        pdf.text('contact@wgnursery.com', 20, 37);
        
        // Invoice details
        pdf.setFontSize(16);
        pdf.setTextColor(0);
        pdf.text(`INVOICE #${invoiceData.invoiceNumber}`, 140, 20);
        
        pdf.setFontSize(10);
        pdf.text(`Date: ${format(invoiceDate, 'MMM d, yyyy')}`, 140, 27);
        pdf.text(`Due Date: ${format(invoiceDueDate, 'MMM d, yyyy')}`, 140, 32);
        
        const statusColor = invoiceData.status === 'paid' ? [39, 168, 68] : 
                          invoiceData.status === 'overdue' ? [220, 53, 69] : [52, 152, 219];
        pdf.setTextColor(...statusColor);
        pdf.text(`Status: ${invoiceData.status.toUpperCase()}`, 140, 37);
        pdf.setTextColor(0);
        
        // Bill to section
        pdf.setFontSize(12);
        pdf.text('Bill To:', 20, 50);
        
        if (customerData) {
          pdf.setFontSize(10);
          pdf.text(customerData.name, 20, 57);
          if (customerData.address) {
            const addressLines = customerData.address.split('\n');
            addressLines.forEach((line, index) => {
              pdf.text(line, 20, 62 + (index * 5));
            });
          }
          if (customerData.email) {
            pdf.text(customerData.email, 20, 72);
          }
          if (customerData.phone) {
            pdf.text(customerData.phone, 20, 77);
          }
        } else {
          pdf.text('Customer information not available', 20, 57);
        }
        
        // Invoice items table
        const tableColumn = ["Description", "Quantity", "Unit Price", "Total"];
        const tableRows = [];
        
        invoiceData.items.forEach(item => {
          const itemData = [
            item.description,
            item.quantity,
            `$${item.unitPrice.toFixed(2)}`,
            `$${item.total.toFixed(2)}`
          ];
          tableRows.push(itemData);
        });
        
        // @ts-ignore
        pdf.autoTable({
          startY: 90,
          head: [tableColumn],
          body: tableRows,
          theme: 'grid',
          headStyles: {
            fillColor: [39, 168, 68],
            textColor: [255, 255, 255],
            fontStyle: 'bold'
          },
          foot: [['', '', 'Total', `$${invoiceData.amount.toFixed(2)}`]],
          footStyles: {
            fillColor: [240, 240, 240],
            fontStyle: 'bold'
          }
        });
        
        // Add notes if available
        if (invoiceData.notes) {
          // @ts-ignore
          const finalY = pdf.lastAutoTable.finalY + 10;
          pdf.setFontSize(12);
          pdf.text('Notes:', 20, finalY);
          pdf.setFontSize(10);
          
          const splitNotes = pdf.splitTextToSize(invoiceData.notes, 170);
          pdf.text(splitNotes, 20, finalY + 7);
        }
        
        // Add payment information
        // @ts-ignore
        const paymentY = pdf.lastAutoTable.finalY + 30;
        pdf.setFontSize(12);
        pdf.text('Payment Information:', 20, paymentY);
        pdf.setFontSize(10);
        pdf.text('Bank Transfer:', 20, paymentY + 7);
        pdf.text('Account: 12345678', 20, paymentY + 12);
        pdf.text('Sort Code: 01-02-03', 20, paymentY + 17);
        pdf.text(`Reference: ${invoiceData.invoiceNumber}`, 20, paymentY + 22);
        
        // Add footer
        const pageHeight = pdf.internal.pageSize.height;
        pdf.setFontSize(8);
        pdf.setTextColor(100);
        pdf.text('Thank you for your business!', 20, pageHeight - 20);
        pdf.text(`Generated on ${format(new Date(), 'MMM d, yyyy')}`, 20, pageHeight - 15);
        
        // Save PDF and redirect
        pdf.save(`Invoice_${invoiceData.invoiceNumber}.pdf`);
        setTimeout(() => {
          router.push(`/invoices/${params.id}`);
        }, 1000);
        
      } catch (error) {
        console.error('Error generating PDF:', error);
        setError('Failed to generate invoice PDF');
      } finally {
        setLoading(false);
      }
    };

    generatePDF();
  }, [params.id, router]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
        <button
          onClick={() => router.push(`/invoices/${params.id}`)}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Back to Invoice
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mb-4 mx-auto"></div>
        <h2 className="text-xl font-semibold mb-2">Generating PDF...</h2>
        <p className="text-gray-600">Your download should begin automatically.</p>
        <p className="text-gray-600 text-sm mt-2">If your download doesn't start, you'll be redirected back to the invoice page.</p>
      </div>
    </div>
  );
}
