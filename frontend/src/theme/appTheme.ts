import { createTheme } from '@mui/material/styles';

export const appTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#76a86f',
      contrastText: '#fffdf4',
    },
    secondary: {
      main: '#9ac5d8',
      contrastText: '#2f4f4f',
    },
    background: {
      default: '#fff8e8',
      paper: '#fffdf4',
    },
    success: {
      main: '#76a86f',
    },
    info: {
      main: '#7fb7cf',
    },
    warning: {
      main: '#c7a46c',
    },
    error: {
      main: '#bf6f67',
    },
    text: {
      primary: '#3f3a2f',
      secondary: '#6f6655',
    },
  },
  typography: {
    fontFamily: [
      'Inter',
      'Avenir',
      'Helvetica Neue',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: {
      fontWeight: 800,
      letterSpacing: 0,
      lineHeight: 1.08,
    },
    h2: {
      fontWeight: 700,
      letterSpacing: 0,
      lineHeight: 1.18,
    },
    h6: {
      letterSpacing: 0,
    },
    button: {
      textTransform: 'none',
      fontWeight: 700,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          borderRadius: 8,
          minHeight: 40,
          boxShadow: 'none',
        },
        contained: {
          boxShadow: '0 10px 22px rgba(127, 183, 126, 0.22)',
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
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: '#fffdf4',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 700,
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          border: '1px solid rgba(111, 102, 85, 0.12)',
        },
      },
    },
  },
});
