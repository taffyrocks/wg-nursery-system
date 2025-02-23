'use client';

import { useState, useEffect } from 'react';
import { getPlants, getCustomers, addOrder, addOrderItem, updateInventory } from '../../../lib/firestore';
import { Plant, Customer, InventoryItem } from '../../../types';
import { Search, ShoppingCart, Plus, Minus, X, User, CreditCard } from 'lucide-react';
import { collection, query, where, getDocs } from 'firebase/firestore';

type CartItem = {
  plant: Plant;
  quantity: number;
  inventoryId: string;
};

export default function POSPage() {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerSearchTerm, setCustomerSearchTerm] = useState('');
  const [showCustomerSearch, setShowCustomerSearch] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [plantsData, customersData] = await Promise.all([
          getPlants(),
          getCustomers()
        ]);
        
        // Fetch inventory
        const inventorySnapshot = await getDocs(collection(db, 'inventory'));
        const inventoryData = inventorySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as InventoryItem[];
        
        setPlants(plantsData);
        setCustomers(customersData);
        setInventory(inventoryData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const availablePlants = plants.filter(plant => {
    // Check if plant has inventory
    const plantInventory = inventory.find(item => 
      item.plantId === plant.id && item.quantityAvailable > 0
    );
    return plantInventory !== undefined;
  });

  const filteredPlants = availablePlants.filter(plant => 
    plant.commonName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    plant.scientificName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(customerSearchTerm.toLowerCase()) ||
    (customer.phone && customer.phone.includes(customerSearchTerm))
  );

  const addToCart = (plant: Plant) => {
    // Find inventory for this plant
    const plantInventory = inventory.find(item => 
      item.plantId === plant.id && item.quantityAvailable > 0
    );
    
    if (!plantInventory) return;

    const existingItem = cart.find(item => item.plant.id === plant.id);
    
    if (existingItem) {
      // Check if we have enough inventory
      if (existingItem.quantity < plantInventory.quantityAvailable) {
        setCart(cart.map(item => 
          item.plant.id === plant.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        ));
      }
    } else {
      setCart([...cart, { 
        plant, 
        quantity: 1,
        inventoryId: plantInventory.id
      }]);
    }
  };

  const updateQuantity = (plantId: string, change: number) => {
    // Find inventory for this plant
    const cartItem = cart.find(item => item.plant.id === plantId);
    if (!cartItem) return;
    
    const plantInventory = inventory.find(item => item.id === cartItem.inventoryId);
    if (!plantInventory) return;
    
    setCart(cart.map(item => {
      if (item.plant.id === plantId) {
        const newQuantity = item.quantity + change;
        if (newQuantity > 0 && newQuantity <= plantInventory.quantityAvailable) {
          return { ...item, quantity: newQuantity };
        }
      }
      return item;
    }));
  };

  const removeFromCart = (plantId: string) => {
    setCart(cart.filter(item => item.plant.id !== plantId));
  };

  const selectCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowCustomerSearch(false);
  };

  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + (item.plant.price * item.quantity), 0);
  };

  const handleProcessPayment = async () => {
    if (cart.length === 0) return;
    
    setProcessingPayment(true);
    
    try {
      // Create order
      const orderTotal = calculateTotal();
      const orderRef = await addOrder({
        customerId: selectedCustomer?.id,
        orderDate: new Date(),
        status: 'completed',
        totalAmount: orderTotal,
        notes: 'POS Sale'
      });
      
      // Add order items and update inventory
      for (const item of cart) {
        await addOrderItem({
          orderId: orderRef.id,
          plantId: item.plant.id,
          quantity: item.quantity,
          unitPrice: item.plant.price,
          status: 'shipped'
        });
        
        // Update inventory
        const inventoryItem = inventory.find(inv => inv.id === item.inventoryId);
        if (inventoryItem) {
          await updateInventory(item.inventoryId, {
            quantityAvailable: inventoryItem.quantityAvailable - item.quantity
          });
        }
      }
      
      setPaymentSuccess(true);
      // Reset cart after timeout
      setTimeout(() => {
        setCart([]);
        setSelectedCustomer(null);
        setPaymentSuccess(false);
      }, 3000);
      
    } catch (error) {
      console.error('Error processing payment:', error);
    } finally {
      setProcessingPayment(false);
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
    <div className="flex min-h-[calc(100vh-64px)]">
      {/* Products section */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Point of Sale</h1>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search plants..."
              className="pl-10 pr-4 py-2 w-full border rounded-md"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredPlants.map((plant) => {
            const plantInventory = inventory.find(item => 
              item.plantId === plant.id && item.quantityAvailable > 0
            );
            const availableQuantity = plantInventory?.quantityAvailable || 0;
            
            return (
              <button
                key={plant.id}
                onClick={() => addToCart(plant)}
                disabled={availableQuantity === 0}
                className="bg-white p-4 rounded-lg shadow text-left hover:shadow-md transition-shadow disabled:opacity-50"
              >
                <h3 className="font-medium truncate">{plant.commonName}</h3>
                <p className="text-sm text-gray-500 truncate">{plant.scientificName}</p>
                <div className="mt-2 flex justify-between items-center">
                  <span className="font-bold">${plant.price.toFixed(2)}</span>
                  <span className="text-sm text-gray-500">Stock: {availableQuantity}</span>
                </div>
              </button>
            );
          })}
        </div>
        
        {filteredPlants.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No plants found
          </div>
        )}
      </div>
      
      {/* Cart section */}
      <div className="w-96 bg-white shadow-lg flex flex-col">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">Current Sale</h2>
        </div>
        
        {/* Customer selection */}
        <div className="p-4 border-b">
          {selectedCustomer ? (
            <div className="flex justify-between items-center">
              <div>
                <div className="font-medium">{selectedCustomer.name}</div>
                <div className="text-sm text-gray-500">{selectedCustomer.phone}</div>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="p-1 hover:bg-gray-100 rounded-full"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
          ) : (
            <div>
              <button
                onClick={() => setShowCustomerSearch(true)}
                className="flex items-center gap-2 w-full px-3 py-2 border border-dashed rounded-md hover:bg-gray-50"
              >
                <User className="h-5 w-5 text-gray-400" />
                <span className="text-gray-500">Select Customer (Optional)</span>
              </button>
              
              {showCustomerSearch && (
                <div className="mt-3 space-y-3">
                  <input
                    type="text"
                    placeholder="Search by name or phone..."
                    className="w-full px-3 py-2 border rounded-md"
                    value={customerSearchTerm}
                    onChange={(e) => setCustomerSearchTerm(e.target.value)}
                  />
                  
                  <div className="max-h-40 overflow-y-auto border rounded-md">
                    {filteredCustomers.length === 0 ? (
                      <div className="p-3 text-center text-gray-500 text-sm">
                        No customers found
                      </div>
                    ) : (
                      filteredCustomers.map(customer => (
                        <button
                          key={customer.id}
                          className="w-full text-left p-3 hover:bg-gray-50 border-b last:border-b-0"
                          onClick={() => selectCustomer(customer)}
                        >
                          <div className="font-medium">{customer.name}</div>
                          {customer.phone && (
                            <div className="text-sm text-gray-500">{customer.phone}</div>
                          )}
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Cart items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {cart.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Cart is empty</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.plant.id} className="flex gap-4">
                <div className="flex-1">
                  <div className="font-medium">{item.plant.commonName}</div>
                  <div className="text-sm text-gray-500">${item.plant.price.toFixed(2)} each</div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateQuantity(item.plant.id, -1)}
                    className="p-1 hover:bg-gray-100 rounded-full"
                  >
                    <Minus className="h-4 w-4 text-gray-500" />
                  </button>
                  
                  <span className="min-w-[2rem] text-center">{item.quantity}</span>
                  
                  <button
                    onClick={() => updateQuantity(item.plant.id, 1)}
                    className="p-1 hover:bg-gray-100 rounded-full"
                  >
                    <Plus className="h-4 w-4 text-gray-500" />
                  </button>
                  
                  <button
                    onClick={() => removeFromCart(item.plant.id)}
                    className="p-1 hover:bg-gray-100 rounded-full"
                  >
                    <X className="h-5 w-5 text-red-500" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
        
        {/* Totals and checkout */}
        <div className="p-4 border-t">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-500">Subtotal</span>
            <span>${calculateTotal().toFixed(2)}</span>
          </div>
          
          <div className="flex justify-between items-center mb-4 font-bold text-lg">
            <span>Total</span>
            <span>${calculateTotal().toFixed(2)}</span>
          </div>
          
          <button
            onClick={handleProcessPayment}
            disabled={cart.length === 0 || processingPayment || paymentSuccess}
            className="w-full py-3 flex justify-center items-center gap-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
          >
            {processingPayment ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : paymentSuccess ? (
              <span>Payment Successful! ✓</span>
            ) : (
              <>
                <CreditCard className="h-5 w-5" />
                <span>Process Payment</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
