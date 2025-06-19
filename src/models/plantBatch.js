// src/models/plantBatch.js

// Conceptual Quality Parameters and Grading Logic for PlantBatches
// This section outlines ideas for how plant batch quality could be assessed.
// These are not yet fully implemented in the data model's logic but guide its design.

/**
 * @typedef {Object} QualityParameterSet
 * @property {number} germinationRatePercent - Overall germination rate (e.g., 92 for 92%).
 * @property {number} averageSeedlingHeightCm - Average height at a specific assessment point (e.g., 4 weeks).
 * @property {'LOW' | 'MEDIUM' | 'HIGH' | 'NONE_DETECTED'} pestDiseaseIncidence - Observed level of pests/diseases.
 * @property {number} uniformityScore - A score from 1 (poor) to 5 (excellent) representing consistency in growth/appearance.
 * @property {Date} assessmentDate - Date of this quality assessment.
 * @property {string} [assessorNotes] - Any specific notes from the assessor.
 */

/**
 * Conceptual Grading Rules (Example):
 * These rules would be applied based on data from QualityParameterSet and other observations.
 *
 * Grade A ('Premium'):
 * - germinationRatePercent >= 90
 * - averageSeedlingHeightCm >= 10 (at 4 weeks, for a specific species type)
 * - pestDiseaseIncidence === 'NONE_DETECTED' or 'LOW'
 * - uniformityScore >= 4
 *
 * Grade B ('Standard'):
 * - germinationRatePercent >= 75
 * - averageSeedlingHeightCm >= 7 (at 4 weeks, for a specific species type)
 * - pestDiseaseIncidence === 'LOW' or 'MEDIUM' (if medium, requires treatment plan)
 * - uniformityScore >= 3
 *
 * Grade C ('Sub-standard' or 'Usable with Remarks'):
 * - Fails to meet Grade B criteria but is still considered viable for certain uses.
 * - Specific issues must be documented.
 *
 * UNGRADED:
 * - Default status before any formal QC assessment leading to a grade.
 *
 * REJECTED:
 * - Fails to meet minimum viability criteria. Not for sale.
 */

// Note: The actual implementation of grading might involve a more complex rules engine
// or a weighted scoring system based on these parameters. For now, these are conceptual.

// Defines the structure for a PlantBatch
/**
 * Creates a PlantBatch object.
 * Represents a group of plants managed as a single unit through their lifecycle.
 * @param {object} params - Parameters for creating the plant batch.
 * @param {string} params.batchId - Unique identifier for the batch.
 * @param {number} params.year - Year the batch was initiated.
 * @param {string} params.supplierCode - Code for the supplier of seeds/starts.
 * @param {string} params.plantVarietyCode - Code for the specific plant variety.
 * @param {number} params.sequenceNumber - Sequence number for batches of this type in the year.
 * @param {string} [params.creationDate] - ISO date string of when the batch was created, defaults to now.
 * @param {string} [params.sourceSeedBatchId=null] - Optional ID of the parent seed batch.
 * @param {number} [params.totalSuccessfullyGerminated=0] - Count of successfully germinated plants.
 * @param {number} [params.quantityPlantedOut=0] - Count of plants planted out from this batch.
 * @param {number} [params.quantityLost=0] - Count of plants lost.
 * @param {number} [params.quantitySold=0] - Count of plants sold.
 * @param {string} [params.status='New'] - Current status of the batch (e.g., 'New', 'Germination', 'PlantedOut').
 * @param {string} [params.qualityGrade='UNGRADED'] - Quality grade assigned to the batch.
 * @param {Array<Object>} [params.qcHistory=[]] - History of QC events for this batch.
 * @param {number} [params.seedsSown=0] - Total number of seeds sown for this batch.
 * @param {number|null} [params.calculatedGerminationRate=null] - Calculated germination rate (e.g., 92.5 for 92.5%).
 * @param {number|null} [params.daysToGermination=null] - Average number of days to germination.
 * @param {Array<Object>} [params.chemicalApplicationHistory=[]] - Log of chemical applications to this batch.
 * @returns {object} The created plant batch object.
 */
const createPlantBatch = ({
  batchId, // Should be generated, e.g., using generateBatchCode utility or passed in
  year,
  supplierCode,
  plantVarietyCode,
  sequenceNumber,
  creationDate,
  sourceSeedBatchId = null, // Optional: links to the original seed batch

  // New fields for inventory and status tracking:
  totalSuccessfullyGerminated = 0, // Number of plants that successfully germinated
  quantityPlantedOut = 0,          // Total number of plants from this batch planted out
  quantityLost = 0,                // Quantity lost due to various reasons (pests, disease, etc.)
  quantitySold = 0,                // Quantity sold
  status = 'New', // Possible statuses: 'New', 'Germination', 'Germinated', 'PlantedOut', 'Growing', 'Harvested', 'ReadyForSale', 'SoldOut', 'Archived',
  qualityGrade = 'UNGRADED',
  qcHistory = [],
  seedsSown = 0,
  calculatedGerminationRate = null,
  daysToGermination = null,
  chemicalApplicationHistory = [], // New
}) => {
  if (!batchId) throw new Error('Batch ID is required for PlantBatch.');
  // Add other basic validations if necessary for core fields like year, supplierCode, etc.
  if (typeof seedsSown !== 'number' || seedsSown < 0) {
    throw new Error('Seeds sown must be a non-negative number.');
  }

  const currentInventory = totalSuccessfullyGerminated - quantityPlantedOut - quantityLost - quantitySold;

  return {
    batchId,
    year,
    supplierCode,
    plantVarietyCode,
    sequenceNumber,
    creationDate: creationDate || new Date().toISOString(),
    sourceSeedBatchId,

    totalSuccessfullyGerminated,
    quantityPlantedOut,
    quantityLost,
    quantitySold,
    currentInventory, // This is a calculated field based on others
    status,
    qualityGrade,
    qcHistory,
    seedsSown,
    calculatedGerminationRate,
    daysToGermination,
    chemicalApplicationHistory, // Add to return

    // Future ISO 9001 related fields can be added here
    // e.g., qcPerformedDate, nextAuditDate
  };
};

// Example usage (conceptual):
// const newBatch = createPlantBatch({
//   batchId: '2024-XYZ-PLA-001', // Example Batch ID
//   year: 2024,
//   supplierCode: 'XYZ',
//   plantVarietyCode: 'PLA',
//   sequenceNumber: 1,
//   seedsSown: 500, // Example of seeds sown
//   // creationDate will default to now
//   // sourceSeedBatchId can be null or a string
//   totalSuccessfullyGerminated: 0, // Initially 0
//   quantityPlantedOut: 0, // Initially 0
//   status: 'New', // Initial status
//   // qualityGrade will default to 'UNGRADED'
//   // qcHistory will default to []
//   // calculatedGerminationRate will be null initially
//   // daysToGermination will be null initially
//   // chemicalApplicationHistory will default to []
// });
// console.log(newBatch);
// console.log('Initial current inventory:', newBatch.currentInventory);
// console.log('Initial quality grade:', newBatch.qualityGrade);
// console.log('Seeds Sown:', newBatch.seedsSown);
// console.log('Chemical App History:', newBatch.chemicalApplicationHistory);

export { createPlantBatch };
