// src/models/purchaseOrder.js

// Defines structures for PurchaseOrderItems and PurchaseOrders.

/**
 * @typedef {Object} PurchaseOrderItem
 * @property {string} poItemId - Unique identifier for this item within the purchase order (e.g., a sequential number or a product code).
 * @property {string} itemName - Name of the item being ordered.
 * @property {string} [itemSpecification] - Detailed description, SKU, part number, or specific characteristics of the item.
 * @property {number} quantityOrdered - The quantity of this item being ordered.
 * @property {string} unitOfMeasure - The unit for the quantity (e.g., "pieces", "kg", "liters", "bags", "bottles").
 * @property {number} unitPrice - The price for one unit of the item.
 * @property {number} lineItemTotal - Calculated total for this line item (quantityOrdered * unitPrice).
 */

/**
 * @typedef {'Draft' | 'SubmittedToSupplier' | 'AcknowledgedBySupplier' | 'PartiallyReceived' | 'FullyReceived' | 'Invoiced' | 'Paid' | 'Cancelled'} PurchaseOrderStatus
 */

/**
 * Creates a PurchaseOrder object.
 *
 * @param {Object} params - The parameters for creating a purchase order.
 * @param {string} params.poId - Unique ID for the purchase order (e.g., "PO-2024-001").
 * @param {string} params.supplierId - Foreign key linking to the Supplier model.
 * @param {string} params.orderDate - ISO string for the date the order was placed.
 * @param {string} [params.expectedDeliveryDate] - Optional ISO string for the expected delivery date.
 * @param {PurchaseOrderStatus} [params.status='Draft'] - Current status of the purchase order.
 * @param {Array<PurchaseOrderItem>} params.itemsOrdered - Array of PurchaseOrderItem objects.
 * @param {number} [params.taxAmount=0] - Optional tax amount for the order.
 * @param {number} [params.shippingCost=0] - Optional shipping cost for the order.
 * @param {string} params.shippingAddress - Address where the order should be shipped.
 * @param {string} [params.billingAddress] - Optional billing address if different from shipping.
 * @param {string} [params.paymentTerms] - Optional payment terms (e.g., "Net 30", "Due on Receipt").
 * @param {string} [params.notes] - Optional notes for the purchase order.
 * @returns {Object} The created purchase order object.
 * @throws {Error} if essential fields like poId, supplierId, orderDate, itemsOrdered, or shippingAddress are missing or invalid.
 */
