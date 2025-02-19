// Plant types
export interface Plant {
  id: string;
  scientificName: string;
  commonName: string;
  description?: string;
  careInstructions?: string;
  growingTimeDays: number;
  price: number;
  cost: number;
  createdAt: Date;
}

// Batch types
export interface GrowingBatch {
  id: string;
  plantId: string;
  quantityPlanted: number;
  plantingDate: Date;
  expectedReadyDate: Date;
  actualReadyDate?: Date;
  successRate?: number;
  notes?: string;
  status: 'planted' | 'growing' | 'hardening' | 'ready' | 'completed' | 'failed';
  createdAt: Date;
}

// Inventory types
export interface InventoryItem {
  id: string;
  plantId: string;
  batchId?: string;
  quantityAvailable: number;
  location?: string;
  lastUpdated: Date;
}

// Customer types
export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  customerType: 'retail' | 'wholesale' | 'contractor';
  createdAt: Date;
}

// Order types
export interface Order {
  id: string;
  customerId?: string;
  orderDate: Date;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'completed' | 'cancelled';
  shippingAddress?: string;
  totalAmount: number;
  notes?: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  plantId: string;
  quantity: number;
  unitPrice: number;
  batchId?: string;
  status: 'pending' | 'allocated' | 'shipped';
  createdAt: Date;
}
