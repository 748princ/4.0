import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';

const TimeTracking = ({ user }) => {
  const [activeEntry, setActiveEntry] = useState(null);
  const [timeEntries, setTimeEntries] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [clients, setClients] = useState([]);
  const [selectedJob, setSelectedJob] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [timer, setTimer] = useState(0);
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);

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
    loadTimeTrackingData();
  }, []);

  useEffect(() => {
    let interval;
    if (activeEntry) {
      interval = setInterval(() => {
        const startTime = new Date(activeEntry.start_time);
        const elapsed = Math.floor((new Date() - startTime) / 1000);
        setTimer(elapsed);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeEntry]);

  const loadTimeTrackingData = async () => {
    try {
      setLoading(true);
      const [activeRes, entriesRes, jobsRes, clientsRes] = await Promise.all([
        api.get('/time-entries/active'),
        api.get('/time-entries'),
        api.get('/jobs'),
        api.get('/clients')
      ]);

      setActiveEntry(activeRes.data);
      setTimeEntries(entriesRes.data);
      setJobs(jobsRes.data);
      setClients(clientsRes.data);

      if (activeRes.data) {
        const startTime = new Date(activeRes.data.start_time);
        const elapsed = Math.floor((new Date() - startTime) / 1000);
        setTimer(elapsed);
      }
    } catch (error) {
      console.error('Error loading time tracking data:', error);
      toast.error('Failed to load time tracking data');
    } finally {
      setLoading(false);
    }
  };

  const startTimeEntry = async () => {
    if (!selectedJob) {
      toast.error('Please select a job first');
      return;
    }

    try {
      const response = await api.post('/time-entries', {
        job_id: selectedJob,
        description: description,
        is_billable: true
      });

      setActiveEntry(response.data);
      setTimer(0);
      setSelectedJob('');
      setDescription('');
      toast.success('Time tracking started');
    } catch (error) {
      console.error('Error starting time entry:', error);
      toast.error(error.response?.data?.detail || 'Failed to start time tracking');
    }
  };

  const stopTimeEntry = async () => {
    if (!activeEntry) return;

    try {
      await api.put(`/time-entries/${activeEntry.id}`, {
        end_time: new Date().toISOString(),
        description: activeEntry.description
      });

      setActiveEntry(null);
      setTimer(0);
      loadTimeTrackingData();
      toast.success('Time tracking stopped');
    } catch (error) {
      console.error('Error stopping time entry:', error);
      toast.error('Failed to stop time tracking');
    }
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const calculateDuration = (start, end) => {
    const startTime = new Date(start);
    const endTime = new Date(end);
    const duration = Math.floor((endTime - startTime) / 1000);
    return formatTime(duration);
  };

  const getTotalHoursForDay = (date) => {
    const dayEntries = timeEntries.filter(entry => {
      if (!entry.end_time) return false;
      const entryDate = new Date(entry.start_time).toISOString().split('T')[0];
      return entryDate === date;
    });

    const totalSeconds = dayEntries.reduce((total, entry) => {
      const start = new Date(entry.start_time);
      const end = new Date(entry.end_time);
      const duration = Math.floor((end - start) / 1000);
      return total + duration;
    }, 0);

    return Math.round(totalSeconds / 3600 * 100) / 100;
  };

  const filteredEntries = timeEntries.filter(entry => {
    if (!filterDate) return true;
    const entryDate = new Date(entry.start_time).toISOString().split('T')[0];
    return entryDate === filterDate;
  });

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
        <h2 className="text-2xl font-bold text-gray-900">Time Tracking</h2>
        <div className="text-sm text-gray-600">
          Today's total: {getTotalHoursForDay(new Date().toISOString().split('T')[0])} hours
        </div>
      </div>

      {/* Active Timer */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        {activeEntry ? (
          <div className="text-center">
            <div className="text-4xl font-mono font-bold text-blue-600 mb-4">
              {formatTime(timer)}
            </div>
            <div className="text-lg text-gray-700 mb-2">
              Working on: <span className="font-semibold">
                {jobs.find(j => j.id === activeEntry.job_id)?.title || 'Unknown Job'}
              </span>
            </div>
            {activeEntry.description && (
              <div className="text-sm text-gray-600 mb-4">
                {activeEntry.description}
              </div>
            )}
            <div className="text-sm text-gray-500 mb-6">
              Started at: {new Date(activeEntry.start_time).toLocaleTimeString()}
            </div>
            <button
              onClick={stopTimeEntry}
              className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors text-lg"
            >
              Stop Timer
            </button>
          </div>
        ) : (
          <div>
            <h3 className="text-lg font-semibold mb-4">Start Time Tracking</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Job *
                </label>
                <select
                  value={selectedJob}
                  onChange={(e) => setSelectedJob(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="">Choose a job...</option>
                  {jobs.filter(job => job.status !== 'completed' && job.status !== 'cancelled').map(job => {
                    const client = clients.find(c => c.id === job.client_id);
                    return (
                      <option key={job.id} value={job.id}>
                        {job.title} - {client?.name || 'No Client'}
                      </option>
                    );
                  })}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description (optional)
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What are you working on?"
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
            </div>
            <button
              onClick={startTimeEntry}
              disabled={!selectedJob}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Start Timer
            </button>
          </div>
        )}
      </div>

      {/* Time Entries List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">Time Entries</h3>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Filter by date:</label>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          {filteredEntries.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Job
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Start Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    End Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredEntries.map(entry => {
                  const job = jobs.find(j => j.id === entry.job_id);
                  const client = clients.find(c => c.id === job?.client_id);
                  
                  return (
                    <tr key={entry.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {job?.title || 'Unknown Job'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {client?.name || 'No Client'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {format(new Date(entry.start_time), 'HH:mm:ss')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {entry.end_time 
                          ? format(new Date(entry.end_time), 'HH:mm:ss')
                          : <span className="text-green-600 font-semibold">Active</span>
                        }
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {entry.end_time 
                          ? calculateDuration(entry.start_time, entry.end_time)
                          : <span className="text-green-600 font-mono">Running...</span>
                        }
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                        {entry.description || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          entry.is_billable 
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {entry.is_billable ? 'Billable' : 'Non-billable'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="p-6 text-center text-gray-500">
              No time entries found for {filterDate ? new Date(filterDate).toLocaleDateString() : 'selected date'}
            </div>
          )}
        </div>
      </div>

      {/* Daily Summary */}
      {filterDate && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Daily Summary - {new Date(filterDate).toLocaleDateString()}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {getTotalHoursForDay(filterDate)}h
              </div>
              <div className="text-sm text-gray-600">Total Hours</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {filteredEntries.filter(e => e.end_time && e.is_billable).length}
              </div>
              <div className="text-sm text-gray-600">Billable Entries</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {filteredEntries.filter(e => e.end_time).length}
              </div>
              <div className="text-sm text-gray-600">Completed Entries</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {new Set(filteredEntries.map(e => e.job_id)).size}
              </div>
              <div className="text-sm text-gray-600">Jobs Worked</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimeTracking;