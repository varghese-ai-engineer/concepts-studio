'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

export type ThemeId = 'modern' | 'classic' | 'neo-cyber' | 'breeze';

export interface ThemeDefinition {
  id: ThemeId;
  name: string;
  description: string;
}

export const THEMES: ThemeDefinition[] = [
  {
    id: 'modern',
    name: 'Modern',
    description: 'Premium enterprise SaaS design — clean, elevated, professional',
  },
  {
    id: 'classic',
    name: 'Classic',
    description: 'Original light design — minimal Tailwind-style interface',
  },
  {
    id: 'neo-cyber',
    name: 'Neo Cyber',
    description: 'Futuristic dark-neon cyberpunk layout — glows, glassmorphism, horizontal header',
  },
  {
    id: 'breeze',
    name: 'Breeze Light',
    description: 'Clean slate-emerald design — soft light colors, premium rounded buttons, compact layout',
  },
];

interface ThemeContextValue {
  theme: ThemeId;
  setTheme: (theme: ThemeId) => void;
  themes: ThemeDefinition[];
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'modern',
  setTheme: () => {},
  themes: THEMES,
});

export function useTheme() {
  return useContext(ThemeContext);
}

const STORAGE_KEY = 'ai-assistant-theme';

export function ThemeContextProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeId>('modern');

  // Initialise from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as ThemeId | null;
      if (stored && THEMES.some((t) => t.id === stored)) {
        setThemeState(stored);
        document.documentElement.setAttribute('data-theme', stored);
      } else {
        document.documentElement.setAttribute('data-theme', 'modern');
      }
    } catch {
      document.documentElement.setAttribute('data-theme', 'modern');
    }
  }, []);

  const setTheme = useCallback((next: ThemeId) => {
    setThemeState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {}
    document.documentElement.setAttribute('data-theme', next);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, themes: THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
}
