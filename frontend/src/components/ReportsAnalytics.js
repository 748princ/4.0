import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';

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

// Color palette for charts
const COLORS = {
  primary: '#2563eb',
  secondary: '#10b981',
  accent: '#f59e0b',
  danger: '#ef4444',
  purple: '#8b5cf6',
  orange: '#f97316',
  teal: '#14b8a6',
  pink: '#ec4899',
  indigo: '#6366f1',
  gray: '#6b7280'
};

const CHART_COLORS = [
  COLORS.primary, COLORS.secondary, COLORS.accent, COLORS.purple, 
  COLORS.orange, COLORS.teal, COLORS.pink, COLORS.indigo
];

// Revenue Analytics Component
const RevenueAnalytics = () => {
  const [revenueData, setRevenueData] = useState([]);
  const [period, setPeriod] = useState('monthly');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRevenueData();
  }, [period]);

  const fetchRevenueData = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/analytics/revenue?period=${period}`);
      setRevenueData(response.data.data);
    } catch (error) {
      console.error('Error fetching revenue data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="animate-pulse bg-gray-200 h-64 rounded-lg"></div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Revenue Trends</h3>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="monthly">Monthly</option>
          <option value="quarterly">Quarterly</option>
          <option value="yearly">Yearly</option>
        </select>
      </div>
      
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={revenueData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="period" />
          <YAxis />
          <Tooltip 
            formatter={(value, name) => [`$${value.toFixed(2)}`, 'Revenue']}
            labelFormatter={(label) => `Period: ${label}`}
          />
          <Area 
            type="monotone" 
            dataKey="revenue" 
            stroke={COLORS.primary} 
            fill={COLORS.primary}
            fillOpacity={0.6}
          />
        </AreaChart>
      </ResponsiveContainer>
      
      <div className="mt-4 text-sm text-gray-600">
        Total Revenue: ${revenueData.reduce((sum, item) => sum + item.revenue, 0).toFixed(2)}
      </div>
    </div>
  );
};

// Job Analytics Component
const JobAnalytics = () => {
  const [jobData, setJobData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJobData();
  }, []);

  const fetchJobData = async () => {
    try {
      const response = await api.get('/analytics/jobs');
      setJobData(response.data);
    } catch (error) {
      console.error('Error fetching job data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="animate-pulse bg-gray-200 h-64 rounded-lg"></div>;
  }

  if (!jobData) {
    return <div className="bg-white rounded-lg shadow-md p-6 text-center text-gray-500">No job data available</div>;
  }

  // Prepare data for charts
  const statusData = Object.entries(jobData.status_distribution).map(([status, count]) => ({
    name: status.replace('_', ' ').toUpperCase(),
    value: count
  }));

  const serviceData = Object.entries(jobData.service_type_distribution).map(([service, count]) => ({
    name: service,
    jobs: count,
    revenue: jobData.service_type_revenue[service] || 0
  }));

  const priorityData = Object.entries(jobData.priority_distribution).map(([priority, count]) => ({
    name: priority.toUpperCase(),
    value: count
  }));

  return (
    <div className="space-y-6">
      {/* Job Status Distribution */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Job Status Distribution</h3>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={statusData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {statusData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Service Type Performance */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Service Type Performance</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={serviceData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip />
            <Legend />
            <Bar yAxisId="left" dataKey="jobs" fill={COLORS.primary} name="Job Count" />
            <Bar yAxisId="right" dataKey="revenue" fill={COLORS.secondary} name="Revenue ($)" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Priority Distribution */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Job Priority Distribution</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={priorityData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {priorityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          
          <div className="space-y-3">
            {priorityData.map((item, index) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                  ></div>
                  <span className="font-medium">{item.name}</span>
                </div>
                <span className="text-gray-600">{item.value} jobs</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Client Analytics Component
const ClientAnalytics = () => {
  const [clientData, setClientData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClientData();
  }, []);

  const fetchClientData = async () => {
    try {
      const response = await api.get('/analytics/clients');
      setClientData(response.data);
    } catch (error) {
      console.error('Error fetching client data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="animate-pulse bg-gray-200 h-64 rounded-lg"></div>;
  }

  if (!clientData || clientData.clients.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 text-center text-gray-500">
        No client data available
      </div>
    );
  }

  // Top 10 clients by revenue
  const topClients = clientData.clients.slice(0, 10);

  return (
    <div className="space-y-6">
      {/* Client Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <div className="text-3xl font-bold text-blue-600">{clientData.summary.total_clients}</div>
          <div className="text-gray-600">Total Clients</div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <div className="text-3xl font-bold text-green-600">{clientData.summary.active_clients}</div>
          <div className="text-gray-600">Active Clients</div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <div className="text-3xl font-bold text-purple-600">
            ${clientData.summary.avg_revenue_per_client.toFixed(0)}
          </div>
          <div className="text-gray-600">Avg Revenue/Client</div>
        </div>
      </div>

      {/* Top Clients by Revenue */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Clients by Revenue</h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={topClients} layout="horizontal">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis dataKey="client_name" type="category" width={120} />
            <Tooltip formatter={(value) => [`$${value.toFixed(2)}`, 'Revenue']} />
            <Bar dataKey="total_revenue" fill={COLORS.secondary} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Client Details Table */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Client Performance Details</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-900">Client</th>
                <th className="px-4 py-3 text-center font-medium text-gray-900">Total Jobs</th>
                <th className="px-4 py-3 text-center font-medium text-gray-900">Completion Rate</th>
                <th className="px-4 py-3 text-right font-medium text-gray-900">Revenue</th>
                <th className="px-4 py-3 text-right font-medium text-gray-900">Outstanding</th>
                <th className="px-4 py-3 text-center font-medium text-gray-900">Payment Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {topClients.map((client, index) => (
                <tr key={client.client_id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-4 py-3 font-medium text-gray-900">{client.client_name}</td>
                  <td className="px-4 py-3 text-center text-gray-600">{client.total_jobs}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      client.completion_rate >= 80 ? 'bg-green-100 text-green-800' :
                      client.completion_rate >= 60 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {client.completion_rate}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-green-600">
                    ${client.total_revenue.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-right text-red-600">
                    ${client.outstanding_amount.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      client.payment_rate >= 80 ? 'bg-green-100 text-green-800' :
                      client.payment_rate >= 60 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {client.payment_rate}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Business Insights Component
const BusinessInsights = () => {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInsights();
  }, []);

  const fetchInsights = async () => {
    try {
      const response = await api.get('/analytics/business-insights');
      setInsights(response.data);
    } catch (error) {
      console.error('Error fetching business insights:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="animate-pulse bg-gray-200 h-64 rounded-lg"></div>;
  }

  if (!insights) {
    return <div className="bg-white rounded-lg shadow-md p-6 text-center text-gray-500">No insights available</div>;
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
              <p className="text-2xl font-bold text-green-600">
                ${insights.revenue_metrics.current_month.toFixed(2)}
              </p>
              <p className={`text-sm mt-1 ${
                insights.revenue_metrics.growth_rate >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {insights.revenue_metrics.growth_rate >= 0 ? '↗' : '↘'} {Math.abs(insights.revenue_metrics.growth_rate)}%
              </p>
            </div>
            <div className="text-3xl">💰</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Jobs This Month</p>
              <p className="text-2xl font-bold text-blue-600">{insights.operational_metrics.jobs_this_month}</p>
              <p className="text-sm text-gray-500 mt-1">
                {insights.operational_metrics.completion_rate}% completed
              </p>
            </div>
            <div className="text-3xl">🔧</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Avg Job Value</p>
              <p className="text-2xl font-bold text-purple-600">
                ${insights.operational_metrics.average_job_value}
              </p>
              <p className="text-sm text-gray-500 mt-1">Per completed job</p>
            </div>
            <div className="text-3xl">📊</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Outstanding</p>
              <p className="text-2xl font-bold text-red-600">
                ${insights.payment_insights.outstanding_amount.toFixed(2)}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {insights.payment_insights.overdue_invoices_count} overdue
              </p>
            </div>
            <div className="text-3xl">⚠️</div>
          </div>
        </div>
      </div>

      {/* Top Services */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Services</h3>
        <div className="space-y-4">
          {insights.top_services.map((service, index) => (
            <div key={service.name} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full font-bold">
                  {index + 1}
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{service.name}</h4>
                  <p className="text-sm text-gray-600">{service.count} jobs completed</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-green-600">${service.revenue.toFixed(2)}</p>
                <p className="text-sm text-gray-500">Total Revenue</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Revenue Growth Chart */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Growth Trend</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div>
            <p className="text-sm text-gray-600">Yearly Total</p>
            <p className="text-xl font-bold text-blue-600">
              ${insights.revenue_metrics.yearly_total.toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Monthly Average</p>
            <p className="text-xl font-bold text-purple-600">
              ${insights.revenue_metrics.average_monthly.toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Growth Rate</p>
            <p className={`text-xl font-bold ${
              insights.revenue_metrics.growth_rate >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {insights.revenue_metrics.growth_rate >= 0 ? '+' : ''}{insights.revenue_metrics.growth_rate}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Reports & Analytics Component
const ReportsAnalytics = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: 'Business Overview', icon: '📊' },
    { id: 'revenue', label: 'Revenue Analytics', icon: '💰' },
    { id: 'jobs', label: 'Job Performance', icon: '🔧' },
    { id: 'clients', label: 'Client Analytics', icon: '👥' }
  ];

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'overview':
        return <BusinessInsights />;
      case 'revenue':
        return <RevenueAnalytics />;
      case 'jobs':
        return <JobAnalytics />;
      case 'clients':
        return <ClientAnalytics />;
      default:
        return <BusinessInsights />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Reports & Analytics</h1>
        <p className="text-gray-600">Comprehensive business insights and performance metrics</p>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="text-lg">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
        
        <div className="p-6">
          {renderActiveTab()}
        </div>
      </div>
    </div>
  );
};

export default ReportsAnalytics;