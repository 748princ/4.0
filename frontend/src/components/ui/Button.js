import React from 'react';
import { useTheme } from '../../hooks/useTheme';
import LoadingSpinner from './LoadingSpinner';

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  className = '',
  onClick,
  type = 'button',
  ...props
}) => {
  const { isDarkMode } = useTheme();

  const baseClasses = `
    inline-flex items-center justify-center rounded-md font-medium transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed
    transform hover:scale-105 active:scale-95
  `;

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
    xl: 'px-8 py-4 text-lg'
  };

  const getVariantClasses = (variant) => {
    if (isDarkMode) {
      switch (variant) {
        case 'primary':
          return 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 shadow-md hover:shadow-lg';
        case 'secondary':
          return 'bg-gray-700 text-gray-200 hover:bg-gray-600 focus:ring-gray-500 border border-gray-600 shadow-md hover:shadow-lg';
        case 'success':
          return 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500 shadow-md hover:shadow-lg';
        case 'danger':
          return 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-md hover:shadow-lg';
        case 'warning':
          return 'bg-yellow-600 text-white hover:bg-yellow-700 focus:ring-yellow-500 shadow-md hover:shadow-lg';
        case 'outline':
          return 'bg-transparent text-blue-400 border-2 border-blue-400 hover:bg-blue-400 hover:text-gray-900 focus:ring-blue-500';
        case 'ghost':
          return 'bg-transparent text-gray-300 hover:bg-gray-800 hover:text-white focus:ring-gray-500';
        default:
          return 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 shadow-md hover:shadow-lg';
      }
    } else {
      switch (variant) {
        case 'primary':
          return 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 shadow-md hover:shadow-lg';
        case 'secondary':
          return 'bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-500 border border-gray-300 shadow-md hover:shadow-lg';
        case 'success':
          return 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500 shadow-md hover:shadow-lg';
        case 'danger':
          return 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-md hover:shadow-lg';
        case 'warning':
          return 'bg-yellow-500 text-white hover:bg-yellow-600 focus:ring-yellow-500 shadow-md hover:shadow-lg';
        case 'outline':
          return 'bg-transparent text-blue-600 border-2 border-blue-600 hover:bg-blue-600 hover:text-white focus:ring-blue-500';
        case 'ghost':
          return 'bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus:ring-gray-500';
        default:
          return 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 shadow-md hover:shadow-lg';
      }
    }
  };

  const classes = `
    ${baseClasses}
    ${sizeClasses[size]}
    ${getVariantClasses(variant)}
    ${fullWidth ? 'w-full' : ''}
    ${className}
  `;

  return (
    <button
      type={type}
      className={classes}
      onClick={onClick}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <LoadingSpinner size="sm" className="mr-2" />
      )}
      {children}
    </button>
  );
};

export default Button;