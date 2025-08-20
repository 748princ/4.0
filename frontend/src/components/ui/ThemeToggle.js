import React from 'react';
import { useTheme } from '../../hooks/useTheme';

const ThemeToggle = ({ className = '' }) => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`
        relative inline-flex h-6 w-11 items-center rounded-full transition-colors
        ${isDarkMode 
          ? 'bg-blue-600 hover:bg-blue-700' 
          : 'bg-gray-200 hover:bg-gray-300'
        }
        ${className}
      `}
      role="switch"
      aria-checked={isDarkMode}
      aria-label={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
    >
      <span
        className={`
          inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ease-in-out
          ${isDarkMode ? 'translate-x-6' : 'translate-x-1'}
        `}
      />
      <span className="sr-only">
        {isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      </span>
      
      {/* Sun icon */}
      <svg
        className={`
          absolute left-1 top-1 h-4 w-4 text-yellow-500 transition-opacity duration-200
          ${isDarkMode ? 'opacity-0' : 'opacity-100'}
        `}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path
          fillRule="evenodd"
          d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
          clipRule="evenodd"
        />
      </svg>
      
      {/* Moon icon */}
      <svg
        className={`
          absolute right-1 top-1 h-4 w-4 text-blue-300 transition-opacity duration-200
          ${isDarkMode ? 'opacity-100' : 'opacity-0'}
        `}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
      </svg>
    </button>
  );
};

export default ThemeToggle;