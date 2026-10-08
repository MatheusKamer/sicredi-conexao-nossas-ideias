'use client';

import { createTheme } from '@mui/material/styles';

// Design tokens from the Pencil file (see CLAUDE.md > Design tokens).
export const tokens = {
  primary: '#00703C',
  primaryDark: '#00562E',
  primaryTint: '#E6F1EB',
  accent: '#7FBA27',
  accentTint: '#F1F8E7',
  bg: '#F8F9FA',
  surface: '#FFFFFF',
  textDark: '#212529',
  textSecondary: '#5C6670',
  outline: '#8C959D',
  divider: '#E4E7EA',
  error: '#C62828',
  errorTint: '#FDECEC',
  warning: '#B45309',
  warningTint: '#FEF3E2',
  info: '#1F5FAD',
  infoTint: '#EAF1FB',
  neutralButton: '#495057',
  priority: {
    LOW: '#B5D67F',
    MEDIUM: '#7FBA27',
    HIGH: '#00703C',
  },
} as const;

declare module '@mui/material/styles' {
  interface Palette {
    outline: string;
    priority: { LOW: string; MEDIUM: string; HIGH: string };
  }
  interface PaletteOptions {
    outline?: string;
    priority?: { LOW: string; MEDIUM: string; HIGH: string };
  }
}

const headingFont = 'var(--font-exo2), "Exo 2", sans-serif';
const bodyFont = 'var(--font-roboto), Roboto, sans-serif';

export const theme = createTheme({
  palette: {
    primary: {
      main: tokens.primary,
      dark: tokens.primaryDark,
      light: tokens.primaryTint,
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: tokens.accent,
      light: tokens.accentTint,
      contrastText: tokens.textDark,
    },
    error: { main: tokens.error, light: tokens.errorTint },
    warning: { main: tokens.warning, light: tokens.warningTint },
    info: { main: tokens.info, light: tokens.infoTint },
    background: { default: tokens.bg, paper: tokens.surface },
    text: { primary: tokens.textDark, secondary: tokens.textSecondary },
    divider: tokens.divider,
    outline: tokens.outline,
    priority: tokens.priority,
  },
  shape: { borderRadius: 8 },
  typography: {
    fontFamily: bodyFont,
    h1: { fontFamily: headingFont, fontSize: 28, fontWeight: 700, lineHeight: 1.3 },
    h2: { fontFamily: headingFont, fontSize: 22, fontWeight: 700, lineHeight: 1.3 },
    h3: { fontFamily: headingFont, fontSize: 18, fontWeight: 600, lineHeight: 1.35 },
    h4: { fontFamily: headingFont, fontSize: 32, fontWeight: 700, lineHeight: 1.1 },
    h5: { fontFamily: headingFont, fontSize: 16, fontWeight: 600 },
    h6: { fontFamily: headingFont, fontSize: 14, fontWeight: 600 },
    subtitle1: { fontSize: 15, lineHeight: 1.5, color: tokens.textSecondary },
    body1: { fontSize: 15, lineHeight: 1.5 },
    body2: { fontSize: 14, lineHeight: 1.45 },
    caption: { fontSize: 12, lineHeight: 1.4 },
    overline: { fontSize: 11, fontWeight: 600, letterSpacing: 0.8, lineHeight: 1.4 },
    button: { fontSize: 15, fontWeight: 500, letterSpacing: 0.3, textTransform: 'none' },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: { backgroundColor: tokens.bg },
      },
    },
    MuiButton: {
      defaultProps: { color: 'secondary' },
      styleOverrides: {
        root: { padding: '10px 22px', lineHeight: 1.6 },
        contained: {
          boxShadow: '0 2px 4px #0000002E, 0 1px 2px #0000001F',
        },
      },
      variants: [
        {
          props: { variant: 'outlined', color: 'secondary' },
          style: {
            color: tokens.neutralButton,
            borderColor: tokens.outline,
            '&:hover': { borderColor: tokens.textSecondary, backgroundColor: tokens.bg },
          },
        },
      ],
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: tokens.surface,
          '& .MuiOutlinedInput-notchedOutline': { borderColor: tokens.outline },
        },
      },
    },
    MuiDialog: {
      defaultProps: { maxWidth: 'sm', fullWidth: true },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: { fontFamily: headingFont, fontSize: 22, fontWeight: 700 },
      },
    },
    MuiCard: {
      defaultProps: { variant: 'outlined' },
      styleOverrides: {
        root: { borderColor: tokens.divider, boxShadow: '0 1px 3px #00000014' },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: { borderColor: tokens.divider },
        head: {
          backgroundColor: tokens.bg,
          color: tokens.textSecondary,
          fontSize: 12,
          fontWeight: 500,
        },
        body: { fontSize: 14 },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          color: tokens.textSecondary,
          '& .MuiListItemIcon-root': { color: tokens.textSecondary },
          '&.Mui-selected, &.Mui-selected:hover': {
            backgroundColor: tokens.primaryTint,
            color: tokens.primary,
            '& .MuiListItemIcon-root': { color: tokens.primary },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 500 },
      },
    },
  },
});
