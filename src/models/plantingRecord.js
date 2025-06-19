// src/models/plantingRecord.js

// Defines the structure for a PlantingRecord,
// which documents when and where plants from a batch are planted.

// TODO: Consider using a class or a more formal constructor if methods are needed.
const createPlantingRecord = ({
  plantingId, // Should be unique (e.g., UUID or DB-generated)
  plantBatchId, // Foreign key linking to PlantBatch
  plantingDate,
  locationId, // Identifier for the planting location (e.g., "GH1-A", "Field2-PlotB3")
  quantityPlanted,
  expectedYield = null, // Optional: estimated yield from this planting
  notes = '' // Optional: any notes related to this planting
}) => {
  if (!plantingId) throw new Error('Planting ID is required.');
  if (!plantBatchId) throw new Error('Plant Batch ID is required to link the planting.');
  if (!plantingDate) throw new Error('Planting date is required.');
  if (!locationId) throw new Error('Location ID is required.');
  if (quantityPlanted === undefined || quantityPlanted <= 0) {
    throw new Error('Quantity planted must be a positive number.');
  }

  return {
    plantingId,
    plantBatchId,
    plantingDate: plantingDate || new Date().toISOString(),
    locationId,
    quantityPlanted,
    expectedYield,
    notes,
    // Future fields could include:
    // - plantedByEmployeeId
    // - soilPreparationDetails
    // - irrigationScheduleId
  };
};

// Example usage (conceptual):
// const newPlanting = createPlantingRecord({
//   plantingId: 'planting-001', // This would typically be generated
//   plantBatchId: '2024-ASC-EUC-001', // From an existing PlantBatch
//   plantingDate: new Date().toISOString(),
//   locationId: 'Greenhouse3-RowA-Section2',
//   quantityPlanted: 500,
//   expectedYield: 480, // Expecting 480 viable plants from this
//   notes: 'Planted in new organic substrate mix.'
// });
// console.log(newPlanting);

export { createPlantingRecord };
