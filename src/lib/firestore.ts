'use client';

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

// Plants Collection
export const getPlants = async () => {
  try {
    const plantsCollection = collection(db, 'plants');
    const snapshot = await getDocs(plantsCollection);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate()
    }));
  } catch (error) {
    console.error('Error getting plants:', error);
    return [];
  }
};

export const addPlant = async (plant: any) => {
  try {
    const plantsCollection = collection(db, 'plants');
    return await addDoc(plantsCollection, {
      ...plant,
      createdAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error adding plant:', error);
    throw error;
  }
};

// Customers Collection
export const getCustomers = async () => {
  try {
    const customersCollection = collection(db, 'customers');
    const snapshot = await getDocs(customersCollection);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate()
    }));
  } catch (error) {
    console.error('Error getting customers:', error);
    return [];
  }
};

// Orders Collection
export const addOrder = async (orderData: any) => {
  try {
    const ordersCollection = collection(db, 'orders');
    return await addDoc(ordersCollection, {
      ...orderData,
      createdAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error adding order:', error);
    throw error;
  }
};

export const addOrderItem = async (orderItem: any) => {
  try {
    const orderItemsCollection = collection(db, 'orderItems');
    return await addDoc(orderItemsCollection, {
      ...orderItem,
      createdAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error adding order item:', error);
    throw error;
  }
};

// Inventory Collection
export const updateInventory = async (id: string, data: any) => {
  try {
    const inventoryRef = doc(db, 'inventory', id);
    await updateDoc(inventoryRef, {
      ...data,
      lastUpdated: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating inventory:', error);
    throw error;
  }
};

// Batches Collection
export const getBatches = async () => {
  try {
    const batchesCollection = collection(db, 'batches');
    const snapshot = await getDocs(batchesCollection);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      plantingDate: doc.data().plantingDate?.toDate(),
      expectedReadyDate: doc.data().expectedReadyDate?.toDate(),
      actualReadyDate: doc.data().actualReadyDate?.toDate(),
      createdAt: doc.data().createdAt?.toDate()
    }));
  } catch (error) {
    console.error('Error getting batches:', error);
    return [];
  }
};
