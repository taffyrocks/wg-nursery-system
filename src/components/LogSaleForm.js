// src/components/LogSaleForm.js
import React, { useState } from 'react'; // Assuming React environment

// --- Placeholder / Mocks ---
let mockPlantBatches_LogSaleForm = {
  "BATCH-001": {
    batchId: "BATCH-001", plantVarietyCode: "PVAR1",
    totalSuccessfullyGerminated: 155, quantityPlantedOut: 100, quantityLost: 5, quantitySold: 20, currentInventory: 30, status: 'PartiallySold',
    qualityGrade: 'A', qcHistory: [{ event: "Mock QC Event BATCH-001" }], seedsSown: 200, calculatedGerminationRate: 95.2, daysToGermination: 6, chemicalApplicationHistory: []
  },
  "BATCH-002": {
    batchId: "BATCH-002", plantVarietyCode: "PVAR2",
    totalSuccessfullyGerminated: 90, quantityPlantedOut: 70, quantityLost: 0, quantitySold: 0, currentInventory: 20, status: 'ReadyForSale',
    qualityGrade: 'UNGRADED', qcHistory: [], seedsSown: 120, calculatedGerminationRate: null, daysToGermination: null, chemicalApplicationHistory: []
  },
  "BATCH-003": {
    batchId: "BATCH-003", plantVarietyCode: "PVAR3",
    totalSuccessfullyGerminated: 5, quantityPlantedOut: 0, quantityLost: 0, quantitySold: 0, currentInventory: 5, status: 'ReadyForSale',
    qualityGrade: 'UNGRADED', qcHistory: [], seedsSown: 10, calculatedGerminationRate: null, daysToGermination: null, chemicalApplicationHistory: []
  }
};

const mockProductsServices = {
  "PROD-GLV-RD-M": { productId: "PROD-GLV-RD-M", name: "Red Gardening Gloves (M)", price: 12.99, type: 'PRODUCT', category: "Apparel" },
  "PROD-SOIL-5L": { productId: "PROD-SOIL-5L", name: "Premium Potting Soil 5L", price: 7.50, type: 'PRODUCT', category: "Supplies" },
  "SERV-CONSULT-1H": { productId: "SERV-CONSULT-1H", name: "1hr Garden Consultation", price: 75.00, type: 'SERVICE', category: "Services" }
};

const getPlantBatchById_LogSaleForm = (batchId) => mockPlantBatches_LogSaleForm[batchId] ? { ...mockPlantBatches_LogSaleForm[batchId] } : null;
const updatePlantBatch_LogSaleForm = (batchId, updates) => {
  if (mockPlantBatches_LogSaleForm[batchId]) {
    mockPlantBatches_LogSaleForm[batchId] = { ...mockPlantBatches_LogSaleForm[batchId], ...updates };
    const batch = mockPlantBatches_LogSaleForm[batchId];
    batch.currentInventory = batch.totalSuccessfullyGerminated - batch.quantityPlantedOut - batch.quantityLost - batch.quantitySold;
    if (batch.currentInventory <= 0 && batch.quantitySold > 0) batch.status = 'SoldOut';
    else if (batch.quantitySold > 0 && batch.currentInventory > 0) batch.status = 'PartiallySold';
    console.log(`MOCK_SALE_FORM: PlantBatch ${batchId} updated:`, mockPlantBatches_LogSaleForm[batchId]);
    return { ...mockPlantBatches_LogSaleForm[batchId] };
  }
  return null;
};

