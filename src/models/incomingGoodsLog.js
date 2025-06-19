// src/models/incomingGoodsLog.js

// Defines the structure for an IncomingGoodsLog, used for recording items received.

/**
 * @typedef {Object} ReceivedItem
 * @property {string} [poItemIdRef] - Optional reference to the PurchaseOrderItem's poItemId, if this item was part of a PO.
 * @property {string} itemNameReceived - Name or description of the item as identified upon receipt.
 * @property {number} [quantityExpected] - Optional quantity expected (e.g., from a PO).
 * @property {number} quantityReceived - The actual quantity received.
 * @property {string} unitOfMeasure - Unit for quantityReceived (e.g., "pieces", "kg", "liters", "bags").
 * @property {string} [batchNumberOrLotCode] - Supplier's batch number or lot code for traceability, if applicable.
 * @property {string} [itemExpiryDate] - Expiry date of the received item, if applicable (ISO string).
 * @property {'Accepted' | 'AcceptedWithRemarks' | 'Rejected' | 'PendingInspection'} inspectionStatus - Initial inspection outcome for this item.
 * @property {string} [inspectionNotes] - Optional notes specific to this item's inspection (e.g., "Slight damage to packaging, contents okay", "1 of 10 items rejected due to spoilage").
 * @property {string} [storageLocationId] - Optional ID or description of where this item was stored after receipt.
 */

/**
 * @typedef {'Complete' | 'Partial' | 'Damaged' | 'Incorrect' | 'PendingFullInspection'} OverallShipmentStatus
 */

/**
 * Creates an IncomingGoodsLog object.
 *
 * @param {Object} params - The parameters for creating an incoming goods log.
 * @param {string} params.incomingLogId - Unique ID for this log entry.
 * @param {string} [params.poId] - Optional Purchase Order ID this delivery relates to.
 * @param {string} params.supplierId - Foreign key to the Supplier model (who delivered the items).
 * @param {string} [params.shipmentReference] - Optional shipment reference (e.g., tracking number, delivery docket number).
 * @param {string} params.deliveryDate - ISO string for the date goods were received.
 * @param {string} params.receivedBy - Name or ID of the employee who received the goods.
 * @param {Array<ReceivedItem>} params.itemsReceived - Array of ReceivedItem objects detailing each item in the shipment.
 * @param {OverallShipmentStatus} params.overallShipmentStatus - Overall status of the received shipment.
 * @param {string} [params.notes] - Optional general notes about the entire shipment or delivery.
 * @returns {Object} The created incoming goods log object.
 * @throws {Error} if essential fields like incomingLogId, supplierId, deliveryDate, receivedBy, itemsReceived, or overallShipmentStatus are missing or invalid.
 */
