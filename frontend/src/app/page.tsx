'use client';

import SignInPage from '@/components/pages/index/SignInPage';
import WelcomeScreen from '@/components/pages/index/WelcomeScreen';
import { selectAppState, selectAuthorized, useAppSelector } from '@/frontend';

/**
 * Home component that renders different screens based on the application state and authorization status.
 *
 * @returns {JSX.Element} The appropriate screen based on the current state:
 * - A loading screen if the application state is 'loading'.
 * - A sign-in page if the user is not authorized.
 * - A welcome screen if the user is authorized.
 */
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
