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

const JobForm = ({ job, onSave, onClose }) => {
  const [clients, setClients] = useState([]);
  const [formData, setFormData] = useState({
    title: job?.title || '',
    description: job?.description || '',
    client_id: job?.client_id || '',
    service_type: job?.service_type || 'Plumbing',
    priority: job?.priority || 'medium',
    scheduled_date: job?.scheduled_date ? new Date(job.scheduled_date).toISOString().slice(0, 16) : '',
    estimated_duration: job?.estimated_duration || 60,
    estimated_cost: job?.estimated_cost || 0,
    assigned_technician_id: job?.assigned_technician_id || ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const response = await api.get('/clients');
      setClients(response.data);
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const submitData = {
        ...formData,
        scheduled_date: new Date(formData.scheduled_date).toISOString(),
        estimated_duration: parseInt(formData.estimated_duration),
        estimated_cost: parseFloat(formData.estimated_cost)
      };

      if (job) {
        // Update existing job
        const response = await api.put(`/jobs/${job.id}`, submitData);
        onSave(response.data);
        alert('Job updated successfully!');
      } else {
        // Create new job
        const response = await api.post('/jobs', submitData);
        onSave(response.data);
        alert('Job created successfully!');
      }
      onClose();
    } catch (error) {
      console.error('Error saving job:', error);
      setError(error.response?.data?.detail || 'Failed to save job');
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
          <label className="block text-sm font-medium text-gray-700 mb-1">Job Title *</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Client *</label>
          <select
            name="client_id"
            value={formData.client_id}
            onChange={handleInputChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Select Client</option>
            {clients.map(client => (
              <option key={client.id} value={client.id}>{client.name}</option>
            ))}
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows="3"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Service Type</label>
          <select
            name="service_type"
            value={formData.service_type}
            onChange={handleInputChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="Plumbing">Plumbing</option>
            <option value="HVAC">HVAC</option>
            <option value="Electrical">Electrical</option>
            <option value="Landscaping">Landscaping</option>
            <option value="Cleaning">Cleaning</option>
            <option value="Maintenance">General Maintenance</option>
            <option value="Repair">Repair Services</option>
            <option value="Installation">Installation</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
          <select
            name="priority"
            value={formData.priority}
            onChange={handleInputChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Scheduled Date & Time *</label>
          <input
            type="datetime-local"
            name="scheduled_date"
            value={formData.scheduled_date}
            onChange={handleInputChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Duration (minutes)</label>
          <input
            type="number"
            name="estimated_duration"
            value={formData.estimated_duration}
            onChange={handleInputChange}
            min="15"
            step="15"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Cost ($)</label>
          <input
            type="number"
            name="estimated_cost"
            value={formData.estimated_cost}
            onChange={handleInputChange}
            min="0"
            step="0.01"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Assigned Technician</label>
          <select
            name="assigned_technician_id"
            value={formData.assigned_technician_id}
            onChange={handleInputChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Unassigned</option>
            <option value="tech1">Mike Johnson</option>
            <option value="tech2">Sarah Davis</option>
            <option value="tech3">Tom Wilson</option>
            <option value="tech4">Lisa Chen</option>
          </select>
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
          {loading ? 'Saving...' : (job ? 'Update Job' : 'Create Job')}
        </button>
      </div>
    </form>
  );
};

export default JobForm;