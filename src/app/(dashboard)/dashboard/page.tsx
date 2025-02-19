'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, limit } from 'firebase/firestore';
import { Leaf, Package, ShoppingCart, TrendingUp } from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState({
    plants: 0,
    inventory: 0,
    orders: 0,
    revenue: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Get plant count
        const plantsSnapshot = await getDocs(query(collection(db, 'plants'), limit(1000)));
        const plantCount = plantsSnapshot.size;
        
        // Get inventory sum
        const inventorySnapshot = await getDocs(query(collection(db, 'inventory'), limit(1000)));
        let totalInventory = 0;
        inventorySnapshot.forEach(doc => {
          totalInventory += doc.data().quantityAvailable || 0;
        });
        
        // Get order count
        const ordersSnapshot = await getDocs(query(collection(db, 'orders'), limit(1000)));
        const orderCount = ordersSnapshot.size;
        
        // Calculate revenue
        let totalRevenue = 0;
        ordersSnapshot.forEach(doc => {
          totalRevenue += doc.data().totalAmount || 0;
        });
        
        setStats({
          plants: plantCount,
          inventory: totalInventory,
          orders: orderCount,
          revenue: totalRevenue
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
  }, []);

  if (loading) {
    return <div>Loading dashboard data...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Stat cards */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-full">
              <Leaf className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Plants</p>
              <p className="text-2xl font-semibold">{stats.plants}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Inventory</p>
              <p className="text-2xl font-semibold">{stats.inventory}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-full">
              <ShoppingCart className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Orders</p>
              <p className="text-2xl font-semibold">{stats.orders}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-100 rounded-full">
              <TrendingUp className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Revenue</p>
              <p className="text-2xl font-semibold">${stats.revenue.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Additional dashboard sections can be added here */}
    </div>
  );
}