const createSaleRecord_mock = (data) => {
  let subtotalBeforeOverallDiscount = 0;
  const processedItems = data.items.map(item => {
    const itemBaseTotal = (item.quantity || 0) * (item.pricePerUnit || 0);
    const itemDiscount = item.itemDiscount || 0;
    let lineTotal = itemBaseTotal - itemDiscount;
    lineTotal = Math.max(0, lineTotal);
    subtotalBeforeOverallDiscount += lineTotal;
    // Ensure all fields from SaleItem definition are present
    return {
        itemType: item.itemType,
        itemId: item.itemId,
        itemName: item.itemName,
        quantity: item.quantity,
        pricePerUnit: item.pricePerUnit,
        itemDiscount,
        lineTotal: parseFloat(lineTotal.toFixed(2))
    };
  });

  const overallSaleDisc = data.overallSaleDiscount || 0;
  let finalTotalAmount = subtotalBeforeOverallDiscount - overallSaleDisc;
  finalTotalAmount = Math.max(0, finalTotalAmount);

  let changeGiven = 0;
  const tendered = data.paymentDetails.amountTendered || 0;
  if (tendered > finalTotalAmount) {
    changeGiven = parseFloat((tendered - finalTotalAmount).toFixed(2));
  }
  if (tendered < finalTotalAmount) {
    console.warn(`MOCK_SALE_RECORD: Sale ${data.saleId}: Amount tendered (${tendered}) is less than final total (${finalTotalAmount.toFixed(2)}). Underpayment.`);
  }

  return {
    saleId: data.saleId || `SALE-${Date.now()}`,
    saleDate: data.saleDate || new Date().toISOString(),
    items: processedItems,
    subtotalBeforeOverallDiscount: parseFloat(subtotalBeforeOverallDiscount.toFixed(2)),
    overallSaleDiscount: parseFloat(overallSaleDisc.toFixed(2)),
    totalAmount: parseFloat(finalTotalAmount.toFixed(2)),
    customerId: data.customerId || null,
    paymentDetails: {
      paymentType: (data.paymentDetails.paymentType || 'UNKNOWN').toUpperCase(),
      amountTendered: tendered,
      changeGiven,
      transactionReference: data.paymentDetails.transactionReference || null,
    },
    loggedAt: new Date().toISOString()
  };
};
// --- End Placeholder ---

const PAYMENT_TYPES = ['CASH', 'CARD', 'BANK_TRANSFER', 'VOUCHER'];
const initialItemState = () => ({
  id: Date.now(),
  itemType: 'PLANT_BATCH', // Default type
  itemId: '',
  itemName: '',
  quantity: '',
  pricePerUnit: '',
  itemDiscount: '',
  lineTotal: 0
});

