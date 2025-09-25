import React, { useEffect, useState } from 'react';
import { ThemeContext } from './ThemeContext';

type Theme = 'light' | 'dark' | 'auto';

export const ThemeContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [theme, setThemeState] = useState<Theme>('auto');

    useEffect(() => {
        const savedTheme = localStorage.getItem('theme') as Theme | null;
        if (savedTheme) {
            setThemeState(savedTheme);
        } else {
            setThemeState('auto');
        }
    }, []);

    useEffect(() => {
        const root = document.documentElement;
        const isDark = theme === 'auto'
            ? window.matchMedia('(prefers-color-scheme: dark)').matches
            : theme === 'dark';

        if (isDark) {
            root.setAttribute('data-bs-theme', 'dark');
        } else {
            root.setAttribute('data-bs-theme', 'light');
        }

        localStorage.setItem('theme', theme);
    }, [theme]);

    const setTheme = (newTheme: Theme) => {
        setThemeState(newTheme);
    };

    return (
        <ThemeContext.Provider value={{ theme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};