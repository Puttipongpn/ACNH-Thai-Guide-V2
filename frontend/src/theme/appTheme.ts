import { createTheme } from '@mui/material/styles';

export const appTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#7fb77e',
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
    },
    h2: {
      fontWeight: 700,
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
      styleOverrides: {
        root: {
          borderRadius: 8,
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
  },
});
