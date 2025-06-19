// src/components/LogAdjustmentForm.js
import React, { useState } from 'react'; // Assuming React environment

// --- Placeholder for actual model imports ---
// import { createInventoryAdjustmentRecord } from '../models/inventoryAdjustmentRecord';
// Mock versions of PlantBatch functions (similar to LogGerminationForm)
// let mockPlantBatches = { /* ... pre-existing mock data ... */ }; // Assume this is globally available or passed in for mocks
// const getPlantBatchById = (batchId) => mockPlantBatches[batchId];
// const updatePlantBatch = (batchId, updates) => { /* ... updates mockPlantBatches ... */};

// For this subtask, let's redefine simplified mocks if not relying on a shared mock state from other files.
// If this were a real app, these would be centralized.
let mockPlantBatches_LogAdjustmentForm = {
  "BATCH-001": {
    batchId: "BATCH-001", year: 2024, supplierCode: 'SUPA', plantVarietyCode: 'PVAR1',
    totalSuccessfullyGerminated: 155, quantityPlantedOut: 100, quantityLost: 5, quantitySold: 0,
    currentInventory: 50, status: 'PlantedOut' // 155 - 100 - 5 = 50
  },
  "BATCH-002": {
    batchId: "BATCH-002", year: 2024, supplierCode: 'SUPB', plantVarietyCode: 'PVAR2',
    totalSuccessfullyGerminated: 90, quantityPlantedOut: 0, quantityLost: 0, quantitySold: 0,
    currentInventory: 90, status: 'Germinated' // Not yet planted out
  }
};

const getPlantBatchById_LogAdjustmentForm = (batchId) => {
  console.log(`MOCK_ADJ: Fetching PlantBatch: ${batchId}`);
  return mockPlantBatches_LogAdjustmentForm[batchId] ? { ...mockPlantBatches_LogAdjustmentForm[batchId] } : null;
};

const updatePlantBatch_LogAdjustmentForm = (batchId, updates) => {
  console.log(`MOCK_ADJ: Attempting to update PlantBatch ${batchId} with:`, updates);
  if (mockPlantBatches_LogAdjustmentForm[batchId]) {
    mockPlantBatches_LogAdjustmentForm[batchId] = { ...mockPlantBatches_LogAdjustmentForm[batchId], ...updates };
    // Recalculate inventory
    const batch = mockPlantBatches_LogAdjustmentForm[batchId];
    batch.currentInventory = batch.totalSuccessfullyGerminated - batch.quantityPlantedOut - batch.quantityLost - batch.quantitySold;
    console.log(`MOCK_ADJ: PlantBatch ${batchId} updated:`, mockPlantBatches_LogAdjustmentForm[batchId]);
    return { ...mockPlantBatches_LogAdjustmentForm[batchId] };
  }
  console.log(`MOCK_ADJ: PlantBatch ${batchId} not found.`);
  return null;
};

const createInventoryAdjustmentRecord_mock = (data) => ({
  ...data,
  id: data.adjustmentId || `ADJ-${Date.now()}`,
  loggedAt: new Date().toISOString()
});
// --- End Placeholder ---

const ADJUSTMENT_TYPES = [
  'LOSS_DAMAGE', 'LOSS_PEST', 'LOSS_DISEASE',
  'FOUND_STOCK', // Found unaccounted stock
  'MANUAL_CORRECTION_ADD', // Increase inventory due to correction
  'MANUAL_CORRECTION_SUBTRACT' // Decrease inventory due to correction
];

