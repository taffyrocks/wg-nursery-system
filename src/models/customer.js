// src/models/customer.js

// Defines the structure for a Customer.

/**
 * Creates a Customer object.
 *
 * @param {Object} params - The parameters for creating a customer.
 * @param {string} params.customerId - Unique ID for the customer (e.g., CUST-timestamp or UUID).
 * @param {string} params.name - Name of the customer.
 * @param {string} [params.email] - Customer's email address (optional).
 * @param {string} [params.phone] - Customer's phone number (optional).
 * @param {string} [params.address] - Customer's physical address (optional).
 * @param {string} [params.notes] - Any relevant notes about the customer (optional).
 * @returns {Object} The created customer object.
 * @throws {Error} if customerId or name are missing.
 */
const createCustomer = ({
  customerId,
  name,
  email = '',
  phone = '',
  address = '',
  notes = '',
}) => {
  if (!customerId || customerId.trim() === '') {
    throw new Error('Customer ID is required.');
  }
  if (!name || name.trim() === '') {
    throw new Error('Customer name is required.');
  }

  return {
    customerId,
    name: name.trim(),
    email: email.trim(),
    phone: phone.trim(),
    address: address.trim(),
    notes: notes.trim(),
    createdAt: new Date().toISOString(),
    // Future fields could include:
    // - purchaseHistory (array of saleIds)
    // - loyaltyPoints
    // - preferredContactMethod
  };
};

// Example usage (conceptual):
// const newCustomer = createCustomer({
//   customerId: `CUST-${Date.now()}`, // Simple unique ID generation
//   name: 'John Doe',
//   email: 'john.doe@example.com',
//   phone: '555-1234'
// });
// console.log(newCustomer);

// const anotherCustomer = createCustomer({
//   customerId: `CUST-${Date.now() + 1}`,
//   name: 'Jane Smith Trading Co.'
// });
// console.log(anotherCustomer);


export { createCustomer };
