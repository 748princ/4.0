import React, { useState, useEffect, useContext, createContext } from 'react';
import './App.css';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import axios from 'axios';
import { Toaster } from 'react-hot-toast';
import ClientsManagement from './components/ClientsManagement';
import JobForm from './components/JobForm';
import InvoicesManagement from './components/InvoicesManagement';
import ReportsAnalytics from './components/ReportsAnalytics';
import CalendarView from './components/CalendarView';
import TeamManagement from './components/TeamManagement';
import TimeTracking from './components/TimeTracking';
import CustomForms from './components/CustomForms';
import NotificationsManagement, { NotificationsProvider, NotificationBell } from './components/Notifications';
import InventoryManagement from './components/InventoryManagement';

// Enhanced UI Components
import { ThemeProvider, useTheme } from './hooks/useTheme';
import ThemeToggle from './components/ui/ThemeToggle';
import LoadingSpinner from './components/ui/LoadingSpinner';
import Button from './components/ui/Button';
import Card from './components/ui/Card';
import MobileMenu from './components/ui/MobileMenu';
import ResponsiveContainer from './components/ui/ResponsiveContainer';
import Input from './components/ui/Input';
import EnhancedModal from './components/ui/Modal';

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

// Enhanced Login Component
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
  const { isDarkMode } = useTheme();

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
    <div className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-300 ${
      isDarkMode 
        ? 'bg-gradient-to-br from-gray-900 to-gray-800' 
        : 'bg-gradient-to-br from-blue-600 to-blue-800'
    }`}>
      <ResponsiveContainer maxWidth="md" padding={false}>
        <Card className="max-w-md mx-auto animate-fade-in" shadow={true}>
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                isDarkMode ? 'bg-blue-600' : 'bg-blue-600'
              }`}>
                <span className="text-2xl">🔧</span>
              </div>
            </div>
            <h1 className={`text-3xl font-bold ${
              isDarkMode ? 'text-gray-100' : 'text-gray-900'
            }`}>
              Jobber Pro
            </h1>
            <p className={`mt-2 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Field Service Management Platform
            </p>
          </div>

          {/* Theme Toggle */}
          <div className="flex justify-end mb-6">
            <ThemeToggle />
          </div>

          {/* Tab Toggle */}
          <div className={`flex mb-6 p-1 rounded-lg ${
            isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
          }`}>
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                isLogin 
                  ? (isDarkMode 
                      ? 'bg-gray-600 text-white shadow-md' 
                      : 'bg-white text-blue-600 shadow-md')
                  : (isDarkMode 
                      ? 'text-gray-400 hover:text-gray-200' 
                      : 'text-gray-500 hover:text-gray-700')
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                !isLogin 
                  ? (isDarkMode 
                      ? 'bg-gray-600 text-white shadow-md' 
                      : 'bg-white text-blue-600 shadow-md')
                  : (isDarkMode 
                      ? 'text-gray-400 hover:text-gray-200' 
                      : 'text-gray-500 hover:text-gray-700')
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className={`mb-4 p-3 rounded-md border animate-slide-down ${
              isDarkMode 
                ? 'bg-red-900/20 border-red-500 text-red-300' 
                : 'bg-red-100 border-red-400 text-red-700'
            }`}>
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <Input
                  label="Full Name"
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleInputChange}
                  required={!isLogin}
                  placeholder="Enter your full name"
                />
                
                <Input
                  label="Company Name"
                  type="text"
                  name="company_name"
                  value={formData.company_name}
                  onChange={handleInputChange}
                  required={!isLogin}
                  placeholder="Enter your company name"
                />
                
                <Input
                  label="Phone"
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Enter your phone number (optional)"
                  helperText="Optional - for account recovery and notifications"
                />
              </>
            )}
            
            <Input
              label="Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              placeholder="Enter your email address"
            />
            
            <Input
              label="Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              placeholder="Enter your password"
              helperText={!isLogin ? "Minimum 6 characters" : ""}
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={loading}
              disabled={loading}
              className="mt-6"
            >
              {isLogin ? 'Sign In' : 'Create Account'}
            </Button>
          </form>

          {/* Demo Credentials */}
          {isLogin && (
            <Card className={`mt-6 ${
              isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
            }`} padding={true}>
              <h4 className={`text-sm font-medium mb-2 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Demo Credentials:
              </h4>
              <p className={`text-sm ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Email: demo@example.com
              </p>
              <p className={`text-sm ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Password: demo123
              </p>
            </Card>
          )}
        </Card>
      </ResponsiveContainer>
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

