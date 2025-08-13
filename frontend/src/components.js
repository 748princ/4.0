import React, { useState } from 'react';

// Modal Component
export const Modal = ({ isOpen, onClose, title, children }) => {
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

// Job Form Component
export const JobForm = ({ job = null, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    title: job?.title || '',
    client: job?.client || '',
    address: job?.address || '',
    service: job?.service || 'Plumbing',
    tech: job?.tech || '',
    date: job?.date || '',
    time: job?.time || '',
    value: job?.value || '',
    priority: job?.priority || 'medium',
    status: job?.status || 'scheduled'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...formData, id: job?.id || Date.now() });
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Client</label>
          <input
            type="text"
            value={formData.client}
            onChange={(e) => setFormData({...formData, client: e.target.value})}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
          <input
            type="text"
            value={formData.address}
            onChange={(e) => setFormData({...formData, address: e.target.value})}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Service Type</label>
          <select
            value={formData.service}
            onChange={(e) => setFormData({...formData, service: e.target.value})}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="Plumbing">Plumbing</option>
            <option value="HVAC">HVAC</option>
            <option value="Electrical">Electrical</option>
            <option value="Landscaping">Landscaping</option>
            <option value="Cleaning">Cleaning</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Technician</label>
          <select
            value={formData.tech}
            onChange={(e) => setFormData({...formData, tech: e.target.value})}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Technician</option>
            <option value="Mike Johnson">Mike Johnson</option>
            <option value="Sarah Davis">Sarah Davis</option>
            <option value="Tom Wilson">Tom Wilson</option>
            <option value="Lisa Chen">Lisa Chen</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
          <input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({...formData, date: e.target.value})}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
          <input
            type="time"
            value={formData.time}
            onChange={(e) => setFormData({...formData, time: e.target.value})}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Value ($)</label>
          <input
            type="number"
            value={formData.value}
            onChange={(e) => setFormData({...formData, value: e.target.value})}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
          <select
            value={formData.priority}
            onChange={(e) => setFormData({...formData, priority: e.target.value})}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({...formData, status: e.target.value})}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="scheduled">Scheduled</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>
      
      <div className="flex items-center justify-end space-x-4 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {job ? 'Update Job' : 'Create Job'}
        </button>
      </div>
    </form>
  );
};

// Client Form Component
export const ClientForm = ({ client = null, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    name: client?.name || '',
    contact: client?.contact || '',
    email: client?.email || '',
    phone: client?.phone || '',
    address: client?.address || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ 
      ...formData, 
      id: client?.id || Date.now(),
      jobsCount: client?.jobsCount || 0,
      totalSpent: client?.totalSpent || '$0',
      lastService: client?.lastService || new Date().toISOString().split('T')[0]
    });
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Company/Client Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person</label>
          <input
            type="text"
            value={formData.contact}
            onChange={(e) => setFormData({...formData, contact: e.target.value})}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({...formData, phone: e.target.value})}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
          <input
            type="text"
            value={formData.address}
            onChange={(e) => setFormData({...formData, address: e.target.value})}
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
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {client ? 'Update Client' : 'Add Client'}
        </button>
      </div>
    </form>
  );
};

