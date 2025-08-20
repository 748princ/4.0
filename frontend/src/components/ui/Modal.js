import React, { useEffect } from 'react';
import { useTheme } from '../../hooks/useTheme';
import Button from './Button';

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
  closeOnOverlayClick = true,
  className = '',
}) => {
  const { isDarkMode } = useTheme();

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg', 
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-full mx-4'
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={closeOnOverlayClick ? onClose : undefined}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div 
          className={`
            relative w-full transform transition-all
            ${sizeClasses[size]}
            ${isDarkMode 
              ? 'bg-gray-800 border border-gray-700' 
              : 'bg-white border border-gray-200'
            }
            rounded-lg shadow-xl animate-scale-in
            ${className}
          `}
        >
          {/* Header */}
          {(title || showCloseButton) && (
            <div className={`
              flex items-center justify-between p-6 border-b
              ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}
            `}>
              {title && (
                <h3 className={`text-lg font-semibold ${
                  isDarkMode ? 'text-gray-100' : 'text-gray-900'
                }`}>
                  {title}
                </h3>
              )}
              {showCloseButton && (
                <button
                  onClick={onClose}
                  className={`
                    p-2 rounded-md transition-colors
                    ${isDarkMode 
                      ? 'text-gray-400 hover:text-white hover:bg-gray-700' 
                      : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                    }
                  `}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          )}

          {/* Content */}
          <div className="p-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

// Modal Footer Component
const ModalFooter = ({ children, className = '' }) => {
  const { isDarkMode } = useTheme();
  
  return (
    <div className={`
      flex items-center justify-end space-x-2 px-6 py-4 border-t
      ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}
      ${className}
    `}>
      {children}
    </div>
  );
};

Modal.Footer = ModalFooter;

export default Modal;