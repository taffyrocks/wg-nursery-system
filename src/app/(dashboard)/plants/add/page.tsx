'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { addPlant } from '@/lib/firestore';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';

export default function AddPlant() {
  const [formData, setFormData] = useState({
    scientificName: '',
    commonName: '',
    description: '',
    careInstructions: '',
    growingTimeDays: 0,
    price: 0,
    cost: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'growingTimeDays' || name === 'price' || name === 'cost' 
        ? parseFloat(value) || 0 
        : value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await addPlant(formData);
      router.push('/plants');
    } catch (error) {
      console.error('Error adding plant:', error);
      setError('Failed to add plant. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Link href="/plants" className="p-2 rounded-full hover:bg-gray-200">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-bold">Add New Plant</h1>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="commonName" className="block text-sm font-medium text-gray-700">
              Common Name
            </label>
            <input
              type="text"
              id="commonName"
              name="commonName"
              required
              value={formData.commonName}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm"
            />
          </div>
          
          <div>
            <label htmlFor="scientificName" className="block text-sm font-medium text-gray-700">
              Scientific Name
            </label>
            <input
              type="text"
              id="scientificName"
              name="scientificName"
              required
              value={formData.scientificName}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm"
            />
          </div>
          
          <div className="md:col-span-2">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              value={formData.description}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm"
            />
          </div>
          
          <div className="md:col-span-2">
            <label htmlFor="careInstructions" className="block text-sm font-medium text-gray-700">
              Care Instructions
            </label>
            <textarea
              id="careInstructions"
              name="careInstructions"
              rows={3}
              value={formData.careInstructions}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm"
            />
          </div>
          
          <div>
            <label htmlFor="growingTimeDays" className="block text-sm font-medium text-gray-700">
              Growing Time (days)
            </label>
            <input
              type="number"
              id="growingTimeDays"
              name="growingTimeDays"
              min="0"
              required
              value={formData.growingTimeDays}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm"
            />
          </div>
          
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700">
              Retail Price ($)
            </label>
            <input
              type="number"
              id="price"
              name="price"
              min="0"
              step="0.01"
              required
              value={formData.price}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm"
            />
          </div>
          
          <div>
            <label htmlFor="cost" className="block text-sm font-medium text-gray-700">
              Cost ($)
            </label>
            <input
              type="number"
              id="cost"
              name="cost"
              min="0"
              step="0.01"
              required
              value={formData.cost}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm"
            />
          </div>
        </div>
        
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? 'Saving...' : (
              <>
                <Save className="h-5 w-5" />
                Save Plant
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
