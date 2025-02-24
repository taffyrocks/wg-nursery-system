'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { Search, Plus } from 'lucide-react';
import Link from 'next/link';

// Sample plants data
const samplePlants = [
  {
    scientificName: "Monstera deliciosa",
    commonName: "Swiss Cheese Plant",
    description: "Popular houseplant with large, glossy leaves with natural holes",
    careInstructions: "Bright indirect light. Water when top 2-3 inches of soil are dry.",
    growingTimeDays: 180,
    price: 24.99,
    cost: 12.50
  },
  {
    scientificName: "Ficus lyrata",
    commonName: "Fiddle Leaf Fig",
    description: "Tree-like plant with large, violin-shaped leaves",
    careInstructions: "Bright indirect light. Water when top inch of soil is dry.",
    growingTimeDays: 240,
    price: 34.99,
    cost: 17.50
  },
  {
    scientificName: "Strelitzia nicolai",
    commonName: "Giant Bird of Paradise",
    description: "Dramatic plant with large banana-like leaves",
    careInstructions: "Bright direct light. Keep soil consistently moist.",
    growingTimeDays: 365,
    price: 89.99,
    cost: 45.00
  }
];

export default function PlantsPage() {
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const initializePlants = async () => {
      try {
        const plantsRef = collection(db, 'plants');
        const snapshot = await getDocs(plantsRef);
        
        if (snapshot.empty) {
          // Add sample plants if none exist
          for (const plant of samplePlants) {
            await addDoc(plantsRef, {
              ...plant,
              createdAt: new Date()
            });
          }
          
          // Fetch newly added plants
          const newSnapshot = await getDocs(plantsRef);
          setPlants(newSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        } else {
          // Use existing plants
          setPlants(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        }
      } catch (error) {
        console.error('Error initializing plants:', error);
      } finally {
        setLoading(false);
      }
    };

    initializePlants();
  }, []);

  const filteredPlants = plants.filter(plant =>
    plant.commonName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    plant.scientificName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Plants</h1>
        <Link 
          href="/plants/add" 
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          <Plus className="h-5 w-5" />
          Add New Plant
        </Link>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
        <input
          type="text"
          placeholder="Search plants..."
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
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plant</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Growing Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cost</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPlants.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                    No plants found
                  </td>
                </tr>
              ) : (
                filteredPlants.map((plant) => (
                  <tr key={plant.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{plant.commonName}</div>
                      <div className="text-sm text-gray-500">{plant.scientificName}</div>
                      <div className="text-sm text-gray-500">{plant.description}</div>
                    </td>
                    <td className="px-6 py-4">{plant.growingTimeDays} days</td>
                    <td className="px-6 py-4">${plant.price.toFixed(2)}</td>
                    <td className="px-6 py-4">${plant.cost.toFixed(2)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
