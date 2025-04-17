'use client';

import React from 'react';
import SignInPage from './pages/index/SignInPage';
import { selectAppState, selectAuthorized, useAppSelector } from '@/frontend';

export default function AuthProvider({
  children,
  errorFallback,
  fallback,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  errorFallback?: React.ReactNode;
}) {
  const isAuth = useAppSelector(selectAuthorized);
  const appState = useAppSelector(selectAppState);
  const isLoading = appState === 'loading';
  const isFailing = appState === 'failed';

  if (fallback && isLoading) {
    return <>{fallback}</>;
  }

  if (errorFallback && !isFailing && isLoading) {
    return <>{errorFallback}</>;
  }

  if (!isAuth && !isLoading) {
    return <SignInPage />;
  }

  return <>{children}</>;
}