const createIncomingGoodsLog = ({
  incomingLogId,
  poId = null,
  supplierId,
  shipmentReference = '',
  deliveryDate,
  receivedBy,
  itemsReceived,
  overallShipmentStatus,
  notes = '',
}) => {
  if (!incomingLogId || incomingLogId.trim() === '') throw new Error('Incoming Log ID is required.');
  if (!supplierId || supplierId.trim() === '') throw new Error('Supplier ID is required.');
  if (!deliveryDate) throw new Error('Delivery date is required.');
  if (!receivedBy || receivedBy.trim() === '') throw new Error('Receiver name/ID (receivedBy) is required.');
  if (!itemsReceived || !Array.isArray(itemsReceived) || itemsReceived.length === 0) {
    throw new Error('Items received are required and must be a non-empty array.');
  }
  for (const item of itemsReceived) {
    if (!item.itemNameReceived || typeof item.itemNameReceived !== 'string' || item.itemNameReceived.trim() === '') {
        throw new Error('itemNameReceived is required for each received item.');
    }
    if (typeof item.quantityReceived !== 'number' || item.quantityReceived < 0) { // Allow 0 if nothing of an expected item arrived
        throw new Error(`quantityReceived for '${item.itemNameReceived}' must be a non-negative number.`);
    }
    if (!item.unitOfMeasure || typeof item.unitOfMeasure !== 'string' || item.unitOfMeasure.trim() === '') {
        throw new Error(`unitOfMeasure is required for item '${item.itemNameReceived}'.`);
    }
    const validInspectionStatuses = ['Accepted', 'AcceptedWithRemarks', 'Rejected', 'PendingInspection'];
    if (!item.inspectionStatus || !validInspectionStatuses.includes(item.inspectionStatus)) {
        throw new Error(`Invalid inspectionStatus for '${item.itemNameReceived}'. Must be one of: ${validInspectionStatuses.join(', ')}.`);
    }
  }
  const validOverallStatuses = ['Complete', 'Partial', 'Damaged', 'Incorrect', 'PendingFullInspection'];
  if (!overallShipmentStatus || !validOverallStatuses.includes(overallShipmentStatus)) {
    throw new Error(`Invalid overallShipmentStatus. Must be one of: ${validOverallStatuses.join(', ')}.`);
  }

  return {
    incomingLogId: incomingLogId.trim().toUpperCase(),
    poId: poId ? poId.trim().toUpperCase() : null,
    supplierId: supplierId.trim(),
    shipmentReference: shipmentReference.trim(),
    deliveryDate, // Store as ISO string
    receivedBy: receivedBy.trim(),
    itemsReceived: itemsReceived.map(item => ({
      poItemIdRef: (item.poItemIdRef || '').trim() || null,
      itemNameReceived: item.itemNameReceived.trim(),
      quantityExpected: typeof item.quantityExpected === 'number' ? item.quantityExpected : null,
      quantityReceived: item.quantityReceived,
      unitOfMeasure: item.unitOfMeasure.trim(),
      batchNumberOrLotCode: (item.batchNumberOrLotCode || '').trim() || null,
      itemExpiryDate: item.itemExpiryDate || null, // Store as ISO string or null
      inspectionStatus: item.inspectionStatus,
      inspectionNotes: (item.inspectionNotes || '').trim(),
      storageLocationId: (item.storageLocationId || '').trim() || null,
    })),
    overallShipmentStatus,
    notes: notes.trim(),
    createdAt: new Date().toISOString(),
  };
};

// Example Usage (Conceptual)
// try {
//   const receivedItemsExample = [
//     { itemNameReceived: 'Lavender Seeds - English Variety (Lot #LAVENG-2024A)', quantityExpected: 5000, quantityReceived: 5000, unitOfMeasure: 'seeds', batchNumberOrLotCode: 'LOT-LAV2024A1', itemExpiryDate: '2026-06-30', inspectionStatus: 'Accepted', storageLocationId: 'SeedFridge-ShelfA' },
//     { itemNameReceived: 'Terracotta Pots - 4 inch', quantityExpected: 200, quantityReceived: 198, unitOfMeasure: 'pieces', inspectionStatus: 'AcceptedWithRemarks', inspectionNotes: '2 pots broken in transit.', storageLocationId: 'DryStore-Pots-Area1' }
//   ];
//   const goodsLog = createIncomingGoodsLog({
//     incomingLogId: `RECV-${Date.now()}`,
//     poId: 'PO-2024-07-001',
//     supplierId: 'SUP-SEEDCO-001',
//     deliveryDate: new Date().toISOString(),
//     receivedBy: 'Warehouse Team Lead',
//     itemsReceived: receivedItemsExample,
//     overallShipmentStatus: 'Partial', // Because 2 pots were broken, or if an item was missing
//     notes: 'Shipment arrived on pallet. Two pots noted as broken.'
//   });
//   console.log(goodsLog);
// } catch(e) {
//   console.error(e.message);
// }

export { createIncomingGoodsLog };
// ReceivedItem is documented via JSDoc and used directly by createIncomingGoodsLog.
