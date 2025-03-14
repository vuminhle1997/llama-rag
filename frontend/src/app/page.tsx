'use client';

import SignInPage from '@/components/pages/index/SignInPage';
import WelcomeScreen from '@/components/pages/index/WelcomeScreen';
import { selectAppState, selectAuthorized, useAppSelector } from '@/frontend';

export default function Home() {
  const isAuthorized = useAppSelector(selectAuthorized);
  const appState = useAppSelector(selectAppState);

  if (appState === 'loading') {
    return <div>Loading...</div>;
  }

  if (!isAuthorized) {
    return <SignInPage />;
  }

  return <WelcomeScreen />;
}
