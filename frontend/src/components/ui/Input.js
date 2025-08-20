import React, { forwardRef } from 'react';
import { useTheme } from '../../hooks/useTheme';

const Input = forwardRef(({
  label,
  type = 'text',
  error,
  helperText,
  required = false,
  disabled = false,
  className = '',
  containerClassName = '',
  ...props
}, ref) => {
  const { isDarkMode } = useTheme();

  const inputClasses = `
    w-full px-3 py-2 border rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1
    ${error 
      ? (isDarkMode 
          ? 'border-red-500 bg-gray-700 text-gray-100 focus:ring-red-500' 
          : 'border-red-500 bg-red-50 text-gray-900 focus:ring-red-500')
      : (isDarkMode
          ? 'border-gray-600 bg-gray-700 text-gray-100 focus:ring-blue-500 focus:border-blue-500'
          : 'border-gray-300 bg-white text-gray-900 focus:ring-blue-500 focus:border-blue-500')
    }
    ${disabled 
      ? (isDarkMode ? 'opacity-50 cursor-not-allowed bg-gray-800' : 'opacity-50 cursor-not-allowed bg-gray-100')
      : ''
    }
    ${className}
  `;

  return (
    <div className={containerClassName}>
      {label && (
        <label className={`
          block text-sm font-medium mb-1
          ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}
          ${error ? 'text-red-500' : ''}
        `}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <input
        ref={ref}
        type={type}
        disabled={disabled}
        className={inputClasses}
        {...props}
      />
      
      {(error || helperText) && (
        <p className={`mt-1 text-sm ${
          error 
            ? 'text-red-500' 
            : (isDarkMode ? 'text-gray-400' : 'text-gray-600')
        }`}>
          {error || helperText}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;