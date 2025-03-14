'use client';

import SignInPage from '@/components/pages/index/SignInPage';
import WelcomeScreen from '@/components/pages/index/WelcomeScreen';
import { selectAuthorized, useAppSelector } from '@/frontend';

export default function Home() {
  const isAuthorized = useAppSelector(selectAuthorized);

  if (!isAuthorized) {
    return <SignInPage />;
  }

  return <WelcomeScreen />;
}
