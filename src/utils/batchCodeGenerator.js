// Utility function for generating batch codes

/**
 * Generates a batch code based on defined parameters.
 * Format: YYYY-SUP-VAR001-SEQ
 *
 * @param {number} year - The full year (e.g., 2024).
 * @param {string} supplierCode - The supplier code (e.g., 'ASC'). Expected to be 3 chars.
 * @param {string} plantVarietyCode - The plant variety code (e.g., 'EUC'). Expected to be 3 chars.
 * @param {number} sequenceNumber - The sequence number for this batch (e.g., 1).
 * @returns {string} The formatted batch code.
 * @throws {Error} if inputs are invalid.
 */
const generateBatchCode = (year, supplierCode, plantVarietyCode, sequenceNumber) => {
  if (!year || typeof year !== 'number' || year < 2000 || year > 2100) {
    throw new Error('Invalid year provided for batch code generation.');
  }
  if (!supplierCode || typeof supplierCode !== 'string' || supplierCode.trim().length === 0) {
    throw new Error('Invalid supplier code provided for batch code generation.');
  }
  if (!plantVarietyCode || typeof plantVarietyCode !== 'string' || plantVarietyCode.trim().length === 0) {
    throw new Error('Invalid plant variety code provided for batch code generation.');
  }
  if (sequenceNumber === undefined || typeof sequenceNumber !== 'number' || sequenceNumber < 1) {
    throw new Error('Invalid sequence number provided for batch code generation.');
  }

  // Normalize codes to uppercase and pad sequence number
  const normalizedSupplierCode = supplierCode.trim().toUpperCase();
  const normalizedPlantVarietyCode = plantVarietyCode.trim().toUpperCase();

  // Assuming variety code and supplier code should be a fixed length, e.g., 3 characters.
  // Add padding/truncation if necessary, or enforce it via validation.
  // For this example, let's assume they are provided correctly or handle as simple strings.

  const paddedSequenceNumber = String(sequenceNumber).padStart(3, '0');

  return `${year}-${normalizedSupplierCode}-${normalizedPlantVarietyCode}-${paddedSequenceNumber}`;
};

// Example Usage (conceptual):
// try {
//   const batchCode1 = generateBatchCode(2024, 'ASC', 'EUC', 1);
//   console.log(batchCode1); // Expected: 2024-ASC-EUC-001
//
//   const batchCode2 = generateBatchCode(2024, 'GREEN', 'ROSE', 123);
//   console.log(batchCode2); // Expected: 2024-GREEN-ROSE-123
// } catch (error) {
//   console.error('Error generating batch code:', error.message);
// }

export { generateBatchCode };
