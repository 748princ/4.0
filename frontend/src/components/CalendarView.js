import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment);

const CalendarView = ({ user }) => {
  const [events, setEvents] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [clients, setClients] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showJobModal, setShowJobModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('month');
  const [date, setDate] = useState(new Date());

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
    loadCalendarData();
  }, []);

  const loadCalendarData = async () => {
    try {
      setLoading(true);
      const [jobsRes, clientsRes, techniciansRes] = await Promise.all([
        api.get('/jobs'),
        api.get('/clients'), 
        api.get('/technicians')
      ]);

      setJobs(jobsRes.data);
      setClients(clientsRes.data);
      setTechnicians(techniciansRes.data);

      // Convert jobs to calendar events
      const calendarEvents = jobsRes.data.map(job => {
        const client = clientsRes.data.find(c => c.id === job.client_id);
        const technician = techniciansRes.data.find(t => t.id === job.assigned_technician_id);

        return {
          id: job.id,
          title: `${job.title} - ${client?.name || 'No Client'}`,
          start: new Date(job.scheduled_date),
          end: new Date(new Date(job.scheduled_date).getTime() + (job.estimated_duration || 60) * 60000),
          resource: {
            job,
            client,
            technician,
            status: job.status,
            priority: job.priority
          }
        };
      });

      setEvents(calendarEvents);
    } catch (error) {
      console.error('Error loading calendar data:', error);
      toast.error('Failed to load calendar data');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    setShowJobModal(true);
  };

  const handleSelectSlot = ({ start, end }) => {
    // Create new job at selected time
    setSelectedEvent({
      start,
      end,
      resource: { job: { scheduled_date: start.toISOString() } }
    });
    setShowJobModal(true);
  };

  const handleEventDrop = async ({ event, start, end }) => {
    try {
      // Update job scheduled date
      await api.put(`/jobs/${event.id}/status`, {
        status: event.resource.job.status,
        scheduled_date: start.toISOString()
      });

      toast.success('Job rescheduled successfully');
      loadCalendarData();
    } catch (error) {
      console.error('Error rescheduling job:', error);
      toast.error('Failed to reschedule job');
    }
  };

  const eventStyleGetter = (event) => {
    const { status, priority } = event.resource;
    
    let backgroundColor = '#3174ad';
    
    switch (status) {
      case 'scheduled':
        backgroundColor = '#2563eb';
        break;
      case 'in_progress':
        backgroundColor = '#f59e0b';
        break;
      case 'completed':
        backgroundColor = '#10b981';
        break;
      case 'cancelled':
        backgroundColor = '#ef4444';
        break;
      default:
        backgroundColor = '#6b7280';
    }

    // Adjust brightness based on priority
    if (priority === 'urgent') {
      backgroundColor = '#dc2626';
    } else if (priority === 'high') {
      backgroundColor = '#ea580c';
    }

    return {
      style: {
        backgroundColor,
        borderRadius: '4px',
        opacity: 0.8,
        color: 'white',
        border: '0px',
        display: 'block'
      }
    };
  };

  const formats = {
    timeGutterFormat: 'HH:mm',
    eventTimeRangeFormat: ({ start, end }, culture, localizer) =>
      localizer.format(start, 'HH:mm', culture) + ' - ' + localizer.format(end, 'HH:mm', culture),
    agendaTimeRangeFormat: ({ start, end }, culture, localizer) =>
      localizer.format(start, 'HH:mm', culture) + ' - ' + localizer.format(end, 'HH:mm', culture),
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Job Calendar</h2>
        <div className="flex gap-4">
          <select
            value={view}
            onChange={(e) => setView(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 bg-white"
          >
            <option value="month">Month</option>
            <option value="week">Week</option>
            <option value="day">Day</option>
            <option value="agenda">Agenda</option>
          </select>
          
          <button
            onClick={() => {
              setDate(new Date());
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Today
          </button>
        </div>
      </div>

      {/* Calendar Legend */}
      <div className="flex flex-wrap gap-4 mb-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-600 rounded"></div>
          <span>Scheduled</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-amber-500 rounded"></div>
          <span>In Progress</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500 rounded"></div>
          <span>Completed</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-500 rounded"></div>
          <span>Cancelled/Urgent</span>
        </div>
      </div>

      {/* Calendar */}
      <div className="h-[600px]">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '100%' }}
          onSelectEvent={handleSelectEvent}
          onSelectSlot={handleSelectSlot}
          onEventDrop={handleEventDrop}
          eventPropGetter={eventStyleGetter}
          view={view}
          onView={setView}
          date={date}
          onNavigate={setDate}
          selectable
          resizable
          formats={formats}
          step={15}
          timeslots={4}
          views={['month', 'week', 'day', 'agenda']}
          messages={{
            next: "Next",
            previous: "Previous",
            today: "Today",
            month: "Month",
            week: "Week", 
            day: "Day",
            agenda: "Agenda",
            noEventsInRange: "No jobs scheduled in this time range.",
          }}
        />
      </div>

      {/* Job Details Modal */}
      {showJobModal && selectedEvent && (
        <JobDetailsModal
          event={selectedEvent}
          clients={clients}
          technicians={technicians}
          onClose={() => {
            setShowJobModal(false);
            setSelectedEvent(null);
          }}
          onUpdate={loadCalendarData}
          api={api}
        />
      )}
    </div>
  );
};

// Job Details Modal Component
const JobDetailsModal = ({ event, clients, technicians, onClose, onUpdate, api }) => {
  const [job, setJob] = useState(event.resource?.job || {});
  const [isEditing, setIsEditing] = useState(!event.resource?.job?.id);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    try {
      setSaving(true);
      
      if (job.id) {
        // Update existing job
        await api.put(`/jobs/${job.id}/status`, {
          status: job.status,
          notes: `Updated via calendar on ${new Date().toLocaleString()}`
        });
        toast.success('Job updated successfully');
      } else {
        // Create new job
        const jobData = {
          title: job.title || 'New Job',
          description: job.description || '',
          client_id: job.client_id,
          service_type: job.service_type || 'General Service',
          priority: job.priority || 'medium',
          scheduled_date: event.start.toISOString(),
          estimated_duration: job.estimated_duration || 60,
          estimated_cost: parseFloat(job.estimated_cost) || 0,
          assigned_technician_id: job.assigned_technician_id || null
        };

        await api.post('/jobs', jobData);
        toast.success('Job created successfully');
      }

      onUpdate();
      onClose();
    } catch (error) {
      console.error('Error saving job:', error);
      toast.error('Failed to save job');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!job.id) return;
    
    if (window.confirm('Are you sure you want to delete this job?')) {
      try {
        await api.delete(`/jobs/${job.id}`);
        toast.success('Job deleted successfully');
        onUpdate();
        onClose();
      } catch (error) {
        console.error('Error deleting job:', error);
        toast.error('Failed to delete job');
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">
              {job.id ? 'Job Details' : 'Create New Job'}
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

          <div className="space-y-4">
            {/* Job Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                value={job.title || ''}
                onChange={(e) => setJob({ ...job, title: e.target.value })}
                disabled={!isEditing}
                className="w-full border border-gray-300 rounded-md px-3 py-2 disabled:bg-gray-100"
                placeholder="Job title"
              />
            </div>

            {/* Client Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Client</label>
              <select
                value={job.client_id || ''}
                onChange={(e) => setJob({ ...job, client_id: e.target.value })}
                disabled={!isEditing}
                className="w-full border border-gray-300 rounded-md px-3 py-2 disabled:bg-gray-100"
              >
                <option value="">Select Client</option>
                {clients.map(client => (
                  <option key={client.id} value={client.id}>{client.name}</option>
                ))}
              </select>
            </div>

            {/* Service Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Service Type</label>
              <select
                value={job.service_type || ''}
                onChange={(e) => setJob({ ...job, service_type: e.target.value })}
                disabled={!isEditing}
                className="w-full border border-gray-300 rounded-md px-3 py-2 disabled:bg-gray-100"
              >
                <option value="">Select Service</option>
                <option value="Plumbing">Plumbing</option>
                <option value="Electrical">Electrical</option>
                <option value="HVAC">HVAC</option>
                <option value="General Maintenance">General Maintenance</option>
                <option value="Cleaning">Cleaning</option>
                <option value="Landscaping">Landscaping</option>
              </select>
            </div>

            {/* Status & Priority */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={job.status || 'scheduled'}
                  onChange={(e) => setJob({ ...job, status: e.target.value })}
                  disabled={!isEditing}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 disabled:bg-gray-100"
                >
                  <option value="scheduled">Scheduled</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select
                  value={job.priority || 'medium'}
                  onChange={(e) => setJob({ ...job, priority: e.target.value })}
                  disabled={!isEditing}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 disabled:bg-gray-100"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>

            {/* Technician Assignment */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Assigned Technician</label>
              <select
                value={job.assigned_technician_id || ''}
                onChange={(e) => setJob({ ...job, assigned_technician_id: e.target.value })}
                disabled={!isEditing}
                className="w-full border border-gray-300 rounded-md px-3 py-2 disabled:bg-gray-100"
              >
                <option value="">Unassigned</option>
                {technicians.map(tech => (
                  <option key={tech.id} value={tech.id}>{tech.full_name}</option>
                ))}
              </select>
            </div>

            {/* Duration & Cost */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
                <input
                  type="number"
                  value={job.estimated_duration || ''}
                  onChange={(e) => setJob({ ...job, estimated_duration: parseInt(e.target.value) })}
                  disabled={!isEditing}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 disabled:bg-gray-100"
                  placeholder="60"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Cost ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={job.estimated_cost || ''}
                  onChange={(e) => setJob({ ...job, estimated_cost: e.target.value })}
                  disabled={!isEditing}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 disabled:bg-gray-100"
                  placeholder="0.00"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={job.description || ''}
                onChange={(e) => setJob({ ...job, description: e.target.value })}
                disabled={!isEditing}
                rows={3}
                className="w-full border border-gray-300 rounded-md px-3 py-2 disabled:bg-gray-100"
                placeholder="Job description..."
              />
            </div>

            {/* Scheduled Date & Time */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Scheduled Date & Time</label>
              <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
                {event.start.toLocaleString()} - {event.end.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center mt-6 pt-4 border-t">
            <div>
              {job.id && (
                <button
                  onClick={handleDelete}
                  className="text-red-600 hover:text-red-800 text-sm font-medium"
                >
                  Delete Job
                </button>
              )}
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              
              {!isEditing && job.id ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Edit
                </button>
              ) : (
                <button
                  onClick={handleSave}
                  disabled={saving || !job.title || !job.client_id}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : (job.id ? 'Update' : 'Create')}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarView;