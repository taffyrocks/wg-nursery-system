// src/components/LogIncomingGoodsForm.js
import React, { useState, useEffect } from 'react'; // Assuming React environment

// --- Placeholder Mocks ---
const createIncomingGoodsLog_mock = (data) => {
  console.log("MOCK_INCOMING_GOODS_FORM: Creating Incoming Goods Log:", data);
  if (!data.incomingLogId || !data.supplierId || !data.deliveryDate || !data.receivedBy || !data.itemsReceived || data.itemsReceived.length === 0) {
    throw new Error("MOCK_INCOMING_GOODS_FORM: Missing required fields for Incoming Goods Log.");
  }
  return { ...data, incomingLogId: data.incomingLogId.toUpperCase(), createdAt: new Date().toISOString() };
};

// Mock PO data to fetch for pre-filling items
const mockPurchaseOrders_Incoming = {
  "PO-2024-001": {
    poId: "PO-2024-001", supplierId: "SUP-SEEDCO-001",
    itemsOrdered: [
      { poItemId: 'ITEM-1', itemName: 'Lavender Seeds - English Variety', itemSpecification: 'Lot #LAVENG-2024A', quantityOrdered: 5000, unitOfMeasure: 'seeds', unitPrice: 0.02 },
      { poItemId: 'ITEM-2', itemName: 'Terracotta Pots - 4 inch', itemSpecification: 'Standard terracotta', quantityOrdered: 200, unitOfMeasure: 'pieces', unitPrice: 0.75 }
    ]
  },
  "PO-2024-002": {
    poId: "PO-2024-002", supplierId: "SUP-CHEMSOL-003",
    itemsOrdered: [
      { poItemId: 'CHEM-A', itemName: 'Neem Oil Concentrate', itemSpecification: 'Organic, 1L', quantityOrdered: 5, unitOfMeasure: '1L Bottle', unitPrice: 20.00 }
    ]
  }
};
// Assume mockSupplierIds are available for dropdown
const mockSupplierIds_Incoming = ["SUP-SEEDCO-001", "SUP-POTTERY-002", "SUP-CHEMSOL-003", "SUP-OTHER-004"];
// --- End Mocks ---

const INSPECTION_STATUS_OPTIONS = ['Accepted', 'AcceptedWithRemarks', 'Rejected', 'PendingInspection'];
const SHIPMENT_STATUS_OPTIONS = ['Complete', 'Partial', 'Damaged', 'Incorrect', 'PendingFullInspection'];

const initialReceivedItemState = () => ({
  id: Date.now() + Math.random(), // For React key
  poItemIdRef: '', itemNameReceived: '', quantityExpected: '', quantityReceived: '', unitOfMeasure: '',
  batchNumberOrLotCode: '', itemExpiryDate: '', inspectionStatus: INSPECTION_STATUS_OPTIONS[3], // Default 'PendingInspection'
  inspectionNotes: '', storageLocationId: ''
});

const LogIncomingGoodsForm = () => {
  const [logs, setLogs] = useState({}); // Store created logs
  const [currentLog, setCurrentLog] = useState({
    incomingLogId: '', poId: '', supplierId: mockSupplierIds_Incoming.length > 0 ? mockSupplierIds_Incoming[0] : '', shipmentReference: '',
    deliveryDate: new Date().toISOString().slice(0,10), receivedBy: '',
    itemsReceived: [initialReceivedItemState()],
    overallShipmentStatus: SHIPMENT_STATUS_OPTIONS[4], // Default 'PendingFullInspection'
    notes: ''
  });

  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [errorFeedback, setErrorFeedback] = useState('');

  const handleHeaderChange = (e) => {
    const { name, value } = e.target;
    setCurrentLog(prev => ({ ...prev, [name]: value }));
  };

  const handleItemChange = (index, e) => {
    const { name, value } = e.target;
    const updatedItems = [...currentLog.itemsReceived];
    updatedItems[index] = { ...updatedItems[index], [name]: value };
    setCurrentLog(prev => ({ ...prev, itemsReceived: updatedItems }));
  };

  const addItem = () => {
    setCurrentLog(prev => ({ ...prev, itemsReceived: [...prev.itemsReceived, initialReceivedItemState()] }));
  };
  const removeItem = (index) => {
    setCurrentLog(prev => ({ ...prev, itemsReceived: prev.itemsReceived.filter((_, i) => i !== index) }));
  };

  const handleFetchPOItems = () => {
    setErrorFeedback(''); setFeedbackMessage('');
    const poId = currentLog.poId.toUpperCase();
    const po = mockPurchaseOrders_Incoming[poId];
    if (po) {
      const newItemsReceived = po.itemsOrdered.map(poItem => ({
        ...initialReceivedItemState(), // Get defaults and unique ID
        poItemIdRef: poItem.poItemId,
        itemNameReceived: poItem.itemName,
        quantityExpected: poItem.quantityOrdered.toString(),
        unitOfMeasure: poItem.unitOfMeasure,
        // quantityReceived, batchNumberOrLotCode, etc., to be filled by user
      }));
      setCurrentLog(prev => ({ ...prev, supplierId: po.supplierId, itemsReceived: newItemsReceived.length > 0 ? newItemsReceived : [initialReceivedItemState()] }));
      setFeedbackMessage(`PO ${poId} items loaded. Please enter received quantities and inspect.`);
    } else {
      setErrorFeedback(`PO ${poId} not found in mock data. Please add items manually.`);
      // Optionally reset items if PO not found and items were from a previous fetch
      // setCurrentLog(prev => ({ ...prev, itemsReceived: [initialReceivedItemState()] }));
    }
  };

  const handleLogIncomingGoods = () => {
    setErrorFeedback(''); setFeedbackMessage('');
    try {
      const logData = {
        ...currentLog,
        itemsReceived: currentLog.itemsReceived.map(item => ({
          ...item,
          quantityExpected: item.quantityExpected ? parseInt(item.quantityExpected, 10) : null,
          quantityReceived: parseInt(item.quantityReceived, 10),
        })).filter(item => item.itemNameReceived.trim() !== '') // Filter out completely empty conceptual rows
      };

      if (logData.itemsReceived.length === 0) {
          throw new Error("At least one item must be specified in 'Items Received'.");
      }
      // Further validation from model would be here (e.g. in createIncomingGoodsLog_mock)

      const newLog = createIncomingGoodsLog_mock(logData);
      setLogs(prev => ({ ...prev, [newLog.incomingLogId]: newLog }));
      setFeedbackMessage(`Incoming goods log '${newLog.incomingLogId}' created for supplier '${newLog.supplierId}'.`);

      // Conceptual Inventory Update Trigger:
      newLog.itemsReceived.forEach(item => {
        if (item.inspectionStatus === 'Accepted' || item.inspectionStatus === 'AcceptedWithRemarks') {
          console.warn(
            `CONCEPTUAL_INVENTORY_TRIGGER: Item '${item.itemNameReceived}' (Qty: ${item.quantityReceived} ${item.unitOfMeasure}) accepted. ` +
            `This would trigger an inventory update. E.g.:
` +
            `  - If seeds (e.g., linked to poItemIdRef or by itemName): Create new PlantBatch, or update bulk seed inventory.
` +
            `  - If chemical (e.g., from Chemical model based on itemNameReceived or poItemIdRef): Update Chemical.currentStockLiters/Kg.
` +
            `  - If supplies (pots, media): Update general supplies inventory (new model needed for this).
` +
            `  Details: Batch/Lot: ${item.batchNumberOrLotCode || 'N/A'}, Expiry: ${item.itemExpiryDate || 'N/A'}, Stored: ${item.storageLocationId || 'N/A'}`
          );
        } else if (item.inspectionStatus === 'Rejected') {
            console.warn(`CONCEPTUAL_REJECTION_PROCESS: Item '${item.itemNameReceived}' rejected. This would trigger a return/disposal process and NOT update inventory.`);
        }
      });

      // Reset form
      setCurrentLog({
        incomingLogId: '', poId: '', supplierId: mockSupplierIds_Incoming.length > 0 ? mockSupplierIds_Incoming[0] : '', shipmentReference: '',
        deliveryDate: new Date().toISOString().slice(0,10), receivedBy: '',
        itemsReceived: [initialReceivedItemState()],
        overallShipmentStatus: SHIPMENT_STATUS_OPTIONS[4], notes: ''
      });

    } catch (error) {
      console.error("Error logging incoming goods:", error);
      setErrorFeedback(`Error: ${error.message}`);
    }
  };

  return (
    /*
    <div>
      <h2>Log Incoming Goods & Inspection</h2>
      {feedbackMessage && <p style={{ color: 'green' }}>{feedbackMessage}</p>}
      {errorFeedback && <p style={{ color: 'red' }}>{errorFeedback}</p>}

      <section style={{ marginBottom: '20px', padding: '10px', border: '1px solid #ccc' }}>
        <h3>Shipment Details</h3>
        <div><label>Incoming Log ID: <input type="text" name="incomingLogId" value={currentLog.incomingLogId} onChange={handleHeaderChange} placeholder="e.g., RECV-2024-001" /></label></div>
        <div>
          <label>PO ID (Optional, for pre-fill): <input type="text" name="poId" value={currentLog.poId} onChange={handleHeaderChange} /></label>
          <button type="button" onClick={handleFetchPOItems} style={{marginLeft:'10px'}}>Fetch PO Items</button>
        </div>
        <div>
          <label>Supplier ID:
            <select name="supplierId" value={currentLog.supplierId} onChange={handleHeaderChange}>
              <option value="">-- Select Supplier --</option>
              {mockSupplierIds_Incoming.map(id => <option key={id} value={id}>{id}</option>)}
            </select>
          </label>
        </div>
        <div><label>Shipment Reference (e.g., Tracking #): <input type="text" name="shipmentReference" value={currentLog.shipmentReference} onChange={handleHeaderChange} /></label></div>
        <div><label>Delivery Date: <input type="date" name="deliveryDate" value={currentLog.deliveryDate} onChange={handleHeaderChange} /></label></div>
        <div><label>Received By: <input type="text" name="receivedBy" value={currentLog.receivedBy} onChange={handleHeaderChange} /></label></div>

        <h4>Items Received & Inspected:</h4>
        {currentLog.itemsReceived.map((item, index) => (
          <div key={item.id} style={{ border: '1px dashed #eee', padding: '10px', marginBottom: '10px' }}>
            <div>Item #{index + 1} (PO Ref: {item.poItemIdRef || 'N/A'})</div>
            <div><label>Item Name (as received): <input type="text" name="itemNameReceived" value={item.itemNameReceived} onChange={e => handleItemChange(index, e)} /></label></div>
            <div><label>Qty Expected (opt.): <input type="number" name="quantityExpected" value={item.quantityExpected} onChange={e => handleItemChange(index, e)} /></label></div>
            <div><label>Qty Received: <input type="number" name="quantityReceived" value={item.quantityReceived} onChange={e => handleItemChange(index, e)} min="0" /></label></div>
            <div><label>Unit of Measure: <input type="text" name="unitOfMeasure" value={item.unitOfMeasure} onChange={e => handleItemChange(index, e)} /></label></div>
            <div><label>Batch/Lot Code (opt.): <input type="text" name="batchNumberOrLotCode" value={item.batchNumberOrLotCode} onChange={e => handleItemChange(index, e)} /></label></div>
            <div><label>Item Expiry Date (opt.): <input type="date" name="itemExpiryDate" value={item.itemExpiryDate} onChange={e => handleItemChange(index, e)} /></label></div>
            <div>
              <label>Inspection Status:
                <select name="inspectionStatus" value={item.inspectionStatus} onChange={e => handleItemChange(index, e)}>
                  {INSPECTION_STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </label>
            </div>
            <div><label>Inspection Notes (opt.): <textarea name="inspectionNotes" value={item.inspectionNotes} onChange={e => handleItemChange(index, e)}></textarea></label></div>
            <div><label>Storage Location ID (opt.): <input type="text" name="storageLocationId" value={item.storageLocationId} onChange={e => handleItemChange(index, e)} /></label></div>
            <button type="button" onClick={() => removeItem(index)} style={{marginTop:'5px'}}>Remove This Item</button>
          </div>
        ))}
        <button type="button" onClick={addItem} style={{marginBottom:'10px'}}>Add Another Received Item Manually</button>

        <h4>Overall Status & Notes:</h4>
        <div>
          <label>Overall Shipment Status:
            <select name="overallShipmentStatus" value={currentLog.overallShipmentStatus} onChange={handleHeaderChange}>
              {SHIPMENT_STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </label>
        </div>
        <div><label>General Notes (opt.): <textarea name="notes" value={currentLog.notes} onChange={handleHeaderChange}></textarea></label></div>

        <button onClick={handleLogIncomingGoods} style={{marginTop:'20px', padding:'10px'}}>Log Received Goods</button>
      </section>

      <section>
        <h3>Logged Incoming Goods (Mock View)</h3>
        {Object.values(logs).map(log => (
          <div key={log.incomingLogId} style={{ borderBottom: '1px solid #eee', paddingBottom: '5px', marginBottom: '5px' }}>
            <strong>Log ID: {log.incomingLogId}</strong> (Supplier: {log.supplierId}, PO: {log.poId || 'N/A'})<br />
            Delivery Date: {log.deliveryDate}, Received By: {log.receivedBy}, Status: {log.overallShipmentStatus}<br/>
            Items: {log.itemsReceived.length}
            <ul>
              {log.itemsReceived.map((item, idx) => <li key={idx}>{item.itemNameReceived} - Qty: {item.quantityReceived} {item.unitOfMeasure}, Insp: {item.inspectionStatus}</li>)}
            </ul>
          </div>
        ))}
      </section>
    </div>
    */
    null
  );
};

export { LogIncomingGoodsForm };
