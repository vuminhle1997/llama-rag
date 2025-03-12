'use client';

import { useAuth } from '@/frontend/queries';
import DashboardLoadingSkeleton from '@/components/pages/index/DashboardLoadingSkeleton';
import SignInPage from '@/components/pages/index/SignInPage';
import WelcomeScreen from '@/components/pages/index/WelcomeScreen';

export default function Home() {
  const { isLoading, error } = useAuth();

  if (isLoading)
    return (
      <DashboardLoadingSkeleton />
    );

  if (!isLoading && error) {
    return (
      <SignInPage />
    );
  }

  return (
    <WelcomeScreen />
  );
}
