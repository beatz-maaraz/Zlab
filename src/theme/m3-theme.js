import { createTheme } from '@mui/material/styles';

/**
 * Material 3 (M3) Glowing Dark Theme for Z Lab
 * Configured with Material Design 3 color roles, typography, and glowing dark aesthetic.
 */
export const m3Theme = createTheme({
  cssVariables: true,
  palette: {
    mode: 'dark',
    primary: {
      main: '#d0bcff', // M3 Primary (Lilac/Neon Violet)
      light: '#eaddff',
      dark: '#381e72',
      contrastText: '#381e72',
    },
    secondary: {
      main: '#ccc2dc', // M3 Secondary
      light: '#e8def8',
      dark: '#332d41',
      contrastText: '#332d41',
    },
    tertiary: {
      main: '#efb8c8', // M3 Tertiary
      light: '#ffd8e4',
      dark: '#492532',
      contrastText: '#492532',
    },
    background: {
      default: '#141218', // M3 Dark Surface Base
      paper: '#1d1b20',   // M3 Dark Surface Container
    },
    text: {
      primary: '#e6e0e9',
      secondary: '#cac4d0',
      disabled: '#938f99',
    },
    divider: '#49454f',
    error: {
      main: '#f2b8b5',
      contrastText: '#601410',
    },
    warning: {
      main: '#ffb4ab',
      contrastText: '#690005',
    },
    info: {
      main: '#00f0ff', // Z Lab Neon Cyan accent
      contrastText: '#00363d',
    },
    success: {
      main: '#b4f0b8',
      contrastText: '#003914',
    },
  },
  shape: {
    borderRadius: 16,
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Roboto"',
      '"Google Sans"',
      '"Segoe UI"',
      'sans-serif',
    ].join(','),
    button: {
      textTransform: 'none',
      fontWeight: 500,
      letterSpacing: '0.1px',
    },
    h6: {
      fontWeight: 600,
      letterSpacing: '0.15px',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          padding: '10px 24px',
          fontSize: '0.875rem',
          transition: 'all 0.2s cubic-bezier(0.2, 0, 0, 1)',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 0 16px rgba(208, 188, 255, 0.25)',
          },
        },
        containedPrimary: {
          backgroundColor: '#d0bcff',
          color: '#381e72',
          '&:hover': {
            backgroundColor: '#eaddff',
            boxShadow: '0 0 20px rgba(208, 188, 255, 0.4)',
          },
        },
        containedSecondary: {
          backgroundColor: '#4a4458', // M3 Secondary Container / Tonal
          color: '#e8def8',
          '&:hover': {
            backgroundColor: '#5d556d',
          },
        },
        outlined: {
          borderColor: '#938f99',
          color: '#d0bcff',
          '&:hover': {
            borderColor: '#d0bcff',
            backgroundColor: 'rgba(208, 188, 255, 0.08)',
          },
        },
        text: {
          color: '#d0bcff',
          '&:hover': {
            backgroundColor: 'rgba(208, 188, 255, 0.08)',
          },
        },
      },
    },
    MuiFab: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.4), 0 0 12px rgba(208, 188, 255, 0.2)',
          transition: 'all 0.2s cubic-bezier(0.2, 0, 0, 1)',
          '&:hover': {
            boxShadow: '0 6px 22px rgba(0, 0, 0, 0.5), 0 0 20px rgba(208, 188, 255, 0.4)',
          },
        },
        primary: {
          backgroundColor: '#e8def8',
          color: '#1d192b',
          '&:hover': {
            backgroundColor: '#d0bcff',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          backgroundColor: '#211f26',
          border: '1px solid #36343b',
          transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
          '&:hover': {
            borderColor: 'rgba(208, 188, 255, 0.4)',
            boxShadow: '0 8px 30px rgba(0,0,0,0.5), 0 0 15px rgba(208, 188, 255, 0.1)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            backgroundColor: 'rgba(29, 27, 32, 0.6)',
            '& fieldset': {
              borderColor: '#49454f',
            },
            '&:hover fieldset': {
              borderColor: '#938f99',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#d0bcff',
              boxShadow: '0 0 10px rgba(208, 188, 255, 0.25)',
            },
          },
          '& .MuiFilledInput-root': {
            borderRadius: '8px 8px 0 0',
            backgroundColor: '#2b2930',
            '&:hover': {
              backgroundColor: '#36343b',
            },
            '&.Mui-focused': {
              backgroundColor: '#36343b',
            },
          },
        },
      },
    },
    MuiSwitch: {
      styleOverrides: {
        root: {
          width: 52,
          height: 32,
          padding: 0,
        },
        switchBase: {
          padding: 4,
          '&.Mui-checked': {
            transform: 'translateX(20px)',
            color: '#381e72',
            '& + .MuiSwitch-track': {
              backgroundColor: '#d0bcff',
              opacity: 1,
              border: 0,
            },
          },
        },
        thumb: {
          width: 24,
          height: 24,
          boxShadow: '0 2px 4px rgba(0,0,0,0.4)',
        },
        track: {
          borderRadius: 16,
          border: '2px solid #938f99',
          backgroundColor: '#36343b',
          opacity: 1,
        },
      },
    },
    MuiSlider: {
      styleOverrides: {
        root: {
          color: '#d0bcff',
          height: 6,
        },
        thumb: {
          width: 20,
          height: 20,
          backgroundColor: '#d0bcff',
          boxShadow: '0 0 10px rgba(208, 188, 255, 0.5)',
          '&:hover, &.Mui-focusVisible': {
            boxShadow: '0 0 16px rgba(208, 188, 255, 0.7)',
          },
        },
        track: {
          border: 'none',
          backgroundColor: '#d0bcff',
        },
        rail: {
          opacity: 0.38,
          backgroundColor: '#49454f',
        },
      },
    },
    MuiBottomNavigation: {
      styleOverrides: {
        root: {
          backgroundColor: '#1d1b20',
          borderRadius: 24,
          border: '1px solid #36343b',
          boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
        },
      },
    },
    MuiBottomNavigationAction: {
      styleOverrides: {
        root: {
          color: '#cac4d0',
          '&.Mui-selected': {
            color: '#d0bcff',
          },
        },
      },
    },
  },
});

export default m3Theme;
