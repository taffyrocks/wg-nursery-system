'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { Search, Plus } from 'lucide-react';
import Link from 'next/link';

const sampleInventory = [
  {
    scientificName: "Monstera deliciosa",
    commonName: "Swiss Cheese Plant",
    quantity: 25,
    location: "Greenhouse A",
    price: 29.99
  },
  {
    scientificName: "Ficus lyrata",
    commonName: "Fiddle Leaf Fig",
    quantity: 15,
    location: "Greenhouse B",
    price: 49.99
  }
];

export default function InventoryPage() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const initializeInventory = async () => {
      try {
        const inventoryRef = collection(db, 'inventory');
        const snapshot = await getDocs(inventoryRef);
        
        if (snapshot.empty) {
          // Add sample inventory if none exists
          for (const item of sampleInventory) {
            await addDoc(inventoryRef, {
              ...item,
              lastUpdated: new Date()
            });
          }
          
          // Fetch newly added items
          const newSnapshot = await getDocs(inventoryRef);
          setInventory(newSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        } else {
          // Use existing inventory
          setInventory(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        }
      } catch (error) {
        console.error('Error initializing inventory:', error);
        alert('Failed to load inventory. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    initializeInventory();
  }, []);

  const filteredInventory = inventory.filter(item =>
    item.commonName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.scientificName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Inventory</h1>
        <Link 
          href="/inventory/add" 
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          <Plus className="h-5 w-5" />
          Add Item
        </Link>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
        <input
          type="text"
          placeholder="Search inventory..."
          className="pl-10 pr-4 py-2 w-full border rounded-lg"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      ) : (
        inventory.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No inventory items found.</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plant</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredInventory.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{item.commonName}</div>
                      <div className="text-sm text-gray-500">{item.scientificName}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-sm ${
                        item.quantity > 20 ? 'bg-green-100 text-green-800' :
                        item.quantity > 10 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {item.quantity}
                      </span>
                    </td>
                    <td className="px-6 py-4">{item.location}</td>
                    <td className="px-6 py-4">${item.price.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}
    </div>
  );
}
