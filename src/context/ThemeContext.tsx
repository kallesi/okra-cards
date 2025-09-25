import React, { createContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'auto';

interface ThemeContextType {
    theme: Theme;
    setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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
