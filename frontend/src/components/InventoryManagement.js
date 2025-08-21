import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001/api';

// Configure axios with API base URL
const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const InventoryManagement = () => {
  const [currentView, setCurrentView] = useState('items');
  const [inventoryItems, setInventoryItems] = useState([]);
  const [stockMovements, setStockMovements] = useState([]);
  const [lowStockAlerts, setLowStockAlerts] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterLowStock, setFilterLowStock] = useState(false);

  // Categories for inventory items
  const categories = ['parts', 'supplies', 'tools', 'equipment'];

  // Load initial data
  useEffect(() => {
    loadInventoryData();
  }, [currentView]);

  const loadInventoryData = async () => {
    setLoading(true);
    try {
      switch (currentView) {
        case 'items':
          await loadInventoryItems();
          break;
        case 'movements':
          await loadStockMovements();
          break;
        case 'alerts':
          await loadLowStockAlerts();
          break;
        case 'purchase-orders':
          await loadPurchaseOrders();
          break;
        case 'analytics':
          await loadAnalytics();
          break;
        default:
          break;
      }
    } catch (error) {
      console.error('Error loading inventory data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadInventoryItems = async () => {
    const params = new URLSearchParams();
    if (searchTerm) params.append('search', searchTerm);
    if (filterCategory) params.append('category', filterCategory);
    if (filterLowStock) params.append('low_stock', 'true');
    
    const response = await api.get(`/inventory/items?${params.toString()}`);
    setInventoryItems(response.data.items || []);
  };

  const loadStockMovements = async () => {
    const response = await api.get('/inventory/movements?limit=50');
    setStockMovements(response.data.movements || []);
  };

  const loadLowStockAlerts = async () => {
    const response = await api.get('/inventory/low-stock-alerts');
    setLowStockAlerts(response.data || []);
  };

  const loadPurchaseOrders = async () => {
    const response = await api.get('/inventory/purchase-orders');
    setPurchaseOrders(response.data || []);
  };

  const loadAnalytics = async () => {
    const response = await api.get('/inventory/analytics');
    setAnalytics(response.data);
  };

  // Handle form submissions
  const handleCreateItem = async (formData) => {
    try {
      await api.post('/inventory/items', formData);
      setShowModal(false);
      loadInventoryItems();
    } catch (error) {
      console.error('Error creating inventory item:', error);
      alert('Failed to create inventory item');
    }
  };

  const handleUpdateItem = async (itemId, formData) => {
    try {
      await api.put(`/inventory/items/${itemId}`, formData);
      setShowModal(false);
      loadInventoryItems();
    } catch (error) {
      console.error('Error updating inventory item:', error);
      alert('Failed to update inventory item');
    }
  };

  const handleCreateStockMovement = async (formData) => {
    try {
      await api.post('/inventory/movements', formData);
      setShowModal(false);
      loadStockMovements();
      loadInventoryItems(); // Refresh items to show updated quantities
    } catch (error) {
      console.error('Error creating stock movement:', error);
      alert('Failed to create stock movement');
    }
  };

  const acknowledgeAlert = async (alertId) => {
    try {
      await api.put(`/inventory/low-stock-alerts/${alertId}/acknowledge`);
      loadLowStockAlerts();
    } catch (error) {
      console.error('Error acknowledging alert:', error);
    }
  };

  // Modal components
  const ItemFormModal = () => {
    const [formData, setFormData] = useState({
      name: '',
      description: '',
      category: 'parts',
      sku: '',
      supplier_name: '',
      supplier_contact: '',
      unit_cost: 0,
      selling_price: 0,
      stock_quantity: 0,
      min_stock_level: 0,
      max_stock_level: '',
      location: '',
      barcode: '',
      notes: ''
    });

    useEffect(() => {
      if (modalType === 'edit' && selectedItem) {
        setFormData({
          name: selectedItem.name || '',
          description: selectedItem.description || '',
          category: selectedItem.category || 'parts',
          sku: selectedItem.sku || '',
          supplier_name: selectedItem.supplier_name || '',
          supplier_contact: selectedItem.supplier_contact || '',
          unit_cost: selectedItem.unit_cost || 0,
          selling_price: selectedItem.selling_price || 0,
          stock_quantity: selectedItem.stock_quantity || 0,
          min_stock_level: selectedItem.min_stock_level || 0,
          max_stock_level: selectedItem.max_stock_level || '',
          location: selectedItem.location || '',
          barcode: selectedItem.barcode || '',
          notes: selectedItem.notes || ''
        });
      }
    }, [modalType, selectedItem]);

    const handleSubmit = (e) => {
      e.preventDefault();
      if (modalType === 'edit' && selectedItem) {
        handleUpdateItem(selectedItem.id, formData);
      } else {
        handleCreateItem(formData);
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <h3 className="text-lg font-semibold mb-4">
            {modalType === 'edit' ? 'Edit Inventory Item' : 'Add New Inventory Item'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Category *</label>
                <select
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">SKU</label>
                <input
                  type="text"
                  value={formData.sku}
                  onChange={(e) => setFormData({...formData, sku: e.target.value})}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Auto-generated if empty"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Unit Cost ($)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.unit_cost}
                  onChange={(e) => setFormData({...formData, unit_cost: parseFloat(e.target.value) || 0})}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Selling Price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.selling_price}
                  onChange={(e) => setFormData({...formData, selling_price: parseFloat(e.target.value) || 0})}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Initial Stock Quantity</label>
                <input
                  type="number"
                  min="0"
                  value={formData.stock_quantity}
                  onChange={(e) => setFormData({...formData, stock_quantity: parseInt(e.target.value) || 0})}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Min Stock Level</label>
                <input
                  type="number"
                  min="0"
                  value={formData.min_stock_level}
                  onChange={(e) => setFormData({...formData, min_stock_level: parseInt(e.target.value) || 0})}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Supplier Name</label>
                <input
                  type="text"
                  value={formData.supplier_name}
                  onChange={(e) => setFormData({...formData, supplier_name: e.target.value})}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Supplier Contact</label>
                <input
                  type="text"
                  value={formData.supplier_contact}
                  onChange={(e) => setFormData({...formData, supplier_contact: e.target.value})}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows="3"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                rows="2"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                {modalType === 'edit' ? 'Update Item' : 'Create Item'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const StockMovementModal = () => {
    const [formData, setFormData] = useState({
      inventory_item_id: '',
      movement_type: 'in',
      quantity: 0,
      reference_id: '',
      reference_type: '',
      unit_cost: 0,
      notes: ''
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      handleCreateStockMovement(formData);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg w-full max-w-md">
          <h3 className="text-lg font-semibold mb-4">Create Stock Movement</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Inventory Item *</label>
              <select
                required
                value={formData.inventory_item_id}
                onChange={(e) => setFormData({...formData, inventory_item_id: e.target.value})}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select an item</option>
                {inventoryItems.map(item => (
                  <option key={item.id} value={item.id}>{item.name} ({item.sku})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Movement Type *</label>
              <select
                required
                value={formData.movement_type}
                onChange={(e) => setFormData({...formData, movement_type: e.target.value})}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="in">Stock In</option>
                <option value="out">Stock Out</option>
                <option value="adjustment">Adjustment</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Quantity *</label>
              <input
                type="number"
                required
                min="1"
                value={formData.quantity}
                onChange={(e) => setFormData({...formData, quantity: parseInt(e.target.value) || 0})}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Unit Cost ($)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.unit_cost}
                onChange={(e) => setFormData({...formData, unit_cost: parseFloat(e.target.value) || 0})}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                rows="2"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Create Movement
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const openModal = (type, item = null) => {
    setModalType(type);
    setSelectedItem(item);
    setShowModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
        <div className="space-x-2">
          {currentView === 'items' && (
            <>
              <button
                onClick={() => openModal('create')}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Add Item
              </button>
              <button
                onClick={() => openModal('movement')}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Stock Movement
              </button>
            </>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'items', label: 'Inventory Items', count: inventoryItems.length },
            { key: 'movements', label: 'Stock Movements', count: stockMovements.length },
            { key: 'alerts', label: 'Low Stock Alerts', count: lowStockAlerts.filter(alert => !alert.is_acknowledged).length },
            { key: 'purchase-orders', label: 'Purchase Orders', count: purchaseOrders.length },
            { key: 'analytics', label: 'Analytics', count: null }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setCurrentView(tab.key)}
              className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                currentView === tab.key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
              {tab.count !== null && (
                <span className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                  currentView === tab.key ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-900'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Filters for Items */}
      {currentView === 'items' && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Search</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && loadInventoryItems()}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Search items..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Category</label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={filterLowStock}
                  onChange={(e) => setFilterLowStock(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 shadow-sm focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Low Stock Only</span>
              </label>
            </div>
            <div className="flex items-end">
              <button
                onClick={loadInventoryItems}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Content Area */}
      {currentView === 'items' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {inventoryItems.map(item => (
            <div key={item.id} className="bg-white p-6 rounded-lg shadow border">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                  <p className="text-sm text-gray-600">SKU: {item.sku}</p>
                  <p className="text-sm text-gray-600 capitalize">Category: {item.category}</p>
                </div>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                  item.stock_quantity <= item.min_stock_level
                    ? 'bg-red-100 text-red-800'
                    : 'bg-green-100 text-green-800'
                }`}>
                  {item.stock_quantity <= item.min_stock_level ? 'Low Stock' : 'In Stock'}
                </span>
              </div>
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Stock:</span>
                  <span className="font-medium">{item.stock_quantity}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Min Level:</span>
                  <span>{item.min_stock_level}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Unit Cost:</span>
                  <span>${item.unit_cost?.toFixed(2) || '0.00'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Selling Price:</span>
                  <span>${item.selling_price?.toFixed(2) || '0.00'}</span>
                </div>
              </div>
              {item.location && (
                <p className="mt-2 text-sm text-gray-600">Location: {item.location}</p>
              )}
              {item.supplier_name && (
                <p className="mt-1 text-sm text-gray-600">Supplier: {item.supplier_name}</p>
              )}
              <div className="mt-4 flex space-x-2">
                <button
                  onClick={() => openModal('edit', item)}
                  className="flex-1 px-3 py-2 text-sm bg-blue-50 text-blue-700 rounded hover:bg-blue-100"
                >
                  Edit
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {currentView === 'movements' && (
        <div className="bg-white shadow rounded-lg">
          <div className="p-6">
            <div className="flow-root">
              <ul className="-mb-8">
                {stockMovements.map((movement, idx) => (
                  <li key={movement.id}>
                    <div className="relative pb-8">
                      {idx !== stockMovements.length - 1 && (
                        <span className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-gray-200" />
                      )}
                      <div className="relative flex items-start space-x-3">
                        <div className={`relative px-1 ${
                          movement.movement_type === 'in' ? 'text-green-500' : 
                          movement.movement_type === 'out' ? 'text-red-500' : 'text-blue-500'
                        }`}>
                          <div className="h-8 w-8 bg-gray-100 rounded-full ring-8 ring-white flex items-center justify-center">
                            {movement.movement_type === 'in' ? '+' : movement.movement_type === 'out' ? '-' : '~'}
                          </div>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div>
                            <div className="text-sm">
                              <span className="font-medium text-gray-900">{movement.item_name}</span>
                              <span className="text-gray-600"> ({movement.item_sku})</span>
                            </div>
                            <p className="mt-0.5 text-sm text-gray-500">
                              {movement.movement_type === 'in' ? 'Added' : 
                               movement.movement_type === 'out' ? 'Removed' : 'Adjusted'} {movement.quantity} units
                              {movement.notes && ` - ${movement.notes}`}
                            </p>
                          </div>
                          <div className="mt-2 text-sm text-gray-700">
                            <time>{new Date(movement.created_at).toLocaleString()}</time>
                            <span className="ml-4">
                              {movement.previous_quantity} → {movement.new_quantity}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {currentView === 'alerts' && (
        <div className="space-y-4">
          {lowStockAlerts.map(alert => (
            <div key={alert.id} className={`bg-white p-6 rounded-lg shadow border-l-4 ${
              alert.is_acknowledged ? 'border-gray-300' : 'border-red-500'
            }`}>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{alert.item_name}</h3>
                  <p className="text-sm text-gray-600">SKU: {alert.item_sku}</p>
                  <p className="mt-2 text-red-600">
                    Current stock: {alert.current_stock} | Minimum level: {alert.min_stock_level}
                  </p>
                  <p className="text-sm text-gray-500">
                    Alert created: {new Date(alert.alert_date).toLocaleString()}
                  </p>
                  {alert.is_acknowledged && (
                    <p className="text-sm text-gray-500">
                      Acknowledged: {new Date(alert.acknowledged_at).toLocaleString()}
                    </p>
                  )}
                </div>
                {!alert.is_acknowledged && (
                  <button
                    onClick={() => acknowledgeAlert(alert.id)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Acknowledge
                  </button>
                )}
              </div>
            </div>
          ))}
          {lowStockAlerts.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No low stock alerts</p>
            </div>
          )}
        </div>
      )}

      {currentView === 'purchase-orders' && (
        <div className="space-y-4">
          {purchaseOrders.map(po => (
            <div key={po.id} className="bg-white p-6 rounded-lg shadow">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">PO #{po.po_number}</h3>
                  <p className="text-sm text-gray-600">Supplier: {po.supplier_name}</p>
                  <p className="text-sm text-gray-600">
                    Order Date: {new Date(po.order_date).toLocaleDateString()}
                  </p>
                  {po.expected_delivery_date && (
                    <p className="text-sm text-gray-600">
                      Expected: {new Date(po.expected_delivery_date).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    po.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    po.status === 'received' ? 'bg-green-100 text-green-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {po.status.charAt(0).toUpperCase() + po.status.slice(1)}
                  </span>
                  <p className="mt-2 text-lg font-semibold text-gray-900">
                    ${po.total_amount?.toFixed(2) || '0.00'}
                  </p>
                </div>
              </div>
              {po.items && po.items.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Items ({po.items.length})</h4>
                  <div className="text-sm text-gray-600">
                    {po.items.slice(0, 3).map((item, idx) => (
                      <div key={idx}>• Qty: {item.quantity} @ ${item.unit_cost}</div>
                    ))}
                    {po.items.length > 3 && <div>... and {po.items.length - 3} more items</div>}
                  </div>
                </div>
              )}
            </div>
          ))}
          {purchaseOrders.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No purchase orders</p>
            </div>
          )}
        </div>
      )}

      {currentView === 'analytics' && analytics && (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">Total Items</p>
                  <p className="text-2xl font-semibold text-gray-900">{analytics.total_items}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">Total Value</p>
                  <p className="text-2xl font-semibold text-gray-900">${analytics.total_value?.toFixed(2) || '0.00'}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">Low Stock Items</p>
                  <p className="text-2xl font-semibold text-red-600">{analytics.low_stock_items}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">Out of Stock</p>
                  <p className="text-2xl font-semibold text-red-700">{analytics.out_of_stock_items}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Category Breakdown */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Category Breakdown</h3>
            <div className="space-y-3">
              {Object.entries(analytics.category_breakdown || {}).map(([category, count]) => (
                <div key={category} className="flex justify-between items-center">
                  <span className="text-gray-600 capitalize">{category}</span>
                  <span className="font-semibold">{count} items</span>
                </div>
              ))}
            </div>
          </div>

          {/* Top Used Items */}
          {analytics.top_used_items && analytics.top_used_items.length > 0 && (
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Most Used Items</h3>
              <div className="space-y-3">
                {analytics.top_used_items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center">
                    <div>
                      <span className="font-medium">{item.item_name}</span>
                      <span className="text-gray-600 ml-2">({item.item_sku})</span>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{item.total_used} used</div>
                      <div className="text-sm text-gray-600">${item.total_cost?.toFixed(2) || '0.00'} total</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Movements */}
          {analytics.recent_movements && analytics.recent_movements.length > 0 && (
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Movements</h3>
              <div className="space-y-3">
                {analytics.recent_movements.map((movement, idx) => (
                  <div key={idx} className="flex justify-between items-center">
                    <div>
                      <span className="font-medium">{movement.item_name}</span>
                      <span className={`ml-2 px-2 py-1 text-xs rounded ${
                        movement.movement_type === 'in' ? 'bg-green-100 text-green-800' :
                        movement.movement_type === 'out' ? 'bg-red-100 text-red-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {movement.movement_type}
                      </span>
                    </div>
                    <div className="text-right text-sm">
                      <div>{movement.quantity} units</div>
                      <div className="text-gray-500">{new Date(movement.created_at).toLocaleDateString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      {showModal && modalType === 'create' && <ItemFormModal />}
      {showModal && modalType === 'edit' && <ItemFormModal />}
      {showModal && modalType === 'movement' && <StockMovementModal />}
    </div>
  );
};

export default InventoryManagement;