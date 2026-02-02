import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { Toaster } from 'react-hot-toast';
import { store } from './store';
import { useAppSelector } from './store/hooks';
import App from './App';
import './styles/global.css';

function AppWithTheme() {
    const themeMode = useAppSelector((state) => state.theme.mode);

    const theme = React.useMemo(
        () =>
            createTheme({
                palette: {
                    mode: themeMode,
                    primary: {
                        main: '#3b82f6',
                    },
                    secondary: {
                        main: '#8b5cf6',
                    },
                },
                typography: {
                    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                },
            }),
        [themeMode]
    );

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <BrowserRouter>
                <App />
            </BrowserRouter>
            <Toaster
                position="top-right"
                toastOptions={{
                    duration: 3000,
                    style: {
                        background: themeMode === 'dark' ? '#1e293b' : '#fff',
                        color: themeMode === 'dark' ? '#fff' : '#000',
                    },
                }}
            />
        </ThemeProvider>
    );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <Provider store={store}>
            <AppWithTheme />
        </Provider>
    </React.StrictMode>
);
