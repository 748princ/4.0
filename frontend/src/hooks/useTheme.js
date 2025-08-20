import { useState, useEffect, createContext, useContext } from 'react';

// Theme Context
const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Check localStorage first
    const saved = localStorage.getItem('jobber-pro-theme');
    if (saved) {
      return saved === 'dark';
    }
    // Check system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    // Update localStorage
    localStorage.setItem('jobber-pro-theme', isDarkMode ? 'dark' : 'light');
    
    // Update document class
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const theme = {
    isDarkMode,
    toggleTheme,
    colors: {
      // Light theme colors
      light: {
        primary: '#3b82f6',
        secondary: '#10b981', 
        accent: '#f59e0b',
        danger: '#ef4444',
        warning: '#f97316',
        success: '#22c55e',
        info: '#06b6d4',
        
        // Backgrounds
        bg: {
          primary: '#ffffff',
          secondary: '#f8fafc',
          tertiary: '#f1f5f9',
        },
        
        // Text colors
        text: {
          primary: '#1f2937',
          secondary: '#6b7280',
          tertiary: '#9ca3af',
          inverse: '#ffffff',
        },
        
        // Border colors
        border: {
          primary: '#e5e7eb',
          secondary: '#d1d5db',
          tertiary: '#9ca3af',
        }
      },
      
      // Dark theme colors
      dark: {
        primary: '#60a5fa',
        secondary: '#34d399',
        accent: '#fbbf24',
        danger: '#f87171',
        warning: '#fb923c',
        success: '#4ade80',
        info: '#22d3ee',
        
        // Backgrounds
        bg: {
          primary: '#1f2937',
          secondary: '#111827',
          tertiary: '#0f172a',
        },
        
        // Text colors
        text: {
          primary: '#f9fafb',
          secondary: '#d1d5db',
          tertiary: '#9ca3af',
          inverse: '#1f2937',
        },
        
        // Border colors
        border: {
          primary: '#374151',
          secondary: '#4b5563',
          tertiary: '#6b7280',
        }
      }
    }
  };

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
};

export default useTheme;