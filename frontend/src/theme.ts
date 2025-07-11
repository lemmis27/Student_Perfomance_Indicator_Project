import { createTheme } from '@mui/material/styles';

const fontFamily = [
  'Inter',
  'Roboto',
  'Helvetica Neue',
  'Arial',
  'sans-serif',
].join(',');

const minimalistTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2', // minimalist blue accent
    },
    background: {
      default: '#fafbfc',
      paper: '#fff',
    },
    text: {
      primary: '#222',
      secondary: '#666',
    },
    divider: '#e0e0e0',
  },
  typography: {
    fontFamily,
    fontSize: 14,
    h1: { fontWeight: 600, fontSize: 32 },
    h2: { fontWeight: 600, fontSize: 24 },
    h3: { fontWeight: 500, fontSize: 20 },
    h4: { fontWeight: 500, fontSize: 18 },
    h5: { fontWeight: 500, fontSize: 16 },
    h6: { fontWeight: 500, fontSize: 15 },
    subtitle1: { fontWeight: 400, fontSize: 14 },
    subtitle2: { fontWeight: 400, fontSize: 13 },
    body1: { fontWeight: 400, fontSize: 14 },
    body2: { fontWeight: 400, fontSize: 13 },
    button: { fontWeight: 500, fontSize: 13, textTransform: 'none' },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          border: '1px solid #e0e0e0',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 500,
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          background: '#fafbfc',
        },
        input: {
          padding: '8px 12px',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: '#fff',
          color: '#222',
          boxShadow: 'none',
          borderBottom: '1px solid #e0e0e0',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          border: '1px solid #e0e0e0',
          borderRadius: 8,
        },
      },
    },
  },
});

export default minimalistTheme; 