const LogSaleForm = () => {
  const [saleDate, setSaleDate] = useState(new Date().toISOString().slice(0,10));
  const [items, setItems] = useState([initialItemState()]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [paymentType, setPaymentType] = useState(PAYMENT_TYPES[0]);
  const [amountTendered, setAmountTendered] = useState('');
  const [transactionReference, setTransactionReference] = useState('');
  const [overallDiscount, setOverallDiscount] = useState('');

  const [batchSearchTerm, setBatchSearchTerm] = useState('');
  const [batchSearchResults, setBatchSearchResults] = useState([]);
  const [productSearchTerm, setProductSearchTerm] = useState('');
  const [productSearchResults, setProductSearchResults] = useState([]);

  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [currentSaleId, setCurrentSaleId] = useState(`SALE-${Date.now()}`);

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    const currentItem = { ...newItems[index] };
    currentItem[field] = value;

    if (field === 'itemType') {
      currentItem.itemId = '';
      currentItem.itemName = '';
      currentItem.pricePerUnit = '';
      currentItem.quantity = '1';
      currentItem.itemDiscount = '';
    }

    if (field === 'itemId' && currentItem.itemType !== 'PLANT_BATCH') {
      const product = mockProductsServices[value];
      if (product) {
        currentItem.itemName = product.name;
        currentItem.pricePerUnit = product.price.toString();
      }
    }

    const qty = parseFloat(currentItem.quantity) || 0;
    const price = parseFloat(currentItem.pricePerUnit) || 0;
    const itemDisc = parseFloat(currentItem.itemDiscount) || 0;
    let lineTotal = (qty * price) - itemDisc;
    currentItem.lineTotal = Math.max(0, lineTotal);

    newItems[index] = currentItem;
    setItems(newItems);
  };

  const addItem = () => setItems([...items, initialItemState()]);
  const removeItem = (index) => setItems(items.filter((_, i) => i !== index));

  const calculateSubtotalBeforeOverallDiscount = () => items.reduce((sum, item) => sum + (parseFloat(item.lineTotal) || 0), 0);
  const calculateGrandTotal = () => {
    const subtotal = calculateSubtotalBeforeOverallDiscount();
    const overallDisc = parseFloat(overallDiscount) || 0;
    return Math.max(0, subtotal - overallDisc);
  };

  const handleBatchSearch = () => {
    if (!batchSearchTerm.trim()) { setBatchSearchResults([]); return; }
    const searchTerm = batchSearchTerm.toLowerCase();
    const results = Object.values(mockPlantBatches_LogSaleForm).filter(batch =>
      batch.batchId.toLowerCase().includes(searchTerm) ||
      batch.plantVarietyCode.toLowerCase().includes(searchTerm) ||
      batch.status.toLowerCase().includes(searchTerm)
    );
    setBatchSearchResults(results);
    console.log("Batch Search Results:", results);
  };

  const handleAddBatchToSale = (batchFromSearch) => {
    if (!batchFromSearch || !batchFromSearch.batchId) return;
    setItems(currentItems => {
      const firstEmptyItemIndex = currentItems.findIndex(item => !item.itemId.trim() && item.itemType === 'PLANT_BATCH');
      if (firstEmptyItemIndex !== -1) {
        const updatedItems = [...currentItems];
        updatedItems[firstEmptyItemIndex] = {
          ...initialItemState(),
          id: currentItems[firstEmptyItemIndex].id,
          itemType: 'PLANT_BATCH',
          itemId: batchFromSearch.batchId,
          itemName: `${batchFromSearch.plantVarietyCode} (Batch: ${batchFromSearch.batchId.slice(-4)})`, // Example name
          quantity: '1',
        };
        return updatedItems;
      } else {
        return [...currentItems, {
          ...initialItemState(),
          itemType: 'PLANT_BATCH',
          itemId: batchFromSearch.batchId,
          itemName: `${batchFromSearch.plantVarietyCode} (Batch: ${batchFromSearch.batchId.slice(-4)})`,
          quantity: '1',
        }];
      }
    });
    console.log(`Added batch ${batchFromSearch.batchId} to sale items.`);
  };

  const handleProductSearch = () => {
    if (!productSearchTerm.trim()) { setProductSearchResults([]); return; }
    const searchTerm = productSearchTerm.toLowerCase();
    const results = Object.values(mockProductsServices).filter(prod =>
      prod.name.toLowerCase().includes(searchTerm) ||
      prod.productId.toLowerCase().includes(searchTerm) ||
      (prod.category && prod.category.toLowerCase().includes(searchTerm))
    );
    setProductSearchResults(results);
    console.log("Product/Service Search Results:", results);
  };

  const handleAddProductToSale = (productFromSearch) => {
    if (!productFromSearch || !productFromSearch.productId) return;
    setItems(currentItems => {
      const firstEmptyItemIndex = currentItems.findIndex(item => !item.itemId.trim() && item.itemType !== 'PLANT_BATCH');
      if (firstEmptyItemIndex !== -1 && currentItems[firstEmptyItemIndex].itemType !== 'PLANT_BATCH') {
          const updatedItems = [...currentItems];
          updatedItems[firstEmptyItemIndex] = {
              ...initialItemState(),
              id: currentItems[firstEmptyItemIndex].id,
              itemType: productFromSearch.type,
              itemId: productFromSearch.productId,
              itemName: productFromSearch.name,
              pricePerUnit: productFromSearch.price.toString(),
              quantity: '1',
          };
          const qty = 1; const price = productFromSearch.price; const itemDisc = 0;
          updatedItems[firstEmptyItemIndex].itemDiscount = itemDisc.toString();
          updatedItems[firstEmptyItemIndex].lineTotal = Math.max(0, (qty * price) - itemDisc);
          return updatedItems;
      } else {
        const newItem = {
          ...initialItemState(),
          itemType: productFromSearch.type,
          itemId: productFromSearch.productId,
          itemName: productFromSearch.name,
          pricePerUnit: productFromSearch.price.toString(),
          quantity: '1',
        };
        const qty = 1; const price = productFromSearch.price; const itemDisc = 0;
        newItem.itemDiscount = itemDisc.toString();
        newItem.lineTotal = Math.max(0, (qty * price) - itemDisc);
        return [...currentItems, newItem];
      }
    });
    console.log(`Added product/service ${productFromSearch.productId} to sale items.`);
  };

  const handleLogSale = async () => {
    setFeedbackMessage('');
    let saleSummary = 'Sale Logged Details:';
    let receiptDataObject = null;

    try {
      // Validations...
      const grandTotal = calculateGrandTotal();
      if (items.length === 0 || items.every(i => !i.itemId)) throw new Error('Cannot log a sale with no items.');
      if (items.some(item => !item.itemId || !item.itemName || !item.quantity || !item.pricePerUnit || !item.itemType)) {
        throw new Error('All items must have Item ID, Name, Type, Quantity, and Price per Unit.');
      }
       if (grandTotal <= 0 && items.some(i => i.itemId) && (parseFloat(overallDiscount) || 0) >= calculateSubtotalBeforeOverallDiscount()) {
          // Allow $0 sale if discounts make it so
      } else if (grandTotal <= 0 && items.some(i => i.itemId) && calculateSubtotalBeforeOverallDiscount() === 0 ) {
          throw new Error('Cannot log a sale with zero subtotal before overall discount if items are listed with no price.');
      }


      const numAmountTendered = parseFloat(amountTendered) || 0;
      if (isNaN(numAmountTendered) || numAmountTendered < 0) throw new Error('Amount tendered must be a valid non-negative number.');
      if (numAmountTendered < grandTotal) {
        setFeedbackMessage(prev => prev + "\nWarning: Amount tendered is less than total sale amount after discounts.");
      }

      const saleItemsForRecord = items.filter(i => i.itemId).map(item => ({ // Filter out any truly empty rows
        itemType: item.itemType,
        itemId: item.itemId.trim(),
        itemName: item.itemName.trim(),
        quantity: parseInt(item.quantity, 10),
        pricePerUnit: parseFloat(item.pricePerUnit),
        itemDiscount: parseFloat(item.itemDiscount) || 0,
      }));

      if (saleItemsForRecord.length === 0) throw new Error('No valid items to log for sale.');


      for (const item of saleItemsForRecord) {
        if (item.itemType === 'PLANT_BATCH') {
          const plantBatch = getPlantBatchById_LogSaleForm(item.itemId);
          if (!plantBatch) throw new Error(`Plant Batch ${item.itemId} not found.`);
          if (plantBatch.currentInventory < item.quantity) {
            throw new Error(`Insufficient inventory for Plant Batch ${item.itemId}. Available: ${plantBatch.currentInventory}, Requested: ${item.quantity}.`);
          }
        } else { // PRODUCT or SERVICE
            const product = mockProductsServices[item.itemId];
            if(!product) throw new Error(`Product/Service with ID ${item.itemId} not found in mock data.`);
            // No inventory check for non-batch items in this conceptual model
        }
      }

      const saleRecordData = {
        saleId: currentSaleId, saleDate, items: saleItemsForRecord,
        customerId: selectedCustomerId.trim() || null,
        overallSaleDiscount: parseFloat(overallDiscount) || 0,
        paymentDetails: { paymentType, amountTendered: numAmountTendered, transactionReference: transactionReference.trim() || null },
      };
      const newSaleRecord = createSaleRecord_mock(saleRecordData);
      console.log('SALE_PROCESS: New Sale Record Created (Conceptual):', newSaleRecord);

      receiptDataObject = {
        nurseryName: "Worn Gundidj Nursery (Conceptual)",
        nurseryAddress: "123 Garden Lane, Plantville",
        nurseryContact: "contact@wgnursery.example.com",
        saleId: newSaleRecord.saleId, saleDate: newSaleRecord.saleDate,
        customerId: newSaleRecord.customerId,
        customerName: newSaleRecord.customerId ? `Customer ${newSaleRecord.customerId.substring(0,5)}` : 'N/A',
        items: newSaleRecord.items.map(item => ({
          itemName: item.itemName,
          plantBatchId: item.itemType === 'PLANT_BATCH' ? item.itemId : null, // Keep plantBatchId if it's a plant
          productId: item.itemType !== 'PLANT_BATCH' ? item.itemId : null, // Keep productId if it's a product/service
          itemType: item.itemType, // Include itemType for clarity on receipt
          quantity: item.quantity, pricePerUnit: item.pricePerUnit,
          itemDiscountAmount: item.itemDiscount, itemLineTotal: item.lineTotal,
        })),
        subtotalBeforeDiscounts: newSaleRecord.items.reduce((sum, item) => sum + (item.quantity * item.pricePerUnit), 0),
        totalItemDiscounts: newSaleRecord.items.reduce((sum, item) => sum + item.itemDiscount, 0),
        subtotalAfterItemDiscounts: newSaleRecord.subtotalBeforeOverallDiscount,
        overallSaleDiscountAmount: newSaleRecord.overallSaleDiscount,
        grandTotal: newSaleRecord.totalAmount,
        taxAmount: 0,
        paymentDetails: newSaleRecord.paymentDetails,
        thankYouMessage: "Thank you for your purchase!", cashierNameOrId: "JulesAI-POS"
      };
      console.log("SALE_PROCESS: Conceptual Receipt Data Assembled:", receiptDataObject);

      saleSummary += `\n  Sale ID: ${newSaleRecord.saleId}, Cust ID: ${newSaleRecord.customerId || 'N/A'}`;
      saleSummary += `\n  Subtotal (after item disc): $${newSaleRecord.subtotalBeforeOverallDiscount.toFixed(2)}`;
      if(newSaleRecord.overallSaleDiscount > 0) saleSummary += `\n  Overall Sale Discount: -$${newSaleRecord.overallSaleDiscount.toFixed(2)}`;
      saleSummary += `\n  Grand Total: $${newSaleRecord.totalAmount.toFixed(2)}`;
      saleSummary += `\n  Tendered: $${newSaleRecord.paymentDetails.amountTendered.toFixed(2)}, Change: $${newSaleRecord.paymentDetails.changeGiven.toFixed(2)}`;
      saleSummary += `\n  Payment: ${newSaleRecord.paymentDetails.paymentType}` + (newSaleRecord.paymentDetails.transactionReference ? `, Ref: ${newSaleRecord.paymentDetails.transactionReference}` : '');
      saleSummary += "\n  Receipt data prepared (see console for details).";

      for (const soldItem of newSaleRecord.items) {
        if (soldItem.itemType === 'PLANT_BATCH') { // Only update inventory for Plant Batches
          const batchId = soldItem.itemId;
          const plantBatch = getPlantBatchById_LogSaleForm(batchId);
          if (plantBatch) {
            const oldQtySold = plantBatch.quantitySold; const oldInventory = plantBatch.currentInventory; const oldStatus = plantBatch.status;
            const updatedQuantitySold = oldQtySold + soldItem.quantity;
            const batchUpdates = { quantitySold: updatedQuantitySold };
            const updatedBatch = updatePlantBatch_LogSaleForm(batchId, batchUpdates);
            if (updatedBatch) {
              saleSummary += `\n  - Batch ${batchId}: ${soldItem.quantity} sold. Inv: ${oldInventory} -> ${updatedBatch.currentInventory}. Status: ${oldStatus} -> ${updatedBatch.status}.`;
              console.log(`SALE_PROCESS: PlantBatch Update: ${batchId} - OldSold: ${oldQtySold}, NewSold: ${updatedBatch.quantitySold}, OldInv: ${oldInventory} -> NewInv: ${updatedBatch.currentInventory}, Status: ${oldStatus} -> ${updatedBatch.status}`);
            } else { throw new Error(`Failed to update batch ${batchId} post-sale.`); }
          }
        }
      }
      setFeedbackMessage(saleSummary);
      setItems([initialItemState()]); setSelectedCustomerId(''); setPaymentType(PAYMENT_TYPES[0]); setAmountTendered(''); setTransactionReference(''); setOverallDiscount('');
      setCurrentSaleId(`SALE-${Date.now()}`);

    } catch (error) {
      console.error('Error logging sale:', error);
      if (saleSummary !== 'Sale Logged Details:') setFeedbackMessage(saleSummary + `\nError: ${error.message}`);
      else setFeedbackMessage(`Error: ${error.message}`);
    }
  };

  return (
    /*
    <div>
      <h2>Log Sale</h2>
      <div><label>Sale Date: <input type="date" value={saleDate} onChange={e => setSaleDate(e.target.value)} /></label></div>
      <h3>Customer (Optional):</h3>
      <div><label>Customer ID: <input type="text" value={selectedCustomerId} onChange={e => setSelectedCustomerId(e.target.value)} placeholder="e.g., CUST-123" /></label></div>

    <h3>Plant Batch Lookup:</h3>
    <div>
      <label>Search Term (ID, Variety, Status):
        <input type="text" value={batchSearchTerm} onChange={e => setBatchSearchTerm(e.target.value)} placeholder="e.g., PVAR1 or BATCH-001" />
      </label>
      <button onClick={handleBatchSearch}>Search Batches</button>
    </div>
    {batchSearchResults.length > 0 && (
      <div style={{ marginTop: '10px', border: '1px solid #ccc', padding: '10px' }}>
        <h4>Batch Search Results:</h4>
        {batchSearchResults.map(batch => (
          <div key={batch.batchId} style={{ marginBottom: '5px', padding: '5px', borderBottom: '1px solid #eee' }}>
            <p><strong>ID:</strong> {batch.batchId}, <strong>Variety:</strong> {batch.plantVarietyCode}, <strong>Status:</strong> {batch.status}, <strong>Inv:</strong> {batch.currentInventory}</p>
            <button onClick={() => handleAddBatchToSale(batch)}>Add Batch to Sale</button>
          </div>
        ))}
      </div>
    )}

    <h3>Product/Service Lookup:</h3>
    <div>
      <label>Search Product/Service (Name, ID, Category):
        <input type="text" value={productSearchTerm} onChange={e => setProductSearchTerm(e.target.value)} />
      </label>
      <button onClick={handleProductSearch}>Search Products/Services</button>
    </div>
    {productSearchResults.length > 0 && (
      <div style={{ marginTop: '10px', border: '1px solid #ccc', padding: '10px' }}>
        <h4>Product/Service Results:</h4>
        {productSearchResults.map(prod => (
          <div key={prod.productId} style={{ marginBottom: '5px', padding: '5px', borderBottom: '1px solid #eee' }}>
            <p><strong>ID:</strong> {prod.productId}, <strong>Name:</strong> {prod.name}, <strong>Price:</strong> ${prod.price.toFixed(2)}</p>
            <button onClick={() => handleAddProductToSale(prod)}>Add Product/Service to Sale</button>
          </div>
        ))}
      </div>
    )}

      <h3>Sale Items:</h3>
      {items.map((item, index) => (
        <div key={item.id} style={{ border: '1px solid #eee', padding: '10px', marginBottom: '10px' }}>
          <div>
            <label>Item Type:
              <select value={item.itemType} onChange={e => handleItemChange(index, 'itemType', e.target.value)}>
                <option value="PLANT_BATCH">Plant Batch</option>
                <option value="PRODUCT">Product</option>
                <option value="SERVICE">Service</option>
              </select>
            </label>
          </div>

          <div><label>Item ID (Batch or Product ID): <input type="text" value={item.itemId} onChange={e => handleItemChange(index, 'itemId', e.target.value)} /></label></div>
          <div><label>Item Name: <input type="text" value={item.itemName} onChange={e => handleItemChange(index, 'itemName', e.target.value)} readOnly={item.itemType !== 'PLANT_BATCH' && mockProductsServices[item.itemId]} /></label></div>
          <label>Quantity: <input type="number" value={item.quantity} onChange={e => handleItemChange(index, 'quantity', e.target.value)} min="1" /></label>
          <label>Price Per Unit: <input type="number" value={item.pricePerUnit} onChange={e => handleItemChange(index, 'pricePerUnit', e.target.value)} min="0" step="0.01" readOnly={item.itemType !== 'PLANT_BATCH' && mockProductsServices[item.itemId]} /></label>
          <label>Item Discount $: <input type="number" value={item.itemDiscount} onChange={e => handleItemChange(index, 'itemDiscount', e.target.value)} min="0" step="0.01" /></label>
          <div>Line Total (after item disc): ${item.lineTotal.toFixed(2)}</div>
          <button onClick={() => removeItem(index)}>Remove Item</button>
        </div>
      ))}
      <button onClick={addItem}>Add Another Item</button>

      <h3>Discounts & Totals:</h3>
      <div>Subtotal (after item discounts): ${calculateSubtotalBeforeOverallDiscount().toFixed(2)}</div>
      <div><label>Overall Sale Discount $: <input type="number" value={overallDiscount} onChange={e => setOverallDiscount(e.target.value)} min="0" step="0.01" /></label></div>
      <div><strong>Grand Total (to be paid): ${calculateGrandTotal().toFixed(2)}</strong></div>

      <h3>Payment:</h3>
      <div><label>Payment Type: <select value={paymentType} onChange={e => setPaymentType(e.target.value)}>{PAYMENT_TYPES.map(type => <option key={type} value={type}>{type}</option>)}</select></label></div>
      <div><label>Amount Tendered: <input type="number" value={amountTendered} onChange={e => setAmountTendered(e.target.value)} min="0" step="0.01" /></label></div>
      {paymentType === 'CARD' && <div><label>Transaction Reference: <input type="text" value={transactionReference} onChange={e => setTransactionReference(e.target.value)} /></label></div>}
      <div>Change to give: ${(Math.max(0, (parseFloat(amountTendered) || 0) - calculateGrandTotal())).toFixed(2)}</div>

      <button onClick={handleLogSale} style={{ marginTop: '20px', padding: '10px', fontSize: '1.2em' }}>Log Sale & Finalize</button>
      {feedbackMessage && <pre style={{ whiteSpace: 'pre-wrap', backgroundColor: '#f0f0f0', padding: '10px', marginTop: '10px' }}>{feedbackMessage}</pre>}
    </div>
    */
    null
  );
};
export { LogSaleForm };
