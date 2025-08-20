import React, { useState } from 'react';
import { useTheme } from '../../hooks/useTheme';

const MobileMenu = ({ isOpen, onClose, menuItems, currentPage, setCurrentPage, user, onLogout }) => {
  const { isDarkMode } = useTheme();

  const handleItemClick = (itemId) => {
    setCurrentPage(itemId);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 z-40 bg-black bg-opacity-50 transition-opacity md:hidden"
        onClick={onClose}
      />
      
      {/* Mobile menu */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out md:hidden
        ${isDarkMode 
          ? 'bg-gray-900 border-r border-gray-700' 
          : 'bg-white border-r border-gray-200'
        }
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className={`flex items-center justify-between p-4 border-b ${
            isDarkMode ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <h1 className={`text-xl font-bold ${
              isDarkMode ? 'text-blue-400' : 'text-blue-600'
            }`}>
              Jobber Pro
            </h1>
            <button
              onClick={onClose}
              className={`p-2 rounded-md ${
                isDarkMode 
                  ? 'text-gray-400 hover:text-white hover:bg-gray-800' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              } transition-colors`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
            {menuItems.map(item => (
              <button
                key={item.id}
                onClick={() => handleItemClick(item.id)}
                className={`
                  w-full flex items-center px-4 py-3 text-left rounded-md transition-colors
                  ${currentPage === item.id
                    ? (isDarkMode 
                        ? 'bg-blue-600 text-white border-r-4 border-blue-400' 
                        : 'bg-blue-600 text-white border-r-4 border-blue-400')
                    : (isDarkMode 
                        ? 'text-gray-300 hover:bg-gray-800 hover:text-white' 
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900')
                  }
                `}
              >
                <span className="text-xl mr-3">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>

          {/* User profile */}
          <div className={`p-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className={`rounded-lg p-3 ${
              isDarkMode ? 'bg-gray-800' : 'bg-gray-50'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${
                    isDarkMode ? 'text-gray-200' : 'text-gray-900'
                  }`}>
                    {user?.full_name}
                  </p>
                  <p className={`text-xs ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {user?.company_name}
                  </p>
                </div>
                <button 
                  onClick={onLogout}
                  className={`text-xs font-medium transition-colors ${
                    isDarkMode 
                      ? 'text-gray-400 hover:text-white' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MobileMenu;