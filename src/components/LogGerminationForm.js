// src/components/LogGerminationForm.js
import React, { useState } from 'react'; // Assuming React environment

// --- Placeholder for actual model imports ---
const createGerminationRecord = (data) => ({ ...data, id: data.recordId || `record-${Date.now()}`, loggedAt: new Date().toISOString() });

// Mock data store for plant batches for more realistic simulation
let mockPlantBatches = {
  "BATCH-001": {
    batchId: "BATCH-001", year: 2024, supplierCode: 'SUPA', plantVarietyCode: 'PVAR1', sequenceNumber: 1,
    totalSuccessfullyGerminated: 0, quantityPlantedOut: 0, quantityLost: 0, quantitySold: 0,
    currentInventory: 0, status: 'New', qualityGrade: 'UNGRADED', qcHistory: [],
    seedsSown: 200, calculatedGerminationRate: null, daysToGermination: null, chemicalApplicationHistory: []
  },
  "BATCH-002": {
    batchId: "BATCH-002", year: 2024, supplierCode: 'SUPB', plantVarietyCode: 'PVAR2', sequenceNumber: 2,
    totalSuccessfullyGerminated: 0, quantityPlantedOut: 0, quantityLost: 0, quantitySold: 0,
    currentInventory: 0, status: 'New', qualityGrade: 'UNGRADED', qcHistory: [],
    seedsSown: 150, calculatedGerminationRate: null, daysToGermination: null, chemicalApplicationHistory: []
  }
};

// Mock for a function that would fetch a plant batch
const getPlantBatchById = (batchId) => {
  console.log(`MOCK: Fetching PlantBatch: ${batchId}`);
  return mockPlantBatches[batchId] ? { ...mockPlantBatches[batchId] } : null;
};

// Mock for a function that would update a plant batch
const updatePlantBatch = (batchId, updates) => {
  console.log(`MOCK: Attempting to update PlantBatch ${batchId} with:`, updates);
  if (mockPlantBatches[batchId]) {
    mockPlantBatches[batchId] = { ...mockPlantBatches[batchId], ...updates };
    // Recalculate inventory after updates
    const batch = mockPlantBatches[batchId];
    batch.currentInventory = batch.totalSuccessfullyGerminated - batch.quantityPlantedOut - batch.quantityLost - batch.quantitySold;
    console.log(`MOCK: PlantBatch ${batchId} updated successfully:`, mockPlantBatches[batchId]);
    return { ...mockPlantBatches[batchId] };
  } else {
    console.log(`MOCK: PlantBatch ${batchId} not found for update.`);
    return null;
  }
};

// Mock germination records store
let mockGerminationLogs = {
    "BATCH-001": [
        { recordId: "GR-001", plantBatchId: "BATCH-001", germinationCount: 80, sampleSize: 100 },
        { recordId: "GR-002", plantBatchId: "BATCH-001", germinationCount: 75, sampleSize: 100 }
    ],
    "BATCH-002": [
        { recordId: "GR-003", plantBatchId: "BATCH-002", germinationCount: 90, sampleSize: 100 }
    ]
};
// --- End Placeholder ---

