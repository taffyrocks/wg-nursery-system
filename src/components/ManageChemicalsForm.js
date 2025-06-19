// src/components/ManageChemicalsForm.js
import React, { useState, useEffect } from 'react'; // Assuming React environment

// --- Placeholder Mocks ---
// Mock for createChemical
const createChemical_mock = (data) => {
  console.log("MOCK_CHEM_FORM: Creating chemical with data:", data);
  if (!data.chemicalId || !data.name || !data.activeIngredient || !data.chemicalType || !data.unitOfIssue || !data.purchaseDate || !data.expiryDate) {
    throw new Error("MOCK_CHEM_FORM: Missing required fields for chemical.");
  }
  return {
    ...data,
    chemicalId: data.chemicalId.toUpperCase(), // Standardize ID
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
};

// Initial mock chemical registry data
const initialMockChemicals = {
  "CHEM-NEEM-001": { chemicalId: "CHEM-NEEM-001", name: "Neem Oil Concentrate 70%", manufacturer: "GardenSafe", activeIngredient: "Azadirachtin", chemicalType: 'Pesticide', currentStockLiters: 4.5, currentStockKg: 0, unitOfIssue: "1L Bottle", purchaseDate: "2023-11-01", expiryDate: "2025-10-31", msdsUrl: "http://example.com/neem", ppeRequirements: ["Gloves", "Mask"], storageLocation: "Cabinet A", notes: "Organic" },
  "CHEM-FERT-GEN20": { chemicalId: "CHEM-FERT-GEN20", name: "General Purpose Fertilizer 20-20-20", manufacturer: "NutriGrow", activeIngredient: "NPK 20-20-20", chemicalType: 'Fertilizer', currentStockLiters: 0, currentStockKg: 18.0, unitOfIssue: "25kg Bag", purchaseDate: "2024-01-15", expiryDate: "2026-01-14", msdsUrl: "", ppeRequirements: ["Gloves"], storageLocation: "Shed B", notes: "" },
};
// --- End Mocks ---

const CHEMICAL_TYPES = ['Fungicide', 'Pesticide', 'Herbicide', 'Fertilizer', 'GrowthRegulator', 'Sanitizer', 'Other'];
const PPE_OPTIONS = ["Gloves", "Mask", "Goggles", "Face Shield", "Respirator", "Apron", "Full Suit"];


const ManageChemicalsForm = () => {
  // State for the list of chemicals (managed in this component's mock)
  const [chemicals, setChemicals] = useState(initialMockChemicals);

  // State for adding a new chemical
  const [newChem, setNewChem] = useState({
    chemicalId: '', name: '', manufacturer: '', activeIngredient: '', chemicalType: CHEMICAL_TYPES[0],
    currentStockLiters: '', currentStockKg: '', unitOfIssue: '', purchaseDate: '', expiryDate: '',
    msdsUrl: '', ppeRequirements: [], storageLocation: '', notes: ''
  });

  // State for updating stock
  const [updateStockChemId, setUpdateStockChemId] = useState('');
  const [stockUpdateAmount, setStockUpdateAmount] = useState('');
  const [stockUpdateType, setStockUpdateType] = useState('Liters'); // 'Liters' or 'Kg'

  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [errorFeedback, setErrorFeedback] = useState('');


  const handleNewChemChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === "ppeRequirements") {
      let newPpe = [...newChem.ppeRequirements];
      if (checked) {
        newPpe.push(value);
      } else {
        newPpe = newPpe.filter(ppe => ppe !== value);
      }
      setNewChem(prev => ({ ...prev, ppeRequirements: newPpe }));
    } else {
      setNewChem(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleAddChemical = () => {
    setErrorFeedback(''); setFeedbackMessage('');
    try {
      const chemicalData = {
        ...newChem,
        currentStockLiters: parseFloat(newChem.currentStockLiters) || 0,
        currentStockKg: parseFloat(newChem.currentStockKg) || 0,
        // ppeRequirements is already an array
      };
      if (chemicals[chemicalData.chemicalId.toUpperCase()]) {
        throw new Error(`Chemical with ID ${chemicalData.chemicalId.toUpperCase()} already exists.`);
      }
      const createdChemical = createChemical_mock(chemicalData);
      setChemicals(prev => ({ ...prev, [createdChemical.chemicalId]: createdChemical }));
      setFeedbackMessage(`Chemical '${createdChemical.name}' added successfully.`);
      // Reset newChem form
      setNewChem({
        chemicalId: '', name: '', manufacturer: '', activeIngredient: '', chemicalType: CHEMICAL_TYPES[0],
        currentStockLiters: '', currentStockKg: '', unitOfIssue: '', purchaseDate: '', expiryDate: '',
        msdsUrl: '', ppeRequirements: [], storageLocation: '', notes: ''
      });
    } catch (error) {
      console.error("Error adding chemical:", error);
      setErrorFeedback(`Error: ${error.message}`);
    }
  };

  const handleUpdateChemicalStock = () => {
    setErrorFeedback(''); setFeedbackMessage('');
    try {
      const chemId = updateStockChemId.toUpperCase();
      if (!chemicals[chemId]) {
        throw new Error(`Chemical with ID ${chemId} not found.`);
      }
      const amount = parseFloat(stockUpdateAmount);
      if (isNaN(amount) || amount < 0) {
        throw new Error("Invalid stock amount. Must be a positive number.");
      }

      const updatedChemical = { ...chemicals[chemId] };
      if (stockUpdateType === 'Liters') {
        updatedChemical.currentStockLiters = amount;
      } else { // Kg
        updatedChemical.currentStockKg = amount;
      }
      updatedChemical.updatedAt = new Date().toISOString();

      setChemicals(prev => ({ ...prev, [chemId]: updatedChemical }));
      setFeedbackMessage(`Stock for chemical '${chemId}' updated to ${amount} ${stockUpdateType}.`);
      setUpdateStockChemId(''); setStockUpdateAmount('');
    } catch (error) {
      console.error("Error updating stock:", error);
      setErrorFeedback(`Error: ${error.message}`);
    }
  };

  // Effect to pre-fill update form if a chemical ID is selected from list (conceptual)
  useEffect(() => {
      if (updateStockChemId && chemicals[updateStockChemId.toUpperCase()]) {
          const chem = chemicals[updateStockChemId.toUpperCase()];
          if (chem.currentStockLiters > 0) {
              setStockUpdateAmount(chem.currentStockLiters.toString());
              setStockUpdateType('Liters');
          } else if (chem.currentStockKg > 0) {
              setStockUpdateAmount(chem.currentStockKg.toString());
              setStockUpdateType('Kg');
          } else {
              setStockUpdateAmount(''); // No stock to prefill
          }
      } else {
          setStockUpdateAmount('');
      }
  }, [updateStockChemId, chemicals]);


  return (
    /*
    <div>
      <h2>Manage Chemical Registry</h2>
      {feedbackMessage && <p style={{ color: 'green' }}>{feedbackMessage}</p>}
      {errorFeedback && <p style={{ color: 'red' }}>{errorFeedback}</p>}

      <section style={{ marginBottom: '20px', padding: '10px', border: '1px solid #ccc' }}>
        <h3>Add New Chemical</h3>
        <div><label>Chemical ID: <input type="text" name="chemicalId" value={newChem.chemicalId} onChange={handleNewChemChange} placeholder="e.g., CHEM-XYZ-001" /></label></div>
        <div><label>Name: <input type="text" name="name" value={newChem.name} onChange={handleNewChemChange} /></label></div>
        <div><label>Manufacturer: <input type="text" name="manufacturer" value={newChem.manufacturer} onChange={handleNewChemChange} /></label></div>
        <div><label>Active Ingredient: <input type="text" name="activeIngredient" value={newChem.activeIngredient} onChange={handleNewChemChange} /></label></div>
        <div><label>Chemical Type: <select name="chemicalType" value={newChem.chemicalType} onChange={handleNewChemChange}>{CHEMICAL_TYPES.map(t => <option key={t} value={t}>{t}</option>)}</select></label></div>
        <div><label>Current Stock (Liters): <input type="number" name="currentStockLiters" value={newChem.currentStockLiters} onChange={handleNewChemChange} min="0" step="0.001" /></label></div>
        <div><label>Current Stock (Kg): <input type="number" name="currentStockKg" value={newChem.currentStockKg} onChange={handleNewChemChange} min="0" step="0.001" /></label></div>
        <div><label>Unit of Issue: <input type="text" name="unitOfIssue" value={newChem.unitOfIssue} onChange={handleNewChemChange} placeholder="e.g., 1L Bottle, 5kg Bag" /></label></div>
        <div><label>Purchase Date: <input type="date" name="purchaseDate" value={newChem.purchaseDate} onChange={handleNewChemChange} /></label></div>
        <div><label>Expiry Date: <input type="date" name="expiryDate" value={newChem.expiryDate} onChange={handleNewChemChange} /></label></div>
        <div><label>MSDS URL: <input type="url" name="msdsUrl" value={newChem.msdsUrl} onChange={handleNewChemChange} /></label></div>
        <div><label>Storage Location: <input type="text" name="storageLocation" value={newChem.storageLocation} onChange={handleNewChemChange} /></label></div>
        <fieldset><legend>PPE Requirements:</legend>
          {PPE_OPTIONS.map(ppe => (
            <label key={ppe} style={{ marginRight: '10px' }}>
              <input type="checkbox" name="ppeRequirements" value={ppe} checked={newChem.ppeRequirements.includes(ppe)} onChange={handleNewChemChange} /> {ppe}
            </label>
          ))}
        </fieldset>
        <div><label>Notes: <textarea name="notes" value={newChem.notes} onChange={handleNewChemChange}></textarea></label></div>
        <button onClick={handleAddChemical} style={{marginTop:'10px'}}>Add Chemical to Registry</button>
      </section>

      <section style={{ marginBottom: '20px', padding: '10px', border: '1px solid #ccc' }}>
        <h3>Update Chemical Stock</h3>
        <div><label>Chemical ID to Update: <input type="text" value={updateStockChemId} onChange={e => setUpdateStockChemId(e.target.value.toUpperCase())} placeholder="Select from list or type ID" /></label></div>
        <div>
            <label>Stock Type:
                <select value={stockUpdateType} onChange={e => setStockUpdateType(e.target.value)}>
                    <option value="Liters">Liters</option>
                    <option value="Kg">Kg</option>
                </select>
            </label>
        </div>
        <div><label>New Stock Amount: <input type="number" value={stockUpdateAmount} onChange={e => setStockUpdateAmount(e.target.value)} min="0" step="0.001" /></label></div>
        <button onClick={handleUpdateChemicalStock} style={{marginTop:'10px'}}>Set New Stock Level</button>
      </section>

      <section>
        <h3>Current Chemical Registry (Mock View)</h3>
        {Object.values(chemicals).map(chem => (
          <div key={chem.chemicalId} style={{ borderBottom: '1px solid #eee', paddingBottom: '5px', marginBottom: '5px' }}>
            <strong>{chem.name} ({chem.chemicalId})</strong> - Type: {chem.chemicalType} <br />
            Stock: {chem.currentStockLiters > 0 ? `${chem.currentStockLiters} L` : `${chem.currentStockKg} kg`} ({chem.unitOfIssue}) <br />
            Expires: {chem.expiryDate} <br />
            PPE: {chem.ppeRequirements.join(', ') || 'None specified'} <br />
            <button onClick={() => setUpdateStockChemId(chem.chemicalId)}>Select to Update Stock</button>
          </div>
        ))}
      </section>
    </div>
    */
    null
  );
};

export { ManageChemicalsForm };
