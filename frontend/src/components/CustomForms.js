import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const CustomForms = ({ user }) => {
  const [forms, setForms] = useState([]);
  const [selectedForm, setSelectedForm] = useState(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('forms');

  // Get base URL from environment
  const baseURL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

  // Create axios instance with auth
  const api = axios.create({
    baseURL: `${baseURL}/api`,
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });

  useEffect(() => {
    loadForms();
  }, []);

  const loadForms = async () => {
    try {
      setLoading(true);
      const response = await api.get('/forms');
      setForms(response.data);
    } catch (error) {
      console.error('Error loading forms:', error);
      toast.error('Failed to load custom forms');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateForm = () => {
    setSelectedForm(null);
    setShowFormModal(true);
  };

  const handleEditForm = (form) => {
    setSelectedForm(form);
    setShowFormModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Custom Forms</h2>
        <button
          onClick={handleCreateForm}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Create Form
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'forms', name: 'Form Templates' },
            { id: 'submissions', name: 'Form Submissions' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'forms' ? (
        <FormsTab 
          forms={forms}
          onEditForm={handleEditForm}
          api={api}
          loadForms={loadForms}
        />
      ) : (
        <SubmissionsTab api={api} />
      )}

      {/* Form Modal */}
      {showFormModal && (
        <FormModal
          form={selectedForm}
          onClose={() => {
            setShowFormModal(false);
            setSelectedForm(null);
          }}
          onSuccess={() => {
            loadForms();
            setShowFormModal(false);
            setSelectedForm(null);
          }}
          api={api}
        />
      )}
    </div>
  );
};

// Forms Tab Component
const FormsTab = ({ forms, onEditForm, api, loadForms }) => {
  const handleToggleForm = async (formId, isActive) => {
    try {
      await api.put(`/forms/${formId}`, { is_active: !isActive });
      toast.success(`Form ${!isActive ? 'activated' : 'deactivated'} successfully`);
      loadForms();
    } catch (error) {
      console.error('Error updating form:', error);
      toast.error('Failed to update form');
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {forms.length > 0 ? (
        forms.map(form => (
          <div key={form.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">{form.name}</h3>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                form.is_active 
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {form.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>

            {form.description && (
              <p className="text-sm text-gray-600 mb-4">{form.description}</p>
            )}

            <div className="space-y-3">
              <div>
                <span className="text-sm font-medium text-gray-700">Fields: </span>
                <span className="text-sm text-gray-600">{form.fields?.length || 0}</span>
              </div>

              {form.service_types && form.service_types.length > 0 && (
                <div>
                  <span className="text-sm font-medium text-gray-700 mb-2 block">Service Types:</span>
                  <div className="flex flex-wrap gap-1">
                    {form.service_types.map((service, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                      >
                        {service}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-between items-center">
              <button
                onClick={() => onEditForm(form)}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Edit Form
              </button>
              
              <button
                onClick={() => handleToggleForm(form.id, form.is_active)}
                className={`text-sm font-medium ${
                  form.is_active 
                    ? 'text-red-600 hover:text-red-800'
                    : 'text-green-600 hover:text-green-800'
                }`}
              >
                {form.is_active ? 'Deactivate' : 'Activate'}
              </button>
            </div>
          </div>
        ))
      ) : (
        <div className="col-span-full text-center py-12">
          <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-1">No custom forms</h3>
          <p className="text-gray-500">Create your first custom form to get started</p>
        </div>
      )}
    </div>
  );
};

// Submissions Tab Component
const SubmissionsTab = ({ api }) => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSubmissions();
  }, []);

  const loadSubmissions = async () => {
    try {
      setLoading(true);
      // This would need to be implemented in the backend to get all submissions
      // For now, showing empty state
      setSubmissions([]);
    } catch (error) {
      console.error('Error loading submissions:', error);
      toast.error('Failed to load form submissions');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="text-center py-12">
      <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
      <h3 className="text-lg font-medium text-gray-900 mb-1">No submissions yet</h3>
      <p className="text-gray-500">Form submissions will appear here once technicians start filling them out</p>
    </div>
  );
};

// Form Modal Component
const FormModal = ({ form, onClose, onSuccess, api }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    service_types: [],
    fields: [],
    ...form
  });
  const [newServiceType, setNewServiceType] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (form) {
        // Update existing form
        await api.put(`/forms/${form.id}`, formData);
        toast.success('Form updated successfully');
      } else {
        // Create new form
        await api.post('/forms', formData);
        toast.success('Form created successfully');
      }

      onSuccess();
    } catch (error) {
      console.error('Error saving form:', error);
      toast.error(error.response?.data?.detail || 'Failed to save form');
    } finally {
      setLoading(false);
    }
  };

  const addServiceType = () => {
    if (newServiceType.trim() && !formData.service_types.includes(newServiceType.trim())) {
      setFormData({
        ...formData,
        service_types: [...formData.service_types, newServiceType.trim()]
      });
      setNewServiceType('');
    }
  };

  const removeServiceType = (serviceType) => {
    setFormData({
      ...formData,
      service_types: formData.service_types.filter(type => type !== serviceType)
    });
  };

  const addField = () => {
    const newField = {
      id: Date.now().toString(),
      name: '',
      label: '',
      type: 'text',
      required: false,
      options: [],
      validation: {},
      order: formData.fields.length
    };

    setFormData({
      ...formData,
      fields: [...formData.fields, newField]
    });
  };

  const updateField = (fieldId, updates) => {
    setFormData({
      ...formData,
      fields: formData.fields.map(field =>
        field.id === fieldId ? { ...field, ...updates } : field
      )
    });
  };

  const removeField = (fieldId) => {
    setFormData({
      ...formData,
      fields: formData.fields.filter(field => field.id !== fieldId)
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">
              {form ? 'Edit Form' : 'Create New Form'}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Form Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="e.g., Job Completion Checklist"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input
                  type="text"
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="Optional description"
                />
              </div>
            </div>

            {/* Service Types */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Service Types</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newServiceType}
                  onChange={(e) => setNewServiceType(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addServiceType())}
                  placeholder="Add service type..."
                  className="flex-1 border border-gray-300 rounded-md px-3 py-2"
                />
                <button
                  type="button"
                  onClick={addServiceType}
                  className="bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.service_types.map((serviceType, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
                  >
                    {serviceType}
                    <button
                      type="button"
                      onClick={() => removeServiceType(serviceType)}
                      className="ml-1 text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Form Fields */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <label className="block text-sm font-medium text-gray-700">Form Fields</label>
                <button
                  type="button"
                  onClick={addField}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  + Add Field
                </button>
              </div>

              <div className="space-y-4">
                {formData.fields.map((field, index) => (
                  <div key={field.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm font-medium text-gray-700">Field {index + 1}</span>
                      <button
                        type="button"
                        onClick={() => removeField(field.id)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Remove
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Field Name</label>
                        <input
                          type="text"
                          value={field.name}
                          onChange={(e) => updateField(field.id, { name: e.target.value })}
                          className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                          placeholder="field_name"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Label</label>
                        <input
                          type="text"
                          value={field.label}
                          onChange={(e) => updateField(field.id, { label: e.target.value })}
                          className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                          placeholder="Field Label"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Type</label>
                        <select
                          value={field.type}
                          onChange={(e) => updateField(field.id, { type: e.target.value })}
                          className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                        >
                          <option value="text">Text</option>
                          <option value="textarea">Textarea</option>
                          <option value="select">Select</option>
                          <option value="checkbox">Checkbox</option>
                          <option value="radio">Radio</option>
                          <option value="date">Date</option>
                          <option value="number">Number</option>
                        </select>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center">
                      <input
                        type="checkbox"
                        id={`required-${field.id}`}
                        checked={field.required}
                        onChange={(e) => updateField(field.id, { required: e.target.checked })}
                        className="mr-2"
                      />
                      <label htmlFor={`required-${field.id}`} className="text-sm text-gray-600">
                        Required field
                      </label>
                    </div>
                  </div>
                ))}
              </div>

              {formData.fields.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No fields added yet. Click "Add Field" to create form fields.
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-2 pt-4 border-t">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !formData.name}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Saving...' : (form ? 'Update Form' : 'Create Form')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CustomForms;