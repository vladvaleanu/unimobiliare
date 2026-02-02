import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type ThemeMode = 'light' | 'dark';

interface ThemeState {
    mode: ThemeMode;
}

// Check localStorage or system preference
const getInitialTheme = (): ThemeMode => {
    const stored = localStorage.getItem('theme');
    if (stored === 'light' || stored === 'dark') {
        return stored;
    }
    // Check system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
    }
    return 'light';
};

const initialState: ThemeState = {
    mode: getInitialTheme(),
};

const themeSlice = createSlice({
    name: 'theme',
    initialState,
    reducers: {
        toggleTheme: (state) => {
            state.mode = state.mode === 'light' ? 'dark' : 'light';
            localStorage.setItem('theme', state.mode);
        },
        setTheme: (state, action: PayloadAction<ThemeMode>) => {
            state.mode = action.payload;
            localStorage.setItem('theme', state.mode);
        },
    },
});

export const { toggleTheme, setTheme } = themeSlice.actions;
export default themeSlice.reducer;
