'use client';

import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useAppSelector } from "@/frontend/store/hooks/hooks";
import { selectAuthorized } from "@/frontend/store/reducer/app_reducer";
import WelcomeScreen from "./WelcomeScreen";  

export default function DashboardLoadingSkeleton() {
  const isAuthenticated = useAppSelector(selectAuthorized);

  if (isAuthenticated) {
    return <WelcomeScreen />;
  }

  return (
    <div className="flex h-screen">
      {/* Sidebar Skeleton */}
      <div className="w-1/3 border-r border-border bg-card p-6">
          <div className="space-y-6">
            {/* New Chat Button Skeleton */}
            <Skeleton className="h-12 w-full" />

            {/* Chat History Skeletons */}
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          </div>
        </div>

        {/* Main Chat Area Skeleton */}
        <div className="flex-1 flex flex-col">
          {/* Chat Messages Area */}
          <div className="flex-1 p-8 space-y-8">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex gap-6">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-3 flex-1">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-24 w-full" />
                </div>
              </div>
            ))}
          </div>

          {/* Input Area Skeleton */}
          <div className="border-t border-border p-6">
            <Skeleton className="h-20 w-full rounded-lg" />
          </div>
        </div>
      </div>
    )
}