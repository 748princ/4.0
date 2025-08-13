import React, { useState, useEffect } from 'react';
import axios from 'axios';

const api = axios.create({
  baseURL: `${process.env.REACT_APP_BACKEND_URL}/api` || 'http://localhost:8001/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Modal Component
const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

// Client Form Component
const ClientForm = ({ client, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    name: client?.name || '',
    email: client?.email || '',
    phone: client?.phone || '',
    address: client?.address || '',
    contact_person: client?.contact_person || ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (client) {
        // Update existing client
        const response = await api.put(`/clients/${client.id}`, formData);
        onSave(response.data);
        alert('Client updated successfully!');
      } else {
        // Create new client
        const response = await api.post('/clients', formData);
        onSave(response.data);
        alert('Client created successfully!');
      }
      onClose();
    } catch (error) {
      console.error('Error saving client:', error);
      setError(error.response?.data?.detail || 'Failed to save client');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Company/Client Name *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Contact Person
          </label>
          <input
            type="text"
            name="contact_person"
            value={formData.contact_person}
            onChange={handleInputChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email *
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone *
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Address *
          </label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
      </div>
      
      <div className="flex items-center justify-end space-x-4 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          disabled={loading}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading}
        >
          {loading ? 'Saving...' : (client ? 'Update Client' : 'Add Client')}
        </button>
      </div>
    </form>
  );
};

// Main Clients Component
const ClientsManagement = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showClientModal, setShowClientModal] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const response = await api.get('/clients');
      setClients(response.data);
    } catch (error) {
      console.error('Error fetching clients:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredClients = clients.filter(client =>
    searchTerm === '' || 
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.contact_person?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddClient = () => {
    setEditingClient(null);
    setShowClientModal(true);
  };

  const handleEditClient = (client) => {
    setEditingClient(client);
    setShowClientModal(true);
  };

  const handleSaveClient = (clientData) => {
    if (editingClient) {
      setClients(clients.map(client => 
        client.id === editingClient.id ? clientData : client
      ));
    } else {
      setClients([...clients, clientData]);
    }
    setShowClientModal(false);
  };

  const handleDeleteClient = async (clientId) => {
    if (!window.confirm('Are you sure you want to delete this client? This action cannot be undone.')) {
      return;
    }

    try {
      await api.delete(`/clients/${clientId}`);
      setClients(clients.filter(client => client.id !== clientId));
      alert('Client deleted successfully!');
    } catch (error) {
      console.error('Error deleting client:', error);
      alert('Failed to delete client');
    }
  };

  const handleScheduleJob = (client) => {
    alert(`Scheduling new job for ${client.name}. This would open the job creation form with client pre-filled.`);
  };

  const handleViewHistory = (client) => {
    alert(`Viewing job history for ${client.name}. This would show all past jobs and services.`);
  };

  if (loading) {
    return <div className="animate-pulse p-8">Loading clients...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Clients ({filteredClients.length})
          </h2>
          <div className="flex items-center space-x-4">
            <input
              type="text"
              placeholder="Search clients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button 
              onClick={handleAddClient}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              + Add Client
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredClients.length === 0 ? (
            <div className="col-span-full text-center py-8 text-gray-500">
              <p>
                {searchTerm ? 'No clients found matching your search.' : 'No clients found.'}
              </p>
              <button 
                onClick={handleAddClient}
                className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add Your First Client
              </button>
            </div>
          ) : (
            filteredClients.map(client => (
              <div key={client.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{client.name}</h3>
                    <p className="text-gray-600">{client.contact_person}</p>
                  </div>
                  <div className="relative">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        const menu = e.target.nextElementSibling;
                        menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
                      }}
                      className="text-gray-400 hover:text-gray-600 p-1"
                    >
                      ⋮
                    </button>
                    <div 
                      className="absolute right-0 mt-2 w-32 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10" 
                      style={{display: 'none'}}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button 
                        onClick={() => {
                          handleEditClient(client);
                          // Hide menu
                          document.querySelectorAll('[style*="display: block"]').forEach(el => {
                            if (el.classList.contains('absolute')) el.style.display = 'none';
                          });
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => {
                          handleDeleteClient(client.id);
                          // Hide menu
                          document.querySelectorAll('[style*="display: block"]').forEach(el => {
                            if (el.classList.contains('absolute')) el.style.display = 'none';
                          });
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <p>📧 {client.email}</p>
                  <p>📞 {client.phone}</p>
                  <p>📍 {client.address}</p>
                </div>
                
                <div className="border-t border-gray-200 pt-4">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-lg font-bold text-gray-900">{client.total_jobs || 0}</p>
                      <p className="text-xs text-gray-500">Jobs</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-green-600">
                        ${client.total_revenue ? client.total_revenue.toFixed(2) : '0.00'}
                      </p>
                      <p className="text-xs text-gray-500">Total</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {client.created_at ? new Date(client.created_at).toLocaleDateString() : 'N/A'}
                      </p>
                      <p className="text-xs text-gray-500">Joined</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 space-y-2">
                  <button 
                    onClick={() => handleScheduleJob(client)}
                    className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Schedule Job
                  </button>
                  <button 
                    onClick={() => handleViewHistory(client)}
                    className="w-full border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    View History
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <Modal 
        isOpen={showClientModal} 
        onClose={() => setShowClientModal(false)} 
        title={editingClient ? 'Edit Client' : 'Add New Client'}
      >
        <ClientForm
          client={editingClient}
          onSave={handleSaveClient}
          onClose={() => setShowClientModal(false)}
        />
      </Modal>
    </div>
  );
};

export default ClientsManagement;