// Invoice Form Component
export const InvoiceForm = ({ invoice = null, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    client: invoice?.client || '',
    services: invoice?.services || [''],
    amount: invoice?.amount || '',
    dueDate: invoice?.dueDate || '',
    status: invoice?.status || 'pending'
  });

  const addService = () => {
    setFormData({...formData, services: [...formData.services, '']});
  };

  const updateService = (index, value) => {
    const newServices = [...formData.services];
    newServices[index] = value;
    setFormData({...formData, services: newServices});
  };

  const removeService = (index) => {
    const newServices = formData.services.filter((_, i) => i !== index);
    setFormData({...formData, services: newServices});
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ 
      ...formData, 
      id: invoice?.id || `INV-${String(Date.now()).slice(-3)}`,
      paidDate: formData.status === 'paid' ? new Date().toISOString().split('T')[0] : null
    });
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Client</label>
          <input
            type="text"
            value={formData.client}
            onChange={(e) => setFormData({...formData, client: e.target.value})}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Amount ($)</label>
          <input
            type="number"
            value={formData.amount}
            onChange={(e) => setFormData({...formData, amount: parseFloat(e.target.value)})}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
          <input
            type="date"
            value={formData.dueDate}
            onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({...formData, status: e.target.value})}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Services</label>
        {formData.services.map((service, index) => (
          <div key={index} className="flex items-center space-x-2 mb-2">
            <input
              type="text"
              value={service}
              onChange={(e) => updateService(index, e.target.value)}
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Service description"
              required
            />
            {formData.services.length > 1 && (
              <button
                type="button"
                onClick={() => removeService(index)}
                className="text-red-600 hover:text-red-700 px-2"
              >
                Remove
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={addService}
          className="text-blue-600 hover:text-blue-700 text-sm"
        >
          + Add Service
        </button>
      </div>
      
      <div className="flex items-center justify-end space-x-4 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {invoice ? 'Update Invoice' : 'Create Invoice'}
        </button>
      </div>
    </form>
  );
};

// Navigation Component
export const Sidebar = ({ currentPage, onPageChange }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'calendar', label: 'Calendar', icon: '📅' },
    { id: 'jobs', label: 'Jobs', icon: '🔧' },
    { id: 'clients', label: 'Clients', icon: '👥' },
    { id: 'invoices', label: 'Invoices', icon: '💰' },
    { id: 'quotes', label: 'Quotes', icon: '📋' },
    { id: 'reports', label: 'Reports', icon: '📈' }
  ];

  return (
    <div className={`bg-gray-900 text-white h-screen transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-64'} fixed left-0 top-0 z-50`}>
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        {!isCollapsed && (
          <h1 className="text-xl font-bold text-blue-400">Jobber Pro</h1>
        )}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-gray-400 hover:text-white transition-colors"
        >
          {isCollapsed ? '→' : '←'}
        </button>
      </div>
      
      <nav className="mt-6">
        {menuItems.map(item => (
          <button
            key={item.id}
            onClick={() => onPageChange(item.id)}
            className={`w-full flex items-center px-4 py-3 text-left hover:bg-gray-800 transition-colors ${
              currentPage === item.id ? 'bg-blue-600 border-r-4 border-blue-400' : ''
            }`}
          >
            <span className="text-xl mr-3">{item.icon}</span>
            {!isCollapsed && <span>{item.label}</span>}
          </button>
        ))}
      </nav>
      
      <div className="absolute bottom-4 left-0 right-0 px-4">
        {!isCollapsed && (
          <div className="bg-gray-800 rounded-lg p-3">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-sm font-bold">
                JD
              </div>
              <div className="ml-2">
                <p className="text-sm font-medium">John Doe</p>
                <p className="text-xs text-gray-400">Admin</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Header Component
export const Header = ({ currentPage }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);

  const notifications = [
    { id: 1, message: 'New job assigned: Plumbing Repair', time: '5 min ago', unread: true },
    { id: 2, message: 'Invoice payment received from ABC Corp', time: '1 hour ago', unread: true },
    { id: 3, message: 'Technician Tom Wilson completed job', time: '2 hours ago', unread: false }
  ];

  return (
    <div className="bg-white shadow-sm border-b border-gray-200 h-16 fixed top-0 right-0 left-64 z-40">
      <div className="flex items-center justify-between px-6 h-full">
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-semibold text-gray-800 capitalize">{currentPage}</h2>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-gray-100 rounded-lg px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
            />
            <span className="absolute right-3 top-2.5 text-gray-400">🔍</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-gray-500 hover:text-gray-700"
              >
                🔔
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {notifications.filter(n => n.unread).length}
                </span>
              </button>
              
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 py-2">
                  <div className="px-4 py-2 border-b border-gray-200">
                    <h3 className="font-medium text-gray-900">Notifications</h3>
                  </div>
                  {notifications.map(notification => (
                    <div key={notification.id} className={`px-4 py-3 hover:bg-gray-50 ${notification.unread ? 'bg-blue-50' : ''}`}>
                      <p className="text-sm text-gray-900">{notification.message}</p>
                      <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold cursor-pointer">
              J
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Dashboard Components
export const DashboardStats = () => {
  const stats = [
    { label: 'Jobs Today', value: '24', change: '+12%', color: 'blue', icon: '🔧' },
    { label: 'Revenue', value: '$12,580', change: '+8%', color: 'green', icon: '💰' },
    { label: 'Clients', value: '156', change: '+5%', color: 'purple', icon: '👥' },
    { label: 'Completion Rate', value: '94%', change: '+2%', color: 'orange', icon: '✅' }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => (
        <div key={index} className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
              <p className={`text-sm mt-1 text-${stat.color}-600 font-medium`}>{stat.change}</p>
            </div>
            <div className={`text-3xl p-3 bg-${stat.color}-100 rounded-lg`}>
              {stat.icon}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export const RecentJobs = () => {
  const jobs = [
    { id: 1, client: 'Smith Residence', service: 'Plumbing Repair', status: 'In Progress', time: '10:30 AM', tech: 'Mike Johnson', urgent: false },
    { id: 2, client: 'ABC Corp', service: 'HVAC Maintenance', status: 'Scheduled', time: '2:00 PM', tech: 'Sarah Davis', urgent: true },
    { id: 3, client: 'Green Lawn Co', service: 'Landscaping', status: 'Completed', time: '8:00 AM', tech: 'Tom Wilson', urgent: false },
    { id: 4, client: 'Office Plaza', service: 'Cleaning Service', status: 'En Route', time: '1:15 PM', tech: 'Lisa Chen', urgent: false }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'text-green-600 bg-green-100';
      case 'In Progress': return 'text-blue-600 bg-blue-100';
      case 'En Route': return 'text-yellow-600 bg-yellow-100';
      case 'Scheduled': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Recent Jobs</h3>
        <button className="text-blue-600 hover:text-blue-700 font-medium">View All</button>
      </div>
      
      <div className="space-y-4">
        {jobs.map(job => (
          <div key={job.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <h4 className="font-medium text-gray-900">{job.client}</h4>
                  {job.urgent && <span className="bg-red-500 text-white text-xs px-2 py-1 rounded">URGENT</span>}
                </div>
                <p className="text-gray-600 text-sm">{job.service}</p>
                <p className="text-gray-500 text-xs">Assigned to: {job.tech}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{job.time}</p>
                <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(job.status)}`}>
                  {job.status}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Calendar Component
export const CalendarView = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState('week'); // day, week, month

  const jobs = [
    { id: 1, title: 'Plumbing Repair - Smith Home', time: '09:00', duration: 2, client: 'Smith Residence', tech: 'Mike Johnson' },
    { id: 2, title: 'HVAC Service - Office Building', time: '11:30', duration: 3, client: 'ABC Corp', tech: 'Sarah Davis' },
    { id: 3, title: 'Lawn Maintenance', time: '14:00', duration: 1.5, client: 'Green Lawn Co', tech: 'Tom Wilson' },
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-semibold text-gray-900">Schedule</h2>
          <div className="flex bg-gray-100 rounded-lg p-1">
            {['day', 'week', 'month'].map(v => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  view === v ? 'bg-blue-600 text-white' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {v.charAt(0).toUpperCase() + v.slice(1)}
              </button>
            ))}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button className="p-2 text-gray-500 hover:text-gray-700">←</button>
          <span className="text-lg font-medium text-gray-900">
            {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </span>
          <button className="p-2 text-gray-500 hover:text-gray-700">→</button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-4 mb-4">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center font-medium text-gray-500 py-2">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-4">
        {Array.from({ length: 35 }, (_, i) => (
          <div key={i} className="min-h-[100px] border border-gray-200 rounded p-2">
            <span className="text-sm font-medium text-gray-700">{((i % 31) + 1)}</span>
            {i === 15 && ( // Example job on day 16
              <div className="mt-1 bg-blue-100 text-blue-800 text-xs p-1 rounded">
                Plumbing Job
              </div>
            )}
            {i === 18 && ( // Example job on day 19
              <div className="mt-1 bg-green-100 text-green-800 text-xs p-1 rounded">
                HVAC Service
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// Jobs Component
export const JobsList = ({ jobs = [], onAddJob, onEditJob, onDeleteJob }) => {
  const [filter, setFilter] = useState('all');
  const [showJobModal, setShowJobModal] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const initialJobs = [
    { 
      id: 1, 
      title: 'Leak Repair', 
      client: 'Smith Residence', 
      address: '123 Main St, City', 
      status: 'scheduled', 
      priority: 'high',
      date: '2025-06-22',
      time: '10:00 AM',
      tech: 'Mike Johnson',
      service: 'Plumbing',
      value: '285'
    },
    { 
      id: 2, 
      title: 'AC Maintenance', 
      client: 'ABC Corporation', 
      address: '456 Business Ave', 
      status: 'in-progress', 
      priority: 'medium',
      date: '2025-06-22',
      time: '2:00 PM',
      tech: 'Sarah Davis',
      service: 'HVAC',
      value: '450'
    },
    { 
      id: 3, 
      title: 'Lawn Mowing', 
      client: 'Green Spaces LLC', 
      address: '789 Park Road', 
      status: 'completed', 
      priority: 'low',
      date: '2025-06-21',
      time: '8:00 AM',
      tech: 'Tom Wilson',
      service: 'Landscaping',
      value: '120'
    }
  ];

  const [jobsList, setJobsList] = useState(jobs.length > 0 ? jobs : initialJobs);

  const filteredJobs = jobsList.filter(job => {
    const matchesFilter = filter === 'all' || job.status === filter;
    const matchesSearch = searchTerm === '' || 
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.tech.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'scheduled': return 'bg-purple-100 text-purple-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const handleAddJob = () => {
    setEditingJob(null);
    setShowJobModal(true);
  };

  const handleEditJob = (job) => {
    setEditingJob(job);
    setShowJobModal(true);
  };

  const handleSaveJob = (jobData) => {
    if (editingJob) {
      setJobsList(jobsList.map(job => job.id === editingJob.id ? jobData : job));
      alert('Job updated successfully!');
    } else {
      setJobsList([...jobsList, jobData]);
      alert('Job created successfully!');
    }
    if (onAddJob) onAddJob(jobData);
  };

  const handleDeleteJob = (jobId) => {
    if (window.confirm('Are you sure you want to delete this job?')) {
      setJobsList(jobsList.filter(job => job.id !== jobId));
      alert('Job deleted successfully!');
      if (onDeleteJob) onDeleteJob(jobId);
    }
  };

  const updateJobStatus = (jobId, newStatus) => {
    setJobsList(jobsList.map(job => 
      job.id === jobId ? { ...job, status: newStatus } : job
    ));
    alert(`Job status updated to ${newStatus}!`);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Jobs ({filteredJobs.length})</h2>
          <div className="flex items-center space-x-4">
            <input
              type="text"
              placeholder="Search jobs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select 
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Jobs</option>
              <option value="scheduled">Scheduled</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
            <button 
              onClick={handleAddJob}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              + New Job
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {filteredJobs.map(job => (
            <div key={job.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(job.status)}`}>
                      {job.status.replace('-', ' ')}
                    </span>
                    <span className={`text-sm font-medium ${getPriorityColor(job.priority)}`}>
                      {job.priority} priority
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                    <div>
                      <p><strong>Client:</strong> {job.client}</p>
                      <p><strong>Address:</strong> {job.address}</p>
                    </div>
                    <div>
                      <p><strong>Service:</strong> {job.service}</p>
                      <p><strong>Technician:</strong> {job.tech}</p>
                    </div>
                    <div>
                      <p><strong>Date:</strong> {job.date}</p>
                      <p><strong>Time:</strong> {job.time}</p>
                    </div>
                  </div>
                </div>
                
                <div className="text-right ml-4">
                  <p className="text-lg font-bold text-gray-900 mb-2">${job.value}</p>
                  <div className="space-y-2">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleEditJob(job)}
                        className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDeleteJob(job.id)}
                        className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                    
                    {job.status === 'scheduled' && (
                      <button 
                        onClick={() => updateJobStatus(job.id, 'in-progress')}
                        className="w-full bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors"
                      >
                        Start Job
                      </button>
                    )}
                    
                    {job.status === 'in-progress' && (
                      <button 
                        onClick={() => updateJobStatus(job.id, 'completed')}
                        className="w-full bg-purple-600 text-white px-3 py-1 rounded text-sm hover:bg-purple-700 transition-colors"
                      >
                        Complete Job
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {filteredJobs.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p>No jobs found matching your criteria.</p>
              <button 
                onClick={handleAddJob}
                className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create Your First Job
              </button>
            </div>
          )}
        </div>
      </div>

      <Modal isOpen={showJobModal} onClose={() => setShowJobModal(false)} title={editingJob ? 'Edit Job' : 'Create New Job'}>
        <JobForm
          job={editingJob}
          onSave={handleSaveJob}
          onClose={() => setShowJobModal(false)}
        />
      </Modal>
    </div>
  );
};

// Clients Component
export const ClientsList = ({ clients = [], onAddClient, onEditClient }) => {
  const initialClients = [
    {
      id: 1,
      name: 'Smith Residence',
      contact: 'John Smith',
      email: 'john.smith@email.com',
      phone: '(555) 123-4567',
      address: '123 Main St, City, ST 12345',
      jobsCount: 15,
      totalSpent: '$3,240',
      lastService: '2025-06-15'
    },
    {
      id: 2,
      name: 'ABC Corporation',
      contact: 'Jane Doe',
      email: 'jane.doe@abccorp.com',
      phone: '(555) 987-6543',
      address: '456 Business Ave, City, ST 12345',
      jobsCount: 8,
      totalSpent: '$2,180',
      lastService: '2025-06-18'
    },
    {
      id: 3,
      name: 'Green Spaces LLC',
      contact: 'Mike Green',
      email: 'mike@greenspaces.com',
      phone: '(555) 456-7890',
      address: '789 Park Road, City, ST 12345',
      jobsCount: 22,
      totalSpent: '$4,560',
      lastService: '2025-06-20'
    }
  ];

  const [clientsList, setClientsList] = useState(clients.length > 0 ? clients : initialClients);
  const [showClientModal, setShowClientModal] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredClients = clientsList.filter(client =>
    searchTerm === '' || 
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.contact.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
      setClientsList(clientsList.map(client => client.id === editingClient.id ? clientData : client));
      alert('Client updated successfully!');
    } else {
      setClientsList([...clientsList, clientData]);
      alert('Client added successfully!');
    }
    if (onAddClient) onAddClient(clientData);
  };

  const handleDeleteClient = (clientId) => {
    if (window.confirm('Are you sure you want to delete this client? This action cannot be undone.')) {
      setClientsList(clientsList.filter(client => client.id !== clientId));
      alert('Client deleted successfully!');
    }
  };

  const handleScheduleJob = (client) => {
    alert(`Scheduling new job for ${client.name}. This would typically open the job creation form with client pre-filled.`);
  };

  const handleViewHistory = (client) => {
    alert(`Viewing job history for ${client.name}. This would show all past jobs and services.`);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Clients ({filteredClients.length})</h2>
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
          {filteredClients.map(client => (
            <div key={client.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{client.name}</h3>
                  <p className="text-gray-600">{client.contact}</p>
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
                  <div className="absolute right-0 mt-2 w-32 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10" style={{display: 'none'}}>
                    <button 
                      onClick={() => handleEditClient(client)}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDeleteClient(client.id)}
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
                    <p className="text-lg font-bold text-gray-900">{client.jobsCount}</p>
                    <p className="text-xs text-gray-500">Jobs</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-green-600">{client.totalSpent}</p>
                    <p className="text-xs text-gray-500">Total</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{client.lastService}</p>
                    <p className="text-xs text-gray-500">Last Service</p>
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
          ))}
          
          {filteredClients.length === 0 && (
            <div className="col-span-full text-center py-8 text-gray-500">
              <p>No clients found matching your search.</p>
              <button 
                onClick={handleAddClient}
                className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add Your First Client
              </button>
            </div>
          )}
        </div>
      </div>

      <Modal isOpen={showClientModal} onClose={() => setShowClientModal(false)} title={editingClient ? 'Edit Client' : 'Add New Client'}>
        <ClientForm
          client={editingClient}
          onSave={handleSaveClient}
          onClose={() => setShowClientModal(false)}
        />
      </Modal>
    </div>
  );
};

// Invoices Component
export const InvoicesList = ({ invoices = [], onAddInvoice }) => {
  const initialInvoices = [
    {
      id: 'INV-001',
      client: 'Smith Residence',
      amount: 285.00,
      status: 'paid',
      dueDate: '2025-06-15',
      paidDate: '2025-06-12',
      services: ['Leak Repair', 'Pipe Installation']
    },
    {
      id: 'INV-002',
      client: 'ABC Corporation',
      amount: 450.00,
      status: 'pending',
      dueDate: '2025-06-25',
      paidDate: null,
      services: ['AC Maintenance', 'Filter Replacement']
    },
    {
      id: 'INV-003',
      client: 'Green Spaces LLC',
      amount: 120.00,
      status: 'overdue',
      dueDate: '2025-06-10',
      paidDate: null,
      services: ['Lawn Mowing', 'Hedge Trimming']
    }
  ];

  const [invoicesList, setInvoicesList] = useState(invoices.length > 0 ? invoices : initialInvoices);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [filter, setFilter] = useState('all');

  const filteredInvoices = invoicesList.filter(invoice => 
    filter === 'all' || invoice.status === filter
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleAddInvoice = () => {
    setEditingInvoice(null);
    setShowInvoiceModal(true);
  };

  const handleEditInvoice = (invoice) => {
    setEditingInvoice(invoice);
    setShowInvoiceModal(true);
  };

  const handleSaveInvoice = (invoiceData) => {
    if (editingInvoice) {
      setInvoicesList(invoicesList.map(inv => inv.id === editingInvoice.id ? invoiceData : inv));
      alert('Invoice updated successfully!');
    } else {
      setInvoicesList([...invoicesList, invoiceData]);
      alert('Invoice created successfully!');
    }
    if (onAddInvoice) onAddInvoice(invoiceData);
  };

  const handleDeleteInvoice = (invoiceId) => {
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      setInvoicesList(invoicesList.filter(inv => inv.id !== invoiceId));
      alert('Invoice deleted successfully!');
    }
  };

  const handleSendInvoice = (invoice) => {
    alert(`Sending invoice ${invoice.id} to ${invoice.client}. This would typically send an email with the invoice.`);
  };

  const handleMarkPaid = (invoiceId) => {
    setInvoicesList(invoicesList.map(inv => 
      inv.id === invoiceId 
        ? { ...inv, status: 'paid', paidDate: new Date().toISOString().split('T')[0] }
        : inv
    ));
    alert('Invoice marked as paid!');
  };

  const handleViewInvoice = (invoice) => {
    alert(`Viewing invoice ${invoice.id} for ${invoice.client}. This would open the invoice details/PDF view.`);
  };

  // Calculate metrics
  const totalOutstanding = invoicesList
    .filter(inv => inv.status !== 'paid')
    .reduce((sum, inv) => sum + inv.amount, 0);
  
  const monthlyRevenue = invoicesList
    .filter(inv => inv.status === 'paid')
    .reduce((sum, inv) => sum + inv.amount, 0);
  
  const averageInvoice = invoicesList.length > 0 
    ? invoicesList.reduce((sum, inv) => sum + inv.amount, 0) / invoicesList.length
    : 0;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Invoices ({filteredInvoices.length})</h2>
          <div className="flex items-center space-x-4">
            <select 
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Invoices</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="overdue">Overdue</option>
            </select>
            <button 
              onClick={handleAddInvoice}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              + Create Invoice
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Invoice #</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Client</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Services</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Amount</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Due Date</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.map(invoice => (
                <tr key={invoice.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-4 font-medium text-blue-600 cursor-pointer" 
                      onClick={() => handleViewInvoice(invoice)}>
                    {invoice.id}
                  </td>
                  <td className="py-4 px-4 text-gray-900">{invoice.client}</td>
                  <td className="py-4 px-4 text-gray-600">
                    {invoice.services.join(', ')}
                  </td>
                  <td className="py-4 px-4 font-semibold text-gray-900">${invoice.amount}</td>
                  <td className="py-4 px-4 text-gray-600">{invoice.dueDate}</td>
                  <td className="py-4 px-4">
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(invoice.status)}`}>
                      {invoice.status}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleViewInvoice(invoice)}
                        className="text-blue-600 hover:text-blue-700 text-sm"
                      >
                        View
                      </button>
                      <button 
                        onClick={() => handleEditInvoice(invoice)}
                        className="text-gray-600 hover:text-gray-700 text-sm"
                      >
                        Edit
                      </button>
                      {invoice.status === 'pending' && (
                        <button 
                          onClick={() => handleSendInvoice(invoice)}
                          className="text-green-600 hover:text-green-700 text-sm"
                        >
                          Send
                        </button>
                      )}
                      {invoice.status !== 'paid' && (
                        <button 
                          onClick={() => handleMarkPaid(invoice.id)}
                          className="text-purple-600 hover:text-purple-700 text-sm"
                        >
                          Mark Paid
                        </button>
                      )}
                      <button 
                        onClick={() => handleDeleteInvoice(invoice.id)}
                        className="text-red-600 hover:text-red-700 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              
              {filteredInvoices.length === 0 && (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-gray-500">
                    <p>No invoices found matching your criteria.</p>
                    <button 
                      onClick={handleAddInvoice}
                      className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Create Your First Invoice
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Outstanding</h3>
          <p className="text-3xl font-bold text-red-600">${totalOutstanding.toFixed(2)}</p>
          <p className="text-gray-600 text-sm">
            {invoicesList.filter(inv => inv.status !== 'paid').length} unpaid invoices
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Monthly Revenue</h3>
          <p className="text-3xl font-bold text-green-600">${monthlyRevenue.toFixed(2)}</p>
          <p className="text-gray-600 text-sm">+12% from last month</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Average Invoice</h3>
          <p className="text-3xl font-bold text-blue-600">${averageInvoice.toFixed(2)}</p>
          <p className="text-gray-600 text-sm">Per invoice</p>
        </div>
      </div>

      <Modal isOpen={showInvoiceModal} onClose={() => setShowInvoiceModal(false)} title={editingInvoice ? 'Edit Invoice' : 'Create New Invoice'}>
        <InvoiceForm
          invoice={editingInvoice}
          onSave={handleSaveInvoice}
          onClose={() => setShowInvoiceModal(false)}
        />
      </Modal>
    </div>
  );
};

// Quotes Component
export const QuotesList = () => {
  const quotes = [
    {
      id: 'QT-001',
      client: 'New Customer',
      contact: 'Alice Johnson',
      service: 'Kitchen Plumbing Install',
      amount: 1250.00,
      status: 'sent',
      expiryDate: '2025-07-01',
      createdDate: '2025-06-20'
    },
    {
      id: 'QT-002',
      client: 'Smith Residence',
      contact: 'John Smith',
      service: 'Bathroom Renovation',
      amount: 2800.00,
      status: 'accepted',
      expiryDate: '2025-06-30',
      createdDate: '2025-06-18'
    },
    {
      id: 'QT-003',
      client: 'Office Plaza',
      contact: 'Mark Wilson',
      service: 'HVAC System Upgrade',
      amount: 4500.00,
      status: 'draft',
      expiryDate: '2025-07-15',
      createdDate: '2025-06-22'
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'expired': return 'bg-red-100 text-red-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Quotes & Estimates</h2>
          <div className="flex items-center space-x-4">
            <select className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>All Quotes</option>
              <option>Draft</option>
              <option>Sent</option>
              <option>Accepted</option>
              <option>Expired</option>
            </select>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              + New Quote
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {quotes.map(quote => (
            <div key={quote.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{quote.id}</h3>
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(quote.status)}`}>
                      {quote.status}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                    <div>
                      <p><strong>Client:</strong> {quote.client}</p>
                      <p><strong>Contact:</strong> {quote.contact}</p>
                      <p><strong>Service:</strong> {quote.service}</p>
                    </div>
                    <div>
                      <p><strong>Created:</strong> {quote.createdDate}</p>
                      <p><strong>Expires:</strong> {quote.expiryDate}</p>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900 mb-4">${quote.amount}</p>
                  <div className="space-y-2">
                    {quote.status === 'draft' && (
                      <>
                        <button className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 mr-2">
                          Send
                        </button>
                        <button className="border border-gray-300 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-50">
                          Edit
                        </button>
                      </>
                    )}
                    {quote.status === 'sent' && (
                      <button className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700">
                        Follow Up
                      </button>
                    )}
                    {quote.status === 'accepted' && (
                      <button className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700">
                        Create Job
                      </button>
                    )}
                    <br />
                    <button className="text-blue-600 hover:text-blue-700 text-sm">
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Quotes</h3>
          <p className="text-3xl font-bold text-blue-600">$8,550</p>
          <p className="text-gray-600 text-sm">3 active quotes</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Acceptance Rate</h3>
          <p className="text-3xl font-bold text-green-600">67%</p>
          <p className="text-gray-600 text-sm">Last 30 days</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Avg Quote Value</h3>
          <p className="text-3xl font-bold text-purple-600">$2,850</p>
          <p className="text-gray-600 text-sm">Per quote</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Pending Response</h3>
          <p className="text-3xl font-bold text-orange-600">2</p>
          <p className="text-gray-600 text-sm">Awaiting client response</p>
        </div>
      </div>
    </div>
  );
};

// Reports Component
export const ReportsView = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Monthly Revenue</h3>
          <p className="text-3xl font-bold text-green-600">$12,580</p>
          <div className="mt-2 flex items-center text-sm">
            <span className="text-green-600">↗ +15%</span>
            <span className="text-gray-500 ml-2">vs last month</span>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Jobs Completed</h3>
          <p className="text-3xl font-bold text-blue-600">142</p>
          <div className="mt-2 flex items-center text-sm">
            <span className="text-blue-600">↗ +8%</span>
            <span className="text-gray-500 ml-2">vs last month</span>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">New Clients</h3>
          <p className="text-3xl font-bold text-purple-600">28</p>
          <div className="mt-2 flex items-center text-sm">
            <span className="text-purple-600">↗ +22%</span>
            <span className="text-gray-500 ml-2">vs last month</span>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Avg Job Value</h3>
          <p className="text-3xl font-bold text-orange-600">$285</p>
          <div className="mt-2 flex items-center text-sm">
            <span className="text-orange-600">↗ +3%</span>
            <span className="text-gray-500 ml-2">vs last month</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trend</h3>
          <div className="h-64 flex items-end justify-between space-x-2">
            {[65, 85, 72, 88, 95, 82, 92, 78, 88, 96, 89, 85].map((height, index) => (
              <div key={index} className="bg-blue-500 rounded-t flex-1" style={{height: `${height}%`}}></div>
            ))}
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span>Jan</span>
            <span>Dec</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Service Distribution</h3>
          <div className="space-y-4">
            {[
              { service: 'Plumbing', percentage: 45, color: 'bg-blue-500' },
              { service: 'HVAC', percentage: 30, color: 'bg-green-500' },
              { service: 'Electrical', percentage: 15, color: 'bg-yellow-500' },
              { service: 'Landscaping', percentage: 10, color: 'bg-purple-500' }
            ].map((item, index) => (
              <div key={index}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-gray-700">{item.service}</span>
                  <span className="text-gray-600">{item.percentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className={`${item.color} h-2 rounded-full`} style={{width: `${item.percentage}%`}}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Technicians</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Technician</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Jobs Completed</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Revenue Generated</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Customer Rating</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Efficiency</th>
              </tr>
            </thead>
            <tbody>
              {[
                { name: 'Mike Johnson', jobs: 45, revenue: '$5,240', rating: 4.9, efficiency: '98%' },
                { name: 'Sarah Davis', jobs: 38, revenue: '$4,180', rating: 4.8, efficiency: '95%' },
                { name: 'Tom Wilson', jobs: 42, revenue: '$3,960', rating: 4.7, efficiency: '92%' },
                { name: 'Lisa Chen', jobs: 35, revenue: '$3,720', rating: 4.9, efficiency: '96%' }
              ].map((tech, index) => (
                <tr key={index} className="border-b border-gray-100">
                  <td className="py-4 px-4 font-medium text-gray-900">{tech.name}</td>
                  <td className="py-4 px-4 text-gray-600">{tech.jobs}</td>
                  <td className="py-4 px-4 font-semibold text-green-600">{tech.revenue}</td>
                  <td className="py-4 px-4">
                    <div className="flex items-center">
                      <span className="text-yellow-400 mr-1">★</span>
                      <span className="text-gray-600">{tech.rating}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-gray-600">{tech.efficiency}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};