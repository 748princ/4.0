import React, { useState } from 'react';
import './App.css';
import { 
  Sidebar, 
  Header, 
  DashboardStats, 
  RecentJobs, 
  CalendarView, 
  JobsList, 
  ClientsList, 
  InvoicesList, 
  QuotesList, 
  ReportsView 
} from './components';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  
  // Global state for sharing data between components
  const [globalState, setGlobalState] = useState({
    jobs: [],
    clients: [],
    invoices: [],
    quotes: []
  });

  // Handler functions for data updates
  const handleAddJob = (job) => {
    setGlobalState(prev => ({
      ...prev,
      jobs: [...prev.jobs, job]
    }));
  };

  const handleAddClient = (client) => {
    setGlobalState(prev => ({
      ...prev,
      clients: [...prev.clients, client]
    }));
  };

  const handleAddInvoice = (invoice) => {
    setGlobalState(prev => ({
      ...prev,
      invoices: [...prev.invoices, invoice]
    }));
  };

  const renderMainContent = () => {
    switch (currentPage) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-8 text-white relative overflow-hidden">
              <div className="relative z-10">
                <h1 className="text-3xl font-bold mb-2">Welcome back, John!</h1>
                <p className="text-blue-100 mb-6">Here's what's happening with your field service business today</p>
                <div className="flex space-x-4">
                  <button 
                    onClick={() => setCurrentPage('jobs')}
                    className="bg-white text-blue-600 px-6 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                  >
                    Schedule New Job
                  </button>
                  <button 
                    onClick={() => setCurrentPage('calendar')}
                    className="border border-blue-300 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    View Calendar
                  </button>
                </div>
              </div>
              <div className="absolute right-8 top-8 opacity-20">
                <img 
                  src="https://images.unsplash.com/photo-1574939817232-82d36b6852f1?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Njd8MHwxfHNlYXJjaHwxfHx0ZWNobmljaWFuJTIwd29ya2luZ3xlbnwwfHx8Ymx1ZXwxNzUzMTg4NDc3fDA&ixlib=rb-4.1.0&q=85" 
                  alt="Field Service Workers" 
                  className="w-48 h-32 object-cover rounded-lg"
                />
              </div>
            </div>

            {/* Dashboard Stats */}
            <DashboardStats />
            
            {/* Main Dashboard Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <RecentJobs />
              </div>
              
              <div className="space-y-6">
                {/* Quick Actions */}
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
                      Send Invoice
                    </button>
                  </div>
                </div>

                {/* Today's Schedule */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Schedule</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors">
                      <div>
                        <p className="font-medium text-gray-900">Plumbing Repair</p>
                        <p className="text-sm text-gray-600">Smith Residence</p>
                      </div>
                      <span className="text-blue-600 font-medium">10:30 AM</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg cursor-pointer hover:bg-green-100 transition-colors">
                      <div>
                        <p className="font-medium text-gray-900">HVAC Service</p>
                        <p className="text-sm text-gray-600">ABC Corp</p>
                      </div>
                      <span className="text-green-600 font-medium">2:00 PM</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg cursor-pointer hover:bg-purple-100 transition-colors">
                      <div>
                        <p className="font-medium text-gray-900">Inspection</p>
                        <p className="text-sm text-gray-600">Office Plaza</p>
                      </div>
                      <span className="text-purple-600 font-medium">4:15 PM</span>
                    </div>
                  </div>
                </div>

                {/* Service Types Overview */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Service Types</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors">
                      <img 
                        src="https://images.unsplash.com/photo-1593014040772-74166184bac7?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzB8MHwxfHNlYXJjaHwyfHxwbHVtYmVyJTIwcmVwYWlyfGVufDB8fHxibHVlfDE3NTMxODg0ODZ8MA&ixlib=rb-4.1.0&q=85" 
                        alt="Plumbing Service" 
                        className="w-12 h-12 object-cover rounded-lg mx-auto mb-2"
                      />
                      <p className="text-sm font-medium text-gray-900">Plumbing</p>
                      <p className="text-xs text-gray-600">15 jobs</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg cursor-pointer hover:bg-green-100 transition-colors">
                      <img 
                        src="https://images.unsplash.com/photo-1659353588972-f3be41ae0834?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzB8MHwxfHNlYXJjaHwzfHxwbHVtYmVyJTIwcmVwYWlyfGVufDB8fHxibHVlfDE3NTMxODg0ODZ8MA&ixlib=rb-4.1.0&q=85" 
                        alt="HVAC Service" 
                        className="w-12 h-12 object-cover rounded-lg mx-auto mb-2"
                      />
                      <p className="text-sm font-medium text-gray-900">HVAC</p>
                      <p className="text-xs text-gray-600">8 jobs</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
        
      case 'calendar':
        return <CalendarView />;
        
      case 'jobs':
        return (
          <JobsList 
            jobs={globalState.jobs}
            onAddJob={handleAddJob}
          />
        );
        
      case 'clients':
        return (
          <ClientsList 
            clients={globalState.clients}
            onAddClient={handleAddClient}
          />
        );
        
      case 'invoices':
        return (
          <InvoicesList 
            invoices={globalState.invoices}
            onAddInvoice={handleAddInvoice}
          />
        );
        
      case 'quotes':
        return <QuotesList />;
        
      case 'reports':
        return <ReportsView />;
        
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
      <Sidebar currentPage={currentPage} onPageChange={setCurrentPage} />
      <Header currentPage={currentPage} />
      
      <main className="ml-64 pt-16 p-6">
        {renderMainContent()}
      </main>

      {/* Mobile App Preview Section - Only show on dashboard */}
      {currentPage === 'dashboard' && (
        <div className="ml-64 px-6 pb-6">
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Mobile App for Field Workers</h2>
              <p className="text-gray-600">Keep your technicians connected and productive in the field</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Key Features</h3>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    Real-time job updates
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    GPS tracking & routing
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    Photo documentation
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    Digital signatures
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    Offline capability
                  </li>
                </ul>
              </div>
              
              <div className="text-center">
                <img 
                  src="https://images.unsplash.com/photo-1545063328-c8e3faffa16f?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDN8MHwxfHNlYXJjaHwyfHxtb2JpbGUlMjBhcHAlMjBpbnRlcmZhY2V8ZW58MHx8fGJsdWV8MTc1MzE4ODQ5NHww&ixlib=rb-4.1.0&q=85" 
                  alt="Mobile App Interface" 
                  className="w-48 h-80 object-cover rounded-2xl mx-auto shadow-lg"
                />
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Benefits</h3>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-center">
                    <span className="text-blue-500 mr-2">📱</span>
                    Increased productivity
                  </li>
                  <li className="flex items-center">
                    <span className="text-blue-500 mr-2">📍</span>
                    Better customer communication
                  </li>
                  <li className="flex items-center">
                    <span className="text-blue-500 mr-2">⚡</span>
                    Faster job completion
                  </li>
                  <li className="flex items-center">
                    <span className="text-blue-500 mr-2">💼</span>
                    Professional appearance
                  </li>
                  <li className="flex items-center">
                    <span className="text-blue-500 mr-2">📊</span>
                    Real-time reporting
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;