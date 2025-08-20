import React from 'react';
import { useTheme } from '../../hooks/useTheme';

const LoadingSpinner = ({ 
  size = 'md', 
  className = '',
  text = '',
  fullScreen = false 
}) => {
  const { isDarkMode } = useTheme();
  
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  };

  const spinner = (
    <div className={`animate-spin rounded-full border-2 border-t-transparent ${
      isDarkMode 
        ? 'border-blue-400' 
        : 'border-blue-600'
    } ${sizeClasses[size]} ${className}`}>
    </div>
  );

  if (fullScreen) {
    return (
      <div className={`fixed inset-0 z-50 flex items-center justify-center ${
        isDarkMode 
          ? 'bg-gray-900 bg-opacity-75' 
          : 'bg-white bg-opacity-75'
      }`}>
        <div className="text-center">
          {spinner}
          {text && (
            <p className={`mt-4 text-sm font-medium ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              {text}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center space-y-2">
      {spinner}
      {text && (
        <p className={`text-sm font-medium ${
          isDarkMode ? 'text-gray-300' : 'text-gray-600'
        }`}>
          {text}
        </p>
      )}
    </div>
  );
};

export default LoadingSpinner;