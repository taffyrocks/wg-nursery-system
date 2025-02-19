'use client';

import { useState, useEffect } from 'react';
import { getPlants, getCustomers, addOrder, addOrderItem, updateInventory } from '@/lib/firestore';
import { Search, Plus, Minus, User, ShoppingCart, X, CreditCard, Receipt } from 'lucide-react';
import { Plant, Customer, InventoryItem } from '@/types';

export default function POSPage() {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [inventory, setInventory] = useState<Record<string, number>>({});
  const [cart, setCart] = useState<Array<{plant: Plant, quantity: number}>>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [customerSearch, setCustomerSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showCustomerSearch, setShowCustomerSearch] = useState(false);
  const [loading, setLoading] = useState(true);
  const [processingOrder, setProcessingOrder] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [plantsData, customersData, inventoryData] = await Promise.all([
          getPlants(),
          getCustomers(),
          fetch('/api/inventory').then(res => res.json())
        ]);
        
        // Create inventory map by plant ID
        const inventoryMap = inventoryData.reduce((acc: Record<string, number>, item: InventoryItem) => {
          acc[item.plantId] = (acc[item.plantId] || 0) + item.quantityAvailable;
          return acc;
        }, {});
        
        setPlants(plantsData);
        setCustomers(customersData);
        setInventory(inventoryMap);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredPlants = plants.filter(plant => {
    const inStock = inventory[plant.id] > 0;
    const matchesSearch = plant.commonName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         plant.scientificName.toLowerCase().includes(searchTerm.toLowerCase());
    return inStock && matchesSearch;
  });

  const filteredCustomers = customers.filter(customer => 
    customer.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
    (customer.phone && customer.phone.includes(customerSearch))
  );

  const addToCart = (plant: Plant) => {
    const existingItem = cart.find(item => item.plant.id === plant.id);
    if (existingItem) {
      // Check if we have enough inventory
      if (existingItem.quantity < inventory[plant.id]) {
        setCart(cart.map(item => 
          item.plant.id === plant.id 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        ));
      }
    } else {
      setCart([...cart, { plant, quantity: 1 }]);
    }
  };

  const updateQuantity = (plantId: string, delta: number) => {
    setCart(cart.map(item => {
      if (item.plant.id === plantId) {
        const newQuantity = item.quantity + delta;
        // Ensure quantity is within inventory limits and positive
        if (newQuantity > 0 && newQuantity <= inventory[plantId]) {
          return { ...item, quantity: newQuantity };
        }
      }
      return item;
    }));
  };

  const removeFromCart = (plantId: string) => {
    setCart(cart.filter(item => item.plant.id !== plantId));
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + (item.plant.price * item.quantity), 0);
  };

  const handleCustomerSelect = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowCustomerSearch(false);
  };

  const processOrder = async () => {
    if (cart.length === 0) return;
    
    setProcessingOrder(true);
    
    try {
      // Create order
      const orderRef = await addOrder({
        customerId: selectedCustomer?.id,
        orderDate: new Date(),
        status: 'completed',
        totalAmount: calculateTotal(),
        shippingAddress: selectedCustomer?.address
      });
      
      // Create order items
      for (const item of cart) {
        await addOrderItem({
          orderId: orderRef.id,
          plantId: item.plant.id,
          quantity: item.quantity,
          unitPrice: item.plant.price,
          status: 'shipped'
        });
        
        // Update inventory (this would typically be handled by a Firestore trigger)
        // But we'll handle it manually here for simplicity
        // In a real app, you'd update specific inventory items
        await updateInventory(item.plant.id, { quantityAvailable: inventory[item.plant.id] - item.quantity });
      }
      
      setOrderId(orderRef.id);
      setOrderComplete(true);
    } catch (error) {
      console.error('Error processing order:', error);
    } finally {
      setProcessingOrder(false);
    }
  };

  const resetOrder = () => {
    setCart([]);
    setSelectedCustomer(null);
    setOrderComplete(false);
    setOrderId(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (orderComplete) {
    return (
      <div className="max-w-md mx-auto mt-12 bg-white shadow rounded-lg overflow-hidden">
        <div className="p-6 bg-green-50 border-b">
          <div className="flex items-center justify-center mb-4">
            <div className="rounded-full bg-green-100 p-3">
              <Receipt className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <h2 className="text-2xl font-semibold text-center text-green-800">Order Complete</h2>
          <p className="text-center text-gray-600 mt-1">Order #{orderId}</p>
        </div>
        
        <div className="p-6">
          <div className="space-y-4">
            <h3 className="font-semibold">Order Summary</h3>
            
            {cart.map(item => (
              <div key={item.plant.id} className="flex justify-between">
                <span>{item.quantity} x {item.plant.commonName}</span>
                <span>${(item.plant.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            
            <div className="border-t pt-4 flex justify-between font-semibold">
              <span>Total</span>
              <span>${calculateTotal().toFixed(2)}</span>
            </div>
            
            {selectedCustomer && (
              <div className="bg-gray-50 p-4 rounded mt-6">
                <h3 className="font-semibold mb-2">Customer</h3>
                <p>{selectedCustomer.name}</p>
                {selectedCustomer.email && <p className="text-sm text-gray-600">{selectedCustomer.email}</p>}
                {selectedCustomer.phone && <p className="text-sm text-gray-600">{selectedCustomer.phone}</p>}
              </div>
            )}
          </div>
          
          <div className="mt-8">
            <button
              onClick={resetOrder}
              className="w-full py-3 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              New Sale
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row gap-6">
      {/* Products Section */}
      <div className="flex-1">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-4">Point of Sale</h1>
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
        
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredPlants.length === 0 ? (
            <div className="col-span-full py-12 text-center text-gray-500">
              No plants found in inventory
            </div>
          ) : (
            filteredPlants.map(plant => (
              <button
                key={plant.id}
                onClick={() => addToCart(plant)}
                className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow text-left"
              >
                <h3 className="font-semibold truncate">{plant.commonName}</h3>
                <p className="text-sm text-gray-600 truncate">{plant.scientificName}</p>
                <div className="flex justify-between items-center mt-2">
                  <p className="text-lg font-bold">${plant.price.toFixed(2)}</p>
                  <span className="text-sm text-gray-600">Stock: {inventory[plant.id]}</span>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
      
      {/* Cart Section */}
      <div className="w-full md:w-96 bg-white shadow-lg rounded-lg">
        <div className="p-4 border-b">
          <h2 className="text-xl font-semibold">Current Sale</h2>
        </div>
        
        <div className="p-4">
          {selectedCustomer ? (
            <div className="bg-gray-50 p-3 rounded-md mb-4 flex justify-between items-center">
              <div>
                <div className="font-medium">{selectedCustomer.name}</div>
                {selectedCustomer.phone && (
                  <div className="text-sm text-gray-600">{selectedCustomer.phone}</div>
                )}
              </div>
              <button 
                onClick={() => setSelectedCustomer(null)}
                className="p-1 hover:bg-gray-200 rounded-full"
              >
                <X className="h-4 w-4 text-gray-600" />
              </button>
            </div>
          ) : (
            <div className="mb-4">
              <button
                onClick={() => setShowCustomerSearch(true)}
                className="w-full flex items-center justify-center gap-2 py-2 border-2 border-dashed border-gray-300 rounded-md text-gray-600 hover:bg-gray-50"
              >
                <User className="h-5 w-5" />
                Add Customer
              </button>
              
              {showCustomerSearch && (
                <div className="mt-2">
                  <input
                    type="text"
                    placeholder="Search by name or phone..."
                    className="w-full px-3 py-2 border rounded-md"
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                  />
                  
                  <div className="mt-1 max-h-48 overflow-y-auto border rounded-md">
                    {filteredCustomers.length === 0 ? (
                      <div className="p-2 text-center text-gray-500 text-sm">No customers found</div>
                    ) : (
                      filteredCustomers.slice(0, 5).map(customer => (
                        <button
                          key={customer.id}
                          onClick={() => handleCustomerSelect(customer)}
                          className="w-full text-left px-3 py-2 hover:bg-gray-100 border-b last:border-b-0"
                        >
                          <div className="font-medium">{customer.name}</div>
                          {customer.phone && (
                            <div className="text-sm text-gray-600">{customer.phone}</div>
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
        
        <div className="px-4 border-t pt-4 flex-1 overflow-auto">
          {cart.length === 0 ? (
            <div className="py-8 text-center text-gray-500">
              <ShoppingCart className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>Cart is empty</p>
              <p className="text-sm">Add items from inventory</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map(item => (
                <div key={item.plant.id} className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium">{item.plant.commonName}</h3>
                    <p className="text-sm text-gray-600">${item.plant.price.toFixed(2)} each</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.
