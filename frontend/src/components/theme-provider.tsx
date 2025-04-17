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

/**
 * ThemeProvider component is responsible for managing and providing the application's theme context.
 * It integrates with the Redux store to retrieve and update the current theme and synchronizes it
 * with the local storage to persist user preferences.
 *
 * @param {ThemeProviderProps} props - Props passed to the ThemeProvider component.
 * @param {React.ReactNode} props.children - The child components to be rendered within the provider.
 * @returns {JSX.Element} A wrapper component that provides theme context to its children.
 *
 * @remarks
 * - The component uses `useAppDispatch` and `useAppSelector` hooks to interact with the Redux store.
 * - On mount, it checks for a saved theme in the local storage and updates the Redux store accordingly.
 * - The `NextThemesProvider` is used to apply the selected theme to the application.
 *
 * @example
 * ```tsx
 * import { ThemeProvider } from './theme-provider';
 *
 * function App() {
 *   return (
 *     <ThemeProvider>
 *       <YourAppComponents />
 *     </ThemeProvider>
 *   );
 * }
 * ```
 */
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
