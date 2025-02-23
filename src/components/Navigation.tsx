'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Leaf, Package, ShoppingCart, FileText, BarChart3 } from 'lucide-react';

export default function Navigation() {
  const pathname = usePathname();
  
  const isActive = (path: string) => pathname === path;

  return (
    <nav className="w-64 bg-green-800 text-white p-4">
      <div className="mb-8">
        <h1 className="text-xl font-bold">WG Nursery System</h1>
      </div>
      
      <div className="space-y-2">
        <Link 
          href="/dashboard"
          className={`flex items-center space-x-2 p-2 rounded-lg ${
            isActive('/dashboard') ? 'bg-green-700' : 'hover:bg-green-700/50'
          }`}
        >
          <BarChart3 className="h-5 w-5" />
          <span>Dashboard</span>
        </Link>

        <Link 
          href="/inventory"
          className={`flex items-center space-x-2 p-2 rounded-lg ${
            isActive('/inventory') ? 'bg-green-700' : 'hover:bg-green-700/50'
          }`}
        >
          <Package className="h-5 w-5" />
          <span>Inventory</span>
        </Link>

        <Link 
          href="/pos"
          className={`flex items-center space-x-2 p-2 rounded-lg ${
            isActive('/pos') ? 'bg-green-700' : 'hover:bg-green-700/50'
          }`}
        >
          <ShoppingCart className="h-5 w-5" />
          <span>Point of Sale</span>
        </Link>

        <Link 
          href="/invoices"
          className={`flex items-center space-x-2 p-2 rounded-lg ${
            isActive('/invoices') ? 'bg-green-700' : 'hover:bg-green-700/50'
          }`}
        >
          <FileText className="h-5 w-5" />
          <span>Invoices</span>
        </Link>
      </div>
    </nav>
  );
}
