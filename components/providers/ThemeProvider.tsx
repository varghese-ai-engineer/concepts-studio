'use client';

import React from 'react';
import { ThemeContextProvider } from '@/contexts/ThemeContext';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return <ThemeContextProvider>{children}</ThemeContextProvider>;
}
