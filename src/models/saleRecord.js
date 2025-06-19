// src/models/saleRecord.js

/**
 * @typedef {Object} ReceiptData
 * // ... (full ReceiptData JSDoc as defined previously) ...
 * @property {string} nurseryName Name of the nursery.
 * @property {string} [nurseryAddress] Physical address of the nursery.
 * @property {string} [nurseryContact] Phone number or email of the nursery.
 * @property {string} [nurseryLogoUrl] URL to the nursery's logo image.
 * @property {string} saleId Unique ID of the sale.
 * @property {string} saleDate Date and time of the sale.
 * @property {string} [customerId] ID of the customer, if available.
 * @property {string} [customerName] Name of the customer, if available.
 * @property {Array<Object>} items Array of items sold. Each item object should contain:
 * @property {string} items.itemName Description or name of the item (e.g., Plant Variety Code from PlantBatch).
 * @property {string} items.plantBatchId ID of the plant batch.
 * @property {number} items.quantity Quantity sold.
 * @property {number} items.pricePerUnit Price per unit before any item-specific discount.
 * @property {number} [items.itemDiscountAmount] Discount applied specifically to this item line (positive value).
 * @property {number} items.itemLineTotal Final price for this line item ((quantity * pricePerUnit) - itemDiscountAmount).
 * @property {number} subtotalBeforeDiscounts Sum of (quantity * pricePerUnit) for all items, before any discounts.
 * @property {number} totalItemDiscounts Sum of all itemDiscountAmounts.
 * @property {number} subtotalAfterItemDiscounts subtotalBeforeDiscounts - totalItemDiscounts.
 * @property {number} [overallSaleDiscountAmount] Discount applied to the entire sale (positive value).
 * @property {number} grandTotal Final amount to be paid (subtotalAfterItemDiscounts - overallSaleDiscountAmount).
 * @property {number} [taxAmount] Calculated tax amount (e.g., VAT/GST, if applicable. Conceptual for now).
 * @property {string} paymentDetails.paymentType Type of payment (e.g., 'CASH', 'CARD').
 * @property {number} paymentDetails.amountTendered Amount tendered by the customer.
 * @property {number} paymentDetails.changeGiven Change given back to the customer.
 * @property {string} [paymentDetails.transactionReference] Reference for non-cash transactions.
 * @property {string} [thankYouMessage] A thank you message.
 * @property {string} [termsAndConditionsLink] Link to terms and conditions or return policy.
 * @property {string} [cashierNameOrId] Identifier for the person who processed the sale.
 */

/**
 * Represents an item within a sale.
 * Can be a plant batch or a non-inventory product/service.
 * @typedef {Object} SaleItem
 * @property {'PLANT_BATCH' | 'PRODUCT' | 'SERVICE'} itemType - Type of the item being sold.
 * @property {string} itemId - The ID of the item (either a plantBatchId or a productId).
 * @property {string} itemName - Descriptive name of the item for the sale record/receipt.
 * @property {number} quantity - Number of units sold.
 * @property {number} pricePerUnit - Price for a single unit.
 * @property {number} [itemDiscount=0] - Discount applied specifically to this item line (non-negative value).
 * @property {number} lineTotal - Calculated total for this item ((quantity * pricePerUnit) - itemDiscount).
 */

/**
 * Creates a SaleRecord object.
 * Includes customer linkage, payment details, discount processing, and mixed item types.
 *
 * @param {Object} params - The parameters for creating a sale record.
 * @param {string} params.saleId - Unique ID for the sale.
 * @param {string} [params.saleDate] - Date of the sale, defaults to now.
 * @param {Array<SaleItem>} params.items - Array of SaleItem objects. Each item must include `itemType`, `itemId`, `itemName`, `quantity`, `pricePerUnit`, and can include an optional `itemDiscount`.
 * @param {string} [params.customerId] - Optional ID of the customer.
 * @param {Object} [params.paymentDetails={}] - Payment details for the sale.
 * @param {string} params.paymentDetails.paymentType - Type of payment.
 * @param {number} params.paymentDetails.amountTendered - Amount tendered by customer.
 * @param {string} [params.paymentDetails.transactionReference] - Optional transaction reference.
 * @param {number} [params.overallSaleDiscount=0] - Optional discount applied to the overall sale total (non-negative value).
 * @returns {Object} The created sale record.
 * @throws {Error} if essential fields are missing or invalid.
 */
