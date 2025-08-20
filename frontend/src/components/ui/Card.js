import React from 'react';
import { useTheme } from '../../hooks/useTheme';

const Card = ({
  children,
  className = '',
  hover = false,
  padding = true,
  shadow = true,
  ...props
}) => {
  const { isDarkMode } = useTheme();

  const baseClasses = `
    rounded-lg border transition-all duration-200
    ${isDarkMode 
      ? 'bg-gray-800 border-gray-700' 
      : 'bg-white border-gray-200'
    }
    ${shadow ? (isDarkMode ? 'shadow-lg shadow-gray-900/10' : 'shadow-md') : ''}
    ${hover ? 'hover:shadow-xl hover:scale-105' : ''}
    ${padding ? 'p-6' : ''}
    ${className}
  `;

  return (
    <div className={baseClasses} {...props}>
      {children}
    </div>
  );
};

const CardHeader = ({ children, className = '' }) => {
  const { isDarkMode } = useTheme();
  
  return (
    <div className={`mb-4 pb-4 border-b ${
      isDarkMode ? 'border-gray-700' : 'border-gray-200'
    } ${className}`}>
      {children}
    </div>
  );
};

const CardTitle = ({ children, className = '' }) => {
  const { isDarkMode } = useTheme();
  
  return (
    <h3 className={`text-lg font-semibold ${
      isDarkMode ? 'text-gray-100' : 'text-gray-900'
    } ${className}`}>
      {children}
    </h3>
  );
};

const CardContent = ({ children, className = '' }) => {
  return (
    <div className={className}>
      {children}
    </div>
  );
};

Card.Header = CardHeader;
Card.Title = CardTitle;
Card.Content = CardContent;

export default Card;