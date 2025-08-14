import React, { useState, useEffect } from 'react';
import axios from 'axios';

const api = axios.create({
  baseURL: `${process.env.REACT_APP_BACKEND_URL}/api` || 'http://localhost:8001/api',
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Invoice Form Component
const InvoiceForm = ({ onSave, onClose, jobs, clients }) => {
  const [formData, setFormData] = useState({
    client_id: '',
    job_ids: [],
    due_date: '',
    tax_rate: 0.08, // 8% default
    discount_amount: 0,
    notes: ''
  });
  const [completedJobs, setCompletedJobs] = useState([]);

  useEffect(() => {
    // Filter completed jobs
    const completed = jobs.filter(job => job.status === 'completed');
    setCompletedJobs(completed);
  }, [jobs]);

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }));
  };

  const handleJobSelection = (jobId) => {
    setFormData(prev => ({
      ...prev,
      job_ids: prev.job_ids.includes(jobId)
        ? prev.job_ids.filter(id => id !== jobId)
        : [...prev.job_ids, jobId]
    }));
  };

  const calculateTotals = () => {
    const selectedJobs = completedJobs.filter(job => formData.job_ids.includes(job.id));
    const subtotal = selectedJobs.reduce((sum, job) => sum + (job.actual_cost || job.estimated_cost || 0), 0);
    const taxAmount = subtotal * formData.tax_rate;
    const total = subtotal + taxAmount - formData.discount_amount;
    
    return { subtotal, taxAmount, total };
  };

  const { subtotal, taxAmount, total } = calculateTotals();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.job_ids.length === 0) {
      alert('Please select at least one job');
      return;
    }

    try {
      const invoiceData = {
        ...formData,
        due_date: new Date(formData.due_date).toISOString()
      };
      
      const response = await api.post('/invoices', invoiceData);
      onSave(response.data);
      alert('Invoice created successfully!');
      onClose();
    } catch (error) {
      console.error('Error creating invoice:', error);
      alert('Failed to create invoice: ' + (error.response?.data?.detail || error.message));
    }
  };

  // Get jobs for selected client
  const clientJobs = completedJobs.filter(job => 
    !formData.client_id || job.client_id === formData.client_id
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Client *
          </label>
          <select
            name="client_id"
            value={formData.client_id}
            onChange={handleInputChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Select Client</option>
            {clients.map(client => (
              <option key={client.id} value={client.id}>
                {client.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Due Date *
          </label>
          <input
            type="date"
            name="due_date"
            value={formData.due_date}
            onChange={handleInputChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Completed Jobs *
        </label>
        <div className="border border-gray-300 rounded-lg p-4 max-h-64 overflow-y-auto">
          {clientJobs.length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              {formData.client_id ? 'No completed jobs for selected client' : 'Select a client to see completed jobs'}
            </p>
          ) : (
            <div className="space-y-2">
              {clientJobs.map(job => (
                <label key={job.id} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.job_ids.includes(job.id)}
                    onChange={() => handleJobSelection(job.id)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900">{job.title}</span>
                      <span className="text-green-600 font-medium">
                        ${job.actual_cost || job.estimated_cost || 0}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{job.service_type}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(job.scheduled_date).toLocaleDateString()}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tax Rate (%)
          </label>
          <input
            type="number"
            name="tax_rate"
            value={formData.tax_rate * 100}
            onChange={(e) => setFormData(prev => ({ ...prev, tax_rate: parseFloat(e.target.value) / 100 || 0 }))}
            step="0.01"
            min="0"
            max="100"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Discount Amount ($)
          </label>
          <input
            type="number"
            name="discount_amount"
            value={formData.discount_amount}
            onChange={handleInputChange}
            step="0.01"
            min="0"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Notes
        </label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleInputChange}
          rows={3}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Additional notes for the invoice..."
        />
      </div>

      {/* Invoice Summary */}
      {formData.job_ids.length > 0 && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-3">Invoice Summary</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax ({(formData.tax_rate * 100).toFixed(1)}%):</span>
              <span>${taxAmount.toFixed(2)}</span>
            </div>
            {formData.discount_amount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount:</span>
                <span>-${formData.discount_amount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-lg border-t pt-2">
              <span>Total:</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={onClose}
          className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Create Invoice
        </button>
      </div>
    </form>
  );
};

// Main Invoices Management Component
const InvoicesManagement = () => {
  const [invoices, setInvoices] = useState([]);
  const [clients, setClients] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchInvoices();
    fetchClients();
    fetchJobs();
  }, []);

  const fetchInvoices = async () => {
    try {
      const response = await api.get('/invoices');
      setInvoices(response.data);
    } catch (error) {
      console.error('Error fetching invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchClients = async () => {
    try {
      const response = await api.get('/clients');
      setClients(response.data);
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  };

  const fetchJobs = async () => {
    try {
      const response = await api.get('/jobs');
      setJobs(response.data);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    }
  };

  const handleAddInvoice = () => {
    setShowInvoiceModal(true);
  };

  const handleSaveInvoice = (invoiceData) => {
    setInvoices([...invoices, invoiceData]);
    setShowInvoiceModal(false);
    fetchInvoices(); // Refresh to get updated data
  };

  const handleDownloadPDF = async (invoiceId, invoiceNumber) => {
    try {
      const response = await api.get(`/invoices/${invoiceId}/pdf`, {
        responseType: 'blob'
      });
      
      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice_${invoiceNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      alert('Invoice PDF downloaded successfully!');
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Failed to download PDF: ' + (error.response?.data?.detail || error.message));
    }
  };

  const handleStatusUpdate = async (invoiceId, newStatus) => {
    try {
      await api.put(`/invoices/${invoiceId}/status?status=${newStatus}`);
      fetchInvoices(); // Refresh to get updated data
      alert(`Invoice status updated to ${newStatus}!`);
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status: ' + (error.response?.data?.detail || error.message));
    }
  };

  const handleSendInvoice = async (invoice, client) => {
    // This will be implemented when we add email functionality
    alert(`Send invoice feature coming soon!\n\nInvoice: ${invoice.invoice_number}\nClient: ${client?.name}\nAmount: $${invoice.total_amount.toFixed(2)}`);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredInvoices = invoices.filter(invoice => {
    const client = clients.find(c => c.id === invoice.client_id);
    const matchesFilter = filter === 'all' || invoice.status === filter;
    const matchesSearch = searchTerm === '' || 
      invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client?.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (loading) {
    return <div className="animate-pulse p-8">Loading invoices...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Invoices ({filteredInvoices.length})</h2>
          <div className="flex items-center space-x-4">
            <input
              type="text"
              placeholder="Search invoices..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select 
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Invoices</option>
              <option value="pending">Pending</option>
              <option value="sent">Sent</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
            </select>
            <button 
              onClick={handleAddInvoice}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              + New Invoice
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {filteredInvoices.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <div className="text-6xl mb-4">📄</div>
              <p className="text-lg mb-2">
                {searchTerm || filter !== 'all' 
                  ? 'No invoices found matching your criteria.' 
                  : 'No invoices created yet.'
                }
              </p>
              <p className="text-sm mb-4">Create invoices from your completed jobs to get paid faster.</p>
              <button 
                onClick={handleAddInvoice}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create Your First Invoice
              </button>
            </div>
          ) : (
            filteredInvoices.map(invoice => {
              const client = clients.find(c => c.id === invoice.client_id);
              const invoiceJobs = jobs.filter(job => invoice.job_ids.includes(job.id));
              
              return (
                <div key={invoice.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <h3 className="text-lg font-semibold text-gray-900">
                          Invoice #{invoice.invoice_number}
                        </h3>
                        <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(invoice.status)}`}>
                          {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                        </span>
                        <span className="text-2xl font-bold text-green-600">
                          ${invoice.total_amount.toFixed(2)}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                        <div>
                          <p><strong>Client:</strong> {client?.name || 'Unknown'}</p>
                          <p><strong>Jobs:</strong> {invoiceJobs.length} job(s)</p>
                        </div>
                        <div>
                          <p><strong>Due Date:</strong> {new Date(invoice.due_date).toLocaleDateString()}</p>
                          <p><strong>Subtotal:</strong> ${invoice.subtotal.toFixed(2)}</p>
                        </div>
                        <div>
                          <p><strong>Tax:</strong> ${invoice.tax_amount.toFixed(2)}</p>
                          {invoice.discount_amount > 0 && (
                            <p><strong>Discount:</strong> -${invoice.discount_amount.toFixed(2)}</p>
                          )}
                        </div>
                      </div>
                      
                      {invoice.notes && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-700">{invoice.notes}</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="ml-6 space-y-2">
                      <button 
                        onClick={() => handleDownloadPDF(invoice.id, invoice.invoice_number)}
                        className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm flex items-center justify-center"
                      >
                        📄 Download PDF
                      </button>
                      
                      <button 
                        onClick={() => handleSendInvoice(invoice, client)}
                        className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm flex items-center justify-center"
                      >
                        📧 Send Invoice
                      </button>
                      
                      <div className="flex space-x-1">
                        {invoice.status === 'pending' && (
                          <button 
                            onClick={() => handleStatusUpdate(invoice.id, 'sent')}
                            className="flex-1 bg-blue-600 text-white px-2 py-1 rounded text-xs hover:bg-blue-700 transition-colors"
                          >
                            Mark Sent
                          </button>
                        )}
                        
                        {(invoice.status === 'sent' || invoice.status === 'pending') && (
                          <button 
                            onClick={() => handleStatusUpdate(invoice.id, 'paid')}
                            className="flex-1 bg-green-600 text-white px-2 py-1 rounded text-xs hover:bg-green-700 transition-colors"
                          >
                            Mark Paid
                          </button>
                        )}
                        
                        {invoice.status !== 'overdue' && (
                          <button 
                            onClick={() => handleStatusUpdate(invoice.id, 'overdue')}
                            className="flex-1 bg-red-600 text-white px-2 py-1 rounded text-xs hover:bg-red-700 transition-colors"
                          >
                            Overdue
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Modal */}
      {showInvoiceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Create New Invoice</h2>
              <button
                onClick={() => setShowInvoiceModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>
            <InvoiceForm
              onSave={handleSaveInvoice}
              onClose={() => setShowInvoiceModal(false)}
              jobs={jobs}
              clients={clients}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoicesManagement;