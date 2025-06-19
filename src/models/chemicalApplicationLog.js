// src/models/chemicalApplicationLog.js

// Defines the structure for a ChemicalApplicationLog.

/**
 * Creates a ChemicalApplicationLog object.
 * Records details of when, where, how, and why a chemical was applied.
 *
 * @param {Object} params - The parameters for creating a chemical application log.
 * @param {string} params.applicationLogId - Unique ID for this application log entry.
 * @param {string} params.chemicalId - Foreign key linking to the Chemical model.
 * @param {string} params.applicationDate - ISO string for the date and time of application.
 * @param {string} params.targetDescription - General description of what was treated (e.g., "Rose Batch R001 and surrounding area", "All benches in Greenhouse 3", "Spot treatment on affected Hydrangeas").
 * @param {Array<string>} [params.plantBatchIds=[]] - Optional array of specific PlantBatch IDs targeted.
 * @param {Array<string>} [params.locationIds=[]] - Optional array of specific Location IDs targeted (e.g., greenhouse sections, field plots).
 * @param {number} params.quantityApplied - Amount of the (potentially diluted) chemical product applied.
 * @param {string} params.applicationUnit - Unit for `quantityApplied` (e.g., "mL", "L", "g", "kg", "L/ha", "g/sq.m"). This describes the amount of *product as applied*.
 * @param {string} [params.dilutionRate] - Optional dilution rate used (e.g., "10mL/L", "1:100").
 * @param {string} params.operatorName - Name or ID of the person who performed the application.
 * @param {string} params.reasonForApplication - Purpose of the application (e.g., "Preventative fungicide spray", "Aphid infestation control", "Weed control path A").
 * @param {string} [params.weatherConditions] - Optional brief description of weather if relevant (e.g., "Calm, 22°C, overcast").
 * @param {string} [params.notes] - Optional additional notes.
 * @returns {Object} The created chemical application log object.
 * @throws {Error} if essential fields are missing or invalid.
 */
const createChemicalApplicationLog = ({
  applicationLogId,
  chemicalId,
  applicationDate,
  targetDescription,
  plantBatchIds = [],
  locationIds = [],
  quantityApplied,
  applicationUnit,
  dilutionRate = '',
  operatorName,
  reasonForApplication,
  weatherConditions = '',
  notes = '',
}) => {
  if (!applicationLogId || applicationLogId.trim() === '') throw new Error('Application Log ID is required.');
  if (!chemicalId || chemicalId.trim() === '') throw new Error('Chemical ID is required.');
  if (!applicationDate) throw new Error('Application date is required.');
  if (!targetDescription || targetDescription.trim() === '') throw new Error('Target description is required.');
  if (typeof quantityApplied !== 'number' || quantityApplied <= 0) {
    throw new Error('Quantity applied must be a positive number.');
  }
  if (!applicationUnit || applicationUnit.trim() === '') {
    throw new Error('Application unit is required (e.g., "mL", "L/ha").');
  }
  if (!operatorName || operatorName.trim() === '') throw new Error('Operator name is required.');
  if (!reasonForApplication || reasonForApplication.trim() === '') throw new Error('Reason for application is required.');

  return {
    applicationLogId: applicationLogId.trim(),
    chemicalId: chemicalId.trim(),
    applicationDate: applicationDate || new Date().toISOString(), // Defaulting here, though param is required
    targetDescription: targetDescription.trim(),
    plantBatchIds: Array.isArray(plantBatchIds) ? plantBatchIds.map(id => id.trim()).filter(id => id) : [],
    locationIds: Array.isArray(locationIds) ? locationIds.map(id => id.trim()).filter(id => id) : [],
    quantityApplied: parseFloat(quantityApplied.toFixed(3)), // Store with some precision
    applicationUnit: applicationUnit.trim(),
    dilutionRate: dilutionRate.trim(),
    operatorName: operatorName.trim(),
    reasonForApplication: reasonForApplication.trim(),
    weatherConditions: weatherConditions.trim(),
    notes: notes.trim(),
    createdAt: new Date().toISOString(),
  };
};

// Example Usage (Conceptual)
// try {
//   const appLog1 = createChemicalApplicationLog({
//     applicationLogId: `CHEMAPP-${Date.now()}`,
//     chemicalId: 'CHEM-NEEMOIL-001',
//     applicationDate: new Date().toISOString(),
//     targetDescription: 'Preventative spray on Rose Batch R001',
//     plantBatchIds: ['BATCH-R001'],
//     quantityApplied: 500,
//     applicationUnit: 'mL',
//     dilutionRate: '10mL/L',
//     operatorName: 'John Gardener',
//     reasonForApplication: 'Aphid prevention',
//     weatherConditions: 'Cloudy, 18C, light breeze from SW'
//   });
//   console.log(appLog1);

//   const appLog2 = createChemicalApplicationLog({
//     applicationLogId: `CHEMAPP-${Date.now()+1}`,
//     chemicalId: 'CHEM-WEEDKILL-GLYPHO-001', // Assuming a glyphosate weedkiller
//     applicationDate: new Date().toISOString(),
//     targetDescription: 'Weed control on pathways around Greenhouse 2',
//     locationIds: ['GH2-PATH-NORTH', 'GH2-PATH-WEST'],
//     quantityApplied: 2.5,
//     applicationUnit: 'L/ha', // Liters per hectare
//     operatorName: 'Jane Gardener',
//     reasonForApplication: 'Pathway weed clearance',
//   });
//   console.log(appLog2);
// } catch(e) {
//   console.error(e.message);
// }

export { createChemicalApplicationLog };
