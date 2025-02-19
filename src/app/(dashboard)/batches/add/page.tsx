'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getPlants, addBatch } from '@/lib/firestore';
import { ArrowLeft, CalendarIcon, Save } from 'lucide-react';
import Link from 'next/link';
import { Plant } from '@/types';

export default function AddBatch() {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [formData, setFormData] = useState({
    plantId: '',
    quantityPlanted: 0,
    plantingDate: new Date().toISOString().split('T')[0],
    expectedReadyDate: '',
    notes: '',
    status: 'planted'
  });
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchPlants = async () => {
      try {
        const plantsData = await getPlants();
        setPlants(plantsData);
        
        if (plantsData.length > 0) {
          // Set default plant and calculate expected ready date
          const defaultPlant = plantsData[0];
          const plantingDate = new Date();
          const expectedDate = new Date(plantingDate);
          expectedDate.setDate(expectedDate.getDate() + defaultPlant.growingTimeDays);
          
          setFormData({
            ...formData,
            plantId: defaultPlant.id,
            expectedReadyDate: expectedDate.toISOString().split('T')[0]
          });
        }
      } catch (error) {
        console.error('Error fetching plants:', error);
        setError('Failed to load plants. Please refresh the page.');
      } finally {
        setLoading(false);
      }
    };

    fetchPlants();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'plantId') {
      // Recalculate expected ready date when plant changes
      const selectedPlant = plants.find(plant => plant.id === value);
      if (selectedPlant) {
        const plantingDate = new Date(formData.plantingDate);
        const expectedDate = new Date(plantingDate);
        expectedDate.setDate(expectedDate.getDate() + selectedPlant.growingTimeDays);
        
        setFormData({
          ...formData,
          plantId: value,
          expectedReadyDate: expectedDate.toISOString().split('T')[0]
        });
      }
    } else if (name === 'plantingDate') {
      // Recalculate expected ready date when planting date changes
      const selectedPlant = plants.find(plant => plant.id === formData.plantId);
      if (selectedPlant) {
        const plantingDate = new Date(value);
        const expectedDate = new Date(plantingDate);
        expectedDate.setDate(expectedDate.getDate() + selectedPlant.growingTimeDays);
        
        setFormData({
          ...formData,
          plantingDate: value,
          expectedReadyDate: expectedDate.toISOString().split('T')[0]
        });
      }
    } else {
      setFormData({
        ...formData,
        [name]: name === 'quantityPlanted' ? parseInt(value) : value
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    
    try {
      await addBatch({
        ...formData,
        plantingDate: new Date(formData.plantingDate),
        expectedReadyDate: new Date(formData.expectedReadyDate)
      });
      router.push('/batches');
    } catch (error) {
      console.error('Error adding batch:', error);
      setError('Failed to add batch. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Link href="/batches" className="p-2 rounded-full hover:bg-gray-200">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-bold">Start New Batch</h1>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="plantId" className="block text-sm font-medium text-gray-700">
              Plant
            </label>
            <select
              id="plantId"
              name="plantId"
              required
              value={formData.plantId}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm"
            >
              {plants.length === 0 ? (
                <option value="">No plants available</option>
              ) : (
                plants.map(plant => (
                  <option key={plant.id} value={plant.id}>
                    {plant.commonName} ({plant.scientificName})
                  </option>
                ))
              )}
            </select>
          </div>
          
          <div>
            <label htmlFor="quantityPlanted" className="block text-sm font-medium text-gray-700">
              Quantity Planted
            </label>
            <input
              type="number"
              id="quantityPlanted"
              name="quantityPlanted"
              min="1"
              required
              value={formData.quantityPlanted}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm"
            />
          </div>
          
          <div>
            <label htmlFor="plantingDate" className="block text-sm font-medium text-gray-700">
              Planting Date
            </label>
            <div className="relative">
              <input
                type="date"
                id="plantingDate"
                name="plantingDate"
                required
                value={formData.plantingDate}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm"
              />
              <CalendarIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            </div>
          </div>
          
          <div>
            <label htmlFor="expectedReadyDate" className="block text-sm font-medium text-gray-700">
              Expected Ready Date
            </label>
            <div className="relative">
              <input
                type="date"
                id="expectedReadyDate"
                name="expectedReadyDate"
                required
                value={formData.expectedReadyDate}
                readOnly
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm bg-gray-50"
              />
              <CalendarIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Calculated based on plant growing time
            </p>
          </div>
          
          <div className="md:col-span-2">
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
              Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={3}
              value={formData.notes}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm"
            />
          </div>
        </div>
        
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={submitting || plants.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
          >
            {submitting ? 'Saving...' : (
              <>
                <Save className="h-5 w-5" />
                Start Batch
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
