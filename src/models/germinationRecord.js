// Defines the structure for a GerminationRecord

// TODO: Consider using a class or a more formal constructor
const createGerminationRecord = ({
  recordId, // Should be unique, perhaps a UUID or DB-generated
  plantBatchId, // Foreign key linking to PlantBatch
  sampleSize,
  date,
  environmentalConditions = { temp: null, humidity: null }, // Default to null if not provided
  germinationCount,
  vigorAnalysisNotes = '' // Optional notes
}) => ({
  recordId,
  plantBatchId,
  sampleSize,
  date: date || new Date().toISOString(),
  environmentalConditions,
  germinationCount,
  vigorAnalysisNotes,
  // Future ISO 9001 related fields can be added here
  // e.g., passFailCriteria, testerId, retestDate
});

// Example usage (conceptual):
// const newRecord = createGerminationRecord({
//   recordId: 'some-unique-id', // This would typically be generated
//   plantBatchId: '2024-ASC-EUC001-001', // From an existing PlantBatch
//   sampleSize: 100,
//   environmentalConditions: { temp: 22, humidity: 60 },
//   germinationCount: 85,
//   vigorAnalysisNotes: 'Good vigor, consistent sprouting.',
// });

export { createGerminationRecord };