const LogAdjustmentForm = () => {
  const [plantBatchId, setPlantBatchId] = useState('');
  const [adjustmentDate, setAdjustmentDate] = useState(new Date().toISOString().slice(0,10));
  const [adjustmentType, setAdjustmentType] = useState(ADJUSTMENT_TYPES[0]);
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');

  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [newAdjustmentId, setNewAdjustmentId] = useState(`ADJ-${Date.now()}`);

  const handleLogAdjustment = () => {
    setFeedbackMessage('');
    try {
      if (!plantBatchId.trim()) throw new Error('Plant Batch ID is required.');
      if (!adjustmentType) throw new Error('Adjustment type is required.');
      const numQuantity = parseInt(quantity, 10);
      if (isNaN(numQuantity) || numQuantity <= 0) throw new Error('Valid positive quantity is required.');

      // 1. Create the Inventory Adjustment Record
      const adjustmentRecordData = {
        adjustmentId: newAdjustmentId,
        plantBatchId: plantBatchId.trim(),
        adjustmentDate,
        adjustmentType,
        quantity: numQuantity,
        reason: reason.trim(),
        notes: notes.trim(),
      };
      const newRecord = createInventoryAdjustmentRecord_mock(adjustmentRecordData);
      console.log('New Inventory Adjustment Record Created (Conceptual):', newRecord);
      setFeedbackMessage(`Adjustment record ${newRecord.id} for batch ${newRecord.plantBatchId} created.`);

      // 2. Conceptually update the linked PlantBatch
      const currentBatch = getPlantBatchById_LogAdjustmentForm(plantBatchId.trim());
      if (currentBatch) {
        let { quantityLost, totalSuccessfullyGerminated, status } = currentBatch;

        switch (adjustmentType) {
          case 'LOSS_DAMAGE':
          case 'LOSS_PEST':
          case 'LOSS_DISEASE':
          case 'MANUAL_CORRECTION_SUBTRACT':
            quantityLost += numQuantity;
            console.log(`ADJ_LOGIC: Type ${adjustmentType}. Increased quantityLost by ${numQuantity}. New quantityLost: ${quantityLost}`);
            break;
          case 'FOUND_STOCK':
          case 'MANUAL_CORRECTION_ADD':
            // If found stock before extensive planting, it might adjust totalSuccessfullyGerminated.
            // If found after planting, it's more like reducing a previous (unrecorded) loss.
            // For simplicity here: if status is 'Germinated' or 'New', adjust totalSuccessfullyGerminated. Otherwise, reduce quantityLost.
            if (status === 'Germinated' || status === 'New') {
              totalSuccessfullyGerminated += numQuantity;
              console.log(`ADJ_LOGIC: Type ${adjustmentType}. Increased totalSuccessfullyGerminated by ${numQuantity}. New total: ${totalSuccessfullyGerminated}`);
            } else {
              quantityLost -= numQuantity; // This could make quantityLost negative if not careful, implying found more than lost.
              console.log(`ADJ_LOGIC: Type ${adjustmentType}. Decreased quantityLost by ${numQuantity}. New quantityLost: ${quantityLost}`);
              if (quantityLost < 0) {
                  console.warn("ADJ_LOGIC: quantityLost became negative. This implies more stock was found/corrected than previously recorded as lost. Consider if this should adjust totalSuccessfullyGerminated instead or if a negative quantityLost is acceptable.");
                  // Potentially, a negative quantityLost could be re-normalized at a higher level,
                  // e.g. totalSuccessfullyGerminated += Math.abs(quantityLost); quantityLost = 0;
              }
            }
            break;
          default:
            console.warn(`Unhandled adjustment type: ${adjustmentType}`);
            setFeedbackMessage(prev => prev + ` Unhandled adjustment type: ${adjustmentType}.`);
            return;
        }

        const batchUpdates = {
          quantityLost,
          totalSuccessfullyGerminated,
          // currentInventory will be recalculated by updatePlantBatch_LogAdjustmentForm
          // status might change if currentInventory is 0, e.g., to 'SoldOut' or 'Depleted'
        };

        const updatedBatch = updatePlantBatch_LogAdjustmentForm(plantBatchId.trim(), batchUpdates);
        if (updatedBatch) {
            setFeedbackMessage(prev => prev + ` Batch ${plantBatchId.trim()} inventory updated. New QtyLost: ${updatedBatch.quantityLost}, New TotalGerm: ${updatedBatch.totalSuccessfullyGerminated}, New Inv: ${updatedBatch.currentInventory}.`);
            console.log(`BATCH_UPDATE_RESULT: Batch ${updatedBatch.batchId} - Status: ${updatedBatch.status}, Inventory: ${updatedBatch.currentInventory}`);
        }


      } else {
        setFeedbackMessage(prev => prev + ` Warning: Batch ${plantBatchId.trim()} not found for inventory update.`);
      }

      // Reset form
      setPlantBatchId(''); setAdjustmentType(ADJUSTMENT_TYPES[0]); setQuantity(''); setReason(''); setNotes('');
      setNewAdjustmentId(`ADJ-${Date.now()}`);

    } catch (error) {
      console.error('Error logging adjustment:', error);
      setFeedbackMessage(`Error: ${error.message}`);
    }
  };

  return (
    /*
    <div>
      <h2>Log Inventory Adjustment</h2>
      <div><label>Plant Batch ID: <input type="text" value={plantBatchId} onChange={e => setPlantBatchId(e.target.value)} /></label></div>
      <div><label>Adjustment Date: <input type="date" value={adjustmentDate} onChange={e => setAdjustmentDate(e.target.value)} /></label></div>
      <div>
        <label>Adjustment Type:
          <select value={adjustmentType} onChange={e => setAdjustmentType(e.target.value)}>
            {ADJUSTMENT_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
          </select>
        </label>
      </div>
      <div><label>Quantity: <input type="number" value={quantity} onChange={e => setQuantity(e.target.value)} min="1" /></label></div>
      <div><label>Reason: <input type="text" value={reason} onChange={e => setReason(e.target.value)} /></label></div>
      <div><label>Notes: <textarea value={notes} onChange={e => setNotes(e.target.value)} /></label></div>
      <button onClick={handleLogAdjustment}>Log Adjustment</button>
      {feedbackMessage && <p>{feedbackMessage}</p>}
    </div>
    */
    null
  );
};

export { LogAdjustmentForm };
