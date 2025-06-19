// src/models/chemical.js

// Defines the structure for a Chemical in the registry.

/**
 * Creates a Chemical object for the registry.
 *
 * @param {Object} params - The parameters for creating a chemical entry.
 * @param {string} params.chemicalId - Unique ID for the chemical (e.g., "CHEM-NEEM-001").
 * @param {string} params.name - Common or trade name of the chemical (e.g., "Neem Oil Concentrate 70%").
 * @param {string} [params.manufacturer] - Optional manufacturer name.
 * @param {string} params.activeIngredient - Main active ingredient(s) (e.g., "Azadirachtin").
 * @param {'Fungicide' | 'Pesticide' | 'Herbicide' | 'Fertilizer' | 'GrowthRegulator' | 'Sanitizer' | 'Other'} params.chemicalType - The primary type or purpose of the chemical.
 * @param {number} [params.currentStockLiters=0] - Current stock if liquid, in Liters.
 * @param {number} [params.currentStockKg=0] - Current stock if solid/powder, in Kilograms.
 * @param {string} params.unitOfIssue - How the chemical is typically issued or bought (e.g., "1L Bottle", "5kg Bag", "250g Sachet").
 * @param {string} params.purchaseDate - ISO string for the date of purchase of this batch/stock.
 * @param {string} params.expiryDate - ISO string for the expiry date of this batch/stock.
 * @param {string} [params.msdsUrl] - Optional URL to the Material Safety Data Sheet (MSDS).
 * @param {Array<string>} [params.ppeRequirements=[]] - Array of strings listing required Personal Protective Equipment (e.g., ["Gloves", "Respirator", "Face Shield"]).
 * @param {string} [params.storageLocation] - Optional specific storage location (e.g., "Chemical Cabinet A", "Fertilizer Shed - Bay 2").
 * @param {string} [params.notes] - Optional notes (e.g., supplier details, re-order point).
 * @returns {Object} The created chemical object.
 * @throws {Error} if essential fields like chemicalId, name, activeIngredient, chemicalType, unitOfIssue, purchaseDate, or expiryDate are missing or invalid.
 */
const createChemical = ({
  chemicalId,
  name,
  manufacturer = '',
  activeIngredient,
  chemicalType,
  currentStockLiters = 0,
  currentStockKg = 0,
  unitOfIssue,
  purchaseDate,
  expiryDate,
  msdsUrl = '',
  ppeRequirements = [],
  storageLocation = '',
  notes = '',
}) => {
  if (!chemicalId || chemicalId.trim() === '') throw new Error('Chemical ID is required.');
  if (!name || name.trim() === '') throw new Error('Chemical name is required.');
  if (!activeIngredient || activeIngredient.trim() === '') throw new Error('Active ingredient is required.');
  const validTypes = ['Fungicide', 'Pesticide', 'Herbicide', 'Fertilizer', 'GrowthRegulator', 'Sanitizer', 'Other'];
  if (!chemicalType || !validTypes.includes(chemicalType)) {
    throw new Error(`Chemical type must be one of: ${validTypes.join(', ')}.`);
  }
  if (typeof currentStockLiters !== 'number' || currentStockLiters < 0) {
    throw new Error('Current stock (Liters) must be a non-negative number.');
  }
  if (typeof currentStockKg !== 'number' || currentStockKg < 0) {
    throw new Error('Current stock (Kg) must be a non-negative number.');
  }
  if (!unitOfIssue || unitOfIssue.trim() === '') {
    throw new Error('Unit of issue is required (e.g., "1L Bottle").');
  }
  if (!purchaseDate) throw new Error('Purchase date is required.'); // Could add ISO date validation
  if (!expiryDate) throw new Error('Expiry date is required.');   // Could add ISO date validation

  // Basic check to ensure that if it's primarily liquid, kg is 0, and vice-versa.
  // This is a simple business rule, could be more complex.
  if (currentStockLiters > 0 && currentStockKg > 0) {
      console.warn(`Warning: Chemical ${chemicalId} has stock in both Liters and Kg. Please ensure this is intended.`);
  }


  return {
    chemicalId: chemicalId.trim(),
    name: name.trim(),
    manufacturer: manufacturer.trim(),
    activeIngredient: activeIngredient.trim(),
    chemicalType,
    currentStockLiters: parseFloat(currentStockLiters.toFixed(3)), // e.g., 1.500 L
    currentStockKg: parseFloat(currentStockKg.toFixed(3)),     // e.g., 0.250 kg
    unitOfIssue: unitOfIssue.trim(),
    purchaseDate, // Store as ISO string
    expiryDate,   // Store as ISO string
    msdsUrl: msdsUrl.trim(),
    ppeRequirements: Array.isArray(ppeRequirements) ? ppeRequirements.map(ppe => ppe.trim()).filter(ppe => ppe) : [],
    storageLocation: storageLocation.trim(),
    notes: notes.trim(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(), // For tracking stock updates later
  };
};

// Example Usage (Conceptual)
// try {
//   const neemOil = createChemical({
//     chemicalId: 'CHEM-NEEMOIL-001',
//     name: 'Concentrated Neem Oil',
//     manufacturer: 'GardenSafe Organics',
//     activeIngredient: 'Azadirachtin (70%)',
//     chemicalType: 'Pesticide',
//     currentStockLiters: 5.0,
//     unitOfIssue: '1L Bottle',
//     purchaseDate: '2023-10-15',
//     expiryDate: '2025-10-14',
//     msdsUrl: 'http://example.com/msds/neemoil',
//     ppeRequirements: ['Gloves', 'Eye Protection'],
//     storageLocation: 'Flammables Cabinet Shelf 2',
//     notes: 'Organic, use within 6 months of opening.'
//   });
//   console.log(neemOil);

//   const slowFert = createChemical({
//     chemicalId: 'CHEM-FERTSR-002',
//     name: 'Slow Release Fertilizer Pellets 10-10-10',
//     activeIngredient: 'NPK 10-10-10',
//     chemicalType: 'Fertilizer',
//     currentStockKg: 22.5,
//     unitOfIssue: '25kg Bag',
//     purchaseDate: '2024-01-20',
//     expiryDate: '2027-01-19',
//     ppeRequirements: ['Gloves', 'Dust Mask (if handling large quantities)'],
//   });
//   console.log(slowFert);
// } catch (e) {
//   console.error(e.message);
// }

export { createChemical };
