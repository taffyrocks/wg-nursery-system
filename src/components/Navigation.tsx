'use client';

import { useAuth } from './AuthProvider';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Leaf, Package, ShoppingCart, FileText, BarChart3, Settings, LogOut } from 'lucide-react';

export default function Navigation() {
  const { logout } = useAuth();
  const pathname = usePathname();
  
  const isActive = (path: string) => {
    return pathname === path ? 'bg-green-700 text-white' : 'text-white hover:bg-green-700/50';
  };

  return (
    <div className="h-full bg-green-800 w-64 flex flex-col">
      <div className="p-4 border-b border-green-700">
        <h1 className="text-xl font-bold text-white">WG Nursery System</h1>
      </div>
      
      <nav className="flex-1 p-4 space-y-1">
        <Link href="/dashboard" className={`flex items-center space-x-2 p-2 rounded-md ${isActive('/dashboard')}`}>
          <BarChart3 className="h-5 w-5" />
          <span>Dashboard</span>
        </Link>
        
        <Link href="/plants" className={`flex items-center space-x-2 p-2 rounded-md ${isActive('/plants')}`}>
          <Leaf className="h-5 w-5" />
          <span>Plants</span>
        </Link>
        
        <Link href="/inventory" className={`flex items-center space-x-2 p-2 rounded-md ${isActive('/inventory')}`}>
          <Package className="h-5 w-5" />
          <span>Inventory</span>
        </Link>
        
        <Link href="/pos" className={`flex items-center space-x-2 p-2 rounded-md ${isActive('/pos')}`}>
          <ShoppingCart className="h-5 w-5" />
          <span>Point of Sale</span>
        </Link>
        
        <Link href="/invoices" className={`flex items-center space-x-2 p-2 rounded-md ${isActive('/invoices')}`}>
          <FileText className="h-5 w-5" />
          <span>Invoices</span>
        </Link>
        
        <Link href="/settings" className={`flex items-center space-x-2 p-2 rounded-md ${isActive('/settings')}`}>
          <Settings className="h-5 w-5" />
          <span>Settings</span>
        </Link>
      </nav>
      
      <div className="p-4 border-t border-green-700">
        <button 
          onClick={logout}
          className="flex items-center space-x-2 p-2 rounded-md w-full text-white hover:bg-green-700/50"
        >
          <LogOut className="h-5 w-5" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}