// Enhanced Main App Component
const MainApp = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const { isDarkMode } = useTheme();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'jobs', label: 'Jobs', icon: '🔧' },
    { id: 'calendar', label: 'Calendar', icon: '📅' },
    { id: 'clients', label: 'Clients', icon: '👥' },
    { id: 'team', label: 'Team', icon: '👨‍💼' },
    { id: 'time', label: 'Time Tracking', icon: '⏱️' },
    { id: 'forms', label: 'Custom Forms', icon: '📋' },
    { id: 'invoices', label: 'Invoices', icon: '💰' },
    { id: 'notifications', label: 'Notifications', icon: '🔔' },
    { id: 'reports', label: 'Reports', icon: '📈' }
  ];

  const renderMainContent = () => {
    switch (currentPage) {
      case 'dashboard':
        return (
          <div className="space-y-6 animate-fade-in">
            <Card className={`p-8 ${
              isDarkMode 
                ? 'bg-gradient-to-r from-blue-600 to-blue-800' 
                : 'bg-gradient-to-r from-blue-600 to-blue-800'
            } text-white shadow-xl`}>
              <div className="relative z-10">
                <h1 className="text-3xl font-bold mb-2">Welcome back, {user.full_name}!</h1>
                <p className="text-blue-100 mb-6">Here's what's happening with {user.company_name} today</p>
                <div className="flex flex-wrap gap-4">
                  <Button 
                    onClick={() => setCurrentPage('jobs')}
                    variant="secondary"
                    size="md"
                    className="bg-white text-blue-600 hover:bg-gray-100"
                  >
                    <span className="mr-2">🔧</span>
                    Schedule New Job
                  </Button>
                </div>
              </div>
            </Card>

            <DashboardStats />
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <RecentJobs />
              </div>
              
              <div className="space-y-6">
                <Card>
                  <Card.Header>
                    <Card.Title>Quick Actions</Card.Title>
                  </Card.Header>
                  <Card.Content className="space-y-3">
                    <Button 
                      onClick={() => setCurrentPage('jobs')}
                      variant="primary"
                      fullWidth
                      className="justify-start"
                    >
                      <span className="text-xl mr-3">🔧</span>
                      Create New Job
                    </Button>
                    <Button 
                      onClick={() => setCurrentPage('clients')}
                      variant="success"
                      fullWidth
                      className="justify-start"
                    >
                      <span className="text-xl mr-3">👥</span>
                      Add Client
                    </Button>
                    <Button 
                      onClick={() => setCurrentPage('invoices')}
                      variant="warning"
                      fullWidth
                      className="justify-start"
                    >
                      <span className="text-xl mr-3">💰</span>
                      Create Invoice
                    </Button>
                  </Card.Content>
                </Card>
              </div>
            </div>
          </div>
        );
      case 'jobs':
        return <JobsManagement />;
      case 'calendar':
        return <CalendarView user={user} />;
      case 'clients':
        return <ClientsManagement />;
      case 'team':
        return <TeamManagement user={user} />;
      case 'time':
        return <TimeTracking user={user} />;
      case 'forms':
        return <CustomForms user={user} />;
      case 'invoices':
        return <InvoicesManagement />;
      case 'notifications':
        return <NotificationsManagement />;
      case 'reports':
        return <ReportsAnalytics />;
      default:
        return (
          <Card className="text-center p-8">
            <div className="mb-4 text-6xl">🚧</div>
            <Card.Title className="mb-4">Coming Soon</Card.Title>
            <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
              This feature is under development.
            </p>
          </Card>
        );
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      {/* Mobile Menu */}
      <MobileMenu
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        menuItems={menuItems}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        user={user}
        onLogout={logout}
      />

      {/* Desktop Sidebar */}
      <div className={`hidden md:block h-screen w-64 fixed left-0 top-0 z-40 transition-colors duration-300 ${
        isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-900'
      } text-white border-r`}>
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h1 className="text-xl font-bold text-blue-400">Jobber Pro</h1>
          <ThemeToggle />
        </div>
        
        <nav className="mt-6 px-4">
          {menuItems.map(item => (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              className={`
                w-full flex items-center px-4 py-3 text-left rounded-md transition-all duration-200 mb-2
                ${currentPage === item.id
                  ? 'bg-blue-600 text-white shadow-md border-r-4 border-blue-400' 
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }
              `}
            >
              <span className="text-xl mr-3">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
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
              <Button 
                onClick={logout}
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-white text-xs"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Header */}
      <div className={`md:hidden h-16 fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-4 border-b transition-colors duration-300 ${
        isDarkMode 
          ? 'bg-gray-900 border-gray-700' 
          : 'bg-white border-gray-200'
      }`}>
        <button
          onClick={() => setMobileMenuOpen(true)}
          className={`p-2 rounded-md transition-colors ${
            isDarkMode 
              ? 'text-gray-300 hover:bg-gray-800' 
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        
        <h1 className={`text-xl font-bold ${
          isDarkMode ? 'text-blue-400' : 'text-blue-600'
        }`}>
          Jobber Pro
        </h1>
        
        <div className="flex items-center space-x-2">
          <ThemeToggle />
          <NotificationBell />
        </div>
      </div>

      {/* Desktop Header */}
      <div className={`hidden md:block h-16 fixed top-0 right-0 left-64 z-30 flex items-center justify-between px-6 border-b transition-colors duration-300 ${
        isDarkMode 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-gray-200'
      }`}>
        <h2 className={`text-xl font-semibold capitalize ${
          isDarkMode ? 'text-gray-100' : 'text-gray-800'
        }`}>
          {currentPage}
        </h2>
        <div className="flex items-center space-x-4">
          <NotificationBell />
          <div className={`text-sm ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            {user.company_name}
          </div>
          <Button
            onClick={logout}
            variant="ghost"
            size="sm"
            className={isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-800'}
          >
            Logout
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <main className="md:ml-64 pt-16 p-4 md:p-6">
        <ResponsiveContainer maxWidth="full">
          {renderMainContent()}
        </ResponsiveContainer>
      </main>
    </div>
  );
};

// Root App Component
const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationsProvider>
          <AppContent />
          <EnhancedToaster />
        </NotificationsProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

// Enhanced Theme-Aware Toaster
const EnhancedToaster = () => {
  const { isDarkMode } = useTheme();
  
  return (
    <Toaster 
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: isDarkMode ? '#1f2937' : '#ffffff',
          color: isDarkMode ? '#f9fafb' : '#1f2937',
          border: isDarkMode ? '1px solid #374151' : '1px solid #e5e7eb',
          borderRadius: '8px',
          boxShadow: isDarkMode 
            ? '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.15)' 
            : '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        },
        success: {
          iconTheme: {
            primary: '#10b981',
            secondary: isDarkMode ? '#1f2937' : '#ffffff',
          },
        },
        error: {
          iconTheme: {
            primary: '#ef4444',
            secondary: isDarkMode ? '#1f2937' : '#ffffff',
          },
        },
        loading: {
          iconTheme: {
            primary: '#3b82f6',
            secondary: isDarkMode ? '#1f2937' : '#ffffff',
          },
        },
      }}
    />
  );
};

const AppContent = () => {
  const { user, loading } = useAuth();
  const { isDarkMode } = useTheme();

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${
        isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
      }`}>
        <LoadingSpinner
          size="lg"
          text="Loading Jobber Pro..."
        />
      </div>
    );
  }

  return user ? <MainApp /> : <LoginForm />;
};

export default App;