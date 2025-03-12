'use client';

import WelcomeScreen from "@/components/pages/index/WelcomeScreen";
import DashboardLoadingSkeleton from "@/components/pages/index/DashboardLoadingSkeleton";
import { useAuth } from "@/frontend/queries";
import { useRouter } from "next/navigation";
import React from "react";

export default function ChatPage() {
  const { isLoading, error } = useAuth();
  const router = useRouter();

  if (isLoading) {
    return <DashboardLoadingSkeleton />;
  }

  if (error && !isLoading) {
    router.push('/');
    return;
  }

  return <WelcomeScreen />;
}
