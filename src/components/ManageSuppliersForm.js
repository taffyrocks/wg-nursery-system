// src/components/ManageSuppliersForm.js
import React, { useState, useEffect } from 'react'; // Assuming React environment

// --- Placeholder Mocks ---
// Mock for createSupplier
const createSupplier_mock = (data) => {
  console.log("MOCK_SUPPLIER_FORM: Creating supplier with data:", data);
  if (!data.supplierId || !data.name || !data.email) {
    throw new Error("MOCK_SUPPLIER_FORM: Missing required fields for supplier.");
  }
  const defaultMetrics = { onTimeDeliveryRate: null, qualityRejectionRate: null, averageLeadTimeDays: null };
  return {
    ...data,
    supplierId: data.supplierId.toUpperCase(), // Standardize ID
    email: data.email.toLowerCase(),
    performanceMetrics: { ...defaultMetrics, ...(data.performanceMetrics || {}) },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
};

// Initial mock supplier data
const initialMockSuppliers = {
  "SUP-SEEDCO-001": { supplierId: "SUP-SEEDCO-001", name: "Reliable Seeds Co.", contactPerson: "Dr. Green Thumb", email: "sales@reliableseeds.example.com", phone: "555-0100", address: "123 Seed Row, Growville", suppliedItemCategories: ["Seeds", "Growing Media"], qualityRating: 'A-Excellent', performanceMetrics: { onTimeDeliveryRate: 98.5, qualityRejectionRate: 1.2, averageLeadTimeDays: 12 }, notes: "Net 30. High quality seeds." },
  "SUP-POTTERY-002": { supplierId: "SUP-POTTERY-002", name: "Pots & Planters Inc.", contactPerson: "Clay Potter", email: "orders@potsplanters.example.com", phone: "555-0200", address: "456 Terra Cotta Dr, Earthtown", suppliedItemCategories: ["Pots"], qualityRating: 'B-Good', performanceMetrics: { onTimeDeliveryRate: 95.0, qualityRejectionRate: 3.0, averageLeadTimeDays: 20 }, notes: "Good selection of terracotta." },
  "SUP-CHEMSOL-003": { supplierId: "SUP-CHEMSOL-003", name: "Chemical Solutions Ltd.", contactPerson: "", email: "info@chemsolutions.example.com", phone: "", address: "", suppliedItemCategories: ["Chemicals", "Fertilizers"], qualityRating: 'UNRATED', performanceMetrics: { onTimeDeliveryRate: null, qualityRejectionRate: null, averageLeadTimeDays: null }, notes: "New supplier, monitor closely." }
};
// --- End Mocks ---

const SUPPLIED_CATEGORIES_OPTIONS = ["Seeds", "Chemicals", "Growing Media", "Pots", "Tools", "Labels", "OtherSupplies", "Services"];
const QUALITY_RATING_OPTIONS = ['A-Excellent', 'B-Good', 'C-Average', 'D-BelowAverage', 'UNRATED'];

const ManageSuppliersForm = () => {
  const [suppliers, setSuppliers] = useState(initialMockSuppliers);
  const [newSupplier, setNewSupplier] = useState({
    supplierId: '', name: '', contactPerson: '', email: '', phone: '', address: '',
    suppliedItemCategories: [], qualityRating: QUALITY_RATING_OPTIONS[QUALITY_RATING_OPTIONS.length -1], // Default 'UNRATED'
    notes: ''
    // performanceMetrics will be defaulted by createSupplier_mock
  });

  const [editingSupplierId, setEditingSupplierId] = useState(null); // To load form for editing
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [errorFeedback, setErrorFeedback] = useState('');

  // Effect to load supplier data into form when editingSupplierId changes
  useEffect(() => {
    if (editingSupplierId && suppliers[editingSupplierId]) {
      const supToEdit = suppliers[editingSupplierId];
      setNewSupplier({ // Use newSupplier state for editing form as well
        supplierId: supToEdit.supplierId,
        name: supToEdit.name,
        contactPerson: supToEdit.contactPerson || '',
        email: supToEdit.email,
        phone: supToEdit.phone || '',
        address: supToEdit.address || '',
        suppliedItemCategories: Array.isArray(supToEdit.suppliedItemCategories) ? supToEdit.suppliedItemCategories : [],
        qualityRating: supToEdit.qualityRating,
        notes: supToEdit.notes || ''
      });
    } else {
      // Reset form if no longer editing or ID is invalid
      setNewSupplier({
        supplierId: '', name: '', contactPerson: '', email: '', phone: '', address: '',
        suppliedItemCategories: [], qualityRating: QUALITY_RATING_OPTIONS[QUALITY_RATING_OPTIONS.length -1], notes: ''
      });
    }
  }, [editingSupplierId, suppliers]);


  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === "suppliedItemCategories") {
      let newCategories = [...newSupplier.suppliedItemCategories];
      if (checked) {
        newCategories.push(value);
      } else {
        newCategories = newCategories.filter(cat => cat !== value);
      }
      setNewSupplier(prev => ({ ...prev, suppliedItemCategories: newCategories }));
    } else {
      setNewSupplier(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmitSupplier = () => {
    setErrorFeedback(''); setFeedbackMessage('');
    try {
      const supplierData = { ...newSupplier };
      const idToSubmit = supplierData.supplierId.toUpperCase();

      if (editingSupplierId && editingSupplierId !== idToSubmit) {
          throw new Error("Cannot change Supplier ID during edit. To change ID, create a new supplier.");
      }

      const mockSupplier = createSupplier_mock(supplierData); // Validation happens here

      // If editing, preserve existing performance metrics not covered by form
      let finalSupplierData = mockSupplier;
      if (editingSupplierId && suppliers[editingSupplierId] && suppliers[editingSupplierId].performanceMetrics) {
          finalSupplierData = {
              ...mockSupplier,
              performanceMetrics: suppliers[editingSupplierId].performanceMetrics,
              createdAt: suppliers[editingSupplierId].createdAt // Preserve original creation date
          };
      }
      finalSupplierData.updatedAt = new Date().toISOString();


      setSuppliers(prev => ({ ...prev, [idToSubmit]: finalSupplierData }));
      setFeedbackMessage(`Supplier '${finalSupplierData.name}' (${idToSubmit}) ${editingSupplierId ? 'updated' : 'added'} successfully.`);
      setEditingSupplierId(null); // Resets form via useEffect
    } catch (error) {
      console.error("Error saving supplier:", error);
      setErrorFeedback(`Error: ${error.message}`);
    }
  };

  const handleSelectForEdit = (supplierId) => {
    setEditingSupplierId(supplierId.toUpperCase());
    setFeedbackMessage(''); setErrorFeedback('');
  };

  const handleCancelEdit = () => {
    setEditingSupplierId(null); // Resets form via useEffect
    setFeedbackMessage(''); setErrorFeedback('');
  }

  return (
    /*
    <div>
      <h2>Manage Suppliers</h2>
      {feedbackMessage && <p style={{ color: 'green' }}>{feedbackMessage}</p>}
      {errorFeedback && <p style={{ color: 'red' }}>{errorFeedback}</p>}

      <section style={{ marginBottom: '20px', padding: '10px', border: '1px solid #ccc' }}>
        <h3>{editingSupplierId ? `Edit Supplier: ${editingSupplierId}` : "Add New Supplier"}</h3>
        <div><label>Supplier ID: <input type="text" name="supplierId" value={newSupplier.supplierId} onChange={handleInputChange} placeholder="e.g., SUP-XYZ-001" readOnly={!!editingSupplierId} /></label></div>
        <div><label>Name: <input type="text" name="name" value={newSupplier.name} onChange={handleInputChange} /></label></div>
        <div><label>Contact Person: <input type="text" name="contactPerson" value={newSupplier.contactPerson} onChange={handleInputChange} /></label></div>
        <div><label>Email: <input type="email" name="email" value={newSupplier.email} onChange={handleInputChange} /></label></div>
        <div><label>Phone: <input type="tel" name="phone" value={newSupplier.phone} onChange={handleInputChange} /></label></div>
        <div><label>Address: <textarea name="address" value={newSupplier.address} onChange={handleInputChange}></textarea></label></div>
        <fieldset><legend>Supplied Item Categories:</legend>
          {SUPPLIED_CATEGORIES_OPTIONS.map(cat => (
            <label key={cat} style={{ marginRight: '10px' }}>
              <input type="checkbox" name="suppliedItemCategories" value={cat} checked={newSupplier.suppliedItemCategories.includes(cat)} onChange={handleInputChange} /> {cat}
            </label>
          ))}
        </fieldset>
        <div>
          <label>Quality Rating:
            <select name="qualityRating" value={newSupplier.qualityRating} onChange={handleInputChange}>
              {QUALITY_RATING_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </label>
        </div>
        <div><label>Notes: <textarea name="notes" value={newSupplier.notes} onChange={handleInputChange}></textarea></label></div>
        <button onClick={handleSubmitSupplier} style={{marginTop:'10px'}}>{editingSupplierId ? "Update Supplier" : "Add Supplier"}</button>
        {editingSupplierId && <button onClick={handleCancelEdit} style={{marginTop:'10px', marginLeft: '10px'}}>Cancel Edit</button>}
      </section>

      <section>
        <h3>Current Suppliers (Mock View)</h3>
        {Object.values(suppliers).map(sup => (
          <div key={sup.supplierId} style={{ borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '10px' }}>
            <strong>{sup.name} ({sup.supplierId})</strong> - Rating: {sup.qualityRating}<br />
            Email: {sup.email}, Phone: {sup.phone || 'N/A'}<br />
            Categories: {sup.suppliedItemCategories.join(', ') || 'None specified'}<br />
            Performance (Conceptual):
              Delivery: {sup.performanceMetrics.onTimeDeliveryRate !== null ? `${sup.performanceMetrics.onTimeDeliveryRate}%` : 'N/A'},
              Rejection: {sup.performanceMetrics.qualityRejectionRate !== null ? `${sup.performanceMetrics.qualityRejectionRate}%` : 'N/A'} <br/>
            Notes: {sup.notes || 'N/A'}<br/>
            <button onClick={() => handleSelectForEdit(sup.supplierId)}>Edit Details / Rating</button>
          </div>
        ))}
      </section>
    </div>
    */
    null
  );
};

export { ManageSuppliersForm };