const LogGerminationForm = () => {
  // ... (existing states: plantBatchId, sampleSize, temp, humidity, germinationCount, vigorAnalysisNotes, recordId, feedbackMessage)
  const [plantBatchId, setPlantBatchId] = useState('');
  const [sampleSize, setSampleSize] = useState(100);
  const [temp, setTemp] = useState('');
  const [humidity, setHumidity] = useState('');
  const [germinationCount, setGerminationCount] = useState('');
  const [vigorAnalysisNotes, setVigorAnalysisNotes] = useState('');
  const [recordId, setRecordId] = useState(`GR-${Date.now()}`);
  const [feedbackMessage, setFeedbackMessage] = useState('');

  // New state for finalization
  const [batchIdToFinalize, setBatchIdToFinalize] = useState('');

  const handleLogGermination = () => {
    // ... (existing logic for logging individual germination record)
    // This part remains largely the same but should use the new mockGerminationLogs
    setFeedbackMessage('');
    try {
      if (!plantBatchId.trim() || !germinationCount.trim()) {
        setFeedbackMessage('Plant Batch ID and Germination Count are required to log a record.');
        return;
      }
      const newRecord = {
        recordId,
        plantBatchId: plantBatchId.trim(),
        sampleSize: parseInt(sampleSize, 10),
        germinationCount: parseInt(germinationCount, 10),
        // ... other fields
      };
      if (!mockGerminationLogs[plantBatchId.trim()]) {
        mockGerminationLogs[plantBatchId.trim()] = [];
      }
      mockGerminationLogs[plantBatchId.trim()].push(newRecord);
      console.log('New Germination Record Logged (Conceptual):', newRecord);
      console.log('Current logs for batch:', mockGerminationLogs[plantBatchId.trim()]);
      setFeedbackMessage(`Germination record ${newRecord.id} for batch ${newRecord.plantBatchId} conceptually logged!`);
      setRecordId(`GR-${Date.now()}`); // Generate new ID for next potential record
    } catch (error) {
      console.error('Error logging germination:', error);
      setFeedbackMessage(`Error: ${error.message}`);
    }
  };

  // New function to finalize germination for a batch
  const handleFinalizeGermination = (targetBatchId) => {
    setFeedbackMessage('');
    if (!targetBatchId || !targetBatchId.trim()) {
      setFeedbackMessage("Please enter a Batch ID to finalize.");
      return;
    }
    console.log(`Starting finalization process for PlantBatch: ${targetBatchId}`);

    const recordsForBatch = mockGerminationLogs[targetBatchId.trim()] || [];
    if (recordsForBatch.length === 0) {
      console.log(`No germination records found for batch ${targetBatchId}. Cannot finalize.`);
      setFeedbackMessage(`No germination records found for batch ${targetBatchId}. Cannot finalize.`);
      return;
    }

    const totalGerminationForBatch = recordsForBatch.reduce((sum, record) => sum + record.germinationCount, 0);
    console.log(`Total calculated germination for batch ${targetBatchId}: ${totalGerminationForBatch}`);

    const currentBatch = getPlantBatchById(targetBatchId.trim());
    if (currentBatch) {
      let germinationRate = null;
      if (currentBatch.seedsSown && currentBatch.seedsSown > 0) {
        germinationRate = (totalGerminationForBatch / currentBatch.seedsSown) * 100;
      } else {
        console.warn(`Warning: Batch ${targetBatchId} has seedsSown = 0 or undefined. Cannot calculate germination rate.`);
      }

      const updates = {
        totalSuccessfullyGerminated: totalGerminationForBatch,
        status: 'Germinated', // Or 'ReadyForPlanting'
        calculatedGerminationRate: germinationRate !== null ? parseFloat(germinationRate.toFixed(1)) : null,
        daysToGermination: 7, // Mock value, real calculation would need daily records
        // currentInventory will be recalculated by updatePlantBatch
      };
      const updatedBatch = updatePlantBatch(targetBatchId.trim(), updates);
      if (updatedBatch) {
          let successMsg = `PlantBatch ${targetBatchId} finalized: Total Germinated = ${updatedBatch.totalSuccessfullyGerminated}, Status = ${updatedBatch.status}, Current Inventory = ${updatedBatch.currentInventory}.`;
          if (updatedBatch.calculatedGerminationRate !== null) {
            successMsg += ` Germination Rate: ${updatedBatch.calculatedGerminationRate}%.`;
          }
          if (updatedBatch.daysToGermination !== null) {
            successMsg += ` Approx. Days to Germinate: ${updatedBatch.daysToGermination}.`;
          }
          console.log(successMsg);
          setFeedbackMessage(successMsg);
      } else {
          const errorMsg = `Failed to update PlantBatch ${targetBatchId} during finalization.`;
          console.error(errorMsg);
          setFeedbackMessage(errorMsg);
      }
    } else {
      console.log(`PlantBatch with ID ${targetBatchId} not found. Cannot finalize.`);
      setFeedbackMessage(`PlantBatch with ID ${targetBatchId} not found. Cannot finalize.`);
    }
  };

  return (
    /*
    <div>
      <h2>Log Germination Record</h2>
      // ... (existing JSX for logging individual records) ...
      <div>
        <label>Plant Batch ID: <input type="text" value={plantBatchId} onChange={e => setPlantBatchId(e.target.value)} placeholder="e.g., BATCH-001" /></label>
      </div>
      <div>
        <label>Sample Size: <input type="number" value={sampleSize} onChange={e => setSampleSize(e.target.value)} min="1" /></label>
      </div>
      <div>
        <label>Germination Count: <input type="number" value={germinationCount} onChange={e => setGerminationCount(e.target.value)} min="0" /></label>
      </div>
      <button onClick={handleLogGermination}>Log Germination Record</button>
      {feedbackMessage && <p>{feedbackMessage}</p>}

      <hr />
      <h2>Finalize Batch Germination</h2>
      <div>
        <label>Batch ID to Finalize: <input type="text" value={batchIdToFinalize} onChange={e => setBatchIdToFinalize(e.target.value.trim())} placeholder="e.g., BATCH-001" /></label>
        <button onClick={() => handleFinalizeGermination(batchIdToFinalize)}>Finalize Germination for Batch</button>
      </div>
    </div>
    */
    null
  );
};

export { LogGerminationForm };
