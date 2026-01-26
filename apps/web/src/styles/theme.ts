import { createTheme } from '@mui/material/styles';

/**
 * Unimobiliare Web Theme
 * Premium dark theme matching admin panel
 */
export const theme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: '#3b82f6',
            light: '#60a5fa',
            dark: '#2563eb',
        },
        secondary: {
            main: '#8b5cf6',
            light: '#a78bfa',
            dark: '#7c3aed',
        },
        background: {
            default: '#0f172a',
            paper: '#1e293b',
        },
        success: {
            main: '#22c55e',
        },
        warning: {
            main: '#f59e0b',
        },
        error: {
            main: '#ef4444',
        },
        text: {
            primary: '#f1f5f9',
            secondary: '#94a3b8',
        },
        divider: 'rgba(148, 163, 184, 0.12)',
    },
    typography: {
        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        h1: {
            fontSize: '3rem',
            fontWeight: 700,
        },
        h2: {
            fontSize: '2.25rem',
            fontWeight: 700,
        },
        h3: {
            fontSize: '1.875rem',
            fontWeight: 600,
        },
        button: {
            textTransform: 'none',
            fontWeight: 500,
        },
    },
    shape: {
        borderRadius: 12,
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    padding: '12px 24px',
                },
                contained: {
                    boxShadow: 'none',
                    '&:hover': {
                        boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)',
                    },
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                    border: '1px solid rgba(148, 163, 184, 0.1)',
                },
            },
        },
    },
});
