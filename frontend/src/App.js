import React, { useState, useEffect, useContext, createContext } from 'react';
import './App.css';
import axios from 'axios';
import ClientsManagement from './components/ClientsManagement';
import JobForm from './components/JobForm';
import InvoicesManagement from './components/InvoicesManagement';
import ReportsAnalytics from './components/ReportsAnalytics';

// Create contexts
const AuthContext = createContext();
const ApiContext = createContext();

// API service
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

// Auth Provider Component
const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const userData = localStorage.getItem('user_data');
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { access_token, user: userData } = response.data;
      
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('user_data', JSON.stringify(userData));
      setUser(userData);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Login failed' 
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      const { access_token, user: newUser } = response.data;
      
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('user_data', JSON.stringify(newUser));
      setUser(newUser);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Registration failed' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_data');
    setUser(null);
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Login Component
const LoginForm = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    company_name: '',
    phone: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let result;
      if (isLogin) {
        result = await login(formData.email, formData.password);
      } else {
        result = await register(formData);
      }

      if (!result.success) {
        setError(result.error);
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Jobber Pro</h1>
          <p className="text-gray-600 mt-2">Field Service Management Platform</p>
        </div>

        <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              isLogin ? 'bg-white text-blue-600 shadow' : 'text-gray-500'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              !isLogin ? 'bg-white text-blue-600 shadow' : 'text-gray-500'
            }`}
          >
            Sign Up
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required={!isLogin}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company Name
                </label>
                <input
                  type="text"
                  name="company_name"
                  value={formData.company_name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required={!isLogin}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone (Optional)
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        {isLogin && (
          <div className="mt-6 text-center text-sm text-gray-600">
            <p>Demo Account:</p>
            <p>Email: demo@example.com | Password: demo123</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Dashboard Components
const DashboardStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/dashboard/stats');
        setStats(response.data);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <div className="animate-pulse">Loading stats...</div>;
  }

  if (!stats) {
    return <div className="text-red-500">Failed to load dashboard stats</div>;
  }

  const statCards = [
    { label: 'Jobs Today', value: stats.jobs_today, change: '+12%', color: 'blue', icon: '🔧' },
    { label: 'Revenue', value: `$${stats.monthly_revenue.toFixed(2)}`, change: '+8%', color: 'green', icon: '💰' },
    { label: 'Total Clients', value: stats.total_clients, change: '+5%', color: 'purple', icon: '👥' },
    { label: 'Completion Rate', value: `${stats.completion_rate}%`, change: '+2%', color: 'orange', icon: '✅' }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statCards.map((stat, index) => (
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

const RecentJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentJobs = async () => {
      try {
        const response = await api.get('/dashboard/recent-jobs');
        setJobs(response.data);
      } catch (error) {
        console.error('Error fetching recent jobs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentJobs();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'in_progress': return 'text-blue-600 bg-blue-100';
      case 'scheduled': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return <div className="animate-pulse">Loading recent jobs...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Recent Jobs</h3>
        <button className="text-blue-600 hover:text-blue-700 font-medium">View All</button>
      </div>
      
      <div className="space-y-4">
        {jobs.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No recent jobs found</p>
        ) : (
          jobs.map(job => (
            <div key={job.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{job.title}</h4>
                  <p className="text-gray-600 text-sm">{job.service_type}</p>
                  <p className="text-gray-500 text-xs">Client: {job.client_name}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {new Date(job.scheduled_date).toLocaleDateString()}
                  </p>
                  <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(job.status)}`}>
                    {job.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// Modal Component
const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
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
// Jobs Management Component
const JobsManagement = () => {
  const [jobs, setJobs] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showJobModal, setShowJobModal] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchJobs();
    fetchClients();
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await api.get('/jobs');
      setJobs(response.data);
    } catch (error) {
      console.error('Error fetching jobs:', error);
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

  const filteredJobs = jobs.filter(job => {
    const client = clients.find(c => c.id === job.client_id);
    const matchesFilter = filter === 'all' || job.status === filter;
    const matchesSearch = searchTerm === '' || 
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.service_type.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleStatusUpdate = async (jobId, newStatus) => {
    try {
      await api.put(`/jobs/${jobId}/status?status=${newStatus}`);
      fetchJobs(); // Refresh jobs list
      alert(`Job status updated to ${newStatus.replace('_', ' ')}!`);
    } catch (error) {
      console.error('Error updating job status:', error);
      alert('Failed to update job status');
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
      setJobs(jobs.map(job => job.id === editingJob.id ? jobData : job));
    } else {
      setJobs([...jobs, jobData]);
    }
    setShowJobModal(false);
    fetchJobs(); // Refresh to get updated data
  };

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this job?')) {
      return;
    }

    try {
      await api.delete(`/jobs/${jobId}`);
      setJobs(jobs.filter(job => job.id !== jobId));
      alert('Job deleted successfully!');
    } catch (error) {
      console.error('Error deleting job:', error);
      alert('Failed to delete job');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'scheduled': return 'bg-purple-100 text-purple-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'text-red-600';
      case 'high': return 'text-orange-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  if (loading) {
    return <div className="animate-pulse p-8">Loading jobs...</div>;
  }

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
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
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
          {filteredJobs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>
                {searchTerm || filter !== 'all' 
                  ? 'No jobs found matching your criteria.' 
                  : 'No jobs found.'
                }
              </p>
              <button 
                onClick={handleAddJob}
                className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create Your First Job
              </button>
            </div>
          ) : (
            filteredJobs.map(job => {
              const client = clients.find(c => c.id === job.client_id);
              return (
                <div key={job.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(job.status)}`}>
                          {job.status.replace('_', ' ')}
                        </span>
                        <span className={`text-sm font-medium ${getPriorityColor(job.priority)}`}>
                          {job.priority} priority
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                        <div>
                          <p><strong>Client:</strong> {client?.name || 'Unknown'}</p>
                          <p><strong>Service:</strong> {job.service_type}</p>
                        </div>
                        <div>
                          <p><strong>Scheduled:</strong> {new Date(job.scheduled_date).toLocaleString()}</p>
                          <p><strong>Duration:</strong> {job.estimated_duration} min</p>
                        </div>
                        <div>
                          <p><strong>Estimated Cost:</strong> ${job.estimated_cost}</p>
                          {job.actual_cost && <p><strong>Actual Cost:</strong> ${job.actual_cost}</p>}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right ml-4">
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
                            onClick={() => handleStatusUpdate(job.id, 'in_progress')}
                            className="w-full bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors"
                          >
                            Start Job
                          </button>
                        )}
                        
                        {job.status === 'in_progress' && (
                          <button 
                            onClick={() => handleStatusUpdate(job.id, 'completed')}
                            className="w-full bg-purple-600 text-white px-3 py-1 rounded text-sm hover:bg-purple-700 transition-colors"
                          >
                            Complete Job
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

// Main App Component
const MainApp = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const { user, logout } = useAuth();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'jobs', label: 'Jobs', icon: '🔧' },
    { id: 'clients', label: 'Clients', icon: '👥' },
    { id: 'invoices', label: 'Invoices', icon: '💰' },
    { id: 'reports', label: 'Reports', icon: '📈' }
  ];

  const renderMainContent = () => {
    switch (currentPage) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-8 text-white">
              <div className="relative z-10">
                <h1 className="text-3xl font-bold mb-2">Welcome back, {user.full_name}!</h1>
                <p className="text-blue-100 mb-6">Here's what's happening with {user.company_name} today</p>
                <div className="flex space-x-4">
                  <button 
                    onClick={() => setCurrentPage('jobs')}
                    className="bg-white text-blue-600 px-6 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                  >
                    Schedule New Job
                  </button>
                </div>
              </div>
            </div>

            <DashboardStats />
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <RecentJobs />
              </div>
              
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                  <div className="space-y-3">
                    <button 
                      onClick={() => setCurrentPage('jobs')}
                      className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition-colors text-left flex items-center"
                    >
                      <span className="text-xl mr-3">🔧</span>
                      Create New Job
                    </button>
                    <button 
                      onClick={() => setCurrentPage('clients')}
                      className="w-full bg-green-600 text-white p-3 rounded-lg hover:bg-green-700 transition-colors text-left flex items-center"
                    >
                      <span className="text-xl mr-3">👥</span>
                      Add Client
                    </button>
                    <button 
                      onClick={() => setCurrentPage('invoices')}
                      className="w-full bg-purple-600 text-white p-3 rounded-lg hover:bg-purple-700 transition-colors text-left flex items-center"
                    >
                      <span className="text-xl mr-3">💰</span>
                      Create Invoice
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'jobs':
        return <JobsManagement />;
      case 'clients':
        return <ClientsManagement />;
      case 'invoices':
        return <InvoicesManagement />;
      case 'reports':
        return <ReportsAnalytics />;
      default:
        return (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Coming Soon</h2>
            <p className="text-gray-600">This feature is under development.</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="bg-gray-900 text-white h-screen w-64 fixed left-0 top-0 z-50">
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h1 className="text-xl font-bold text-blue-400">Jobber Pro</h1>
        </div>
        
        <nav className="mt-6">
          {menuItems.map(item => (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              className={`w-full flex items-center px-4 py-3 text-left hover:bg-gray-800 transition-colors ${
                currentPage === item.id ? 'bg-blue-600 border-r-4 border-blue-400' : ''
              }`}
            >
              <span className="text-xl mr-3">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
        
        <div className="absolute bottom-4 left-0 right-0 px-4">
          <div className="bg-gray-800 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{user.full_name}</p>
                <p className="text-xs text-gray-400">{user.company_name}</p>
              </div>
              <button 
                onClick={logout}
                className="text-gray-400 hover:text-white text-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 h-16 fixed top-0 right-0 left-64 z-40">
        <div className="flex items-center justify-between px-6 h-full">
          <h2 className="text-xl font-semibold text-gray-800 capitalize">{currentPage}</h2>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-600">
              {user.company_name}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="ml-64 pt-16 p-6">
        {renderMainContent()}
      </main>
    </div>
  );
};

// Root App Component
const App = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

const AppContent = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse text-lg">Loading...</div>
      </div>
    );
  }

  return user ? <MainApp /> : <LoginForm />;
};

export default App;