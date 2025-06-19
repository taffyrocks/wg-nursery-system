// src/models/productOrService.js

// Defines the structure for a non-inventory Product or Service.

/**
 * Creates a ProductOrService object.
 * These are items sold by the nursery that are not tracked via batch inventory
 * (e.g., tools, supplies, consultation services).
 *
 * @param {Object} params - The parameters for creating a product or service.
 * @param {string} params.productId - Unique ID for the product/service (e.g., "PROD-GLOVES-L", "SERV-CONSULT-HR").
 * @param {string} params.name - Name of the product or service (e.g., "Gardening Gloves - Large", "Hourly Consultation").
 * @param {string} [params.description] - Optional detailed description.
 * @param {number} params.price - The selling price of the product/service.
 * @param {string} [params.category] - Optional category (e.g., "Tools", "Supplies", "Services", "Books").
 * @param {'PRODUCT' | 'SERVICE'} params.type - The type of item: 'PRODUCT' or 'SERVICE'.
 * @returns {Object} The created product or service object.
 * @throws {Error} if productId, name, price, or type are missing or invalid.
 */
const createProductOrService = ({
  productId,
  name,
  description = '',
  price,
  category = '',
  type,
}) => {
  if (!productId || productId.trim() === '') {
    throw new Error('Product/Service ID is required.');
  }
  if (!name || name.trim() === '') {
    throw new Error('Product/Service name is required.');
  }
  if (typeof price !== 'number' || price < 0) {
    // Price can be 0 for free promotional items/services, but not negative.
    throw new Error('Product/Service price must be a non-negative number.');
  }
  if (!type || (type !== 'PRODUCT' && type !== 'SERVICE')) {
    throw new Error("Product/Service type must be either 'PRODUCT' or 'SERVICE'.");
  }

  return {
    productId: productId.trim(),
    name: name.trim(),
    description: description.trim(),
    price: parseFloat(price.toFixed(2)), // Ensure price is stored with 2 decimal places
    category: category.trim(),
    type, // 'PRODUCT' or 'SERVICE'
    createdAt: new Date().toISOString(),
    // Future fields could include:
    // - supplierId (if it's a product bought for resale)
    // - stockKeepingUnit (SKU)
    // - taxable (boolean)
  };
};

// Example usage (conceptual):
// try {
//   const gloves = createProductOrService({
//     productId: 'PROD-GLOVES-RED-M',
//     name: 'Heavy Duty Gardening Gloves - Red, Medium',
//     description: 'Durable gloves for all gardening tasks.',
//     price: 12.99,
//     category: 'Tools & Apparel',
//     type: 'PRODUCT',
//   });
//   console.log(gloves);

//   const consultation = createProductOrService({
//     productId: 'SERV-DESIGNCONS-HOUR',
//     name: 'Garden Design Consultation (1hr)',
//     price: 75.00,
//     category: 'Services',
//     type: 'SERVICE',
//   });
//   console.log(consultation);
// } catch (e) {
//   console.error(e.message);
// }

export { createProductOrService };
