// src/components/CreatePOForm.js
import React, { useState, useEffect } from 'react'; // Assuming React environment

// --- Placeholder Mocks ---
// Mock for createPurchaseOrder
const createPurchaseOrder_mock = (data) => {
  console.log("MOCK_PO_FORM: Creating Purchase Order with data:", data);
  if (!data.poId || !data.supplierId || !data.orderDate || !data.itemsOrdered || data.itemsOrdered.length === 0 || !data.shippingAddress) {
    throw new Error("MOCK_PO_FORM: Missing required fields for Purchase Order.");
  }

  let subtotal = 0;
  const processedItems = data.itemsOrdered.map((item, index) => {
    const lineTotal = (item.quantityOrdered || 0) * (item.unitPrice || 0);
    subtotal += lineTotal;
    return {
      ...item,
      poItemId: item.poItemId || `ITEM-${index + 1}`,
      lineItemTotal: parseFloat(lineTotal.toFixed(2))
    };
  });

  const tax = data.taxAmount || 0;
  const shipping = data.shippingCost || 0;
  const total = subtotal + tax + shipping;

  return {
    ...data,
    poId: data.poId.toUpperCase(),
    itemsOrdered: processedItems,
    subtotalAmount: parseFloat(subtotal.toFixed(2)),
    totalOrderAmount: parseFloat(total.toFixed(2)),
    status: data.status || 'Draft',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
};

// Initial mock PO data (can be empty or have some examples)
const initialMockPOs = {};
// Example Supplier IDs for dropdown
const mockSupplierIds = ["SUP-SEEDCO-001", "SUP-POTTERY-002", "SUP-CHEMSOL-003"];
// --- End Mocks ---

const PO_STATUS_OPTIONS = ['Draft', 'SubmittedToSupplier', 'AcknowledgedBySupplier', 'PartiallyReceived', 'FullyReceived', 'Invoiced', 'Paid', 'Cancelled'];
const initialPOItemState = () => ({ poItemId: `ITEM-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`, itemName: '', itemSpecification: '', quantityOrdered: '', unitOfMeasure: '', unitPrice: '', lineItemTotal: 0 });

const CreatePOForm = () => {
  const [purchaseOrders, setPurchaseOrders] = useState(initialMockPOs);
  const [currentPO, setCurrentPO] = useState({
    poId: '', supplierId: mockSupplierIds.length > 0 ? mockSupplierIds[0] : '', orderDate: new Date().toISOString().slice(0,10),
    expectedDeliveryDate: '', status: PO_STATUS_OPTIONS[0], itemsOrdered: [initialPOItemState()],
    taxAmount: '', shippingCost: '', shippingAddress: '', billingAddress: '', paymentTerms: '', notes: ''
  });

  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [errorFeedback, setErrorFeedback] = useState('');

  // Calculate totals whenever itemsOrdered, tax, or shipping changes
  const calculatedSubtotal = currentPO.itemsOrdered.reduce((sum, item) => sum + (parseFloat(item.lineItemTotal) || 0), 0);
  const calculatedTotal = calculatedSubtotal + (parseFloat(currentPO.taxAmount) || 0) + (parseFloat(currentPO.shippingCost) || 0);


  const handleHeaderChange = (e) => {
    const { name, value } = e.target;
    setCurrentPO(prev => ({ ...prev, [name]: value }));
  };

  const handleItemChange = (index, e) => {
    const { name, value } = e.target;
    const updatedItems = [...currentPO.itemsOrdered];
    updatedItems[index] = { ...updatedItems[index], [name]: value };

    // Recalculate lineItemTotal
    if (name === 'quantityOrdered' || name === 'unitPrice') {
      const qty = parseFloat(updatedItems[index].quantityOrdered) || 0;
      const price = parseFloat(updatedItems[index].unitPrice) || 0;
      updatedItems[index].lineItemTotal = qty * price;
    }
    setCurrentPO(prev => ({ ...prev, itemsOrdered: updatedItems }));
  };

  const addItem = () => {
    setCurrentPO(prev => ({ ...prev, itemsOrdered: [...prev.itemsOrdered, initialPOItemState()] }));
  };

  const removeItem = (index) => {
    setCurrentPO(prev => ({ ...prev, itemsOrdered: prev.itemsOrdered.filter((_, i) => i !== index) }));
  };

  const handleCreatePO = () => {
    setErrorFeedback(''); setFeedbackMessage('');
    try {
      const poData = {
        ...currentPO,
        taxAmount: parseFloat(currentPO.taxAmount) || 0,
        shippingCost: parseFloat(currentPO.shippingCost) || 0,
        itemsOrdered: currentPO.itemsOrdered.map(item => ({
            ...item,
            quantityOrdered: parseInt(item.quantityOrdered, 10),
            unitPrice: parseFloat(item.unitPrice)
            // lineItemTotal is already calculated and stored in item state
        }))
      };
      if (purchaseOrders[poData.poId.toUpperCase()]) {
        throw new Error(`Purchase Order with ID ${poData.poId.toUpperCase()} already exists.`);
      }

      const newPO = createPurchaseOrder_mock(poData); // Validation & total calculations happen in mock
      setPurchaseOrders(prev => ({ ...prev, [newPO.poId]: newPO }));
      setFeedbackMessage(`Purchase Order '${newPO.poId}' created successfully for supplier '${newPO.supplierId}'. Total: ${newPO.totalOrderAmount.toFixed(2)}`);

      // Reset form
      setCurrentPO({
        poId: '', supplierId: mockSupplierIds.length > 0 ? mockSupplierIds[0] : '', orderDate: new Date().toISOString().slice(0,10),
        expectedDeliveryDate: '', status: PO_STATUS_OPTIONS[0], itemsOrdered: [initialPOItemState()],
        taxAmount: '', shippingCost: '', shippingAddress: '', billingAddress: '', paymentTerms: '', notes: ''
      });

    } catch (error) {
      console.error("Error creating PO:", error);
      setErrorFeedback(`Error: ${error.message}`);
    }
  };

  return (
    /*
    <div>
      <h2>Create Purchase Order</h2>
      {feedbackMessage && <p style={{ color: 'green' }}>{feedbackMessage}</p>}
      {errorFeedback && <p style={{ color: 'red' }}>{errorFeedback}</p>}

      <section style={{ marginBottom: '20px', padding: '10px', border: '1px solid #ccc' }}>
        <h3>PO Details</h3>
        <div><label>PO ID: <input type="text" name="poId" value={currentPO.poId} onChange={handleHeaderChange} placeholder="e.g., PO-2024-001" /></label></div>
        <div>
          <label>Supplier ID:
            <select name="supplierId" value={currentPO.supplierId} onChange={handleHeaderChange}>
              <option value="">-- Select Supplier --</option>
              {mockSupplierIds.map(id => <option key={id} value={id}>{id}</option>)}
            </select>
          </label>
        </div>
        <div><label>Order Date: <input type="date" name="orderDate" value={currentPO.orderDate} onChange={handleHeaderChange} /></label></div>
        <div><label>Expected Delivery Date (opt.): <input type="date" name="expectedDeliveryDate" value={currentPO.expectedDeliveryDate} onChange={handleHeaderChange} /></label></div>
        <div>
          <label>Status:
            <select name="status" value={currentPO.status} onChange={handleHeaderChange}>
              {PO_STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </label>
        </div>
        <div><label>Shipping Address: <textarea name="shippingAddress" value={currentPO.shippingAddress} onChange={handleHeaderChange}></textarea></label></div>
        <div><label>Billing Address (opt., defaults to shipping): <textarea name="billingAddress" value={currentPO.billingAddress} onChange={handleHeaderChange}></textarea></label></div>
        <div><label>Payment Terms (opt.): <input type="text" name="paymentTerms" value={currentPO.paymentTerms} onChange={handleHeaderChange} /></label></div>

        <h4>Items Ordered:</h4>
        {currentPO.itemsOrdered.map((item, index) => (
          <div key={item.poItemId} style={{ border: '1px dashed #eee', padding: '10px', marginBottom: '10px' }}>
            <div>Item #{index + 1} (ID: {item.poItemId.startsWith('ITEM-') ? 'Auto' : item.poItemId})</div>
            <div><label>Item Name: <input type="text" name="itemName" value={item.itemName} onChange={e => handleItemChange(index, e)} /></label></div>
            <div><label>Specification (opt.): <input type="text" name="itemSpecification" value={item.itemSpecification} onChange={e => handleItemChange(index, e)} /></label></div>
            <div><label>Quantity Ordered: <input type="number" name="quantityOrdered" value={item.quantityOrdered} onChange={e => handleItemChange(index, e)} min="1" /></label></div>
            <div><label>Unit of Measure: <input type="text" name="unitOfMeasure" value={item.unitOfMeasure} onChange={e => handleItemChange(index, e)} placeholder="e.g., kg, pieces, L" /></label></div>
            <div><label>Unit Price: <input type="number" name="unitPrice" value={item.unitPrice} onChange={e => handleItemChange(index, e)} min="0" step="0.01" /></label></div>
            <div>Line Item Total: ${item.lineItemTotal.toFixed(2)}</div>
            <button type="button" onClick={() => removeItem(index)} style={{marginTop:'5px'}}>Remove Item</button>
          </div>
        ))}
        <button type="button" onClick={addItem} style={{marginBottom:'10px'}}>Add Another Item</button>

        <h4>Costs & Totals:</h4>
        <div><label>Subtotal: ${calculatedSubtotal.toFixed(2)}</label></div>
        <div><label>Tax Amount (opt.): <input type="number" name="taxAmount" value={currentPO.taxAmount} onChange={handleHeaderChange} min="0" step="0.01" /></label></div>
        <div><label>Shipping Cost (opt.): <input type="number" name="shippingCost" value={currentPO.shippingCost} onChange={handleHeaderChange} min="0" step="0.01" /></label></div>
        <div><strong>Total Order Amount: ${calculatedTotal.toFixed(2)}</strong></div>

        <div><label>Notes (opt.): <textarea name="notes" value={currentPO.notes} onChange={handleHeaderChange}></textarea></label></div>
        <button onClick={handleCreatePO} style={{marginTop:'20px', padding:'10px'}}>Create Purchase Order</button>
      </section>

      <section>
        <h3>Created Purchase Orders (Mock View)</h3>
        {Object.values(purchaseOrders).map(po => (
          <div key={po.poId} style={{ borderBottom: '1px solid #eee', paddingBottom: '5px', marginBottom: '5px' }}>
            <strong>PO ID: {po.poId}</strong> (Supplier: {po.supplierId}) - Status: {po.status}<br />
            Order Date: {po.orderDate}, Total: ${po.totalOrderAmount.toFixed(2)}<br />
            Items: {po.itemsOrdered.length}
          </div>
        ))}
      </section>
    </div>
    */
    null
  );
};

export { CreatePOForm };
