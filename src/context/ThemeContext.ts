import { createContext } from 'react';

type Theme = 'light' | 'dark' | 'auto';

export interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);