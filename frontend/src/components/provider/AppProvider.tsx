'use client';
import { Provider } from 'react-redux';
import React from 'react';
import { store } from '@/frontend';
import TanstackProvider from './TanstackProvider';

export type AppProviderProps = React.PropsWithChildren;

/**
 * AppProvider component that wraps its children with necessary providers.
 *
 * This component uses two providers:
 * 1. `Provider` from Redux to provide the Redux store to the application.
 * 2. `TanstackProvider` to provide Tanstack Query context to the application.
 *
 * @param {AppProviderProps} props - The props for the AppProvider component.
 * @param {React.ReactNode} props.children - The child components to be wrapped by the providers.
 *
 * @returns {JSX.Element} The wrapped children components with the necessary providers.
 */
export default function AppProvider({ children }: AppProviderProps) {
  return (
    <Provider store={store}>
      <TanstackProvider>{children}</TanstackProvider>
    </Provider>
  );
}
