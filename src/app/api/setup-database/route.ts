import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  query, 
  where, 
  writeBatch 
} from 'firebase/firestore';

/**
 * Initialize database collections and base data
 */
export async function GET() {
  try {
    // Create collections if they don't exist
    const collections = [
      'plants',
      'batches',
      'inventory',
      'customers',
      'orders',
      'orderItems',
      'invoices',
      'users'
    ];
    
    // Create empty documents in each collection to initialize them
    for (const collectionName of collections) {
      const collRef = collection(db, collectionName);
      const snapshot = await getDocs(query(collRef, where('_init', '==', true)));
      
      if (snapshot.empty) {
        const initDoc = doc(collection(db, collectionName));
        await setDoc(initDoc, { 
          _init: true,
          _description: `Initialization document for ${collectionName} collection`,
          createdAt: new Date()
        });
      }
    }
    
    // Add sample plants if none exist
    const plantsRef = collection(db, 'plants');
    const plantsSnapshot = await getDocs(plantsRef);
    
    if (plantsSnapshot.size <= 1) {  // Only init document exists
      const batch = writeBatch(db);
      
      const samplePlants = [
        {
          scientificName: 'Monstera deliciosa',
          commonName: 'Swiss Cheese Plant',
          description: 'Popular houseplant with large, glossy leaves with natural holes.',
          careInstructions: 'Bright indirect light. Water when top 2-3 inches of soil are dry.',
          growingTimeDays: 180,
          price: 24.99,
          cost: 12.50,
          createdAt: new Date()
        },
        {
          scientificName: 'Ficus lyrata',
          commonName: 'Fiddle Leaf Fig',
          description: 'Tree-like plant with large, violin-shaped leaves.',
          careInstructions: 'Bright indirect light. Water when top inch of soil is dry.',
          growingTimeDays: 240,
          price: 34.99,
          cost: 17.50,
          createdAt: new Date()
        },
        {
          scientificName: 'Sansevieria trifasciata',
          commonName: 'Snake Plant',
          description: 'Upright succulent with stiff, sword-like leaves.',
          careInstructions: 'Low to bright indirect light. Water every 2-3 weeks.',
          growingTimeDays: 120,
          price: 19.99,
          cost: 8.75,
          createdAt: new Date()
        }
      ];
      
      samplePlants.forEach(plant => {
        const newPlantRef = doc(collection(db, 'plants'));
        batch.set(newPlantRef, plant);
      });
      
      await batch.commit();
    }
    
    // Add sample customers if none exist
    const customersRef = collection(db, 'customers');
    const customersSnapshot = await getDocs(customersRef);
    
    if (customersSnapshot.size <= 1) {  // Only init document exists
      const batch = writeBatch(db);
      
      const sampleCustomers = [
        {
          name: 'John Smith',
          email: 'john@example.com',
          phone: '(555) 123-4567',
          address: '123 Main St, Anytown, CA 12345',
          customerType: 'retail',
          createdAt: new Date()
        },
        {
          name: 'Green Thumb Landscaping',
          email: 'info@greenthumb.com',
          phone: '(555) 987-6543',
          address: '456 Garden Way, Plantville, FL 67890',
          customerType: 'wholesale',
          createdAt: new Date()
        },
        {
          name: 'City Parks Department',
          email: 'parks@citygovt.org',
          phone: '(555) 555-5555',
          address: '789 Government Blvd, Metro City, WA 54321',
          customerType: 'contractor',
          createdAt: new Date()
        }
      ];
      
      sampleCustomers.forEach(customer => {
        const newCustomerRef = doc(collection(db, 'customers'));
        batch.set(newCustomerRef, customer);
      });
      
      await batch.commit();
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Database initialized successfully' 
    });
    
  } catch (error) {
    console.error('Error initializing database:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to initialize database' },
      { status: 500 }
    );
  }
}
