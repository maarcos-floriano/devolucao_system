import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#22c55e', // Verde principal
      light: '#4ade80',
      dark: '#16a34a',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#15803d', // Verde mais escuro
      light: '#22c55e',
      dark: '#166534',
      contrastText: '#ffffff',
    },
    success: {
      main: '#22c55e',
      light: '#4ade80',
      dark: '#16a34a',
    },
    error: {
      main: '#ef4444',
      light: '#f87171',
      dark: '#dc2626',
    },
    warning: {
      main: '#f59e0b',
      light: '#fbbf24',
      dark: '#d97706',
    },
    info: {
      main: '#3b82f6',
      light: '#60a5fa',
      dark: '#2563eb',
    },
    background: {
      default: '#f4f4f4', // Cor de fundo do seu CSS
      paper: '#ffffff',
    },
    text: {
      primary: '#1f2937',
      secondary: '#6b7280',
    },
  },
  typography: {
    fontFamily: '"Montserrat", "Roboto", "Segoe UI", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      color: '#15803d',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 700,
      color: '#15803d',
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 700,
      color: '#15803d',
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
      color: '#15803d',
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
      color: '#15803d',
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
      color: '#15803d',
    },
    button: {
      fontWeight: 600,
      textTransform: 'none', // Remove uppercase dos botões
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 600,
          textTransform: 'none',
          padding: '10px 20px',
        },
        contained: {
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          '&:hover': {
            boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
        },
        elevation1: {
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        },
        elevation2: {
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#22c55e',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          backgroundColor: '#22c55e',
          color: '#ffffff',
          fontWeight: 600,
          fontSize: '14px',
        },
        root: {
          borderBottom: '1px solid #d1fae5',
          fontSize: '14px',
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:nth-of-type(even)': {
            backgroundColor: '#f0fdf4',
          },
          '&:hover': {
            backgroundColor: '#dcfce7',
          },
        },
      },
    },
  },
});

export default theme;