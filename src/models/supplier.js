// src/models/supplier.js

// Defines the structure for a Supplier.

/**
 * @typedef {'Seeds' | 'Chemicals' | 'Growing Media' | 'Pots' | 'Tools' | 'Labels' | 'OtherSupplies' | 'Services'} SupplierItemCategory
 */

/**
 * @typedef {'A-Excellent' | 'B-Good' | 'C-Average' | 'D-BelowAverage' | 'UNRATED'} SupplierQualityRating
 */

/**
 * Creates a Supplier object.
 *
 * @param {Object} params - The parameters for creating a supplier.
 * @param {string} params.supplierId - Unique ID for the supplier (e.g., "SUP-001").
 * @param {string} params.name - Name of the supplier company.
 * @param {string} [params.contactPerson] - Optional name of the main contact person.
 * @param {string} params.email - Supplier's primary contact email.
 * @param {string} [params.phone] - Optional supplier's phone number.
 * @param {string} [params.address] - Optional supplier's physical address.
 * @param {Array<SupplierItemCategory>} [params.suppliedItemCategories=[]] - Array of categories of items supplied.
 * @param {SupplierQualityRating} [params.qualityRating='UNRATED'] - Quality rating of the supplier.
 * @param {Object} [params.performanceMetrics={}] - Object to store performance metrics, initially empty.
 *        Expected structure: { onTimeDeliveryRate: number | null, qualityRejectionRate: number | null, averageLeadTimeDays: number | null }
 * @param {string} [params.notes] - Optional notes about the supplier (e.g., payment terms, relationship history).
 * @returns {Object} The created supplier object.
 * @throws {Error} if supplierId, name, or email are missing or invalid.
 */
const createSupplier = ({
  supplierId,
  name,
  contactPerson = '',
  email,
  phone = '',
  address = '',
  suppliedItemCategories = [],
  qualityRating = 'UNRATED',
  performanceMetrics = { // Initialize with null values for expected metrics
    onTimeDeliveryRate: null,
    qualityRejectionRate: null,
    averageLeadTimeDays: null,
  },
  notes = '',
}) => {
  if (!supplierId || supplierId.trim() === '') {
    throw new Error('Supplier ID is required.');
  }
  if (!name || name.trim() === '') {
    throw new Error('Supplier name is required.');
  }
  if (!email || email.trim() === '' || !email.includes('@')) { // Basic email format check
    throw new Error('A valid supplier email is required.');
  }

  const validRatings = ['A-Excellent', 'B-Good', 'C-Average', 'D-BelowAverage', 'UNRATED'];
  if (!validRatings.includes(qualityRating)) {
    throw new Error(`Invalid quality rating. Must be one of: ${validRatings.join(', ')}.`);
  }

  // Ensure performanceMetrics object has the expected null structure if partially provided or empty
  const defaultMetrics = { onTimeDeliveryRate: null, qualityRejectionRate: null, averageLeadTimeDays: null };
  const finalPerformanceMetrics = { ...defaultMetrics, ...performanceMetrics };


  return {
    supplierId: supplierId.trim().toUpperCase(), // Standardize ID format
    name: name.trim(),
    contactPerson: contactPerson.trim(),
    email: email.trim().toLowerCase(), // Standardize email format
    phone: phone.trim(),
    address: address.trim(),
    suppliedItemCategories: Array.isArray(suppliedItemCategories) ? suppliedItemCategories.map(cat => cat.trim()).filter(cat => cat) : [],
    qualityRating, // Already validated
    performanceMetrics: finalPerformanceMetrics,
    notes: notes.trim(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
};

// Example Usage (Conceptual)
// try {
//   const seedCo = createSupplier({
//     supplierId: 'SUP-SEEDCO-001',
//     name: 'Reliable Seeds Co.',
//     contactPerson: 'Dr. Green Thumb',
//     email: 'sales@reliableseeds.example.com',
//     phone: '555-0100',
//     suppliedItemCategories: ['Seeds', 'Growing Media'],
//     qualityRating: 'A-Excellent',
//     notes: 'Net 30 terms. Consistent high germination rates observed.'
//   });
//   console.log(seedCo);

//   const chemSup = createSupplier({
//     supplierId: 'SUP-CHEMSUP-002',
//     name: 'AgroChem Suppliers Inc.',
//     email: 'orders@agrochem.example.com',
//     suppliedItemCategories: ['Chemicals', 'Fertilizers'],
//     // performanceMetrics will default to { onTimeDeliveryRate: null, ... }
//   });
//   console.log(chemSup);
// } catch (e) {
//   console.error(e.message);
// }

export { createSupplier };
