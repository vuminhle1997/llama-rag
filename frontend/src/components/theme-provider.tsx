'use client';

import * as React from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { type ThemeProviderProps } from 'next-themes';
import {
  selectAppTheme,
  setAppTheme,
  useAppDispatch,
  useAppSelector,
} from '@/frontend';

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  const dispatch = useAppDispatch();
  const theme = useAppSelector(selectAppTheme);

  React.useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      dispatch(setAppTheme(savedTheme as 'light' | 'dark' | 'system'));
    }
  }, [dispatch, theme]);

  return (
    <NextThemesProvider forcedTheme={theme} {...props}>
      {children}
    </NextThemesProvider>
  );
}
