import { createTheme } from '@mui/material/styles';

// Brand colors
export const colors = {
  primary: {
    main: '#2196F3',
    light: '#64B5F6',
    dark: '#1976D2',
    contrastText: '#FFFFFF'
  },
  secondary: {
    main: '#FFC107',
    light: '#FFD54F',
    dark: '#FFA000',
    contrastText: '#000000'
  },
  accent: {
    purple: '#9C27B0',
    green: '#4CAF50',
    red: '#F44336'
  },
  status: {
    paid: '#4CAF50',
    unpaid: '#F44336',
    pending: '#FF9800'
  },
  gray: {
    darkest: '#212121',
    dark: '#424242',
    medium: '#757575',
    light: '#BDBDBD',
    lightest: '#F5F5F5'
  },
  text: {
    primary: '#212121',
    secondary: '#757575',
    disabled: '#9E9E9E'
  },
  background: {
    default: '#F5F5F5',
    paper: '#FFFFFF'
  }
};

// Spacing
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32
};

// Shadows
export const shadows = {
  card: '0 2px 4px rgba(0, 0, 0, 0.1)',
  cardHover: '0 4px 8px rgba(0, 0, 0, 0.15)',
  dialog: '0 4px 12px rgba(0, 0, 0, 0.15)',
  header: '0 2px 4px rgba(0, 0, 0, 0.1)'
};

// Typography
export const typography = {
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif',
  fontSize: 16,
  fontSizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24
  },
  fontWeights: {
    regular: 400,
    medium: 500,
    bold: 700
  }
};

// Animation
export const animation = {
  fast: '0.2s',
  medium: '0.3s',
  slow: '0.5s'
};

// Create the theme
const theme = createTheme({
  palette: {
    primary: colors.primary,
    secondary: colors.secondary,
    text: colors.text,
    background: colors.background,
    error: {
      main: colors.accent.red
    },
    success: {
      main: colors.status.paid
    },
    warning: {
      main: colors.status.pending
    },
    accent: colors.accent // <---- Вот эта строка была добавлена!
  },
  typography: {
    fontFamily: typography.fontFamily,
    fontSize: typography.fontSize,
    h1: {
      fontSize: '2rem',
      fontWeight: typography.fontWeights.bold
    },
    h2: {
      fontSize: '1.75rem',
      fontWeight: typography.fontWeights.bold
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: typography.fontWeights.medium
    },
    h4: {
      fontSize: '1.25rem',
      fontWeight: typography.fontWeights.medium
    },
    h5: {
      fontSize: '1.125rem',
      fontWeight: typography.fontWeights.medium
    },
    h6: {
      fontSize: '1rem',
      fontWeight: typography.fontWeights.medium
    },
    body1: {
      fontSize: '1rem'
    },
    body2: {
      fontSize: '0.875rem'
    },
    button: {
      textTransform: 'none',
      fontWeight: typography.fontWeights.medium
    }
  },
  shape: {
    borderRadius: 8
  },
  shadows: [
    'none',
    shadows.card,
    shadows.cardHover,
    shadows.dialog,
    ...Array(21).fill('none')
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          padding: '8px 16px',
          fontWeight: typography.fontWeights.medium,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none'
          }
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none'
          }
        },
        sizeSmall: {
          padding: '6px 12px'
        },
        sizeLarge: {
          padding: '10px 20px'
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: shadows.card,
          borderRadius: 12,
          transition: `box-shadow ${animation.fast} ease-in-out`,
          '&:hover': {
            boxShadow: shadows.cardHover
          }
        }
      }
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: shadows.header
        }
      }
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          borderRadius: 8
        }
      }
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 12
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        rounded: {
          borderRadius: 12
        }
      }
    }
  }
});

export default theme;