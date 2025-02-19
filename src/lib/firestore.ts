import { db } from './firebase';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  getDoc, 
  query, 
  where, 
  serverTimestamp, 
  Timestamp,
  DocumentData
} from 'firebase/firestore';
import { Plant, GrowingBatch, InventoryItem, Customer, Order, OrderItem } from '@/types';

// Plants Collection
export const plantsCollection = collection(db, 'plants');

export const addPlant = async (plant: Omit<Plant, 'id' | 'createdAt'>) => {
  return addDoc(plantsCollection, {
    ...plant,
    createdAt: serverTimestamp()
  });
};

export const updatePlant = async (id: string, plant: Partial<Plant>) => {
  const plantRef = doc(db, 'plants', id);
  return updateDoc(plantRef, plant);
};

export const deletePlant = async (id: string) => {
  const plantRef = doc(db, 'plants', id);
  return deleteDoc(plantRef);
};

export const getPlants = async () => {
  const snapshot = await getDocs(plantsCollection);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: (doc.data().createdAt as Timestamp)?.toDate()
  })) as Plant[];
};

// Growing Batches Collection
export const batchesCollection = collection(db, 'batches');

export const addBatch = async (batch: Omit<GrowingBatch, 'id' | 'createdAt'>) => {
  return addDoc(batchesCollection, {
    ...batch,
    createdAt: serverTimestamp()
  });
};

export const updateBatch = async (id: string, batch: Partial<GrowingBatch>) => {
  const batchRef = doc(db, 'batches', id);
  return updateDoc(batchRef, batch);
};

export const getBatches = async () => {
  const snapshot = await getDocs(batchesCollection);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    plantingDate: (doc.data().plantingDate as Timestamp)?.toDate(),
    expectedReadyDate: (doc.data().expectedReadyDate as Timestamp)?.toDate(),
    actualReadyDate: (doc.data().actualReadyDate as Timestamp)?.toDate(),
    createdAt: (doc.data().createdAt as Timestamp)?.toDate()
  })) as GrowingBatch[];
};

// Inventory Collection
export const inventoryCollection = collection(db, 'inventory');

export const addInventoryItem = async (item: Omit<InventoryItem, 'id' | 'lastUpdated'>) => {
  return addDoc(inventoryCollection, {
    ...item,
    lastUpdated: serverTimestamp()
  });
};

export const updateInventory = async (id: string, item: Partial<InventoryItem>) => {
  const itemRef = doc(db, 'inventory', id);
  return updateDoc(itemRef, {
    ...item,
    lastUpdated: serverTimestamp()
  });
};

// Customers Collection
export const customersCollection = collection(db, 'customers');

export const addCustomer = async (customer: Omit<Customer, 'id' | 'createdAt'>) => {
  return addDoc(customersCollection, {
    ...customer,
    createdAt: serverTimestamp()
  });
};

export const updateCustomer = async (id: string, customer: Partial<Customer>) => {
  const customerRef = doc(db, 'customers', id);
  return updateDoc(customerRef, customer);
};

export const getCustomers = async () => {
  const snapshot = await getDocs(customersCollection);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: (doc.data().createdAt as Timestamp)?.toDate()
  })) as Customer[];
};

// Orders Collection
export const ordersCollection = collection(db, 'orders');

export const addOrder = async (order: Omit<Order, 'id'>) => {
  return addDoc(ordersCollection, {
    ...order,
    orderDate: serverTimestamp()
  });
};

export const updateOrder = async (id: string, order: Partial<Order>) => {
  const orderRef = doc(db, 'orders', id);
  return updateDoc(orderRef, order);
};

// Order Items Collection
export const orderItemsCollection = collection(db, 'orderItems');

export const addOrderItem = async (item: Omit<OrderItem, 'id' | 'createdAt'>) => {
  return addDoc(orderItemsCollection, {
    ...item,
    createdAt: serverTimestamp()
  });
};
