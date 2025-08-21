import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const TeamManagement = ({ user }) => {
  const [technicians, setTechnicians] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [timeEntries, setTimeEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTechnicianModal, setShowTechnicianModal] = useState(false);
  const [selectedTechnician, setSelectedTechnician] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Get base URL from environment
  const baseURL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

  // Create axios instance with auth
  const api = axios.create({
    baseURL: `${baseURL}/api`,
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('access_token')}`
    }
  });

  useEffect(() => {
    loadTeamData();
  }, []);

  const loadTeamData = async () => {
    try {
      setLoading(true);
      const [techniciansRes, jobsRes, timeEntriesRes] = await Promise.all([
        api.get('/technicians'),
        api.get('/jobs'),
        api.get('/time-entries')
      ]);

      setTechnicians(techniciansRes.data);
      setJobs(jobsRes.data);
      setTimeEntries(timeEntriesRes.data);
    } catch (error) {
      console.error('Error loading team data:', error);
      toast.error('Failed to load team data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTechnician = () => {
    setSelectedTechnician(null);
    setShowTechnicianModal(true);
  };

  const handleEditTechnician = (technician) => {
    setSelectedTechnician(technician);
    setShowTechnicianModal(true);
  };

  const getTechnicianStats = (technicianId) => {
    const techJobs = jobs.filter(job => job.assigned_technician_id === technicianId);
    const completedJobs = techJobs.filter(job => job.status === 'completed');
    const techTimeEntries = timeEntries.filter(entry => entry.technician_id === technicianId);
    
    const totalHours = techTimeEntries.reduce((total, entry) => {
      if (entry.end_time) {
        const start = new Date(entry.start_time);
        const end = new Date(entry.end_time);
        const hours = (end - start) / (1000 * 60 * 60);
        return total + hours;
      }
      return total;
    }, 0);

    const totalRevenue = completedJobs.reduce((total, job) => {
      return total + (job.actual_cost || job.estimated_cost || 0);
    }, 0);

    return {
      totalJobs: techJobs.length,
      completedJobs: completedJobs.length,
      totalHours: Math.round(totalHours * 100) / 100,
      totalRevenue: totalRevenue,
      completionRate: techJobs.length > 0 ? Math.round((completedJobs.length / techJobs.length) * 100) : 0
    };
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
        <h2 className="text-2xl font-bold text-gray-900">Team Management</h2>
        <button
          onClick={handleCreateTechnician}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Add Technician
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', name: 'Team Overview' },
            { id: 'performance', name: 'Performance' },
            { id: 'schedule', name: 'Schedule' }
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
      {activeTab === 'overview' && (
        <TeamOverview 
          technicians={technicians}
          getTechnicianStats={getTechnicianStats}
          onEditTechnician={handleEditTechnician}
        />
      )}
      
      {activeTab === 'performance' && (
        <PerformanceView 
          technicians={technicians}
          jobs={jobs}
          timeEntries={timeEntries}
          getTechnicianStats={getTechnicianStats}
        />
      )}
      
      {activeTab === 'schedule' && (
        <ScheduleView 
          technicians={technicians}
          jobs={jobs}
          timeEntries={timeEntries}
        />
      )}

      {/* Technician Modal */}
      {showTechnicianModal && (
        <TechnicianModal
          technician={selectedTechnician}
          onClose={() => {
            setShowTechnicianModal(false);
            setSelectedTechnician(null);
          }}
          onSuccess={() => {
            loadTeamData();
            setShowTechnicianModal(false);
            setSelectedTechnician(null);
          }}
          api={api}
        />
      )}
    </div>
  );
};

// Team Overview Component
const TeamOverview = ({ technicians, getTechnicianStats, onEditTechnician }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {technicians.map(technician => {
        const stats = getTechnicianStats(technician.id);
        return (
          <div key={technician.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-semibold text-lg">
                    {technician.full_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </span>
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-medium text-gray-900">{technician.full_name}</h3>
                  <p className="text-sm text-gray-500">{technician.email}</p>
                </div>
              </div>
              <button
                onClick={() => onEditTechnician(technician)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Active Jobs:</span>
                <span className="text-sm font-medium">{stats.totalJobs}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Completed:</span>
                <span className="text-sm font-medium">{stats.completedJobs}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Hours Logged:</span>
                <span className="text-sm font-medium">{stats.totalHours}h</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Revenue Generated:</span>
                <span className="text-sm font-medium">${stats.totalRevenue.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Completion Rate:</span>
                <span className="text-sm font-medium">{stats.completionRate}%</span>
              </div>
            </div>

            {technician.skills && technician.skills.length > 0 && (
              <div className="mt-4">
                <p className="text-xs text-gray-500 mb-2">Skills:</p>
                <div className="flex flex-wrap gap-1">
                  {technician.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between text-sm">
                <span className={`px-2 py-1 rounded-full text-xs ${
                  technician.is_active 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {technician.is_active ? 'Active' : 'Inactive'}
                </span>
                {technician.hourly_rate && (
                  <span className="text-gray-600">${technician.hourly_rate}/hr</span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// Performance View Component
const PerformanceView = ({ technicians, jobs, timeEntries, getTechnicianStats }) => {
  const performanceData = technicians.map(tech => ({
    ...tech,
    stats: getTechnicianStats(tech.id)
  })).sort((a, b) => b.stats.totalRevenue - a.stats.totalRevenue);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Performance Leaderboard</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Technician
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Jobs Completed
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Hours Logged
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Revenue
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Completion Rate
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Avg. Revenue/Job
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {performanceData.map((tech, index) => (
              <tr key={tech.id} className={index < 3 ? 'bg-yellow-50' : ''}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-medium text-sm">
                        {tech.full_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </span>
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-900">
                        {index < 3 && <span className="mr-2">🏆</span>}
                        {tech.full_name}
                      </div>
                      <div className="text-sm text-gray-500">{tech.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {tech.stats.completedJobs}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {tech.stats.totalHours}h
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  ${tech.stats.totalRevenue.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    tech.stats.completionRate >= 90 
                      ? 'bg-green-100 text-green-800'
                      : tech.stats.completionRate >= 70
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {tech.stats.completionRate}%
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  ${tech.stats.completedJobs > 0 ? (tech.stats.totalRevenue / tech.stats.completedJobs).toFixed(2) : '0.00'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Schedule View Component
const ScheduleView = ({ technicians, jobs, timeEntries }) => {
  const today = new Date();
  const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
  
  const upcomingJobs = jobs.filter(job => {
    const jobDate = new Date(job.scheduled_date);
    return jobDate >= today && jobDate <= nextWeek && job.status === 'scheduled';
  });

  const activeTimeEntries = timeEntries.filter(entry => !entry.end_time);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Current Active Work */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Currently Working</h3>
        </div>
        <div className="p-6">
          {activeTimeEntries.length > 0 ? (
            <div className="space-y-4">
              {activeTimeEntries.map(entry => {
                const technician = technicians.find(t => t.id === entry.technician_id);
                const job = jobs.find(j => j.id === entry.job_id);
                const startTime = new Date(entry.start_time);
                const duration = Math.floor((new Date() - startTime) / (1000 * 60));

                return (
                  <div key={entry.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{technician?.full_name}</p>
                      <p className="text-sm text-gray-600">{job?.title}</p>
                      <p className="text-xs text-gray-500">Started: {startTime.toLocaleTimeString()}</p>
                    </div>
                    <div className="text-right">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        🔴 Active
                      </span>
                      <p className="text-sm text-gray-600 mt-1">{duration} min</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No one is currently working</p>
          )}
        </div>
      </div>

      {/* Upcoming Jobs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Upcoming Jobs (Next 7 Days)</h3>
        </div>
        <div className="p-6">
          {upcomingJobs.length > 0 ? (
            <div className="space-y-4">
              {upcomingJobs.slice(0, 10).map(job => {
                const technician = technicians.find(t => t.id === job.assigned_technician_id);
                const jobDate = new Date(job.scheduled_date);

                return (
                  <div key={job.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{job.title}</p>
                      <p className="text-sm text-gray-600">
                        {technician ? technician.full_name : 'Unassigned'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {jobDate.toLocaleDateString()} at {jobDate.toLocaleTimeString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                        job.priority === 'urgent' 
                          ? 'bg-red-100 text-red-800'
                          : job.priority === 'high'
                          ? 'bg-orange-100 text-orange-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {job.priority}
                      </span>
                      <p className="text-sm text-gray-600 mt-1">{job.estimated_duration}min</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No upcoming jobs scheduled</p>
          )}
        </div>
      </div>
    </div>
  );
};

// Technician Modal Component
const TechnicianModal = ({ technician, onClose, onSuccess, api }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    phone: '',
    skills: [],
    hourly_rate: '',
    hire_date: '',
    ...technician
  });
  const [newSkill, setNewSkill] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const techData = {
        ...formData,
        hourly_rate: parseFloat(formData.hourly_rate) || null,
        hire_date: formData.hire_date ? new Date(formData.hire_date).toISOString() : null
      };

      if (technician) {
        // Update existing technician
        await api.put(`/technicians/${technician.id}`, techData);
        toast.success('Technician updated successfully');
      } else {
        // Create new technician
        await api.post('/technicians', techData);
        toast.success('Technician created successfully');
      }

      onSuccess();
    } catch (error) {
      console.error('Error saving technician:', error);
      toast.error(error.response?.data?.detail || 'Failed to save technician');
    } finally {
      setLoading(false);
    }
  };

  const addSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData({
        ...formData,
        skills: [...formData.skills, newSkill.trim()]
      });
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter(skill => skill !== skillToRemove)
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">
              {technician ? 'Edit Technician' : 'Add New Technician'}
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

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
              <input
                type="text"
                required
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>

            {!technician && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                <input
                  type="password"
                  required={!technician}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                type="tel"
                value={formData.phone || ''}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hourly Rate ($)</label>
              <input
                type="number"
                step="0.01"
                value={formData.hourly_rate || ''}
                onChange={(e) => setFormData({ ...formData, hourly_rate: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hire Date</label>
              <input
                type="date"
                value={formData.hire_date ? new Date(formData.hire_date).toISOString().split('T')[0] : ''}
                onChange={(e) => setFormData({ ...formData, hire_date: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Skills</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                  placeholder="Add a skill..."
                  className="flex-1 border border-gray-300 rounded-md px-3 py-2"
                />
                <button
                  type="button"
                  onClick={addSkill}
                  className="bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      className="ml-1 text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Saving...' : (technician ? 'Update' : 'Create')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TeamManagement;