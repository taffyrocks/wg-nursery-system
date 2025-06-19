// src/models/inventoryAdjustmentRecord.js

// Defines the structure for an InventoryAdjustmentRecord,
// used for tracking various changes to inventory like losses, damages, or corrections.

// TODO: Consider using a class or a more formal constructor if methods are needed.
const createInventoryAdjustmentRecord = ({
  adjustmentId, // Should be unique (e.g., UUID or DB-generated)
  plantBatchId, // Foreign key linking to PlantBatch
  adjustmentDate,
  // Type of adjustment (e.g., 'LOSS_DAMAGE', 'LOSS_PEST', 'LOSS_DISEASE', 'FOUND_STOCK', 'MANUAL_CORRECTION_ADD', 'MANUAL_CORRECTION_SUBTRACT')
  adjustmentType,
  quantity, // Positive number representing the magnitude of the adjustment
  reason = '', // Optional: A brief reason for the adjustment (e.g., "Pest infestation", "Stock count correction")
  notes = '' // Optional: More detailed notes if needed
}) => {
  if (!adjustmentId) throw new Error('Adjustment ID is required.');
  if (!plantBatchId) throw new Error('Plant Batch ID is required to link the adjustment.');
  if (!adjustmentDate) throw new Error('Adjustment date is required.');
  if (!adjustmentType || adjustmentType.trim() === '') throw new Error('Adjustment type is required.');
  if (quantity === undefined || typeof quantity !== 'number' || quantity <= 0) {
    // Quantity should always be positive, the 'type' defines its effect.
    throw new Error('Quantity must be a positive number representing the magnitude of adjustment.');
  }

  return {
    adjustmentId,
    plantBatchId,
    adjustmentDate: adjustmentDate || new Date().toISOString(),
    adjustmentType,
    quantity,
    reason,
    notes,
    // Future fields could include:
    // - employeeId (who made the adjustment)
    // - relatedDocumentId (e.g., link to a pest report or quality check)
  };
};

// Example usage (conceptual):
// const newAdjustment = createInventoryAdjustmentRecord({
//   adjustmentId: 'adj-001', // This would typically be generated
//   plantBatchId: '2024-ASC-EUC-001', // From an existing PlantBatch
//   adjustmentDate: new Date().toISOString(),
//   adjustmentType: 'LOSS_DAMAGE',
//   quantity: 10, // 10 items lost or damaged
//   reason: 'Heavy rain impact on seedlings',
//   notes: 'Located in exposed section of nursery area B.'
// });
// console.log(newAdjustment);

export { createInventoryAdjustmentRecord };