const createPurchaseOrder = ({
  poId,
  supplierId,
  orderDate,
  expectedDeliveryDate = null,
  status = 'Draft',
  itemsOrdered,
  taxAmount = 0,
  shippingCost = 0,
  shippingAddress,
  billingAddress = null,
  paymentTerms = '',
  notes = '',
}) => {
  if (!poId || poId.trim() === '') throw new Error('Purchase Order ID is required.');
  if (!supplierId || supplierId.trim() === '') throw new Error('Supplier ID is required.');
  if (!orderDate) throw new Error('Order date is required.'); // Could add ISO date validation
  if (!itemsOrdered || !Array.isArray(itemsOrdered) || itemsOrdered.length === 0) {
    throw new Error('Items ordered are required and must be a non-empty array.');
  }
  if (!shippingAddress || shippingAddress.trim() === '') {
    throw new Error('Shipping address is required.');
  }

  const validStatuses = ['Draft', 'SubmittedToSupplier', 'AcknowledgedBySupplier', 'PartiallyReceived', 'FullyReceived', 'Invoiced', 'Paid', 'Cancelled'];
  if (!validStatuses.includes(status)) {
    throw new Error(`Invalid PO status. Must be one of: ${validStatuses.join(', ')}.`);
  }
  if (typeof taxAmount !== 'number' || taxAmount < 0) throw new Error('Tax amount must be a non-negative number.');
  if (typeof shippingCost !== 'number' || shippingCost < 0) throw new Error('Shipping cost must be a non-negative number.');

  let calculatedSubtotal = 0;
  const processedItems = itemsOrdered.map((item, index) => {
    if (!item.itemName || typeof item.itemName !== 'string' || item.itemName.trim() === '') {
        throw new Error(`Item name is required for item at index ${index}.`);
    }
    if (typeof item.quantityOrdered !== 'number' || item.quantityOrdered <= 0) {
        throw new Error(`Quantity ordered for '${item.itemName}' must be a positive number.`);
    }
    if (!item.unitOfMeasure || typeof item.unitOfMeasure !== 'string' || item.unitOfMeasure.trim() === '') {
        throw new Error(`Unit of measure is required for item '${item.itemName}'.`);
    }
    if (typeof item.unitPrice !== 'number' || item.unitPrice < 0) {
        throw new Error(`Unit price for '${item.itemName}' must be a non-negative number.`);
    }

    const lineItemTotal = item.quantityOrdered * item.unitPrice;
    calculatedSubtotal += lineItemTotal;

    return {
      poItemId: item.poItemId || `ITEM-${index + 1}`, // Generate a simple sequential ID if not provided
      itemName: item.itemName.trim(),
      itemSpecification: (item.itemSpecification || '').trim(),
      quantityOrdered: item.quantityOrdered,
      unitOfMeasure: item.unitOfMeasure.trim(),
      unitPrice: parseFloat(item.unitPrice.toFixed(2)),
      lineItemTotal: parseFloat(lineItemTotal.toFixed(2)),
    };
  });

  const calculatedTotalOrderAmount = calculatedSubtotal + taxAmount + shippingCost;

  return {
    poId: poId.trim().toUpperCase(), // Standardize PO ID
    supplierId: supplierId.trim(),
    orderDate, // Store as ISO string
    expectedDeliveryDate, // Store as ISO string or null
    status,
    itemsOrdered: processedItems,
    subtotalAmount: parseFloat(calculatedSubtotal.toFixed(2)),
    taxAmount: parseFloat(taxAmount.toFixed(2)),
    shippingCost: parseFloat(shippingCost.toFixed(2)),
    totalOrderAmount: parseFloat(calculatedTotalOrderAmount.toFixed(2)),
    shippingAddress: shippingAddress.trim(),
    billingAddress: billingAddress ? billingAddress.trim() : shippingAddress.trim(), // Default to shipping if not provided
    paymentTerms: paymentTerms.trim(),
    notes: notes.trim(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
};

// Example Usage (Conceptual)
// try {
//   const poItems = [
//     { poItemId: 'SEED-LAV01', itemName: 'Lavender Seeds - English Variety', itemSpecification: 'Lot #LAVENG-2024A, Min 85% Germination', quantityOrdered: 5000, unitOfMeasure: 'seeds', unitPrice: 0.02 },
//     { poItemId: 'POT-TERRA-4IN', itemName: 'Terracotta Pots - 4 inch', itemSpecification: 'Standard terracotta, breathable', quantityOrdered: 200, unitOfMeasure: 'pieces', unitPrice: 0.75 }
//   ];
//   const newPO = createPurchaseOrder({
//     poId: 'PO-2024-07-001',
//     supplierId: 'SUP-SEEDCO-001',
//     orderDate: new Date().toISOString(),
//     expectedDeliveryDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // Approx 2 weeks later
//     itemsOrdered: poItems,
//     taxAmount: 20.00, // Example tax
//     shippingCost: 15.00,
//     shippingAddress: 'Worn Gundidj Nursery, 123 Main St, Plant Town, PL 45678',
//     paymentTerms: 'Net 30 days'
//   });
//   console.log(newPO);
//   // Expected lineItemTotal for seeds: 5000 * 0.02 = 100.00
//   // Expected lineItemTotal for pots: 200 * 0.75 = 150.00
//   // Expected subtotalAmount: 100 + 150 = 250.00
//   // Expected totalOrderAmount: 250 + 20 (tax) + 15 (shipping) = 285.00
// } catch(e) {
//   console.error(e.message);
// }

export { createPurchaseOrder };
// PurchaseOrderItem is documented via JSDoc and used directly by createPurchaseOrder.
