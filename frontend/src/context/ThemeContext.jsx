/**
 * Theme Context
 * Provides dark mode toggle functionality across the app
 */

import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { ThemeProvider as MUIThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Theme context
const ThemeContext = createContext({
  darkMode: false,
  toggleDarkMode: () => {},
});

// Custom hook to use theme context
export const useThemeMode = () => useContext(ThemeContext);

// Get design tokens based on mode
const getDesignTokens = (mode) => ({
  palette: {
    mode,
    ...(mode === 'light'
      ? {
          // Light mode colors
          primary: {
            main: '#2563eb',
            light: '#3b82f6',
            dark: '#1d4ed8',
            contrastText: '#ffffff',
          },
          secondary: {
            main: '#7c3aed',
            light: '#8b5cf6',
            dark: '#6d28d9',
            contrastText: '#ffffff',
          },
          success: {
            main: '#10b981',
            light: '#34d399',
            dark: '#059669',
          },
          warning: {
            main: '#f59e0b',
            light: '#fbbf24',
            dark: '#d97706',
          },
          error: {
            main: '#ef4444',
            light: '#f87171',
            dark: '#dc2626',
          },
          background: {
            default: '#f8fafc',
            paper: '#ffffff',
          },
          text: {
            primary: '#1e293b',
            secondary: '#64748b',
          },
          divider: '#e2e8f0',
        }
      : {
          // Dark mode colors
          primary: {
            main: '#3b82f6',
            light: '#60a5fa',
            dark: '#2563eb',
            contrastText: '#ffffff',
          },
          secondary: {
            main: '#8b5cf6',
            light: '#a78bfa',
            dark: '#7c3aed',
            contrastText: '#ffffff',
          },
          success: {
            main: '#34d399',
            light: '#6ee7b7',
            dark: '#10b981',
          },
          warning: {
            main: '#fbbf24',
            light: '#fcd34d',
            dark: '#f59e0b',
          },
          error: {
            main: '#f87171',
            light: '#fca5a5',
            dark: '#ef4444',
          },
          background: {
            default: '#0f172a',
            paper: '#1e293b',
          },
          text: {
            primary: '#f1f5f9',
            secondary: '#94a3b8',
          },
          divider: '#334155',
        }),
  },
  typography: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      lineHeight: 1.2,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      lineHeight: 1.3,
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h4: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h5: {
      fontSize: '1.125rem',
      fontWeight: 600,
      lineHeight: 1.5,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
      lineHeight: 1.5,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
  },
});

// Theme Provider Component
export function ThemeContextProvider({ children }) {
  // Initialize from localStorage or system preference
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    if (saved !== null) {
      return JSON.parse(saved);
    }
    // Check system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev);
  };

  // Save preference to localStorage
  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  // Create theme based on mode
  const theme = useMemo(
    () => createTheme(getDesignTokens(darkMode ? 'dark' : 'light')),
    [darkMode]
  );

  const contextValue = useMemo(
    () => ({ darkMode, toggleDarkMode }),
    [darkMode]
  );

  return (
    <ThemeContext.Provider value={contextValue}>
      <MUIThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MUIThemeProvider>
    </ThemeContext.Provider>
  );
}

export default ThemeContext;
