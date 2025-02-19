'use client';

import { useState, useEffect } from 'react';
import { getBatches, getPlants } from '@/lib/firestore';
import Link from 'next/link';
import { Plus, Filter, Search, ArrowRight } from 'lucide-react';
import { GrowingBatch, Plant } from '@/types';

export default function BatchesPage() {
  const [batches, setBatches] = useState<GrowingBatch[]>([]);
  const [plants, setPlants] = useState<Record<string, Plant>>({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [batchesData, plantsData] = await Promise.all([
          getBatches(),
          getPlants()
        ]);
        
        // Create a map of plants by id for easy lookup
        const plantsMap = plantsData.reduce((acc, plant) => {
          acc[plant.id] = plant;
          return acc;
        }, {} as Record<string, Plant>);
        
        setBatches(batchesData);
        setPlants(plantsMap);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'planted':
        return 'bg-blue-100 text-blue-800';
      case 'growing':
        return 'bg-green-100 text-green-800';
      case 'hardening':
        return 'bg-yellow-100 text-yellow-800';
      case 'ready':
        return 'bg-purple-100 text-purple-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredBatches = batches
    .filter(batch => filter === 'all' || batch.status === filter)
    .filter(batch => {
      const plant = plants[batch.plantId];
      if (!plant) return false;
      return (
        plant.commonName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plant.scientificName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Growing Batches</h1>
        <Link 
          href="/batches/add" 
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
        >
          <Plus className="h-5 w-5" />
          New Batch
        </Link>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search plants..."
            className="pl-10 pr-4 py-2 w-full border rounded-md"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2 border rounded-md"
        >
          <option value="all">All Statuses</option>
          <option value="planted">Planted</option>
          <option value="growing">Growing</option>
          <option value="hardening">Hardening</option>
          <option value="ready">Ready</option>
          <option value="completed">Completed</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBatches.length === 0 ? (
            <div className="md:col-span-2 lg:col-span-3 py-12 text-center text-gray-500">
              No batches found
            </div>
          ) : (
            filteredBatches.map((batch) => {
              const plant = plants[batch.plantId];
              if (!plant) return null;
              
              return (
                <div key={batch.id} className="bg-white shadow rounded-lg overflow-hidden">
                  <div className="px-6 py-4 border-b">
                    <div className="flex justify-between items-center">
                      <h2 className="font-semibold">{plant.commonName}</h2>
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadgeColor(batch.status)}`}>
                        {batch.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 italic">{plant.scientificName}</p>
                  </div>
                  
                  <div className="px-6 py-4">
                    <div className="flex flex-col space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Quantity:</span>
                        <span className="text-sm font-medium">{batch.quantityPlanted}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Planted:</span>
                        <span className="text-sm font-medium">
                          {batch.plantingDate.toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Expected Ready:</span>
                        <span className="text-sm font-medium">
                          {batch.expectedReadyDate.toLocaleDateString()}
                        </span>
                      </div>
                      {batch.successRate && (
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Success Rate:</span>
                          <span className="text-sm font-medium">{batch.successRate}%</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="px-6 py-3 bg-gray-50">
                    <Link 
                      href={`/batches/${batch.id}`}
                      className="flex items-center justify-center gap-2 w-full py-2 text-sm text-green-600 hover:text-green-800"
                    >
                      Manage Batch
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