const createSaleRecord = ({
  saleId,
  saleDate,
  items, // Expected to be an array of objects matching the SaleItem typedef
  customerId = null,
  paymentDetails = {},
  overallSaleDiscount = 0,
}) => {
  if (!saleId || saleId.trim() === '') {
    throw new Error('Sale ID is required.');
  }
  if (!items || !Array.isArray(items) || items.length === 0) {
    throw new Error('Sale items are required and must be a non-empty array.');
  }
  if (typeof overallSaleDiscount !== 'number' || overallSaleDiscount < 0) {
    throw new Error('Overall sale discount must be a non-negative number.');
  }

  let subtotalBeforeOverallDiscount = 0;
  const processedItems = items.map(item => {
    // Validate core item fields
    if (!item.itemId || typeof item.itemId !== 'string' || item.itemId.trim() === '') {
        throw new Error('Each sale item must have an itemId.');
    }
    if (!item.itemType || !['PLANT_BATCH', 'PRODUCT', 'SERVICE'].includes(item.itemType)) {
        throw new Error(`Invalid itemType '${item.itemType}' for item ID ${item.itemId}. Must be 'PLANT_BATCH', 'PRODUCT', or 'SERVICE'.`);
    }
    if (!item.itemName || typeof item.itemName !== 'string' || item.itemName.trim() === '') {
        throw new Error(`Each sale item (ID: ${item.itemId}) must have an itemName.`);
    }
    if (typeof item.quantity !== 'number' || item.quantity <= 0) {
        throw new Error(`Invalid quantity for item ID ${item.itemId}. Must be a positive number.`);
    }
    if (typeof item.pricePerUnit !== 'number' || item.pricePerUnit < 0) {
        throw new Error(`Invalid pricePerUnit for item ID ${item.itemId}. Must be a non-negative number.`);
    }

    const itemDiscount = (typeof item.itemDiscount === 'number' && item.itemDiscount >= 0) ? item.itemDiscount : 0;

    let itemBaseTotal = item.quantity * item.pricePerUnit;
    let itemLineTotal = itemBaseTotal - itemDiscount;
    itemLineTotal = Math.max(0, itemLineTotal); // Ensure line total isn't negative

    subtotalBeforeOverallDiscount += itemLineTotal;

    return {
      itemType: item.itemType,
      itemId: item.itemId.trim(),
      itemName: item.itemName.trim(),
      quantity: item.quantity,
      pricePerUnit: parseFloat(item.pricePerUnit.toFixed(2)),
      itemDiscount: parseFloat(itemDiscount.toFixed(2)),
      lineTotal: parseFloat(itemLineTotal.toFixed(2)),
    };
  });

  let finalTotalAmount = subtotalBeforeOverallDiscount - overallSaleDiscount;
  finalTotalAmount = Math.max(0, finalTotalAmount);

  const { paymentType, amountTendered, transactionReference = null } = paymentDetails;
  if (!paymentType || typeof paymentType !== 'string' || paymentType.trim() === '') {
    throw new Error('Payment type is required in paymentDetails.');
  }
  if (typeof amountTendered !== 'number' || amountTendered < 0) {
    throw new Error('Amount tendered must be a non-negative number in paymentDetails.');
  }

  let changeGiven = 0;
  if (amountTendered > finalTotalAmount) {
    changeGiven = parseFloat((amountTendered - finalTotalAmount).toFixed(2));
  }
  if (amountTendered < finalTotalAmount) {
    console.warn(`Sale ${saleId}: Amount tendered (${amountTendered}) is less than final total amount (${finalTotalAmount.toFixed(2)}) after discounts. Underpayment occurred.`);
  }

  const finalPaymentDetails = {
      paymentType: paymentType.trim().toUpperCase(),
      amountTendered: parseFloat(amountTendered.toFixed(2)),
      changeGiven, // Already toFixed(2) or 0
      transactionReference,
  };

  return {
    saleId,
    saleDate: saleDate || new Date().toISOString(),
    items: processedItems, // Now includes itemType, itemId, itemName
    subtotalBeforeOverallDiscount: parseFloat(subtotalBeforeOverallDiscount.toFixed(2)),
    overallSaleDiscount: parseFloat(overallSaleDiscount.toFixed(2)),
    totalAmount: parseFloat(finalTotalAmount.toFixed(2)),
    customerId: customerId ? customerId.trim() : null,
    paymentDetails: finalPaymentDetails,
  };
};

// Example usage (conceptual):
// const mixedSale = createSaleRecord({
//   saleId: 'sale-005',
//   items: [
//     { itemType: 'PLANT_BATCH', itemId: 'batch-G-333', itemName: 'Lavender Plant Batch G-333', quantity: 3, pricePerUnit: 7.50, itemDiscount: 1.50 }, // Line total: (3*7.50)-1.50 = 22.50-1.50 = 21.00
//     { itemType: 'PRODUCT', itemId: 'PROD-POTTINGSOIL-5L', itemName: 'Premium Potting Soil 5L Bag', quantity: 1, pricePerUnit: 12.00 } // Line total: 12.00
//   ],
//   overallSaleDiscount: 3.00, // Applied to (21+12) = 33. So, 33-3 = 30
//   paymentDetails: { paymentType: 'CARD', amountTendered: 30.00, transactionReference: 'txn_ghijk123'}
// });
// console.log(mixedSale);
// // Expected: subtotalBeforeOverallDiscount = 33.00
// // Expected: totalAmount = 30.00
// // Expected: changeGiven = 0.00

export { createSaleRecord };
