// src/models/inspectionRecord.js

// Defines structures for InspectionFindings and InspectionRecords.

/**
 * @typedef {Object} InspectionFinding
 * @property {string} parameterChecked - Specific aspect being inspected (e.g., "Leaf Color", "Root Development", "Presence of Aphids", "Surface Cleanliness").
 * @property {string} observationValue - The observed value or state (e.g., "Uniformly Green", "Healthy, white roots", "2 aphids found on 1 plant", "Surfaces wiped, no debris").
 * @property {'PASS' | 'FAIL' | 'OBSERVATION'} status - Status of this specific finding.
 *           'OBSERVATION' can be used for neutral notes or minor issues not constituting a fail.
 * @property {string} [notes] - Optional detailed notes for this specific finding.
 * @property {string} [correctiveActionSuggested] - Optional suggested corrective action for this finding.
 */

/**
 * Creates an InspectionRecord object.
 * Represents a formal inspection event for a plant batch or a location.
 *
 * @param {Object} params - The parameters for creating an inspection record.
 * @param {string} params.inspectionId - Unique ID for the inspection record.
 * @param {string} [params.plantBatchId] - Optional ID of the PlantBatch being inspected.
 * @param {string} [params.locationId] - Optional ID of the Location being inspected (e.g., a greenhouse section, propagation tray).
 *           At least one of plantBatchId or locationId should typically be provided.
 * @param {string} params.inspectionDate - ISO string for the date and time of the inspection.
 * @param {string} params.inspectorName - Name or ID of the person performing the inspection.
 * @param {string} params.inspectionType - Type of inspection (e.g., "Seedling Health - Week 2", "Greenhouse Sanitation Monthly Check", "Pest & Disease Sweep - Propagation").
 * @param {Array<InspectionFinding>} params.findings - Array of InspectionFinding objects detailing what was checked.
 * @param {'Satisfactory' | 'Needs Follow-up' | 'Unsatisfactory'} params.overallInspectionStatus - Overall outcome of the inspection.
 * @param {string} [params.summaryNotes] - Optional summary notes for the entire inspection.
 * @param {string} [params.followUpActionsCompleted] - Optional notes on any follow-up actions that were completed based on this inspection.
 * @returns {Object} The created inspection record object.
 * @throws {Error} if essential fields like inspectionId, inspectionDate, inspectorName, inspectionType, findings, or overallInspectionStatus are missing or invalid.
 */
const createInspectionRecord = ({
  inspectionId,
  plantBatchId = null,
  locationId = null,
  inspectionDate,
  inspectorName,
  inspectionType,
  findings,
  overallInspectionStatus,
  summaryNotes = '',
  followUpActionsCompleted = '',
}) => {
  if (!inspectionId || inspectionId.trim() === '') {
    throw new Error('Inspection ID is required.');
  }
  if (!plantBatchId && !locationId) {
    throw new Error('Either Plant Batch ID or Location ID must be provided for an inspection.');
  }
  if (!inspectionDate) { // Could also validate ISO format if needed
    throw new Error('Inspection date is required.');
  }
  if (!inspectorName || inspectorName.trim() === '') {
    throw new Error('Inspector name is required.');
  }
  if (!inspectionType || inspectionType.trim() === '') {
    throw new Error('Inspection type is required.');
  }
  if (!findings || !Array.isArray(findings) || findings.length === 0) {
    // Could add deeper validation for each finding object if necessary
    throw new Error('Findings are required and must be a non-empty array of InspectionFinding objects.');
  }
  for(const finding of findings) {
      if(!finding.parameterChecked || !finding.observationValue || !finding.status) {
          throw new Error('Each finding must have parameterChecked, observationValue, and status.');
      }
      if(!['PASS', 'FAIL', 'OBSERVATION'].includes(finding.status)) {
          throw new Error(`Invalid status '${finding.status}' in finding. Must be 'PASS', 'FAIL', or 'OBSERVATION'.`);
      }
  }
  if (!overallInspectionStatus || !['Satisfactory', 'Needs Follow-up', 'Unsatisfactory'].includes(overallInspectionStatus)) {
    throw new Error("Overall inspection status must be one of: 'Satisfactory', 'Needs Follow-up', 'Unsatisfactory'.");
  }

  return {
    inspectionId: inspectionId.trim(),
    plantBatchId: plantBatchId ? plantBatchId.trim() : null,
    locationId: locationId ? locationId.trim() : null,
    inspectionDate: inspectionDate || new Date().toISOString(), // Defaulting here too, though param is required
    inspectorName: inspectorName.trim(),
    inspectionType: inspectionType.trim(),
    findings: findings.map(f => ({ // Ensure findings are clean
        parameterChecked: f.parameterChecked.trim(),
        observationValue: f.observationValue.trim(),
        status: f.status,
        notes: (f.notes || '').trim(),
        correctiveActionSuggested: (f.correctiveActionSuggested || '').trim()
    })),
    overallInspectionStatus,
    summaryNotes: summaryNotes.trim(),
    followUpActionsCompleted: followUpActionsCompleted.trim(),
    createdAt: new Date().toISOString(),
  };
};

// Example Usage (Conceptual)
// const exampleFindings = [
//   { parameterChecked: "Leaf Color", observationValue: "Mostly green, some yellowing on lower leaves.", status: 'OBSERVATION', notes: "Possible nutrient deficiency." },
//   { parameterChecked: "Pest Presence (Aphids)", observationValue: "None detected.", status: 'PASS' },
//   { parameterChecked: "Soil Moisture", observationValue: "Adequate", status: 'PASS' }
// ];

// const newInspection = createInspectionRecord({
//   inspectionId: `INSP-${Date.now()}`,
//   plantBatchId: 'BATCH-001',
//   inspectionDate: new Date().toISOString(),
//   inspectorName: 'Jane Q. Inspector',
//   inspectionType: 'Seedling Health - Week 3',
//   findings: exampleFindings,
//   overallInspectionStatus: 'Needs Follow-up',
//   summaryNotes: 'Overall health good, but monitor for nutrient issues.'
// });
// console.log(newInspection);

export { createInspectionRecord };
// InspectionFinding is documented via JSDoc and used directly by createInspectionRecord.
