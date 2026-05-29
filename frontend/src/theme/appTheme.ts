import { createTheme } from '@mui/material/styles';

export const publicPalette = {
  cream: '#fbf7ed',
  creamDeep: '#f1e5c9',
  ink: '#3e493e',
  muted: '#687468',
  leaf: '#92bd91',
  leafDeep: '#517b58',
  leafPale: '#e2efde',
  skyPale: '#deeff0',
  peachPale: '#fae7d5',
  butterPale: '#fbf0ca',
  rosePale: '#f8e4de',
  paper: '#fffdf4',
};

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

export const publicTheme = createTheme(appTheme, {
  palette: {
    primary: {
      main: publicPalette.leafDeep,
      light: publicPalette.leaf,
      contrastText: publicPalette.paper,
    },
    secondary: {
      main: publicPalette.skyPale,
      contrastText: publicPalette.ink,
    },
    background: {
      default: publicPalette.cream,
      paper: publicPalette.paper,
    },
    success: {
      main: publicPalette.leafDeep,
    },
    info: {
      main: '#6faec0',
    },
    warning: {
      main: '#b99756',
    },
    error: {
      main: '#b8665e',
    },
    text: {
      primary: publicPalette.ink,
      secondary: publicPalette.muted,
    },
  },
  typography: {
    fontFamily: ['Noto Sans Thai', 'Arial', 'sans-serif'].join(','),
    h1: {
      fontFamily: '"Mali", "Noto Sans Thai", Arial, sans-serif',
    },
    h2: {
      fontFamily: '"Mali", "Noto Sans Thai", Arial, sans-serif',
    },
    h3: {
      fontFamily: '"Mali", "Noto Sans Thai", Arial, sans-serif',
      fontWeight: 700,
      letterSpacing: 0,
    },
    h4: {
      fontFamily: '"Mali", "Noto Sans Thai", Arial, sans-serif',
      fontWeight: 700,
      letterSpacing: 0,
    },
    h6: {
      fontFamily: '"Mali", "Noto Sans Thai", Arial, sans-serif',
      fontWeight: 700,
    },
    button: {
      letterSpacing: 0,
    },
  },
  shape: {
    borderRadius: 16,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          minHeight: 44,
        },
        contained: {
          boxShadow: '0 10px 22px rgba(83, 111, 87, 0.18)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 24,
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: publicPalette.paper,
          borderRadius: 16,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 999,
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          border: '1px solid rgba(104, 116, 104, 0.14)',
        },
      },
    },
  },
});
